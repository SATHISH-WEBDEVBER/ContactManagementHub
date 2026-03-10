const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const {
  getContacts, getContact, createContact, updateContact,
  deleteContact, toggleFavorite, getStats
} = require('../controllers/contactController');
const { protect } = require('../middleware/auth');

// All contact routes require authentication
router.use(protect);

const contactValidation = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('Valid email required'),
];

router.get('/stats', getStats);
router.get('/', getContacts);
router.get('/:id', getContact);
router.post('/', contactValidation, createContact);
router.put('/:id', updateContact);
router.delete('/:id', deleteContact);
router.patch('/:id/favorite', toggleFavorite);

module.exports = router;
