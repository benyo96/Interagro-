# Node.js MySQL Application

This is a simple Node.js application that connects to a local MySQL database. The application is structured in a monolithic architecture and follows best practices for organizing code.

## Project Structure

```
nodejs-mysql-app
├── src
│   ├── app.js          # Entry point of the application
│   ├── config          # Configuration files
│   │   └── db.js      # Database connection setup
│   ├── controllers     # Business logic for routes
│   │   └── index.js    # Controller functions
│   ├── models          # Data models
│   │   └── index.js    # Model definitions
│   ├── routes          # Application routes
│   │   └── index.js    # Route setup
│   └── utils           # Utility functions
│       └── index.js    # Common utility functions
├── package.json        # NPM configuration file
└── README.md           # Project documentation
```

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd nodejs-mysql-app
   ```
3. Install the dependencies:
   ```
   npm install
   ```

## Usage

To start the application, run the following command:
```
node src/app.js
```

Make sure your MySQL server is running and the database is properly configured in `src/config/db.js`.

## Contributing

Feel free to submit issues or pull requests for improvements or bug fixes.