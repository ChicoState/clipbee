import React, { useEffect, useState } from 'react';
import {Routes, Route, Navigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from './firebaseConfig';

import Login from './Authorize/login';
import Main from './Home';
import NewAccount from './Authorize/newAccount';
import Background from "./components/Background.jsx";

const auth = getAuth(app);

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // Set the user state, it will be null if not logged in
      setUser(user); 
      setLoading(false);
    });
    // Cleanup the listener on unmount
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
    <Background>
      <div>Loading...</div>
    </Background>
    );
  }
  return (
      //Routes to different pages
      <Routes>  
        <Route path="/" element={user ? <Navigate to="/main" /> : <Navigate to="/login" />} />
        <Route path = "/login" element={<Login/>}/>
        <Route path = "/main" element={<Main/>}/>
        <Route path = "/newAccount" element={<NewAccount/>}/>
      </Routes>  
  );
}

export default App;