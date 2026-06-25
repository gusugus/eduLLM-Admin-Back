const dashboardService = require('../services/dashboard.service');
const catchAsync = require('../utils/catchAsync');

exports.getStats = catchAsync(async (req, res) => {
  const stats = await dashboardService.getStats();
  res.json({ success: true, data: stats });
});
