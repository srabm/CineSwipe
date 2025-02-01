import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {initializeApp} from 'firebase/app';
import { getAnalytics } from "firebase/analytics";
import {getAuth, onAuthStateChanged} from "firebase/auth";
import { getFirestore } from 'firebase/firestore';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
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
