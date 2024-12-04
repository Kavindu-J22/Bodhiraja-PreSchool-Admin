import React, { useEffect, useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Snackbar } from '@mui/material';
import { db, auth } from '../../firebase'; // Make sure to import auth from firebase
import { collection, doc, getDocs, setDoc, query, getDoc, where } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import emailjs from 'emailjs-com';
import './Admissions.css';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import jsPDF from 'jspdf';

const Admissions = () => {
    const [rows, setRows] = useState([]);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [selectedInterviewIds, setSelectedInterviewIds] = useState([]);
    const [registeringId, setRegisteringId] = useState(null); 
    const [registeredIds, setRegisteredIds] = useState(new Set()); 

    const [open, setOpen] = useState(false);
    const [details, setDetails] = useState(null); // Store fetched details here
    const [loading, setLoading] = useState(false);


    const handleViewDetails = async (admissionId) => {
        try {
            setLoading(true);
            setOpen(true);
            
            // Query Firestore to get the details of the selected admission
            const q = query(
                collection(db, 'newadmission'),
                where('admission', '==', admissionId)
            );

            const querySnapshot = await getDocs(q);
            const fetchedDetails = querySnapshot.docs.map((doc) => doc.data())[0]; // Get the first matching document
            
            setDetails(fetchedDetails);
        } catch (error) {
            console.error('Error fetching details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setOpen(false);
        setDetails(null); // Clear the data when dialog is closed
    };

    useEffect(() => {
        const fetchAdmissions = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'newadmission'));
                const data = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setRows(data);
                const savedInterviewSelections = JSON.parse(localStorage.getItem('interviewSelections')) || [];
                setSelectedInterviewIds(savedInterviewSelections);
            } catch (error) {
                console.error("Error fetching admissions data: ", error);
                setSnackbarMessage('Failed to fetch admissions data.');
                setSnackbarOpen(true);
            }
        };
        fetchAdmissions();
    }, []);

    const sendEmail = async (emailParams) => {
        try {
            console.log('Sending email with parameters:', emailParams);
            await emailjs.send('service_ub5l4s5', 'template_ne17mtj', emailParams, 'jxkpzCoPZknQwR30F');
            setSnackbarMessage('Email sent successfully!');
        } catch (error) {
            console.error('Error sending email:', error);
            setSnackbarMessage('Error sending email: ' + (error?.message || 'Unknown error occurred.'));
        } finally {
            setSnackbarOpen(true);
        }
    };

    // Modified handleInterviewCheckboxChange function
        const handleInterviewCheckboxChange = async (admissionId) => {
            const alreadySelected = selectedInterviewIds.includes(admissionId);
            const updatedSelections = alreadySelected
                ? selectedInterviewIds.filter(id => id !== admissionId) // Uncheck
                : [...selectedInterviewIds, admissionId]; // Check
            localStorage.setItem('interviewSelections', JSON.stringify(updatedSelections));
            setSelectedInterviewIds(updatedSelections);

            if (!alreadySelected) {
                try {
                    const q = query(collection(db, 'newadmission'), where('admission', '==', admissionId));
                    const querySnapshot = await getDocs(q);
                    if (!querySnapshot.empty) {
                        const selectedAdmissionDoc = querySnapshot.docs[0];
                        const selectedAdmission = selectedAdmissionDoc.data();

                        const interviewData = {
                            address: selectedAdmission.address || 'N/A',
                            birthDate: selectedAdmission.birthDate || 'N/A',
                            childName: selectedAdmission.childName || 'N/A',
                            city: selectedAdmission.city || 'N/A',
                            distance: selectedAdmission.distance || 'N/A',
                            email: selectedAdmission.email || 'N/A',
                            id: admissionId,
                            motherDetails: selectedAdmission.motherDetails || null,
                            fatherDetails: selectedAdmission.fatherDetails || null,
                            contactNo: selectedAdmission.phoneNumber || 'N/A',
                            guardianDetails: selectedAdmission.guardianDetails || null,
                            uploadedFileURL: selectedAdmission.uploadedFileURL || '',
                        };

                        await setDoc(doc(db, 'interviewList', admissionId), interviewData);

                        // Email sending using EmailJS
                        const emailParams = {
                            email: selectedAdmission.email, // Sending to the selected admission email
                            childName: selectedAdmission.childName, // Dynamic data
                        };

                        const serviceID = 'service_bjbc0id'; // EmailJS service ID
                        const templateID = 'template_y0msg1p'; // Template ID
                        const userID = 'ZUV9_jUZYRPb1dWoc'; // EmailJS user ID

                        // Send email using EmailJS
                        try {
                            const response = await emailjs.send(serviceID, templateID, emailParams, userID);
                            console.log('Email sent successfully:', response);
                            setSnackbarMessage('Successfully added to the interview list and email sent.');
                        } catch (error) {
                            console.error('Error sending email:', error);
                            setSnackbarMessage(`Error sending email: ${error.message}`);
                        }

                    } else {
                        console.error('No document found with the admission ID:', admissionId);
                        setSnackbarMessage('Selected admission document does not exist.');
                    }
                } catch (error) {
                    console.error('Error handling interview checkbox change:', error);
                    setSnackbarMessage(`Error handling interview checkbox change: ${error.message}`);
                } finally {
                    setSnackbarOpen(true);
                }
            }
        };

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };

    const handleRegister = async (admissionId) => {
        setRegisteringId(admissionId);
        try {
            const interviewDocRef = doc(db, 'interviewList', admissionId);
            const interviewDoc = await getDoc(interviewDocRef);
            if (interviewDoc.exists()) {
                const interviewData = interviewDoc.data();
                const { id, ...studentData } = interviewData;
                const lastDigit = id.charAt(id.length - 1);
                const classMapping = {
                    '0': 'Manel',
                    '1': 'Kumudu',
                    '2': 'Pichcha',
                    '3': 'Olu',
                    '4': 'Kakulu',
                    '5': 'Rosa',
                    '6': 'Orchid',
                    '7': 'Wathusudu',
                    '8': 'Kanesh',
                    '9': 'Sooriyakantha',
                };
                studentData.className = classMapping[lastDigit] || 'Unknown';

                // Add the default photo URL to the student data
                studentData.photo = "https://res.cloudinary.com/dgecq2e6l/image/upload/v1732662737/hea7qetdloyoibrv5j6r.png";
    
                const studentQuerySnapshot = await getDocs(collection(db, 'students'));
                const existingAdmissionNumbers = studentQuerySnapshot.docs.map((doc) => doc.id);
                const currentYear = new Date().getFullYear().toString().slice(-2);
                const lastAdmissionNumbers = existingAdmissionNumbers.filter((num) =>
                    num.startsWith(`stu-${currentYear}`)
                );
                const totalStudents = lastAdmissionNumbers.length;
                let newAdmissionNumber = `stu-${currentYear}-${(totalStudents + 1).toString().padStart(4, '0')}`;
                studentData.admissionNumber = newAdmissionNumber;
    
                const randomPassword = Math.random().toString(36).slice(-8);
                await createUserWithEmailAndPassword(auth, studentData.email, randomPassword);
    
                studentData.isUserLoginFirstTime = true;
                studentData.isFirstTimeLogin = true;
    
                await setDoc(doc(db, 'students', newAdmissionNumber), studentData);
                setRegisteredIds((prev) => new Set(prev).add(admissionId));
                setSnackbarMessage(
                    `Successfully registered student with admission number: ${newAdmissionNumber}. Class: ${studentData.className}. Temporary password: ${randomPassword}`
                );
    
                // Send email using EmailJS
                const emailParams = {
                    to_email: studentData.email,
                    to_name: studentData.childName,
                    admission_number: newAdmissionNumber,
                    class_name: studentData.className,
                    temporary_password: randomPassword,
                };
    
                emailjs
                    .send(
                        'service_bjbc0id', // Replace with your EmailJS Service ID
                        'template_sziwago', // Replace with your EmailJS Template ID
                        emailParams,
                        'ZUV9_jUZYRPb1dWoc' // Replace with your EmailJS Public Key
                    )
                    .then(
                        (response) => {
                            console.log('Email sent successfully:', response.status, response.text);
                        },
                        (error) => {
                            console.error('Error sending email:', error);
                        }
                    );
            } else {
                setSnackbarMessage('Error: Interview document does not exist.');
            }
        } catch (error) {
            console.error('Error registering student:', error);
            setSnackbarMessage('Error registering student. Please try again.');
        } finally {
            setRegisteringId(null);
            setSnackbarOpen(true);
        }
    };
     
    
    const handleDownloadDetails = async (admissionId) => {
        try {
            // Fetch the student's details using Firestore
            const q = query(
                collection(db, 'newadmission'),
                where('admission', '==', admissionId)
            );
    
            const querySnapshot = await getDocs(q);
            const studentDetails = querySnapshot.docs.map((doc) => doc.data())[0]; // Get the first matching document
    
            if (!studentDetails) {
                alert('Student details not found!');
                return;
            }
    
            // Create a PDF using jsPDF
            const doc = new jsPDF();
    
            // Add content to the PDF
            doc.setFontSize(16);
            doc.text('Student Details', 10, 10);
    
            // Child's Info
            doc.setFontSize(12);
            doc.text(`Name: ${studentDetails.childName}`, 10, 20);
            doc.text(`Gender: ${studentDetails.gender}`, 10, 30);
            doc.text(`Date of Birth: ${studentDetails.birthDate}`, 10, 40);
            doc.text(`Address: ${studentDetails.address}, ${studentDetails.city}`, 10, 50);
            doc.text(`Phone: ${studentDetails.phoneNumber}`, 10, 60);
            doc.text(`Email: ${studentDetails.email}`, 10, 70);
    
            // Mother's Info
            doc.text(`Mother's Name: ${studentDetails.motherfullName}`, 10, 90);
            doc.text(`Mother's Contact: ${studentDetails.mothercontactNo}`, 10, 100);
            doc.text(`Mother's Email: ${studentDetails.motheremailAddress}`, 10, 110);
    
            // Father's Info
            doc.text(`Father's Name: ${studentDetails.fatherfullName}`, 10, 130);
            doc.text(`Father's Contact: ${studentDetails.fathercontactNo}`, 10, 140);
            doc.text(`Father's Email: ${studentDetails.fatheremailAddress}`, 10, 150);
    
            // Save the PDF
            doc.save(`${studentDetails.childName}_Details.pdf`);
        } catch (error) {
            console.error('Error downloading details:', error);
            alert('Failed to download details.');
        }
    };
    
    
    return (
        <div className="right-content w-100">
        <div className="card shadow border-0 p-3 mt-4">
            <h3 className="hd">Admissions</h3>
        </div>
        <TableContainer component={Paper} className="admissions" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                    <TableRow className="thead-dark">
                        <TableCell className="tableCell">Id No</TableCell>
                        <TableCell className="tableCell">Name</TableCell>
                        <TableCell className="tableCell">Date Of Birth</TableCell>
                        <TableCell className="tableCell">PDF</TableCell>
                        <TableCell className="tableCell">Selected for Interview</TableCell>
                        <TableCell className="tableCell">Action</TableCell>
                        <TableCell className="tableCell">View All Details</TableCell> {/* New Column */}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.map(row => (
                        <TableRow key={row.id}>
                            <TableCell className="tableCell">{row.admission}</TableCell>
                            <TableCell className="tableCell">{row.childName}</TableCell>
                            <TableCell className="tableCell">{row.birthDate}</TableCell>
                            <TableCell className="tableCell">
                                <button
                                    onClick={() => handleDownloadDetails(row.admission)}
                                    title="Download Student Details"
                                >
                                    Download
                                </button>
                            </TableCell>
                            <TableCell className="tableCell">
                                {!selectedInterviewIds.includes(row.admission) ? (
                                    <button
                                        onClick={() => handleInterviewCheckboxChange(row.admission)}
                                        disabled={registeredIds.has(row.admission)}
                                        className="selectButton"
                                    >
                                        Select
                                    </button>
                                ) : (
                                    <button
                                        disabled
                                        className="selectedButton"
                                    >
                                        Selected
                                    </button>
                                )}
                            </TableCell>

                            <TableCell className="tableCell">
                                <button
                                    onClick={() => handleRegister(row.admission)}
                                    disabled={registeredIds.has(row.admission) || registeringId === row.admission}
                                >
                                    {registeredIds.has(row.admission)
                                        ? 'Registered'
                                        : registeringId === row.admission
                                        ? 'Registering...'
                                        : 'Register'}
                                </button>
                            </TableCell>

                            <TableCell className="tableCell">
                            {/* View Details Button */}
                                <button onClick={() => handleViewDetails(row.admission)} title="View Details">
                                    👁️ View Details
                                </button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>

        <Snackbar
            open={snackbarOpen}
            autoHideDuration={6000}
            onClose={handleSnackbarClose}
            message={snackbarMessage}
        />

         {/* Your table implementation here */}

            {/* Details Dialog */}
            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogTitle>Admission Details</DialogTitle>
                <DialogContent>
                    {loading ? (
                        <p>Loading details...</p>
                    ) : details ? (
                        <div>
                            {/* Child's Info */}
                            <h4>Child's Information</h4>
                            <p><strong>Name:</strong> {details.childName}</p>
                            <p><strong>Gender:</strong> {details.gender}</p>
                            <p><strong>Date of Birth:</strong> {details.birthDate}</p>
                            <p><strong>Address:</strong> {details.address}, {details.city}</p>
                            <p><strong>Phone:</strong> {details.phoneNumber}</p>
                            <p><strong>Distance:</strong> {details.distance}</p>
                            <p><strong>Email:</strong> {details.email}</p>

                            {/* Mother's Info */}
                            <h4>Mother's Information</h4>
                            <p><strong>Name:</strong> {details.motherfullName}</p>
                            <p><strong>Permanent Address:</strong> {details.motherpermanentAddress}</p>
                            <p><strong>Current Residential Address:</strong> {details.mothercurrentResidentialAddress}</p>
                            <p><strong>Contact No:</strong> {details.mothercontactNo}</p>
                            <p><strong>Email:</strong> {details.motheremailAddress}</p>

                            {/* Father's Info */}
                            <h4>Father's Information</h4>
                            <p><strong>Name:</strong> {details.fatherfullName}</p>
                            <p><strong>Permanent Address:</strong> {details.fatherpermanentAddress}</p>
                            <p><strong>Current Residential Address:</strong> {details.fathercurrentResidentialAddress}</p>
                            <p><strong>Contact No:</strong> {details.fathercontactNo}</p>
                            <p><strong>Email:</strong> {details.fatheremailAddress}</p>

                            {/* Guardian's Info */}
                            <h4>Guardian's Information</h4>
                            <p><strong>Relationship:</strong> {details.guardianrelationship}</p>
                            <p><strong>Permanent Address:</strong> {details.guardianpermanentAddress}</p>
                            <p><strong>Residential Address:</strong> {details.guardianresidentialAddress}</p>
                            <p><strong>Contact Number:</strong> {details.guardiancontactNumber}</p>
                            <p><strong>Email:</strong> {details.guardianemailAddress}</p>

                            {/* Other Info */}
                            <h4>Other Information</h4>
                            <p><strong>Has Siblings:</strong> {details.hasSiblings}</p>
                            {details.siblingDetails && details.siblingDetails.length > 0 && (
                                <ul>
                                    {details.siblingDetails.map((sibling, index) => (
                                        <li key={index}>
                                            <p><strong>Name:</strong> {sibling.siblingName}</p>
                                            <p><strong>Year:</strong> {sibling.siblingYear}</p>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            <p><strong>Studied in School:</strong> {details.studiedInSchool}</p>
                            <p><strong>Referral Source:</strong> {details.referralSource}</p>
                        </div>
                    ) : (
                        <p>No details available.</p>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
    </div>
    );
};

export default Admissions;
