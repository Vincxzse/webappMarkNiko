import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getDatabase, ref, get, update } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyB_rXWCXqQdi6tshyUiKLiDfSKqMzqu6KQ",
  authDomain: "login-b3b32.firebaseapp.com",
  projectId: "login-b3b32",
  storageBucket: "login-b3b32.appspot.com",
  messagingSenderId: "1078150727311",
  appId: "1:1078150727311:web:42c7bde4a5482c5daad2fa",
  databaseURL: "https://login-b3b32-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

const userSelect = document.getElementById("userSelect");
const profilePic = document.getElementById("profilePic");
const userName = document.getElementById("userName");
const studentID = document.getElementById("studentID");
const studentCourse = document.getElementById("studentCourse");
const studentYearSection = document.getElementById("studentYearSection");
const plate = document.getElementById("plate");
const color = document.getElementById("color");
const model = document.getElementById("model");
const type = document.getElementById("type");
const saveBtn = document.getElementById("saveBtn");

let selectedUID = null;

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "../login page/index.html";
    return;
  }

  const userRef = ref(db, "students/" + user.uid);
  const userSnap = await get(userRef);
  const userData = userSnap.val();

  if (!userData || userData.role !== "admin") {
    alert("Access denied. Admins only.");
    window.location.href = "../login page/index.html";
    return;
  }

  const studentsRef = ref(db, "students");
  const snapshot = await get(studentsRef);
  if (!snapshot.exists()) return;

  const data = snapshot.val();

  Object.entries(data).forEach(([uid, u]) => {
    const option = document.createElement("option");
    option.value = uid;
    option.textContent = u.fullName || uid;
    userSelect.appendChild(option);
  });

  userSelect.addEventListener("change", async (e) => {
    selectedUID = e.target.value;
    if (!selectedUID) return;

    const selectedSnap = await get(ref(db, "students/" + selectedUID));
    const selectedUser = selectedSnap.val();

    profilePic.src = selectedUser.profileImageURL || "default-avatar.png";
    userName.textContent = selectedUser.fullName || "-";
    studentID.textContent = selectedUser.studentID || "-";
    studentCourse.textContent = "Course: " + (selectedUser.course || "-");
    studentYearSection.textContent = "Year/Section: " + (selectedUser.yearSection || "-");
    plate.value = selectedUser.plate || "";
    color.value = selectedUser.color || "";
    model.value = selectedUser.model || "";
    type.value = selectedUser.type || "";

    disableFields();
  });
});

window.enableEdit = function () {
  plate.disabled = false;
  color.disabled = false;
  model.disabled = false;
  type.disabled = false;
  saveBtn.disabled = false;
};

function disableFields() {
  plate.disabled = true;
  color.disabled = true;
  model.disabled = true;
  type.disabled = true;
  saveBtn.disabled = true;
}

window.saveProfile = function () {
  if (!selectedUID) {
    alert("Please select a user.");
    return;
  }

  const updatedData = {
    plate: plate.value,
    color: color.value,
    model: model.value,
    type: type.value
  };
console.log("Saving for UID:", selectedUID);
  update(ref(db, "students/" + selectedUID), updatedData)
    .then(() => {
      alert("Profile updated successfully.");
      disableFields();
    })
    .catch((err) => {
      console.error("Update failed:", err);
      alert("Error saving profile.");
    });
};

document.getElementById("logout")?.addEventListener("click", (e) => {
  e.preventDefault();
  localStorage.removeItem("loggedInUserId");
  signOut(auth).then(() => {
    window.location.href = "../login page/index.html";
  });
});
