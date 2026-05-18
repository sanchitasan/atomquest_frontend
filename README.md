# 🚀 AlignIQ Frontend

## Transform Your Goal Management

AlignIQ is a modern Shaerd Goal & Goal Management platform designed for Employees, Managers, and Admins to collaboratively manage organizational objectives, approvals, and performance tracking.

Built with **React**, **Vite**, and modern UI technologies, the frontend delivers a responsive, glassmorphic, and analytics-driven experience with role-based dashboards and real-time workflow interaction.

---

# 🌐 Project Overview

The frontend serves as the primary interaction layer for the AlignIQ ecosystem and integrates directly with the FastAPI backend APIs.

Core capabilities include:

- Goal Creation & Submission
- KPI Tracking & Check-ins
- Manager Approval Workflows
- Shared Goal Management
- Reporting & Analytics
- Audit Monitoring
- Role-Based Navigation & Dashboards

---

# 🎨 Tech Stack

| Category | Technology |
|---|---|
| Framework | React 19 + Vite |
| Styling | Tailwind CSS + DaisyUI 5 |
| Animations | Framer Motion |
| Charts | Recharts |
| Icons | Lucide React |
| API Client | Axios |
| 3D Components | Spline React |
| State Management | React Hooks |
| Authentication | JWT |

---

# 🔄 User Workflow

The application follows a role-based authentication and dashboard workflow:

### Authentication Flow
1. User enters the landing page
2. Existing users log in
3. New users can sign up
4. JWT token and user role are stored after authentication
5. User is redirected to the appropriate dashboard

### Role-Based Dashboards
- **Employee Dashboard**
  - Goals
  - Check-ins
  - Assigned Goals
  - Shared Goal Overview

- **Manager Dashboard**
  - Team Progress
  - Share goal Assignment
  - Goal Approvals
  - Employee Monitoring

- **Admin Dashboard**
  - Audit Logs
  - Reports
  - System Analytics
  - User Management

---

# 🏗️ Frontend Architecture

The application uses a centralized `MainLayout` architecture with dynamic role-aware navigation and workspace rendering.

### Main Layout Components
- Sticky Header
- Dynamic Sidebar Navigation
- Protected Content Area
- Responsive Workspace
- Footer Section

### Dynamic Navigation
Navigation automatically changes depending on the authenticated user role.

#### Employee Navigation
- Dashboard
- Goals
- Check-ins

#### Manager Navigation
- Dashboard
- Team
- Assign KPI

#### Admin Navigation
- Dashboard
- Audit
- Reports

---

# 🧠 Application Features

## 🔐 Authentication System
- JWT token-based login
- Secure token storage
- Automatic role detection
- Protected routes
- Session persistence

---

## 🎯 Employee Features
- Create goals
- Submit goals for approval
- Track KPI progress
- Add quarterly check-ins
- View assigned/shared goals

---

## 👨‍💼 Manager Features
- Approve or reject goals
- Monitor team progress
- Assign departmental KPIs
- View team analytics
- Conduct check-ins

---

## 🛡️ Admin Features
- View audit logs
- Manage reports
- Monitor organization-wide KPIs
- Unlock locked goals
- System oversight dashboard

---

# 📈 Goal Lifecycle

The frontend supports the complete goal workflow:

1. Goal Draft Creation
2. Goal Submission
3. Manager Review
4. Approval or Rejection
5. Quarterly Progress Updates
6. Goal Completion
7. Goal Locking & Finalization

---

# 📂 Folder Structure

```bash
AlignIQ_frontend/
│
├── src/
│   ├── api/
│   ├── assets/
│   ├── components/
│   ├── layouts/
│   ├── pages/
│   ├── routes/
│   ├── hooks/
│   ├── utils/
│   └── styles/
│
├── public/
├── tailwind.config.js
├── vite.config.js
├── package.json
└── README.md
```

---

# 🚀 Getting Started

## 1️⃣ Clone Repository

```bash
git clone https://github.com/sanchitasan/AlignIQ_frontend.git
```

---

## 2️⃣ Enter Project Directory

```bash
cd AlignIQ_frontend
```

---

## 3️⃣ Install Dependencies

```bash
npm install
```

---

## 4️⃣ Configure Environment Variables

Create a `.env` file in the root directory:

```env
VITE_BACKEND_URL=https://atomquest-backend-anqi.onrender.com/api
```

---

## 5️⃣ Run Development Server

```bash
npm run dev
```

Application runs at:

```bash
http://localhost:5173
```

---

# 🔐 Role-Based Access Control (RBAC)

| Role | Permissions |
|---|---|
| Employee | Manage goals, submit check-ins, track personal KPIs |
| Manager | Approve goals, manage team KPIs, track employees |
| Admin | Access reports, audit logs, organization-wide monitoring |

---

# 📊 Dashboard Features

## Employee Dashboard
- KPI progress tracking
- Goal submission workflow
- Shared goal visibility
- Quarterly updates

---

## Manager Dashboard
- Team analytics
- Goal approval queue
- KPI assignment tools
- Check-in monitoring

---

## Admin Dashboard
- System-wide reports
- Audit logs
- Completion analytics
- Goal unlock management

---

# ✨ UI & Experience Features

✅ Glassmorphic Design System  
✅ Smooth Framer Motion Animations  
✅ Responsive Mobile-First Layout  
✅ Real-Time KPI Visualization  
✅ Interactive Charts & Graphs  
✅ Protected Role-Based Navigation  
✅ Dynamic Sidebar & Layouts  
✅ High-Performance Vite Build  

---

# 📡 API Integration

The frontend communicates with the FastAPI backend using Axios-based API services.

### Connected Backend Features
- Authentication APIs
- Goal APIs
- Check-in APIs
- Dashboard APIs
- Reporting APIs
- Audit APIs

---

# 🌍 Deployment

| Layer | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| Database | MySQL / PostgreSQL |

---

# 🔗 Live Demo

## Frontend Deployment
https://aligniq-nine.vercel.app/

---

# 🔗 Related Repository

## Backend Repository
https://github.com/sanchitasan/AlignIQ_backend

---

# 👨‍💻 Developed By

Built for **AtomQuest Hackathon 1.0**

Sanchita Priyadarshinee

---

# 📜 License

This project is licensed under the MIT License.

---
