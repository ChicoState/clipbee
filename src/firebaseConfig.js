import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, onSnapshot } from "firebase/firestore";
// Import isSupported to check if analytics is supported
import { getAnalytics, isSupported } from "firebase/analytics";
import { getStorage } from "firebase/storage";

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

// initate Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const db = getFirestore(app);
//Intiate firestore for storage
//const firestore = firebase.firestore();


// Only initialize analytics if supported in this environment
let analytics = null;
isSupported().then(supported => {
    if (supported) {
        analytics = getAnalytics(app);
    } else {
        console.log("Firebase Analytics is not supported in this environment");
    }
}).catch(error => {
    console.error("Error checking analytics support:", error);
});



export { storage,app,db,setDoc,getDoc,onSnapshot,doc};
