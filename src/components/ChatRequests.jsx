import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
  deleteDoc,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';

export default function ChatRequests() {
  const { currentUser, loading } = useAuth();
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    if (!currentUser) return;

    const q = query(collection(db, 'chatRequests'), where('to', '==', currentUser.uid));

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const requestsData = [];
      for (const chatRequestDoc of querySnapshot.docs) {
        const requestData = { id: chatRequestDoc.id, ...chatRequestDoc.data() };
        const userDoc = await getDoc(doc(db, 'users', requestData.from));
        requestData.fromUser = userDoc.data();
        requestsData.push(requestData);
      }
      setRequests(requestsData);
    });

    return unsubscribe;
  }, [currentUser]);

  const handleAccept = async (request) => {
    try {
      // Create a new chat
      await addDoc(collection(db, 'chats'), {
        type: 'personal',
        members: [request.from, request.to],
        createdAt: serverTimestamp(),
      });

      // Delete the request
      await deleteDoc(doc(db, 'chatRequests', request.id));
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };

  const handleDecline = async (requestId) => {
    try {
      await deleteDoc(doc(db, 'chatRequests', requestId));
    } catch (error) {
      console.error('Error declining request:', error);
    }
  };

  if (loading) {
    return null;
  }

  return (
    <div className="text-black">
      {requests.length > 0 && (
        <>
          <h3 className="p-2 text-lg font-bold">Chat Requests</h3>
          <ul>
            {requests.map((request) => (
              <li key={request.id} className="flex items-center justify-between p-2">
                <p>{request.fromUser.username}</p>
                <div>
                  <button
                    onClick={() => handleAccept(request)}
                    className="px-2 py-1 mr-2 text-sm text-white bg-green-500 rounded"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleDecline(request.id)}
                    className="px-2 py-1 text-sm text-white bg-red-500 rounded"
                  >
                    Decline
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
