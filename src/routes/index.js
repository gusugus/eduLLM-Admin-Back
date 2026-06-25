const express = require('express');
const router = express.Router();
const professorRoutes = require('./v1/professor.routes');
const studentRoutes = require('./v1/student.routes');
const subjectRoutes = require('./v1/subject.routes');
const userRoutes = require('./v1/user.routes');
const assignmentRoutes = require('./v1/assignment.routes');
const uploadRoutes = require('./v1/upload.routes');
const authRoutes = require('./v1/auth.routes');
const gradoRoutes = require('./v1/grado.routes');
const dashboardRoutes = require('./v1/dashboard.routes');

router.use('/professors', professorRoutes);
router.use('/students', studentRoutes);
router.use('/subjects', subjectRoutes);
router.use('/users', userRoutes);
router.use('/assignments', assignmentRoutes);
router.use('/upload', uploadRoutes);
router.use('/auth', authRoutes);
router.use('/grados', gradoRoutes);
router.use('/', dashboardRoutes);

module.exports = router;