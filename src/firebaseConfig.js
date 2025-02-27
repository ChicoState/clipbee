import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, onSnapshot } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// replace with actual Firebase config from Firebase Console
const firebaseConfig = {
    apiKey: "AIzaSyBIQx1Zy4vaRXrqvqbhDp402TW-oNFOLE8",
    authDomain: "clipbee-ed0bd.firebaseapp.com",
    projectId: "clipbee-ed0bd",
    storageBucket: "clipbee-ed0bd.firebasestorage.app",
    messagingSenderId: "143322086892",
    appId: "1:143322086892:web:facea831808b04a2f894c9",
    measurementId: "G-MW614B5GRB"
  };

// init Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export { db, doc, setDoc, getDoc, onSnapshot };
