import React, { useEffect, useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom'; 
import { db } from '../../firebase';
import { collection, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { FaSave, FaTrash, FaEdit } from 'react-icons/fa';
import './Students.css';

const Students = () => {
    const [rows, setRows] = useState([]);
    const [editingRow, setEditingRow] = useState(null); // Track the row being edited
    const [editedValues, setEditedValues] = useState({}); // Store the values being edited

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'students'));
                const data = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setRows(data);
            } catch (error) {
                console.error("Error fetching admissions data: ", error);
            }
        };
        fetchStudents();
    }, []);

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this student?");
        if (confirmDelete) {
            try {
                await deleteDoc(doc(db, 'students', id));
                setRows(rows.filter(row => row.id !== id));
            } catch (error) {
                console.error("Error deleting student: ", error);
            }
        }
    };

    const handleEdit = (id) => {
        setEditingRow(id);
        const studentToEdit = rows.find(row => row.id === id);
        setEditedValues(studentToEdit); // Prepopulate the fields with current data
    };

    const handleSave = async (id) => {
        try {
            const studentRef = doc(db, 'students', id);
            await updateDoc(studentRef, editedValues); // Update Firestore with new values
            setEditingRow(null); // Exit edit mode
        } catch (error) {
            console.error("Error updating student: ", error);
        }
    };

    const handleInputChange = (e, field) => {
        setEditedValues({
            ...editedValues,
            [field]: e.target.value
        });
    };

    return (
        <div className="right-content w-100">
            <div className="card shadow border-0 p-3 mt-4">
                <h3 className="hd">Students</h3>
            </div>
            <TableContainer component={Paper} className="admissions" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead>
                        <TableRow className="thead-dark">
                            {/* Table headers */}
                            <TableCell className="tableCell">Admission_No</TableCell>
                            
                            <TableCell className="tableCell">Full Name</TableCell>
                            <TableCell className="tableCell">Email</TableCell>
                            {/*<TableCell className="tableCell">Gender</TableCell>*/}
                            <TableCell className="tableCell">Date_Of_Birth</TableCell>
                            {/*<TableCell className="tableCell">Religion</TableCell>*/}
                            <TableCell className="tableCell">Current City</TableCell>
                            <TableCell className="tableCell">Residential_Address</TableCell>
                            <TableCell className="tableCell">Mobile</TableCell>
                            {/*<TableCell className="tableCell">Father/Guardian_Name</TableCell>
                            <TableCell className="tableCell">Occupation</TableCell>
                            <TableCell className="tableCell">NIC No</TableCell>*/}
                            <TableCell className="tableCell">Class_Name</TableCell>

                            <TableCell className="tableCell">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row) => (
                            <TableRow key={row.id}>
                                {/* Display editable fields only for the row being edited */}
                                <TableCell className="tableCell">{row.admissionNumber}</TableCell>

                                <TableCell className="tableCell">{editingRow === row.id ? (<input value={editedValues.childName} onChange={(e) => handleInputChange(e, 'childName')}/>) : (row.childName)}</TableCell>
                                <TableCell className="tableCell">{row.email}</TableCell>
                                
                                {/*<TableCell className="tableCell">{row.gender}</TableCell>*/}
                                <TableCell className="tableCell">{row.birthDate}</TableCell>
                                {/*<TableCell className="tableCell">{editingRow === row.id ? (<input value={editedValues.religion} onChange={(e) => handleInputChange(e, 'religion')}/>) : (row.religion)}</TableCell>*/}
                                <TableCell className="tableCell">{editingRow === row.id ? (<input value={editedValues.city} onChange={(e) => handleInputChange(e, 'city')}/>) : (row.city)}</TableCell>
                                <TableCell className="tableCell">{editingRow === row.id ? (<input value={editedValues.address} onChange={(e) => handleInputChange(e, 'address')}/>) : (row.address)}</TableCell>
                                <TableCell className="tableCell">{editingRow === row.id ? (<input value={editedValues.contactNo} onChange={(e) => handleInputChange(e, 'contactNo')}/>) : (row.contactNo)}</TableCell>
                                {/*<TableCell className="tableCell">{editingRow === row.id ? (<input value={editedValues.fatherGuardianName} onChange={(e) => handleInputChange(e, 'fatherGuardianName')}/>) : (row.fatherGuardianName)}</TableCell>*/}
                                {/*<TableCell className="tableCell">{editingRow === row.id ? (<input value={editedValues.occupation} onChange={(e) => handleInputChange(e, 'occupation')}/>) : (row.occupation)}</TableCell>*/}
                                {/*<TableCell className="tableCell">{editingRow === row.id ? (<input value={editedValues.nic} onChange={(e) => handleInputChange(e, 'nic')}/>) : (row.nic)}</TableCell>*/}
                                <TableCell className="tableCell">{editingRow === row.id ? (<input value={editedValues.className} onChange={(e) => handleInputChange(e, 'className')}/>) : (row.className)}</TableCell>
                                
                                <TableCell className="tableCell">
                                    <div className="action-buttons">
                                        {editingRow === row.id ? (
                                            // Save Button when in Edit Mode
                                            <Button onClick={() => handleSave(row.id)} color="primary">
                                                <FaSave />
                                            </Button>
                                        ) : (
                                            // Edit Button for non-editing rows
                                            <Button onClick={() => handleEdit(row.id)} color="primary">
                                                <FaEdit />
                                            </Button>
                                        )}
                                            <Button onClick={() => handleDelete(row.id)} color="error">
                                                <FaTrash />
                                            </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            {/*<Link to='/studentreg'>
                <div className="button-container">
                    <Button variant="contained" color="primary">
                        Add new Student
                    </Button>
                </div>
            </Link>*/}
        </div>
    );
};

export default Students;
