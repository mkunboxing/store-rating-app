const db = require('../config/db');

const getAllStores = async (req, res) => {
    try {
        const { name, address } = req.query;
        let query = `
            SELECT 
                s.*,
                AVG(r.rating)::numeric(10,2) as overall_rating,
                (
                    SELECT rating 
                    FROM ratings 
                    WHERE user_id = $1 AND store_id = s.id
                ) as user_rating
            FROM stores s
            LEFT JOIN ratings r ON r.store_id = s.id
            WHERE 1=1
        `;
        const params = [req.user.id];

        if (name) {
            params.push(`%${name}%`);
            query += ` AND s.name ILIKE $${params.length}`;
        }
        if (address) {
            params.push(`%${address}%`);
            query += ` AND s.address ILIKE $${params.length}`;
        }

        query += ' GROUP BY s.id ORDER BY s.name';

        const stores = await db.query(query, params);
        res.status(200).json({
            status: 'success',
            data: stores
        });
    } catch (error) {
        console.error('Get all stores error:', error);
        res.status(500).json({
            status: 'error',
            error: 'Server error'
        });
    }
};

const addStore = async (req, res) => {
    try {
        const { name, email, address, owner_id } = req.body;

        // Insert store
        const store = await db.query(
            'INSERT INTO stores (name, email, address, owner_id) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, email, address, owner_id]
        );

        // Update user role to store_owner if not already
        await db.query(
            'UPDATE users SET role = $1 WHERE id = $2 AND role != $1',
            ['store_owner', owner_id]
        );

        res.status(201).json(store[0]);
    } catch (error) {
        if (error.code === '23505') {
            return res.status(400).json({ error: 'Store email already exists' });
        }
        console.error('Add store error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get all stores for the logged-in store owner
const getOwnerStores = async (req, res) => {
    try {
        const stores = await db.query(`
            SELECT 
                s.*,
                AVG(r.rating)::numeric(10,2) as average_rating,
                COUNT(DISTINCT r.user_id) as total_ratings
            FROM stores s
            LEFT JOIN ratings r ON r.store_id = s.id
            WHERE s.owner_id = $1
            GROUP BY s.id
            ORDER BY s.name
        `, [req.user.id]);

        res.json(stores);
    } catch (error) {
        console.error('Get owner stores error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get specific store details for the store owner
const getStoreDetails = async (req, res) => {
    try {
        const { storeId } = req.params;

        // Get store details with ratings
        const stores = await db.query(`
            SELECT 
                s.*,
                AVG(r.rating)::numeric(10,2) as average_rating,
                COUNT(DISTINCT r.user_id) as total_ratings
            FROM stores s
            LEFT JOIN ratings r ON r.store_id = s.id
            WHERE s.id = $1 AND s.owner_id = $2
            GROUP BY s.id
        `, [storeId, req.user.id]);

        if (stores.length === 0) {
            return res.status(404).json({ error: 'Store not found or unauthorized' });
        }

        // Get users who rated the store
        const raters = await db.query(`
            SELECT 
                u.name,
                u.email,
                r.rating,
                r.created_at
            FROM ratings r
            JOIN users u ON u.id = r.user_id
            WHERE r.store_id = $1
            ORDER BY r.created_at DESC
        `, [storeId]);

        res.json({
            ...stores[0],
            raters
        });
    } catch (error) {
        console.error('Get store details error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    getAllStores,
    addStore,
    getOwnerStores,
    getStoreDetails
}; 