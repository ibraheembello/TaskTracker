const { TaskTracker } = require('../task-cli');
const fs = require('fs').promises;

jest.mock('fs', () => ({
    promises: {
        readFile: jest.fn(),
        writeFile: jest.fn()
    }
}));

describe('TaskTracker', () => {
    let tracker;

    beforeEach(async () => {
        jest.clearAllMocks();
        tracker = new TaskTracker();
    });

    test('should add a task', async () => {
        fs.readFile.mockResolvedValueOnce('[]');
        fs.writeFile.mockResolvedValueOnce();
        await tracker.loadTasks();
        
        const taskId = await tracker.addTask('Test task');
        expect(taskId).toBe(1);
        expect(tracker.tasks.length).toBe(1);
        expect(tracker.tasks[0].description).toBe('Test task');
    });

    test('should mark task as done', async () => {
        // Initialize with a task
        const initialTask = {
            id: 1,
            description: 'Test task',
            status: 'todo',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // Mock the file read to return our initial task
        fs.readFile.mockResolvedValueOnce(JSON.stringify([initialTask]));
        fs.writeFile.mockResolvedValueOnce();

        // Load the tasks
        await tracker.loadTasks();
        
        // Verify initial state
        expect(tracker.tasks.length).toBe(1);
        expect(tracker.tasks[0].id).toBe(1);
        
        // Mark the task as done
        const result = await tracker.markTask(1, 'done');
        
        // Verify the result
        expect(result).toBe(true);
        expect(tracker.tasks[0].status).toBe('done');
    });

    test('should handle marking non-existent task', async () => {
        await tracker.loadTasks();
        const result = await tracker.markTask(999, 'done');
        expect(result).toBe(false);
    });

    test('should update a task', async () => {
        await tracker.loadTasks();
        await tracker.addTask('Original task');
        
        const result = await tracker.updateTask(1, 'Updated task');
        
        expect(result).toBe(true);
        expect(tracker.tasks[0].description).toBe('Updated task');
    });

    test('should delete a task', async () => {
        await tracker.loadTasks();
        await tracker.addTask('Task to delete');
        
        const result = await tracker.deleteTask(1);
        
        expect(result).toBe(true);
        expect(tracker.tasks.length).toBe(0);
    });

    test('should list tasks by status', async () => {
        await tracker.loadTasks();
        await tracker.addTask('Task 1');
        await tracker.addTask('Task 2');
        await tracker.markTask(1, 'done');

        const todoTasks = tracker.listTasks('todo');
        const doneTasks = tracker.listTasks('done');

        expect(todoTasks.length).toBe(1);
        expect(doneTasks.length).toBe(1);
        expect(todoTasks[0].id).toBe(2);
        expect(doneTasks[0].id).toBe(1);
    });

    test('should handle invalid JSON file', async () => {
        fs.readFile.mockResolvedValueOnce('invalid json');
        
        await expect(tracker.loadTasks()).rejects.toThrow('Invalid tasks file format');
    });

    test('should handle file system errors', async () => {
        fs.readFile.mockRejectedValueOnce(new Error('File system error'));
        
        await expect(tracker.loadTasks()).rejects.toThrow('File system error');
    });

    test('should handle update of non-existent task', async () => {
        await tracker.loadTasks();
        const result = await tracker.updateTask(999, 'Updated description');
        expect(result).toBe(false);
    });

    test('should handle delete of non-existent task', async () => {
        await tracker.loadTasks();
        const result = await tracker.deleteTask(999);
        expect(result).toBe(false);
    });

    test('should correctly assign sequential IDs', async () => {
        fs.readFile.mockResolvedValueOnce('[]');
        await tracker.loadTasks();
        
        const id1 = await tracker.addTask('Task 1');
        const id2 = await tracker.addTask('Task 2');
        
        expect(id1).toBe(1);
        expect(id2).toBe(2);
    });

    test('should maintain task timestamps', async () => {
        fs.readFile.mockResolvedValueOnce('[]');
        await tracker.loadTasks();
        
        const taskId = await tracker.addTask('Test task');
        const task = tracker.tasks[0];
        
        expect(task.createdAt).toBeDefined();
        expect(task.updatedAt).toBeDefined();
        expect(new Date(task.createdAt).getTime()).not.toBeNaN();
        expect(new Date(task.updatedAt).getTime()).not.toBeNaN();
    });

    test('should update timestamps on modifications', async () => {
        fs.readFile.mockResolvedValueOnce('[]');
        await tracker.loadTasks();
        
        const taskId = await tracker.addTask('Test task');
        const originalUpdatedAt = tracker.tasks[0].updatedAt;
        
        await new Promise(resolve => setTimeout(resolve, 1)); // Small delay
        await tracker.updateTask(taskId, 'Updated description');
        
        expect(tracker.tasks[0].updatedAt).not.toBe(originalUpdatedAt);
    });
});