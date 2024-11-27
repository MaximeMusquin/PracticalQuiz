/*----------------------------------------------\
Step 1 : run command :                          |
    1) npm init -y                              |
    2) npm i express                            |
    3) npm i mysql                              |
    4) npm i --save-dev nodemon                 |
                                                |
Step #2 : modify the JSON file "package.json" : | 
    Adding => "start":"nodemon task.js"         |
                                                |
Step #3 : start your code inside this js file : |
    run and test the code using "npm start"     |
-----------------------------------------------*/

const express = require('express');
const mysql = require('mysql2');
const app = express();

// Use Express's built-in body parsing middleware
app.use(express.json());

// Create a MySQL connection pool
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    port: "3306",
    password: '00000000',
    database: 'my_database',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test the database connection
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to MySQL with a connection pool');
    connection.release();
});

// Route: Add a new record
app.post('/add', (req, res) => {
    const { name, email } = req.body;
    if (!name || !email) {
        return res.status(400).json({ error: 'Name and email are required' });
    }
    const query = 'INSERT INTO users (name, email) VALUES (?, ?)';
    pool.query(query, [name, email], (err, result) => {
        if (err) {
            console.error('Error inserting record:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json({ message: 'Record added', id: result.insertId });
    });
});

// Route: Get all records
app.get('/records', (req, res) => {
    const query = 'SELECT * FROM users';
    pool.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching records:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(200).json(results);
    });
});

// Route: Get a specific record by ID
app.get('/record/:id', (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM users WHERE id = ?';
    pool.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error fetching record:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Record not found' });
        }
        res.status(200).json(results[0]);
    });
});

// Route: Update a record by ID
app.put('/update/:id', (req, res) => {
    const { id } = req.params;
    const { name, email } = req.body;
    if (!name || !email) {
        return res.status(400).json({ error: 'Name and email are required' });
    }
    const query = 'UPDATE users SET name = ?, email = ? WHERE id = ?';
    pool.query(query, [name, email, id], (err, result) => {
        if (err) {
            console.error('Error updating record:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Record not found' });
        }
        res.status(200).json({ message: 'Record updated' });
    });
});

// Route: Delete a record by ID
app.delete('/delete/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM users WHERE id = ?';
    pool.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error deleting record:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Record not found' });
        }
        res.status(200).json({ message: 'Record deleted' });
    });
});

// Start the server
app.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});
