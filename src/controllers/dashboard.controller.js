const dashboardService = require('../services/dashboard.service');
const catchAsync = require('../utils/catchAsync');

exports.getStats = catchAsync(async (req, res) => {
  const stats = await dashboardService.getStats();
  res.json({ success: true, data: stats });
});

exports.getCharts = catchAsync(async (req, res) => {
  const { periodo, estudianteId } = req.query;
  const charts = await dashboardService.getCharts({
    periodo,
    estudianteId: estudianteId ? Number(estudianteId) : undefined,
  });
  res.json({ success: true, data: charts });
});
