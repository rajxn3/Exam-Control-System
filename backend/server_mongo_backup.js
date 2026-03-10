const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/exam_control', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Models
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'instructor', 'admin'], default: 'student' },
    department: String,
    createdAt: { type: Date, default: Date.now },
    lastLogin: Date,
    isActive: { type: Boolean, default: true }
});

const ExamSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    subject: String,
    duration: { type: Number, required: true }, // in minutes
    totalMarks: Number,
    passingMarks: Number,
    scheduledAt: Date,
    endAt: Date,
    status: { type: String, enum: ['draft', 'scheduled', 'active', 'completed', 'cancelled'], default: 'draft' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    questions: [{
        text: String,
        options: [String],
        correctAnswer: Number,
        marks: Number,
        difficulty: { type: String, enum: ['easy', 'medium', 'hard'] }
    }],
    allowedStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    settings: {
        shuffleQuestions: { type: Boolean, default: true },
        shuffleOptions: { type: Boolean, default: true },
        allowReview: { type: Boolean, default: true },
        showResults: { type: Boolean, default: true },
        proctoringEnabled: { type: Boolean, default: true }
    }
});

const ResultSchema = new mongoose.Schema({
    exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    score: Number,
    totalMarks: Number,
    percentage: Number,
    answers: [{
        questionId: mongoose.Schema.Types.ObjectId,
        selectedOption: Number,
        isCorrect: Boolean,
        timeTaken: Number // in seconds
    }],
    violations: [{
        type: String,
        reason: String,
        timestamp: Date
    }],
    startTime: Date,
    endTime: Date,
    duration: Number, // in seconds
    submittedAt: Date,
    status: { type: String, enum: ['in_progress', 'submitted', 'graded', 'cancelled'] }
});

const User = mongoose.model('User', UserSchema);
const Exam = mongoose.model('Exam', ExamSchema);
const Result = mongoose.model('Result', ResultSchema);

// Authentication middleware
const authenticate = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            throw new Error();
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'exam_control_secret');
        const user = await User.findById(decoded.userId);
        
        if (!user) {
            throw new Error();
        }
        
        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Please authenticate' });
    }
};

// Role-based authorization middleware
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Access denied' });
        }
        next();
    };
};

// Routes

// Authentication routes
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password, role, department } = req.body;
        
        // Check if user exists
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create user
        const user = new User({
            username,
            email,
            password: hashedPassword,
            role: role || 'student',
            department
        });
        
        await user.save();
        
        // Generate token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET || 'exam_control_secret',
            { expiresIn: '7d' }
        );
        
        res.status(201).json({
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                department: user.department
            },
            token
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Find user
        const user = await User.findOne({ 
            $or: [{ username }, { email: username }] 
        });
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // Update last login
        user.lastLogin = new Date();
        await user.save();
        
        // Generate token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET || 'exam_control_secret',
            { expiresIn: '7d' }
        );
        
        res.json({
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                department: user.department
            },
            token
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Exam routes
app.get('/api/exams', authenticate, async (req, res) => {
    try {
        const { status, subject, page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;
        
        let query = {};
        
        // Filter by status
        if (status) {
            query.status = status;
        }
        
        // Filter by subject
        if (subject) {
            query.subject = subject;
        }
        
        // For students, only show exams they're allowed to take
        if (req.user.role === 'student') {
            query.allowedStudents = req.user._id;
            query.status = { $in: ['scheduled', 'active'] };
        }
        
        const exams = await Exam.find(query)
            .populate('createdBy', 'username email')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ scheduledAt: -1 });
        
        const total = await Exam.countDocuments(query);
        
        res.json({
            exams,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/api/exams', authenticate, authorize('instructor', 'admin'), async (req, res) => {
    try {
        const exam = new Exam({
            ...req.body,
            createdBy: req.user._id
        });
        
        await exam.save();
        
        res.status(201).json(exam);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/api/exams/:id', authenticate, async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id)
            .populate('createdBy', 'username email')
            .populate('allowedStudents', 'username email');
        
        if (!exam) {
            return res.status(404).json({ error: 'Exam not found' });
        }
        
        // Check if student is allowed to access this exam
        if (req.user.role === 'student' && 
            !exam.allowedStudents.some(student => student._id.equals(req.user._id))) {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        res.json(exam);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.put('/api/exams/:id', authenticate, authorize('instructor', 'admin'), async (req, res) => {
    try {
        const exam = await Exam.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!exam) {
            return res.status(404).json({ error: 'Exam not found' });
        }
        
        res.json(exam);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.delete('/api/exams/:id', authenticate, authorize('instructor', 'admin'), async (req, res) => {
    try {
        const exam = await Exam.findByIdAndDelete(req.params.id);
        
        if (!exam) {
            return res.status(404).json({ error: 'Exam not found' });
        }
        
        // Also delete related results
        await Result.deleteMany({ exam: exam._id });
        
        res.json({ message: 'Exam deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Exam start and submission
app.post('/api/exams/:id/start', authenticate, async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);
        
        if (!exam) {
            return res.status(404).json({ error: 'Exam not found' });
        }
        
        // Check if student is allowed
        if (req.user.role === 'student' && 
            !exam.allowedStudents.some(student => student.equals(req.user._id))) {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        // Check if exam is active
        if (exam.status !== 'active') {
            return res.status(400).json({ error: 'Exam is not active' });
        }
        
        // Check if student has already started
        let result = await Result.findOne({
            exam: exam._id,
            student: req.user._id
        });
        
        if (!result) {
            // Create new result record
            result = new Result({
                exam: exam._id,
                student: req.user._id,
                startTime: new Date(),
                status: 'in_progress'
            });
            
            await result.save();
        }
        
        // Prepare exam data for student (with shuffled questions if needed)
        let examData = exam.toObject();
        
        if (exam.settings.shuffleQuestions) {
            examData.questions = shuffleArray(examData.questions);
        }
        
        if (exam.settings.shuffleOptions) {
            examData.questions = examData.questions.map(question => ({
                ...question,
                options: shuffleArray(question.options),
                correctAnswer: question.correctAnswer // Keep correct answer index
            }));
        }
        
        res.json({
            exam: examData,
            resultId: result._id,
            startTime: result.startTime
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/api/exams/:id/submit', authenticate, async (req, res) => {
    try {
        const { resultId, answers, violations, duration } = req.body;
        
        const result = await Result.findById(resultId);
        
        if (!result) {
            return res.status(404).json({ error: 'Result not found' });
        }
        
        // Verify ownership
        if (!result.student.equals(req.user._id)) {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        // Calculate score
        const exam = await Exam.findById(req.params.id);
        let score = 0;
        let totalMarks = 0;
        
        const answerDetails = answers.map(answer => {
            const question = exam.questions.id(answer.questionId);
            const isCorrect = answer.selectedOption === question.correctAnswer;
            
            if (isCorrect) {
                score += question.marks || 1;
            }
            
            totalMarks += question.marks || 1;
            
            return {
                questionId: answer.questionId,
                selectedOption: answer.selectedOption,
                isCorrect,
                timeTaken: answer.timeTaken
            };
        });
        
        const percentage = totalMarks > 0 ? (score / totalMarks) * 100 : 0;
        
        // Update result
        result.score = score;
        result.totalMarks = totalMarks;
        result.percentage = percentage;
        result.answers = answerDetails;
        result.violations = violations;
        result.duration = duration;
        result.endTime = new Date();
        result.submittedAt = new Date();
        result.status = 'submitted';
        
        await result.save();
        
        res.json({
            score,
            totalMarks,
            percentage,
            violations: violations.length,
            duration
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Results routes
app.get('/api/results', authenticate, async (req, res) => {
    try {
        let query = {};
        
        if (req.user.role === 'student') {
            query.student = req.user._id;
        } else if (req.user.role === 'instructor') {
            // Get results for exams created by this instructor
            const instructorExams = await Exam.find({ createdBy: req.user._id });
            query.exam = { $in: instructorExams.map(exam => exam._id) };
        }
        
        const results = await Result.find(query)
            .populate('exam', 'title subject')
            .populate('student', 'username email')
            .sort({ submittedAt: -1 });
        
        res.json(results);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/api/results/:id', authenticate, async (req, res) => {
    try {
        const result = await Result.findById(req.params.id)
            .populate('exam', 'title subject questions')
            .populate('student', 'username email');
        
        if (!result) {
            return res.status(404).json({ error: 'Result not found' });
        }
        
        // Check access
        if (req.user.role === 'student' && !result.student._id.equals(req.user._id)) {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        if (req.user.role === 'instructor') {
            const exam = await Exam.findById(result.exam._id);
            if (!exam.createdBy.equals(req.user._id)) {
                return res.status(403).json({ error: 'Access denied' });
            }
        }
        
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Dashboard stats
app.get('/api/dashboard/stats', authenticate, async (req, res) => {
    try {
        let stats = {};
        
        if (req.user.role === 'student') {
            const totalExams = await Exam.countDocuments({
                allowedStudents: req.user._id,
                status: { $in: ['active', 'scheduled'] }
            });
            
            const completedExams = await Result.countDocuments({
                student: req.user._id,
                status: 'submitted'
            });
            
            const avgScore = await Result.aggregate([
                { $match: { student: req.user._id, status: 'submitted' } },
                { $group: { _id: null, avgPercentage: { $avg: '$percentage' } } }
            ]);
            
            stats = {
                totalExams,
                completedExams,
                avgScore: avgScore[0]?.avgPercentage || 0
            };
        } else if (req.user.role === 'instructor') {
            const totalExams = await Exam.countDocuments({ createdBy: req.user._id });
            const activeExams = await Exam.countDocuments({ 
                createdBy: req.user._id,
                status: 'active'
            });
            
            const totalStudents = await User.countDocuments({ role: 'student' });
            
            const totalResults = await Result.countDocuments({
                exam: { $in: await Exam.find({ createdBy: req.user._id }).distinct('_id') }
            });
            
            stats = {
                totalExams,
                activeExams,
                totalStudents,
                totalResults
            };
        } else if (req.user.role === 'admin') {
            const totalUsers = await User.countDocuments();
            const totalExams = await Exam.countDocuments();
            const activeExams = await Exam.countDocuments({ status: 'active' });
            const totalResults = await Result.countDocuments();
            
            stats = {
                totalUsers,
                totalExams,
                activeExams,
                totalResults
            };
        }
        
        res.json(stats);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Utility function to shuffle array
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
