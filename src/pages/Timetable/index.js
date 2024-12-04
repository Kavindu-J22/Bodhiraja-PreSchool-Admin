import React, { useState, useEffect, useRef } from 'react';
import { db, storage } from '../../firebase'; // Ensure correct Firebase setup
import { collection, getDocs, doc, setDoc, query, orderBy, limit } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const Timetable = () => {
    const [timetablePdf, setTimetablePdf] = useState(null); // For the PDF file
    const [nextTimetableId, setNextTimetableId] = useState('0001'); // Initialize with '0001'
    const [uploadProgress, setUploadProgress] = useState(0); // To track upload progress
    const [user, setUser] = useState(null); // To manage authenticated user state
    const [errorMessage, setErrorMessage] = useState(""); // To handle any errors
    const [isSubmitting, setIsSubmitting] = useState(false); // State to track form submission

    // Ref for the file input field to reset it manually
    const pdfInputRef = useRef(null);

    // Helper function to format the ID with leading zeros
    const formatTimetableId = (id) => {
        return String(id).padStart(4, '0'); // Ensure the ID has 4 digits
    };

    // Check user authentication status
    useEffect(() => {
        const auth = getAuth();
        onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser); // Set the authenticated user
            } else {
                setErrorMessage("User is not authenticated. Please log in.");
                setUser(null); // No user is signed in
            }
        });
    }, []);

    // Fetch the current largest timetable ID from Firestore to initialize the timetable numbering
    useEffect(() => {
        const fetchLatestTimetableId = async () => {
            const timetableRef = collection(db, 'timetable');
            const q = query(timetableRef, orderBy('timetableId', 'desc'), limit(1));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const lastTimetable = querySnapshot.docs[0].data();
                const newId = parseInt(lastTimetable.timetableId, 10) + 1;
                setNextTimetableId(formatTimetableId(newId)); // Set the next ID with leading zeros
            }
        };
        fetchLatestTimetableId();
    }, []);

    // Handle form submission
    const handleTimetableSubmission = async (e) => {
        e.preventDefault();

        // Reset any previous error message
        setErrorMessage("");

        // Check if the user is authenticated
        if (!user) {
            setErrorMessage("User is not authenticated. Upload denied.");
            return; // Prevent upload if user is not authenticated
        }

        // Ensure a PDF file is selected
        if (!timetablePdf) {
            setErrorMessage("Please select a PDF file.");
            return;
        }

        try {
            // Set isSubmitting to true to indicate the form is being submitted
            setIsSubmitting(true);

            // Upload the PDF to Firebase Storage and track upload progress
            const pdfRef = ref(storage, `timetable/timetable_${nextTimetableId}.pdf`);
            const uploadTask = uploadBytesResumable(pdfRef, timetablePdf);

            // Monitor the file upload progress
            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setUploadProgress(progress); // Update progress
                    console.log(`Upload is ${progress}% done`);
                },
                (error) => {
                    console.error("Error uploading timetable:", error);
                    setErrorMessage("Error uploading file. Please try again.");
                    setIsSubmitting(false); // Reset isSubmitting if there's an error
                },
                async () => {
                    // When upload completes, get the download URL
                    const pdfUrl = await getDownloadURL(uploadTask.snapshot.ref);

                    // Prepare timetable data
                    const newTimetable = {
                        timetableId: nextTimetableId,
                        pdfUrl, // PDF file URL
                        timestamp: new Date(), // Store when the timetable was created
                        createdBy: user.uid // Store the user who uploaded the file
                    };

                    // Store timetable data in Firestore
                    await setDoc(doc(db, 'timetable', `timetable_${nextTimetableId}`), newTimetable);

                    // Reset form fields after submission
                    setTimetablePdf(null);
                    const nextId = parseInt(nextTimetableId, 10) + 1;
                    setNextTimetableId(formatTimetableId(nextId)); // Increment and format the ID for the next timetable

                    // Reset file input field
                    if (pdfInputRef.current) {
                        pdfInputRef.current.value = '';
                    }

                    // Success feedback
                    console.log("Timetable uploaded successfully.");
                    setUploadProgress(0); // Reset the progress
                    setIsSubmitting(false); // Reset isSubmitting after completion
                }
            );
        } catch (error) {
            console.error("Error during timetable upload:", error);
            setErrorMessage("An error occurred while uploading. Please try again.");
            setIsSubmitting(false); // Reset isSubmitting if there's an error
        }
    };

    return (
        <div className="right-content w-100">
            <div className="card shadow border-0 p-3 mt-4">
                <h3 className="hd">Add Timetable</h3>
            </div>

            <div className="upload-container">
                {user ? ( // Display form only if user is authenticated
                    <form onSubmit={handleTimetableSubmission}>
                        <label>PDF File:</label>
                        <input
                            type="file"
                            ref={pdfInputRef} // Assign ref to the PDF input
                            onChange={(e) => setTimetablePdf(e.target.files[0])}
                            accept="application/pdf" // Only accept PDF files
                            required
                        />
                        <div className="AddBut">
                            <button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Adding Timetable..." : "Add Timetable"}
                            </button>
                        </div>

                        {/* Display upload progress if upload has started */}
                        {uploadProgress > 0 && (
                            <p>Uploaded successfully: {Math.round(uploadProgress)}%</p>
                        )}

                        {/* Display error messages */}
                        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
                    </form>
                ) : (
                    <p>Please log in to upload timetables.</p> // Show message if user is not authenticated
                )}
            </div>
        </div>
    );
};

export default Timetable;
