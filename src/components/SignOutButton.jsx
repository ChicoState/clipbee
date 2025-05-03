import React from 'react';
import { app } from '../firebaseConfig';
import { getAuth, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

export default function SignOutButton() {
  const auth = getAuth(app);
  const navigate = useNavigate();
  const handleSignOut = async () => {
    try {
      const currentWindow = await chrome.windows.getCurrent();
      await signOut(auth);
      console.log("User signed out successfully");
      //chrome.runtime.sendMessage({ type: 'SIGN_OUT' });
      chrome.runtime.sendMessage({
        target: 'service-worker',
        action: 'CLOSE_SIDEPANEL',
        windowId: currentWindow.id
      });
      //Send user back to start page
      navigate('/login');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  return (
    <button
        onClick={handleSignOut}
        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded">
        Sign Out
    </button>
  )
}