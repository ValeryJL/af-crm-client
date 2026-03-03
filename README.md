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

### Sprint 1: Setup & Basic Structure
- [ ] Initialize Vite + React project inside the `app` folder.
- [ ] Add Docker setup for the frontend (`docker-compose.yml`, `Dockerfile`).
- [ ] Configure TailwindCSS / Vanilla CSS for responsive layouts.
- [ ] Implement foundational basic layout and routing.
- [ ] Setup initial API connection layer to `http://localhost:8080`.

### Sprint 2: Core Features & UI Polish
- [ ] Implement Core features views (Dashboards, Tables, etc).
- [ ] Apply rich aesthetic design and smooth micro-animations.
- [ ] Finalize responsive designs for mobile/tablet/desktop.
