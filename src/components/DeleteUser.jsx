import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { auth, db } from '../firebase';
import { deleteUser, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { doc, deleteDoc, getDoc, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';

export default function DeleteUser() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDeleteAccount = async () => {
    if (!currentUser) {
      setError('No user is logged in.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Re-authenticate user before deletion
      const credential = EmailAuthProvider.credential(currentUser.email, password);
      await reauthenticateWithCredential(currentUser, credential);

      const batch = writeBatch(db);

      // Delete user document from Firestore
      const userDocRef = doc(db, 'users', currentUser.uid);
      batch.delete(userDocRef);

      // Attempt to delete username document (if exists)
      const userDocSnapshot = await getDoc(userDocRef);
      const username = userDocSnapshot.data()?.username;
      if (username) {
        batch.delete(doc(db, 'usernames', username));
      }

      // Delete personal chats associated with the user
      const personalChatsQuery = query(
        collection(db, 'chats'),
        where('members', 'array-contains', currentUser.uid),
        where('type', '==', 'personal')
      );
      const personalChatsSnapshot = await getDocs(personalChatsQuery);
      personalChatsSnapshot.forEach((chatDoc) => {
        batch.delete(chatDoc.ref);
      });

      // Commit all batch deletions
      await batch.commit();

      // Delete user from Firebase Auth
      await deleteUser(currentUser);

      // Redirect to login after successful deletion
      navigate('/login');
    } catch (err) {
      console.error('Error deleting account:', err);
      if (err.code === 'auth/requires-recent-login') {
        setError('Please re-enter your password to confirm deletion.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
      setPassword('');
      setShowConfirm(false);
    }
  };

  return (
    <div className="mt-8 p-4 border border-red-300 rounded-lg bg-red-50 dark:bg-red-900 dark:border-red-700">
      <h3 className="text-xl font-semibold text-red-700 dark:text-red-300 mb-4">Delete Account</h3>
      <p className="text-red-600 dark:text-red-200 mb-4">
        Deleting your account is permanent and cannot be undone. All your data will be removed.
      </p>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
        >
          Delete My Account
        </button>
      ) : (
        <div>
          <p className="text-red-600 dark:text-red-200 mb-2">
            Please enter your password to confirm:
          </p>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg mb-4 text-black"
            disabled={loading}
          />
          <div className="flex space-x-2">
            <button
              onClick={handleDeleteAccount}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Confirm Deletion'}
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded"
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
