import React, { useState } from 'react';
import './Teacherreg.css';
import { collection, doc, setDoc, query, orderBy, getDocs, limit, where } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../../firebase'; // Ensure your Firebase configuration is imported
import emailjs from 'emailjs-com';

const Teacherreg = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    nameWithInitials: '',
    email: '',
    gender: '',
    dateOfBirth: '',
    religion: '',
    nationality: '',
    permanentAddress: '',
    currentResidentialAddress: '',
    mobile: '',
    telNo: '',
    nic: '',
    maritalStatus: '',
    qualification: '',
    class: ''
  });

  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmittingForm, setIsSubmittingForm] = useState(false); // For form submission loading state
  const [errors, setErrors] = useState({});

  // Function to generate unique admission number (starting from stf-24-1000)
  const generateAdmissionNumber = async () => {
    const teacherRef = collection(db, 'teachers');
    const q = query(teacherRef, orderBy('admissionNumber', 'desc'), limit(1)); // Get the highest admission number
    const querySnapshot = await getDocs(q);

    let newAdmissionNumber = 'stf-24-0001'; // Default if no teachers found
    if (!querySnapshot.empty) {
      const lastTeacher = querySnapshot.docs[0].data();
      const lastAdmissionNumber = lastTeacher.admissionNumber;
      const newNumber = parseInt(lastAdmissionNumber.split('-')[2], 10) + 1;

      if (newNumber <= 1000) { // Ensure the admission number doesn't exceed stf-24-1000
        newAdmissionNumber = `stf-24-${newNumber.toString().padStart(4, '0')}`;
      } else {
        throw new Error('Admission limit reached (stf-24-1000)');
      }
    }

    return newAdmissionNumber;
  };


  const validateForm = () => {
    const newErrors = {};

    // Validate email
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    // Validate mobile number
    if (!formData.mobile || !/^07[0-9]{8}$/.test(formData.mobile)) {
      newErrors.mobile = 'Mobile number must be a valid 10-digit number starting with 07.';
    }

    // Validate telephone number
    if (!formData.telNo || !/^\d{10}$/.test(formData.telNo)) {
      newErrors.telNo = 'Telephone number must be a valid 10-digit number.';
    }

    setErrors(newErrors);

    // If no errors, return true
    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!validateForm()) {
      return; // Stop submission if validation fails
    }

    try {
      // Check if all required fields are filled
      if (!formData.fullName || !formData.nameWithInitials || !formData.email ||
        !formData.gender || !formData.dateOfBirth || !formData.religion || !formData.nationality ||
        !formData.permanentAddress || !formData.currentResidentialAddress || !formData.mobile ||
        !formData.telNo || !formData.nic || !formData.maritalStatus ||
        !formData.qualification || !formData.class) {
        setError('Please fill all the required fields.');
        return;
      }

      // Calculate age
      const today = new Date();
      const birthDate = new Date(formData.dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      if (age < 18) {
        setError('The age must be greater than 18 to register a teacher.');
        return;
      }

      setIsSubmittingForm(true);

      // Check if email already exists in Firestore
      const emailQuery = query(collection(db, 'teachers'), where('email', '==', formData.email));
      const emailSnapshot = await getDocs(emailQuery);

      if (!emailSnapshot.empty) {
        setError('The email is already registered in the system. Please submit another email.');
        return;
      }

      // Generate a unique admission number
      const admissionNumber = await generateAdmissionNumber();

      // Generate a temporary password
      const tempPassword = Math.random().toString(36).slice(-8);

      // Register the user in Firebase Authentication
      await createUserWithEmailAndPassword(auth, formData.email, tempPassword);

      // Set teacher data in Firestore with admissionNumber as document ID
      await setDoc(doc(db, 'teachers', admissionNumber), {
        ...formData,
        photo: 'https://res.cloudinary.com/dgecq2e6l/image/upload/v1732662737/hea7qetdloyoibrv5j6r.png', // Add the photo URL
        admissionNumber, // Include the generated admission number as a field
        isFirstTimeLogin: true // Set this to true for first-time login tracking
      });

      // Show admission number and temporary password
      setSuccessMessage(`Teacher registered successfully! Admission Number: ${admissionNumber}, Temporary Password: ${tempPassword}`);

    // Send the email to the teacher with their admission number and temporary password
    sendRegistrationEmail(admissionNumber, tempPassword, formData.email);

      // Clear the form
      setFormData({
        fullName: '',
        nameWithInitials: '',
        email: '',
        gender: '',
        dateOfBirth: '',
        religion: '',
        nationality: '',
        permanentAddress: '',
        currentResidentialAddress: '',
        mobile: '',
        telNo: '',
        nic: '',
        maritalStatus: '',
        qualification: '',
        class: ''
      });
    } catch (error) {
      setError(`Error registering Teacher: ${error.message}`);
    } finally {
      // Always reset the loading state whether the registration is successful or not
      setIsSubmittingForm(false);
    }
  };


  // Email sending function
function sendRegistrationEmail(admissionNumber, tempPassword, email) {
  const templateParams = {
    admissionNumber: admissionNumber,
    tempPassword: tempPassword,
    user_email: email,
    email_body: `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .header { background: #4CAF50; color: white; padding: 10px; text-align: center; }
            .content { padding: 20px; }
            .footer { font-size: 12px; text-align: center; margin-top: 20px; }
        </style>
    </head>
    <body>
        <div class="header"><h1>Teacher Registration Successful</h1></div>
        <div class="content">
            <p><strong>Admission Number:</strong> {{admissionNumber}}</p>
            <p><strong>Temporary Password:</strong> {{tempPassword}}</p>
            <p>Thank you for joining us! You can now log in using the temporary password provided.</p>
        </div>
        <div class="footer">Visit <a href="https://yourwebsite.com">Our Website</a></div>
    </body>
    </html>
    `
  };

  // Send email via EmailJS
  emailjs.send('service_mufjono', 'template_atb4tue', templateParams, 's9hFJtF9B24c17vxr')
    .then((response) => {
      console.log('Email sent successfully!', response.status, response.text);
    })
    .catch((err) => {
      console.error('Failed to send email.', err);
    });
}


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="teacher-registration">
      <h1>TEACHER REGISTRATION</h1>
      {error && <p className="error">{error}</p>}
      {successMessage && <p className="success">{successMessage}</p>}
      <form onSubmit={handleSubmit}>

        <div className="form-row">
          <label>
            Full Name
            <input type="text1" name="fullName" value={formData.fullName} onChange={handleChange} placeholder='Enter the full name' required />
          </label>
        </div>

        <div className="form-row">
          <label>
            Name With Initials
            <input type="text1" name="nameWithInitials" value={formData.nameWithInitials} onChange={handleChange} placeholder='Enter the name with initials' required />
          </label>
        </div>

        <div className="form-row">
          <label>
            Email
            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
            {errors.email && <p className="error">{errors.email}</p>}
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
            <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required max="2006-12-31" />
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
            Permanent Address
            <input type="text1" name="permanentAddress" value={formData.permanentAddress} onChange={handleChange} required />
          </label>
        </div>

        <div className="form-row">
          <label>
            Residential Address
            <input type="text1" name="currentResidentialAddress" value={formData.currentResidentialAddress} onChange={handleChange} required />
          </label>
        </div>

        <div className="form-row">
          <label>
            Mobile
            <input type="text1" name="mobile" value={formData.mobile} onChange={handleChange} required />
            {errors.mobile && <p className="error">{errors.mobile}</p>}
          </label>
          <label>
            Tel No
            <input type="text1" name="telNo" value={formData.telNo} onChange={handleChange} required />
            {errors.telNo && <p className="error">{errors.telNo}</p>}
          </label>
        </div>
      
        <div className="form-row">
          <label>
            NIC
            <input type="text1" name="nic" value={formData.nic} onChange={handleChange} required />
          </label>

          <label>Marital Status
            <select name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} required>
              <option value="">Select</option>
              <option value="Single">Single</option>
              <option value="Married">Married</option>
              <option value="Widowed">Widowed</option>
              <option value="Divorced">Divorced</option>
            </select>
          </label>
          </div>
          <div className="form-section">

          <label>Qualification
            <select name="qualification" value={formData.qualification} onChange={handleChange} required>
              <option value="">Select</option>
              <option value="Diploma">Diploma</option>
              <option value="Bachelor's Degree">Bachelor's Degree</option>
              <option value="Master's Degree">Master's Degree</option>
              <option value="PhD">PhD</option>
            </select>
          </label>

          <label>
            Class
            <select name="class" value={formData.class} onChange={handleChange} required>
              <option value="" disabled>Select your class</option>
              <option value="Manel">Manel</option>
              <option value="Kumudu">Kumudu</option>
              <option value="Pichcha">Pichcha</option>
              <option value="Olu">Olu</option>
              <option value="Kakulu">Kakulu</option>
              <option value="Rosa">Rosa</option>
              <option value="Orchid">Orchid</option>
              <option value="Wathusudu">Wathusudu</option>
              <option value="Kanesh">Kanesh</option>
              <option value="Sooriyakantha">Sooriyakantha</option>
            </select>
          </label>

        </div>
        <button type="submit" className="sub">
          {isSubmittingForm ? 'Registering ...' : 'Register'}
        </button>

      </form>
    </div>
  );
};

export default Teacherreg;
