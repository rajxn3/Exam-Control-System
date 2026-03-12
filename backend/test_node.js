console.log("Starting test...");
const express = require('express');
console.log("Express loaded");
const app = express();
app.get('/', (req, res) => res.send('Connected!'));
app.listen(3001, () => console.log("Test server on 3001"));
