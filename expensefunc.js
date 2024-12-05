import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, where, writeBatch } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDx_j0WyDQlyZvNpmFYZdhzhOTu1WuQqqo",
  authDomain: "websys-final-project.firebaseapp.com",
  projectId: "websys-final-project",
  storageBucket: "websys-final-project.firebasestorage.app",
  messagingSenderId: "546674052898",
  appId: "1:546674052898:web:c7607163930bbdb92c1f7b",
  measurementId: "G-DQ99QV79HB",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

let expenses = [];
let totalAmount = 0;
const categoryInput = document.getElementById("category-input");
const amountInput = document.getElementById("amount-input");
const dateInput = document.getElementById("date-input");
const addBtn = document.getElementById("add-btn");
const expensesTableBody = document.getElementById("expenses-table-body");
const totalAmountCell = document.getElementById("total-amount");
const sortAmountBtn = document.getElementById("sort-amount-btn");
const sortDateBtn = document.getElementById("sort-date-btn");
const deleteAllBtn = document.getElementById("delete-all-btn"); // Add this

async function addExpenseToFirestore(userId, category, amount, date) {
  try {
    const expensesCollection = collection(db, "expensestb");
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

async function fetchExpensesFromFirestore(userId) {
  expenses = [];
  totalAmount = 0;
  expensesTableBody.innerHTML = "";
  try {
    const expensesCollection = collection(db, "expensestb");
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

async function deleteExpenseFromFirestore(expenseId) {
  try {
    await deleteDoc(doc(db, "expensestb", expenseId));
    console.log("Expense deleted from Firestore");
  } catch (error) {
    console.error("Error deleting document: ", error);
  }
}

function renderExpensesTable() {
  expensesTableBody.innerHTML = "";
  for (const expense of expenses) {
    const newRow = expensesTableBody.insertRow();
    const categoryCell = newRow.insertCell();
    const amountCell = newRow.insertCell();
    const dateCell = newRow.insertCell();
    const deleteCell = newRow.insertCell();
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "x";
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

addBtn.addEventListener("click", function () {
  const category = categoryInput.value;
  const amount = Number(amountInput.value);
  const date = dateInput.value;

  if (category === "") {
    alert("Please don't leave the category blank");
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
          fetchExpensesFromFirestore(user.uid);
        })
        .catch((error) => {
          console.error("Error adding expense:", error);
        });
    } else {
      console.log("User not signed in");
    }
  });
});

onAuthStateChanged(auth, (user) => {
  if (user) {
    fetchExpensesFromFirestore(user.uid);
  } else {
    console.log("User not signed in");
  }
});

let sortAmountAscending = true;
let sortDateAscending = true;

sortAmountBtn.addEventListener("click", function () {
  if (sortAmountAscending) {
    expenses.sort((a, b) => a.amount - b.amount);
  } else {
    expenses.sort((a, b) => b.amount - a.amount);
  }
  sortAmountAscending = !sortAmountAscending;
  renderExpensesTable();
});

sortDateBtn.addEventListener("click", function () {
  if (sortDateAscending) {
    expenses.sort((a, b) => new Date(a.date) - new Date(b.date));
  } else {
    expenses.sort((a, b) => new Date(b.date) - new Date(a.date));
  }
  sortDateAscending = !sortDateAscending;
  renderExpensesTable();
});

// Delete All button event listener
deleteAllBtn.addEventListener("click", () => {
  if (confirm("Are you sure you want to delete all expenses? This action cannot be undone.")) {
    deleteAllExpensesFromFirestore();
  }
});

async function deleteAllExpensesFromFirestore() {
  try {
    const userId = auth.currentUser.uid; // Assuming you have the user ID
    const expensesCollection = collection(db, "expensestb");
    const q = query(expensesCollection, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);

    // Use a write batch to delete all documents in one go
    const batch = writeBatch(db);
    querySnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    // Clear the expenses array and update the UI
    expenses = [];
    totalAmount = 0;
    totalAmountCell.textContent = totalAmount;
    renderExpensesTable();

    console.log("All expenses deleted from Firestore");
  } catch (error) {
    console.error("Error deleting all documents: ", error);
  }
}