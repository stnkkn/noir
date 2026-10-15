

function showPage(pageName, button) {
    document.getElementById("attendance").style.display = "none";
    document.getElementById("money").style.display = "none";
    document.getElementById("todo").style.display = "none";

    document.getElementById(pageName).style.display = "block";

    document.querySelectorAll(".menu-button").forEach(function(item) {
        item.classList.remove("active");
    });

    if (button) {
        button.classList.add("active");
    }
}


let subjects = JSON.parse(localStorage.getItem("noirSubjects")) || [];

function addSubject() {
    const name = document.getElementById("subjectName").value;
    const limit = Number(document.getElementById("absenceLimit").value);
    const count = Number(document.getElementById("absenceCount").value);

    if (name === "" || document.getElementById("absenceLimit").value === "" ||
        document.getElementById("absenceCount").value === "") {
        alert("すべての項目を入力してね！");
        return;
    }

    if (limit < 0 || count < 0 || !Number.isInteger(limit) ||
        !Number.isInteger(count)) {
        alert("回数は0以上の整数で入力してね！");
        return;
    }

    subjects.push({
        name: name,
        limit: limit,
        count: count
    });

    saveSubjects();
    showSubjects();

    document.getElementById("subjectName").value = "";
    document.getElementById("absenceLimit").value = "";
    document.getElementById("absenceCount").value = "0";
}

function showSubjects() {
    const list = document.getElementById("subjectList");
    list.innerHTML = "";

    subjects.forEach(function(subject, index) {
        const remaining = subject.limit - subject.count;

let cells = "";

for (let i = 0; i < subject.limit; i++) {
    if (i < subject.count) {
        cells += '<span class="absence-cell used"></span>';
    } else {
        cells += '<span class="absence-cell"></span>';
    }
}
        list.innerHTML += `
            <div class="subject-card">
                <h3>${subject.name}</h3>
                <p>欠席上限：${subject.limit}回</p>
                <p>欠席済み：${subject.count}回</p>
                <h3>あと休める回数：${remaining}回</h3>
                <div class="absence-grid">${cells || "マスなし"}</div>
                ${remaining < 0 ? "<p>欠席上限を超えています！</p>" : ""}
                <label>
                    欠席済み回数を変更：
                    <input type="number" min="0" step="1"
                        value="${subject.count}"
                        onchange="updateAbsence(${index}, this.value)">
                </label>
               <button onclick="editMoney(${index})">編集</button>
               <button onclick="deleteMoney(${index})">削除</button>
            </div>
        `;
    });
}

function updateAbsence(index, value) {
    if (value.trim() === "" || !Number.isInteger(Number(value)) ||
        Number(value) < 0) {
        alert("0以上の整数を入力してね！");
        showSubjects();
        return;
    }

    subjects[index].count = Number(value);
    saveSubjects();
    showSubjects();
}

function deleteSubject(index) {
    if (confirm("この教科を削除する？")) {
        subjects.splice(index, 1);
        saveSubjects();
        showSubjects();
    }
}
function saveSubjects() {
    localStorage.setItem("noirSubjects", JSON.stringify(subjects));
}
let moneyRecords = JSON.parse(localStorage.getItem("noirMoney")) || [];

showSubjects();
showMoney();

function addMoney() {
    const type = document.getElementById("moneyType").value;
    const name = document.getElementById("moneyName").value.trim();
    const amountText = document.getElementById("moneyAmount").value;
    const amount = Number(amountText);
    const date = document.getElementById("moneyDate").value;
    const category = document.getElementById("moneyCategory").value;

    if (name === "" || amountText === "" || date === "") {
        alert("項目名・金額・日付を入力してね！");
        return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
        alert("金額は1円以上で入力してね！");
        return;
    }

    moneyRecords.push({
        type: type,
        name: name,
        amount: amount,
        date: date,
        category: category
    });

    saveMoney();
    showMoney();

    document.getElementById("moneyName").value = "";
    document.getElementById("moneyAmount").value = "";
}

function saveMoney() {
    localStorage.setItem("noirMoney", JSON.stringify(moneyRecords));
}

function showMoney() {
    const list = document.getElementById("moneyList");
    list.innerHTML = "";

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const thisMonth = `${year}-${month}`;

    let income = 0;
    let expense = 0;

    moneyRecords.forEach(function(record, index) {
        if (record.date.startsWith(thisMonth)) {
            if (record.type === "income") {
                income += record.amount;
            } else {
                expense += record.amount;
            }
        }

        list.innerHTML += `
            <div class="subject-card">
                <h3>${record.name}</h3>
                <p>${record.date}</p>
                <p>カテゴリー：${record.category}</p>
                <p>${record.type === "income" ? "収入" : "支出"}：${record.amount.toLocaleString()}円</p>
                <button onclick="editMoney(${index})">編集</button>
                <button onclick="deleteMoney(${index})">削除</button>
            </div>
        `;
    });

    document.getElementById("monthlyIncome").textContent =
        `収入：${income.toLocaleString()}円`;

    document.getElementById("monthlyExpense").textContent =
        `支出：${expense.toLocaleString()}円`;

    document.getElementById("monthlyBalance").textContent =
        `残高：${(income - expense).toLocaleString()}円`;
}

function deleteMoney(index) {
    if (confirm("この記録を削除する？")) {
        moneyRecords.splice(index, 1);
        saveMoney();
        showMoney();
    }
}

function editMoney(index) {
    const record = moneyRecords[index];

    const newName = prompt("項目名を変更", record.name);
    if (newName === null || newName.trim() === "") {
        return;
    }

    const newAmount = prompt("金額を変更", record.amount);
    if (newAmount === null || newAmount.trim() === "") {
        return;
    }

    if (!Number.isFinite(Number(newAmount)) || Number(newAmount) <= 0) {
        alert("金額は1円以上で入力してね！");
        return;
    }

    const newDate = prompt("日付を変更（例：2026-10-14）", record.date);
    if (newDate === null || !/^\d{4}-\d{2}-\d{2}$/.test(newDate)) {
        alert("日付はYYYY-MM-DD形式で入力してね！");
        return;
    }

    record.name = newName.trim();
    record.amount = Number(newAmount);
    record.date = newDate;

    saveMoney();
    showMoney();
}

let todoTasks = JSON.parse(localStorage.getItem("noirTodos")) || [];

function addTodo() {
    const name = document.getElementById("todoName").value.trim();
    const date = document.getElementById("todoDate").value;
    const priority = document.getElementById("todoPriority").value;

    if (name === "" || date === "") {
        alert("タスク名と期限を入力してね！");
        return;
    }

    todoTasks.push({
        name: name,
        date: date,
        priority: priority,
        completed: false
    });

    saveTodos();
    showTodos();

    document.getElementById("todoName").value = "";
    document.getElementById("todoDate").value = "";
}

function saveTodos() {
    localStorage.setItem("noirTodos", JSON.stringify(todoTasks));
}

function showTodos() {
    const list = document.getElementById("todoList");
    list.innerHTML = "";

    todoTasks.forEach(function(task, index) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const dueDate = new Date(task.date + "T00:00:00");
const daysLeft = Math.round((dueDate - today) / (24 * 60 * 60 * 1000));
const isOverdue = daysLeft < 0 && !task.completed;

        list.innerHTML += `
            <div class="subject-card">
                <h3>${task.completed ? "? " : ""}${task.name}</h3>
                <p>期限：${task.date}</p>
                <p>優先度：${task.priority}</p>
                ${isOverdue ? "<p class='todo-alert'>期限が過ぎています！</p>" : ""}
                ${!task.completed && daysLeft >= 0 && daysLeft <= 3
    ? "<p class='todo-soon'>期限が近いタスクです！</p>" : ""}
                <label>
                    <input type="checkbox"
                        ${task.completed ? "checked" : ""}
                        onchange="toggleTodo(${index})">
                    完了
                </label>
                <button onclick="deleteTodo(${index})">削除</button>
            </div>
        `;
    });
}

function toggleTodo(index) {
    todoTasks[index].completed = !todoTasks[index].completed;
    saveTodos();
    showTodos();
}

function deleteTodo(index) {
    if (confirm("このタスクを削除する？")) {
        todoTasks.splice(index, 1);
        saveTodos();
        showTodos();
    }
}

showTodos();
