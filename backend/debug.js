try {
    console.log("Loading modules...");
    const express = require('express');
    const mysql = require('mysql2/promise');
    const cors = require('cors');
    const dotenv = require('dotenv');
    const path = require('path');
    
    console.log("Modules loaded.");
    dotenv.config({ path: '../Sql Database/.env' });
    
    const app = express();
    const port = 3000;
    
    app.use(cors());
    app.use(express.json());
    app.use(express.static(path.join(__dirname, '../')));
    
    console.log("Starting server on port " + port + "...");
    app.listen(port, () => {
        console.log("🚀 Server is running!");
    }).on('error', (err) => {
        console.error("❌ Port Error:", err.message);
        if (err.code === 'EADDRINUSE') {
            console.error("PLEASE NOTE: Port " + port + " is ALREADY occupied by another program.");
        }
    });

} catch (err) {
    console.error("❌ CRITICAL ERROR DURING STARTUP:");
    console.error(err);
}
