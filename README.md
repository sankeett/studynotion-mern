# 🎓 StudyNotion – EdTech Platform (MERN Stack)

StudyNotion is a fully functional EdTech platform built using the **MERN Stack** (MongoDB, Express.js, React.js, Node.js).  
It enables users to create, consume, rate, and manage educational content in a seamless and interactive environment.

---

## 🛠️ Tech Stack

### Frontend
- React.js
- Redux Toolkit
- Tailwind CSS
- Axios
- React Router DOM

### Backend
- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT Authentication
- Bcrypt (Password Hashing)
- Razorpay (Payment Integration)
- Cloudinary (Media Storage)

---

## 🏗️ System Architecture

StudyNotion follows a **Client-Server Architecture**:

- **Frontend (React)** → Handles UI and API calls  
- **Backend (Node + Express)** → Business logic and APIs  
- **Database (MongoDB Atlas)** → Stores users, courses, payments  
- **Cloudinary** → Stores media (images/videos)  
- **Razorpay** → Handles secure payments  

---

## ✨ Features

### 👨‍🎓 For Students
- Signup / Login with JWT Authentication
- OTP Email Verification
- Browse & Search Courses
- Add to Wishlist
- Secure Checkout (Razorpay Integration)
- Enroll & Watch Course Content
- Rate & Review Courses
- Update Profile & Password

### 👨‍🏫 For Instructors
- Create / Update / Delete Courses
- Upload Media (Cloudinary)
- View Enrolled Students
- Dashboard Insights
- Manage Profile

### 🔐 Security Features
- JWT Authentication
- Password Hashing using Bcrypt
- Protected Routes
- Role-Based Access Control
- Secure Payment Verification

---

## 📂 Project Structure

StudyNotion/
│
├── server/
│ ├── controllers/
│ ├── models/
│ ├── routes/
│ ├── middlewares/
│ ├── config/
│ └── utils/
│
├── src/
│ ├── components/
│ ├── pages/
│ ├── services/
│ ├── slices/
│ └── assets/
│
└── public/


---

## 📡 REST API Endpoints (Sample)

### Authentication
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/verify-otp`
- `POST /api/auth/forgot-password`

### Courses
- `GET /api/courses`
- `GET /api/courses/:id`
- `POST /api/courses`
- `PUT /api/courses/:id`
- `DELETE /api/courses/:id`
- `POST /api/courses/:id/rate`

---

## ⚙️ Installation & Setup

### 1️⃣ Clone Repository

```bash
git clone https://github.com/sankeett/studynotion-mern.git
cd studynotion-mern

2️⃣ Setup Backend
cd server
npm install


Create a .env file inside /server:

PORT=
MONGODB_URL=
JWT_SECRET=
CLOUDINARY_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
RAZORPAY_KEY=
RAZORPAY_SECRET=


Run backend:

npm run dev

3️⃣ Setup Frontend
cd ..
npm install
npm start

🚀 Deployment

Frontend → Vercel

Backend → Render / Railway

Database → MongoDB Atlas

Media Storage → Cloudinary

🔮 Future Enhancements

Gamification (Badges, Points, Leaderboards)

Personalized Learning Paths

Social Learning Features

Mobile App

AI-based Course Recommendations

VR/AR Learning Modules

👨‍💻 Author

Sanket
Full Stack Developer | MERN Stack

📌 Key Highlights

End-to-End Full Stack Application

Real Payment Integration

Cloud-based Media Management

Production-ready Authentication System

Scalable MVC Backend Architecture

