# 🛫 Airline Reservation System

A full-stack airline reservation system with a React frontend and Spring Boot backend.

## 🚀 Quick Start

### Option 1: Use the Launcher Script (Recommended)
Simply double-click `start-all.bat` to start both servers automatically!

### Option 2: Manual Start

#### Start Backend
```bash
cd backend-server
.\mvnw.cmd spring-boot:run
```

#### Start Frontend
```bash
cd skyflow-pro
npm run dev
```

## 🌐 Access the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8080
- **Connection Test:** Open `connection-test.html` in your browser
- **H2 Database Console:** http://localhost:8080/h2-console

## 📚 Documentation

- **Full Setup Guide:** See `CONNECTION-GUIDE.md` for detailed configuration information
- **API Documentation:** Available endpoints are documented in the CONNECTION-GUIDE.md

## ✅ Current Status

Both servers are currently running:
- ✅ Backend on port 8080 (running for 36+ minutes)
- ✅ Frontend on port 5173 (running for 35+ minutes)
- ✅ Frontend proxying API calls to backend
- ✅ CORS configured correctly
- ✅ JWT authentication enabled

## 🎯 Features

- Flight search and booking
- User registration and authentication
- Real-time chat support
- Payment simulation
- Booking management
- City and airport database

## 🔧 Tech Stack

**Frontend:**
- React
- Vite
- Axios
- Zustand (state management)
- TypeScript

**Backend:**
- Spring Boot
- Spring Security
- JWT Authentication
- H2 Database (In-Memory)
- JPA/Hibernate

## 🧪 Testing

Open `connection-test.html` to test:
- Backend connection
- Frontend servers
- API endpoints
- Database connection

## 📝 Configuration Files

- `vite.config.ts` - Frontend proxy configuration
- `application.yml` - Backend configuration
- `SecurityConfig.java` - CORS and security settings

## 🎉 Ready to Use!

Everything is connected and running. Just open http://localhost:5173 in your browser to start using the application!

---

**Last Updated:** February 7, 2026
