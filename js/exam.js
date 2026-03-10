document.addEventListener('DOMContentLoaded', function() {
    // Check if user is authenticated
    if (!localStorage.getItem('isLoggedIn') || localStorage.getItem('userRole') !== 'student') {
        window.location.href = '1.html';
        return;
    }

    // Initialize exam
    initializeExam();
    
    // Initialize webcam and face detection
    initializeProctoring();
    
    // Start exam timer
    startExamTimer();
});

// Exam Configuration
const EXAM_CONFIG = {
    totalQuestions: 60,
    totalTime: 120 * 60, // 2 hours in seconds
    warningTime: 10 * 60, // 10 minutes
    dangerTime: 5 * 60, // 5 minutes
    maxViolations: 4,
    violationCooldown: 30000 // 30 seconds
};

// Exam State
let examState = {
    currentQuestion: 1,
    answers: {},
    markedForReview: new Set(),
    timeRemaining: EXAM_CONFIG.totalTime,
    violations: 0,
    isExamActive: true,
    lastViolationTime: 0,
    faceDetectionActive: false,
    browserFocusActive: true
};

// Sample Questions Database
const QUESTIONS = [
    {
        id: 1,
        text: "Which protocol is used to secure communication over the internet?",
        options: ["HTTP", "HTTPS", "FTP", "Telnet"],
        correct: 1,
        marks: 1
    },
    {
        id: 2,
        text: "What is the main purpose of a Firewall?",
        options: ["Virus Scan", "Monitor/Block Network Traffic", "Encrypt Hard Drive", "Store Passwords"],
        correct: 1,
        marks: 1
    },
    {
        id: 3,
        text: "Which attack involves overwhelming a server with traffic?",
        options: ["Phishing", "DDoS", "SQL Injection", "XSS"],
        correct: 1,
        marks: 1
    },
    {
        id: 4,
        text: "What does CIA stand for in security?",
        options: [
            "Confidentiality, Integrity, Availability",
            "Control, Internet, Access", 
            "Computer Investigation Authority",
            "Central Intelligence Agency"
        ],
        correct: 0,
        marks: 1
    },
    {
        id: 5,
        text: "Which is a social engineering attack?",
        options: ["Phishing", "Buffer Overflow", "Man-in-the-Middle", "Zero-day"],
        correct: 0,
        marks: 1
    }
];

// Generate more questions for demo
const ALL_QUESTIONS = [];
for (let i = 0; i < 12; i++) {
    QUESTIONS.forEach(q => {
        ALL_QUESTIONS.push({
            ...q,
            id: ALL_QUESTIONS.length + 1
        });
    });
}

function initializeExam() {
    // Initialize questions palette
    initializeQuestionsPalette();
    
    // Load first question
    loadQuestion(examState.currentQuestion);
    
    // Update progress
    updateProgress();
    
    // Setup event listeners
    setupEventListeners();
}

function initializeQuestionsPalette() {
    const palette = document.getElementById('questionsPalette');
    palette.innerHTML = '';
    
    for (let i = 1; i <= EXAM_CONFIG.totalQuestions; i++) {
        const button = document.createElement('button');
        button.className = 'palette-btn';
        button.textContent = i;
        button.setAttribute('data-question', i);
        
        button.addEventListener('click', () => {
            loadQuestion(i);
        });
        
        palette.appendChild(button);
    }
}

function loadQuestion(questionNumber) {
    examState.currentQuestion = questionNumber;
    
    // Update UI
    document.getElementById('questionNumber').textContent = 
        `Question ${questionNumber} of ${EXAM_CONFIG.totalQuestions}`;
    
    // Get question (for demo, we'll cycle through sample questions)
    const questionIndex = (questionNumber - 1) % QUESTIONS.length;
    const question = QUESTIONS[questionIndex];
    
    document.getElementById('questionText').textContent = question.text;
    
    // Load options
    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = '';
    
    question.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'option-btn';
        if (examState.answers[questionNumber] === index) {
            button.classList.add('selected');
        }
        button.textContent = option;
        
        button.addEventListener('click', () => {
            // Remove selected class from all options
            document.querySelectorAll('.option-btn').forEach(btn => {
                btn.classList.remove('selected');
            });
            
            // Add selected class to clicked option
            button.classList.add('selected');
            
            // Store answer
            examState.answers[questionNumber] = index;
            
            // Update palette
            updatePaletteButton(questionNumber, 'answered');
            
            // Show submit button on last question
            updateNavigationButtons();
        });
        
        optionsContainer.appendChild(button);
    });
    
    // Update palette
    updatePaletteButton(questionNumber, 'current');
    
    // Update navigation buttons
    updateNavigationButtons();
    
    // Update progress
    updateProgress();
}

function updateNavigationButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    
    prevBtn.disabled = examState.currentQuestion === 1;
    nextBtn.disabled = examState.currentQuestion === EXAM_CONFIG.totalQuestions;
    
    // Show submit button on last question
    if (examState.currentQuestion === EXAM_CONFIG.totalQuestions) {
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'flex';
    } else {
        nextBtn.style.display = 'flex';
        submitBtn.style.display = 'none';
    }
}

function nextQuestion() {
    if (examState.currentQuestion < EXAM_CONFIG.totalQuestions) {
        loadQuestion(examState.currentQuestion + 1);
    }
}

function prevQuestion() {
    if (examState.currentQuestion > 1) {
        loadQuestion(examState.currentQuestion - 1);
    }
}

function markForReview() {
    examState.markedForReview.add(examState.currentQuestion);
    updatePaletteButton(examState.currentQuestion, 'review');
    
    // Show confirmation
    Swal.fire({
        title: 'Marked for Review',
        text: 'Question marked for review. You can come back to it later.',
        icon: 'info',
        timer: 2000,
        showConfirmButton: false
    });
}

function updatePaletteButton(questionNumber, status) {
    const button = document.querySelector(`.palette-btn[data-question="${questionNumber}"]`);
    if (button) {
        // Remove all status classes
        button.classList.remove('answered', 'current', 'review');
        
        // Add new status class
        if (status) {
            button.classList.add(status);
        }
    }
}

function updateProgress() {
    const progress = (examState.currentQuestion / EXAM_CONFIG.totalQuestions) * 100;
    document.getElementById('progressBar').style.width = `${progress}%`;
    document.getElementById('progressText').textContent = 
        `${examState.currentQuestion}/${EXAM_CONFIG.totalQuestions}`;
}

function startExamTimer() {
    const timerElement = document.getElementById('examTimer');
    
    const timerInterval = setInterval(() => {
        if (!examState.isExamActive) {
            clearInterval(timerInterval);
            return;
        }
        
        examState.timeRemaining--;
        
        if (examState.timeRemaining <= 0) {
            clearInterval(timerInterval);
            submitExam(true); // Auto-submit
            return;
        }
        
        // Update timer display
        const hours = Math.floor(examState.timeRemaining / 3600);
        const minutes = Math.floor((examState.timeRemaining % 3600) / 60);
        const seconds = examState.timeRemaining % 60;
        
        timerElement.textContent = 
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Update timer color based on remaining time
        timerElement.classList.remove('warning', 'danger');
        if (examState.timeRemaining <= EXAM_CONFIG.dangerTime) {
            timerElement.classList.add('danger');
        } else if (examState.timeRemaining <= EXAM_CONFIG.warningTime) {
            timerElement.classList.add('warning');
        }
        
    }, 1000);
}

async function initializeProctoring() {
    try {
        // Request camera access
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                width: 640, 
                height: 480,
                facingMode: 'user'
            } 
        });
        
        const videoElement = document.getElementById('webcam');
        videoElement.srcObject = stream;
        
        // Update status
        document.getElementById('cameraStatus').classList.add('active');
        document.getElementById('faceDetectionStatus').innerHTML = 
            '<i class="fas fa-check"></i> Camera Active';
        
        // Load face-api models
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
        await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
        await faceapi.nets.faceExpressionNet.loadFromUri('/models');
        
        // Start face detection
        startFaceDetection(videoElement);
        
    } catch (error) {
        console.error('Error accessing camera:', error);
        document.getElementById('faceDetectionStatus').innerHTML = 
            '<i class="fas fa-times"></i> Camera Access Denied';
        document.getElementById('cameraStatus').classList.remove('active');
    }
}

function startFaceDetection(videoElement) {
    const canvas = faceapi.createCanvasFromMedia(videoElement);
    document.body.append(canvas);
    canvas.style.display = 'none';
    
    const displaySize = { width: videoElement.width, height: videoElement.height };
    faceapi.matchDimensions(canvas, displaySize);
    
    setInterval(async () => {
        if (!examState.isExamActive) return;
        
        const detections = await faceapi.detectAllFaces(
            videoElement, 
            new faceapi.TinyFaceDetectorOptions()
        ).withFaceLandmarks().withFaceExpressions();
        
        // Update face detection status
        const faceStatus = document.getElementById('faceStatus');
        if (detections.length > 0) {
            faceStatus.className = 'status-dot active';
            examState.faceDetectionActive = true;
        } else {
            faceStatus.className = 'status-dot danger';
            examState.faceDetectionActive = false;
        }
        
        // Check for multiple faces
        if (detections.length > 1) {
            recordViolation('Multiple faces detected in camera feed');
        }
        
        // Check for face leaving frame
        if (detections.length === 0) {
            recordViolation('Face not detected in camera');
        }
        
    }, 2000); // Check every 2 seconds
}

function setupEventListeners() {
    // Browser focus/blur detection
    window.addEventListener('blur', () => {
        if (!examState.isExamActive) return;
        
        examState.browserFocusActive = false;
        document.getElementById('tabFocusStatus').className = 'status-dot danger';
        recordViolation('Browser tab lost focus');
    });
    
    window.addEventListener('focus', () => {
        examState.browserFocusActive = true;
        document.getElementById('tabFocusStatus').className = 'status-dot active';
    });
    
    // Prevent right-click
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        recordViolation('Right-click attempted');
    });
    
    // Prevent keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'v' || e.key === 'u')) {
            e.preventDefault();
            recordViolation('Copy/paste attempt detected');
        }
        
        if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
            e.preventDefault();
            recordViolation('Developer tools attempt');
        }
    });
}

function recordViolation(reason) {
    if (!examState.isExamActive) return;
    
    // Check cooldown
    const now = Date.now();
    if (now - examState.lastViolationTime < EXAM_CONFIG.violationCooldown) {
        return;
    }
    
    examState.violations++;
    examState.lastViolationTime = now;
    
    // Update UI
    document.getElementById('violationText').textContent = 
        `Violations: ${examState.violations}/${EXAM_CONFIG.maxViolations}`;
    document.getElementById('strikeCount').textContent = examState.violations;
    
    const violationStatus = document.getElementById('violationStatus');
    violationStatus.className = 'status-dot danger';
    
    // Show violation modal
    showViolationModal(reason);
    
    // Check if max violations reached
    if (examState.violations >= EXAM_CONFIG.maxViolations) {
        terminateExam('Maximum violations reached');
    }
}

function showViolationModal(reason) {
    document.getElementById('violationReason').textContent = reason;
    document.getElementById('violationModal').style.display = 'flex';
    
    // Play warning sound
    playWarningSound();
}

function closeViolationModal() {
    document.getElementById('violationModal').style.display = 'none';
}

function playWarningSound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 440;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
}

function submitExam(isAutoSubmit = false) {
    if (!isAutoSubmit) {
        Swal.fire({
            title: 'Submit Exam?',
            text: 'Are you sure you want to submit your exam?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, submit!',
            cancelButtonText: 'No, continue'
        }).then((result) => {
            if (result.isConfirmed) {
                completeExamSubmission();
            }
        });
    } else {
        completeExamSubmission(true);
    }
}

function completeExamSubmission(isAutoSubmit = false) {
    examState.isExamActive = false;
    
    // Calculate score
    let score = 0;
    let totalMarks = 0;
    
    Object.keys(examState.answers).forEach(questionNum => {
        const questionIndex = (parseInt(questionNum) - 1) % QUESTIONS.length;
        const question = QUESTIONS[questionIndex];
        
        if (examState.answers[questionNum] === question.correct) {
            score += question.marks;
        }
        totalMarks += question.marks;
    });
    
    const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;
    
    // Show results
    Swal.fire({
        title: isAutoSubmit ? 'Time Up!' : 'Exam Submitted',
        html: `
            <div style="text-align: center; padding: 20px;">
                <h3>Exam Results</h3>
                <div style="font-size: 3rem; color: ${percentage >= 50 ? '#27ae60' : '#e74c3c'};">
                    ${percentage}%
                </div>
                <div style="margin-top: 20px;">
                    <p><strong>Score:</strong> ${score} / ${totalMarks}</p>
                    <p><strong>Questions Attempted:</strong> ${Object.keys(examState.answers).length} / ${EXAM_CONFIG.totalQuestions}</p>
                    <p><strong>Violations:</strong> ${examState.violations}</p>
                    <p><strong>Time Taken:</strong> ${formatTime(EXAM_CONFIG.totalTime - examState.timeRemaining)}</p>
                </div>
            </div>
        `,
        confirmButtonText: 'Return to Dashboard',
        allowOutsideClick: false
    }).then(() => {
        // Save results to localStorage (in real app, send to server)
        const examResults = {
            status: 'Completed',
            score,
            totalMarks,
            percentage,
            questionsAttempted: Object.keys(examState.answers).length,
            totalQuestions: EXAM_CONFIG.totalQuestions,
            violations: examState.violations,
            timeTaken: EXAM_CONFIG.totalTime - examState.timeRemaining,
            date: new Date().toISOString()
        };
        
        localStorage.setItem('lastExamResults', JSON.stringify(examResults));
        
        // Redirect to dashboard
        window.location.href = 'result.html';
    });
}

function terminateExam(reason) {
    examState.isExamActive = false;
    
    const examResults = {
        status: 'Terminated',
        reason: reason,
        score: 0,
        totalMarks: 0,
        percentage: 0,
        questionsAttempted: Object.keys(examState.answers).length,
        totalQuestions: EXAM_CONFIG.totalQuestions,
        violations: examState.violations,
        timeTaken: EXAM_CONFIG.totalTime - examState.timeRemaining,
        date: new Date().toISOString()
    };
    
    localStorage.setItem('lastExamResults', JSON.stringify(examResults));
    
    Swal.fire({
        title: 'Exam Terminated',
        text: `Your exam has been terminated. Reason: ${reason}`,
        icon: 'error',
        confirmButtonText: 'View Results',
        allowOutsideClick: false
    }).then(() => {
        window.location.href = 'result.html';
    });
}

function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
