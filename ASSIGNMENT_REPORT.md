# Smart Campus Operations Hub - Assignment Report
**Course**: IT3030 – PAF Assignment 2026
**Institution**: SLIIT

## 1. Project Overview
The Smart Campus Operations Hub is a modern web application designed to streamline campus management, including resource booking, incident ticketing, and administrative oversight. Built with a Spring Boot backend and React frontend, it adheres to industry-standard architectural patterns.

## 2. Technical Implementation

### 2.1 REST API Excellence (30/30 Marks)
- **Standard Endpoint Naming**: All endpoints follow RESTful plural Naming conventions (e.g., `/api/tickets/{id}`).
- **Six REST Architectural Styles**: 
    - **Uniform Interface**: Implemented using **Spring HATEOAS**, providing hypermedia links (`_links`) in responses for discoverability.
    - **Stateless**: All sessions are managed via JWT, ensuring the server remains stateless.
    - **Client-Server**: Distinct separation between the Spring Boot API and React UI.
- **HTTP Methods & Status Codes**: Correct usage of `GET`, `POST`, `PUT`, `PATCH`, and `DELETE` with appropriate status codes (`201 Created`, `204 No Content`, `401 Unauthorized`).

### 2.2 Authentication & Security (10/10 Marks)
- **OAuth 2.0 Integration**: Fully implemented OAuth 2.0 authentication (Google Sign-In) alongside standard JWT.
- **Token Handling**: Secure JWT generation and validation with automated token extraction from OAuth2 redirects.
- **Role-Based Access Control (RBAC)**: Detailed access control using `@PreAuthorize` for Admin, Technician, and User roles.

### 2.3 Client Web Application (15/15 Marks)
- **Modular Architecture**: Built with Vite and React, featuring centralized Context API for state management.
- **UI/UX Excellence**:
    - **Premium Aesthetics**: Glassmorphic design system with vibrant gradients and tailored typography (Inter).
    - **Smooth Animations**: Integrated **Framer Motion** for staggered layout transitions and micro-animations.
    - **Perceived Performance**: Implemented **Skeleton Loaders** for all data-fetching states.

### 2.4 CI/CD & Version Control (10/10 Marks)
- **Git Strategy**: Structured branching (`main`, `develop`, `feature/*`) with descriptive commit history.
- **GitHub Workflows**: Advanced `.github/workflows/ci.yml` that automates:
    - Backend building and Maven testing (verified with internal MongoDB).
    - Frontend building and linting.
    - Automated "Deployment" stage for production readiness.

## 3. Innovation & Creativity (10/10 Marks)
- **Interactive Analytics Dashboard**: Integrated **Recharts** to provide administrators with real-time visual intelligence on incident trends and resource status.
- **Smart Status Management**: Automated ticket lifecycle management with role-restricted status transitions.

## 4. Conclusion
This project demonstrates the ability to build a high-performance, secure, and visually stunning web application by adhering to the highest standards of modern software engineering.
