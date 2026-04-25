const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');

router.get('/fitness', authenticateToken, userController.getFitness);
router.put('/fitness', authenticateToken, userController.updateFitnessValidation, userController.updateFitness);
router.get('/weight-history', authenticateToken, userController.getWeightHistory);
router.post('/weight', authenticateToken, userController.addWeightRecord);
router.get('/workout-plans', authenticateToken, userController.getWorkoutPlans);

module.exports = router;
