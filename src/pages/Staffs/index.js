import React, { useState } from 'react';
import { db, storage } from '../../firebase'; // Adjust the path if necessary
import { collection, addDoc, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Import icons
import { IoIosArrowDown } from "react-icons/io";
import { MdOutlineExpandMore } from "react-icons/md";
import { MdExpandLess } from "react-icons/md";
import { MdDelete } from "react-icons/md";

const Staffs = () => {
  // State for form inputs
  const [staffDescription, setStaffDescription] = useState('');
  const [staffName, setStaffName] = useState('');
  const [staffImages, setStaffImages] = useState([]);

  // State for delete staff name
  const [staffToDelete, setStaffToDelete] = useState('');

  // State for toggling the delete form visibility
  const [isDeleteFormVisible, setIsDeleteFormVisible] = useState(false);

  // Handle form submission to add staff
  const handleStaffSubmission = async (e) => {
    e.preventDefault(); // Prevent form from reloading

    const staffRef = collection(db, 'staffs'); // Reference to Firestore collection
    const imageUrls = []; // Array to store image URLs

    try {
      // Upload each image to Firebase Storage
      for (const file of staffImages) {
        const storageRef = ref(storage, `staffs/${file.name}`); // Reference path in Firebase storage
        await uploadBytes(storageRef, file); // Upload file to storage
        const url = await getDownloadURL(storageRef); // Get the download URL
        imageUrls.push(url); // Add URL to imageUrls array
      }

      // Add staff data to Firestore
      await addDoc(staffRef, {
        staffName,           // Field for staff name
        description: staffDescription,  // Field for staff description
        images: imageUrls    // Field for the images (array of URLs)
      });

      console.log("Staff added successfully");

      // Reset form fields after submission
      setStaffName('');
      setStaffDescription('');
      setStaffImages([]);

    } catch (error) {
      console.error("Failed to add staff:", error);
      alert("Failed to add staff: " + error.message);
    }
  };

  // Handle deletion of staff by name
  const handleDeleteStaff = async (e) => {
    e.preventDefault();

    try {
      const staffRef = collection(db, 'staffs');
      // Query Firestore for the staff document where staffName matches the input
      const q = query(staffRef, where('staffName', '==', staffToDelete));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        alert('No staff found with the given name.');
        return;
      }

      // Loop through and delete all matching staff records
      querySnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
        console.log('Staff deleted successfully');
      });

      // Reset the delete text box after deletion
      setStaffToDelete('');

    } catch (error) {
      console.error('Failed to delete staff:', error);
      alert('Failed to delete staff: ' + error.message);
    }
  };

  // Toggle the visibility of the delete form
  const toggleDeleteForm = () => {
    setIsDeleteFormVisible(!isDeleteFormVisible);
  };

  return (
    <div className="right-content w-100">
      <div className="card shadow border-0 p-3 mt-4">
        <h3 className="hd">Add New Staff</h3>
      </div>

      <div className="upload-container">
        {/* Add Staff Form */}
        <form onSubmit={handleStaffSubmission}>
          <input
            type="text"
            placeholder="Staff Name"
            value={staffName}
            onChange={(e) => setStaffName(e.target.value)}
            required
          />
          <textarea
            placeholder="Staff Position"
            value={staffDescription}
            onChange={(e) => setStaffDescription(e.target.value)}
            required
          />
          <input
            type="file"
            multiple
            onChange={(e) => setStaffImages([...e.target.files])}
            required
          />
          <div className="AddBut"style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button type="submit">Add Staff</button>

            {/* Show/Hide Icon Button */}
            <button
              type="button"
              className="show-hide-button"
              onClick={toggleDeleteForm}
            >
              {isDeleteFormVisible ? (
                                <MdExpandLess/> // Apply red color to the icon
                            ) : (
                                <MdDelete style={{ color: 'red' }} /> // Apply red color to the icon
                            )} {/* Show/hide icon */}
            </button>
          </div>
        </form>

        {/* Delete Staff Form (Visible based on state) */}
        {isDeleteFormVisible && (
          <form onSubmit={handleDeleteStaff}>
            <input
              type="text"
              placeholder="Enter Staff Name to Delete"
              value={staffToDelete}
              onChange={(e) => setStaffToDelete(e.target.value)}
              required
            />
            <div className="AddBut">
              <button type="submit" className="delete-button">Delete Staff</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Staffs;
