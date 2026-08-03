# Enterprise Node.js + Express.js Backend Boilerplate

A modular, scalable, and production-ready Express backend architecture built with ES6 Modules, MySQL, Sequelize ORM, JWT Authentication, Joi schema validation, and Swagger UI integration.

---

## 📁 Directory Structure

```text
src/
├── config/
│   ├── db.js                # Sequelize ORM MySQL database connection
│   └── env.js               # Dotenv configuration & variable exports
│
├── middleware/
│   ├── auth.middleware.js   # JWT authentication middleware
│   ├── error.middleware.js  # Global error handling middleware
│   └── validate.middleware.js # Joi schema validator middleware
│
├── utils/
│   ├── apiError.js          # Custom Operational Error class
│   └── response.js          # Standardized API response helper
│
├── modules/                 # Modular feature architecture
│   ├── auth/
│   │   ├── auth.controller.js
│   │   ├── auth.service.js
│   │   ├── auth.routes.js
│   │   └── auth.validation.js
│   │
│   ├── user/
│   │   ├── user.controller.js
│   │   ├── user.service.js
│   │   ├── user.routes.js
│   │   ├── user.validation.js
│   │   └── user.model.js
│   │
│   └── example/
│       ├── example.controller.js
│       ├── example.service.js
│       ├── example.routes.js
│       ├── example.validation.js
│       └── example.model.js
│
├── routes/
│   └── index.js             # Central route loader & Swagger UI setup
│
├── app.js                   # Express application setup
└── server.js                # Database connection & server listener
```

---

## ⚡ Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your MySQL credentials:
```bash
cp .env.example .env
```

### 3. Run Development Server
```bash
npm run dev
```

---

## 📖 API Documentation (Swagger)
Interactive Swagger documentation is available at:
`http://localhost:5000/api-docs`

---

## 🔑 Key Features
- **Modular MVC Architecture**: Clean code split into domain modules (`auth`, `user`, `example`).
- **Sequelize ORM & MySQL**: Configured with pooling, model sync, and soft attributes.
- **JWT Auth & bcryptjs**: Password hashing and token guard middleware.
- **Validation Middleware**: Powered by Joi schemas for request body, query, and params.
- **Central Error Handling**: Catches uncaught runtime, database, and JWT errors.
- **Standardized API Response**: Consistent `{ success, message, data, errors }` format across all endpoints.
