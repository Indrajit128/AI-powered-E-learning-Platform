-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    role VARCHAR(50) CHECK (role IN ('admin', 'faculty', 'student')),
    is_verified BOOLEAN DEFAULT FALSE,
    otp VARCHAR(6),
    otp_expires TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Staff Profiles (HR)
CREATE TABLE IF NOT EXISTS staff_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    designation VARCHAR(100),
    department VARCHAR(100),
    joining_date DATE,
    salary DECIMAL(10, 2),
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Batches Table
CREATE TABLE IF NOT EXISTS batches (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    faculty_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    course_name VARCHAR(255),
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Batch Students Mapping Table
CREATE TABLE IF NOT EXISTS batch_students (
    id SERIAL PRIMARY KEY,
    batch_id INTEGER REFERENCES batches(id) ON DELETE CASCADE,
    student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(batch_id, student_id)
);

-- Admissions Table (Leads and Formal Enrollment)
CREATE TABLE IF NOT EXISTS admissions (
    id SERIAL PRIMARY KEY,
    student_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    course_interested VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'enrolled')),
    documents_json JSONB,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_by INTEGER REFERENCES users(id)
);

-- Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
    id SERIAL PRIMARY KEY,
    batch_id INTEGER REFERENCES batches(id) ON DELETE CASCADE,
    student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status VARCHAR(20) CHECK (status IN ('present', 'absent', 'late', 'excused')),
    remark TEXT,
    recorded_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(batch_id, student_id, date)
);

-- Fee Structure Table
CREATE TABLE IF NOT EXISTS fee_structures (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    due_date DATE,
    description TEXT,
    batch_id INTEGER REFERENCES batches(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Student Fee Payments
CREATE TABLE IF NOT EXISTS fee_payments (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    fee_structure_id INTEGER REFERENCES fee_structures(id) ON DELETE CASCADE,
    amount_paid DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50),
    transaction_id VARCHAR(100),
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
    receipt_no VARCHAR(50) UNIQUE
);

-- Timetables Table
CREATE TABLE IF NOT EXISTS timetables (
    id SERIAL PRIMARY KEY,
    batch_id INTEGER REFERENCES batches(id) ON DELETE CASCADE,
    subject VARCHAR(255),
    day_of_week VARCHAR(20),
    start_time TIME,
    end_time TIME,
    room_no VARCHAR(50),
    faculty_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Assignments Table
CREATE TABLE IF NOT EXISTS assignments (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('quiz', 'crossword', 'coding', 'flashcards', 'fill_blanks')),
    batch_id INTEGER REFERENCES batches(id) ON DELETE CASCADE,
    questions_json JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Submissions Table
CREATE TABLE IF NOT EXISTS submissions (
    id SERIAL PRIMARY KEY,
    assignment_id INTEGER REFERENCES assignments(id) ON DELETE CASCADE,
    student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    answers_json JSONB NOT NULL,
    score DECIMAL(5, 2),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Initial Mock Admin Data
-- INSERT INTO users (name, email, password_hash, role, is_verified) VALUES ('System Admin', 'admin@erp.com', '$2y$10$abcdefghijk', 'admin', TRUE);
