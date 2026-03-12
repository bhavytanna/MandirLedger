const express = require('express');
const donationsController = require('../controllers/donationsController');
const { requireEditor } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', requireEditor, donationsController.createDonation);
router.get('/', donationsController.listDonations);
router.get('/:donationId', donationsController.getDonation);
router.put('/:donationId', requireEditor, donationsController.updateDonation);

module.exports = router;
