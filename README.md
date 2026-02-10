# SkyFlow Pro – Airline reservation system

Backend (Java Spring Boot) + Frontend (React/Vite) for flight search and booking.

## Run backend and frontend together

**Option A – One command (Windows)**  
From this folder run:

```bat
run-all.bat
```

This starts the backend in a new window (port **8081**) and then the frontend (port **5173**). Wait for the backend to finish starting (~20 s) before the frontend opens.

**Option B – Two terminals**

1. **Backend**
   ```bat
   run-backend.bat
   ```
   Or: `cd backend-server` then `.\mvnw.cmd spring-boot:run`

2. **Frontend** (after backend is up)
   ```bat
   cd skyflow-pro
   npm install
   npm run dev
   ```

- Frontend: **http://localhost:5173**
- Backend API: **http://localhost:8081**

## First-time setup

1. **Backend**: Java 17+ and Maven (or use `backend-server\mvnw.cmd`).
2. **Frontend**: Node 18+
   ```bat
   cd skyflow-pro
   npm install
   ```
3. **Connect to backend**: In `skyflow-pro` create a `.env` file (or copy from `.env.example`):
   ```
   VITE_API_BASE_URL=http://localhost:8081
   VITE_USE_MOCKS=false
   ```
   With this, search and booking use the real API. If the backend is not running, set `VITE_USE_MOCKS=true` to use mock data.

## Demo login (backend)

- Username: `user` / Password: `password`
- Or: `admin` / `admin`

Log in from the frontend to complete a real booking against the backend.
