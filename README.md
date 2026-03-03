# AF-CRM Client

Responsive Web Client for our CRM API backend.

## Overview

This project is a modern, responsive web application built to connect to our local API running on `localhost:8080`.
The application is containerized utilizing Docker for easy and rapid development.

## Prerequisites
- Docker & Docker Compose
- Node.js (for local non-docker development - Optional)

## Getting Started (Docker)

To run the application via Docker:
1. Ensure your backend API is already running on port `8080`.
2. From the root directory of this repository, start Docker containers using:
   ```bash
   docker-compose up -d --build
   ```
3. The Vite frontend will be accessible at `http://localhost:3000` (or the port specified).

## Sprint Planning

We work on a sprint-based approach. The ongoing tasks for each sprint are tracked below:

### Sprint 1: Foundation & Authentication
- [x] Initialize Vite + React + Tailwind CSS project inside the `app` folder.
- [x] Configure Axios with Interceptor for Authorization: Bearer JWT.
- [x] Implement React Router.
- [x] Build Login Page and AuthContext for global state.

### Sprint 2: Core Admin Management
- [x] Implement Main Layout (Sidebar + page container).
- [x] CRUD for Technicians (Table with search/filters, Modals).
- [x] CRUD for Services (Complex forms: Client, Frequency).
- [x] Service cancellation logic.

### Sprint 3: The Calendar Engine
- [ ] Calendar view integration (fetch tasks from `/api/calendar`).
- [ ] Visual state differentiation for tasks (Pending, Completed, Cancelled).
- [ ] Task detail modals.
- [ ] Quick "New Eventual Task" form.

### Sprint 4: Technical Reporting & Pre-fill
- [ ] Smart Form for Electromechanical reporting (react-hook-form).
- [ ] Pre-fill fields via `/api/calendar/{id}/form-data`.
- [ ] Input fields for 30+ electrical metrics.
- [ ] Submit logic to `/api/reports` and status update.

### Sprint 5: RBAC & Final Polishing
- [ ] Role-Based Access Control (RBAC) to restrict TECH roles.
- [ ] Protected routes.
- [ ] UX/UI Polish (Dark mode, Skeleton Loaders, 404 page, error handling).
