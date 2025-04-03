import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAXq5xLB3oZinSFC8fjLZxd6O9KGrXiDvE",
    authDomain: "flasher-pro.firebaseapp.com",
    projectId: "flasher-pro",
    storageBucket: "flasher-pro.firebasestorage.app",
    messagingSenderId: "228615871084",
    appId: "1:228615871084:web:2a451e2f000e8bd9445649",
    measurementId: "G-CP4CHX0LGM"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Admin user credentials
const adminEmail = 'mikebtcretriever@gmail.com';
const adminPassword = 'Gateway@523';
const adminDisplayName = 'Admin User';

// Function to create admin user
async function createAdminUser() {
  try {
    // Create user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
    
    // Update the user's profile with display name
    await updateProfile(userCredential.user, {
      displayName: adminDisplayName
    });
    
    // Create a user document in Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email: adminEmail,
      displayName: adminDisplayName,
      role: 'admin',
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp()
    });
    
    console.log('Admin user created successfully:', userCredential.user.uid);
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('Admin user already exists');
    } else {
      console.error('Error creating admin user:', error);
    }
  }
}

// Execute the function
createAdminUser()
  .then(() => {
    console.log('Script completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });
