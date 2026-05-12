# TrustBite: Final Project Engineering Report
**Concept:** A Multi-Role Trust Ecosystem for Student Dining  
**Technology:** FastAPI + React + PostgreSQL  

---

## 1. Executive Summary
TrustBite is a digital platform designed to resolve the accountability and transparency crisis in the local mess industry. It provides students with verified hygiene data and peer reviews while offering mess owners a professional management interface.

## 2. Problem Statement
Hostel students across India lack a reliable way to:
1. Verify the **hygiene standards** of a mess before subscribing.
2. Access **real student feedback** without social bias.
3. Compare **subscription plans** (weekly/monthly) efficiently.

## 3. Proposed Solution
A dual-facing ecosystem:
- **Discovery App (Student)**: Personalised recommendations based on diet, budget, and hygiene priority.
- **Management Suite (Owner)**: A portal for owners to showcase FSSAI verification and manage operational transparency.

## 4. Key Innovations
### **The Trust Score Algorithm**
Unlike generic rating systems (like Google Maps), TrustBite implements a weighted **Trust Score**:
- **40%**: FSSAI Verification Status.
- **30%**: Average Student Rating.
- **20%**: Hygiene-specific Review Keywords.
- **10%**: Operational Longevity/Consistency.

### **Role-Isolated Lifecycles**
The system treats Students and Owners as completely different product experiences, ensuring that a "Mess Owner" is never confused with a "Consumer" within the architecture.

## 5. System Workflow
1. **User Auth**: Secured via JWT and Bcrypt hashing.
2. **Onboarding**: 
   - Students set diet/budget preferences.
   - Owners submit FSSAI and mess operational data.
3. **Core Cycle**: 
   - Students discover messes via AI-powered sorting.
   - Students leave reviews and "Favourite" messes.
   - Owners update menus and monitor their Mess Analytics.

## 6. Challenges & Engineering Triumphs
- **The CORS/Production Hurdle**: Overcame cross-origin rejection during the migration from Localhost to Vercel/Render by implementing a dynamic origin-parsing middleware.
- **Bcrypt Compatibility**: Resolved a critical production environment crash by identifying OS-level library conflicts and pinning stable dependencies.
- **State Hydration**: Solved the "Flicker" bug where users were redirected to login erroneously during page refresh by implementing an async `checkAuth()` lifecycle in the root component.

## 7. Faculty Defense (Viva) Questions
- **Q: How is this better than Zomato?**  
  - **A**: Zomato is optimized for one-time orders. TrustBite is built for **subscriptions**. We track monthly meal costs and "daily dining" trust factors (like consistent hygiene), which are the primary concerns for students.
- **Q: Why React over Vanilla JS?**  
  - **A**: The state management requirements (tracking login, preferences, and multi-step onboarding) would be too complex for Vanilla JS. React's component-based architecture allowed us to build a reusable UI that scales.
- **Q: How do you handle fake reviews?**  
  - **A**: We implement **Review Ownership Validation** on the backend. A user can only review a mess once, and we monitor the Trust Score for sudden, unnatural spikes in rating.

## 8. Conclusion & Future Scope
TrustBite has successfully moved from a local prototype to a deployed MVP. Future iterations will include:
- **Integrated Payments**: Direct subscription handling via UPI.
- **AI Menu Analysis**: Predicting price trends based on local market data.

---
**Presented By**: TrustBite Development Team  
**Submission Date**: May 10, 2026
