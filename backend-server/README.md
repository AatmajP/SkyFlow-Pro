# SkyFlow Pro Backend Server

Production-ready backend for the Airline Reservation System using Spring Boot and PostgreSQL.

## Prerequisites

- **Docker Desktop** (or Docker Engine + Compose)
- Java 17 (optional, if running locally without Docker)
- Maven (optional, if running locally)

## Quick Start (Docker)

The easiest way to run the entire backend (Server + Database) is using Docker Compose.

1.  Navigate to the `backend-server` directory (where `docker-compose.yml` is located).
2.  Run the following command:

    ```bash
    docker compose up --build
    ```

3.  Wait for the logs to stabilize. You will see:
    - PostgreSQL starting on port `5432`
    - Spring Boot starting on port `8080`
    - "Started SkyflowApplication in ..." message.

The backend is now running at `http://localhost:8080`.

## Features & Logic

-   **Database Seeding**: On first startup, the system automatically creates tables and populates them with:
    -   Multiple Airlines (including the proprietary **Patro Airlines**).
    -   Cities with tags (Beach, Mountains, etc.).
    -   Hundreds of realistic flights for the next 30 days.
    -   Default users (`user`/`password`, `admin`/`admin`).
-   **Security**: JWT-based authentication. Use `/auth/login` to get a token.
-   **Search**: returns simulated but consistent flight data with class-based pricing.
-   **Booking**: Manages seat locking and prevents double booking via SQL constraints.

## API Endpoints

### Authentication
-   `POST /auth/register` - `{ "username": "...", "password": "..." }`
-   `POST /auth/login` - `{ "username": "...", "password": "..." }` -> Returns JWT Token

### Flights
-   `GET /cities` - List all cities
-   `GET /cities?tag=beach` - Filter cities by tag
-   `GET /flights/search?from=JFK&to=LHR&date=2024-05-20` - Search flights (requires auth header if secure, or you can disable security for testing in SecurityConfig)

### Bookings (Requires `Authorization: Bearer <token>`)
-   `POST /bookings` - Create booking
    ```json
    { "flightId": 1, "seatNumber": "12A", "seatClass": "Economy" }
    ```
-   `GET /bookings/my-bookings` - View user history
-   `POST /bookings/cancel/{id}` - Cancel booking

### Other
-   `GET /notifications` - User notifications
-   `POST /chat/support` - Get support facts

## Troubleshooting

-   **Database connection failed**: Ensure port `5432` is not occupied by a local Postgres instance. Stop local services or change the port in `docker-compose.yml`.
-   **Build fails**: Ensure Docker has internet access to pull Maven/JDK images.

## Testing
You can use Postman or curl to test the APIs.

```bash
# Login
curl -X POST http://localhost:8080/auth/login -H "Content-Type: application/json" -d '{"username":"user","password":"password"}'

# Search
curl "http://localhost:8080/flights/search?from=JFK&to=LHR&date=2024-06-01" -H "Authorization: Bearer <TOKEN>"
```
