// editprofile.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut, deleteUser } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

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

function showMessage(message, divId) {
    var messageDiv = document.getElementById(divId);
    messageDiv.style.display = "block";
    messageDiv.innerHTML = message;
    messageDiv.style.opacity = 1;
    setTimeout(function () {
        messageDiv.style.opacity = 0;
    }, 5000);
}

const submitEdits = document.getElementById('submitProfileEdits');
submitEdits.addEventListener('click', (event) => {
    event.preventDefault();
    const newFirstName = document.getElementById('newFName').value;
    const newLastName = document.getElementById('newLName').value;

    onAuthStateChanged(auth, (user) => {
        if (user) {
            const userId = user.uid;
            const docRef = doc(db, "users", userId);

            updateDoc(docRef, {
                firstName: newFirstName,
                lastName: newLastName
            })
            .then(() => {
                showMessage('Profile updated successfully', 'editProfileMessage');
            })
            .catch((error) => {
                console.error("Error updating profile: ", error);
                showMessage('Error updating profile', 'editProfileMessage');
            });
        } else {
            console.log("User not signed in");
        }
    });
});

const logoutButton = document.getElementById('logout');
logoutButton.addEventListener('click', () => {
    localStorage.removeItem('loggedInUserId');
    signOut(auth)
    .then(() => {
        window.location.href = 'index.html';
    })
    .catch((error) => {
        console.error('Error Signing out:', error);
    });
});

const deleteProfileButton = document.getElementById('deleteProfile');
deleteProfileButton.addEventListener('click', () => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            if (confirm("Are you sure you want to delete your profile? This action cannot be undone.")) {
                const userId = user.uid;
                const userRef = doc(db, "users", userId);

                deleteDoc(userRef)
                    .then(() => {
                        deleteUser(user)
                            .then(() => {
                                console.log('User profile deleted successfully!');
                                showMessage('Profile deleted successfully', 'editProfileMessage');
                                localStorage.removeItem('loggedInUserId');
                                window.location.href = 'index.html';
                            })
                            .catch((error) => {
                                console.error("Error deleting user account:", error);
                                showMessage('Error deleting profile', 'editProfileMessage');
                            });
                    })
                    .catch((error) => {
                        console.error("Error deleting user data:", error);
                        showMessage('Error deleting profile', 'editProfileMessage');
                    });
            }
        } else {
            console.log("User not signed in");
        }
    });
});