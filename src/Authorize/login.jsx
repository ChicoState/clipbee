import React, { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword,onAuthStateChanged,browserLocalPersistence } from 'firebase/auth';
import { getAuth } from 'firebase/auth';

import { app }from '../firebaseConfig';
import Header from '../components/Header.jsx'


const auth = getAuth(app);

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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
      if (!email || !password) {
        alert('Please provide email and password');
        return;
      }
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
          console.log('Logged in user:', user);
          navigate('/main');
         } catch (error) {
          console.error('Error signing in:', error.message);
          alert('Failed to log in. Please check your credentials.');
        }
    };

        return (
        <div>
          <div className="h-auto w-[300px] bg-white shadow-lg">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <Header />
              </div>
              <form onSubmit={signInWithEmailPassword}>
                <input 
                  type="email" 
                  placeholder="Email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                />
                <input 
                type="password" 
                placeholder="Password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                />
                <button 
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded">
                Log In
                </button>
              </form>
              <p className="text-sm text-center mt-3">
                Don't have an account? 
                <span 
                  onClick={() => navigate('/newAccount')} 
                  className="text-blue-500 hover:underline cursor-pointer ml-1"
                >
                  Create Account
                </span>
              </p>
            </div>
          </div>
        </div>
      );
}
export default Login;