// src/routes/index.js
const { Router } = require('express');
const authRoutes = require('./auth.routes');
const catalogRoutes = require('./catalog.routes');
const roleRoutes = require('./role.routes');
const userRoutes = require('./user.routes');
const profileRoutes = require('./profile.routes');

const router = Router();

router.get('/health', (req, res) => {
  res.json({ success: true, message: 'Router /api/v1 operativo' });
});

router.use('/auth', authRoutes);
router.use('/catalogs', catalogRoutes);
router.use('/roles', roleRoutes);
router.use('/users', userRoutes);
router.use('/profiles', profileRoutes);

module.exports = router;