const todoForm = document.getElementById('todoForm');
const jsInput = document.querySelector('.inp');
const todoList = document.getElementById('todoList');
const taskCount = document.getElementById('taskCount');
const filterBtns = document.querySelectorAll('.filter-btn');
const clearAllBtn = document.getElementById('clearAllBtn');

// Upgrade storage structure: supports both old plain string format and new object format
let rawData = JSON.parse(localStorage.getItem('msglist') || '[]');
let msgList = rawData.map(item => {
    if (typeof item === 'string') {
        return { text: item, completed: false };
    }
    return item;
});

let currentFilter = 'all';

function saveAndRender() {
    localStorage.setItem('msglist', JSON.stringify(msgList));
    renderTasks();
}

function updateTaskCount() {
    const pendingTasks = msgList.filter(item => !item.completed).length;
    taskCount.textContent = `${pendingTasks} task${pendingTasks !== 1 ? 's' : ''} left`;
}

function renderTasks() {
    todoList.innerHTML = '';

    const filteredList = msgList.filter(item => {
        if (currentFilter === 'active') return !item.completed;
        if (currentFilter === 'completed') return item.completed;
        return true;
    });

    if (filteredList.length === 0) {
        todoList.innerHTML = `<p class="empty-state">No tasks here yet!</p>`;
        updateTaskCount();
        return;
    }

    filteredList.forEach(task => {
        // Original index in msgList
        const realIndex = msgList.indexOf(task);

        const displayMsg = document.createElement('div');
        displayMsg.classList.add('display-msg');

        displayMsg.innerHTML = `
            <div class="task-content">
                <button class="checkbox-btn ${task.completed ? 'checked' : ''}" title="Mark task"></button>
                <span class="msg ${task.completed ? 'completed' : ''}">${escapeHtml(task.text)}</span>
            </div>
            <button class="delete-btn">Delete</button>
        `;

        // Toggle completed status
        const checkboxBtn = displayMsg.querySelector('.checkbox-btn');
        checkboxBtn.addEventListener('click', () => {
            msgList[realIndex].completed = !msgList[realIndex].completed;
            saveAndRender();
        });

        // Delete single task
        const delBtn = displayMsg.querySelector('.delete-btn');
        delBtn.addEventListener('click', () => {
            msgList.splice(realIndex, 1);
            saveAndRender();
        });

        todoList.appendChild(displayMsg);
    });

    updateTaskCount();
}

// Add task
todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = jsInput.value.trim();

    if (!text) {
        alert('Please enter a task!');
        return;
    }

    msgList.unshift({ text, completed: false });
    saveAndRender();
    jsInput.value = '';
});

// Filters (All / Active / Completed)
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderTasks();
    });
});

// Clear All
clearAllBtn.addEventListener('click', () => {
    if (msgList.length === 0) return;
    if (confirm('Are you sure you want to clear all tasks?')) {
        msgList = [];
        saveAndRender();
    }
});

// Sanitize user inputs to prevent XSS
function escapeHtml(string) {
    const div = document.createElement('div');
    div.innerText = string;
    return div.innerHTML;
}

// Initial Render
renderTasks();