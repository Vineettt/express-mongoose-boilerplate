# Express Mongoose Boilerplate

A comprehensive Node.js boilerplate application built with Express.js, TypeScript, and Mongoose, featuring authentication, role-based access control (PBAC), and email capabilities.

## Features
- **TypeScript Support**: Full TypeScript configuration with strict mode enabled
- **Express.js Framework**: RESTful API with middleware support
- **Multi-Database Architecture**: Separate databases for authentication and PBAC (Permission-Based Access Control)
- **Authentication System**: Complete user authentication with JWT tokens
- **Role-Based Access Control**: Dynamic route and role management system
- **Email Integration**: AWS SES integration for email functionality
- **Logging**: Winston-based logging system
- **Environment Configuration**: Separate configs for development and production
- **Hot Reload**: Development server with auto-rebuild and restart

## Tech Stack

- **Runtime**: Node.js 20+
- **Language**: TypeScript 5.4+
- **Framework**: Express.js 4.19+
- **Database**: MongoDB with Mongoose 8.15+
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Email**: AWS SDK + Nodemailer
- **Logging**: Winston
- **Build Tools**: TypeScript compiler with path aliases

## Project Structure

```
src/
├── app.ts                    # Main application entry point
├── config/                   # Environment-specific configurations
│   ├── development/          # Development environment config
│   ├── production/           # Production environment config
│   └── index.ts              # Config loader
├── controllers/              # Route controllers
│   ├── auth/                 # Authentication controllers
│   └── pbac/                 # PBAC controllers
├── models/                    # Mongoose models
│   ├── auth/                 # Authentication models
│   └── pbac/                 # PBAC models
├── routes/                    # Route definitions
└── shared/                    # Shared utilities
    ├── classes/              # Custom classes
    ├── common/               # Common utilities
    ├── constants/            # Application constants
    └── middleware/           # Express middleware
```

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

## Configuration

1. Copy the environment template:
   ```bash
   cp .env_template .env
   ```

2. Update the `.env` file with your configuration:
   - Server port and environment settings
   - JWT secret for authentication
   - Database connection details
   - AWS SES credentials for email functionality

## Available Scripts

- **`npm run build`**: Compile TypeScript to JavaScript
- **`npm run build:watch`**: Watch for changes and recompile
- **`npm run dev`**: Start development server with hot reload
- **`npm run serve`**: Run the compiled application
- **`npm run serve:watch`**: Run with nodemon for auto-restart

## Database Setup

The application uses two separate MongoDB databases:

1. **Auth Database**: User authentication and account management
2. **PBAC Database**: Role-based access control and route management

Update your `.env` file with the appropriate database connection strings.

## Running the Application

### Development

```bash
npm run dev
```

This will:
- Compile TypeScript code
- Start the build watcher
- Launch the server with nodemon for auto-restart

### Production

```bash
npm run build
npm run serve
```

## API Endpoints

The application dynamically loads routes based on the database configuration. All API endpoints are prefixed with `/api/`.

### Authentication Endpoints

- User registration and login
- Password management
- Account status management

### PBAC Endpoints

- Role management
- Route management
- User-role mappings

## Environment Variables

Key environment variables:

- `PORT`: Server port (default: 8080)
- `NODE_ENV`: Environment (development/production)
- `JWT_SECRET`: Secret key for JWT tokens
- `MAINTENANCE_MODE`: Enable/disable maintenance mode
- `EMAIL_ENABLED`: Enable email functionality
- Database connection strings for AUTH and PBAC databases

## Process Management

For production deployment, you can use PM2:

```bash
# Start with PM2
pm2 start npm --name "express-app" -- start

# Save PM2 configuration
pm2 save

# Setup PM2 startup
pm2 startup
```

## MongoDB Service

Ensure MongoDB is running:

```bash
# Check MongoDB status
sudo systemctl status mongod

# Start MongoDB if not running
sudo systemctl start mongod
```

## License

ISC License