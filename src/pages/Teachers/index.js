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
import { collection, getDocs, addDoc ,doc,deleteDoc, updateDoc} from 'firebase/firestore';
import { FaSave, FaTrash, FaEdit } from 'react-icons/fa';
import './Teachers.css';
import { Alert } from '@mui/material';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";


const Teachers = () => {
    const [rows, setRows] = useState([]);
    const [error, setError] = useState('');
    const [editingRow, setEditingRow] = useState(null); // Track the row being edited
    const [editedValues, setEditedValues] = useState({}); // Store the values being edited

    useEffect(() => {
        const fetchTeachers = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'teachers'));
                const data = querySnapshot.docs
                    .map(doc => {
                        const teacherData = doc.data();
                        const age = calculateAge(teacherData.dateOfBirth);
                        
                        // Only include teachers aged 18 or older
                        if (age >= 18) {
                            return { id: doc.id, age, ...teacherData };
                        }
                        return null;
                    })
                    .filter(teacher => teacher !== null);
                setRows(data);
            } catch (error) {
                console.error("Error fetching teachers data: ", error);
            }
        };

        fetchTeachers();
    }, []);

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this teacher?");
        if (confirmDelete) {
            try {
                await deleteDoc(doc(db, 'teachers', id));
                setRows(rows.filter(row => row.id !== id));
            } catch (error) {
                console.error("Error deleting teacher: ", error);
            }
        }
    };

    const handleEdit = (id) => {
        setEditingRow(id);
        const teacherToEdit = rows.find(row => row.id === id);
        setEditedValues(teacherToEdit); // Prepopulate the fields with current data
    };

    const handleSave = async (id) => {
        try {
            const teacherRef = doc(db, 'teachers', id);
            await updateDoc(teacherRef, editedValues); // Update Firestore with new values
            setEditingRow(null); // Exit edit mode
        } catch (error) {
            console.error("Error updating teacher: ", error);
        }
    };

    const handleInputChange = (e, field) => {
        setEditedValues({
            ...editedValues,
            [field]: e.target.value
        });
    };


    // Function to calculate the age from date of birth
    const calculateAge = (dob) => {
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDifference = today.getMonth() - birthDate.getMonth();

        if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const handleTeacherRegistration = async (teacherData) => {
        const requiredFields = ['admissionNumber', 'fullName', 'nameWithInitials', 'email', 'gender', 'dateOfBirth', 'religion', 'nationality','permanentAddress', 'currentResidentialAddress', 'mobile','telNo' ,'nic', 'qualification', 'class'];
        const missingFields = [];
    
        // Check for missing fields
        requiredFields.forEach(field => {
            if (!teacherData[field] || teacherData[field].trim() === '') {
                missingFields.push(field);
            }
        });
    
        // Display error if any fields are missing
        if (missingFields.length > 0) {
            setError('Please fill all required fields.');
            return;
        }
    
        const age = calculateAge(teacherData.dateOfBirth);
    
        // Check if the age is below 18
        if (age < 18) {
            setError('Age is below 18. Registration is not allowed.');
            return;
        }
    
        try {
            // Add teacher if all fields are filled and the age is valid
            await addDoc(collection(db, 'teachers'), { ...teacherData, age });
            setError(''); // Clear error message after successful registration
        } catch (error) {
            // Prevent the Firebase auth error from showing up
            setError(''); // Clear error message after successful registration

        }
    };
    
    return (
        <div className="right-content w-100">
            <div className="card shadow border-0 p-3 mt-4">
                <h3 className="hd">Teachers</h3>
            </div>

            {/* Error Message Display */}
            {error && <Alert severity="error">{error}</Alert>}

            <TableContainer component={Paper} className="admissions" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead>
                        <TableRow className="thead-dark">
                            <TableCell className="tableCell">Admission_No</TableCell>
                            <TableCell className="tableCell">Full_Name</TableCell>
                            <TableCell className="tableCell">Name_With_Initials</TableCell>
                            <TableCell className="tableCell">Email</TableCell>
                            <TableCell className="tableCell">Gender</TableCell>
                            <TableCell className="tableCell">Date_Of_Birth</TableCell>
                            <TableCell className="tableCell">Age</TableCell> {/* Display calculated age */}
                            <TableCell className="tableCell">Religion</TableCell>
                            <TableCell className="tableCell">Nationality</TableCell>
                            <TableCell className="tableCell">Permanent_Address</TableCell>
                            <TableCell className="tableCell">Current_Residential_Address</TableCell>
                            <TableCell className="tableCell">Mobile</TableCell>
                            <TableCell className="tableCell">Tel_No</TableCell>
                            <TableCell className="tableCell">NIC</TableCell>
                            <TableCell className="tableCell">Educatianal Qualification</TableCell>
                            <TableCell className="tableCell">Marital</TableCell>
                            <TableCell className="tableCell">Class_Name</TableCell>
                            <TableCell className="tableCell">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row) => (
                            <TableRow key={row.id}>
                                <TableCell className="tableCell">{row.admissionNumber}</TableCell>
                                <TableCell className="tableCell">{editingRow === row.id ? (<input value={editedValues.fullName} onChange={(e) => handleInputChange(e, 'fullName')}/>) : (row.fullName)}</TableCell>
                                <TableCell className="tableCell">{editingRow === row.id ? (<input value={editedValues.nameWithInitials} onChange={(e) => handleInputChange(e, 'nameWithInitials')}/>) : (row.nameWithInitials)}</TableCell>
                                
                                <TableCell className="tableCell">{row.email}</TableCell>
                                <TableCell className="tableCell">{row.gender}</TableCell>
                                <TableCell className="tableCell">{row.dateOfBirth}</TableCell>
        
                                
                                <TableCell className="tableCell">{row.age}</TableCell> {/* Display calculated age */}
                                <TableCell className="tableCell">{editingRow === row.id ? (<input value={editedValues.religion} onChange={(e) => handleInputChange(e, 'religion')}/>) : (row.religion)}</TableCell>
                                <TableCell className="tableCell">{editingRow === row.id ? (<input value={editedValues.nationality} onChange={(e) => handleInputChange(e, 'nationality')}/>) : (row.nationality)}</TableCell>
                                <TableCell className="tableCell">{editingRow === row.id ? (<input value={editedValues.permanentAddress} onChange={(e) => handleInputChange(e, 'permanentAddress')}/>) : (row.permanentAddress)}</TableCell>
                                <TableCell className="tableCell">{editingRow === row.id ? (<input value={editedValues.currentResidentialAddress} onChange={(e) => handleInputChange(e, 'currentResidentialAddress')}/>) : (row.permanentAddress)}</TableCell>
                                <TableCell className="tableCell">{editingRow === row.id ? (<input value={editedValues.mobile} onChange={(e) => handleInputChange(e, 'mobile')}/>) : (row.mobile)}</TableCell>
                                <TableCell className="tableCell">{editingRow === row.id ? (<input value={editedValues.telNo} onChange={(e) => handleInputChange(e, 'telNo')}/>) : (row.telNo)}</TableCell>
                                <TableCell className="tableCell">{editingRow === row.id ? (<input value={editedValues.nic} onChange={(e) => handleInputChange(e, 'nic')}/>) : (row.nic)}</TableCell>
                                <TableCell className="tableCell">{editingRow === row.id ? (<input value={editedValues.qualification} onChange={(e) => handleInputChange(e, 'qualification')}/>) : (row.qualification)}</TableCell>
                                <TableCell className="tableCell">{editingRow === row.id ? (<input value={editedValues.maritalStatus} onChange={(e) => handleInputChange(e, 'maritalStatus')}/>) : (row.maritalStatus)}</TableCell>
                                <TableCell className="tableCell">{editingRow === row.id ? (<input value={editedValues.class} onChange={(e) => handleInputChange(e, 'class')}/>) : (row.class)}</TableCell>
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
            
            <Link to='/teacherreg'>
                <div className="button-container">
                    <Button variant="contained" color="primary" className="large-button">
                        Add new Teacher
                    </Button>
                </div>
            </Link>
        </div>
    );
};

export default Teachers;
