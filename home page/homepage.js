import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, getDoc, doc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { getDatabase, ref, get, update } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-database.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyB_rXWCXqQdi6tshyUiKLiDfSKqMzqu6KQ",
  authDomain: "login-b3b32.firebaseapp.com",
  projectId: "login-b3b32",
  storageBucket: "login-b3b32.appspot.com",
  messagingSenderId: "1078150727311",
  appId: "1:1078150727311:web:42c7bde4a5482c5daad2fa",
  databaseURL: "https://login-b3b32-default-rtdb.firebaseio.com/"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const rtdb = getDatabase(app);
const storage = getStorage(app);

// Sidebar toggle
document.querySelectorAll('#sidebar .side-menu.top li a').forEach(item => {
  const li = item.parentElement;
  item.addEventListener('click', () => {
    document.querySelectorAll('#sidebar .side-menu.top li').forEach(i => i.classList.remove('active'));
    li.classList.add('active');
  });
});

// Global variable for profile image
let selectedImageFile = null;

// Auth check and data loading
onAuthStateChanged(auth, user => {
  if (user) {
    const uid = user.uid;
    const docRef = doc(db, "users", uid);
    const userRef = ref(rtdb, 'students/' + uid);

    getDoc(docRef).then(docSnap => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        document.getElementById('userName').innerText = `${userData.firstName} ${userData.lastName}`;
      }
    });

    get(userRef).then(snapshot => {
      const data = snapshot.val();
      if (!data) return;

      document.getElementById("plate").value = data.plate || "";
      document.getElementById("color").value = data.color || "";
      document.getElementById("model").value = data.model || "";
      document.getElementById("type").value = data.type || "";
      document.getElementById("studentID").innerText = data.studentID || "N/A";
      document.getElementById("studentCourse").innerText = "Course: " + (data.course || "N/A");
      document.getElementById("studentYearSection").innerText = "Year/Section: " + (data.yearSection || "N/A");

      if (data.profileImageURL) {
        document.getElementById("profilePic").src = data.profileImageURL;
      }
    });
    function Upload_files(){
      const fileInput = document.querySelector('#file')
      const file = fileInput.file[0];

      if (file){
       const storageRef = ref(storage,"uploads/" + file.name)
       const uploadTask = uploadBytesResumble(storsgeRef,file)
       const upload = document.querySelector('upload-label');

      // uploadTask.on ('state_changed' , (snapshot)=>{
      // const uploadlabel = (snapshot.bytesTransferred/snapshot.totalBytes) * 100;
      // console.log ("Upload" + Upload + "% Done");
      // })
      }else{
        console.log('no file');
      }
      
    }
    const upload_btn = document.querySelector('#uploadProfile')
    upload_btn.addEventListener('click',Upload_files)

    // Profile image selection (but not upload yet)
    document.getElementById("uploadProfile").addEventListener("change", e => {
      selectedImageFile = e.target.files[0];
      if (!selectedImageFile) return;

      const reader = new FileReader();
      reader.onload = function (event) {
        document.getElementById("profilePic").src = event.target.result;
      };
      reader.readAsDataURL(selectedImageFile);
    });

    // Save profile info and upload image
    window.saveProfile = () => {
      if (!uid) {
        alert("User not authenticated.");
        return;
      }

      const userRef = ref(rtdb, 'students/' + uid);
      const updates = {
        plate: document.getElementById("plate").value,
        color: document.getElementById("color").value,
        model: document.getElementById("model").value,
        type: document.getElementById("type").value,
        studentID: document.getElementById("studentID").innerText,
        course: document.getElementById("studentCourse").innerText.replace('Course: ', ''),
        yearSection: document.getElementById("studentYearSection").innerText.replace('Year/Section: ', ''),
        fullName: document.getElementById("userName").innerText
      };

      if (selectedImageFile) {
        const imagePath = storageRef(storage, 'UserImage/' + uid + '.jpg');

        uploadBytes(imagePath, selectedImageFile)
          .then(() => getDownloadURL(imagePath))
          .then(url => {
            updates.profileImageURL = url;
            return update(userRef, updates);
          })
          .then(() => {
            alert("Profile info and image saved.");
            selectedImageFile = null;
          })
          .catch(error => {
            console.error("Image upload error:", error);
            alert("Error uploading image: " + error.message);
          });
      } else {
        update(userRef, updates)
          .then(() => alert("Profile info saved."))
          .catch(error => {
            console.error("Profile update error:", error);
            alert("Error saving profile: " + error.message);
          });
      }
    };

    // General file upload
    document.getElementById("generalFileInput")?.addEventListener("change", e => {
      const file = e.target.files[0];
      if (!file) return;

      const fileName = `${Date.now()}_${file.name}`;
      const filePath = storageRef(storage, 'UploadedFiles/' + fileName);

      uploadBytes(filePath, file)
        .then(() => getDownloadURL(filePath))
        .then(url => {
          const fileData = {
            name: file.name,
            uploadedAt: new Date().toISOString(),
            url: url
          };
          const fileRef = ref(rtdb, 'uploadedFiles/' + uid + '/' + fileName.replace(/\./g, '_'));
          return update(fileRef, fileData);
        })
        .then(() => alert("File uploaded and saved."))
        .catch(console.error);
    });

  } else {
    window.location.href = "../login page/index.html";
  }
});

// Logout
document.getElementById('logout')?.addEventListener('click', e => {
  e.preventDefault();
  localStorage.removeItem('loggedInUserId');
  signOut(auth).then(() => {
    window.location.href = '../login page/index.html';
  });
});

