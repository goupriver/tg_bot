const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, addDoc, query, where } = require('firebase/firestore');

require('dotenv').config()

const { APIKEY,
  AUTHDOMAIN,
  PROJECTID,
  STORAGEBUCKET,
  MESSAGINGSENDERID,
  APPID } = process.env

const firebaseConfig = {
  apiKey: APIKEY,
  authDomain: AUTHDOMAIN,
  projectId: PROJECTID,
  storageBucket: STORAGEBUCKET,
  messagingSenderId: MESSAGINGSENDERID,
  appId: APPID,
};

const app = initializeApp(firebaseConfig);


const db = getFirestore(app);

const addUser = async (userId) => {
  try {
    const docRef = await addDoc(collection(db, "users"), {
      userId
    });
    console.log("Document written with ID: ", docRef.id);
    return userId
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

const readUser = async (userId) => {
  const citiesRef = collection(db, "users");

  const q = query(citiesRef, where("userId", "==", String(userId)));

  const querySnapshot = await getDocs(q);
  let user = null;

  querySnapshot.forEach((doc) => {
    user = doc.data().userId
  });
  return user
}

module.exports.addUser = addUser
module.exports.readUser = readUser