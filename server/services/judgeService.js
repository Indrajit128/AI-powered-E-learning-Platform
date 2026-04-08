const axios = require('axios');
require('dotenv').config();

const runCodeJudge0 = async (code, language_id, stdin) => {
  const response = await axios.post(
    `${process.env.JUDGE0_URL}/submissions?base64_encoded=false&wait=true`,
    {
      source_code: code,
      language_id,
      stdin
    },
    {
      headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
      }
    }
  );

  return response.data;
};

module.exports = runCodeJudge0;
