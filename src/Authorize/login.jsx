import React, { useState,useEffect } from 'react';
import { Clipboard} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword,onAuthStateChanged,browserLocalPersistence } from 'firebase/auth';
import { getAuth } from 'firebase/auth';
import { app }from '../firebaseConfig'; 

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
        <div>
          <div className="h-auto w-[300px] bg-white shadow-lg">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center justify-between maw-w-1/2">
                  <Clipboard className="w-6 h-6 text-blue-500" />
                  <h3 className="text-xl font-bold">Clipbee</h3>
                </div>
              </div>
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}
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
                Don&#39;t have an account?
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