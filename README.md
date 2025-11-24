# PW Studios - MERN Stack Application

## Prerequisites
- Node.js installed
- MongoDB installed and running locally (or update `.env` with Atlas URI)

## Setup & Run

### 1. Backend Setup
```bash
cd server
npm install
# Ensure MongoDB is running on localhost:27017
# Seed the database with initial data
npm run server
# In a separate terminal or browser, visit: http://localhost:5000/api/seed
# This will create the default admin and faculty users.
```

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev
```

### 3. Usage
- Open `http://localhost:5173`
- **Login Credentials:**
  - **Faculty:** `alakh@pw.live` / `password123`
  - **Admin:** `admin@pw.live` / `password123`

## Features
- **Authentication:** JWT-based login (Mock SSO).
- **Studio Discovery:** List view with search.
- **Booking:** Real-time conflict checking and booking creation.
- **Recommendations:** Mock ML engine suggesting studios.
- **Responsive UI:** Built with Tailwind CSS.

## Project Structure
- `/server`: Express API
- `/client`: React + Vite Frontend
