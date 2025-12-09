# LeafSphere — Landscape Project

LeafSphere is a full-stack landscaping management platform (React + Vite frontend, Node/Express + Mongoose backend) for designing, booking, tracking and billing landscaping projects, inventory and staff workflows.

---

## Table of contents
- [Project overview](#project-overview)
- [Tech stack](#tech-stack)
- [Repo structure](#repo-structure)
- [Quick start](#quick-start)
  - [Backend](#backend)
  - [Frontend](#frontend)
- [Environment](#environment)
- [Key files & symbols](#key-files--symbols)
- [Generating reports & PDFs](#generating-reports--pdfs)
- [Contributing](#contributing)
- [License](#license)

---

## Project overview
LeafSphere centralizes:
- Project/blueprint management for landscapers
- Customer management and admin dashboards
- Inventory and rental orders
- Payment processing (service & inventory)
- Staff/driver workflows and notifications

---

## Tech stack
- Frontend: React, Vite, Tailwind CSS, Framer Motion
- Backend: Node.js, Express, MongoDB (Mongoose)
- Utilities: jsPDF / jspdf-autotable, react-hot-toast, lucide-react / heroicons

---

## Repo structure (high level)
- [package.json](package.json) — root
- BACKEND/
  - [.env](BACKEND/.env)
  - [server.js](BACKEND/server.js)
  - [Config/db.js](BACKEND/Config/db.js)
  - [Models/](BACKEND/Models/)
  - [utils/](BACKEND/utils/)
- FRONTEND/
  - [package.json](FRONTEND/package.json)
  - [vite.config.js](FRONTEND/vite.config.js)
  - [index.html](FRONTEND/index.html)
  - src/
    - [pages/](FRONTEND/src/pages/)
    - [components/](FRONTEND/src/components/)
    - [utils/reportGenerator.js](FRONTEND/src/utils/reportGenerator.js)
    - [App.css](FRONTEND/src/App.css)

---

## Quick start

Prerequisites: Node.js (16+), npm or yarn, MongoDB running.

### Backend
1. Open terminal, navigate to backend:
   - cd BACKEND
2. Install and run:
   - npm install
   - Create an `.env` (see [Environment](#environment))
   - npm run dev (or node server.js)

Main backend entry: [BACKEND/server.js](BACKEND/server.js)  
DB config: [BACKEND/Config/db.js](BACKEND/Config/db.js)

### Frontend
1. Open terminal, navigate to frontend:
   - cd FRONTEND
2. Install and run:
   - npm install
   - npm run dev

Frontend entry and Vite config: [FRONTEND/vite.config.js](FRONTEND/vite.config.js)  
Main HTML: [FRONTEND/index.html](FRONTEND/index.html)

---

## Environment
Example variables (backend .env):
- JWT_SECRET=your_jwt_secret
- MONGO_URI=mongodb://localhost:27017/leafsphere
- PORT=5001
- TWILIO_ACCOUNT_SID=...
- TWILIO_AUTH_TOKEN=...
- (Other service credentials used in BACKEND/utils/*)

See DB connection in [BACKEND/Config/db.js](BACKEND/Config/db.js) and token creation in [`generateToken`](BACKEND/utils/jwt.js).

---

## Key files & symbols
- Server start: [BACKEND/server.js](BACKEND/server.js)  
- DB config: [BACKEND/Config/db.js](BACKEND/Config/db.js)  
- Auth & token:
  - [`generateToken`](BACKEND/utils/jwt.js) — issues JWTs
  - [`generateTempPassword`](BACKEND/utils/authAndNotify.js) — helper for temporary credentials
- Payment model: [`Payment`](BACKEND/Models/payment/paymentModel.js) — payment schema
- Frontend pages:
  - Landing & marketing: [FRONTEND/src/pages/LandingPage.jsx](FRONTEND/src/pages/LandingPage.jsx)
  - Registration: [FRONTEND/src/pages/auth/Register.jsx](FRONTEND/src/pages/auth/Register.jsx)
  - Inventory order example: [FRONTEND/src/pages/Inventory/CreateOrder.jsx](FRONTEND/src/pages/Inventory/CreateOrder.jsx)
  - Project card/component: [FRONTEND/src/components/ProjectCard.jsx](FRONTEND/src/components/ProjectCard.jsx)
  - Navbar / Layout components:
    - [FRONTEND/src/components/Layout/navbar.jsx](FRONTEND/src/components/Layout/navbar.jsx)
    - [FRONTEND/src/components/Layout/AdminNavbar.jsx](FRONTEND/src/components/Layout/AdminNavbar.jsx)
    - [FRONTEND/src/components/LandscaperNavbar.jsx](FRONTEND/src/components/LandscaperNavbar.jsx)
    - [FRONTEND/src/components/Layout/CustomerNavbar.jsx](FRONTEND/src/components/Layout/CustomerNavbar.jsx)
- Report generation helper: [FRONTEND/src/utils/reportGenerator.js](FRONTEND/src/utils/reportGenerator.js) — uses jsPDF + autotable

---

## Generating reports & PDFs
The frontend uses jsPDF + jspdf-autotable in multiple dashboards. See:
- [FRONTEND/src/utils/reportGenerator.js](FRONTEND/src/utils/reportGenerator.js)
- Example dashboard usage: [FRONTEND/src/pages/CustomerManagement/Admin/CustomerManagement.jsx](FRONTEND/src/pages/CustomerManagement/Admin/CustomerManagement.jsx)

Note: some components assign jsPDF to window for plugin compatibility — see [FRONTEND/src/components/Inventory/ModernMachineryInventory.jsx](FRONTEND/src/components/Inventory/ModernMachineryInventory.jsx).

---

## Contributing
- Follow existing code patterns (React hooks + Tailwind for UI; Express + Mongoose backend).
- Run linters and tests (if added).
- Make small focused PRs with clear descriptions.

---

## Troubleshooting
- CORS / API base URL: frontend expects backend at http://localhost:5001 by default in several components (search for `http://localhost:5001` in `FRONTEND/src/`).
- Notifications polling: staff/admin navbars poll notifications — check those components if notification load fails:
  - [FRONTEND/src/components/Layout/AdminNavbar.jsx](FRONTEND/src/components/Layout/AdminNavbar.jsx)
  - [FRONTEND/src/components/LandscaperNavbar.jsx](FRONTEND/src/components/LandscaperNavbar.jsx)

---

## Resources
- Frontend README (project-specific notes): [FRONTEND/README.md](FRONTEND/README.md)
- Root package: [package.json](package.json)
- Backend utils: [BACKEND/utils/authAndNotify.js](BACKEND/utils/authAndNotify.js)

---

## License
Specify your license here (e.g., MIT). If none, add a LICENSE file.

---

For file-level questions or to add CI / deployment scripts, open the relevant file links above and update accordingly.