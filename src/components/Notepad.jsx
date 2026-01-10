import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function Notepad() {
  const { currentUser } = useAuth();
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  // Fetch note on component mount and when currentUser changes
  useEffect(() => {
    if (!currentUser) {
      setNote('');
      setLoading(false);
      return;
    }

    const fetchNote = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, 'notepads', currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setNote(docSnap.data().content);
        } else {
          setNote(''); // No note found
        }
      } catch (error) {
        console.error('Error fetching note:', error);
        setSaveStatus('Error loading note.');
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [currentUser]);

  // Save note to Firestore when note content changes (with debounce)
  useEffect(() => {
    if (!currentUser || loading) return; // Don't save if no user or still loading initial note

    setSaving(true);
    setSaveStatus('Saving...');

    const handler = setTimeout(async () => {
      try {
        const docRef = doc(db, 'notepads', currentUser.uid);
        await setDoc(docRef, { content: note });
        setSaveStatus('Saved!');
      } catch (error) {
        console.error('Error saving note:', error);
        setSaveStatus('Error saving!');
      } finally {
        setSaving(false);
      }
    }, 1000); // Debounce for 1 second

    return () => {
      clearTimeout(handler);
      setSaving(false); // Clear saving status if component unmounts or note changes before debounce
    };
  }, [note, currentUser, loading]); // Depend on note, currentUser, and loading to ensure correct behavior

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-black dark:text-white">Loading notepad...</p>
      </div>
    );
  }

  return (
    <div className="p-4 pl-16 flex flex-col h-full bg-white dark:bg-gray-800 text-black dark:text-white">
      <h1 className="text-2xl font-bold mb-4">My Notepad</h1>
      <textarea
        className="flex-1 w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Start writing your notes here..."
      ></textarea>
      <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        {saveStatus} {saving && <span className="animate-pulse">...</span>}
      </div>
    </div>
  );
}
