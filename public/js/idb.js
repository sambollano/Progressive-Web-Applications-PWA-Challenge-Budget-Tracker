// CREATE VARIABLE TO HOLT DB CONNECTION
let db;
// ESTABLISH A CONNECTION TO indexedDB
const request = indexedDB.open('budget_tracker', 1);

request.onupgradeneeded = function(event) {
    
    const db = event.target.result;
    
    db.createObjectStore('budget', { autoIncrement: true });
};

request.onsuccess = function(event) {
    
    db = event.target.result;
  
    if (navigator.onLine) {

        uploadBudget();
    }
};
  
request.onerror = function(event) {
    
    console.log(event.target.errorCode);
};

function saveRecord(record) { 
    const transaction = db.transaction(['new_expense'], 'readwrite');
  
    const expenseObjectStore = transaction.objectStore('new_expense');
  
    expenseObjectStore.add(record);
}

function uploadExpense() {
    const transaction = db.transaction(['new_expense'], 'readwrite');
  
    const expenseObjectStore = transaction.objectStore('new_expense');
  
    const getAll = expenseObjectStore.getAll();
  
    
    getAll.onsuccess = function() {
        
        if (getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                Accept: 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(serverResponse => {
                if (serverResponse.message) {
                    throw new Error(serverResponse);
                }
                
                const transaction = db.transaction(['new_expense'], 'readwrite');
                
                const expenseObjectStore = transaction.objectStore('new_expense');
                
                expenseObjectStore.clear();

                alert('All saved expenses has been submitted!');
                })
                .catch(err => {
                console.log(err);
                });
            }
    };
}

window.addEventListener('online', uploadExpense);