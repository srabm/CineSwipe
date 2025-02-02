import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {initializeApp} from 'firebase/app';
import { getAnalytics } from "firebase/analytics";
import {getAuth, onAuthStateChanged} from "firebase/auth";
import { getFirestore } from 'firebase/firestore';
import { collection, setDoc, doc, serverTimestamp, getDoc, updateDoc, arrayUnion } from 'firebase/firestore'; // Firebase imports

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

const firebaseConfig = {
  apiKey: "AIzaSyDpuS9bASid-IM8a0gTHS6VeZVvck5F4N8",
  authDomain: "cineswipe-d6258.firebaseapp.com",
  projectId: "cineswipe-d6258",
  storageBucket: "cineswipe-d6258.firebasestorage.app",
  messagingSenderId: "797181254442",
  appId: "1:797181254442:web:bc8b6cce3c1b4f98801c53",
  measurementId: "G-YE0F02BRJ4"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

//Detect auth state
onAuthStateChanged(auth, user => {
  if(user != null){
    console.log('logged in!');
  } else {
    console.log('No user');
  }
});


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

// Example: Create a session (for the host)
const createSession = async (userId, maxParticipants) => {
  const sessionCode = generateSessionCode(); // Function to generate unique session code
  try {
    const sessionRef = doc(collection(db, "sessions"), sessionCode);
    await setDoc(sessionRef, {
      host: userId,
      participants: [],
      maxParticipants: maxParticipants,
      sessionStatus: "waiting",
      createdAt: serverTimestamp(),
    });
    console.log('Session created with code:', sessionCode);
    return sessionCode;
  } catch (error) {
    console.error('Error creating session:', error);
  }
};

// Example: Join a session (for participants)
const joinSession = async (sessionCode, userId) => {
  try {
    const sessionRef = doc(db, "sessions", sessionCode);
    const sessionDoc = await getDoc(sessionRef);
    
    if (sessionDoc.exists()) {
      const sessionData = sessionDoc.data();
      if (sessionData.sessionStatus === "waiting" && sessionData.participants.length < sessionData.maxParticipants) {
        // Add user to participants array
        await updateDoc(sessionRef, {
          participants: arrayUnion(userId)
        });
        console.log('User added to session');
      } else {
        console.log('Session is full or has already started');
      }
    } else {
      console.log('Session does not exist');
    }
  } catch (error) {
    console.error('Error joining session:', error);
  }
};

// Generate unique session code (you can also use libraries like UUID)
const generateSessionCode = () => {
  return Math.random().toString(36).substring(2, 10); // Generates a random alphanumeric string
};

