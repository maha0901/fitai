const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { authenticateToken } = require('../middleware/auth');

router.post('/ai-plan', authenticateToken, aiController.aiPlanValidation, aiController.getAiPlan);
router.post('/chat', authenticateToken, aiController.chatValidation, aiController.chat);
router.get('/chat-history', authenticateToken, aiController.getChatHistory);

module.exports = router;
