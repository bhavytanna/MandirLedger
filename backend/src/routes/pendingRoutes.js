const express = require('express');
const pendingController = require('../controllers/pendingController');

const router = express.Router();

router.get('/', pendingController.getPendingList);
router.post('/member/mark-paid', pendingController.markMemberPaid);
router.get('/non-members', pendingController.getNonMemberPendingList);
router.post('/non-member/mark-paid', pendingController.markNonMemberPaid);
router.get('/settings', pendingController.getSettings);
router.put('/settings', pendingController.setSettings);

module.exports = router;
