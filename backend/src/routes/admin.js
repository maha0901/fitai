const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.use(authenticateToken);
router.use(requireRole('admin'));

router.get('/stats', adminController.getStats);
router.get('/overview', adminController.getOverview);
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserById);
router.patch('/users/:id/role', adminController.updateUserRole);
router.delete('/users/:id', adminController.deleteUser);
router.get('/logs', adminController.getLogs);
router.get('/activity', adminController.getActivity);

module.exports = router;
