import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';

export default function NewChatModal({ closeModal }) {
  const { currentUser } = useAuth();
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [chatType, setChatType] = useState('personal'); // 'personal' or 'group'
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    if (search.trim() === '') return;

    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('username', '>=', search), where('username', '<=', search + '\uf8ff'));
    const querySnapshot = await getDocs(q);

    const foundUsers = [];
    querySnapshot.forEach((doc) => {
      if (doc.id !== currentUser.uid) {
        foundUsers.push({ id: doc.id, ...doc.data() });
      }
    });

    if (foundUsers.length === 0) {
      setError('No users found.');
    }
    setUsers(foundUsers);
  };

  const handleCreatePersonalChat = async (userId) => {
    try {
      // Check if a chat already exists
      const chatsRef = collection(db, 'chats');
      const q = query(
        chatsRef,
        where('type', '==', 'personal'),
        where('members', 'array-contains', currentUser.uid)
      );

      const querySnapshot = await getDocs(q);
      let chatExists = false;
      querySnapshot.forEach((doc) => {
        if (doc.data().members.includes(userId)) {
          chatExists = true;
        }
      });

      if (chatExists) {
        setError('A chat with this user already exists.');
        return;
      }
      
      // Create a chat request
      await addDoc(collection(db, 'chatRequests'), {
        from: currentUser.uid,
        to: userId,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      closeModal();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleCreateGroupChat = async () => {
    if (groupName.trim() === '' || selectedUsers.length === 0) {
      setError('Please provide a group name and select at least one user.');
      return;
    }
    if (selectedUsers.length > 19) {
      setError('A group chat can have a maximum of 20 users.');
      return;
    }

    try {
      await addDoc(collection(db, 'chats'), {
        name: groupName,
        type: 'group',
        members: [...selectedUsers.map(u => u.id), currentUser.uid],
        createdAt: serverTimestamp(),
        createdBy: currentUser.uid,
      });
      closeModal();
    } catch (error) {
      setError(error.message);
    }
  };

  const toggleUserSelection = (user) => {
    if (selectedUsers.some(u => u.id === user.id)) {
      setSelectedUsers(selectedUsers.filter(u => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md p-6 bg-white rounded-lg text-black">
        <h2 className="text-xl font-bold">New Chat</h2>
        <div className="flex mt-4 space-x-4">
          <button
            onClick={() => setChatType('personal')}
            className={`px-4 py-2 rounded-lg ${chatType === 'personal' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Personal
          </button>
          <button
            onClick={() => setChatType('group')}
            className={`px-4 py-2 rounded-lg ${chatType === 'group' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Group
          </button>
        </div>

        {chatType === 'personal' && (
          <>
            <form onSubmit={handleSearch} className="flex mt-4">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by username"
                className="flex-1 p-2 border rounded-l-lg"
              />
              <button type="submit" className="px-4 py-2 text-white bg-blue-500 rounded-r-lg">
                Search
              </button>
            </form>
            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
            <div className="mt-4">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-2">
                  <p>{user.username}</p>
                  <button
                    onClick={() => handleCreatePersonalChat(user.id)}
                    className="px-3 py-1 text-sm text-white bg-green-500 rounded-lg"
                  >
                    Request
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {chatType === 'group' && (
          <>
            <div className="mt-4">
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Group Name"
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <form onSubmit={handleSearch} className="flex mt-4">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by username"
                className="flex-1 p-2 border rounded-l-lg"
              />
              <button type="submit" className="px-4 py-2 text-white bg-blue-500 rounded-r-lg">
                Search
              </button>
            </form>
            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
            <div className="mt-4 h-48 overflow-y-auto">
              {users.map((user) => (
                <div
                  key={user.id}
                  onClick={() => toggleUserSelection(user)}
                  className={`flex items-center justify-between p-2 cursor-pointer ${selectedUsers.some(u => u.id === user.id) ? 'bg-blue-100' : ''}`}
                >
                  <p>{user.username}</p>
                </div>
              ))}
            </div>
            <button
              onClick={handleCreateGroupChat}
              className="w-full mt-4 py-2 text-white bg-green-500 rounded-lg"
            >
              Create Group
            </button>
          </>
        )}

        <button onClick={closeModal} className="w-full mt-4 py-2 text-white bg-red-500 rounded-lg">
          Close
        </button>
      </div>
    </div>
  );
}
