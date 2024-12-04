import React from 'react';
import Button from '@mui/material/Button';
import { MdDashboard, MdLogout, MdOutlinePayments, MdCardMembership, MdEventAvailable } from "react-icons/md";
import { FaAngleRight } from "react-icons/fa6";
import { PiStudentFill } from "react-icons/pi";
import { GiTeacher } from "react-icons/gi";
import { SlNote } from "react-icons/sl";
import { CgFeed } from "react-icons/cg";
import { ImBooks } from "react-icons/im";
import { CiViewTimeline } from "react-icons/ci";
import { Link, NavLink, useNavigate } from 'react-router-dom'; // For navigation
import { auth } from '../../firebase'; // Make sure to adjust the path to your firebase.js
import { signOut } from 'firebase/auth'; // Import the signOut function
import { Padding } from '@mui/icons-material';

const Sidebar = () => {
  const navigate = useNavigate(); // Initialize the useNavigate hook for redirection

  // Handle Logout
  const handleLogout = () => {
    signOut(auth) // Sign out the user
      .then(() => {
        console.log('User logged out');
        navigate('/login'); // Redirect to the login page after successful logout
      })
      .catch((error) => {
        console.error('Logout error:', error);
      });
  };

// Custom style for active link
const activeStyle = {
  backgroundColor: 'rgba(26, 111, 46, 0.192)', // Green color for active link
  color: 'white', // White text for active link
  borderRadius: '5px',
  borderTop: '1px solid #333', // 1px green border on top
  borderLeft: '1px solid #333', // 1px green border on the left
  borderRight: '1px solid #333', // 1px green border on the right
};


  return (
    <>
      <div className="sidebar">
        <ul>
          <li>
            <NavLink to='/dashboard' style={({ isActive }) => (isActive ? activeStyle : undefined)}>
              <Button className='w-100' >
                <span className='icon'><MdDashboard /></span>
                Dashboard
                <span className='arrow'><FaAngleRight /></span>
              </Button>
            </NavLink>
          </li>
          <li>
            <NavLink to="/students" style={({ isActive }) => (isActive ? activeStyle : undefined)}>
              <Button className='w-100'>
                <span className='icon'><PiStudentFill /></span>
                Students
                <span className='arrow'><FaAngleRight /></span>
              </Button>
            </NavLink>
          </li>
          <li>
            <NavLink to="/teachers" style={({ isActive }) => (isActive ? activeStyle : undefined)}>
              <Button className='w-100'>
                <span className='icon'><GiTeacher /></span>
                Teachers
                <span className='arrow'><FaAngleRight /></span>
              </Button>
            </NavLink>
          </li>
          <li>
            <NavLink to="/staffs" style={({ isActive }) => (isActive ? activeStyle : undefined)}>
              <Button className='w-100'>
                <span className='icon'><MdCardMembership /></span>
                Staffs
                <span className='arrow'><FaAngleRight /></span>
              </Button>
            </NavLink>
          </li>
          <li>
            <NavLink to="/payment" style={({ isActive }) => (isActive ? activeStyle : undefined)}>
              <Button className='w-100'>
                <span className='icon'><MdOutlinePayments /></span>
                Payments
                <span className='arrow'><FaAngleRight /></span>
              </Button>
            </NavLink>
          </li>
          <li>
            <NavLink to={'/admissions'} style={({ isActive }) => (isActive ? activeStyle : undefined)}>
              <Button className='w-100'>
                <span className='icon'><SlNote /></span>
                Admission
                <span className='arrow'><FaAngleRight /></span>
              </Button>
            </NavLink>
          </li>
          <li>
            <NavLink to="/timetable" style={({ isActive }) => (isActive ? activeStyle : undefined)}>
              <Button className='w-100'>
                <span className='icon'><CiViewTimeline /></span>
                Time Table
                <span className='arrow'><FaAngleRight /></span>
              </Button>
            </NavLink>
          </li>
          <li>
            <NavLink to="/events" style={({ isActive }) => (isActive ? activeStyle : undefined)}>
              <Button className='w-100'>
                <span className='icon'><MdEventAvailable /></span>
                Events
                <span className='arrow'><FaAngleRight /></span>
              </Button>
            </NavLink>
          </li>
          <li>
            <NavLink to="/learning" style={({ isActive }) => (isActive ? activeStyle : undefined)}>
              <Button className='w-100'>
                <span className='icon'><ImBooks /></span>
                Learning Resources
                <span className='arrow'><FaAngleRight /></span>
              </Button>
            </NavLink>
          </li>
          <li>
            <NavLink to="/feedback" style={({ isActive }) => (isActive ? activeStyle : undefined)}>
              <Button className='w-100'>
                <span className='icon'><CgFeed /></span>
                Feedback
                <span className='arrow'><FaAngleRight /></span>
              </Button>
            </NavLink>
          </li>
          <li>
            {/* Logout button with onClick handler */}
            <Button className='w-100' onClick={handleLogout}>
              <span className='icon'><MdLogout /></span>
              Logout
              <span className='arrow'><FaAngleRight /></span>
            </Button>
          </li>
        </ul>
      </div>
    </>
  );
}

export default Sidebar;
