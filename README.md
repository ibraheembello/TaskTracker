# Task Tracker CLI

A simple command-line task management tool that helps you keep track of your tasks with basic CRUD operations and status management.

## Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Make the CLI executable (optional):

```bash
npm link
```

## Usage

### Adding a Task

```bash
node task-cli.js add "Your task description"
```

### Updating a Task

```bash
node task-cli.js update <task-id> "Updated task description"
```

### Deleting a Task

```bash
node task-cli.js delete <task-id>
```

### Marking Task Status

Mark as in-progress:

```bash
node task-cli.js mark-in-progress <task-id>
```

Mark as done:

```bash
node task-cli.js mark-done <task-id>
```

### Listing Tasks

List all tasks:

```bash
node task-cli.js list
```

List tasks by status:

```bash
node task-cli.js list todo
node task-cli.js list in-progress
node task-cli.js list done
```

## Task Status Symbols

- `[ ]` - Todo
- `[→]` - In Progress
- `[✓]` - Done

## Data Storage

Tasks are stored in a local `tasks.json` file in the following format:

```json
[
  {
    "id": 1,
    "description": "Task description",
    "status": "todo",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
]
```

## Development

### Running Tests

```bash
npm test
```

### Project Structure

- `task-cli.js` - Main CLI application and TaskTracker class
- `__tests__/task-cli.test.js` - Test suite
- `tasks.json` - Data storage file (created automatically)

## Error Handling

- The CLI will display appropriate error messages for invalid commands or missing arguments
- File system errors are handled gracefully
- Invalid JSON in the storage file will trigger an error message

## License

MIT
