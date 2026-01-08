import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { FaUserFriends, FaUsers, FaPlus } from 'react-icons/fa';
import NewChatModal from './NewChatModal';

export default function ChatList({ onChatSelect }) {
  const { currentUser, loading } = useAuth();
  const [chats, setChats] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    const q = query(collection(db, 'chats'), where('members', 'array-contains', currentUser.uid));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const chatsData = [];
      for (const doc of querySnapshot.docs) {
        const chatData = { id: doc.id, ...doc.data() };
        if (chatData.type === 'personal') {
          const otherMemberId = chatData.members.find((memberId) => memberId !== currentUser.uid);
          if (otherMemberId) {
            const userDoc = await getDoc(doc(db, 'users', otherMemberId));
            if (userDoc.exists()) {
              chatData.otherUser = userDoc.data();
            }
          }
        }
        chatsData.push(chatData);
      }
      setChats(chatsData);
    });

    return unsubscribe;
  }, [currentUser]);

  if (loading) {
    return <p className="p-4 text-sm text-gray-400">Loading...</p>;
  }

  return (
    <div className="overflow-y-auto">
      <div className="flex items-center justify-between p-2">
        <h3 className="text-lg font-bold">Chats</h3>
        <button onClick={() => setShowModal(true)} className="p-2 text-white">
          <FaPlus />
        </button>
      </div>
      {chats.length === 0 ? (
        <p className="p-4 text-sm text-gray-400">No chats yet.</p>
      ) : (
        <ul>
          {chats.map((chat) => (
            <li key={chat.id}>
              <Link
                to={`/chat/${chat.id}`}
                className="flex items-center p-2 text-white rounded-md hover:bg-gray-700"
                onClick={onChatSelect}
              >
                {chat.type === 'group' ? (
                  <FaUsers className="mr-2" />
                ) : (
                  chat.otherUser?.photoURL ? (
                    <img src={chat.otherUser.photoURL} alt="User" className="w-6 h-6 rounded-full mr-2" />
                  ) : (
                    <FaUserFriends className="mr-2" />
                  )
                )}
                <span className="flex-1 w-0 truncate">
                  {chat.type === 'personal' && chat.otherUser
                    ? chat.otherUser.username
                    : chat.name || 'Personal Chat'}
                </span>
                {chat.type === 'group' && (
                  <span className="text-xs text-gray-400">{chat.members.length}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
      {showModal && <NewChatModal closeModal={() => setShowModal(false)} />}
    </div>
  );
}
