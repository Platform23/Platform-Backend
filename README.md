# Platform - Backend

## Technologies Used

- **Backend Framework**: AdonisJs
- **Database**: PostgreSQL
- **Containerization**: Docker

## Features

- **Authentication**: Register, login, logout, forgot password, reset password.
- **Email Verification**: Verify email addresses with token-based confirmation.
- **User Management**: CRUD operations for users with authentication and email verification middleware.
- **Experiences**: Manage user experiences with CRUD operations under `/api/experiences`.
- **Images**: Serve uploaded images dynamically under `/api/uploads`.
- **Networks**: Manage networks, including CRUD operations, user integration requests, and user management under `/api/networks`.
- **Chats**: Manage chat messages with CRUD operations under `/api/messages`.

## Getting Started

To get started with this project, follow these steps:

1. **Clone Repository**

   ```bash
   git clone https://github.com/Platform23/Platform-Backend.git
   cd Platform-Backend
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Database Setup**

   - Ensure PostgreSQL is installed and running.
   - Configure your database connection in `.env` file.

4. **Run Migrations and Seed Data**

   ```bash
   node ace migration:run
   node ace db:seed
   ```

5. **Start the Server**

   ```bash
   npm run dev
   ```

6. **Access API Routes**
   - Once the server is running, you can access the API at `http://localhost:3333/api`.

## API Routes

- **Health Check**: `GET /health`
- **Authentication**:
  - `POST /api/register`
  - `POST /api/login`
  - `POST /api/logout`
  - `POST /api/forgot-password`
  - `POST /api/reset-password/:token`
- **Email Verification**:
  - `GET /api/verify/email`
  - `GET /api/verify/email/:token`
- **Users**:
  - `GET /api/users`
  - `GET /api/users/:id`
  - `PUT /api/users/:id`
  - `DELETE /api/users/:id`
- **Experiences**:
  - `GET /api/experiences/:id`
  - `POST /api/experiences`
  - `PUT /api/experiences/:id`
  - `DELETE /api/experiences/:id`
- **Images**:
  - `GET /api/uploads/:type/*`
- **Networks**:
  - `GET /api/networks`
  - `GET /api/networks/:id`
  - `POST /api/networks`
  - `PUT /api/networks/:id`
  - `DELETE /api/networks/:id`
  - `POST /api/networks/:id/request`
  - `POST /api/networks/:id/add-user/:pseudo`
  - `DELETE /api/networks/:id/remove-user/:pseudo`
- **Chats**:
  - `GET /api/messages/:id`
  - `POST /api/messages`
