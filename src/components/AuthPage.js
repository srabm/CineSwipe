import React, { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const AuthPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const auth = getAuth();

  // Email/Password login
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log("Logged in successfully!");
      setError('');  // Clear error on successful login
      navigate('./home');
    } catch (err) {
      setError('Error: ' + err.message);  // Show error message if login fails
    }
  };

  // Handle Signup
  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      console.log("Signed up successfully!");
      setError(''); // Clear error message on successful signup
    } catch (err) {
      setError('Error: ' + err.message);
    }
  };


  return (
    <div>
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
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">{isLogin ? 'Login' : 'Sign Up'}</button>
      </form>
      <p>
        {isLogin ? 'New to the app? ' : 'Already have an account? '}
        <span
          style={{ color: 'blue', cursor: 'pointer' }}
          onClick={() => setIsLogin((prevState) => !prevState)} // Toggle between login/signup
        >
          {isLogin ? 'Sign Up' : 'Login'}
        </span>
      </p>
    </div>
  );
};

export default AuthPage;
