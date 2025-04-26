# AMMS - Arms Movement Management System

Welcome to the **Arms Movement Management System (AMMS)** project!  
This system is designed to manage the movement, requisition, and tracking of arms within an organization.

---

## 📂 Repository Structure

```
amms/
├── backend/             # Django backend code (API, models, views)
├──db        
├── frontend/            # React frontend code (pages, components)
├── nginx.conf           # Nginx configuration for production setup
├── docker-compose.yml   # Docker Compose setup for full project stack
├── README.md            # Project documentation
└── .gitignore           # Files and folders to ignore in git
```

---

## 📌 Project Status

- ✅ **Frontend**: Development in progress — expected to be finalized by **Tuesday**.
- 🔜 **Backend**: Development will start immediately after frontend is finalized.
- 🛠️ **Setup & deployment**: Docker and Docker Compose setup completed.

---

## 🚀 How to Run Locally

1. **Clone the repository**

```bash
git clone https://github.com/EZENGESH/amms-arms-management.git
cd amms-arms-management
```

2. **Start the project using Docker**

```bash
docker compose up --build
```

3. **Access the project**

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000/api/`

---

## 🛠️ Tech Stack

| Part       | Technology                         |
|------------|-------------------------------------|
| Frontend   | React.js, Tailwind CSS, Vite        |
| Backend    | Django, Django REST Framework       |
| Database   | PostgreSQL                          |
| Queue      | Celery (planned) with Redis Broker  |
| Container  | Docker & Docker Compose             |
| Web Server | Nginx (for production)              |

---

## ✨ Features (Planned)

- User authentication and registration
- Requisition creation and approval workflow
- Arms inventory tracking
- Admin dashboard for management
- Role-based access control

---

## 🗕️ Next Steps

- [x] Setup project repository and environment
- [x] Build initial frontend screens
- [ ] Complete frontend validation and UI polish
- [ ] Start backend API development (Django REST Framework)
- [ ] API connection between frontend and backend
- [ ] Deployment guide and full documentation

---

## 👨‍🎓 About

> This is a **Final Year University Project** focused on developing a secure and efficient arms management system for organizational use.

---

## 📄 License

> (to be added latter.)

