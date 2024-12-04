import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase'; // Adjust the path to your firebase config file

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Effect to monitor authentication state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        navigate('/dashboard');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Handle login form submission
  const handleLogin = (e) => {
    e.preventDefault();
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log('User logged in:', userCredential.user);
        navigate('/dashboard');
      })
      .catch((error) => {
        setError(`Login failed: ${error.message}`);
        console.error('Login error:', error.message);
      });
  };

  // Handle password reset form submission
  const handleForgotPassword = (e) => {
    e.preventDefault();
    sendPasswordResetEmail(auth, resetEmail)
      .then(() => {
        alert('Password reset email sent! Please check your inbox.');
        setIsResettingPassword(false);
        setResetEmail('');
      })
      .catch((error) => {
        setError(`Error resetting password: ${error.message}`);
        console.error('Password reset error:', error.message);
      });
  };

  return (
    <div className="login-container" style={styles.container}>
      {isResettingPassword ? (
        <form className="reset-form" onSubmit={handleForgotPassword} style={styles.form}>
          <h2 style={styles.heading}>Reset Password</h2>
          {error && <p className="error-message" style={styles.errorMessage}>{error}</p>}
  
          <div className="form-group" style={styles.formGroup}>
            <label htmlFor="reset-email" style={styles.label}>Enter your email address</label>
            <input
              type="email"
              id="reset-email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              required
              style={styles.input}
            />
          </div>
  
          <button type="submit" className="reset-button" style={styles.button}>Send Reset Email</button>
          <button
            type="button"
            className="login-toggle"
            onClick={() => setIsResettingPassword(false)}
            style={styles.toggleButton}
          >
            Back to Login
          </button>
        </form>
      ) : (
        <form className="login-form" onSubmit={handleLogin} style={styles.form}>
          <h2 style={styles.heading}>Admin Login</h2>
  
          {error && <p className="error-message" style={styles.errorMessage}>{error}</p>}
  
          <div className="form-group" style={styles.formGroup}>
            <label htmlFor="email" style={styles.label}>Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
            />
          </div>
  
          <div className="form-group" style={styles.formGroup}>
            <label htmlFor="password" style={styles.label}>Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
            />
          </div>
  
          <button type="submit" className="login-button" style={styles.button}>Login</button>
  
          <p className="forgot-password" onClick={() => setIsResettingPassword(true)} style={styles.forgotPassword}>
            Forgot Password?
          </p>
  
          <p className="security-message" style={styles.securityMessage}>For security purposes, provide the admin credentials again.</p>
          
          <button
            className="back-to-home"
            style={styles.backButton}
            onClick={() => window.location.href = "http://localhost:3000/"}
          >
            <i className="fas fa-home" style={styles.homeIcon}></i> Back to Home
          </button>
        </form>
      )}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#E9F7EF',
    padding: '20px',
  },
  form: {
    backgroundColor: '#FFFFFF',
    padding: '40px',
    borderRadius: '16px',
    boxShadow: '0 8px 40px rgba(0, 0, 0, 0.2)',
    width: '400px',
    textAlign: 'center',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    overflow: 'hidden',
  },
  heading: {
    fontSize: '32px',
    color: '#27AE60',
    marginBottom: '24px',
    fontWeight: '700',
    letterSpacing: '1px',
  },
  formGroup: {
    marginBottom: '22px',
    position: 'relative',
  },
  label: {
    fontSize: '14px',
    color: '#27AE60',
    position: 'absolute',
    top: '-12px',
    left: '12px',
    transition: '0.3s ease',
    fontWeight: '600',
  },
  input: {
    width: '100%',
    padding: '14px 18px',
    border: '1px solid #BDC3C7',
    borderRadius: '8px',
    fontSize: '16px',
    color: '#2C3E50',
    backgroundColor: '#ECF0F1',
    transition: 'all 0.3s ease',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: '16px',
    fontSize: '18px',
    color: '#fff',
    backgroundColor: '#27AE60',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease, transform 0.3s ease',
    marginTop: '20px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
  },
  toggleButton: {
    width: '100%',
    padding: '16px',
    fontSize: '18px',
    color: '#fff',
    backgroundColor: '#E74C3C',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease, transform 0.3s ease',
    marginTop: '12px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
  },
  forgotPassword: {
    color: '#27AE60',
    fontSize: '16px',
    cursor: 'pointer',
    marginTop: '15px',
    textDecoration: 'underline',
    transition: 'color 0.2s ease',
  },
  securityMessage: {
    fontSize: '14px',
    color: '#E67E22',
    fontWeight: '600',
    marginTop: '20px',
  },
  errorMessage: {
    color: '#E74C3C',
    fontSize: '14px',
    marginTop: '10px',
    marginBottom: '20px',
    fontWeight: '600',
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2C3E50',
    padding: '14px 20px',
    fontSize: '16px',
    color: '#fff',
    borderRadius: '10px',
    marginTop: '20px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  homeIcon: {
    marginRight: '8px',
  },
};

// // Hover effect for the buttons
// styles.button:hover = {
//   backgroundColor: '#219150',
//   transform: 'scale(1.05)',
// };

// styles.toggleButton:hover = {
//   backgroundColor: '#D35400',
//   transform: 'scale(1.05)',
// };

// styles.forgotPassword:hover = {
//   color: '#1ABC9C',
// };
  
export default Login;
