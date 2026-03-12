const express = require('express');
const receiptsController = require('../controllers/receiptsController');
const { requireEditor } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/from-donation/:donationId', requireEditor, receiptsController.createReceiptFromDonation);
router.get('/:receiptId/pdf', receiptsController.streamReceiptPdf);

module.exports = router;
