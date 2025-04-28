import React, { useState,useEffect } from 'react';
import { app }from '../firebaseConfig'; 
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject,listAll} from "firebase/storage";
import {setDoc,doc,addDoc, getFirestore,collection, getDocs, deleteDoc} from 'firebase/firestore';

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);


//COnfirm that user is logged in
function getCurrentUser() {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      unsubscribe();
      resolve(user);
    }, reject);
  });
}


//Push files into firebase Storage then store file info into
//firestore(file name and the downloadUrl) 
export async function pushFilestoStorage(file_,folder) {
  const user = auth.currentUser;
  const userId = user.uid; 
  
  if (!user) {
    console.log("No user signed in");
    return;
  }
  for (const file of file_) {
    try {
      //Path to file in storage
      const filePath = `users/${userId}/${folder}/${file.name}`; 
      const Storageref = ref(storage,filePath);
      const snapshot = await uploadBytes(Storageref, file);
      console.log("Uploaded a file:", snapshot.metadata.name);
      
      //Download url 
      const downloadURL = await getDownloadURL(Storageref);
      console.log("Download URL:", downloadURL);

      //Storing in User bucket into respective folder
      const folderRef = doc(db, 'Users', userId, folder, file.name);
      //All data from file is stores in its own path
      //Add below to add more data to files doc
      await setDoc(folderRef, {
        downloadUrl: downloadURL,
        fileName: file.name,
        uploadedAt: new Date(),
      });
      console.log("Download URL saved to Firestore");
    } catch (error) {
      console.error("Upload failed:", error);
    }
  }
}

export async function displayFiles(folder) {
  const items=[];//Store files
  
  const user = await getCurrentUser();
  if (!user) {
    console.log("No user signed in");
    return [];
  }
  const userId = user.uid; 
  try{
  //get the reference to the Active Folder
    const fileref = collection(db,'Users',userId,folder);
    const filesnap = await getDocs(fileref);
    
    filesnap.forEach((doc) => {
      console.log("File Name12: ", doc.data().downloadUrl);
      items.push({
        // fallback to doc ID if no name
        file_name: doc.data().fileName || doc.id, 
        // add download URL 
        download: doc.data().downloadUrl || null
      });
      });
}catch(error) {
  console.error("Error displaying files",error);
}
return items;
}

//Add User to firestore Using User id
export async function createUserstorage(email,id) {
    
    try{
      if (!email || !id) {
        throw new Error("Invalid user info passed to createUserstorage");
      }
      //Where Users would be located.
      const userRef = doc(db, 'Users', id);
      await setDoc(userRef, {
          email: email,
          userId: id,
          createdAt: new Date(),
    });
      console.log('Document written with ID:', id);
    } catch(e){
      console.error('Error adding document:',e.message, e.stack);
    }
    
}

//Remove the files from storage 
export async function removeFilefromStorage(fileName,folder) {
  const user = await getCurrentUser();
  const userId = user.uid; 
  if (!user) {
    console.log("No user signed in");
    return ;
  }
  //get the file path to delete 
  const fileRef = ref(storage, `users/${userId}/${folder}/${fileName}`);
  try{
  deleteObject(fileRef)
      console.log('File deleted successfully');
  }
    catch(error) {
      console.error('Error deleting file:', error);
    };
}

export async function removeFilefromFirestore(fileName,folder) {
  const user = await getCurrentUser();
  const userId = user.uid; 
  if (!user) {
    console.log("No user signed in");
    return ;
  }
  try{
    await deleteDoc(doc(db, 'Users', userId, folder, fileName));
  }catch(error){
    console.error("Error removing file from firestore");
  }
}
//Call to delete the whole folder with all the files
//will delete the folder and all contents in storage
//then in firestore
export async function deleteFolderContents(folderName) {
  const user = await getCurrentUser();
  if (!user) {
    console.log("No user signed in");
    return ;
  }
  const userId = user.uid; 
  //Storage path
  const folderRef = ref(storage, `users/${userId}/${folderName}`);
  try {
    const result = await listAll(folderRef);
    // Delete all files in the folder
    const deleteFilePromises = result.items.map((itemRef) => deleteObject(itemRef));
    await Promise.all(deleteFilePromises);

    console.log(`Successfully deleted all files in folder: ${folderRef}`);
  } catch (error) {
    console.error("Error deleting folder contents:", error.message);
  }


//Firestore path
  const filesRef = collection(db, 'Users', userId, folderName);
  const snapshot = await getDocs(filesRef);
  try{
    // Delete all files from firestore(documents)
    const deleteFilePromises = snapshot.docs.map(fileDoc =>
      deleteDoc(doc(db, 'Users', userId, folderName, fileDoc.id))
    );
    await Promise.all(deleteFilePromises);
  }catch(error) {
    console.log("Cannot delete all files");
  }

    // If it's not the default folder, optionally delete the folder document
  if (folderName !== 'Default') {
    // This assumes the folder itself is a document (not a collection name)
    const folderDocRef = doc(db, 'Users', userId, folderName);
    try {
      await deleteDoc(folderDocRef);
      console.log(`Deleted folder "${folderName}" for user ${userId}`);
    } catch (error) {
      console.warn(`Couldn't delete folder "${folderName}":`, error.message);
    }
  } else {
        console.log(`Cleared all files in "Default" folder for user ${userId}, but kept the folder.`);
    }
}

export default {createUserstorage,pushFilestoStorage,displayFiles,removeFilefromStorage,removeFilefromFirestore,deleteFolderContents};