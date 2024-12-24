const fs = require('fs').promises;

class TaskTracker {
    constructor(filename = 'tasks.json') {
        this.filename = filename;
        this.tasks = [];
    }

    async loadTasks() {
        try {
            const data = await fs.readFile(this.filename, 'utf8');
            this.tasks = JSON.parse(data);
        } catch (error) {
            if (error.code === 'ENOENT') {
                // File doesn't exist, start with empty tasks
                this.tasks = [];
            } else if (error instanceof SyntaxError) {
                // Invalid JSON
                throw new Error('Invalid tasks file format');
            } else {
                throw error;
            }
        }
    }

    async saveTasks() {
        await fs.writeFile(this.filename, JSON.stringify(this.tasks, null, 2));
    }

    getNextId() {
        return Math.max(0, ...this.tasks.map(task => task.id)) + 1;
    }

    async addTask(description) {
        const task = {
            id: this.getNextId(),
            description,
            status: 'todo',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        this.tasks.push(task);
        await this.saveTasks();
        return task.id;
    }

    async updateTask(taskId, description) {
        taskId = parseInt(taskId);
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.description = description;
            task.updatedAt = new Date().toISOString();
            await this.saveTasks();
            return true;
        }
        return false;
    }

    async deleteTask(taskId) {
        taskId = parseInt(taskId);
        const initialLength = this.tasks.length;
        this.tasks = this.tasks.filter(task => task.id !== taskId);
        if (this.tasks.length !== initialLength) {
            await this.saveTasks();
            return true;
        }
        return false;
    }

    validateStatus(status) {
        const validStatuses = ['todo', 'in-progress', 'done'];
        if (status && !validStatuses.includes(status)) {
            throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
        }
    }

    async markTask(taskId, status) {
        this.validateStatus(status);
        taskId = parseInt(taskId);
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) {
            return false;
        }
        task.status = status;
        task.updatedAt = new Date().toISOString();
        await this.saveTasks();
        return true;
    }

    listTasks(status = null) {
        this.validateStatus(status);
        if (status) {
            return this.tasks.filter(task => task.status === status);
        }
        return this.tasks;
    }
}

// Command-line interface
async function main() {
    const tracker = new TaskTracker();
    await tracker.loadTasks();

    const [,, command, ...args] = process.argv;

    if (!command) {
        console.log('Usage: task-cli <command> [arguments]');
        return;
    }

    try {
        switch (command) {
            case 'add':
                if (args.length === 0) throw new Error('Description required');
                const taskId = await tracker.addTask(args[0]);
                console.log(`Task added successfully (ID: ${taskId})`);
                break;

            case 'update':
                if (args.length < 2) throw new Error('Task ID and description required');
                const [updateId, ...descriptionParts] = args;
                const description = descriptionParts.join(' ');
                if (await tracker.updateTask(updateId, description)) {
                    console.log('Task updated successfully');
                } else {
                    console.log('Task not found');
                }
                break;

            case 'delete':
                if (args.length === 0) throw new Error('Task ID required');
                if (await tracker.deleteTask(args[0])) {
                    console.log('Task deleted successfully');
                } else {
                    console.log('Task not found');
                }
                break;

            case 'mark-in-progress':
                if (args.length === 0) throw new Error('Task ID required');
                if (await tracker.markTask(args[0], 'in-progress')) {
                    console.log('Task marked as in progress');
                } else {
                    console.log('Task not found');
                }
                break;

            case 'mark-done':
                if (args.length === 0) throw new Error('Task ID required');
                if (await tracker.markTask(args[0], 'done')) {
                    console.log('Task marked as done');
                } else {
                    console.log('Task not found');
                }
                break;

            case 'list':
                const status = args[0];
                const tasks = tracker.listTasks(status);
                if (tasks.length > 0) {
                    tasks.forEach(printTask);
                } else {
                    console.log('No tasks found');
                }
                break;

            default:
                console.log('Invalid command');
                console.log('Available commands: add, update, delete, mark-in-progress, mark-done, list');
        }
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
}

function printTask(task) {
    const statusSymbols = {
        'todo': '[ ]',
        'in-progress': '[→]',
        'done': '[✓]'
    };
    console.log(`${statusSymbols[task.status]} ${task.id}: ${task.description}`);
}

// Export for testing
module.exports = {
    TaskTracker,
    main
};

// Run if called directly
if (require.main === module) {
    main().catch(error => {
        console.error('Unexpected error:', error);
        process.exit(1);
    });
}