# TrustBite: Lead Backend Engineer & Team Lead Report
**Project Context:** Deployed Production MVP  
**Architecture:** FastAPI Monolith  
**Focus:** Security, Role Isolation, & Service Scalability

---

## 1. System Architecture Overview
The backend follows a **Service-Router-Schema** pattern to ensure a clean separation of concerns:
- **Router Layer**: Handles HTTP requests, path parameters, and request/response serialization.
- **Service Layer**: Contains the core business logic (e.g., Trust Score calculation, Review ownership validation).
- **Schema Layer (Pydantic)**: Defines data validation and API contracts.
- **Model Layer (SQLAlchemy)**: Maps Python objects to the PostgreSQL database.

## 2. File-by-File Technical Audit

### Identity & Security
- **`app/core/security.py`**
  - **Purpose**: Central engine for authentication and password safety.
  - **Major Functions**: `hash_password`, `verify_password`, `create_access_token`.
  - **Critical Logic**: Implements a safety check for bcrypt's 72-byte limit. If a password exceeds this, it returns `False` immediately to prevent internal server crashes.
  - **Interactions**: Used by `auth.py` and all protected routes via `get_current_user`.

- **`app/routers/auth.py`**
  - **Purpose**: Handles the user lifecycle (Login/Register).
  - **Major Functions**: `register`, `login`, `me`.
  - **Logic**: Enforces role assignment. Validates that the role provided is within `['student', 'mess_owner', 'admin']`.
  - **Interactions**: Communicates with `security.py` for hashing and token generation.

### Business Logic (Services)
- **`app/services/review_service.py`**
  - **Purpose**: Manages the review lifecycle and data integrity.
  - **Important Logic**: 
    - **Ownership Protection**: Ensures `user_id` of the requester matches the `user_id` of the review before allowing a `PUT` or `DELETE`.
    - **Rating Recalculation**: Automatically triggers an update to the Mess's `avg_rating` and `review_count` after every change.
  - **Interactions**: Updates the `Mess` model directly after processing `Review` data.

- **`app/services/ai_service.py`**
  - **Purpose**: The "Intelligence" layer of TrustBite.
  - **Logic**: Implements a weighted recommendation algorithm. It pulls messes based on student preferences (Diet, Budget, City) and sorts them by a combination of `Trust Score` and `Rating`.

## 3. Database Schema & SQLAlchemy Relationships
- **User Table**: Stores roles and credentials. Has a `1-to-Many` relationship with `messes` (if owner) and `reviews` (if student).
- **Mess Table**: The core entity. Includes fields for `hygiene_score`, `trust_score`, and `fssai_license`.
- **Review Table**: Links `User` and `Mess`. Includes a unique constraint or service-level check to prevent duplicate reviews by the same user for the same mess.

## 4. Production Deployment & CORS Fixes
- **Platform**: Render (Web Service).
- **Database**: PostgreSQL (External managed instance).
- **The CORS Bug**: Production rejection from Vercel.
  - **Root Cause**: The `CORS_ORIGINS` environment variable was being read as a single string.
  - **The Fix**: 
    ```python
    origins = [o.strip() for o in settings.CORS_ORIGINS.split(",")]
    app.add_middleware(CORSMiddleware, allow_origins=origins, ...)
    ```
- **The Bcrypt Bug**: Production crash on Linux environments.
  - **Root Cause**: Version mismatch in `bcrypt` library.
  - **The Fix**: Pinned `bcrypt==3.2.2` and `passlib[bcrypt]==1.7.4` in `requirements.txt`.

## 5. Faculty Defense: Technical Q&A
- **Q: Why use a Service Layer instead of putting logic in Routers?**  
  - **A:** To follow the **DRY (Don't Repeat Yourself)** principle. If we later add a Mobile App or a CLI, we can reuse the same `review_service.py` logic without duplicating it across different routers.
- **Q: How do you handle Session Management?**  
  - **A:** We use **Stateless JWT Authentication**. The server doesn't store session IDs; instead, it validates the cryptographically signed token sent in the `Authorization` header. This makes the backend horizontally scalable.

---
**Document Status:** Final  
**Author:** Antigravity AI (Lead Backend)
