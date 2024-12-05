import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import {getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import{getFirestore, setDoc, doc} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js"
 
const firebaseConfig = {
    apiKey: "AIzaSyDx_j0WyDQlyZvNpmFYZdhzhOTu1WuQqqo",
    authDomain: "websys-final-project.firebaseapp.com",
    projectId: "websys-final-project",
    storageBucket: "websys-final-project.firebasestorage.app",
    messagingSenderId: "546674052898",
    appId: "1:546674052898:web:c7607163930bbdb92c1f7b",
    measurementId: "G-DQ99QV79HB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

function showMessage(message, divId){
    var messageDiv=document.getElementById(divId);
    messageDiv.style.display="block";
    messageDiv.innerHTML=message;
    messageDiv.style.opacity=1;
    setTimeout(function(){
        messageDiv.style.opacity=0;
    },5000);
}

 // Sign up process
const signUp=document.getElementById('submitSignUp');
signUp.addEventListener('click', (event)=>{
    event.preventDefault();
    const email=document.getElementById('rEmail').value;
    const password=document.getElementById('rPassword').value;
    const firstName=document.getElementById('fName').value;
    const lastName=document.getElementById('lName').value;

    const auth=getAuth();
    const db=getFirestore();

    createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential)=>{
        const user=userCredential.user;
        const userData={
            email: email,
            firstName: firstName,
            lastName:lastName
        };
        showMessage('Account Created Successfully', 'signUpMessage');
        const docRef=doc(db, "users", user.uid);
        setDoc(docRef,userData)
        .then(()=>{
            window.location.href='index.html';
        })
        .catch((error)=>{
            console.error("Error writing document", error);

        });
    })
    .catch((error)=>{
        const errorCode=error.code;
        if(errorCode=='auth/email-already-in-use'){
            showMessage('Email address already exists', 'signUpMessage');
        }
        else{
            showMessage('Unable to create user', 'signUpMessage');
        }
    })
});


// Sign in process
const signIn=document.getElementById('submitSignIn');
signIn.addEventListener('click', (event)=>{
    event.preventDefault();
    const email=document.getElementById('email').value;
    const password=document.getElementById('password').value;
    const auth=getAuth();

    signInWithEmailAndPassword(auth, email,password)
    .then((userCredential)=>{
        showMessage('login is successful', 'signInMessage');
        const user=userCredential.user;
        localStorage.setItem('loggedInUserId', user.uid);
        window.location.href='homepage.html';
    })
    .catch((error)=>{
        const errorCode=error.code;
        if(errorCode==='auth/invalid-credential'){
            showMessage('Incorrect Email or Password', 'signInMessage');
        }
        else{
            showMessage('Account does not Exist', 'signInMessage');
        }
    })
})

 //recover password
const recoverPasswordLink = document.querySelector('.recover a'); // Select the link

recoverPasswordLink.addEventListener('click', (event) => {
    event.preventDefault(); 

    const email = document.getElementById('email').value; // Get the email input

    const auth = getAuth();
    sendPasswordResetEmail(auth, email)
        .then(() => {
            showMessage('Password reset email sent', 'signInMessage'); 
        })
        .catch((error) => {
            const errorCode = error.code;
            let errorMessage = 'Error sending password reset email';

            if (errorCode === 'auth/user-not-found') {
                errorMessage = 'User not found';
            } 
            showMessage(errorMessage, 'signInMessage'); 
        });
});