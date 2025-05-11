import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js";
import { initializeApp } from "firebase-app.js";
import {getStorage} from "firebase/storage"; 

// ✅ Your Firebase config (replace with real one)
const firebaseConfig = {
  apiKey: "AIzaSyREAL_KEY",
  authDomain: "database-ac117.firebaseapp.com",
  projectId: "database-ac117",
  storageBucket: "database-ac117.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

// 🔗 DOM Elements
const uploadInput = document.getElementById("uploadInput");
const preview = document.getElementById("preview");
const saveBtn = document.getElementById("saveBtn");
const downloadLink = document.getElementById("downloadLink");

let selectedFile = null;

// 🖼 Preview the image
uploadInput.addEventListener("change", (e) => {
  selectedFile = e.target.files[0];
  if (!selectedFile) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    preview.src = event.target.result;
  };
  reader.readAsDataURL(selectedFile);
});

// ⬆ Upload to Firebase Storage
saveBtn.addEventListener("click", () => {
  if (!selectedFile) {
    alert("Please select an image.");
    return;
  }

  const filename = `UserImage/${Date.now()}-${selectedFile.name}`;
  const imageRef = ref(storage, filename);

  uploadBytes(imageRef, selectedFile)
    .then(snapshot => getDownloadURL(snapshot.ref))
    .then(url => {
      alert("Upload successful!");
      downloadLink.innerHTML = `<strong>Download URL:</strong><br><a href="${url}" target="_blank">${url}</a>`;
    })
    .catch(error => {
      console.error("Upload failed:", error);
      alert("Upload failed. Check console.");
    });
});