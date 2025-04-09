const db = require('../config/db');

const submitOrUpdateRating = async (req, res) => {
    try {
        const { storeId } = req.params;
        const { rating } = req.body;

        // Check if store exists
        const storeExists = await db.query('SELECT * FROM stores WHERE id = $1', [storeId]);
        if (storeExists.length === 0) {
            return res.status(404).json({ error: 'Store not found' });
        }

        // Check if user has already rated this store
        const existingRating = await db.query(
            'SELECT * FROM ratings WHERE user_id = $1 AND store_id = $2',
            [req.user.id, storeId]
        );

        let result;
        if (existingRating.length > 0) {
            // Update existing rating
            result = await db.query(
                'UPDATE ratings SET rating = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 AND store_id = $3 RETURNING *',
                [rating, req.user.id, storeId]
            );
        } else {
            // Create new rating
            result = await db.query(
                'INSERT INTO ratings (user_id, store_id, rating) VALUES ($1, $2, $3) RETURNING *',
                [req.user.id, storeId, rating]
            );
        }

        // Get updated average rating
        const avgRating = await db.query(
            'SELECT AVG(rating)::numeric(10,2) as average_rating FROM ratings WHERE store_id = $1',
            [storeId]
        );

        res.json({
            rating: result[0],
            average_rating: avgRating[0].average_rating
        });
    } catch (error) {
        console.error('Submit/update rating error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

const getStoreRatings = async (req, res) => {
    try {
        const { storeId } = req.params;

        const result = await db.query(`
            SELECT 
                r.*,
                u.name as user_name,
                u.email as user_email
            FROM ratings r
            JOIN users u ON u.id = r.user_id
            WHERE r.store_id = $1
            ORDER BY r.created_at DESC
        `, [storeId]);

        res.json(result);
    } catch (error) {
        console.error('Get store ratings error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    submitOrUpdateRating,
    getStoreRatings
}; 