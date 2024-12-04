import React, { useEffect, useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { db } from '../../firebase'; // Correct path to your Firebase configuration file
import { collection, getDocs } from 'firebase/firestore';
import './Feedback.css'; // Ensure you have this CSS file for custom styles

const Feedback = () => {
    const [rows, setRows] = useState([]);

    useEffect(() => {
        const fetchFeedback = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'feedback'));
                const data = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setRows(data);
            } catch (error) {
                console.error("Error fetching feedback data: ", error);
            }
        };

        fetchFeedback();
    }, []);

    // List of fields to apply specific styles to
    const highlightedFields = [
        'rating', 'feedback'
    ];

    return (
        <div className="right-content w-100">
            <div className="card shadow border-0 p-3 mt-4">
                <h3 className="hd">Feedbacks</h3>
            </div>
            <TableContainer component={Paper} className="admissions" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead>
                        <TableRow className="thead-dark">
                            <TableCell className="tableCell">Rating</TableCell>
                            <TableCell className="tableCell">Feedback</TableCell>
                            
                            
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row) => (
                            <TableRow key={row.id}>
                                <TableCell className="tableCell">{row.rating}</TableCell>
                                <TableCell className="tableCell">{row.feedback}</TableCell>
                               
                                
                                
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
}

export default Feedback;
