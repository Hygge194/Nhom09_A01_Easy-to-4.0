const express = require('express');
const router = express.Router();
const calendarController = require('../controllers/calendarController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/auth-url', verifyToken, calendarController.getAuthUrl);
router.get('/oauth-callback', calendarController.oauthCallback);

module.exports = router;
