{
  "name": "exam-control-system",
  "version": "1.0.0",
  "description": "Real-time Exam Control System with AI Proctoring",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.0.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.0",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "socket.io": "^4.6.1",
    "multer": "^1.4.5-lts.1",
    "express-rate-limit": "^6.10.0",
    "helmet": "^7.0.0"
  },
  "devDependencies": {
    "nodemon": "^2.0.22"
  },
  "engines": {
    "node": ">=14.0.0"
  },
  "keywords": ["exam", "proctoring", "education", "assessment"],
  "author": "Exam Control System Team",
  "license": "MIT"
}
