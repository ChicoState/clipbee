import React, { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword,onAuthStateChanged,browserLocalPersistence } from 'firebase/auth';
import { getAuth } from 'firebase/auth';

import { app }from '../firebaseConfig';
import Header from '../components/Header.jsx'
import Background from "../components/Background.jsx";


const auth = getAuth(app);

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
      auth.setPersistence(browserLocalPersistence)
        .then(() => {
          // Listen to auth state changes
          onAuthStateChanged(auth, (user) => {
            if (user) {
              chrome.runtime.sendMessage({
                type: 'SIGN_IN'
            });
              // Redirect to home if the user is already logged in
              navigate('/main'); 
            }
          });
        })
        .catch((error) => {
          console.error('Error setting persistence:', error);
        });
    }, [navigate]);

    
    //Sign in user using email and password
    const signInWithEmailPassword = async (e) => {
      e.preventDefault();
      setError('');
      if (!email || !password) {
        setError('Please provide email and password');
        return;
      }
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
          console.log('Logged in user:', user);
          navigate('/main');
         } catch (error) {
          console.error('Error signing in:', error.message);
          setError('Failed to log in. Please check your credentials.');
        }
    };

        return (
        <Background>
              <div className="flex justify-between items-center mb-4">
                <Header />
              </div>
              {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
              )}
              <form onSubmit={signInWithEmailPassword} className="flex flex-col items-center justify-center">
                <input 
                  type="email" 
                  placeholder="Email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required
                  className="p-2 mb-2 border bg-white hover:bg-gray-100 border-gray-300 rounded"
                />
                <input 
                type="password" 
                placeholder="Password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required
                className="p-2 mb-2 border bg-white hover:bg-gray-100 border-gray-300 rounded"
                />
                <button 
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-1.5 border border-blue-700 rounded">
                Log In
                </button>
              </form>
              <p className="text-sm text-center mt-3">
                Don&#39;t have an account?
                <span 
                  onClick={() => navigate('/newAccount')} 
                  className="text-blue-500 hover:underline cursor-pointer ml-1"
                >
                  Create Account
                </span>
              </p>
        </Background>
      );
}
export default Login;