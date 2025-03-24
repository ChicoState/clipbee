//Get the user id to get the correct firestore data
// import React, { useEffect, useState } from 'react';
// import { firestore } from '../firebaseConfig';
// import { getAuth } from 'firebase/auth';
// import { app }from '../firebaseConfig'; 


// const userProfile = () =>{
//     const [user, setUser] = useState(null);

//     // Get the current authenticated user
//     useEffect(() => {
//       const unsubscribe = auth.onAuthStateChanged(setUser);
//       return () => unsubscribe();
//     }, []);
  
//     // Get the current user UID
//     const getUserId = () => {
//       if (user) {
//         return user.uid;
//       } else {
//         return null; // User is not authenticated
//       }
//     };
  
//     useEffect(() => {
//         if (userId) {
//           // Fetch user data from Firestore using userId
//           const fetchUserData = async () => {
//             try {
//               const docRef = firestore.collection('users').doc(userId);
//               const doc = await docRef.get();
//               if (doc.exists) {
//                 console.log('User data:', doc.data());
//               } else {
//                 console.log('No user found in Firestore');
//               }
//             } catch (error) {
//               console.error('Error fetching user data:', error);
//             }
//           };
    
//           fetchUserData();
//         }
//       }, [userId]);
// }
// export default userProfile;