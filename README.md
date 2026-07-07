# 🏠 Monox Property Management System

A full-stack property management system designed to streamline the management of properties, tenants, and payments. Built with modern technologies, this application provides a scalable and secure platform for landlords, property managers, and administrators.

---

## 🚀 Features

* 🔐 **Authentication & Authorization**

  * Secure JWT-based authentication
  * Role-based access control (Admin, Manager, Tenant)

* 🏘️ **Property Management**

  * Add, update, and manage properties
  * Track property details and availability

* 👥 **Tenant Management**

  * Register and manage tenants
  * Assign tenants to properties

* 💳 **Payments & Tracking**

  * Monitor rent payments
  * Track payment history and outstanding balances

* 📊 **Dashboard & Insights**

  * Overview of properties, tenants, and financials
  * Data-driven insights for better decision-making

---

## 🛠️ Tech Stack

### Backend

* ASP.NET Core (.NET 8)
* Entity Framework Core
* PostgreSQL
* JWT Authentication

### Frontend

* React
* TypeScript
* Vite

### DevOps

* Docker & Docker Compose
* RESTful API architecture

---

## 📂 Project Structure

```
/backend        → ASP.NET Core API
/frontend       → React application
/database       → Database scripts & migrations
/docker         → Docker configuration
```

---

## ⚙️ Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/MonoxTI/MonoxProperty.git
cd MonoxProperty
```

### 2. Backend Setup

```bash
cd backend
dotnet restore
dotnet run
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### 4. Environment Variables

Create a `.env` file in the backend and frontend with the required configuration:

**Backend**

```
DB_CONNECTION=your_postgresql_connection_string
JWT_SECRET=your_secret_key
```

**Frontend**

```
VITE_API_URL=http://localhost:5000
```

---

## 🐳 Running with Docker (Recommended)

```bash
docker-compose up --build
```

---

## 🔐 API Authentication

All protected routes require a valid JWT token:

```
Authorization: Bearer <your_token>
```

---

## 📈 Future Improvements

* Payment gateway integration
* Email/SMS notifications
* Advanced analytics & reporting
* Mobile app version

---

## 🤝 Contributing

Contributions are welcome! Feel free to fork the repository and submit a pull request.

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Itumeleng Monokoane**
Software Developer | Full-Stack Engineer

---

## ⭐ Support

If you like this project, give it a star ⭐ and share it!
