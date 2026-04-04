const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 2000, // 2s timeout
});

let useMock = false;

// Mock Store for demo purposes if DB fails
const mockData = {
    users: [],
    batches: [],
    assignments: [],
    submissions: [],
    batch_students: []
};

// Immediately check if we should use mock
const testDb = async () => {
    try {
        await pool.query('SELECT NOW()');
        console.log('✅ Database connected successfully');
        useMock = false;
    } catch (err) {
        console.warn('⚠️ Database connection failed. The application will use an in-memory Mock Store for this session.');
        useMock = true;
    }
};
testDb();

module.exports = {
    query: async (text, params) => {
        // If DB is not available, handle with Mock Logic
        if (useMock) {
            return handleMockQuery(text, params);
        }

        try {
            return await pool.query(text, params);
        } catch (err) {
            // If query fails due to connection loss mid-session, try switching to mock or throw
            console.error('Database Query Error:', err.message);
            throw err;
        }
    },
};

async function handleMockQuery(text, params) {
    const queryLower = text.toLowerCase().replace(/\s+/g, ' ');
    
    // Auth: Register - handle with simple string matching
    if (queryLower.includes('insert into users')) {
        const newUser = { 
            id: mockData.users.length + 1, 
            name: params[0], 
            email: params[1], 
            password_hash: params[2], 
            role: params[3] 
        };
        mockData.users.push(newUser);
        return { rows: [newUser] };
    }
    
    // Auth: Check User / Login
    if (queryLower.includes('select * from users where email')) {
        const user = mockData.users.find(u => u.email === params[0]);
        return { rows: user ? [user] : [] };
    }

    // Faculty: Batches
    if (queryLower.includes('insert into batches')) {
        const newBatch = { id: mockData.batches.length + 1, name: params[0], faculty_id: params[1], created_at: new Date() };
        mockData.batches.push(newBatch);
        return { rows: [newBatch] };
    }

    if (queryLower.includes('select * from batches where faculty_id')) {
        const batches = mockData.batches.filter(b => b.faculty_id === params[0]);
        return { rows: batches };
    }

    // Student: Batches (Mapping)
    if (queryLower.includes('select b.* from batches b join batch_students bs')) {
        const batchIds = mockData.batch_students.filter(bs => bs.student_id === params[0]).map(bs => bs.batch_id);
        const batches = mockData.batches.filter(b => batchIds.includes(b.id));
        return { rows: batches };
    }

    // Assignments
    if (queryLower.includes('insert into assignments')) {
        const newAssign = { 
            id: mockData.assignments.length + 1, 
            title: params[0], 
            subject: params[1], 
            type: params[2], 
            batch_id: params[3], 
            questions_json: JSON.parse(params[4]),
            created_at: new Date()
        };
        mockData.assignments.push(newAssign);
        return { rows: [newAssign] };
    }

    if (queryLower.includes('select * from assignments where batch_id')) {
        const assigns = mockData.assignments.filter(a => a.batch_id == params[0]);
        return { rows: assigns };
    }

    // Submissions
    if (queryLower.includes('insert into submissions')) {
        const sub = { 
            id: mockData.submissions.length + 1, 
            assignment_id: params[0], 
            student_id: params[1], 
            answers_json: JSON.parse(params[2]), 
            score: params[3],
            submitted_at: new Date()
        };
        mockData.submissions.push(sub);
        return { rows: [sub] };
    }

    return { rows: [] };
}
