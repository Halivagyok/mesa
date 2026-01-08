import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const { currentUser } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <h1 className="text-4xl font-bold mb-4">Welcome to Mesa!</h1>
      <p className="text-lg text-gray-600 mb-8">
        A modern chat application for you and your friends.
      </p>
      {!currentUser && (
        <div className="space-x-4">
          <Link
            to="/login"
            className="px-6 py-2 text-lg font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="px-6 py-2 text-lg font-semibold text-indigo-600 bg-white border border-indigo-600 rounded-lg hover:bg-gray-100"
          >
            Sign Up
          </Link>
        </div>
      )}
    </div>
  );
}
