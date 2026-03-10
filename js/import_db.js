const fs = require('fs');
const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    multipleStatements: true
});

connection.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL. Importing database...');
    
    const sql = fs.readFileSync('exam_db.sql', 'utf8');
    connection.query(sql, (err, results) => {
        if (err) {
            console.error('SQL Error:', err.sqlMessage);
            process.exit(1);
        }
        console.log('Successfully imported exam_db.sql!');
        connection.end();
    });
});
