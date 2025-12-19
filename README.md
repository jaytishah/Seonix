# Seonix - AI Proctored Exam System 🎓

<div align="center">
  <img src="https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React"/>
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js"/>
  <img src="https://img.shields.io/badge/MongoDB-6.0+-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB"/>
  <img src="https://img.shields.io/badge/Express-4.21.2-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express"/>
</div>

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Screenshots](#screenshots)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

## 🎯 About

**Seonix** is a comprehensive AI-powered proctored examination system designed to conduct secure online exams with real-time monitoring and intelligent proctoring capabilities. The platform provides a complete solution for educational institutions and organizations to conduct fair and secure online assessments.

The system features:
- **Secure Exam Environment**: Prevents cheating through tab switching detection, fullscreen enforcement, and copy-paste restrictions
- **AI-Powered Proctoring**: Real-time monitoring with webcam integration and suspicious activity detection
- **Instant Results**: Automated grading and immediate score calculation
- **User-Friendly Interface**: Intuitive dashboards for both students and teachers
- **Comprehensive Analytics**: Detailed violation logs and performance tracking

## ✨ Features

### For Students
- 📝 **Browse Available Exams**: View all upcoming and active exams
- ⏱️ **Timed Examinations**: Take exams with countdown timers
- 📸 **Webcam Monitoring**: Real-time proctoring during exams
- 🚫 **Cheat Prevention**: Tab switch detection, fullscreen mode enforcement
- 📊 **Instant Results**: View scores and performance immediately after submission
- 📈 **Performance Dashboard**: Track exam history and average scores

### For Teachers
- 📋 **Create Exams**: Set up comprehensive exams with custom settings
- ❓ **Question Management**: Add, edit, and manage multiple-choice questions
- ⚙️ **Exam Configuration**: Set duration, passing marks, start/end times
- 👥 **Student Monitoring**: Real-time proctoring logs and violation tracking
- 📊 **Results Analytics**: View detailed exam results and statistics
- 🚩 **Flagged Students**: Identify high-risk students based on violation counts

### Security Features
- 🔒 **JWT Authentication**: Secure token-based authentication
- 🔐 **Role-Based Access Control**: Separate permissions for students and teachers
- 👁️ **Tab Switch Detection**: Monitors and logs when students leave the exam tab
- 🖥️ **Fullscreen Enforcement**: Requires fullscreen mode during exams
- 📹 **Webcam Monitoring**: Optional webcam capture for enhanced security
- ⌨️ **Copy-Paste Prevention**: Blocks clipboard operations during exams

## 📸 Screenshots

![Screenshot 1](screenshots/Screenshot%20(49).png)

![Screenshot 2](screenshots/Screenshot%20(50).png)

![Screenshot 3](screenshots/Screenshot%20(51).png)

![Screenshot 4](screenshots/Screenshot%20(52).png)

![Screenshot 5](screenshots/Screenshot%20(53).png)

![Screenshot 6](screenshots/Screenshot%20(54).png)

![Screenshot 7](screenshots/Screenshot%20(55).png)

![Screenshot 8](screenshots/Screenshot%20(57).png)

![Screenshot 9](screenshots/student-dashboard.png)

## 🛠️ Tech Stack

### Frontend
- **React 18.3.1** - UI library
- **Redux Toolkit** - State management
- **React Router DOM** - Navigation
- **Axios** - HTTP client
- **Vite** - Build tool and dev server
- **CSS3** - Styling

### Backend
- **Node.js** - Runtime environment
- **Express.js 4.21.2** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose 8.8.4** - ODM for MongoDB
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **CORS** - Cross-origin resource sharing

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v6.0 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **npm** or **yarn** - Package manager (comes with Node.js)
- **Git** - Version control

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/jaytishah/Seonix.git
cd Seonix
```

### 2. Install Backend Dependencies

```bash
cd seonix-backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../seonix-frontend
npm install
```

## ⚙️ Configuration

### Backend Configuration

1. **Create Environment File**

   Create a `.env` file in the `seonix-backend` directory:

   ```bash
   cd seonix-backend
   touch .env  # On Windows: type nul > .env
   ```

2. **Add Environment Variables**

   Open `.env` and add the following:

   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/seonix
   # Or use MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/seonix

   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
   JWT_EXPIRE=7d

   # CORS Configuration
   CLIENT_URL=http://localhost:5173
   ```

   **Important**: Replace `your_super_secret_jwt_key_here_change_this_in_production` with a strong, random secret key.

3. **Generate a Secure JWT Secret** (Optional but recommended)

   You can generate a random secret using Node.js:

   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

### Frontend Configuration

1. **Create Environment File** (if needed)

   Create a `.env` file in the `seonix-frontend` directory:

   ```bash
   cd ../seonix-frontend
   touch .env  # On Windows: type nul > .env
   ```

2. **Add API URL** (if different from default)

   ```env
   VITE_API_URL=http://localhost:5000
   ```

   > **Note**: The frontend is configured to use `http://localhost:5000` by default in the API service file.

## 🎮 Running the Application

### Method 1: Run Separately (Recommended for Development)

#### 1. Start MongoDB

Make sure MongoDB is running:

```bash
# On Windows (if MongoDB is installed as a service)
net start MongoDB

# On macOS/Linux
sudo systemctl start mongod
# or
sudo service mongod start

# Or run MongoDB directly
mongod --dbpath /path/to/your/data/directory
```

#### 2. Start Backend Server

```bash
cd seonix-backend
npm start
```

The backend server will start on `http://localhost:5000`

#### 3. Start Frontend Development Server

Open a new terminal:

```bash
cd seonix-frontend
npm run dev
```

The frontend will start on `http://localhost:5173`

### Method 2: Run Concurrently

You can use `concurrently` to run both servers simultaneously:

```bash
# Install concurrently globally (one-time)
npm install -g concurrently

# From the root directory, create a package.json with scripts
# Or run from separate terminals as shown in Method 1
```

### 🌐 Access the Application

- **Frontend**: Open your browser and navigate to `http://localhost:5173`
- **Backend API**: `http://localhost:5000`
- **API Health Check**: `http://localhost:5000/api/health`

## 👥 Default Users

After running the application for the first time, you can create users through the registration page or use MongoDB Compass/Shell to create users manually.

### Creating a Teacher Account

1. Register through the UI at `http://localhost:5173/register`
2. Select "Teacher" as the role
3. Fill in the required details

### Creating a Student Account

1. Register through the UI at `http://localhost:5173/register`
2. Select "Student" as the role
3. Fill in the required details

## 📁 Project Structure

```
Seonix/
├── seonix-backend/
│   ├── config/
│   │   ├── constants.js       # Application constants
│   │   └── database.js         # MongoDB connection
│   ├── controllers/
│   │   ├── auth.controller.js       # Authentication logic
│   │   ├── exam.controller.js       # Exam management
│   │   ├── question.controller.js   # Question management
│   │   ├── session.controller.js    # Exam session handling
│   │   ├── proctoring.controller.js # Proctoring logs
│   │   └── result.controller.js     # Results management
│   ├── middleware/
│   │   ├── auth.middleware.js       # JWT verification
│   │   ├── roleCheck.middleware.js  # Role-based access
│   │   ├── validation.middleware.js # Input validation
│   │   └── errorHandler.middleware.js
│   ├── models/
│   │   ├── User.model.js           # User schema
│   │   ├── Exam.model.js           # Exam schema
│   │   ├── Question.model.js       # Question schema
│   │   ├── ExamSession.model.js    # Session schema
│   │   ├── ProctoringLog.model.js  # Proctoring schema
│   │   └── Result.model.js         # Result schema
│   ├── routes/
│   │   ├── auth.routes.js          # Auth endpoints
│   │   ├── exam.routes.js          # Exam endpoints
│   │   ├── question.routes.js      # Question endpoints
│   │   ├── session.routes.js       # Session endpoints
│   │   ├── proctoring.routes.js    # Proctoring endpoints
│   │   └── result.routes.js        # Result endpoints
│   ├── utils/
│   │   ├── generateToken.js        # JWT utilities
│   │   ├── validators.js           # Validation helpers
│   │   ├── helpers.js              # General utilities
│   │   └── examCleanup.js          # Cleanup utilities
│   ├── .env                        # Environment variables
│   ├── .gitignore
│   ├── package.json
│   └── server.js                   # Entry point
│
├── seonix-frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/                 # Images, icons
│   │   ├── components/
│   │   │   ├── common/             # Reusable components
│   │   │   └── layout/             # Layout components
│   │   ├── context/
│   │   │   └── ThemeContext.jsx    # Theme management
│   │   ├── hooks/
│   │   │   ├── useAuth.js          # Authentication hook
│   │   │   ├── useProctoring.js    # Proctoring hook
│   │   │   ├── useWebcam.js        # Webcam hook
│   │   │   ├── useTimer.js         # Timer hook
│   │   │   ├── useTabSwitch.js     # Tab detection hook
│   │   │   └── useFullscreen.js    # Fullscreen hook
│   │   ├── pages/
│   │   │   ├── auth/               # Login, Register
│   │   │   ├── student/            # Student pages
│   │   │   ├── teacher/            # Teacher pages
│   │   │   ├── Profile.jsx
│   │   │   └── NotFound.jsx
│   │   ├── redux/
│   │   │   ├── store.js            # Redux store
│   │   │   └── slices/             # Redux slices
│   │   ├── services/
│   │   │   ├── api.js              # Axios instance
│   │   │   ├── auth.service.js     # Auth API calls
│   │   │   ├── exam.service.js     # Exam API calls
│   │   │   ├── session.service.js  # Session API calls
│   │   │   ├── proctoring.service.js
│   │   │   └── result.service.js
│   │   ├── utils/
│   │   │   ├── constants.js        # Frontend constants
│   │   │   ├── helpers.js          # Helper functions
│   │   │   └── errorHandler.js     # Error utilities
│   │   ├── App.jsx                 # Main component
│   │   ├── main.jsx                # Entry point
│   │   └── index.css               # Global styles
│   ├── .gitignore
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── screenshots/                    # UI screenshots
├── .gitignore
└── README.md
```

## 🔌 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | Login user | No |
| GET | `/auth/me` | Get current user | Yes |

### Exam Endpoints

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/exams` | Get all exams | Yes | All |
| GET | `/exams/:id` | Get exam by ID | Yes | All |
| POST | `/exams` | Create exam | Yes | Teacher |
| PUT | `/exams/:id` | Update exam | Yes | Teacher |
| DELETE | `/exams/:id` | Delete exam | Yes | Teacher |

### Question Endpoints

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/questions/exam/:examId` | Get questions for exam | Yes | All |
| POST | `/questions` | Add question | Yes | Teacher |
| PUT | `/questions/:id` | Update question | Yes | Teacher |
| DELETE | `/questions/:id` | Delete question | Yes | Teacher |

### Session Endpoints

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| POST | `/sessions/start` | Start exam session | Yes | Student |
| POST | `/sessions/submit` | Submit exam | Yes | Student |
| GET | `/sessions/:sessionId` | Get session details | Yes | All |

### Proctoring Endpoints

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| POST | `/proctoring/log` | Log violation | Yes | Student |
| GET | `/proctoring/session/:sessionId` | Get session logs | Yes | Teacher |

### Result Endpoints

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/results/student` | Get student results | Yes | Student |
| GET | `/results/exam/:examId` | Get exam results | Yes | Teacher |

## 🧪 Testing

### Backend Testing

```bash
cd seonix-backend
# Add your test command
npm test
```

### Frontend Testing

```bash
cd seonix-frontend
# Add your test command
npm test
```

## 🚀 Deployment

### Backend Deployment (e.g., Heroku, Railway, Render)

1. **Set Environment Variables** on your hosting platform
2. **Deploy the backend** from the `seonix-backend` directory
3. **Update MongoDB URI** to use MongoDB Atlas or your cloud database

### Frontend Deployment (e.g., Vercel, Netlify)

1. **Build the frontend**:
   ```bash
   cd seonix-frontend
   npm run build
   ```

2. **Update API URL** in the frontend configuration to point to your deployed backend

3. **Deploy the `dist` folder** to your hosting platform

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Authors

- **Jayti Shah** - [GitHub](https://github.com/jaytishah)

## 🙏 Acknowledgments

- React and Node.js communities for excellent documentation
- MongoDB for the robust database solution
- All contributors who help improve this project

## 📞 Support

For support, email jaytishah20@gmail.com or create an issue in the GitHub repository.

---

<div align="center">
  Made with ❤️ by Jayti Shah
  
  ⭐ Star this repository if you find it helpful!
</div>
