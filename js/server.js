const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const cors = require('cors');
const { exec } = require('child_process');
require('dotenv').config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// MySQL connection
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',       
    database: process.env.DB_NAME || 'exam_db' 
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL Database:', err.message);
        console.log('Ensure MySQL is running and exam_db is imported.');
    } else {
        console.log('✅ Successfully connected to MySQL database: exam_db');
    }
});

// Login endpoint with auto-registration for students
app.post('/api/login.php', (req, res) => {
    const { username, password, role, fullName } = req.body;
    
    // 1. Check if user exists
    const query = 'SELECT * FROM users WHERE username = ? AND password = ? AND role = ?';
    db.query(query, [username, password, role], (err, results) => {
        if (err) return res.json({ success: false, message: 'DB Error: ' + err.message });
        
        if (results.length > 0) {
            const user = results[0];
            // If student, get student_id
            if (user.role === 'student') {
                db.query('SELECT student_id FROM students WHERE user_id = ?', [user.user_id], (err, sResults) => {
                    const studentId = sResults.length > 0 ? sResults[0].student_id : null;
                    sendLoginResponse(res, user, studentId);
                });
            } else {
                sendLoginResponse(res, user, null);
            }
        } else if (role === 'student') {
            // AUTO-REGISTER STUDENT as requested
            const name = fullName || username;
            db.query('INSERT INTO users (full_name, username, password, role, department, year) VALUES (?, ?, ?, "student", "Computer Science", 1)', 
                [name, username, password], (err, result) => {
                if (err) return res.json({ success: false, message: 'Registration Error: ' + err.message });
                
                const newUserId = result.insertId;
                db.query('INSERT INTO students (user_id, name, department, year) VALUES (?, ?, "Computer Science", 1)', 
                    [newUserId, name], (err, sResult) => {
                    if (err) return res.json({ success: false, message: 'Student Link Error: ' + err.message });
                    const newStudentId = sResult.insertId;
                    sendLoginResponse(res, { user_id: newUserId, role: 'student', full_name: name, username: username }, newStudentId);
                });
            });
        } else {
            return res.json({ success: false, message: `Invalid ${role} credentials.` });
        }
    });
});

function sendLoginResponse(res, user, studentId) {
    let redirect = 'dashboard.html';
    if (user.role === 'student') redirect = 'exam.html';
    else if (user.role === 'instructor') redirect = 'instructor_dashboard.html';

    res.json({
        success: true,
        user: { user_id: user.user_id, student_id: studentId, user_type: user.role, full_name: user.full_name, username: user.username },
        redirect: redirect
    });
}

// SAVE EXAM RESULT IN REAL-TIME
app.post('/api/save-result.php', (req, res) => {
    const data = req.body;
    // We need student_id and exam_id
    // First, find exam_id from exam_code
    db.query('SELECT exam_id FROM exams WHERE exam_code = ?', [data.examCode], (err, exams) => {
        if (err || exams.length === 0) return res.status(404).json({ success: false, message: 'Exam not found' });
        
        const examId = exams[0].exam_id;
        const studentId = data.studentId;

        const query = `INSERT INTO results 
            (student_id, exam_id, score, total_marks, percentage, questions_attempted, total_questions, violations, time_taken_seconds, status, grade) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
        const grade = data.percentage >= 90 ? 'O' : data.percentage >= 80 ? 'A+' : data.percentage >= 70 ? 'A' : data.percentage >= 60 ? 'B+' : data.percentage >= 50 ? 'B' : 'C';
        
        const values = [
            studentId, examId, data.score, data.totalMarks, data.percentage, 
            data.questionsAttempted, data.totalQuestions, data.violations, 
            data.timeTakenSeconds, data.status || 'Completed', grade
        ];

        db.query(query, values, (err, result) => {
            if (err) {
                console.error("Result save error:", err);
                return res.json({ success: false, message: 'Save error: ' + err.message });
            }
            res.json({ success: true, resultId: result.insertId });
        });
    });
});

// Fetch exams endpoint
app.get('/api/exams.php', (req, res) => {
    db.query('SELECT * FROM exams', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Default route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Utility to open browser
const openBrowser = (url) => {
    const start = (process.platform == 'darwin'? 'open': process.platform == 'win32'? 'start': 'xdg-open');
    exec(`${start} ${url}`);
};

app.listen(PORT, () => {
    console.log(`\n===========================================`);
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`===========================================\n`);
    console.log('Opening website in your browser...');
    openBrowser(`http://localhost:${PORT}`);
});
