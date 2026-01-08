import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
} from 'firebase/firestore';
import { FaPaperPlane } from 'react-icons/fa';

export default function Chat() {
  const { chatId } = useParams();
  const { currentUser } = useAuth();
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!chatId) return;

    const chatDocRef = doc(db, 'chats', chatId);
    const messagesColRef = collection(db, 'chats', chatId, 'messages');

    const unsubscribeChat = onSnapshot(chatDocRef, (doc) => {
      setChat({ id: doc.id, ...doc.data() });
    });

    const q = query(messagesColRef, orderBy('createdAt'));
    const unsubscribeMessages = onSnapshot(q, async (querySnapshot) => {
      const messagesData = [];
      for (const messageDoc of querySnapshot.docs) {
        const messageData = { id: messageDoc.id, ...messageDoc.data() };
        const userDoc = await getDoc(doc(db, 'users', messageData.senderId));
        messageData.sender = userDoc.data();
        messagesData.push(messageData);
      }
      setMessages(messagesData);
      setLoading(false);
    });

    return () => {
      unsubscribeChat();
      unsubscribeMessages();
    };
  }, [chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    await addDoc(collection(db, 'chats', chatId, 'messages'), {
      text: newMessage,
      senderId: currentUser.uid,
      createdAt: serverTimestamp(),
    });

    setNewMessage('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <header className="p-4 border-b">
        <h2 className="text-xl font-bold">{chat?.name || 'Chat'}</h2>
      </header>
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex mb-4 ${
              message.senderId === currentUser.uid ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`p-2 rounded-lg max-w-xs ${
                message.senderId === currentUser.uid
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-300 text-black'
              }`}
            >
              <p className="text-sm font-bold">{message.sender?.username}</p>
              <p>{message.text}</p>
              <p className="text-xs text-right opacity-75">
                {message.createdAt?.toDate().toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="flex p-4 border-t">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 p-2 border rounded-l-lg focus:outline-none"
        />
        <button
          type="submit"
          className="px-4 py-2 text-white bg-blue-500 rounded-r-lg hover:bg-blue-600"
        >
          <FaPaperPlane />
        </button>
      </form>
    </div>
  );
}
