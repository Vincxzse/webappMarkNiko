// ✅ Firebase SDK imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, getDoc, doc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { getDatabase, ref, get, update } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-database.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js";

// ✅ Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyB_rXWCXqQdi6tshyUiKLiDfSKqMzqu6KQ",
  authDomain: "login-b3b32.firebaseapp.com",
  projectId: "login-b3b32",
  storageBucket: "login-b3b32.appspot.com", // corrected
  messagingSenderId: "1078150727311",
  appId: "1:1078150727311:web:42c7bde4a5482c5daad2fa",
  databaseURL: "https://login-b3b32-default-rtdb.firebaseio.com" // ensure Realtime DB is enabled
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const rtdb = getDatabase(app);
const storage = getStorage(app);

// ✅ Sidebar highlight logic (unchanged)
const allSideMenu = document.querySelectorAll('#sidebar .side-menu.top li a');
allSideMenu.forEach(item => {
  const li = item.parentElement;
  item.addEventListener('click', function () {
    allSideMenu.forEach(i => i.parentElement.classList.remove('active'));
    li.classList.add('active');
  });
});

// ✅ On Auth
onAuthStateChanged(auth, user => {
  const loggedInUserId = localStorage.getItem('loggedInUserId');
  if (loggedInUserId && user) {
    // 🔹 Firestore user info
    const docRef = doc(db, "users", loggedInUserId);
    getDoc(docRef).then(docSnap => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        document.getElementById('loggedUserFName').innerText = userData.firstName;
        document.getElementById('loggedUserEmail').innerText = userData.email;
        document.getElementById('loggedUserLName').innerText = userData.lastName;
      } else {
        console.log("No Firestore user document found");
      }
    });

    // 🔹 Realtime Database vehicle/profile data
    const userRef = ref(rtdb, 'students/' + loggedInUserId);
    get(userRef).then(snapshot => {
      const data = snapshot.val();
      if (!data) return;

      document.getElementById("plate").value = data.plate || "";
      document.getElementById("color").value = data.color || "";
      document.getElementById("model").value = data.model || "";
      document.getElementById("type").value = data.type || "";

      if (data.profileImageURL) {
        document.getElementById("profilePic").src = data.profileImageURL;
      }

      if (data.vehicleImageURL) {
        document.getElementById("vehicleImagePreview").src = data.vehicleImageURL;
      }
    });

    // 🔹 Profile Image Upload
    document.getElementById("uploadProfile").addEventListener("change", e => {
      const file = e.target.files[0];
      const profilePath = storageRef(storage, 'profiles/' + loggedInUserId + '.jpg');
      uploadBytes(profilePath, file)
        .then(() => getDownloadURL(profilePath))
        .then(url => {
          update(userRef, { profileImageURL: url });
          document.getElementById("profilePic").src = url;
        });
    });

    // 🔹 Vehicle Image Upload
    document.getElementById("vehicleImageInput").addEventListener("change", e => {
      const file = e.target.files[0];
      const vehiclePath = storageRef(storage, 'vehicles/' + loggedInUserId + '.jpg');
      uploadBytes(vehiclePath, file)
        .then(() => getDownloadURL(vehiclePath))
        .then(url => {
          update(userRef, { vehicleImageURL: url });
          document.getElementById("vehicleImagePreview").src = url;
        });
    });

    // 🔹 Save vehicle profile info
    window.saveProfile = () => {
      const updates = {
        plate: document.getElementById("plate").value,
        color: document.getElementById("color").value,
        model: document.getElementById("model").value,
        type: document.getElementById("type").value
      };
      update(userRef, updates).then(() => {
        alert("Vehicle Profile updated.");
      });
    };

  } else {
    console.log("User ID not found in local storage or not logged in.");
    window.location.href = "../login page/index.html";
  }
});

// ✅ Logout button
const logoutButton = document.getElementById('logout');
logoutButton.addEventListener('click', e => {
  e.preventDefault();
  localStorage.removeItem('loggedInUserId');
  signOut(auth).then(() => {
    window.location.href = '../login page/index.html';
  }).catch(error => {
    console.error('Error Signing out:', error);
  });
});