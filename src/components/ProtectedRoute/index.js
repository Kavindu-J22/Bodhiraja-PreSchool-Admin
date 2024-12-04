import React from 'react';
import { Navigate } from 'react-router-dom';
import { auth } from '../../firebase'; // Adjust path to your firebase config
import { useAuthState } from 'react-firebase-hooks/auth';

const PrivateRoute = ({ children }) => {
    const [user, loading] = useAuthState(auth); // Get the current authentication state
  
    if (loading) {
      return <div>Loading...</div>; // Show a loading screen while checking auth state
    }
  
    if (!user) {
      // If no user is logged in, redirect to the login page
      return <Navigate to="/login" />;
    }
  
    // If the user is logged in, allow them to access the page
    return children;
  };
  
  export default PrivateRoute;
