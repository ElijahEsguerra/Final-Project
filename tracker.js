import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

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
const auth = getAuth();
const db = getFirestore();

let expenses = [];
let totalAmount = 0;

const categorySelect = document.getElementById("category-select");
const amountInput = document.getElementById("amount-input");
const dateInput = document.getElementById("date-input");
const addBtn = document.getElementById("add-btn");
const expensesTableBody = document.getElementById("expenses-table-body");
const totalAmountCell = document.getElementById("total-amount");

// Function to add expense to Firestore
async function addExpenseToFirestore(userId, category, amount, date) {
  try {
    const expensesCollection = collection(db, "expensestb"); // Use "expensestb"
    await addDoc(expensesCollection, {
      userId: userId,
      category: category,
      amount: amount,
      date: date,
    });
    console.log("Expense added to Firestore");
  } catch (error) {
    console.error("Error adding document: ", error);
  }
}

// Function to fetch expenses from Firestore
async function fetchExpensesFromFirestore(userId) {
  expenses = []; // Clear existing expenses
  totalAmount = 0;
  expensesTableBody.innerHTML = ""; // Clear the table

  try {
    const expensesCollection = collection(db, "expensestb"); // Use "expensestb"
    const q = query(expensesCollection, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
      const expenseData = doc.data();
      expenses.push({
        id: doc.id,
        category: expenseData.category,
        amount: expenseData.amount,
        date: expenseData.date,
      });

      totalAmount += expenseData.amount;
    });

    totalAmountCell.textContent = totalAmount;
    renderExpensesTable();
  } catch (error) {
    console.error("Error fetching documents: ", error);
  }
}

// Function to delete expense from Firestore
async function deleteExpenseFromFirestore(expenseId) {
  try {
    await deleteDoc(doc(db, "expensestb", expenseId)); // Use "expensestb"
    console.log("Expense deleted from Firestore");
  } catch (error) {
    console.error("Error deleting document: ", error);
  }
}

// Function to render the expenses table
function renderExpensesTable() {
  expensesTableBody.innerHTML = ""; // Clear the table before rendering

  for (const expense of expenses) {
    const newRow = expensesTableBody.insertRow();
    const categoryCell = newRow.insertCell();
    const amountCell = newRow.insertCell();
    const dateCell = newRow.insertCell();
    const deleteCell = newRow.insertCell();
    const deleteBtn = document.createElement("button");

    deleteBtn.textContent = "Delete";
    deleteBtn.classList.add("delete-btn");
    deleteBtn.addEventListener("click", function () {
      deleteExpenseFromFirestore(expense.id)
        .then(() => {
          expenses.splice(expenses.indexOf(expense), 1);
          totalAmount -= expense.amount;
          totalAmountCell.textContent = totalAmount;
          expensesTableBody.removeChild(newRow);
        })
        .catch((error) => {
          console.error("Error deleting expense:", error);
        });
    });

    categoryCell.textContent = expense.category;
    amountCell.textContent = expense.amount;
    dateCell.textContent = expense.date;
    deleteCell.appendChild(deleteBtn);
  }
}

// Event listener for adding a new expense
addBtn.addEventListener("click", function () {
  const category = categorySelect.value;
  const amount = Number(amountInput.value);
  const date = dateInput.value;

  if (category === "") {
    alert("Please select a category");
    return;
  }
  if (isNaN(amount) || amount <= 0) {
    alert("Please enter a valid amount");
    return;
  }
  if (date === "") {
    alert("Please select a date");
    return;
  }

  onAuthStateChanged(auth, (user) => {
    if (user) {
      addExpenseToFirestore(user.uid, category, amount, date)
        .then(() => {
          fetchExpensesFromFirestore(user.uid); // Refresh expenses after adding
        })
        .catch((error) => {
          console.error("Error adding expense:", error);
        });
    } else {
      console.log("User not signed in");
    }
  });
});

// Fetch initial expenses when the page loads
onAuthStateChanged(auth, (user) => {
  if (user) {
    fetchExpensesFromFirestore(user.uid);
  } else {
    console.log("User not signed in");
  }
});