const express = require('express');
const path = require('path');
require('dotenv').config();

const spotifyRoutes = require('./spotifyRoutes');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', spotifyRoutes);

// might be able to remove index route at some point
// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, 'index.html'));
// });

// http://localhost:3000
app.listen(3000, '0.0.0.0', () => {
  console.log('Server running on port 3000 http://localhost:3000 or  http://127.0.0.1:3000');
  console.log("press control + C to quit");
});

