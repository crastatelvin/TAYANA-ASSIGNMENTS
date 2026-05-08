# RAG Backend: Industrial Auth Setup (Module 3)

This repository contains a professional-grade Node.js/TypeScript backend scaffolding for a RAG (Retrieval-Augmented Generation) ecosystem. It features a fully implemented authentication system with Zod validation, Bcrypt hashing, and JWT security.

## 1. Project Implementation Checklist
To build this backend, the following 5 key actions were performed:
1.  **Industrial Scaffolding**: Initialized a Node.js/TypeScript project with a modular folder structure (`config`, `modules`, `middleware`, `utils`).
2.  **Database Integration**: Configured **Mongoose** to connect to a MongoDB Atlas cluster with secure URL-encoding for complex credentials.
3.  **Auth Architecture**: Implemented the **Auth Module** using a clean separation of concerns (Routes -> Controller -> Service -> Model).
4.  **Input Validation**: Integrated **Zod** schemas to strictly enforce email formats and password complexity at the API gateway.
5.  **Security Layer**: Applied **Bcrypt** for one-way password hashing and **JSON Web Tokens (JWT)** for stateless user session management.

## 2. Component Architecture Breakdown
| Component | Action Performed | Expected App |
| :--- | :--- | :--- |
| **Auth Module** | Validates, hashes, and stores user data in MongoDB. | Ensures a secure and reliable user registration process. |
| **JWT Utility** | Signs a user payload with a secret key and 7-day expiration. | Enables persistent, secure sessions across the entire RAG platform. |
| **Zod Schema** | Defines the "shape" of valid registration data. | Prevents bad data from ever reaching the database or processing layers. |

## 3. Test Cases & Manual Verification

### ✅ Test Case 1: Successful Registration
**Input (PowerShell):**
```powershell
Invoke-RestMethod -Method Post -Uri "http://localhost:5000/auth/register" -ContentType "application/json" -Body '{"email": "success@example.com", "password": "strongPassword123"}'
```
**Expected Response:** `201 Created` with a `message` and a signed `token`.

### ❌ Test Case 2: Validation Failure (Invalid Email)
**Input (PowerShell):**
```powershell
Invoke-RestMethod -Method Post -Uri "http://localhost:5000/auth/register" -ContentType "application/json" -Body '{"email": "not-an-email", "password": "password123"}'
```
**Expected Response:** `400 Bad Request` with a JSON object detailing the `Invalid email address` error.

---

## 4. How to Run Locally
1.  **Install**: `npm install` (inside the `rag-backend` folder)
2.  **Environment**: Update `.env` with your `MONGO_URI` and `JWT_SECRET`.
3.  **Launch**: `npm run dev`

## 5. Quality Assurance Checks
- [x] **Complete**: Every step of the "Module 3: Backend Setup" lab is implemented and functional.
- [x] **Clear**: Code is written in TypeScript with full type safety and modular isolation.
- [x] **Usable**: Includes both cURL and PowerShell examples for cross-platform testing.
