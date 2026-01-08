import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../firebase';
import { FaUserAlt } from 'react-icons/fa';

export default function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

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
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center">
        {currentUser.photoURL ? (
          <img src={currentUser.photoURL} alt="User" className="w-8 h-8 rounded-full" />
        ) : (
          <FaUserAlt className="w-8 h-8" />
        )}
      </button>
      {isOpen && (
        <div className="absolute bottom-12 left-0 w-48 py-2 mt-2 bg-white rounded-md shadow-xl">
          <button
            onClick={() => navigate('/profile')}
            className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
          >
            Profile
          </button>
          <button
            onClick={handleLogout}
            className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
