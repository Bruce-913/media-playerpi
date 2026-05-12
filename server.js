const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send(path.join(__dirname, 'index.html'));
});

// https://localhost:3000
app.listen(3000, '0.0.0.0', () => {
  console.log('Server running on port 3000');
});

