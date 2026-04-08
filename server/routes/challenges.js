const express = require('express');
const router = express.Router();
const supabase = require('../db/db');
const { generateCodingChallenge } = require('../services/aiGenerator');

// GET all challenges
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('coding_challenges')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET challenge by id
router.get('/:id', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('coding_challenges')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST generate challenge via AI
router.post('/generate-ai', async (req, res) => {
    const { topic, difficulty } = req.body;
    try {
        const challengeData = await generateCodingChallenge(topic, difficulty);
        res.json(challengeData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST create challenge (Manual or AI-saved)
router.post('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('coding_challenges')
            .insert([req.body])
            .select();

        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE challenge
router.delete('/:id', async (req, res) => {
    try {
        const { error } = await supabase
            .from('coding_challenges')
            .delete()
            .eq('id', req.params.id);

        if (error) throw error;
        res.json({ message: 'Challenge deleted success' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
