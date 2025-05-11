// ✅ Firebase SDK imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, setDoc, doc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-database.js";

// ✅ Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyB_rXWCXqQdi6tshyUiKLiDfSKqMzqu6KQ",
  authDomain: "login-b3b32.firebaseapp.com",
  projectId: "login-b3b32",
  storageBucket: "login-b3b32.appspot.com",
  messagingSenderId: "1078150727311",
  appId: "1:1078150727311:web:42c7bde4a5482c5daad2fa",
  databaseURL: "https://login-b3b32-default-rtdb.firebaseio.com"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const rtdb = getDatabase(app);

// ✅ Helper to show error messages
function showMessage(message, divId) {
  const div = document.getElementById(divId);
  if (!div) return;
  div.innerText = message;
  div.style.display = 'block';
  div.style.color = 'white';
  setTimeout(() => {
    div.style.display = 'none';
  }, 5000);
}


// ✅ Wait for DOM content before adding event listener
window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("submitSignUp").addEventListener("click", async (e) => {
    e.preventDefault();

    const fName = document.getElementById("fName").value.trim();
    const lName = document.getElementById("lName").value.trim();
    const contact = document.getElementById("contact").value.trim();
    const studentID = document.getElementById("studentID").value.trim();
    const address = document.getElementById("address").value.trim();
    const course = document.getElementById("course").value.trim();
    const yearSection = document.getElementById("yearSection").value.trim();
    const email = document.getElementById("pEmail").value.trim();
    const password = document.getElementById("rPassword").value.trim();
    const confirmPassword = document.getElementById("confirmPassword").value.trim();
    const messageDiv = document.getElementById("signUpMessage");

if (!fName || !lName || !email || !password || !confirmPassword || !studentID || !contact || !address || !course || !yearSection) {
  showMessage("Please fill in all fields.", "signUpMessage");
  return;
}


    if (password !== confirmPassword) {
      showMessage("Passwords do not match.", "signUpMessage");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
  firstName: fName,
  lastName: lName,
  email,
  contact,
  address,
  studentID,
  course,
  yearSection
});

await set(ref(rtdb, "students/" + user.uid), {
  firstName: fName,
  lastName: lName,
  fullName: fName + " " + lName, 
  email,
  contact,
  address,
  studentID,
  course,
  yearSection,
  plate: "",
  color: "",
  model: "",
  type: "",
  profileImageURL: "",
  vehicleImageURL: ""
});

      localStorage.setItem("loggedInUserId", user.uid);
      window.location.href = "../login page/index.html";

    } catch (error) {
      showMessage("Error: " + error.message, "signUpMessage");
      console.error(error);
    }
  });
});
