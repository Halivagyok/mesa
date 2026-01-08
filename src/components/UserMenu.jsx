import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { auth, db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { FaUserAlt } from 'react-icons/fa';
import ChatRequests from './ChatRequests';

export default function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'requests'
  const [hasPendingRequests, setHasPendingRequests] = useState(false);
  const { currentUser } = useAuth();
  useEffect(() => {
    if (!currentUser) return;

    const q = query(collection(db, 'chatRequests'), where('to', '==', currentUser.uid));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setHasPendingRequests(!querySnapshot.empty);
    });

    return unsubscribe;
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="relative flex items-center">
        {currentUser.photoURL ? (
          <img src={currentUser.photoURL} alt="User" className="w-8 h-8 rounded-full" />
        ) : (
          <FaUserAlt className="w-8 h-8" />
        )}
        {hasPendingRequests && (
          <span className="absolute top-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white bg-red-500" />
        )}
      </button>
      {isOpen && (
        <div className="absolute bottom-12 left-0 w-64 py-2 mt-2 bg-white rounded-md shadow-xl">
          <div className="flex border-b border-gray-200">
            <button
              className={`flex-1 py-2 text-sm font-medium ${
                activeTab === 'profile' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'
              }`}
              onClick={() => setActiveTab('profile')}
            >
              Profile
            </button>
            <button
              className={`relative flex-1 py-2 text-sm font-medium ${
                activeTab === 'requests' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'
              }`}
              onClick={() => setActiveTab('requests')}
            >
              Requests
              {hasPendingRequests && (
                <span className="absolute top-2 right-2 block h-2 w-2 rounded-full ring-1 ring-white bg-red-500" />
              )}
            </button>
          </div>
          {activeTab === 'profile' && (
            <div className="py-2">
              <button
                onClick={() => navigate('/profile')}
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
              >
                View Profile
              </button>
              <button
                onClick={handleLogout}
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          )}
          {activeTab === 'requests' && (
            <div className="py-2 max-h-60 overflow-y-auto">
              <ChatRequests />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
