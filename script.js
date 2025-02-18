// --- Custom Confirmation Modal ---
var confirmCallback = null;
function openConfirmModal(message, callback) {
  confirmCallback = callback;
  document.getElementById('confirm-modal-message').textContent = message;
  document.getElementById('confirm-modal').style.display = 'flex';
}
function cancelConfirm() {
  if (confirmCallback) { confirmCallback(false); }
  document.getElementById('confirm-modal').style.display = 'none';
  confirmCallback = null;
}
function confirmYes() {
  if (confirmCallback) { confirmCallback(true); }
  document.getElementById('confirm-modal').style.display = 'none';
  confirmCallback = null;
}

// --- Clock & Calendar ---
function updateDateTime() {
  const now = new Date();
  document.getElementById('clock').textContent = now.toLocaleTimeString();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  document.getElementById('date').textContent = `${day}/${month}/${year}`;
}
setInterval(updateDateTime, 1000);
updateDateTime();
function generateCalendar() {
  const calendarEl = document.getElementById('calendar');
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentDate = now.getDate();
  const firstDay = new Date(currentYear, currentMonth, 1);
  const startingDay = firstDay.getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  let table = '<table>';
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  table += '<tr>';
  for (let dayName of daysOfWeek) { table += `<th>${dayName}</th>`; }
  table += '</tr><tr>';
  let dayOfWeekCounter = 0;
  for (let i = 0; i < startingDay; i++) { table += '<td></td>'; dayOfWeekCounter++; }
  for (let day = 1; day <= daysInMonth; day++) {
    const isCurrentDay = (day === currentDate);
    table += `<td class="${isCurrentDay ? 'current-day' : ''}">${day}</td>`;
    dayOfWeekCounter++;
    if (dayOfWeekCounter % 7 === 0 && day !== daysInMonth) { table += '</tr><tr>'; }
  }
  while (dayOfWeekCounter % 7 !== 0) { table += '<td></td>'; dayOfWeekCounter++; }
  table += '</tr></table>';
  calendarEl.innerHTML = table;
}
generateCalendar();

// --- Goals/Tasks Section ---
let currentEditElement = null;
let currentListId = '';
function openModal(listId, title) {
  currentListId = listId;
  currentEditElement = null;
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-input').value = '';
  document.getElementById('modal').style.display = 'flex';
}
function openEditModal(button) {
  const li = button.parentElement;
  const span = li.querySelector('.goal-text');
  currentEditElement = span;
  document.getElementById('modal-title').textContent = 'Edit Goal';
  document.getElementById('modal-input').value = span.textContent;
  document.getElementById('modal').style.display = 'flex';
}
function closeModal() {
  document.getElementById('modal').style.display = 'none';
  currentEditElement = null;
}
function saveGoal() {
  const input = document.getElementById('modal-input');
  const text = input.value.trim();
  if (text) {
    if (currentEditElement !== null) {
      currentEditElement.textContent = text;
      const li = currentEditElement.parentElement;
      const ul = li.parentElement;
      updateProgressForList(ul.id);
      currentEditElement = null;
    } else if (currentListId) {
      const li = document.createElement("li");
      li.innerHTML = `
        <input type="checkbox" onchange="toggleCheckbox(this)">
        <span class="goal-text">${text}</span>
        <button onclick="openEditModal(this)">Edit</button>
        <button onclick="deleteGoal(this)">Delete</button>
      `;
      document.getElementById(currentListId).appendChild(li);
      updateProgressForList(currentListId);
    }
  }
  closeModal();
}
function updateProgressForList(listId) {
  const checkboxes = document.querySelectorAll(`#${listId} li input[type="checkbox"]`);
  const total = checkboxes.length;
  let checkedCount = 0;
  checkboxes.forEach(cb => { if (cb.checked) checkedCount++; });
  const percentage = total > 0 ? Math.round((checkedCount / total) * 100) : 0;
  let spanId = "";
  switch (listId) {
    case "year-goals-list": spanId = "year-goals-progress"; break;
    case "daily-tasks-list": spanId = "daily-tasks-progress"; break;
    case "long-term-goals-list": spanId = "long-term-goals-progress"; break;
    case "short-term-goals-list": spanId = "short-term-goals-progress"; break;
  }
  if (spanId) { document.getElementById(spanId).textContent = percentage + '%'; }
}
function toggleCheckbox(checkbox) {
  const listId = checkbox.parentElement.parentElement.id;
  updateProgressForList(listId);
}
function deleteGoal(button) {
  openConfirmModal("Are you sure you want to delete?", function(confirmed) {
    if (confirmed) {
      const li = button.parentElement;
      const ul = li.parentElement;
      li.remove();
      updateProgressForList(ul.id);
    }
  });
}

// --- Financial Section ---
let currentFinancialElement = null;
function formatVND(value) {
  const number = Number(value) || 0;
  return number.toLocaleString('en-US', { maximumFractionDigits: 0 });
}
function openFinancialModal(elementId, title) {
  currentFinancialElement = document.getElementById(elementId);
  document.getElementById('financial-modal-title').textContent = title;
  document.getElementById('financial-modal-input').value = currentFinancialElement.textContent.replace(/,/g, '');
  document.getElementById('financial-modal').style.display = 'flex';
}
function closeFinancialModal() {
  document.getElementById('financial-modal').style.display = 'none';
  currentFinancialElement = null;
}
function saveFinancialValue() {
  const input = document.getElementById('financial-modal-input');
  const value = input.value.trim();
  if (value !== '') { currentFinancialElement.textContent = formatVND(value); }
  closeFinancialModal();
}

// --- Daily Expenses Section ---
function openExpenseModal() {
  document.getElementById('expense-modal').style.display = 'flex';
  document.getElementById('expense-modal-desc').value = '';
  document.getElementById('expense-modal-amount').value = '';
}
function closeExpenseModal() { document.getElementById('expense-modal').style.display = 'none'; }
function saveExpense() {
  const desc = document.getElementById('expense-modal-desc').value.trim();
  const amount = document.getElementById('expense-modal-amount').value.trim();
  if (desc && amount !== '') {
    const li = document.createElement("li");
    const formattedAmount = formatVND(amount);
    li.innerHTML = `
      <span class="expense-desc">${desc}</span>
      <span class="expense-amount">${formattedAmount}</span>
      <button onclick="deleteExpense(this)">Delete</button>
    `;
    document.getElementById('daily-expenses-list').appendChild(li);
    updateDailyExpensesTotal();
  }
  closeExpenseModal();
}
function deleteExpense(button) {
  openConfirmModal("Are you sure you want to delete?", function(confirmed) {
    if (confirmed) {
      const li = button.parentElement;
      li.remove();
      updateDailyExpensesTotal();
    }
  });
}
function updateDailyExpensesTotal() {
  const items = document.querySelectorAll('#daily-expenses-list li');
  let total = 0;
  items.forEach(item => {
    const amountText = item.querySelector('.expense-amount').textContent.replace(/,/g, '');
    total += Number(amountText);
  });
  document.getElementById('daily-expenses-total').textContent = formatVND(total);
}

// --- Monthly Expenses Section ---
let currentMonthlyExpenseDetailElement = null;
function openMonthlyExpenseModal() {
  currentMonthlyExpenseDetailElement = null;
  document.getElementById('monthly-expense-modal').style.display = 'flex';
  document.getElementById('monthly-expense-desc').value = '';
  document.getElementById('monthly-expense-amount').value = '';
}
function closeMonthlyExpenseModal() {
  document.getElementById('monthly-expense-modal').style.display = 'none';
}
function saveMonthlyExpense() {
  console.log("saveMonthlyExpense triggered");
  const desc = document.getElementById('monthly-expense-desc').value.trim();
  const amount = document.getElementById('monthly-expense-amount').value.trim();
  if (desc && amount !== '') {
    const formattedAmount = formatVND(amount);
    if (currentMonthlyExpenseDetailElement) {
      currentMonthlyExpenseDetailElement.querySelector('.expense-desc').textContent = desc;
      currentMonthlyExpenseDetailElement.querySelector('.expense-amount').textContent = formattedAmount;
      currentMonthlyExpenseDetailElement = null;
    } else {
      const li = document.createElement("li");
      li.innerHTML = `
        <span class="expense-desc">${desc}</span>: <span class="expense-amount">${formattedAmount}</span>
        <button class="icon-button" onclick="editMonthlyExpenseDetail(this)">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
            <path d="M12.146.854a.5.5 0 0 1 .708 0l2.292 2.292a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2L2 11.207V13h1.793L14 3.793 11.207 2z"/>
          </svg>
        </button>
        <button class="icon-button" onclick="deleteMonthlyExpenseDetail(this)">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
            <path d="M5.5 5.5A.5.5 0 0 1 6 5h4a.5.5 0 0 1 0 1H6a.5.5 0 0 1-.5-.5zm-1 2A.5.5 0 0 1 5 7h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5zm1 3a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1H6a.5.5 0 0 1-.5-.5zM4.118 4.5 4 4.5a1 1 0 0 0-1 1v.5h10V5.5a1 1 0 0 0-1-1l-.118.001L10.5 2.793 8.207 5.086 4.118 4.5z"/>
          </svg>
        </button>
      `;
      document.getElementById('monthly-expense-list').appendChild(li);
    }
    updateMonthlyExpensesTotal();
  }
  closeMonthlyExpenseModal();
}
function editMonthlyExpenseDetail(button) {
  const li = button.parentElement;
  currentMonthlyExpenseDetailElement = li;
  const desc = li.querySelector('.expense-desc').textContent;
  const amount = li.querySelector('.expense-amount').textContent.replace(/,/g, '');
  document.getElementById('monthly-expense-modal').style.display = 'flex';
  document.getElementById('monthly-expense-desc').value = desc;
  document.getElementById('monthly-expense-amount').value = amount;
}
function deleteMonthlyExpenseDetail(button) {
  openConfirmModal("Are you sure you want to delete?", function(confirmed) {
    if (confirmed) {
      const li = button.parentElement;
      li.remove();
      updateMonthlyExpensesTotal();
    }
  });
}
function updateMonthlyExpensesTotal() {
  const items = document.querySelectorAll('#monthly-expense-list li');
  let total = 0;
  items.forEach(item => {
    const amountText = item.querySelector('.expense-amount').textContent.replace(/,/g, '');
    total += Number(amountText);
  });
  document.getElementById('monthly-expenses-value').textContent = formatVND(total);
}
// Open Monthly Expense Details Modal (via hamburger icon)
function openMonthlyExpenseDetailsModal() {
  const expenseList = document.getElementById('monthly-expense-list');
  expenseList.style.display = 'block';
  const detailsContainer = document.getElementById('monthly-expense-details-container');
  detailsContainer.innerHTML = "";
  detailsContainer.appendChild(expenseList);
  document.getElementById('monthly-expense-details-modal').style.display = 'flex';
}
function closeMonthlyExpenseDetailsModal() {
  const expenseList = document.getElementById('monthly-expense-list');
  expenseList.style.display = 'none';
  const parent = document.getElementById('monthly-expenses');
  parent.appendChild(expenseList);
  document.getElementById('monthly-expense-details-modal').style.display = 'none';
}
