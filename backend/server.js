const express = require('express');
const cors = require('cors');
const { neon } = require('@neondatabase/serverless');
const { query } = require('./config/db');
require('dotenv').config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('running');
});

app.get('/test', async (req, res) => {
    const result = await query('SELECT * FROM stores');
    res.json(result.rows);
});

// Test route for database connection
app.get('/api/test', async (req, res) => {
    try {
        // Test the database connection by fetching users
        const users = await query('SELECT id, name, email, role FROM users');
        res.json({
            message: 'Database connection successful',
            users,
            totalUsers: users.length
        });
    } catch (error) {
        console.error('Database connection test failed:', error);
        res.status(500).json({
            message: 'Database connection failed',
            error: error.message
        });
    }
});

// Routes (will be added later)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/stores', require('./routes/stores'));
app.use('/api/ratings', require('./routes/ratings'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 