import React, { useState, useEffect, useRef } from 'react';
import { db, storage } from '../../firebase'; // Ensure correct Firebase setup
import { collection, getDocs, doc, setDoc, query, orderBy, limit, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import './Events.css'; // Custom styles
//import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Import icons for show/hide functionality
//import { MdOutlineExpandMore } from "react-icons/md";
import { MdExpandLess } from "react-icons/md";
import { MdDelete } from "react-icons/md";

const Events = () => {
    const [eventDescription, setEventDescription] = useState('');
    const [eventName, setEventName] = useState('');
    const [eventMainImage, setEventMainImage] = useState(null); // For the main image
    const [eventAdditionalImages, setEventAdditionalImages] = useState([]); // For multiple additional images
    const [nextEventId, setNextEventId] = useState(1000);
    const [eventToDelete, setEventToDelete] = useState(''); // State for event name to delete

    // State for showing/hiding delete form
    const [showDeleteSection, setShowDeleteSection] = useState(false);

    // Refs for the file input fields to reset them manually
    const mainImageInputRef = useRef(null);
    const additionalImagesInputRef = useRef(null);

    // Fetch the current largest event ID from Firestore to initialize the event numbering
    useEffect(() => {
        const fetchLatestEventId = async () => {
            const eventsRef = collection(db, 'events');
            const q = query(eventsRef, orderBy('eventId', 'desc'), limit(1));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const lastEvent = querySnapshot.docs[0].data();
                setNextEventId(lastEvent.eventId - 1); // Decrement the ID for the next event
            }
        };
        fetchLatestEventId();
    }, []);

    // Handle form submission
    const handleEventSubmission = async (e) => {
        e.preventDefault();

        if (!eventMainImage) {
            console.error("Main image must be selected.");
            return;
        }

        // Upload the main image to Firebase Storage and get its download URL
        const mainImageRef = ref(storage, `events/event_${nextEventId}_main.jpg`);
        await uploadBytes(mainImageRef, eventMainImage);
        const mainImageUrl = await getDownloadURL(mainImageRef);

        // Upload all additional images to Firebase Storage and get their download URLs
        const additionalImageUrls = await Promise.all(
            eventAdditionalImages.map(async (image, index) => {
                const imageRef = ref(storage, `events/event_${nextEventId}_additional_${index + 1}.jpg`);
                await uploadBytes(imageRef, image);
                return await getDownloadURL(imageRef);
            })
        );

        // Prepare event data
        const newEvent = {
            eventId: nextEventId,
            eventName,
            eventDescription,
            mainImageUrl, // Main event image URL
            additionalImageUrls, // Array of additional image URLs
            timestamp: new Date() // Optional: To store when the event was created
        };

        // Store event data in Firestore
        await setDoc(doc(db, 'events', `event_${nextEventId}`), newEvent);

        // Reset form fields after submission
        setEventName('');
        setEventDescription('');
        setEventMainImage(null);
        setEventAdditionalImages([]);
        setNextEventId((prevId) => prevId - 1); // Decrement the ID for the next event

        // Reset file input fields
        if (mainImageInputRef.current) {
            mainImageInputRef.current.value = '';
        }
        if (additionalImagesInputRef.current) {
            additionalImagesInputRef.current.value = '';
        }
    };

    // Handle event deletion
    const handleEventDeletion = async (e) => {
        e.preventDefault();

        if (!eventToDelete) {
            console.error("Event name must be provided.");
            return;
        }

        // Fetch all events to find the matching event name
        const eventsRef = collection(db, 'events');
        const querySnapshot = await getDocs(eventsRef);

        // Find the document with the matching event name
        let eventDocId = null;
        querySnapshot.forEach((doc) => {
            const eventData = doc.data();
            if (eventData.eventName === eventToDelete) {
                eventDocId = doc.id; // Store the document ID to delete later
            }
        });

        if (eventDocId) {
            // Get the document reference to delete
            const eventDocRef = doc(db, 'events', eventDocId);
            
            // Delete the document
            await deleteDoc(eventDocRef);
            console.log(`Event "${eventToDelete}" deleted successfully.`);
        } else {
            console.error("Event not found.");
        }

        // Reset the delete input
        setEventToDelete('');
    };

    return (
        <div className="right-content w-100">
            <div className="card shadow border-0 p-3 mt-4">
                <h3 className="hd">Add New Event</h3>
            </div>

            <div className="upload-container">
                <form onSubmit={handleEventSubmission}>
                    <input
                        type="text"
                        placeholder="Event Name"
                        value={eventName}
                        onChange={(e) => setEventName(e.target.value)}
                        required
                    />
                    <textarea
                        placeholder="Event Description"
                        value={eventDescription}
                        onChange={(e) => setEventDescription(e.target.value)}
                        required
                    />
                    <label>Main Image:</label>
                    <input
                        type="file"
                        ref={mainImageInputRef} // Assign ref to the main image input
                        onChange={(e) => setEventMainImage(e.target.files[0])}
                        required
                    />
                    <label>Additional Images:</label>
                    <input
                        type="file"
                        ref={additionalImagesInputRef} // Assign ref to the additional images input
                        multiple
                        onChange={(e) => setEventAdditionalImages(Array.from(e.target.files))}
                    />
                    <div className="AddBut" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <button type="submit">Add Event</button>

                        {/* Show/Hide Button */}
                        <button
                            type="button"
                            onClick={() => setShowDeleteSection(!showDeleteSection)}
                            className="toggle-button"
                            
                        >
                            {showDeleteSection ? (
                                <MdExpandLess/> // Apply red color to the icon
                            ) : (
                                <MdDelete style={{ color: 'red' }} /> // Apply red color to the icon
                            )}
                        </button>
                    </div>


                </form>

                {/* Conditionally show the delete section */}
                {showDeleteSection && (
                    <div className="delete-container">
                        <input
                            type="text"
                            className="event-name-to-delete"
                            placeholder="Event Name to Delete"
                            value={eventToDelete}
                            onChange={(e) => setEventToDelete(e.target.value)}
                        />
                        <button className="delete-button" onClick={handleEventDeletion}>Delete Event</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Events;
