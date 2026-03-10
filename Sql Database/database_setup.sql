-- ============================================================
--  EXAM MANAGEMENT SYSTEM - UNIFIED DATABASE SETUP
--  Includes: 1 Instructor, 10 Admins, 100 Students
-- ============================================================

CREATE DATABASE IF NOT EXISTS exam_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE exam_db;

-- ------------------------------
--  1. CREATE USERS TABLE
-- ------------------------------
CREATE TABLE IF NOT EXISTS users (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    username    VARCHAR(50) UNIQUE NOT NULL,
    password    VARCHAR(255) NOT NULL, -- In production, use bcrypt
    full_name   VARCHAR(100) NOT NULL,
    role        ENUM('admin', 'instructor', 'student') NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------
--  2. CREATE STUDENTS TABLE (Optional: Additional Data)
-- ------------------------------
CREATE TABLE IF NOT EXISTS students (
    student_id  INT PRIMARY KEY,
    department  VARCHAR(100) DEFAULT 'General',
    year        TINYINT DEFAULT 1,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------
--  3. INSERT INSTRUCTOR (1 Row)
-- ------------------------------
INSERT INTO users (username, password, full_name, role) VALUES
('instructor', 'admin', 'Dr. Robert Wilson', 'instructor');

-- ------------------------------
--  4. INSERT ADMINS (10 Rows)
-- ------------------------------
INSERT INTO users (username, password, full_name, role) VALUES
('admin01', 'admin', 'System Admin 01', 'admin'),
('admin02', 'admin', 'System Admin 02', 'admin'),
('admin03', 'admin', 'System Admin 03', 'admin'),
('admin04', 'admin', 'System Admin 04', 'admin'),
('admin05', 'admin', 'System Admin 05', 'admin'),
('admin06', 'admin', 'System Admin 06', 'admin'),
('admin07', 'admin', 'System Admin 07', 'admin'),
('admin08', 'admin', 'System Admin 08', 'admin'),
('admin09', 'admin', 'System Admin 09', 'admin'),
('admin10', 'admin', 'System Admin 10', 'admin');

-- ------------------------------
--  5. INSERT STUDENTS (100 Rows)
-- ------------------------------
INSERT INTO users (username, password, full_name, role) VALUES
('student001', 'admin', 'Aarav Sharma', 'student'),
('student002', 'admin', 'Aditi Mehta', 'student'),
('student003', 'admin', 'Akash Patel', 'student'),
('student004', 'admin', 'Ananya Singh', 'student'),
('student005', 'admin', 'Arjun Rao', 'student'),
('student006', 'admin', 'Bhavna Iyer', 'student'),
('student007', 'admin', 'Chetan Kumar', 'student'),
('student008', 'admin', 'Deepika Nair', 'student'),
('student009', 'admin', 'Divya Reddy', 'student'),
('student010', 'admin', 'Farhan Ali', 'student'),
('student011', 'admin', 'Ganesh Pillai', 'student'),
('student012', 'admin', 'Harsha Vardhan', 'student'),
('student013', 'admin', 'Ishaan Chopra', 'student'),
('student014', 'admin', 'Jaya Krishnan', 'student'),
('student015', 'admin', 'Karan Malhotra', 'student'),
('student016', 'admin', 'Kavitha Srinivas', 'student'),
('student017', 'admin', 'Lakshmi Prasad', 'student'),
('student018', 'admin', 'Manish Gupta', 'student'),
('student019', 'admin', 'Meera Bose', 'student'),
('student020', 'admin', 'Mohan Das', 'student'),
('student021', 'admin', 'Nandini Verma', 'student'),
('student022', 'admin', 'Nikhil Joshi', 'student'),
('student023', 'admin', 'Nisha Thomas', 'student'),
('student024', 'admin', 'Om Prakash', 'student'),
('student025', 'admin', 'Pooja Mishra', 'student'),
('student026', 'admin', 'Pradeep Rajan', 'student'),
('student027', 'admin', 'Priya Agarwal', 'student'),
('student028', 'admin', 'Rahul Tiwari', 'student'),
('student029', 'admin', 'Rajesh Kumar', 'student'),
('student030', 'admin', 'Ramya Siva', 'student'),
('student031', 'admin', 'Ravi Shankar', 'student'),
('student032', 'admin', 'Rohit Yadav', 'student'),
('student033', 'admin', 'Sachin Bansal', 'student'),
('student034', 'admin', 'Sana Ansari', 'student'),
('student035', 'admin', 'Sandeep Pillai', 'student'),
('student036', 'admin', 'Sangeetha Nair', 'student'),
('student037', 'admin', 'Santosh Reddy', 'student'),
('student038', 'admin', 'Sarika Patel', 'student'),
('student039', 'admin', 'Shivam Dubey', 'student'),
('student040', 'admin', 'Sneha Kapoor', 'student'),
('student041', 'admin', 'Sourav Basu', 'student'),
('student042', 'admin', 'Sravya Krishnan', 'student'),
('student043', 'admin', 'Suhas Menon', 'student'),
('student044', 'admin', 'Sumanth Rao', 'student'),
('student045', 'admin', 'Sunita Devi', 'student'),
('student046', 'admin', 'Suresh Babu', 'student'),
('student047', 'admin', 'Swetha Anand', 'student'),
('student048', 'admin', 'Tarun Bhatt', 'student'),
('student049', 'admin', 'Tejas Wagh', 'student'),
('student050', 'admin', 'Usha Rani', 'student'),
('student051', 'admin', 'Vaibhav Shah', 'student'),
('student052', 'admin', 'Vandana Roy', 'student'),
('student053', 'admin', 'Varsha Singh', 'student'),
('student054', 'admin', 'Venkat Subramanian', 'student'),
('student055', 'admin', 'Vijay Khatri', 'student'),
('student056', 'admin', 'Vikram Sinha', 'student'),
('student057', 'admin', 'Vinayak Jain', 'student'),
('student058', 'admin', 'Vishal Atre', 'student'),
('student059', 'admin', 'Yamini Puri', 'student'),
('student060', 'admin', 'Yash Desai', 'student'),
('student061', 'admin', 'Aakash Bhardwaj', 'student'),
('student062', 'admin', 'Abhishek Chauhan', 'student'),
('student063', 'admin', 'Afreen Shah', 'student'),
('student064', 'admin', 'Alok Srivastava', 'student'),
('student065', 'admin', 'Amrita Ghosh', 'student'),
('student066', 'admin', 'Anand Nair', 'student'),
('student067', 'admin', 'Ankita Rawat', 'student'),
('student068', 'admin', 'Ashish Pandey', 'student'),
('student069', 'admin', 'Ashwini Kulkarni', 'student'),
('student070', 'admin', 'Balaji Subramani', 'student'),
('student071', 'admin', 'Bharath Kumar', 'student'),
('student072', 'admin', 'Chandra Sekhar', 'student'),
('student073', 'admin', 'Dhanush Raj', 'student'),
('student074', 'admin', 'Esha Tomar', 'student'),
('student075', 'admin', 'Gaurav Sethi', 'student'),
('student076', 'admin', 'Geetha Lakshmi', 'student'),
('student077', 'admin', 'Hemant Soni', 'student'),
('student078', 'admin', 'Indira Murthy', 'student'),
('student079', 'admin', 'Jayendra Patil', 'student'),
('student080', 'admin', 'Jasmine Kaur', 'student'),
('student081', 'admin', 'Kiran Bhat', 'student'),
('student082', 'admin', 'Komal Sharma', 'student'),
('student083', 'admin', 'Kunal Mehta', 'student'),
('student084', 'admin', 'Latha Suresh', 'student'),
('student085', 'admin', 'Lokesh Rathi', 'student'),
('student086', 'admin', 'Madhuri Joshi', 'student'),
('student087', 'admin', 'Mahesh Reddy', 'student'),
('student088', 'admin', 'Manju Pillai', 'student'),
('student089', 'admin', 'Mohana Priya', 'student'),
('student090', 'admin', 'Mukesh Bansal', 'student'),
('student091', 'admin', 'Naveen Kumar', 'student'),
('student092', 'admin', 'Neha Pandey', 'student'),
('student093', 'admin', 'Nitin Agarwal', 'student'),
('student094', 'admin', 'Pamela Bose', 'student'),
('student095', 'admin', 'Pavan Shetty', 'student'),
('student096', 'admin', 'Praveen Nair', 'student'),
('student097', 'admin', 'Priyadarshini R', 'student'),
('student098', 'admin', 'Rajan Chandra', 'student'),
('student099', 'admin', 'Rashmi Verma', 'student'),
('student100', 'admin', 'Siddharth Roy', 'student');

-- ------------------------------
--  6. LINK USERS TO STUDENTS TABLE
-- ------------------------------
INSERT INTO students (student_id, department, year)
SELECT id, 
       CASE 
         WHEN MOD(id, 4) = 0 THEN 'Computer Science'
         WHEN MOD(id, 4) = 1 THEN 'Information Technology'
         WHEN MOD(id, 4) = 2 THEN 'Electronics'
         ELSE 'Mechanical'
       END,
       MOD(id, 4) + 1
FROM users WHERE role = 'student';
