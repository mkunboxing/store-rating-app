const db = require('../config/db');
const bcrypt = require('bcryptjs');

const getAllUsers = async (req, res) => {
    try {
        const { name, email, address, role } = req.query;
        let query = `
            SELECT 
                u.id, 
                u.name, 
                u.email, 
                u.address, 
                u.role,
                CASE 
                    WHEN u.role = 'store_owner' THEN 
                        (SELECT AVG(r.rating)::numeric(10,2) 
                         FROM stores s 
                         LEFT JOIN ratings r ON r.store_id = s.id 
                         WHERE s.owner_id = u.id)
                    ELSE NULL 
                END as average_rating
            FROM users u 
            WHERE 1=1`;
        const params = [];

        if (name) {
            params.push(`%${name}%`);
            query += ` AND u.name ILIKE $${params.length}`;
        }
        if (email) {
            params.push(`%${email}%`);
            query += ` AND u.email ILIKE $${params.length}`;
        }
        if (address) {
            params.push(`%${address}%`);
            query += ` AND u.address ILIKE $${params.length}`;
        }
        if (role) {
            params.push(role);
            query += ` AND u.role = $${params.length}`;
        }

        const result = await db.query(query, params);
        res.json(result);
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

const getUserDetails = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT u.*, 
                CASE 
                    WHEN u.role = 'store_owner' THEN 
                        (SELECT AVG(r.rating)::numeric(10,2) 
                         FROM stores s 
                         LEFT JOIN ratings r ON r.store_id = s.id 
                         WHERE s.owner_id = u.id)
                    ELSE NULL 
                END as average_rating
            FROM users u 
            WHERE u.id = $1
        `, [req.params.id]);

        if (result.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(result[0]);
    } catch (error) {
        console.error('Get user details error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

const addUser = async (req, res) => {
    try {
        const { name, email, password, address, role } = req.body;

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const result = await db.query(
            'INSERT INTO users (name, email, password, address, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role',
            [name, email, hashedPassword, address, role]
        );

        res.status(201).json(result[0]);
    } catch (error) {
        if (error.code === '23505') { // unique_violation
            return res.status(400).json({ error: 'Email already exists' });
        }
        console.error('Add user error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

const getDashboardStats = async (req, res) => {
    try {
        const stats = await db.query(`
            SELECT 
                (SELECT COUNT(*) FROM users) as total_users,
                (SELECT COUNT(*) FROM stores) as total_stores,
                (SELECT COUNT(*) FROM ratings) as total_ratings
        `);

        res.json(stats);
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

const getStoreOwners = async (req, res) => {
    try {
        const { name, email, address } = req.query;
        let query = `
            SELECT 
                u.id,
                u.name,
                u.email,
                u.address,
                u.role,
                (SELECT AVG(r.rating)::numeric(10,2) 
                 FROM stores s 
                 LEFT JOIN ratings r ON r.store_id = s.id 
                 WHERE s.owner_id = u.id) as average_rating,
                (SELECT COUNT(*) 
                 FROM stores s 
                 WHERE s.owner_id = u.id) as total_stores
            FROM users u
            WHERE u.role = 'store_owner'`;
        const params = [];

        if (name) {
            params.push(`%${name}%`);
            query += ` AND u.name ILIKE $${params.length}`;
        }
        if (email) {
            params.push(`%${email}%`);
            query += ` AND u.email ILIKE $${params.length}`;
        }
        if (address) {
            params.push(`%${address}%`);
            query += ` AND u.address ILIKE $${params.length}`;
        }

        query += ` ORDER BY u.name`;

        const result = await db.query(query, params);
        res.json(result);
    } catch (error) {
        console.error('Get store owners error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    getAllUsers,
    getUserDetails,
    addUser,
    getDashboardStats,
    getStoreOwners
}; 