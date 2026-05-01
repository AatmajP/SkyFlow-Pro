# Seat Selection and Allocation

<cite>
**Referenced Files in This Document**
- [Seat.java](file://backend-server/src/main/java/com/skyflow/model/entity/Seat.java)
- [Flight.java](file://backend-server/src/main/java/com/skyflow/model/entity/Flight.java)
- [SeatRepository.java](file://backend-server/src/main/java/com/skyflow/repository/SeatRepository.java)
- [BookingService.java](file://backend-server/src/main/java/com/skyflow/service/BookingService.java)
- [BookingController.java](file://backend-server/src/main/java/com/skyflow/controller/BookingController.java)
- [BookingResponse.java](file://backend-server/src/main/java/com/skyflow/model/dto/response/BookingResponse.java)
- [BookingPage.tsx](file://skyflow-pro-enhanced/src/pages/BookingPage.tsx)
- [bookingStore.ts](file://skyflow-pro/src/stores/bookingStore.ts)
- [bookingService.ts](file://skyflow-pro/src/services/bookings/bookingService.ts)
- [pricingEngine.ts](file://skyflow-pro/src/config/pricingEngine.ts)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Dependency Analysis](#dependency-analysis)
7. [Performance Considerations](#performance-considerations)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Conclusion](#conclusion)

## Introduction
This document explains the seat selection and allocation system across the frontend and backend. It covers the seat visualization and selection UX, seat availability and validation, seat assignment to bookings, seat types and pricing tiers, cabin class configurations, seat blocking and release mechanics, concurrency handling, and the integration between the React frontend and Spring Boot backend services.

## Project Structure
The seat selection and allocation spans three primary areas:
- Backend Java (Spring Boot): seat persistence, flight availability, booking creation, cancellation, and seat locking.
- Frontend React (skyflow-pro-enhanced): seat map visualization, seat selection UX, and real-time fare breakdown updates.
- Frontend React (skyflow-pro): booking store and service integration for API communication.

```mermaid
graph TB
subgraph "Frontend"
FE_BookingPage["BookingPage.tsx<br/>Seat map UI"]
FE_Store["bookingStore.ts<br/>Local state & API calls"]
FE_Service["bookingService.ts<br/>HTTP client wrapper"]
FE_Pricing["pricingEngine.ts<br/>Cabin pricing"]
end
subgraph "Backend"
BE_Controller["BookingController.java<br/>REST endpoints"]
BE_Service["BookingService.java<br/>Business logic"]
BE_RepoSeat["SeatRepository.java<br/>Seat queries & locks"]
BE_EntitySeat["Seat.java<br/>Seat entity"]
BE_EntityFlight["Flight.java<br/>Flight entity"]
end
FE_BookingPage --> FE_Store
FE_Store --> FE_Service
FE_Service --> BE_Controller
BE_Controller --> BE_Service
BE_Service --> BE_RepoSeat
BE_RepoSeat --> BE_EntitySeat
BE_Service --> BE_EntityFlight
```

**Diagram sources**
- [BookingPage.tsx:60-722](file://skyflow-pro-enhanced/src/pages/BookingPage.tsx#L60-L722)
- [bookingStore.ts:43-115](file://skyflow-pro/src/stores/bookingStore.ts#L43-L115)
- [bookingService.ts:19-39](file://skyflow-pro/src/services/bookings/bookingService.ts#L19-L39)
- [BookingController.java:14-89](file://backend-server/src/main/java/com/skyflow/controller/BookingController.java#L14-L89)
- [BookingService.java:22-148](file://backend-server/src/main/java/com/skyflow/service/BookingService.java#L22-L148)
- [SeatRepository.java:13-24](file://backend-server/src/main/java/com/skyflow/repository/SeatRepository.java#L13-L24)
- [Seat.java:13-29](file://backend-server/src/main/java/com/skyflow/model/entity/Seat.java#L13-L29)
- [Flight.java:12-42](file://backend-server/src/main/java/com/skyflow/model/entity/Flight.java#L12-L42)

**Section sources**
- [BookingPage.tsx:60-722](file://skyflow-pro-enhanced/src/pages/BookingPage.tsx#L60-L722)
- [bookingStore.ts:43-115](file://skyflow-pro/src/stores/bookingStore.ts#L43-L115)
- [bookingService.ts:19-39](file://skyflow-pro/src/services/bookings/bookingService.ts#L19-L39)
- [BookingController.java:14-89](file://backend-server/src/main/java/com/skyflow/controller/BookingController.java#L14-L89)
- [BookingService.java:22-148](file://backend-server/src/main/java/com/skyflow/service/BookingService.java#L22-L148)
- [SeatRepository.java:13-24](file://backend-server/src/main/java/com/skyflow/repository/SeatRepository.java#L13-L24)
- [Seat.java:13-29](file://backend-server/src/main/java/com/skyflow/model/entity/Seat.java#L13-L29)
- [Flight.java:12-42](file://backend-server/src/main/java/com/skyflow/model/entity/Flight.java#L12-L42)

## Core Components
- Seat entity and repository: define seat attributes, uniqueness constraint (flight + seatNumber), and locking for concurrency.
- Flight entity: tracks base price and availableSeats.
- Booking service: validates seat availability, marks seats as booked, updates flight availability, computes pricing by cabin class, and manages cancellations.
- Booking controller: validates request payload, authenticates requests, and delegates to the service.
- Frontend seat map: renders seat rows and columns, legend for seat types, selection UX, and dynamic fare breakdown.
- Frontend booking store and service: orchestrate API calls and local fallback behavior.

**Section sources**
- [Seat.java:13-29](file://backend-server/src/main/java/com/skyflow/model/entity/Seat.java#L13-L29)
- [SeatRepository.java:13-24](file://backend-server/src/main/java/com/skyflow/repository/SeatRepository.java#L13-L24)
- [Flight.java:12-42](file://backend-server/src/main/java/com/skyflow/model/entity/Flight.java#L12-L42)
- [BookingService.java:43-98](file://backend-server/src/main/java/com/skyflow/service/BookingService.java#L43-L98)
- [BookingController.java:21-70](file://backend-server/src/main/java/com/skyflow/controller/BookingController.java#L21-L70)
- [BookingPage.tsx:284-373](file://skyflow-pro-enhanced/src/pages/BookingPage.tsx#L284-L373)
- [bookingStore.ts:62-75](file://skyflow-pro/src/stores/bookingStore.ts#L62-L75)
- [bookingService.ts:19-39](file://skyflow-pro/src/services/bookings/bookingService.ts#L19-L39)

## Architecture Overview
The seat allocation follows a transactional flow:
- Frontend collects passenger info, optionally selects a seat, and submits a booking request.
- Backend validates the request, locates or creates the seat record, checks availability, and performs a pessimistic write lock to prevent race conditions.
- If available, the seat is marked as booked, flight availableSeats decremented, and a booking is created with calculated total amount based on cabin class.
- On cancellation, the seat is released, and availableSeats is restored.

```mermaid
sequenceDiagram
participant U as "User"
participant FE as "Frontend BookingPage.tsx"
participant FS as "Frontend bookingStore.ts"
participant API as "bookingService.ts"
participant C as "BookingController.java"
participant S as "BookingService.java"
participant R as "SeatRepository.java"
participant DB as "DB"
U->>FE : "Select seat / enter details"
FE->>FS : "addBooking(flightId, seatNumber, seatClass)"
FS->>API : "POST /bookings"
API->>C : "createBooking(payload)"
C->>S : "createBooking(username, flightId, seatNumber, seatClass)"
S->>R : "findByFlightAndSeatNumber(flight, seatNumber)"
alt "Seat exists"
R-->>S : "Seat"
else "Create new seat"
S->>R : "save(new Seat)"
end
S->>R : "findByIdWithLock(seat.id) [PESSIMISTIC_WRITE]"
R->>DB : "SELECT ... FOR UPDATE"
DB-->>R : "Locked seat"
R-->>S : "Seat"
S->>S : "check isBooked()"
alt "Already booked"
S-->>C : "throw error"
C-->>API : "badRequest"
API-->>FS : "error"
else "Available"
S->>R : "save(seat.setBooked=true)"
S->>DB : "UPDATE seats SET isBooked=true"
S->>DB : "UPDATE flights SET availableSeats=availableSeats-1"
S->>DB : "INSERT booking"
S-->>C : "BookingResponse"
C-->>API : "200 OK"
API-->>FS : "booking"
end
```

**Diagram sources**
- [BookingPage.tsx:139-157](file://skyflow-pro-enhanced/src/pages/BookingPage.tsx#L139-L157)
- [bookingStore.ts:62-75](file://skyflow-pro/src/stores/bookingStore.ts#L62-L75)
- [bookingService.ts:20-28](file://skyflow-pro/src/services/bookings/bookingService.ts#L20-L28)
- [BookingController.java:21-70](file://backend-server/src/main/java/com/skyflow/controller/BookingController.java#L21-L70)
- [BookingService.java:43-98](file://backend-server/src/main/java/com/skyflow/service/BookingService.java#L43-L98)
- [SeatRepository.java:14-16](file://backend-server/src/main/java/com/skyflow/repository/SeatRepository.java#L14-L16)

## Detailed Component Analysis

### Seat Entity and Availability
- Seat entity enforces uniqueness on (flight_id, seatNumber) and tracks seatClass and isBooked flag.
- SeatRepository exposes:
  - findByIdWithLock using PESSIMISTIC_WRITE to serialize access.
  - findByFlightAndSeatNumber to locate existing seats.
  - countBookedSeatsByFlight and findByFlightAndIsBooked for reporting and seat map generation.

```mermaid
classDiagram
class Seat {
+Long id
+String seatNumber
+String seatClass
+boolean isBooked
+Flight flight
}
class Flight {
+Long id
+Double basePrice
+int availableSeats
}
class SeatRepository {
+findByIdWithLock(id)
+findByFlightAndSeatNumber(flight, seatNumber)
+countBookedSeatsByFlight(flight)
+findByFlightAndIsBooked(flight, isBooked)
}
Seat --> Flight : "belongs to"
SeatRepository --> Seat : "manages"
```

**Diagram sources**
- [Seat.java:13-29](file://backend-server/src/main/java/com/skyflow/model/entity/Seat.java#L13-L29)
- [Flight.java:12-42](file://backend-server/src/main/java/com/skyflow/model/entity/Flight.java#L12-L42)
- [SeatRepository.java:13-24](file://backend-server/src/main/java/com/skyflow/repository/SeatRepository.java#L13-L24)

**Section sources**
- [Seat.java:13-29](file://backend-server/src/main/java/com/skyflow/model/entity/Seat.java#L13-L29)
- [SeatRepository.java:13-24](file://backend-server/src/main/java/com/skyflow/repository/SeatRepository.java#L13-L24)
- [Flight.java:12-42](file://backend-server/src/main/java/com/skyflow/model/entity/Flight.java#L12-L42)

### Backend Seat Allocation Algorithm
- Request validation: controller checks presence and validity of flightId, seatNumber, and seatClass.
- Seat lookup or creation: service finds an existing seat for the flight/seatNumber or creates a new seat with the requested class.
- Availability check and locking: service retrieves the seat with a pessimistic write lock to prevent race conditions.
- Conflict resolution: if seat.isBooked is true, a conflict is raised; otherwise, the seat is marked booked and persisted.
- Flight availability update: availableSeats decremented atomically.
- Booking creation: booking saved with computed total amount based on seatClass multiplier and taxes.
- Response mapping: BookingResponse DTO populated with booking metadata and seat details.

```mermaid
flowchart TD
Start(["createBooking Entry"]) --> Validate["Validate payload<br/>flightId, seatNumber, seatClass"]
Validate --> Valid{"Valid?"}
Valid --> |No| BadReq["Return 400 bad request"]
Valid --> |Yes| FindSeat["Find or create Seat by flight+seatNumber"]
FindSeat --> LockSeat["Lock Seat with PESSIMISTIC_WRITE"]
LockSeat --> CheckBooked{"Seat.isBooked?"}
CheckBooked --> |Yes| Conflict["Throw conflict: already booked"]
CheckBooked --> |No| MarkBooked["Set seat.isBooked=true and save"]
MarkBooked --> DecAvail["Decrement flight.availableSeats"]
DecAvail --> CreateBooking["Create Booking with seatClass multiplier"]
CreateBooking --> SaveBooking["Persist Booking"]
SaveBooking --> Done(["Return BookingResponse"])
Conflict --> Done
BadReq --> Done
```

**Diagram sources**
- [BookingController.java:21-70](file://backend-server/src/main/java/com/skyflow/controller/BookingController.java#L21-L70)
- [BookingService.java:43-98](file://backend-server/src/main/java/com/skyflow/service/BookingService.java#L43-L98)
- [SeatRepository.java:14-16](file://backend-server/src/main/java/com/skyflow/repository/SeatRepository.java#L14-L16)

**Section sources**
- [BookingController.java:21-70](file://backend-server/src/main/java/com/skyflow/controller/BookingController.java#L21-L70)
- [BookingService.java:43-98](file://backend-server/src/main/java/com/skyflow/service/BookingService.java#L43-L98)
- [SeatRepository.java:14-16](file://backend-server/src/main/java/com/skyflow/repository/SeatRepository.java#L14-L16)

### Seat Types, Pricing Tiers, and Cabin Classes
- Backend pricing multiplier:
  - Premium Economy: multiplier 1.5
  - Business: multiplier 3.0
  - First Class: multiplier 5.0
  - Default (Economy): multiplier 1.0
  - Total amount includes 12% tax on base × multiplier.
- Frontend pricing engine (skyflow-pro):
  - Provides cabin class multipliers and fees for pricing comparisons.
  - Seat selection fee per cabin class can be configured per airline.
- Frontend seat map:
  - Seat types mapped to visual styles and seatCharge values.
  - Fare breakdown updates dynamically when seat type changes.

```mermaid
flowchart LR
Base["Base Fare"] --> Multiplier["Class Multiplier"]
Multiplier --> Fees["Cabin Fees + Airline Fees"]
Fees --> Subtotal["Subtotal"]
Subtotal --> Tax["+ 12% Tax"]
Tax --> Total["Total Amount"]
```

**Diagram sources**
- [BookingService.java:80-89](file://backend-server/src/main/java/com/skyflow/service/BookingService.java#L80-L89)
- [pricingEngine.ts:94-145](file://skyflow-pro/src/config/pricingEngine.ts#L94-L145)
- [BookingPage.tsx:95-104](file://skyflow-pro-enhanced/src/pages/BookingPage.tsx#L95-L104)

**Section sources**
- [BookingService.java:80-89](file://backend-server/src/main/java/com/skyflow/service/BookingService.java#L80-L89)
- [pricingEngine.ts:94-145](file://skyflow-pro/src/config/pricingEngine.ts#L94-L145)
- [BookingPage.tsx:95-104](file://skyflow-pro-enhanced/src/pages/BookingPage.tsx#L95-L104)

### Seat Blocking and Release Mechanisms
- Blocking during booking:
  - SeatRepository uses PESSIMISTIC_WRITE lock on seat retrieval to serialize concurrent attempts.
- Release on cancellation:
  - BookingService cancels a booking by setting status to CANCELLED, marking seat.isBooked=false, saving the seat, and incrementing flight.availableSeats.

```mermaid
sequenceDiagram
participant Svc as "BookingService.java"
participant Repo as "SeatRepository.java"
participant DB as "DB"
participant F as "Flight.java"
Svc->>Repo : "findByIdWithLock(seat.id)"
Repo->>DB : "SELECT ... FOR UPDATE"
DB-->>Repo : "Locked seat"
Repo-->>Svc : "Seat"
Svc->>Repo : "save(seat.setBooked=true)"
Svc->>DB : "UPDATE seats SET isBooked=true"
Svc->>DB : "UPDATE flights SET availableSeats=availableSeats-1"
Note over Svc,DB : "Later, on cancellation"
Svc->>Repo : "save(seat.setBooked=false)"
Svc->>DB : "UPDATE seats SET isBooked=false"
Svc->>DB : "UPDATE flights SET availableSeats=availableSeats+1"
```

**Diagram sources**
- [SeatRepository.java:14-16](file://backend-server/src/main/java/com/skyflow/repository/SeatRepository.java#L14-L16)
- [BookingService.java:107-127](file://backend-server/src/main/java/com/skyflow/service/BookingService.java#L107-L127)

**Section sources**
- [SeatRepository.java:14-16](file://backend-server/src/main/java/com/skyflow/repository/SeatRepository.java#L14-L16)
- [BookingService.java:107-127](file://backend-server/src/main/java/com/skyflow/service/BookingService.java#L107-L127)

### Frontend Seat Selection UX and Seat Map Rendering
- Seat map layout:
  - Rows labeled 1–6, columns A–F with aisle separators.
  - Seat IDs constructed as row + column (e.g., 1A).
- Seat types and pricing:
  - Row-based seatType mapping: premium (rows 1–2), extra_legroom (rows 3–4), preferred (rows 5–6), standard otherwise.
  - Visual legend shows label, price, and color-coded seat classes.
- Occupancy and selection:
  - Predefined occupiedSeats set prevents selection.
  - onClick handler sets selectedSeat and selectedSeatType.
- Fare breakdown:
  - useEffect triggers FlightService.getFareBreakdown when seatType changes, updating the UI with seatCharge and surge pricing.

```mermaid
flowchart TD
Init["Load Flight & Seat Map"] --> Render["Render Rows A-F"]
Render --> Select{"User Clicks Seat"}
Select --> IsOcc{"Occupied?"}
IsOcc --> |Yes| Ignore["Do Nothing"]
IsOcc --> |No| SetSel["Set selectedSeat & selectedSeatType"]
SetSel --> FetchFare["Fetch Fare Breakdown"]
FetchFare --> UpdateUI["Update Legend & Totals"]
Ignore --> End(["Idle"])
UpdateUI --> End
```

**Diagram sources**
- [BookingPage.tsx:35-58](file://skyflow-pro-enhanced/src/pages/BookingPage.tsx#L35-L58)
- [BookingPage.tsx:125-129](file://skyflow-pro-enhanced/src/pages/BookingPage.tsx#L125-L129)
- [BookingPage.tsx:95-104](file://skyflow-pro-enhanced/src/pages/BookingPage.tsx#L95-L104)

**Section sources**
- [BookingPage.tsx:284-373](file://skyflow-pro-enhanced/src/pages/BookingPage.tsx#L284-L373)
- [BookingPage.tsx:307-359](file://skyflow-pro-enhanced/src/pages/BookingPage.tsx#L307-L359)
- [BookingPage.tsx:125-129](file://skyflow-pro-enhanced/src/pages/BookingPage.tsx#L125-L129)
- [BookingPage.tsx:95-104](file://skyflow-pro-enhanced/src/pages/BookingPage.tsx#L95-L104)

### Backend Seat Availability Checking Logic
- Seat existence:
  - SeatRepository.findByFlightAndSeatNumber locates the seat for the given flight and seatNumber.
- Counting occupied seats:
  - SeatRepository.countBookedSeatsByFlight provides a quick count for reporting or seat map generation.
- Listing occupied seats:
  - SeatRepository.findByFlightAndIsBooked(flight, true) returns all booked seats for a flight.

**Section sources**
- [SeatRepository.java:18-23](file://backend-server/src/main/java/com/skyflow/repository/SeatRepository.java#L18-L23)

### Frontend Integration Between Seat Selection and Backend Services
- Frontend booking store:
  - addBooking invokes bookingService.createBooking with flightId, seatNumber, and seatClass.
  - addDemoBooking provides a local fallback when the backend is unavailable.
- Frontend service:
  - bookingService wraps HTTP calls to /bookings, /bookings/my-bookings, and /bookings/cancel/{id}.
- Controller and service:
  - BookingController validates authentication and payload, then delegates to BookingService.
  - BookingService orchestrates seat locking, availability checks, and booking persistence.

```mermaid
sequenceDiagram
participant UI as "BookingPage.tsx"
participant Store as "bookingStore.ts"
participant Svc as "bookingService.ts"
participant Ctrl as "BookingController.java"
participant SvcB as "BookingService.java"
UI->>Store : "addBooking(flightId, seatNumber, seatClass)"
Store->>Svc : "createBooking({flightId, seatNumber, seatClass})"
Svc->>Ctrl : "POST /bookings"
Ctrl->>SvcB : "createBooking(...)"
SvcB-->>Ctrl : "BookingResponse"
Ctrl-->>Svc : "200 OK"
Svc-->>Store : "booking"
Store-->>UI : "booking"
```

**Diagram sources**
- [BookingPage.tsx:139-157](file://skyflow-pro-enhanced/src/pages/BookingPage.tsx#L139-L157)
- [bookingStore.ts:62-75](file://skyflow-pro/src/stores/bookingStore.ts#L62-L75)
- [bookingService.ts:20-28](file://skyflow-pro/src/services/bookings/bookingService.ts#L20-L28)
- [BookingController.java:21-70](file://backend-server/src/main/java/com/skyflow/controller/BookingController.java#L21-L70)
- [BookingService.java:43-98](file://backend-server/src/main/java/com/skyflow/service/BookingService.java#L43-L98)

**Section sources**
- [bookingStore.ts:62-75](file://skyflow-pro/src/stores/bookingStore.ts#L62-L75)
- [bookingService.ts:19-39](file://skyflow-pro/src/services/bookings/bookingService.ts#L19-L39)
- [BookingController.java:21-70](file://backend-server/src/main/java/com/skyflow/controller/BookingController.java#L21-L70)
- [BookingService.java:43-98](file://backend-server/src/main/java/com/skyflow/service/BookingService.java#L43-L98)

## Dependency Analysis
- Backend dependencies:
  - BookingController depends on BookingService.
  - BookingService depends on SeatRepository, FlightRepository, BookingRepository, UserRepository, and NotificationService.
  - SeatRepository extends JPA repositories and defines JPQL queries with locking.
- Frontend dependencies:
  - BookingPage.tsx depends on FlightService for fare breakdown and uses seatTypeConfig and seatRows.
  - bookingStore.ts integrates with bookingService.ts for API calls.
  - pricingEngine.ts provides pricing logic independent of UI.

```mermaid
graph LR
FE_UI["BookingPage.tsx"] --> FE_Store["bookingStore.ts"]
FE_Store --> FE_API["bookingService.ts"]
FE_API --> BE_Ctrl["BookingController.java"]
BE_Ctrl --> BE_Svc["BookingService.java"]
BE_Svc --> BE_RepoSeat["SeatRepository.java"]
BE_RepoSeat --> BE_EntitySeat["Seat.java"]
BE_Svc --> BE_EntityFlight["Flight.java"]
```

**Diagram sources**
- [BookingPage.tsx:60-722](file://skyflow-pro-enhanced/src/pages/BookingPage.tsx#L60-L722)
- [bookingStore.ts:43-115](file://skyflow-pro/src/stores/bookingStore.ts#L43-L115)
- [bookingService.ts:19-39](file://skyflow-pro/src/services/bookings/bookingService.ts#L19-L39)
- [BookingController.java:14-89](file://backend-server/src/main/java/com/skyflow/controller/BookingController.java#L14-L89)
- [BookingService.java:22-148](file://backend-server/src/main/java/com/skyflow/service/BookingService.java#L22-L148)
- [SeatRepository.java:13-24](file://backend-server/src/main/java/com/skyflow/repository/SeatRepository.java#L13-L24)
- [Seat.java:13-29](file://backend-server/src/main/java/com/skyflow/model/entity/Seat.java#L13-L29)
- [Flight.java:12-42](file://backend-server/src/main/java/com/skyflow/model/entity/Flight.java#L12-L42)

**Section sources**
- [BookingController.java:14-89](file://backend-server/src/main/java/com/skyflow/controller/BookingController.java#L14-L89)
- [BookingService.java:22-148](file://backend-server/src/main/java/com/skyflow/service/BookingService.java#L22-L148)
- [SeatRepository.java:13-24](file://backend-server/src/main/java/com/skyflow/repository/SeatRepository.java#L13-L24)
- [Seat.java:13-29](file://backend-server/src/main/java/com/skyflow/model/entity/Seat.java#L13-L29)
- [Flight.java:12-42](file://backend-server/src/main/java/com/skyflow/model/entity/Flight.java#L12-L42)
- [BookingPage.tsx:60-722](file://skyflow-pro-enhanced/src/pages/BookingPage.tsx#L60-L722)
- [bookingStore.ts:43-115](file://skyflow-pro/src/stores/bookingStore.ts#L43-L115)
- [bookingService.ts:19-39](file://skyflow-pro/src/services/bookings/bookingService.ts#L19-L39)

## Performance Considerations
- Concurrency control:
  - PESSIMISTIC_WRITE lock ensures only one thread can modify a seat at a time, preventing race conditions.
- Database efficiency:
  - Unique constraint on (flight_id, seatNumber) supports fast lookups.
  - countBookedSeatsByFlight enables efficient seat occupancy reporting.
- Frontend responsiveness:
  - Debounce or throttle fare breakdown fetches when seatType changes.
  - Local demo fallback avoids blocking UI on backend unavailability.

[No sources needed since this section provides general guidance]

## Troubleshooting Guide
- Common backend errors:
  - Missing or invalid payload fields result in 400 responses.
  - Seat already booked raises a conflict; adjust selection or retry later.
  - Seat not found triggers a controlled error path; verify flightId and seatNumber.
- Frontend handling:
  - Demo mode fallback allows users to continue even if backend is unreachable.
  - Validation messages guide users to correct input (e.g., missing passenger/payment details).
- Cancellation:
  - Ensure the correct user context; unauthorized cancellations are rejected.
  - After cancellation, seat becomes available again and flight.availableSeats increments.

**Section sources**
- [BookingController.java:33-69](file://backend-server/src/main/java/com/skyflow/controller/BookingController.java#L33-L69)
- [BookingService.java:107-127](file://backend-server/src/main/java/com/skyflow/service/BookingService.java#L107-L127)
- [BookingPage.tsx:139-157](file://skyflow-pro-enhanced/src/pages/BookingPage.tsx#L139-L157)
- [bookingStore.ts:77-90](file://skyflow-pro/src/stores/bookingStore.ts#L77-L90)

## Conclusion
The seat selection and allocation system combines a robust backend with a responsive frontend:
- Backend: strict concurrency control via pessimistic locking, seat and flight availability management, and class-based pricing.
- Frontend: intuitive seat map with dynamic pricing, seamless booking flow, and graceful fallback behavior.
Together, they deliver a reliable, scalable, and user-friendly seat booking experience.