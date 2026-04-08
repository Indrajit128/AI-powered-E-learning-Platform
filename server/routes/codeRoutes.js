const express = require('express');
const router = express.Router();
const { runCode } = require('../codeController');

router.post('/run-code', runCode);

module.exports = router;
