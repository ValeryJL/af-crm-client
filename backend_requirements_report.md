# Backend Requirements Report (Sprint 2 / Real Data Integration)

The frontend application has been updated to remove all mock data. It now connects directly to the REST API on `localhost:8080` (or the network counterpart) using the endpoints specified in `api_endpoints.md`. 

Since the frontend is now "live", here are the detailed observations and requirements needed from the Backend moving forward to ensure the UI works flawlessly:

## 1. Dashboard Metrics Endpoint
- **Current Status:** The Dashboard currently has to fetch the entire list of `GET /api/technicians` and `GET /api/services` just to count the `length` of the arrays. 
- **Requirement:** For performance, we need a lightweight stats endpoint (e.g., `GET /api/stats/dashboard`).
- **Expected Payload:**
  ```json
  {
    "activeServicesCount": 45,
    "availableTechniciansCount": 8,
    "pendingTasksCount": 12
  }
  ```

## 2. Empty State Handling
- **Current Status:** If no data exists in the database, the frontend expects an empty array `[]` rather than a `404 Not Found` error. 
- **Requirement:** Ensure endpoints like `GET /api/technicians` return `200 OK` with `[]` when the tables are completely empty, not an exception.

## 3. Login User Data (`AdminSeeder.java` issue)
- **Current Status:** The initial Admin user is seeded without a name or surname. When decoding the JWT on the frontend, the UI falls back to parsing the email address because `name` or `nombre` claims are missing in the token.
- **Requirement:** When users are created (or seeded), they should technically require basic identifiable properties or the JWT generator should be configured to inject a default name claim.

## 4. `status` vs `baja` (Services and Technicians logic)
- **Current Status:** The frontend interpolates `"ACTIVE"` or `"INACTIVE"`. For services, it uses `svc.baja == null` to determine if it is active. For technicians, there isn't a defined active/inactive flag in the payload schema currently provided.
- **Requirement:** Ensure that when a technician is dismissed or unavailable, they have an explicit `status` string or `baja` date so the UI can flag them out of the rotas.

## 5. Pagination / Search Filtering
- **Current Status:** Search is happening client-side (frontend downloads ALL technicians and filters them in memory).
- **Requirement:** As the database grows, we will need to transition this. Please add query parameter support in the future (e.g., `GET /api/technicians?search=juan`).

---
***Prepared by the Frontend Team to align with the Backend architecture.***
