const express = require('express');
const router = express.Router();
const professorRoutes = require('./v1/professor.routes');
const studentRoutes = require('./v1/student.routes');
const subjectRoutes = require('./v1/subject.routes');
const userRoutes = require('./v1/user.routes');

router.use('/professors', professorRoutes);
router.use('/students', studentRoutes);
router.use('/subjects', subjectRoutes);
router.use('/users', userRoutes);

module.exports = router;