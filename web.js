// web.js
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('🟢 Bot is running successfully.');
});

app.listen(port, () => {
  console.log(`🌐 Web server is running on port ${port}`);
});
