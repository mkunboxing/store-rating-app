const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

// Create SQL client with Neon connection string
const sql = neon(process.env.DATABASE_URL);

// Query function using sql.query for parameterized queries
const query = async (text, params = []) => {
    try {
        const result = await sql.query(text, params);
        return result;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
};

// Transaction helper functions
const begin = async () => {
    await query('BEGIN');
};

const commit = async () => {
    await query('COMMIT');
};

const rollback = async () => {
    await query('ROLLBACK');
};

module.exports = {
    query,
    begin,
    commit,
    rollback
}; 