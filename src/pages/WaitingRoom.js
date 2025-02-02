import { useEffect, useState } from 'react';
import { getFirestore, doc, onSnapshot, updateDoc, arrayUnion, getDoc, setDoc } from 'firebase/firestore'; 
import { getAuth } from 'firebase/auth';

function WaitingRoom({ sessionCode }) {
  const [sessionData, setSessionData] = useState(null);
  const [isSessionStarted, setIsSessionStarted] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [userJoined, setUserJoined] = useState(false);

  const auth = getAuth();
  const db = getFirestore();

  // Function to handle user joining the session
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
          // Add user to participants array
          await updateDoc(sessionRef, {
            participants: arrayUnion(user.uid),
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

  useEffect(() => {
    // Listen for changes to the session document
    const sessionRef = doc(db, "sessions", sessionCode);

    const unsubscribe = onSnapshot(sessionRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const session = docSnapshot.data();
        setSessionData(session);

        // Update participant list and check if the session is started
        setParticipants(session.participants);

        // Check if the session is started
        if (session.sessionStatus === 'started') {
          setIsSessionStarted(true);
        }

        // Check if the current user has joined the session
        const currentUser = auth.currentUser;
        if (session.participants.includes(currentUser.uid)) {
          setUserJoined(true);
        }
      }
    });

    // Auto join the session when component mounts
    joinSession();

    return () => unsubscribe(); // Clean up listener when the component unmounts
  }, [sessionCode, auth, db]);

  // Handle starting the round (only for the host)
  const startRound = async () => {
    if (!sessionData || sessionData.host !== auth.currentUser.uid) {
      console.error('Only the host can start the round');
      return;
    }

    try {
      const sessionRef = doc(db, "sessions", sessionCode);
      await setDoc(sessionRef, {
        ...sessionData,
        sessionStatus: 'started', // Change the session status to 'started'
      }, { merge: true });

      console.log('Session started!');
    } catch (error) {
      console.error('Error starting session:', error);
    }
  };

  return (
    <div>
      {isSessionStarted ? (
        <div>
          <h2>Session Started!</h2>
          <p>The round has begun. Get ready to swipe!</p>
        </div>
      ) : (
        <div>
          {!userJoined ? (
            <p>Waiting for host to start the round...</p>
          ) : (
            <p>All participants are here! Host will start the round soon.</p>
          )}
          <p>Participants: {participants.length}/{sessionData?.maxParticipants}</p>

          <div>
            <h3>Participants:</h3>
            <ul>
              {participants.map((participantId) => (
                <li key={participantId}>
                  {/* You could fetch user data here if you need to show names */}
                  {participantId}
                </li>
              ))}
            </ul>
          </div>

          {sessionData?.host === auth.currentUser.uid && !isSessionStarted && (
            <button onClick={startRound}>Start the Round</button>
          )}
        </div>
      )}
    </div>
  );
}

export default WaitingRoom;