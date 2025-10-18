# CNC Task Management System - Frontend

A modern, responsive React frontend for the CNC Task Management System, built with TypeScript, Tailwind CSS, and DaisyUI.

## Features

- **Authentication System**: Login, registration, email verification, password reset with JWT tokens
- **Dashboard**: Comprehensive project overview with metrics, activity feeds, and quick actions
- **Project Management**: Full CRUD operations, team assignment, and project settings
- **Sprint Management**: Sprint planning, burndown charts, and retrospectives
- **Task Management**: Kanban board, task details, time tracking, and dependencies
- **Product Backlog**: User story management with drag-and-drop prioritization
- **Team Management**: Team creation, member management, and role assignment
- **Real-time Collaboration**: SignalR integration for live updates and notifications
- **Reporting & Analytics**: Velocity charts, burndown charts, and team performance metrics
- **Admin Interface**: User management, system configuration, and audit logs
- **Mobile Responsive**: Optimized for desktop, tablet, and mobile devices
- **Accessibility**: WCAG 2.1 AA compliant with keyboard navigation and screen reader support

## Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running on port 5000

## Getting Started

1. **Clone and navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```

   Update `.env` with your API URL:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser** and navigate to `http://localhost:3000`

## Available Scripts

### Development
- `npm run dev` - Start development server
- `npm run preview` - Preview production build

### Building
- `npm run build` - Build for production
- `npm run build:staging` - Build for staging environment

### Code Quality
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking
- `npm run check` - Run all quality checks

### Testing
- `npm run test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage

### E2E Testing
- `npm run test:e2e` - Run end-to-end tests
- `npm run test:e2e:install` - Install Playwright browsers
- `npm run test:e2e:headed` - Run E2E tests in headed mode

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── layout/         # Layout components
│   └── ui/             # Basic UI components
├── pages/              # Page components
│   ├── auth/           # Authentication pages
│   └── projects/       # Project pages
├── hooks/              # Custom React hooks
├── services/           # API services
├── store/              # Redux store and slices
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── assets/             # Static assets
```

## Key Technologies

### Core Framework
- **React 18** - UI framework with hooks and concurrent features
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server

### Styling & UI
- **Tailwind CSS** - Utility-first CSS framework
- **DaisyUI** - Component library built on Tailwind
- **Lucide React** - Icon library

### State Management
- **Redux Toolkit** - Predictable state container
- **React Query** - Server state management
- **React Router** - Client-side routing

### Data Fetching
- **Axios** - HTTP client with interceptors
- **React Hook Form** - Form handling with validation
- **Zod** - Schema validation

### Testing
- **Jest** - Testing framework
- **React Testing Library** - Component testing
- **Testing Library User Event** - User interaction testing

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Static type checking

## Environment Variables

Create a `.env` file in the root directory:

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api

# Application Configuration
VITE_APP_NAME=CNC Task Management
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG=true

# External Services
VITE_SIGNALR_URL=http://localhost:5000/api/hubs
```

## Authentication

The application supports JWT-based authentication with the following features:

- User login and registration
- Role-based access control (Admin, Product Owner, Scrum Master, Developer, Stakeholder)
- Token refresh mechanism
- Protected routes
- Profile management

## API Integration

The frontend integrates with the backend API using:

- Axios for HTTP requests
- Automatic token injection via interceptors
- Error handling with user-friendly notifications
- Request/response interceptors for common functionality

## State Management

The application uses a hybrid approach:

- **Redux Toolkit** for UI state (theme, notifications, loading states)
- **React Query** for server state (API calls, caching, synchronization)
- **Local state** for component-specific data

## Testing

Run tests with coverage:
```bash
npm run test:coverage
```

Run tests in watch mode during development:
```bash
npm run test:watch
```

## Building for Production

Create an optimized production build:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Contributing

1. Follow the existing code style and conventions
2. Write tests for new features
3. Update documentation as needed
4. Run linting and tests before committing

## License

This project is licensed under the MIT License.