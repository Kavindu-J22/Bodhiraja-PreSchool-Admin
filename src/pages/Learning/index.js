import React, { useState } from 'react';
import { db } from '../../firebase'; // Adjust the path if necessary
import { collection, addDoc, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import './Learning.css'; // Ensure you have this CSS file for custom styles
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Import icons for show/hide functionality
import { MdOutlineExpandMore } from "react-icons/md";
import { MdExpandLess } from "react-icons/md";
import { MdDelete } from "react-icons/md";

const Learning = () => {
  // State for form inputs
  const [learningCategory, setLearningCategory] = useState(''); // Dropdown state for learning category
  const [learningAge, setLearningAge] = useState(''); // Dropdown state for learning age group
  const [learningName, setLearningName] = useState(''); // State for the name of the learning resource
  const [learningDescription, setLearningDescription] = useState(''); // State for the URL of the resource

  // State for delete form inputs
  const [resourceToDelete, setResourceToDelete] = useState(''); // State for the name of the resource to delete
  const [deleteCategory, setDeleteCategory] = useState(''); // Category to specify which collection to delete from

  // State to show/hide the delete form
  const [showDeleteForm, setShowDeleteForm] = useState(false); // Toggle for showing delete form

  // Handle form submission to add a learning resource
  const handleLearningSubmission = async (e) => {
    e.preventDefault(); // Prevent form reload on submission

    try {
      // Reference to Firestore collection based on the selected category
      const learningRef = collection(db, learningCategory);

      // Add the new learning resource to Firestore
      await addDoc(learningRef, {
        learningName,              // Name of the learning resource
        category: learningAge,     // Age group
        link: learningDescription  // URL or description
      });

      console.log('Learning Resource added successfully');

      // Reset the form fields
      setLearningCategory('');
      setLearningAge('');
      setLearningName('');
      setLearningDescription('');

    } catch (error) {
      console.error('Failed to add learning:', error);
      alert('Failed to add learning: ' + error.message);
    }
  };

  // Handle the deletion of a learning resource by name
  const handleDeleteLearningResource = async (e) => {
    e.preventDefault();

    try {
      const learningRef = collection(db, deleteCategory); // Reference to the selected Firestore collection

      // Query Firestore to find the document where the name matches the resource to delete
      const q = query(learningRef, where('learningName', '==', resourceToDelete));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        alert('No learning resource found with the given name.');
        return;
      }

      // Loop through and delete the matching resource(s)
      querySnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
        console.log('Learning Resource deleted successfully');
      });

      // Reset the delete form fields
      setResourceToDelete('');
      setDeleteCategory('');

    } catch (error) {
      console.error('Failed to delete learning resource:', error);
      alert('Failed to delete learning resource: ' + error.message);
    }
  };

  return (
    <div className="right-content w-100">
      <div className="card shadow border-0 p-3 mt-4">
        <h3 className="hd">Add New Learning Resource</h3>
      </div>

      <div className="upload-container">
        {/* Add Learning Resource Form */}
        <form onSubmit={handleLearningSubmission}>
          <select
            value={learningCategory}
            onChange={(e) => setLearningCategory(e.target.value)}
            required
          >
            <option value="" disabled>Select Learning Category</option>
            <option value="Nursery Rhymes">Nursery Rhymes</option>
            <option value="Basic Manners">Basic Manners</option>
            <option value="Short Stories">Short Stories</option>
            <option value="Basic Math Concepts">Basic Math Concepts</option>
            <option value="Problem-Solving and Thinking">Problem-Solving and Thinking</option>
          </select>

          <select
            value={learningAge}
            onChange={(e) => setLearningAge(e.target.value)}
            required
          >
            <option value="" disabled>Select Learning Age Group</option>
            <option value="Pre Kindergarten">Pre Kindergarten</option>
            <option value="Upper Kindergarten">Upper Kindergarten</option>
          </select>

          <input
            type="text"
            placeholder="Learning Resource Name"
            value={learningName}
            onChange={(e) => setLearningName(e.target.value)}
            required
          />

          <textarea
            placeholder="Learning Resource URL"
            value={learningDescription}
            onChange={(e) => setLearningDescription(e.target.value)}
            required
          />

          {/* Container for Add button and Show/Hide Delete Form Icon */}
          <div className="AddBut" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button type="submit">Add Learning Resource</button>

            {/* Show/Hide Delete Section Icon */}
            <button type="button" onClick={() => setShowDeleteForm(!showDeleteForm)} className="toggle-button">
              {showDeleteForm ? (
                                <MdExpandLess/> // Apply red color to the icon
                            ) : (
                                <MdDelete style={{ color: 'red' }} /> // Apply red color to the icon
                            )} {/* Icon to toggle form visibility */}
            </button>
          </div>
        </form>

        {/* Conditionally render the Delete Learning Resource Form */}
        {showDeleteForm && (
          <form onSubmit={handleDeleteLearningResource} className="mt-4">
            <select
              value={deleteCategory}
              onChange={(e) => setDeleteCategory(e.target.value)}
              required
            >
              <option value="" disabled>Select Category to Delete From</option>
              <option value="Nursery Rhymes">Nursery Rhymes</option>
              <option value="Basic Manners">Basic Manners</option>
              <option value="Short Stories">Short Stories</option>
              <option value="Basic Math Concepts">Basic Math Concepts</option>
              <option value="Problem-Solving and Thinking">Problem-Solving and Thinking</option>
            </select>

            <input
              type="text"
              placeholder="Enter Resource Name to Delete"
              value={resourceToDelete}
              onChange={(e) => setResourceToDelete(e.target.value)}
              required
            />

            <div className="AddBut">
              <button type="submit" className="delete-button">Delete Learning Resource</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Learning;
