# TrustBite: Internal Engineering Audit & Technical Documentation
**Status:** Post-Production MVP  
**Auditor:** Antigravity AI Architect  

---

## 1. BACKEND ARCHITECTURE & DATA LIFECYCLE

### FILE: `app/main.py`
**PURPOSE:**  
The central orchestration layer. Manages the lifecycle of the FastAPI application.

**CORE LOGIC:**  
- **Middleware Chain**: Configures CORSMiddleware, GZipMiddleware (for performance), and Exception handlers.
- **Router Integration**: Mounts `/api/auth`, `/api/messes`, `/api/reviews`, and `/api/stats`.

**REAL PRODUCTION BUG FIXES:**  
- **CORS Normalization**: Standardized environment variable parsing to handle comma-separated strings from Render's dashboard.

---

### FILE: `app/core/security.py`
**PURPOSE:**  
Cryptography and Identity Verification.

**CORE LOGIC:**  
- **Bcrypt Implementation**: Implements password hashing with a 12-round salt.
- **JWT Claims**: Injects `role` and `sub` (User ID) into the payload.
- **Verification Guard**: Hardened `verify_password` to prevent Bcrypt's 72-byte buffer overflow by pre-validating input length.

**KEY FUNCTIONS:**  
- `create_access_token()`: Standardizes JWT generation.
- `get_current_user()`: The primary dependency for route protection.

---

### FILE: `app/services/review_service.py`
**PURPOSE:**  
Transactional integrity for the feedback ecosystem.

**CORE LOGIC:**  
- **Ownership Check**: Mandates that `review.user_id == current_user.id` for all mutations.
- **Rating Synchronization**: Triggers an atomic update to `messes.avg_rating` and `messes.review_count`.
- **Validation**: Prevents duplicate reviews via service-layer logic to maintain data purity.

---

## 2. FRONTEND ARCHITECTURE & STATE FLOW

### FILE: `src/services/api.js`
**PURPOSE:**  
The normalized Axios gateway.

**CORE LOGIC:**  
- **BaseURL Standardization**: Handles production vs local pathing.
- **Auth Injection**: Global interceptor that pulls the JWT from `localStorage` and injects it into the `Authorization` header.
- **Session Expiry Handler**: Intercepts 401/403 errors and triggers a global logout to prevent "Ghost Sessions".

---

### FILE: `src/store/useStore.js`
**PURPOSE:**  
Application state and Auth persistence.

**CORE LOGIC:**  
- **Stateless Hydration**: `checkAuth()` reconciles local tokens with the backend on every mount.
- **Persistence Layer**: Custom logic to sync Zustand state with `localStorage` for the `user` and `token` objects.

---

### FILE: `src/components/auth/ProtectedRoute.jsx`
**PURPOSE:**  
Structural Security Guard.

**CORE LOGIC:**  
- **Initialization Wait**: Prevents redirection flickers by waiting for `isInitializing`.
- **Role Permissioning**: Uses an `allowedRoles` array to perform O(1) lookups on user permissions before rendering children.

---

## 3. ENGINEERING LIFECYCLES (TRACED)

### **The Authentication Flow**
1. `POST /api/auth/register` → Schema validation → Bcrypt hashing → DB Insert.
2. `POST /api/auth/login` → Hash comparison → JWT generation → Access Token returned.
3. **Frontend**: Token stored in `localStorage` → Zustand updated → Axios interceptor enabled.

### **The Role-Based Redirection Flow**
1. **Login Event**: Store receives User object.
2. **Logic Branch**:
   - `mess_owner` → Checks `trustbite_owner_onboarding_complete` → Navigates to Dashboard or Setup.
   - `student` → Checks `trustbite_student_onboarding_complete` → Navigates to Dashboard or Preferences.
3. **Guard**: `ProtectedRoute` ensures that even if a URL is manually entered, the role mismatch triggers "Access Denied".

---

## 4. PRODUCTION ERROR RECOVERY LOG

| Incident | Root Cause | Solution |
| :--- | :--- | :--- |
| **Bcrypt 72-Byte Limit** | Passwords > 72 bytes crashed the hashing engine. | Added length validation in `security.py`. |
| **CORS "String of Origins"** | Render env var was parsed as one giant string. | Implemented `.split(",")` and `.strip()` logic. |
| **Role Collision** | Students seeing Owner onboarding screens. | Separated LocalStorage flags to `trustbite_student_...` and `trustbite_owner_...`. |
| **Blank Screen on Onboarding** | Missing `useStore` import in JSX. | Performed a full codebase audit and injected missing dependencies. |

---

## 5. ARCHITECTURAL VIVA / DEFENSE PREP

**Q: Why use a Service layer instead of putting logic in the Router?**  
**A:** Separation of Concerns. Routers should only handle HTTP concerns (status codes, parsing). Services handle business logic (calculating Trust Scores, verifying ownership). This makes the code **testable** and **reusable**.

**Q: How does the "Trust Score" differ from a standard Rating?**  
**A:** A Rating is purely user input. The **Trust Score** is an engineered metric that combines User Ratings, Review Volume, and **FSSAI Verification Status**. A mess with 5 stars but no FSSAI license will have a lower Trust Score than a 4-star verified mess.

**Q: What is your strategy for handling slow backend responses?**  
**A:** We use **Skeleton Loaders** and **Stateless Initialization**. The app renders immediate UI structures (skeletons) while the `checkAuth()` and `aiService` calls are in flight, ensuring a Perceived Performance that feels instantaneous to the user.
