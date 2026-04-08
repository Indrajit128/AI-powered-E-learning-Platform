const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const db = require('./db/db');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*", // Adjust in production
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get("/", (req, res) => {
    res.send("Welcome to Mentordeskk Backend 🎓");
});

app.get("/api", (req, res) => {
  res.json({
    message: "API is working 🚀"
  });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/faculty', require('./routes/faculty'));
app.use('/api/student', require('./routes/student'));
app.use('/api/batch', require('./routes/batch'));
app.use('/api/challenges', require('./routes/challenges'));
app.use('/api/submissions', require('./routes/submissions'));
app.use('/api/quizzes', require('./routes/quizzes'));
app.use('/api/student-assignments', require('./routes/student_assignments'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/code', require('./routes/codeRoutes'));

// Socket.io Connection
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('join_batch', (batchId) => {
        socket.join(`batch_${batchId}`);
        console.log(`Socket ${socket.id} joined batch_${batchId}`);
    });

    socket.on('join_faculty', (facultyId) => {
        socket.join(`faculty_${facultyId}`);
        console.log(`Socket ${socket.id} joined faculty room`);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Export io to be used in routes
global.io = io;

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
