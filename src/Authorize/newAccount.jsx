import React, { useState,useEffect } from 'react';
import { Clipboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAuth, createUserWithEmailAndPassword,onAuthStateChanged,browserLocalPersistence } from 'firebase/auth';
import { app }from '../firebaseConfig'; 

const auth = getAuth(app);

const NewAccount = () => {
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

    const createUserWithEmailPassword = async (e) => {
        e.preventDefault();
        setError('');
        if (!email || !password) {
          setError('Please provide email and password');
          return;
        }
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;
          console.log('Logged in user:',user);
          //listner for side panel
          chrome.runtime.sendMessage({
            type: 'SIGN_IN'
        });
          navigate('/Login')
        } catch (error) {
          console.error('Error Creating Account:', error.message);
          alert('Failed to create account.');
        }
      };

  return (
    <div className="h-auto w-[300px] bg-white shadow-lg">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center justify-between maw-w-1/2">
            <Clipboard className="w-6 h-6 text-blue-500" />
            <h3 className="text-xl font-bold">Clipbee</h3>
          </div>
        </div>
        {error && <p className="error">{error}</p>}
        <form onSubmit={createUserWithEmailPassword}>
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
          <button type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded">
            Create Account
          </button>
        </form>
        <p className="text-sm text-center mt-3">
          Already have an account? 
          <span 
            onClick={() => navigate('/login')} 
            className="text-blue-500 hover:underline cursor-pointer ml-1"
          >
            Login here
          </span>
        </p>
      </div>
    </div>
  );
}
export default NewAccount;