// Todo List Application
class todoapp {
    constructor() {
        this.todos = JSON.parse(localStorage.getItem('todos')) || [];
        this.currentfilter = 'all';
        this.init();
    }

    init() {
        this.bindevents();
        this.rendertodos();
        this.updatestats();
    }

    bindevents() {
        const addbtn = document.getElementById('addTodo');
        const todoinput = document.getElementById('todoInput');

        addbtn.addEventListener('click', () => this.addtodo());
        todoinput.addEventListener('keypress', e => {
            if (e.key === 'Enter') this.addtodo();
        });

        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.setfilter(btn.dataset.filter);
                this.updatefilterbuttons();
            });
        });

        document.getElementById('clearCompleted').addEventListener('click', () => this.clearcompleted());
    }

    addtodo() {
        const inp = document.getElementById('todoInput');
        const txt = inp.value.trim();
        if (!txt) {
            this.shownotification('please enter a task!', 'error');
            return;
        }
        this.todos.unshift({
            id: Date.now(),
            text: txt,
            completed: false,
            createdat: new Date().toISOString()
        });
        this.savetodos();
        this.rendertodos();
        this.updatestats();
        inp.value = '';
        inp.focus();
        this.shownotification('task added successfully!', 'success');
    }

    toggletodo(id) {
        const t = this.todos.find(x => x.id === id);
        if (t) {
            t.completed = !t.completed;
            this.savetodos();
            this.rendertodos();
            this.updatestats();
            this.animatecheckbox(id);
        }
    }

    animatecheckbox(id) {
        const el = document.querySelector(`[data-id="${id}"]`);
        if (el) {
            const box = el.querySelector('.checkbox-container');
            if (box) {
                box.classList.add('completing');
                setTimeout(() => box.classList.remove('completing'), 600);
            }
        }
    }

    deletetodo(id) {
        const i = this.todos.findIndex(x => x.id === id);
        if (i > -1) {
            this.todos.splice(i, 1);
            this.savetodos();
            this.rendertodos();
            this.updatestats();
            this.shownotification('task deleted!', 'info');
        }
    }

    clearcompleted() {
        const n = this.todos.filter(x => x.completed).length;
        if (!n) {
            this.shownotification('no completed tasks to clear!', 'info');
            return;
        }
        this.todos = this.todos.filter(x => !x.completed);
        this.savetodos();
        this.rendertodos();
        this.updatestats();
        this.shownotification(`${n} completed tasks cleared!`, 'success');
    }

    setfilter(f) {
        this.currentfilter = f;
        this.rendertodos();
    }

    updatefilterbuttons() {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.filter === this.currentfilter) btn.classList.add('active');
        });
    }

    getfilteredtodos() {
        if (this.currentfilter === 'active') return this.todos.filter(x => !x.completed);
        if (this.currentfilter === 'completed') return this.todos.filter(x => x.completed);
        return this.todos;
    }

    rendertodos() {
        const list = document.getElementById('todoList');
        const arr = this.getfilteredtodos();
        if (!arr.length) {
            list.innerHTML = this.getemptystatehtml();
            return;
        }
        list.innerHTML = arr.map(t => this.gettodohtml(t)).join('');
        this.addevents();
    }

    gettodohtml(t) {
        const c = t.completed ? 'completed' : '';
        const checked = t.completed ? 'checked' : '';
        return `
            <div class="todo-item ${c}" data-id="${t.id}">
                <label class="checkbox-container">
                    <input type="checkbox" ${checked}>
                    <span class="checkmark"></span>
                </label>
                <span class="todo-text">${this.escapehtml(t.text)}</span>
                <button class="delete-btn" title="delete task">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    }

    getemptystatehtml() {
        const m = {
            all: { icon: 'fas fa-clipboard-list', title: 'no tasks yet!', message: 'add your first task to get started.' },
            active: { icon: 'fas fa-clock', title: 'no active tasks!', message: 'all caught up! time to relax.' },
            completed: { icon: 'fas fa-check-circle', title: 'no completed tasks!', message: 'complete some tasks to see them here.' }
        };
        const cur = m[this.currentfilter];
        return `
            <div class="empty-state">
                <i class="${cur.icon}"></i>
                <h3>${cur.title}</h3>
                <p>${cur.message}</p>
            </div>
        `;
    }

    addevents() {
        document.querySelectorAll('.todo-item input[type="checkbox"]').forEach(box => {
            box.addEventListener('change', e => {
                const item = e.target.closest('.todo-item');
                const id = parseInt(item.dataset.id);
                this.toggletodo(id);
            });
        });
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', e => {
                e.stopPropagation();
                const item = e.target.closest('.todo-item');
                const id = parseInt(item.dataset.id);
                this.deletetodo(id);
            });
        });
    }

    updatestats() {
        const stats = document.getElementById('todoStats').querySelector('.stats-text');
        const active = this.todos.filter(x => !x.completed).length;
        const total = this.todos.length;
        if (!total) stats.textContent = 'no tasks yet';
        else if (!active) stats.textContent = 'all tasks completed!';
        else if (active === 1) stats.textContent = '1 task remaining';
        else stats.textContent = `${active} tasks remaining`;
    }

    savetodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    escapehtml(txt) {
        const d = document.createElement('div');
        d.textContent = txt;
        return d.innerHTML;
    }

    shownotification(msg, type = 'info') {
        const n = document.createElement('div');
        n.className = `notification notification-${type}`;
        n.innerHTML = `
            <i class="fas fa-${this.getnotificationicon(type)}"></i>
            <span>${msg}</span>
        `;
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            info: '#3b82f6'
        };
        n.style.cssText = `
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
        document.body.appendChild(n);
        setTimeout(() => { n.style.transform = 'translateX(0)' }, 100);
        setTimeout(() => {
            n.style.transform = 'translateX(100%)';
            setTimeout(() => { document.body.removeChild(n) }, 300);
        }, 3000);
    }

    getnotificationicon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new todoapp();
});

if (localStorage.getItem('todos') === null) {
    const sample = [
        { id: 1, text: 'welcome to your new dark-themed todo list!', completed: true, createdat: new Date().toISOString() },
        { id: 2, text: 'click the checkbox to mark tasks as complete', completed: false, createdat: new Date().toISOString() },
        { id: 3, text: 'your tasks are automatically saved locally', completed: false, createdat: new Date().toISOString() }
    ];
    localStorage.setItem('todos', JSON.stringify(sample));
} 