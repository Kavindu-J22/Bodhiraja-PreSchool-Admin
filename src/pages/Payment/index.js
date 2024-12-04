import React, { useEffect, useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Switch from '@mui/material/Switch';
import { db } from '../../firebase'; // Correct path to your Firebase configuration file
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import emailjs from 'emailjs-com'; // Import emailjs
import './Payment.css'; // Ensure you have this CSS file for custom styles

const Payment = () => {
    const [rows, setRows] = useState([]);

    useEffect(() => {
        const fetchPayment = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'Payments'));
                const data = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    paymentStatus: doc.data().status === "accepted" // Determine payment status from Firestore
                }));
                setRows(data);
            } catch (error) {
                console.error("Error fetching payments data: ", error);
            }
        };

        fetchPayment();
    }, []);

    // Toggle payment status
    const handlePaymentStatusChange = async (id, email, name) => {
        const rowToUpdate = rows.find(row => row.id === id);
        const newStatus = !rowToUpdate.paymentStatus;

        if (newStatus) {
            if (window.confirm("Are you sure you want to accept this payment?")) {
                try {
                    // Update Firestore
                    const paymentDocRef = doc(db, "Payments", id);
                    await updateDoc(paymentDocRef, { status: "accepted" });

                    // Send email using emailjs
                    const templateParams = {
                        to_email: email,
                        name: name,
                        message: "Your payment has been accepted.",
                    };

                    await emailjs.send(
                        "service_mufjono", // Replace with your EmailJS service ID
                        "template_fxbbpy6", // Replace with your EmailJS template ID
                        templateParams,
                        "s9hFJtF9B24c17vxr" // Replace with your EmailJS user ID
                    );

                    // Update UI
                    setRows(rows.map(row =>
                        row.id === id ? { ...row, paymentStatus: true } : row
                    ));

                    alert("Payment status updated and email sent successfully!");
                } catch (error) {
                    console.error("Error updating payment status: ", error);
                    alert("Failed to update payment status or send email.");
                }
            }
        }
    };

    return (
        <div className="right-content w-100">
            <div className="card shadow border-0 p-3 mt-4">
                <h3 className="hd">Payments</h3>
            </div>
            <TableContainer component={Paper} className="admissions" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead>
                        <TableRow className="thead-dark">
                            <TableCell className="tableCell">Name</TableCell>
                            <TableCell className="tableCell">Student_Id</TableCell>
                            <TableCell className="tableCell">Email</TableCell>
                            <TableCell className="tableCell">Slip_PDF</TableCell>
                            <TableCell className="tableCell">Payment Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row) => (
                            <TableRow key={row.id}>
                                <TableCell className="tableCell">{row.name}</TableCell>
                                <TableCell className="tableCell">{row.studentId}</TableCell>
                                <TableCell className="tableCell">{row.email}</TableCell>
                                <TableCell className="tableCell">
                                    {row.fileURL && (
                                        <a href={row.fileURL} target="_blank" rel="noopener noreferrer">View PDF</a>
                                    )}
                                </TableCell>
                                <TableCell className="tableCell">
                                    <Switch
                                        checked={row.paymentStatus}
                                        onChange={() => handlePaymentStatusChange(row.id, row.email, row.name)}
                                        inputProps={{ 'aria-label': 'Payment Status Switch' }}
                                        className="customSwitch"
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
}

export default Payment;
