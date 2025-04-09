const { body, validationResult } = require('express-validator');

const validateUser = [
    body('name')
        .isLength({ min: 3, max: 60 })
        .withMessage('Name must be between 3 and 30 characters'),
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email'),
    body('password')
        .isLength({ min: 8, max: 16 })
        .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*])/)
        .withMessage('Password must be 8-16 characters and include at least one uppercase letter and one special character'),
    body('address')
        .isLength({ max: 400 })
        .withMessage('Address must not exceed 400 characters'),
];

const validateRating = [
    body('rating')
        .isInt({ min: 1, max: 5 })
        .withMessage('Rating must be between 1 and 5'),
];

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

module.exports = {
    validateUser,
    validateRating,
    validate
}; 