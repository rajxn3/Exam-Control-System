-- ============================================================
--  EXAM MANAGEMENT SYSTEM - COMPLETE DATABASE
--  Version: 2.0  |  Generated: 2026-03-08
--  Compatible with: server.js (Node.js + mysql2)
-- ============================================================

-- -----------------------------------------------
--  1. CREATE & SELECT DATABASE
-- -----------------------------------------------
CREATE DATABASE IF NOT EXISTS exam_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE exam_db;

-- -----------------------------------------------
--  2. DROP TABLES (to allow clean re-import)
-- -----------------------------------------------
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS results;
DROP TABLE IF EXISTS exams;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- -----------------------------------------------
--  3. CREATE TABLES
-- -----------------------------------------------

-- USERS TABLE (used by server.js /api/login.php)
-- roles: 'admin', 'instructor', 'student'
CREATE TABLE IF NOT EXISTS users (
    user_id     INT           NOT NULL AUTO_INCREMENT,
    full_name   VARCHAR(120)  NOT NULL,
    username    VARCHAR(60)   NOT NULL UNIQUE,
    password    VARCHAR(100)  NOT NULL,          -- plain-text for demo; use bcrypt in production
    role        ENUM('admin','instructor','student') NOT NULL DEFAULT 'student',
    email       VARCHAR(150)  DEFAULT NULL,
    department  VARCHAR(100)  DEFAULT NULL,
    year        TINYINT       DEFAULT NULL,       -- for students only (1-5)
    created_at  DATETIME      DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- STUDENTS TABLE (academic info linked to users)
CREATE TABLE IF NOT EXISTS students (
    student_id  INT          NOT NULL AUTO_INCREMENT,
    user_id     INT          NOT NULL,
    name        VARCHAR(100) NOT NULL,
    department  VARCHAR(100) NOT NULL,
    year        TINYINT      NOT NULL CHECK (year BETWEEN 1 AND 5),
    PRIMARY KEY (student_id),
    CONSTRAINT fk_students_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- EXAMS TABLE
CREATE TABLE IF NOT EXISTS exams (
    exam_id       INT          NOT NULL AUTO_INCREMENT,
    exam_code     VARCHAR(20)  NOT NULL UNIQUE,
    subject       VARCHAR(150) NOT NULL,
    exam_date     DATE         NOT NULL,
    total_marks   INT          NOT NULL CHECK (total_marks > 0),
    duration_mins INT          NOT NULL DEFAULT 80,
    created_by    INT          DEFAULT NULL,     -- instructor user_id
    PRIMARY KEY (exam_id),
    CONSTRAINT fk_exams_instructor FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- RESULTS TABLE
CREATE TABLE IF NOT EXISTS results (
    result_id            INT          NOT NULL AUTO_INCREMENT,
    student_id           INT          NOT NULL,
    exam_id              INT          NOT NULL,
    score                INT          NOT NULL DEFAULT 0 CHECK (score >= 0),
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
    CONSTRAINT fk_results_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_results_exam    FOREIGN KEY (exam_id)    REFERENCES exams(exam_id)    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------
--  4. INSERT USERS
--     2 Admins, 2 Instructors, 100 Students
--     Passwords are plain-text for demo purposes.
--     Default student password: Student@123
-- -----------------------------------------------

-- ADMINS
INSERT INTO users (full_name, username, password, role, email) VALUES
('Super Admin',    'admin1',       'Admin@123',   'admin',      'admin@examcontrol.com'),
('System Admin',   'admin2',      'Admin@1234',   'admin',      'admin2@examcontrol.com'),


-- INSTRUCTORS
INSERT INTO users (full_name, username, password, role, email, department) VALUES
('Dr. Ramesh Kumar',    'instructor1',  'Instruter@123',   'instructor', 'ramesh@examcontrol.com',   'Computer Science'),
('Prof. Anita Sharma',  'instructor2',  'Instru@1234',   'instructor', 'anita@examcontrol.com',    'Electronics'),

-- STUDENTS (100 students, login: username = student001..student100, password = Student@123)
INSERT INTO users (full_name, username, password, role, email, department, year) VALUES
('Raj Priyan',          'raj',         '9867',         'student', 'raj@mail.com',         'Computer Science',        1),
('Priya',               'priya',       '98678',         'student', 'priya@mail.com',       'IT',                      2),
('Kumar',               'kumar',       '98679',         'student', 'kumar@mail.com',       'Mechanical',              3),
('Aarav Sharma',        'student001',  'Student@123',  'student', 'aarav@mail.com',       'Computer Science',        1),
('Aditi Mehta',         'student002',  'Student@123',  'student', 'aditi@mail.com',       'Electronics',             2),
('Akash Patel',         'student003',  'Student@123',  'student', 'akash@mail.com',       'Mechanical',              3),
('Ananya Singh',        'student004',  'Student@123',  'student', 'ananya@mail.com',      'Civil',                   4),
('Arjun Rao',           'student005',  'Student@123',  'student', 'arjun@mail.com',       'Computer Science',        2),
('Bhavna Iyer',         'student006',  'Student@123',  'student', 'bhavna@mail.com',      'Information Technology',  1),
('Chetan Kumar',        'student007',  'Student@123',  'student', 'chetan@mail.com',      'Electrical',              3),
('Deepika Nair',        'student008',  'Student@123',  'student', 'deepika@mail.com',     'Computer Science',        4),
('Divya Reddy',         'student009',  'Student@123',  'student', 'divya@mail.com',       'Electronics',             1),
('Farhan Ali',          'student010',  'Student@123',  'student', 'farhan@mail.com',      'Mechanical',              2),
('Ganesh Pillai',       'student011',  'Student@123',  'student', 'ganesh@mail.com',      'Civil',                   3),
('Harsha Vardhan',      'student012',  'Student@123',  'student', 'harsha@mail.com',      'Computer Science',        1),
('Ishaan Chopra',       'student013',  'Student@123',  'student', 'ishaan@mail.com',      'Information Technology',  4),
('Jaya Krishnan',       'student014',  'Student@123',  'student', 'jaya@mail.com',        'Electrical',              2),
('Karan Malhotra',      'student015',  'Student@123',  'student', 'karan@mail.com',       'Computer Science',        3),
('Kavitha Srinivas',    'student016',  'Student@123',  'student', 'kavitha@mail.com',     'Electronics',             1),
('Lakshmi Prasad',      'student017',  'Student@123',  'student', 'lakshmi@mail.com',     'Mechanical',              4),
('Manish Gupta',        'student018',  'Student@123',  'student', 'manish@mail.com',      'Civil',                   2),
('Meera Bose',          'student019',  'Student@123',  'student', 'meera@mail.com',       'Computer Science',        1),
('Mohan Das',           'student020',  'Student@123',  'student', 'mohan@mail.com',       'Information Technology',  3),
('Nandini Verma',       'student021',  'Student@123',  'student', 'nandini@mail.com',     'Electrical',              4),
('Nikhil Joshi',        'student022',  'Student@123',  'student', 'nikhil@mail.com',      'Computer Science',        2),
('Nisha Thomas',        'student023',  'Student@123',  'student', 'nisha@mail.com',       'Electronics',             3),
('Om Prakash',          'student024',  'Student@123',  'student', 'om@mail.com',          'Mechanical',              1),
('Pooja Mishra',        'student025',  'Student@123',  'student', 'pooja@mail.com',       'Civil',                   4),
('Pradeep Rajan',       'student026',  'Student@123',  'student', 'pradeep@mail.com',     'Computer Science',        2),
('Priya Agarwal',       'student027',  'Student@123',  'student', 'priya@mail.com',       'Information Technology',  1),
('Rahul Tiwari',        'student028',  'Student@123',  'student', 'rahul@mail.com',       'Electrical',              3),
('Rajesh Kumar',        'student029',  'Student@123',  'student', 'rajesh@mail.com',      'Computer Science',        4),
('Ramya Siva',          'student030',  'Student@123',  'student', 'ramya@mail.com',       'Electronics',             2),
('Ravi Shankar',        'student031',  'Student@123',  'student', 'ravi@mail.com',        'Mechanical',              1),
('Rohit Yadav',         'student032',  'Student@123',  'student', 'rohit@mail.com',       'Civil',                   3),
('Sachin Bansal',       'student033',  'Student@123',  'student', 'sachin@mail.com',      'Computer Science',        4),
('Sana Ansari',         'student034',  'Student@123',  'student', 'sana@mail.com',        'Information Technology',  2),
('Sandeep Pillai',      'student035',  'Student@123',  'student', 'sandeep@mail.com',     'Electrical',              1),
('Sangeetha Nair',      'student036',  'Student@123',  'student', 'sangeetha@mail.com',   'Computer Science',        3),
('Santosh Reddy',       'student037',  'Student@123',  'student', 'santosh@mail.com',     'Electronics',             4),
('Sarika Patel',        'student038',  'Student@123',  'student', 'sarika@mail.com',      'Mechanical',              2),
('Shivam Dubey',        'student039',  'Student@123',  'student', 'shivam@mail.com',      'Civil',                   1),
('Sneha Kapoor',        'student040',  'Student@123',  'student', 'sneha@mail.com',       'Computer Science',        3),
('Sourav Basu',         'student041',  'Student@123',  'student', 'sourav@mail.com',      'Information Technology',  4),
('Sravya Krishnan',     'student042',  'Student@123',  'student', 'sravya@mail.com',      'Electrical',              2),
('Suhas Menon',         'student043',  'Student@123',  'student', 'suhas@mail.com',       'Computer Science',        1),
('Sumanth Rao',         'student044',  'Student@123',  'student', 'sumanth@mail.com',     'Electronics',             3),
('Sunita Devi',         'student045',  'Student@123',  'student', 'sunita@mail.com',      'Mechanical',              4),
('Suresh Babu',         'student046',  'Student@123',  'student', 'suresh@mail.com',      'Civil',                   2),
('Swetha Anand',        'student047',  'Student@123',  'student', 'swetha@mail.com',      'Computer Science',        1),
('Tarun Bhatt',         'student048',  'Student@123',  'student', 'tarun@mail.com',       'Information Technology',  3),
('Tejas Wagh',          'student049',  'Student@123',  'student', 'tejas@mail.com',       'Electrical',              4),
('Usha Rani',           'student050',  'Student@123',  'student', 'usha@mail.com',        'Computer Science',        2),
('Vaibhav Shah',        'student051',  'Student@123',  'student', 'vaibhav@mail.com',     'Electronics',             1),
('Vandana Roy',         'student052',  'Student@123',  'student', 'vandana@mail.com',     'Mechanical',              3),
('Varsha Singh',        'student053',  'Student@123',  'student', 'varsha@mail.com',      'Civil',                   4),
('Venkat Subramanian',  'student054',  'Student@123',  'student', 'venkat@mail.com',      'Computer Science',        2),
('Vijay Khatri',        'student055',  'Student@123',  'student', 'vijay@mail.com',       'Information Technology',  1),
('Vikram Sinha',        'student056',  'Student@123',  'student', 'vikram@mail.com',      'Electrical',              3),
('Vinayak Jain',        'student057',  'Student@123',  'student', 'vinayak@mail.com',     'Computer Science',        4),
('Vishal Atre',         'student058',  'Student@123',  'student', 'vishal@mail.com',      'Electronics',             2),
('Yamini Puri',         'student059',  'Student@123',  'student', 'yamini@mail.com',      'Mechanical',              1),
('Yash Desai',          'student060',  'Student@123',  'student', 'yash@mail.com',        'Civil',                   3),
('Aakash Bhardwaj',     'student061',  'Student@123',  'student', 'aakash@mail.com',      'Computer Science',        4),
('Abhishek Chauhan',    'student062',  'Student@123',  'student', 'abhishek@mail.com',    'Information Technology',  2),
('Afreen Shah',         'student063',  'Student@123',  'student', 'afreen@mail.com',      'Electrical',              1),
('Alok Srivastava',     'student064',  'Student@123',  'student', 'alok@mail.com',        'Computer Science',        3),
('Amrita Ghosh',        'student065',  'Student@123',  'student', 'amrita@mail.com',      'Electronics',             4),
('Anand Nair',          'student066',  'Student@123',  'student', 'anand@mail.com',       'Mechanical',              2),
('Ankita Rawat',        'student067',  'Student@123',  'student', 'ankita@mail.com',      'Civil',                   1),
('Ashish Pandey',       'student068',  'Student@123',  'student', 'ashish@mail.com',      'Computer Science',        3),
('Ashwini Kulkarni',    'student069',  'Student@123',  'student', 'ashwini@mail.com',     'Information Technology',  4),
('Balaji Subramani',    'student070',  'Student@123',  'student', 'balaji@mail.com',      'Electrical',              2),
('Bharath Kumar',       'student071',  'Student@123',  'student', 'bharath@mail.com',     'Computer Science',        1),
('Chandra Sekhar',      'student072',  'Student@123',  'student', 'chandra@mail.com',     'Electronics',             3),
('Dhanush Raj',         'student073',  'Student@123',  'student', 'dhanush@mail.com',     'Mechanical',              4),
('Esha Tomar',          'student074',  'Student@123',  'student', 'esha@mail.com',        'Civil',                   2),
('Gaurav Sethi',        'student075',  'Student@123',  'student', 'gaurav@mail.com',      'Computer Science',        1),
('Geetha Lakshmi',      'student076',  'Student@123',  'student', 'geetha@mail.com',      'Information Technology',  3),
('Hemant Soni',         'student077',  'Student@123',  'student', 'hemant@mail.com',      'Electrical',              4),
('Indira Murthy',       'student078',  'Student@123',  'student', 'indira@mail.com',      'Computer Science',        2),
('Jayendra Patil',      'student079',  'Student@123',  'student', 'jayendra@mail.com',    'Electronics',             1),
('Jasmine Kaur',        'student080',  'Student@123',  'student', 'jasmine@mail.com',     'Mechanical',              3),
('Kiran Bhat',          'student081',  'Student@123',  'student', 'kiran@mail.com',       'Civil',                   4),
('Komal Sharma',        'student082',  'Student@123',  'student', 'komal@mail.com',       'Computer Science',        2),
('Kunal Mehta',         'student083',  'Student@123',  'student', 'kunal@mail.com',       'Information Technology',  1),
('Latha Suresh',        'student084',  'Student@123',  'student', 'latha@mail.com',       'Electrical',              3),
('Lokesh Rathi',        'student085',  'Student@123',  'student', 'lokesh@mail.com',      'Computer Science',        4),
('Madhuri Joshi',       'student086',  'Student@123',  'student', 'madhuri@mail.com',     'Electronics',             2),
('Mahesh Reddy',        'student087',  'Student@123',  'student', 'mahesh@mail.com',      'Mechanical',              1),
('Manju Pillai',        'student088',  'Student@123',  'student', 'manju@mail.com',       'Civil',                   3),
('Mohana Priya',        'student089',  'Student@123',  'student', 'mohana@mail.com',      'Computer Science',        4),
('Mukesh Bansal',       'student090',  'Student@123',  'student', 'mukesh@mail.com',      'Information Technology',  2),
('Naveen Kumar',        'student091',  'Student@123',  'student', 'naveen@mail.com',      'Electrical',              1),
('Neha Pandey',         'student092',  'Student@123',  'student', 'neha@mail.com',        'Computer Science',        3),
('Nitin Agarwal',       'student093',  'Student@123',  'student', 'nitin@mail.com',       'Electronics',             4),
('Pamela Bose',         'student094',  'Student@123',  'student', 'pamela@mail.com',      'Mechanical',              2),
('Pavan Shetty',        'student095',  'Student@123',  'student', 'pavan@mail.com',       'Civil',                   1),
('Praveen Nair',        'student096',  'Student@123',  'student', 'praveen@mail.com',     'Computer Science',        3),
('Priyadarshini R',     'student097',  'Student@123',  'student', 'priya.d@mail.com',     'Information Technology',  4),
('Rajan Chandra',       'student098',  'Student@123',  'student', 'rajan@mail.com',       'Electrical',              2),
('Rashmi Verma',        'student099',  'Student@123',  'student', 'rashmi@mail.com',      'Computer Science',        1),
('Siddharth Nair',      'student100',  'Student@123',  'student', 'siddharth@mail.com',   'Electronics',             2);

-- -----------------------------------------------
--  5. INSERT STUDENTS (link to user_id 5..104)
--     user_id 1,2 = admin, 3,4 = instructor,
--     5..104 = students
-- -----------------------------------------------
INSERT INTO students (user_id, name, department, year)
SELECT user_id, full_name, department, year
FROM users
WHERE role = 'student'
ORDER BY user_id;

-- -----------------------------------------------
--  6. INSERT EXAMS
-- -----------------------------------------------
INSERT INTO exams (exam_code, subject, exam_date, total_marks, duration_mins, created_by) VALUES
('CS101',  'Computer Science',     '2026-01-16', 60, 80, 3),
('MATH101','Mathematics',          '2026-01-10', 60, 80, 3),
('PHY101', 'Physics',              '2026-01-12', 60, 80, 3),
('CHM101', 'Chemistry',            '2026-01-14', 60, 80, 4),
('ENG101', 'English',              '2026-01-18', 60, 80, 4),
('DS101',  'Data Structures',      '2026-01-20', 60, 80, 3),
('DE101',  'Digital Electronics',  '2026-01-22', 60, 80, 4),
('OS101',  'Operating Systems',    '2026-01-24', 60, 80, 3),
('DB101',  'Database Management',  '2026-01-26', 60, 80, 3),
('SE101',  'Software Engineering', '2026-01-28', 60, 80, 4);

-- -----------------------------------------------
--  7. INSERT SAMPLE RESULTS (1 per student)
-- -----------------------------------------------
INSERT INTO results (student_id, exam_id, score, total_marks, percentage, questions_attempted, total_questions, violations, time_taken_seconds, status, grade) VALUES
(1,  1, 55, 60, 91.67, 58, 60, 0, 4250, 'Completed', 'O' ),
(2,  2, 51, 60, 85.00, 55, 60, 1, 3980, 'Completed', 'A+'),
(3,  3, 47, 60, 78.33, 50, 60, 0, 4510, 'Completed', 'A' ),
(4,  4, 54, 60, 90.00, 57, 60, 0, 3700, 'Completed', 'O' ),
(5,  5, 40, 60, 66.67, 44, 60, 2, 4800, 'Completed', 'B+'),
(6,  6, 33, 60, 55.00, 38, 60, 1, 4100, 'Completed', 'B' ),
(7,  7, 53, 60, 88.33, 56, 60, 0, 3600, 'Completed', 'A+'),
(8,  8, 44, 60, 73.33, 48, 60, 0, 4300, 'Completed', 'A' ),
(9,  9, 36, 60, 60.00, 40, 60, 3, 4700, 'Completed', 'B+'),
(10, 10,29, 60, 48.33, 33, 60, 2, 4900, 'Completed', 'C' ),
(11,  1, 57, 60, 95.00, 59, 60, 0, 3500, 'Completed', 'O' ),
(12,  2, 49, 60, 81.67, 52, 60, 1, 4150, 'Completed', 'A+'),
(13,  3, 46, 60, 76.67, 49, 60, 0, 4400, 'Completed', 'A' ),
(14,  4, 35, 60, 58.33, 39, 60, 2, 4650, 'Completed', 'B' ),
(15,  5, 54, 60, 90.00, 57, 60, 0, 3750, 'Completed', 'O' ),
(16,  6, 43, 60, 71.67, 46, 60, 1, 4200, 'Completed', 'A' ),
(17,  7, 38, 60, 63.33, 41, 60, 0, 4600, 'Completed', 'B+'),
(18,  8, 27, 60, 45.00, 30, 60, 3, 4950, 'Completed', 'C' ),
(19,  9, 53, 60, 88.33, 56, 60, 0, 3650, 'Completed', 'A+'),
(20, 10, 46, 60, 76.67, 49, 60, 0, 4350, 'Completed', 'A' ),
(21,  1, 31, 60, 51.67, 35, 60, 2, 4850, 'Completed', 'B' ),
(22,  2, 58, 60, 96.67, 60, 60, 0, 3450, 'Completed', 'O' ),
(23,  3, 49, 60, 81.67, 52, 60, 0, 4050, 'Completed', 'A+'),
(24,  4, 41, 60, 68.33, 44, 60, 1, 4550, 'Completed', 'B+'),
(25,  5, 26, 60, 43.33, 28, 60, 4, 4980, 'Completed', 'C' ),
(26,  6, 52, 60, 86.67, 55, 60, 0, 3900, 'Completed', 'A+'),
(27,  7, 44, 60, 73.33, 47, 60, 0, 4250, 'Completed', 'A' ),
(28,  8, 37, 60, 61.67, 40, 60, 1, 4700, 'Completed', 'B+'),
(29,  9, 56, 60, 93.33, 58, 60, 0, 3550, 'Completed', 'O' ),
(30, 10, 34, 60, 56.67, 37, 60, 2, 4800, 'Completed', 'B' ),
(31,  1, 50, 60, 83.33, 53, 60, 0, 4000, 'Completed', 'A+'),
(32,  2, 42, 60, 70.00, 45, 60, 1, 4450, 'Completed', 'A' ),
(33,  3, 28, 60, 46.67, 31, 60, 3, 4900, 'Completed', 'C' ),
(34,  4, 59, 60, 98.33, 60, 60, 0, 3400, 'Completed', 'O' ),
(35,  5, 47, 60, 78.33, 50, 60, 0, 4300, 'Completed', 'A' ),
(36,  6, 40, 60, 66.67, 43, 60, 1, 4600, 'Completed', 'B+'),
(37,  7, 32, 60, 53.33, 36, 60, 2, 4850, 'Completed', 'B' ),
(38,  8, 53, 60, 88.33, 56, 60, 0, 3700, 'Completed', 'A+'),
(39,  9, 45, 60, 75.00, 48, 60, 0, 4200, 'Completed', 'A' ),
(40, 10, 37, 60, 61.67, 40, 60, 1, 4700, 'Completed', 'B+'),
(41,  1, 29, 60, 48.33, 32, 60, 3, 4950, 'Completed', 'C' ),
(42,  2, 55, 60, 91.67, 58, 60, 0, 3600, 'Completed', 'O' ),
(43,  3, 50, 60, 83.33, 53, 60, 0, 4050, 'Completed', 'A+'),
(44,  4, 43, 60, 71.67, 46, 60, 1, 4400, 'Completed', 'A' ),
(45,  5, 35, 60, 58.33, 38, 60, 2, 4750, 'Completed', 'B' ),
(46,  6, 56, 60, 93.33, 58, 60, 0, 3500, 'Completed', 'O' ),
(47,  7, 48, 60, 80.00, 51, 60, 0, 4100, 'Completed', 'A+'),
(48,  8, 41, 60, 68.33, 44, 60, 1, 4500, 'Completed', 'B+'),
(49,  9, 26, 60, 43.33, 29, 60, 4, 4980, 'Completed', 'C' ),
(50, 10, 52, 60, 86.67, 55, 60, 0, 3800, 'Completed', 'A+'),
(51,  1, 45, 60, 75.00, 48, 60, 0, 4300, 'Completed', 'A' ),
(52,  2, 38, 60, 63.33, 41, 60, 2, 4700, 'Completed', 'B+'),
(53,  3, 58, 60, 96.67, 60, 60, 0, 3450, 'Completed', 'O' ),
(54,  4, 32, 60, 53.33, 35, 60, 2, 4850, 'Completed', 'B' ),
(55,  5, 53, 60, 88.33, 56, 60, 0, 3650, 'Completed', 'A+'),
(56,  6, 46, 60, 76.67, 49, 60, 0, 4350, 'Completed', 'A' ),
(57,  7, 36, 60, 60.00, 39, 60, 1, 4700, 'Completed', 'B+'),
(58,  8, 28, 60, 46.67, 31, 60, 3, 4950, 'Completed', 'C' ),
(59,  9, 55, 60, 91.67, 58, 60, 0, 3600, 'Completed', 'O' ),
(60, 10, 49, 60, 81.67, 52, 60, 0, 4100, 'Completed', 'A+'),
(61,  1, 41, 60, 68.33, 44, 60, 1, 4500, 'Completed', 'B+'),
(62,  2, 34, 60, 56.67, 37, 60, 2, 4800, 'Completed', 'B' ),
(63,  3, 54, 60, 90.00, 57, 60, 0, 3750, 'Completed', 'O' ),
(64,  4, 47, 60, 78.33, 50, 60, 0, 4300, 'Completed', 'A' ),
(65,  5, 39, 60, 65.00, 42, 60, 1, 4600, 'Completed', 'B+'),
(66,  6, 30, 60, 50.00, 33, 60, 3, 4900, 'Completed', 'B' ),
(67,  7, 52, 60, 86.67, 55, 60, 0, 3800, 'Completed', 'A+'),
(68,  8, 44, 60, 73.33, 47, 60, 0, 4350, 'Completed', 'A' ),
(69,  9, 37, 60, 61.67, 40, 60, 1, 4700, 'Completed', 'B+'),
(70, 10, 25, 60, 41.67, 28, 60, 4, 4990, 'Completed', 'C' ),
(71,  1, 57, 60, 95.00, 59, 60, 0, 3500, 'Completed', 'O' ),
(72,  2, 50, 60, 83.33, 53, 60, 0, 4000, 'Completed', 'A+'),
(73,  3, 42, 60, 70.00, 45, 60, 1, 4400, 'Completed', 'A' ),
(74,  4, 35, 60, 58.33, 38, 60, 2, 4750, 'Completed', 'B' ),
(75,  5, 56, 60, 93.33, 58, 60, 0, 3550, 'Completed', 'O' ),
(76,  6, 46, 60, 76.67, 49, 60, 0, 4200, 'Completed', 'A' ),
(77,  7, 38, 60, 63.33, 41, 60, 1, 4600, 'Completed', 'B+'),
(78,  8, 31, 60, 51.67, 34, 60, 2, 4850, 'Completed', 'B' ),
(79,  9, 53, 60, 88.33, 56, 60, 0, 3700, 'Completed', 'A+'),
(80, 10, 44, 60, 73.33, 47, 60, 0, 4300, 'Completed', 'A' ),
(81,  1, 37, 60, 61.67, 40, 60, 1, 4700, 'Completed', 'B+'),
(82,  2, 27, 60, 45.00, 30, 60, 3, 4950, 'Completed', 'C' ),
(83,  3, 59, 60, 98.33, 60, 60, 0, 3400, 'Completed', 'O' ),
(84,  4, 51, 60, 85.00, 54, 60, 0, 3950, 'Completed', 'A+'),
(85,  5, 43, 60, 71.67, 46, 60, 1, 4450, 'Completed', 'A' ),
(86,  6, 35, 60, 58.33, 38, 60, 2, 4750, 'Completed', 'B' ),
(87,  7, 55, 60, 91.67, 58, 60, 0, 3600, 'Completed', 'O' ),
(88,  8, 47, 60, 78.33, 50, 60, 0, 4250, 'Completed', 'A' ),
(89,  9, 40, 60, 66.67, 43, 60, 1, 4600, 'Completed', 'B+'),
(90, 10, 32, 60, 53.33, 35, 60, 2, 4850, 'Completed', 'B' ),
(91,  1, 52, 60, 86.67, 55, 60, 0, 3800, 'Completed', 'A+'),
(92,  2, 46, 60, 76.67, 49, 60, 0, 4200, 'Completed', 'A' ),
(93,  3, 38, 60, 63.33, 41, 60, 1, 4600, 'Completed', 'B+'),
(94,  4, 29, 60, 48.33, 32, 60, 3, 4950, 'Completed', 'C' ),
(95,  5, 56, 60, 93.33, 58, 60, 0, 3550, 'Completed', 'O' ),
(96,  6, 49, 60, 81.67, 52, 60, 0, 4050, 'Completed', 'A+'),
(97,  7, 41, 60, 68.33, 44, 60, 1, 4500, 'Completed', 'B+'),
(98,  8, 34, 60, 56.67, 37, 60, 2, 4800, 'Completed', 'B' ),
(99,  9, 54, 60, 90.00, 57, 60, 0, 3700, 'Completed', 'O' ),
(100,10, 47, 60, 78.33, 50, 60, 0, 4300, 'Completed', 'A' );

-- ============================================================
--  VERIFICATION QUERIES (uncomment to test after import)
-- ============================================================
-- SELECT COUNT(*) AS total_users     FROM users;        -- should be 104
-- SELECT COUNT(*) AS total_students  FROM students;     -- should be 100
-- SELECT COUNT(*) AS total_exams     FROM exams;        -- should be 10
-- SELECT COUNT(*) AS total_results   FROM results;      -- should be 100
--
-- SELECT role, COUNT(*) AS cnt FROM users GROUP BY role;
--
-- SELECT u.full_name, u.username, u.role FROM users LIMIT 10;
--
-- SELECT s.name, e.subject, r.score, r.grade
--   FROM results r
--   JOIN students s ON s.student_id = r.student_id
--   JOIN exams    e ON e.exam_id    = r.exam_id
--   LIMIT 10;
