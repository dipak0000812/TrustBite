# TrustBite: Frontend Developer & Team Manual
**Core Tech:** React + Vite + Zustand + Tailwind  
**Deployment:** Vercel  
**Architecture:** Role-Based Application Lifecycle

---

## 1. Project Structure Explained
- **`/src/components/`**: Reusable UI parts.
  - `layout/Navbar.jsx`: Smart navbar that changes based on role.
  - `auth/ProtectedRoute.jsx`: The "Security Guard" of our routes.
- **`/src/pages/`**: The actual screens of the app.
  - `student/`: Dashboard and Preference Onboarding.
  - `owner/`: Mess Management and Registration wizard.
- **`/src/store/`**: Global state (`useStore.js`). This is where we keep the `user` object and `token`.
- **`/src/services/`**: All backend communication logic.

## 2. The Routing & Security System
Our app uses **Role-Based Routing**. You cannot simply change the URL to access the Owner Dashboard if you are a Student.

### **ProtectedRoute.jsx**
- **How it works**: It checks `user.role` from the Zustand store.
- **Access Denied**: If a student tries to go to `/owner/dashboard`, this component renders an "Access Denied" screen and redirects them back to their own dashboard.

### **Role-Based Navigation**
In `LoginPage.jsx` and `RegisterPage.jsx`, we use a centralized branching logic:
```javascript
if (user.role === 'student') {
  navigate(isComplete ? '/student/dashboard' : '/student/onboarding');
} else if (user.role === 'mess_owner') {
  navigate(isOwnerComplete ? '/owner/dashboard' : '/owner/onboarding');
}
```

## 3. Onboarding & Persistence
We use `localStorage` to remember if a user has finished setting up their profile.
- **Student Key**: `trustbite_student_onboarding_complete`
- **Owner Key**: `trustbite_owner_onboarding_complete`

**Why separate keys?**  
Originally, we had one key, but it caused a bug where owners were seeing student setup screens. Separating them ensures a "Clean Product Lifecycle" for both users.

## 4. State Management (Zustand)
Instead of complex Redux, we use **Zustand**.
- **`useStore.js`**: Handles Login, Registration, and Auth persistence.
- **Hydration**: When the app starts, `checkAuth()` is called in `App.jsx`. It fetches the latest user profile from the backend to ensure the token hasn't expired.

## 5. UI/UX Standards
- **Skeleton Loaders**: Located in `src/components/Skeleton.jsx`. Use these instead of "Loading..." text to make the app feel faster.
- **Responsive Design**: We use Tailwind's `sm:`, `md:`, and `lg:` prefixes. The dashboard is designed to be mobile-first because most students use phones.
- **Animations**: We use `framer-motion` for page transitions. Look at `OnboardingPage.jsx` for examples of the `AnimatePresence` component.

## 6. Common Debugging Tips
- **Blank Screen?** Check if you imported `useStore` or `useNavigate`. These are the most common causes of crashes.
- **Access Denied?** Check if the backend is returning the correct role string (`student` or `mess_owner`).
- **CORS Error?** This is usually a backend configuration issue, but ensure your `api.js` is pointing to the correct Render URL.

---
**Prepared for:** TrustBite Frontend Team  
**Maintainer:** Lead Frontend Engineer
