const express = require('express');
const router = express.Router();
const { generateQuestions } = require('../aiController');

router.post('/generate-questions', generateQuestions);

module.exports = router;
