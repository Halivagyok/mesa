import { useAuth } from '../contexts/AuthContext';
import { db, auth } from '../firebase';
import { doc, deleteDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { deleteUser } from 'firebase/auth';

export default function Profile() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action is irreversible.')) {
      try {
        // This is a simplified deletion. In a real app, you would need a backend function
        // to delete the user from Firebase Auth and clean up all their data in Firestore.
        await deleteDoc(doc(db, 'users', currentUser.uid));

        // Delete user from Firebase Auth
        const user = auth.currentUser;
        await deleteUser(user);

        navigate('/login');
      } catch (error) {
        console.error('Failed to delete account', error);
        alert('Failed to delete account. Please log out and log back in to try again.');
      }
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-2">Delete Account</h2>
        <p className="text-gray-600 mb-4">
          This action will permanently delete your account and all of your data. This is irreversible.
        </p>
        <button
          onClick={handleDeleteAccount}
          className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
        >
          Delete My Account
        </button>
      </div>
    </div>
  );
}
