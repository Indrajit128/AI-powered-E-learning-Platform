-- Assignments Management Schema

-- 1. Batches Table
CREATE TABLE IF NOT EXISTS batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    faculty_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Batch Students Junction Table
CREATE TABLE IF NOT EXISTS batch_students (
    batch_id UUID REFERENCES batches(id) ON DELETE CASCADE,
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (batch_id, student_id)
);

-- 3. Assignments Table
CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    subject TEXT,
    type TEXT DEFAULT 'standard', -- 'standard' or 'ai-generated'
    questions_json JSONB,
    created_by UUID REFERENCES users(id),
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Assignment Targets (Multiple students or batches)
CREATE TABLE IF NOT EXISTS assignment_targets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
    batch_id UUID REFERENCES batches(id) ON DELETE CASCADE,
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Submissions Table
CREATE TABLE IF NOT EXISTS submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL, -- The student's work
    status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'graded')),
    grade TEXT,
    feedback TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Optional for now as per project pattern, but good practice)
-- ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
