-- ============================================================
--  EXAM CONTROL SYSTEM - UNIFIED DATABASE (v2.1)
--  Includes: Users, Students, Exams, Results, and Questions
-- ============================================================

CREATE DATABASE IF NOT EXISTS exam_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE exam_db;

-- -------------------------------------------------------------
--  1. CLEAN UP (Drop tables to allow clean re-import)
-- -------------------------------------------------------------
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS questions;
DROP TABLE IF EXISTS results;
DROP TABLE IF EXISTS exams;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- -------------------------------------------------------------
--  2. CREATE TABLES
-- -------------------------------------------------------------

-- USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    user_id     INT           NOT NULL AUTO_INCREMENT,
    full_name   VARCHAR(120)  NOT NULL,
    username    VARCHAR(60)   NOT NULL UNIQUE,
    password    VARCHAR(100)  NOT NULL,          
    role        ENUM('admin','instructor','student') NOT NULL DEFAULT 'student',
    email       VARCHAR(150)  DEFAULT NULL,
    department  VARCHAR(100)  DEFAULT NULL,
    year        TINYINT       DEFAULT NULL,
    created_at  DATETIME      DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- STUDENTS TABLE
CREATE TABLE IF NOT EXISTS students (
    student_id  INT          NOT NULL AUTO_INCREMENT,
    user_id     INT          NOT NULL,
    name        VARCHAR(100) NOT NULL,
    department  VARCHAR(100) NOT NULL,
    year        TINYINT      NOT NULL DEFAULT 1,
    PRIMARY KEY (student_id),
    CONSTRAINT fk_students_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- EXAMS TABLE
CREATE TABLE IF NOT EXISTS exams (
    exam_id       INT          NOT NULL AUTO_INCREMENT,
    exam_code     VARCHAR(20)  NOT NULL UNIQUE,
    subject       VARCHAR(150) NOT NULL,
    exam_date     DATE         NOT NULL,
    total_marks   INT          NOT NULL DEFAULT 60,
    duration_mins INT          NOT NULL DEFAULT 80,
    created_by    INT          DEFAULT NULL,
    PRIMARY KEY (exam_id),
    CONSTRAINT fk_exams_instructor FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS questions (
    question_id   INT AUTO_INCREMENT PRIMARY KEY,
    exam_id       INT NOT NULL,
    question_text TEXT NOT NULL,
    option_a      VARCHAR(255) NOT NULL,
    option_b      VARCHAR(255) NOT NULL,
    option_c      VARCHAR(255) NOT NULL,
    option_d      VARCHAR(255) NOT NULL,
    correct_option INT NOT NULL COMMENT '0=A, 1=B, 2=C, 3=D',
    marks         INT DEFAULT 1,
    FOREIGN KEY (exam_id) REFERENCES exams(exam_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- RESULTS TABLE
CREATE TABLE IF NOT EXISTS results (
    result_id            INT          NOT NULL AUTO_INCREMENT,
    student_id           INT          NOT NULL,
    exam_id              INT          NOT NULL,
    score                INT          NOT NULL DEFAULT 0,
    total_marks          INT          NOT NULL DEFAULT 0,
    percentage           DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    questions_attempted  INT          NOT NULL DEFAULT 0,
    total_questions      INT          NOT NULL DEFAULT 0,
    violations           INT          NOT NULL DEFAULT 0,
    time_taken_seconds   INT          NOT NULL DEFAULT 0,
    status               ENUM('Completed','Terminated','Timed Out') NOT NULL DEFAULT 'Completed',
    grade                CHAR(2)      NOT NULL DEFAULT 'F',
    submitted_at         DATETIME     DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (result_id),
    CONSTRAINT fk_results_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    CONSTRAINT fk_results_exam    FOREIGN KEY (exam_id)    REFERENCES exams(exam_id)    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------
--  3. SEED INITIAL DATA
-- -------------------------------------------------------------

-- ADMINS & INSTRUCTORS
INSERT INTO users (full_name, username, password, role) VALUES
('Super Admin', 'admin1', 'Admin@123', 'admin'),
('Dr. Ramesh Kumar', 'instructor1', 'Instruter@123', 'instructor');

-- SAMPLE STUDENT: Raj Priyan
INSERT INTO users (full_name, username, password, role, department, year) VALUES
('Raj Priyan', 'raj', '9867', 'student', 'Computer Science', 1);

INSERT INTO students (user_id, name, department, year) VALUES
(3, 'Raj Priyan', 'Computer Science', 1);

-- SAMPLE EXAM: Computer Science 101
INSERT INTO exams (exam_id, exam_code, subject, exam_date, total_marks, duration_mins, created_by) VALUES
(1, 'CS101', 'Computer Science', '2026-03-08', 60, 80, 2);

-- 60 MCQ QUESTIONS FOR CS101
INSERT INTO questions (exam_id, question_text, option_a, option_b, option_c, option_d, correct_option) VALUES
(1, 'Which protocol is used to secure communication over the internet?', 'HTTP', 'HTTPS', 'FTP', 'Telnet', 1),
(1, 'What is the main purpose of a Firewall?', 'Virus Scan', 'Block Network Traffic', 'Encrypt Drive', 'Store Passwords', 1),
(1, 'Which attack involves overwhelming a server with traffic?', 'Phishing', 'DDoS', 'SQL Injection', 'XSS', 1),
(1, 'What does CIA stand for in information security?', 'Confidentiality, Integrity, Availability', 'Control, Internet, Access', 'Computer Investigation', 'Central Intelligence', 0),
(1, 'Which is a social engineering attack?', 'Phishing', 'Buffer Overflow', 'Man-in-the-Middle', 'Zero-day', 0),
(1, 'What is the primary goal of cryptography?', 'Speed', 'Secrecy', 'Storage', 'Accessibility', 1),
(1, 'A computer virus that can replicate itself is called:', 'Worm', 'Trojan', 'Spyware', 'Adware', 0),
(1, 'Which type of encryption uses two different keys?', 'Symmetric', 'Asymmetric', 'Hash', 'Block', 1),
(1, 'What does VPN stand for?', 'Virtual Private Network', 'Variable Path Node', 'Verified Public Network', 'Visual Private Node', 0),
(1, 'Which is most secure for Wi-Fi?', 'WEP', 'WPA', 'WPA2', 'No Password', 2),
(1, 'What is the brain of the computer?', 'RAM', 'Hard Disk', 'CPU', 'GPU', 2),
(1, 'Which of these is NOT an operating system?', 'Windows', 'Linux', 'Python', 'macOS', 2),
(1, 'HTTP stands for:', 'HyperText Transfer Protocol', 'High Technical Transfer Process', 'Hyper Transfer Text Plan', 'Home Tool Text Protocol', 0),
(1, 'What is the base-2 numeral system called?', 'Decimal', 'Hexadecimal', 'Binary', 'Octal', 2),
(1, 'Which language is primarily used for web styling?', 'HTML', 'Python', 'CSS', 'Java', 2),
(1, 'What is a loop that never ends called?', 'Finite loop', 'Infinite loop', 'Break loop', 'While loop', 1),
(1, 'The process of finding errors in a program is:', 'Compiling', 'Executing', 'Debugging', 'Scanning', 2),
(1, 'Which component stores data permanently?', 'RAM', 'ROM', 'Hard Disk', 'Cache', 2),
(1, '1 Megabyte (MB) is equal to approximately:', '1000 bytes', '1024 kilobytes', '1000 bits', '1024 gigabytes', 1),
(1, 'Which is an example of an input device?', 'Monitor', 'Printer', 'Keyboard', 'Speaker', 2),
(1, 'Which logic gate returns TRUE only if both inputs are TRUE?', 'OR', 'XOR', 'AND', 'NOT', 2),
(1, 'SQL is used for:', 'Editing Photos', 'Managing Databases', 'Creating Websites', 'Sending Emails', 1),
(1, 'What does GUI stand for?', 'General User Interaction', 'Graphical User Interface', 'Global Unit Index', 'Grid User Integration', 1),
(1, 'Which protocol is used for sending emails?', 'FTP', 'SMTP', 'POP3', 'IMAP', 1),
(1, 'A person who gains unauthorized access to systems is a:', 'Programmer', 'Hacker', 'Analyst', 'Tester', 1),
(1, 'What is the most popular search engine?', 'Bing', 'Yahoo', 'Google', 'DuckDuckGo', 2),
(1, 'Which data structure follows LIFO?', 'Queue', 'Array', 'Stack', 'Linked List', 2),
(1, 'Which programming language is known as "web native"?', 'C++', 'JavaScript', 'Swift', 'PHP', 1),
(1, 'What does URL stand for?', 'User Resource Locator', 'Uniform Resource Locator', 'Universal Road Log', 'Unique Rate Link', 1),
(1, 'Which attack injects malicious scripts into websites?', 'DDoS', 'SQL Injection', 'XSS', 'Phishing', 2),
(1, 'The smallest unit of data in a computer is:', 'Byte', 'Nibble', 'Bit', 'Block', 2),
(1, 'Which cloud service is owned by Amazon?', 'Azure', 'GCP', 'AWS', 'iCloud', 2),
(1, 'What is the shortcut for "Copy"?', 'Ctrl+V', 'Ctrl+X', 'Ctrl+C', 'Ctrl+A', 2),
(1, 'A collection of 8 bits is called a:', 'Packet', 'Byte', 'Word', 'Sector', 1),
(1, 'Which is NOT a valid IP address?', '192.168.1.1', '256.0.0.1', '10.0.0.254', '172.16.254.1', 1),
(1, 'What does BIOS stand for?', 'Basic Input Output System', 'Binary Integrated OS', 'Board Internal Output Setup', 'Base Index Operating Signal', 0),
(1, 'Which company created the Windows OS?', 'Apple', 'Google', 'Microsoft', 'IBM', 2),
(1, 'A software that manages computer hardware is:', 'Application', 'Utility', 'Operating System', 'Driver', 2),
(1, 'Which is a volatile memory?', 'HDD', 'SSD', 'RAM', 'Flash', 2),
(1, 'What is the main language for Android development?', 'Java/Kotlin', 'C#', 'Swift', 'Ruby', 0),
(1, 'A network spanning across a city is a:', 'LAN', 'WAN', 'MAN', 'PAN', 2),
(1, 'Which port is used for HTTP?', '443', '21', '80', '25', 2),
(1, 'What is the result of 10 % 3?', '30', '3.33', '1', '0', 2),
(1, 'Which algorithm is used for sorting?', 'Dijkstra', 'RSA', 'QuickSort', 'Kruskal', 2),
(1, 'What does IoT stand for?', 'Internet of Things', 'Input of Technology', 'Internal of Tools', 'Index of Tracks', 0),
(1, 'Which device connects different networks?', 'Hub', 'Switch', 'Router', 'Repeater', 2),
(1, 'The "father of computers" is:', 'Charles Babbage', 'Alan Turing', 'Bill Gates', 'Steve Jobs', 0),
(1, 'Which file extension is for a backup?', ' .exe', ' .bak', ' .txt', ' .zip', 1),
(1, 'What is the default port for HTTPS?', '80', '21', '443', '22', 2),
(1, 'Which is a NoSQL database?', 'MySQL', 'PostgreSQL', 'MongoDB', 'Oracle', 2),
(1, 'What is the function of the "ping" command?', 'Delete files', 'Test connectivity', 'Edit text', 'Change password', 1),
(1, 'Which tag is used for a hyperlink in HTML?', '<p>', '<a>', '<img>', '<div>', 1),
(1, 'A "Zero-day" vulnerability is one that:', 'Is highly secure', 'Has no known fix', 'Happens at midnight', 'Costs zero dollars', 1),
(1, 'Which layer of the OSI model is at the bottom?', 'Network', 'Physical', 'Application', 'Data Link', 1),
(1, 'What is the primary key in a database?', 'A foreign index', 'A unique identifier', 'A secondary field', 'A table name', 1),
(1, 'Which is an interpreted language?', 'C', 'C++', 'Python', 'Java', 2),
(1, 'What is "Spam"?', 'A computer virus', 'Unsolicited email', 'A fast computer', 'A database error', 1),
(1, 'Which company developed Java?', 'Microsoft', 'Oracle (Sun)', 'Google', 'Adobe', 1),
(1, 'What is a "Cookie" in web browsing?', 'A prize', 'A tracking file', 'A virus', 'A browser theme', 1),
(1, 'The speed of a processor is measured in:', 'Watts', 'Pixels', 'Hertz (GHz)', 'Bytes', 2);
