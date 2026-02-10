# Refactoring Deliverables

## 1. Final Folder Structure

### Frontend (skyflow-pro/src/)

```
src/
├── components/
│   ├── Header/              # Main app header/navbar
│   │   ├── index.ts
│   │   ├── NavbarEnhanced.tsx
│   │   └── SimpleNavbar.tsx
│   ├── FlightCard/          # Flight display components
│   │   ├── index.ts
│   │   ├── FlightCard.tsx
│   │   └── FlightResultsGrid.tsx
│   ├── common/              # Reusable UI (SkipLink, Toaster)
│   └── features/            # Feature-specific (auth, flights, help, etc.)
├── pages/
│   ├── SearchFlights/       # Flight search page
│   ├── FlightResults/       # Results page
│   ├── Booking/             # Booking page
│   └── BookingConfirmation/ # Confirmation page
├── services/                # API & backend communication
│   ├── api/
│   ├── auth/
│   ├── bookings/
│   ├── chat/
│   ├── flights/
│   └── notifications/
├── hooks/
│   ├── useAuth.ts
│   └── useFlightSearch.ts
├── context/                 # Global state (ThemeContext)
├── utils/                   # Helpers (dateUtils, confirmationUtils)
├── assets/
├── routes/
│   └── AppRoutes.tsx        # Centralized route definitions
├── styles/
│   └── global.css
├── config/, data/, stores/, types/, mocks/, test/
├── App.tsx
└── main.tsx
```

### Backend (com.skyflow)

```
com.skyflow
├── config/            # SecurityConfig
├── controller/        # REST controllers
├── service/           # Business logic
├── repository/        # JPA repositories
├── model/
│   ├── entity/        # Database entities
│   └── dto/           # Request/Response DTOs
├── security/          # JWT & auth
├── util/              # ApiResponse, Constants
├── common/            # DataSeeder (bootstrap)
├── exception/         # Global exception handling
└── SkyflowApplication.java
```

---

## 2. Files Moved/Renamed

| Action | From | To |
|--------|------|-----|
| **Pages** | pages/Search/ | pages/SearchFlights/ |
| | pages/Results/ | pages/FlightResults/ |
| | pages/Confirmation/ | pages/BookingConfirmation/ |
| **Components** | components/layout/Header/ | components/Header/ |
| | components/features/flights/results/FlightCard.tsx | components/FlightCard/FlightCard.tsx |
| | components/features/flights/results/FlightResultsGrid.tsx | components/FlightCard/FlightResultsGrid.tsx |
| **Context** | contexts/ | context/ |
| **Styles** | index.css (root) | styles/global.css |
| **Routes** | Inline in App.tsx | routes/AppRoutes.tsx |
| **Backend** | common/ApiResponse.java | util/ApiResponse.java |
| | common/Constants.java | util/Constants.java |
| **Added** | - | hooks/useAuth.ts |
| | - | routes/AppRoutes.tsx |

---

## 3. Functionality Unchanged

- ✅ Backend compiles successfully (`mvn compile`)
- ✅ Frontend TypeScript compiles (`tsc -b`)
- ✅ All routes preserved: /, /results, /booking/:id, /confirmation/:id
- ✅ Component behavior unchanged (Header, FlightCard, pages)
- ✅ API services and stores unchanged
- ✅ Theme context, auth stores work as before

---

## 4. Why This Structure Improves Maintainability

1. **Clear separation of concerns**: Routes, styles, and context have dedicated folders.
2. **Interview-ready layout**: Standard patterns (components/Header, pages/SearchFlights, routes/, context/) match industry conventions.
3. **Easier navigation**: Developers can quickly find routes, global state, and shared UI.
4. **Scalability**: New pages go in pages/, new shared UI in components/, new services in services/.
5. **Backend alignment**: util/ holds helpers; common/ retains bootstrap logic; controllers, services, repositories follow layering.

---

## Note on Package Name

The backend retains the package `com.skyflow` (not `com.patro.airlinebackend`) to avoid breaking Spring Boot component scanning, JPA entity mapping, and all Java imports. The structure (config, controller, service, repository, model, util, security, exception) matches the target layout; only the root package name differs.
