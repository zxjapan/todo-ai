// Todo List Application
class TodoApp {
    constructor() {
        this.todos = JSON.parse(localStorage.getItem('todos')) || [];
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderTodos();
        this.updateStats();
    }

    bindEvents() {
        // Add todo button
        const addBtn = document.getElementById('addTodo');
        const todoInput = document.getElementById('todoInput');

        addBtn.addEventListener('click', () => this.addTodo());
        todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTodo();
            }
        });

        // Filter buttons
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.setFilter(btn.dataset.filter);
                this.updateFilterButtons();
            });
        });

        // Clear completed button
        const clearCompletedBtn = document.getElementById('clearCompleted');
        clearCompletedBtn.addEventListener('click', () => this.clearCompleted());
    }

    addTodo() {
        const todoInput = document.getElementById('todoInput');
        const text = todoInput.value.trim();

        if (text === '') {
            this.showNotification('Please enter a task!', 'error');
            return;
        }

        const todo = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.todos.unshift(todo);
        this.saveTodos();
        this.renderTodos();
        this.updateStats();

        todoInput.value = '';
        todoInput.focus();

        this.showNotification('Task added successfully!', 'success');
    }

    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            const wasCompleted = todo.completed;
            todo.completed = !todo.completed;
            this.saveTodos();
            this.renderTodos();
            this.updateStats();

            // Add individual checkbox animation
            this.animateIndividualCheckbox(id);
        }
    }

    animateIndividualCheckbox(todoId) {
        const todoItem = document.querySelector(`[data-id="${todoId}"]`);
        if (todoItem) {
            const checkboxContainer = todoItem.querySelector('.checkbox-container');
            if (checkboxContainer) {
                // Add the completing class to trigger individual animation
                checkboxContainer.classList.add('completing');
                
                // Remove the class after animation completes
                setTimeout(() => {
                    checkboxContainer.classList.remove('completing');
                }, 600);
            }
        }
    }

    deleteTodo(id) {
        const index = this.todos.findIndex(t => t.id === id);
        if (index > -1) {
            this.todos.splice(index, 1);
            this.saveTodos();
            this.renderTodos();
            this.updateStats();
            this.showNotification('Task deleted!', 'info');
        }
    }

    clearCompleted() {
        const completedCount = this.todos.filter(t => t.completed).length;
        if (completedCount === 0) {
            this.showNotification('No completed tasks to clear!', 'info');
            return;
        }

        this.todos = this.todos.filter(t => !t.completed);
        this.saveTodos();
        this.renderTodos();
        this.updateStats();
        this.showNotification(`${completedCount} completed tasks cleared!`, 'success');
    }

    setFilter(filter) {
        this.currentFilter = filter;
        this.renderTodos();
    }

    updateFilterButtons() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.filter === this.currentFilter) {
                btn.classList.add('active');
            }
        });
    }

    getFilteredTodos() {
        switch (this.currentFilter) {
            case 'active':
                return this.todos.filter(t => !t.completed);
            case 'completed':
                return this.todos.filter(t => t.completed);
            default:
                return this.todos;
        }
    }

    renderTodos() {
        const todoList = document.getElementById('todoList');
        const filteredTodos = this.getFilteredTodos();

        if (filteredTodos.length === 0) {
            todoList.innerHTML = this.getEmptyStateHTML();
            return;
        }

        todoList.innerHTML = filteredTodos.map(todo => this.getTodoHTML(todo)).join('');
        
        // Add event listeners to new elements
        this.addTodoEventListeners();
    }

    getTodoHTML(todo) {
        const completedClass = todo.completed ? 'completed' : '';
        const checkedAttr = todo.completed ? 'checked' : '';
        
        return `
            <div class="todo-item ${completedClass}" data-id="${todo.id}">
                <label class="checkbox-container">
                    <input type="checkbox" ${checkedAttr}>
                    <span class="checkmark"></span>
                </label>
                <span class="todo-text">${this.escapeHtml(todo.text)}</span>
                <button class="delete-btn" title="Delete task">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    }

    getEmptyStateHTML() {
        const messages = {
            all: {
                icon: 'fas fa-clipboard-list',
                title: 'No tasks yet!',
                message: 'Add your first task to get started.'
            },
            active: {
                icon: 'fas fa-clock',
                title: 'No active tasks!',
                message: 'All caught up! Time to relax.'
            },
            completed: {
                icon: 'fas fa-check-circle',
                title: 'No completed tasks!',
                message: 'Complete some tasks to see them here.'
            }
        };

        const currentMessage = messages[this.currentFilter];
        
        return `
            <div class="empty-state">
                <i class="${currentMessage.icon}"></i>
                <h3>${currentMessage.title}</h3>
                <p>${currentMessage.message}</p>
            </div>
        `;
    }

    addTodoEventListeners() {
        // Checkbox event listeners
        const checkboxes = document.querySelectorAll('.todo-item input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const todoItem = e.target.closest('.todo-item');
                const todoId = parseInt(todoItem.dataset.id);
                this.toggleTodo(todoId);
            });
        });

        // Delete button event listeners
        const deleteBtns = document.querySelectorAll('.delete-btn');
        deleteBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const todoItem = e.target.closest('.todo-item');
                const todoId = parseInt(todoItem.dataset.id);
                this.deleteTodo(todoId);
            });
        });
    }

    updateStats() {
        const statsText = document.getElementById('todoStats').querySelector('.stats-text');
        const activeCount = this.todos.filter(t => !t.completed).length;
        const totalCount = this.todos.length;

        if (totalCount === 0) {
            statsText.textContent = 'No tasks yet';
        } else if (activeCount === 0) {
            statsText.textContent = 'All tasks completed!';
        } else if (activeCount === 1) {
            statsText.textContent = '1 task remaining';
        } else {
            statsText.textContent = `${activeCount} tasks remaining`;
        }
    }

    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
        `;

        // Add styles with dark theme colors
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            info: '#3b82f6'
        };

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type] || '#3b82f6'};
            color: white;
            padding: 12px 20px;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 8px;
            font-weight: 500;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    getNotificationColor(type) {
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            info: '#3b82f6'
        };
        return colors[type] || '#3b82f6';
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});

// Add some sample todos for demonstration (remove in production)
if (localStorage.getItem('todos') === null) {
    const sampleTodos = [
        { id: 1, text: 'Welcome to your new dark-themed todo list!', completed: true, createdAt: new Date().toISOString() },
        { id: 2, text: 'Click the checkbox to mark tasks as complete', completed: false, createdAt: new Date().toISOString() },
        { id: 3, text: 'Watch the satisfying animations!', completed: false, createdAt: new Date().toISOString() },
        { id: 4, text: 'Your tasks are automatically saved locally', completed: false, createdAt: new Date().toISOString() }
    ];
    localStorage.setItem('todos', JSON.stringify(sampleTodos));
} 