import React, { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import '../frontend/AuthPage.css'; // Ensure CSS is linked
import CineSwipeLogo from '../images/Cineswipe.png'; // Import the logo

const AuthPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const navigate = useNavigate();

  const auth = getAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log("Logged in successfully!");
      setError('');
      navigate('/home');
    } catch (err) {
      setError('Error: ' + err.message);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      console.log("Signed up successfully!");
      setError('');
      navigate('/home');
    } catch (err) {
      setError('Error: ' + err.message);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email to reset password.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      console.log("Password reset email sent!");
      alert("Password reset email sent! Check your inbox.");
      setError('');
    } catch (err) {
      setError('Error: ' + err.message);
    }
  };

  return (
    <div className="auth-page">
      {/* CineSwipe Logo Outside the Login Box */}
      <img src={CineSwipeLogo} alt="CineSwipe Logo" className="logo" /> 

      <div className="auth-container">
        <h1>{isLogin ? 'Login' : 'Sign Up'}</h1>
        <form onSubmit={isLogin ? handleLogin : handleSignup}>
          <div>
            <label>Email: </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <div>
            <label>Password: </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit">{isLogin ? 'Login' : 'Sign Up'}</button>
        </form>

        {isLogin && !isForgotPassword && (
          <p className="link-text" onClick={() => setIsForgotPassword(true)}>
            Forgot Password?
          </p>
        )}

        {isForgotPassword && (
          <div>
            <p>Enter your email to receive a password reset link.</p>
            <button onClick={handleForgotPassword}>Send Password Reset Link</button>
            <p className="link-text" onClick={() => setIsForgotPassword(false)}>
              Back to Login
            </p>
          </div>
        )}

        <p>
          {isLogin ? 'New to the app? ' : 'Already have an account? '}
          <span
            className="link-text"
            onClick={() => setIsLogin((prevState) => !prevState)}
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </span>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
