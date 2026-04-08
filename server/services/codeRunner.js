const axios = require('axios');

const PISTON_URL = "https://emkc.org/api/v2/piston/execute";

const LANGUAGE_MAP = {
  'javascript': { language: "javascript", version: "18" },
  'python': { language: "python", version: "3.10" },
  'java': { language: "java", version: "15" },
  'cpp': { language: "cpp", version: "10" }
};

const executeCode = async (code, languageStr, stdin = '') => {
  const langConfig = LANGUAGE_MAP[languageStr.toLowerCase()];
  if (!langConfig) throw new Error('Unsupported language');

  const response = await axios.post(PISTON_URL, {
    language: langConfig.language,
    version: langConfig.version,
    stdin: stdin,
    files: [
      {
        name: "main." + (languageStr === 'javascript' ? 'js' : languageStr),
        content: code
      }
    ]
  });

  const result = response.data.run || {};
  return {
    stdout: result.output || '',
    stderr: result.stderr || '',
    status: result.status || 'completed',
    time: result.time || 0,
    memory: result.memory || 0
  };
};

module.exports = { executeCode };
