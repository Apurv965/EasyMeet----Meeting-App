# EasyMeet

EasyMeet is a simple video meeting app for quick online conversations. Users can sign up, log in, or join as a guest, enter a meeting code, preview their camera and mic before joining, chat in real time, and share screens inside a clean meeting interface.

## Live Demo

Frontend: [https://easymeet-frontend-e5x4.onrender.com](https://easymeet-frontend-e5x4.onrender.com)

## Features

- User signup and login
- Join as guest without authentication
- Join meetings with a meeting code
- Pre-join lobby with username, camera preview, and mic preview
- Camera and mic on/off controls before joining
- Real-time video meeting room
- Real-time chat during meetings
- Screen sharing
- Meeting history for logged-in users
- Participant list in the navbar
- Responsive UI for desktop and mobile web

## Pages

- Landing page
- Authentication page
- Home page
- Guest join page
- Meeting history page
- Video meeting page

## Tech Stack

### Frontend

- React
- React Router
- Material UI
- Axios
- Socket.IO Client

### Backend

- Node.js
- Express
- Socket.IO
- MongoDB
- Mongoose
- bcrypt

## Project Structure

```text
EasyMeet/
├── Backend/
├── Frontend/
└── README.md
```

## Local Setup

### Backend

```bash
cd Backend
npm install
npm run dev
```

### Frontend

```bash
cd Frontend
npm install
npm start
```

## Environment Variables

### Frontend

```env
REACT_APP_API_URL=https://your-backend-url/api/v1/users
REACT_APP_SOCKET_URL=https://your-backend-url
```

### Backend

```env
MONGO_URI=your_mongodb_connection_string
PORT=8000
```

## Deployment

The project is deployed on Render:

- Frontend as a Static Site
- Backend as a Web Service
- MongoDB Atlas for the database

## Notes

- The backend root route `/` is not defined, so `Cannot GET /` on the backend URL is expected.
- Use `/health` on the backend to verify deployment status.
- For frontend refresh support on custom routes, a rewrite to `/index.html` is required on Render.
