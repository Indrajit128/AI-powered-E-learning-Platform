-- Coding Challenge System Schema
-- This file contains the schema for the LeetCode-style coding challenges system.

-- Table for Coding Challenges
CREATE TABLE IF NOT EXISTS coding_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    difficulty TEXT CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    tags TEXT[] DEFAULT '{}',
    starter_code_js TEXT,
    starter_code_py TEXT,
    starter_code_java TEXT,
    starter_code_cpp TEXT,
    solution TEXT,
    test_cases JSONB NOT NULL DEFAULT '[]', -- Array of {input, output, hidden: boolean}
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Table for Challenge Submissions
CREATE TABLE IF NOT EXISTS challenge_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    challenge_id UUID REFERENCES coding_challenges(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    language TEXT NOT NULL,
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Passed', 'Failed', 'Compile Error', 'Timeout', 'Runtime Error')),
    score INTEGER DEFAULT 0,
    execution_time FLOAT DEFAULT 0,
    submitted_at TIMESTAMPTZ DEFAULT now()
);

-- Row Level Security (RLS)
ALTER TABLE coding_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_submissions ENABLE ROW LEVEL SECURITY;

-- Polices for coding_challenges
CREATE POLICY "Allow public read on challenges" ON coding_challenges FOR SELECT USING (true);
CREATE POLICY "Allow faculty to insert" ON coding_challenges FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow creators to update" ON coding_challenges FOR UPDATE USING (auth.uid() = created_by);

-- Polices for challenge_submissions
CREATE POLICY "Allow users to see their own submissions" ON challenge_submissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow users to insert their own submissions" ON challenge_submissions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Additional tables for coding question engine (attempts, questions, submissions)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS coding_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  difficulty TEXT,
  topic TEXT,
  description TEXT,
  constraints TEXT[],
  input_format TEXT,
  output_format TEXT,
  sample_test_cases JSONB,
  hidden_test_cases JSONB,
  starter_code JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS coding_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  question_id UUID REFERENCES coding_questions(id) ON DELETE CASCADE,
  language TEXT,
  code TEXT,
  output TEXT,
  status TEXT,
  execution_time FLOAT,
  memory FLOAT,
  passed_test_cases INT,
  total_test_cases INT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS coding_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  attempt_id UUID REFERENCES coding_attempts(id) ON DELETE CASCADE,
  test_case_input TEXT,
  expected_output TEXT,
  actual_output TEXT,
  passed BOOLEAN
);

