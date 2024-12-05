import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore, getDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js"

const firebaseConfig = {
  apiKey: "AIzaSyDx_j0WyDQlyZvNpmFYZdhzhOTu1WuQqqo",
  authDomain: "websys-final-project.firebaseapp.com",
  projectId: "websys-final-project",
  storageBucket: "websys-final-project.firebasestorage.app",
  messagingSenderId: "546674052898",
  appId: "1:546674052898:web:c7607163930bbdb92c1f7b",
  measurementId: "G-DQ99QV79HB"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

onAuthStateChanged(auth, (user) => {
  const loggedInUserId = localStorage.getItem('loggedInUserId');
  if (loggedInUserId) {
    const docRef = doc(db, "users", loggedInUserId);
    getDoc(docRef)
      .then((docSnap) => {
        if (docSnap.exists()) {
          const userData = docSnap.data();
          document.getElementById('loggedUserFName').innerText = userData.firstName;
          document.getElementById('loggedUserLName').innerText = userData.lastName;
        } else {
          console.log("No user found");
        }
      })
      .catch((error) => {
        console.log("Error getting document:", error);
      });
  } else {
    console.log("User ID not found in localStorage");
  }
});

//budget function
function calculateRemainingBudget() {
    const totalExpenses = parseFloat(document.getElementById('total-amount').innerText);
    const budgetInput = document.getElementById('budget-input');
    const budget = parseFloat(budgetInput.value);

    // Check if budget is a valid number
    const remainingAmount = isNaN(budget) ? 0 : budget - totalExpenses; 

    document.getElementById('remaining-amount').innerText = remainingAmount.toFixed(2);
}

document.getElementById('budget-input').addEventListener('input', calculateRemainingBudget);

const logoutButton = document.getElementById('logout-btn');
logoutButton.addEventListener('click', () => {
  localStorage.removeItem('loggedInUserId');
  signOut(auth)
    .then(() => {
      window.location.href = 'index.html';
    })
    .catch((error) => {
      console.error('Error signing out:', error);
    });
});