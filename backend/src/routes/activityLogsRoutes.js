const express = require('express');
const activityLogsController = require('../controllers/activityLogsController');

const router = express.Router();

router.get('/', activityLogsController.listActivityLogs);

module.exports = router;
