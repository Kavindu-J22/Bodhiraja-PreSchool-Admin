import React, { useState } from 'react';
import './Studentreg.css';
import { collection, doc, setDoc, query, orderBy, getDocs, limit, where  } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../../firebase'; // Ensure your Firebase configuration is imported

const Studentreg = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    gender: '',
    dateOfBirth: '',
    religion: '',
    nationality: '',
    residentialAddress: '',
    mobile: '',
    fatherGuardianName: '',
    occupation: '',
    nic: '',
    class: ''
  });

  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);  // For form submission loading state

// Function to generate unique admission number (starting from stu-24-1000)
// Function to generate unique admission number (starting from stu-24-0001 up to stu-24-1000)
const generateAdmissionNumber = async () => {
  const studentsRef = collection(db, 'students');
  const q = query(studentsRef, orderBy('admissionNumber', 'desc'), limit(1)); // Get the highest admission number
  const querySnapshot = await getDocs(q);

  let newAdmissionNumber = 'stu-24-0001'; // Default if no students found
  if (!querySnapshot.empty) {
    const lastStudent = querySnapshot.docs[0].data();
    const lastAdmissionNumber = lastStudent.admissionNumber;
    const newNumber = parseInt(lastAdmissionNumber.split('-')[2], 10) + 1;

    if (newNumber <= 1000) { // Ensure the admission number doesn't exceed stu-24-1000
      newAdmissionNumber = `stu-24-${newNumber.toString().padStart(4, '0')}`;
    } else {
      throw new Error('Admission limit reached (stu-24-1000)');
    }
  }

  return newAdmissionNumber;
};


const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setSuccessMessage('');

  try {

    setIsSubmittingForm(true);

    // Check if email already exists in Firestore
    const emailQuery = query(collection(db, 'students'), where('email', '==', formData.email));
    const emailSnapshot = await getDocs(emailQuery);

    if (!emailSnapshot.empty) {
      setError('This email is already registered.');
      return;
    }

    // Generate a unique admission number
    const admissionNumber = await generateAdmissionNumber();

    // Generate a temporary password
    const tempPassword = Math.random().toString(36).slice(-8);

    // Register the user in Firebase Authentication
    await createUserWithEmailAndPassword(auth, formData.email, tempPassword);

    // Set student data in Firestore with admissionNumber as document ID
    await setDoc(doc(db, 'students', admissionNumber), {
      ...formData,
      admissionNumber, // Include the generated admission number as a field
      isFirstTimeLogin: true // Set this to true for first-time login tracking
    });

    // Show admission number and temporary password
    setSuccessMessage(`Student registered successfully! Admission Number: ${admissionNumber}, Temporary Password: ${tempPassword}`);


    // Clear the form
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      gender: '',
      dateOfBirth: '',
      religion: '',
      nationality: '',
      residentialAddress: '',
      mobile: '',
      fatherGuardianName: '',
      occupation: '',
      nic: '',
      class: ''
    });
  } catch (error) {
    setError(`Error registering student: ${error.message}`);
  }
  finally {
    // Always reset the loading state whether the registration is successful or not
    setIsSubmittingForm(false);
  }
};


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="student-registration">
      <h1>STUDENT REGISTRATION</h1>
      <h1></h1>
      {error && <p className="error">{error}</p>}
      {successMessage && <p className="success">{successMessage}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <label>
            First Name
            <input type="text1" name="firstName" value={formData.firstName} onChange={handleChange} required />
          </label>
          
          <label>
            Last Name
            <input type="text1" name="lastName" value={formData.lastName} onChange={handleChange} required />
          </label>
        </div>
        <div className="form-row">
          <label>
            Email
            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          </label>
        </div>
        <div className="form-row">
          <label>
            Gender
            <div>
              <input type="radio" name="gender" value="Male" checked={formData.gender === 'Male'} onChange={handleChange} /> Male
              <input type="radio" name="gender" value="Female" checked={formData.gender === 'Female'} onChange={handleChange} /> Female
            </div>
          </label>
          <label>
            Date of Birth
            <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required />
          </label>
        </div>
        <div className="form-row">
          <label>
            Religion
            <input type="text1" name="religion" value={formData.religion} onChange={handleChange} />
          </label>
          <label>
            Nationality
            <input type="text1" name="nationality" value={formData.nationality} onChange={handleChange} required />
          </label>
        </div>
        <div className="form-row">
          <label>
            Residential Address
            <input type="text1" name="residentialAddress" value={formData.residentialAddress} onChange={handleChange} required />
          </label>
          <label>
            Mobile
            <input type="text1" name="mobile" value={formData.mobile} onChange={handleChange} required />
          </label>
        </div>
        <div className="form-section">
          <h2>FAMILY INFORMATION</h2>
          <label>
            Father/Guardian Name
            <input type="text1" name="fatherGuardianName" value={formData.fatherGuardianName} onChange={handleChange} required />
          </label>
          <label>
            Occupation
            <input type="text1" name="occupation" value={formData.occupation} onChange={handleChange} required />
          </label>
          <label>
            NIC
            <input type="text1" name="nic" value={formData.nic} onChange={handleChange} required />
          </label>
          <div className="form-section">
            <h2>OTHER</h2>
            <label>
              Class
              <input type="text1" name="class" value={formData.class} onChange={handleChange} required />
            </label>
          </div>
        </div>
        {/*<button className="sub" type="submit">REGISTER</button>*/}
        <button type="submit" className="sub" onClick={handleSubmit}>
          {isSubmittingForm ? 'Registering ...' : 'Register'}
        </button>

      </form>
    </div>
  );
};

export default Studentreg;