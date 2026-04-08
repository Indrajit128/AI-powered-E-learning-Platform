const axios = require('axios');
async function test() {
  try {
    const response = await axios.post('https://emkc.org/api/v2/piston/execute', {
      language: "python",
      version: "3.10.0",
      files: [{ content: "print('hello world')" }]
    });
    console.log(response.data);
  } catch (e) {
    console.error(e.response ? e.response.data : e.message);
  }
}
test();
