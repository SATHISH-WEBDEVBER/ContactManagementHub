const { validationResult } = require('express-validator');
const Contact = require('../models/Contact');

// ─── GET ALL CONTACTS (for logged-in user) ─────────────────────────────────
const getContacts = async (req, res) => {
  try {
    const { search, category, isFavorite, sort = '-createdAt', page = 1, limit = 20 } = req.query;

    const filter = { user: req.user._id };

    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) filter.category = category;
    if (isFavorite === 'true') filter.isFavorite = true;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [contacts, total] = await Promise.all([
      Contact.find(filter).sort(sort).skip(skip).limit(parseInt(limit)),
      Contact.countDocuments(filter),
    ]);

    res.json({
      success: true,
      contacts,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('getContacts error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── GET SINGLE CONTACT ────────────────────────────────────────────────────
const getContact = async (req, res) => {
  try {
    const contact = await Contact.findOne({ _id: req.params.id, user: req.user._id });
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found.' });
    }
    res.json({ success: true, contact });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── CREATE CONTACT ────────────────────────────────────────────────────────
const createContact = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const contact = await Contact.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, message: 'Contact created!', contact });
  } catch (error) {
    console.error('createContact error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── UPDATE CONTACT ────────────────────────────────────────────────────────
const updateContact = async (req, res) => {
  try {
    const contact = await Contact.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found.' });
    }
    res.json({ success: true, message: 'Contact updated!', contact });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── DELETE CONTACT ────────────────────────────────────────────────────────
const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found.' });
    }
    res.json({ success: true, message: 'Contact deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── TOGGLE FAVORITE ──────────────────────────────────────────────────────
const toggleFavorite = async (req, res) => {
  try {
    const contact = await Contact.findOne({ _id: req.params.id, user: req.user._id });
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found.' });
    }
    contact.isFavorite = !contact.isFavorite;
    await contact.save();
    res.json({ success: true, isFavorite: contact.isFavorite });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── GET STATS ────────────────────────────────────────────────────────────
const getStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const [total, favorites, byCategory] = await Promise.all([
      Contact.countDocuments({ user: userId }),
      Contact.countDocuments({ user: userId, isFavorite: true }),
      Contact.aggregate([
        { $match: { user: userId } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ]),
    ]);
    res.json({ success: true, stats: { total, favorites, byCategory } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getContacts, getContact, createContact, updateContact, deleteContact, toggleFavorite, getStats };
