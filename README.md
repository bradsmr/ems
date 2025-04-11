# Initech Employee Management System (EMS)

A full-stack web application for managing employees and departments with role-based access control.

## Overview

Initech EMS is a modern web application that allows organizations to manage their employee hierarchy and departmental structure. The system features JWT-based authentication, role-based access control, and a responsive UI.

## Features

- **User Authentication**: Secure login with JWT tokens
- **Role-Based Access**: Admin, Manager, and Employee permission levels
- **Employee Management**: Create, view, update, and delete employee records
- **Department Management**: Organize employees by department
- **Responsive Design**: Modern UI that works across devices

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Shadcn UI components
- **Backend**: Java Spring Boot, Spring Security, JPA/Hibernate
- **Database**: PostgreSQL

## Getting Started

### Backend

```bash
cd backend
./mvnw spring-boot:run
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The application will be available at http://localhost:5173

## Default Credentials

- Admin: admin@initech.com / password
