document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const addBtn = document.getElementById('addBtn');
    const clearBtn = document.getElementById('clearCompletedBtn');
    const taskList = document.getElementById('taskList');
    const toggleBtn = document.getElementById('darkModeToggle');
    const body = document.getElementById('body');

    // DARK MODE
    if (localStorage.getItem('theme') === 'dark') {
        body.classList.add('dark-mode');
        toggleBtn.textContent = '☀️ Light Mode';
    }
    toggleBtn.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        toggleBtn.textContent = body.classList.contains('dark-mode') ? '☀️ Light Mode' : '🌙 Dark Mode';
        localStorage.setItem('theme', body.classList.contains('dark-mode') ? 'dark' : 'light');
    });

    // ADD TASK
    addBtn.addEventListener('click', async () => {
        const content = taskInput.value.trim();
        if (!content) return;
        const res = await fetch('/add', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({content})
        });
        const data = await res.json();
        if (!data.error) taskList.appendChild(createTaskElement(data));
        taskInput.value = '';
    });

    // DELETE TASK
    taskList.addEventListener('click', async (e) => {
        if (e.target.classList.contains('deleteTask')) {
            const li = e.target.closest('li');
            const id = li.dataset.id;
            await fetch(`/delete/${id}`, { method: 'DELETE' });
            li.remove();
        }
    });

    // TOGGLE COMPLETE
    taskList.addEventListener('click', async (e) => {
        if (e.target.classList.contains('toggleComplete')) {
            const li = e.target.closest('li');
            const id = li.dataset.id;
            const res = await fetch(`/complete/${id}`, { method: 'PUT' });
            const data = await res.json();
            li.classList.toggle('completed', data.completed);
            e.target.textContent = data.completed ? 'Undo' : 'Complete';
        }
    });

    // CLEAR COMPLETED
    clearBtn.addEventListener('click', async () => {
        await fetch('/clear_completed', { method: 'DELETE' });
        document.querySelectorAll('#taskList li.completed').forEach(li => li.remove());
    });

    // DRAG & DROP
    let dragSrcEl = null;
    taskList.addEventListener('dragstart', (e) => {
        dragSrcEl = e.target;
        e.dataTransfer.effectAllowed = 'move';
        e.target.classList.add('dragging');
    });
    taskList.addEventListener('dragend', (e) => e.target.classList.remove('dragging'));
    taskList.addEventListener('dragover', (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; });
    taskList.addEventListener('drop', async (e) => {
        e.preventDefault();
        const dropTarget = e.target.closest('li');
        if (dragSrcEl && dropTarget && dragSrcEl !== dropTarget) {
            taskList.insertBefore(dragSrcEl, dropTarget.nextSibling);
            const order = Array.from(taskList.children).map(li => li.dataset.id);
            await fetch('/reorder', {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({order})
            });
        }
    });

    function createTaskElement(task) {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        if (task.completed) li.classList.add('completed');
        li.dataset.id = task.id;
        li.draggable = true;
        li.innerHTML = `
            <span class="task-text">${task.content}</span>
            <div>
                <button class="btn btn-sm btn-success toggleComplete">${task.completed ? 'Undo' : 'Complete'}</button>
                <button class="btn btn-sm btn-danger deleteTask">Delete</button>
            </div>
        `;
        return li;
    }
});

