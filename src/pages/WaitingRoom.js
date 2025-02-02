import { useEffect, useState } from 'react';
import { getFirestore, doc, onSnapshot, updateDoc, arrayUnion, getDoc, setDoc } from 'firebase/firestore'; 
import { getAuth, signOut } from 'firebase/auth';
import { useParams, useNavigate } from 'react-router-dom'; 
import "../frontend/WaitingRoom.css";
import { FaDoorOpen } from "react-icons/fa";  

function WaitingRoom() {
  const { sessionCode } = useParams(); 
  const [sessionData, setSessionData] = useState(null);
  const [isSessionStarted, setIsSessionStarted] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [userJoined, setUserJoined] = useState(false);

  const auth = getAuth();
  const db = getFirestore();
  const navigate = useNavigate(); 

  // Handle Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/'); // Redirect to home/login page
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const joinSession = async () => {
    const user = auth.currentUser;
    if (!user) {
      console.error('User is not logged in');
      return;
    }

    try {
      const sessionRef = doc(db, "sessions", sessionCode);
      const sessionDoc = await getDoc(sessionRef);

      if (sessionDoc.exists()) {
        const sessionData = sessionDoc.data();
        if (sessionData.sessionStatus === "waiting" && sessionData.participants.length < sessionData.maxParticipants) {
          await updateDoc(sessionRef, {
            participants: arrayUnion(user.uid),
          });
          console.log('User added to session ' + sessionCode);
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

  useEffect(() => {
    if (!sessionCode) return;

    const sessionRef = doc(db, "sessions", sessionCode);
    const unsubscribe = onSnapshot(sessionRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const session = docSnapshot.data();
        setSessionData(session);
        setParticipants(session.participants);

        if (session.sessionStatus === 'started') {
          setIsSessionStarted(true);
          navigate(`/nextPage/${sessionCode}`); 
        }

        if (auth.currentUser && session.participants.includes(auth.currentUser.uid)) {
          setUserJoined(true);
        }        
      }
    });

    joinSession();

    return () => unsubscribe();
  }, [sessionCode, auth, db, navigate]);

  const startRound = async () => {
    if (!sessionData || auth.currentUser?.uid !== sessionData.host) {
      console.error('Only the host can start the round');
      return;
    }

    try {
      const sessionRef = doc(db, "sessions", sessionCode);
      await setDoc(sessionRef, {
        ...sessionData,
        sessionStatus: 'started',
      }, { merge: true });

      console.log('Session started!');
      navigate(`/movieList/${sessionCode}`);
    } catch (error) {
      console.error('Error starting session:', error);
    }
  };

  return (
    <div className='waiting-room'>
      {/* Logout Button */}
      <button onClick={handleLogout} className="logout-icon-button">
        <FaDoorOpen size={24} color="#fff" />
      </button>

      {isSessionStarted ? (
        <div>
          <h2>Session Started!</h2>
          <p>The round has begun. Get ready to swipe!</p>
        </div>
      ) : (
        <div>
          <p>Waiting for host to start the round...</p>
          <label>Code: {sessionCode} </label>
          <br />
          <div className='participant-counter'>
            {participants.length}
          </div>

          {sessionData?.host === auth.currentUser?.uid && !isSessionStarted && (
            <button className='start-round-button' role='button' onClick={startRound}>Start the Round</button>
          )}
        </div>
      )}
    </div>
  );
}

export default WaitingRoom;
