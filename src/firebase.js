import { initializeApp } from 'firebase/app';
import {getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAwZDeffdatTU86XfKecUUTnbLcwQ-O504",
  authDomain: "preschooldbbodhiraja.firebaseapp.com",
  projectId: "preschooldbbodhiraja",
  storageBucket: "preschooldbbodhiraja.appspot.com",
  messagingSenderId: "333077417842",
  appId: "1:333077417842:web:5ac0f4ef89f64d122257eb"
};


{/*const firebaseConfig = {
  apiKey: "AIzaSyA7uA4cWXmG8qumCEYsjLuqn7_9t_PfZPU",
  authDomain: "preschooltest-caf33.firebaseapp.com",
  projectId: "preschooltest-caf33",
  storageBucket: "preschooltest-caf33.appspot.com",
  messagingSenderId: "1007007182896",
  appId: "1:1007007182896:web:282899638cf50ffd91bdf5"
};*/}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { db , auth, storage };