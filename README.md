# Employee Management System (EMS)

A demo full-stack web application built with Java Spring Boot, React, and PostgreSQL, showcasing employee and department management features with role-based access control.

## Live Demo

[https://ems.bradleysummers.dev](https://ems.bradleysummers.dev)

![Initech EMS Dashboard](screenshots/dashboard.png)

## Overview

The Employee Management System (EMS) is designed to help organizations manage their employee hierarchy and departmental structure. The system provides different capabilities based on user roles:

- **Administrators** can manage all employees and departments
- **Employees** can view their own information and organizational structure
- **Guests** have global read-only permissions for demo purposes

## Key Features

- Secure authentication with JWT
- Employee management with hierarchical reporting structure
- Department organization
- Organizational chart visualization
- Role-based access control

## Technology

Built with a modern tech stack:

- React/TypeScript frontend with Shadcn UI components
- Java Spring Boot backend with JPA/Hibernate
- PostgreSQL database
- Cloud hosting: Frontend and backend on Render.com, database on Neon.tech

## Project Structure

The repository is organized into two main components:

- `/frontend` - React/TypeScript application
- `/backend` - Java Spring Boot API
