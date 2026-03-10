const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config({ path: '../Sql Database/.env' }); // Adjust path to .env file

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'exam_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test connection
(async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Connected to MySQL Database:', process.env.DB_NAME || 'exam_db');
        connection.release();
    } catch (err) {
        console.error('❌ Database connection error:', err.message);
    }
})();

// ==========================================
//  1. AUTHENTICATION (Login)
// ==========================================
app.post('/api/auth/login', async (req, res) => {
    const { username, password, role } = req.body;
    
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE username = ? AND password = ? AND role = ?', 
            [username, password, role]
        );
        
        if (rows.length > 0) {
            const user = rows[0];
            // If it's a student, get additional student info
            if (role === 'student') {
                const [studentRows] = await pool.execute(
                    'SELECT student_id, department, year FROM students WHERE user_id = ?',
                    [user.user_id]
                );
                user.student_info = studentRows[0] || null;
            }
            
            res.json({ success: true, user });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ==========================================
//  2. GET QUESTIONS FOR AN EXAM
// ==========================================
app.get('/api/exams/:exam_id/questions', async (req, res) => {
    const { exam_id } = req.params;
    
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM questions WHERE exam_id = ?',
            [exam_id]
        );
        
        // Transform for frontend
        const questions = rows.map(q => ({
            id: q.question_id,
            text: q.question_text,
            options: [q.option_a, q.option_b, q.option_c, q.option_d],
            correct: q.correct_option,
            marks: q.marks
        }));
        
        res.json({ success: true, questions });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ==========================================
//  3. CREATE NEW DATA (Add a Question)
// ==========================================
// This is the NEW logic for creating data in SQL from code
app.post('/api/questions', async (req, res) => {
    const { exam_id, question_text, option_a, option_b, option_c, option_d, correct_option, marks } = req.body;
    
    try {
        const [result] = await pool.execute(
            'INSERT INTO questions (exam_id, question_text, option_a, option_b, option_c, option_d, correct_option, marks) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [exam_id, question_text, option_a, option_b, option_c, option_d, correct_option, marks || 1]
        );
        
        res.status(201).json({ 
            success: true, 
            message: 'Question created successfully', 
            question_id: result.insertId 
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ==========================================
//  4. SUBMIT EXAM RESULT
// ==========================================
app.post('/api/results/submit', async (req, res) => {
    const { student_id, exam_id, score, total_marks, percentage, questions_attempted, violations, time_taken_seconds, status } = req.body;
    
    try {
        // Calculate Grade
        let grade = 'F';
        if (percentage >= 90) grade = 'O';
        else if (percentage >= 80) grade = 'A+';
        else if (percentage >= 70) grade = 'A';
        else if (percentage >= 60) grade = 'B+';
        else if (percentage >= 50) grade = 'B';
        else if (percentage >= 40) grade = 'C';

        const [result] = await pool.execute(
            'INSERT INTO results (student_id, exam_id, score, total_marks, percentage, questions_attempted, total_questions, violations, time_taken_seconds, status, grade) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [student_id, exam_id, score, total_marks, percentage, questions_attempted, total_marks, violations, time_taken_seconds, status || 'Completed', grade]
        );
        
        res.json({ success: true, result_id: result.insertId, grade });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.listen(port, () => {
    console.log(`🚀 Exam Management Server running at http://localhost:${port}`);
});
