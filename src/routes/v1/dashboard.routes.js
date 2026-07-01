const express = require('express');
const router = express.Router();
const dashboardController = require('../../controllers/dashboard.controller');

router.get('/board-stats', dashboardController.getStats);
router.get('/board-charts', dashboardController.getCharts);

module.exports = router;
