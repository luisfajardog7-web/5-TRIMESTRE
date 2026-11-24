// src/routes/index.js
const { Router } = require('express');
const authRoutes = require('./auth.routes');
const catalogRoutes = require('./catalog.routes');

const router = Router();

router.get('/health', (req, res) => {
  res.json({ success: true, message: 'Router /api/v1 operativo' });
});

router.use('/auth', authRoutes);
router.use('/catalogs', catalogRoutes);   // ← NUEVO

module.exports = router;