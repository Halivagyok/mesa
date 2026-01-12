import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { FaUserAlt } from 'react-icons/fa';

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = await getDocs(collection(db, 'users'));
        const usersData = usersCollection.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setUsers(usersData);
      } catch (error) {
        console.error("Error fetching users:", error);
        setError('Failed to load users.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleToggleAdmin = async (userId, currentStatus) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        isAdmin: !currentStatus
      });
      setUsers(users.map(user => 
        user.id === userId ? { ...user, isAdmin: !currentStatus } : user
      ));
    } catch (err) {
      console.error("Error updating admin status:", err);
      setError('Failed to update admin status.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action is irreversible.')) {
      try {
        // This is a simplified deletion. In a real app, you would need a backend function
        // to delete the user from Firebase Auth and clean up all their data in Firestore.
        await deleteDoc(doc(db, 'users', userId));
        setUsers(users.filter((user) => user.id !== userId));
      } catch (error) {
        console.error("Error deleting user:", error);
        setError('Failed to delete user.');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Admin Panel</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {/* Header - Hidden on mobile */}
        <div className="hidden md:grid md:grid-cols-5 gap-4 p-4 border-b border-gray-200 dark:border-gray-700 font-bold text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-900">
          <div className="text-center">Profile Picture</div>
          <div className="text-center">Username</div>
          <div className="text-center">Email</div>
          <div className="text-center">Role</div>
          <div className="text-center">Actions</div>
        </div>

        {/* List of Users */}
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {users.map((user) => (
            <div key={user.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 items-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              {/* Profile Picture */}
              <div className="flex flex-col md:flex-row items-center justify-between md:justify-center">
                <span className="md:hidden font-semibold text-gray-600 dark:text-gray-400 mb-2">Profile Picture:</span>
                <div className="flex justify-center">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.username} className="w-10 h-10 rounded-full object-cover shadow-sm" />
                  ) : (
                    <FaUserAlt className="w-10 h-10 text-gray-400 p-1 border rounded-full" />
                  )}
                </div>
              </div>

              {/* Username */}
              <div className="flex flex-col md:block text-center">
                <span className="md:hidden font-semibold text-gray-600 dark:text-gray-400 mb-1">Username:</span>
                <span className="text-gray-800 dark:text-gray-200">{user.username}</span>
              </div>

              {/* Email */}
              <div className="flex flex-col md:block text-center break-all">
                 <span className="md:hidden font-semibold text-gray-600 dark:text-gray-400 mb-1">Email:</span>
                 <span className="text-gray-800 dark:text-gray-200">{user.email}</span>
              </div>

              {/* Role */}
              <div className="flex flex-col md:block text-center">
                <span className="md:hidden font-semibold text-gray-600 dark:text-gray-400 mb-1">Role:</span>
                {user.isAdmin ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    Admin
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                    User
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col md:flex-row items-center justify-center gap-2 mt-2 md:mt-0">
                <button
                  onClick={() => handleToggleAdmin(user.id, user.isAdmin)}
                  className={`px-3 py-1.5 text-sm font-medium text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors w-full md:w-auto ${
                    user.isAdmin 
                      ? 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-500' 
                      : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                  }`}
                >
                  {user.isAdmin ? 'Revoke Admin' : 'Make Admin'}
                </button>
                <button
                  onClick={() => handleDeleteUser(user.id)}
                  className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors w-full md:w-auto"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
