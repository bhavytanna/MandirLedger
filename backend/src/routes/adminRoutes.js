const express = require('express');
const adminController = require('../controllers/adminController');
const { requireEditor } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/wipe', requireEditor, adminController.wipeAllData);

module.exports = router;
