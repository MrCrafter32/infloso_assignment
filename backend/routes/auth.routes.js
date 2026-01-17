const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const rateLimitMiddleware = require('../middlewares/ratelimit.middleware');

router.post('/signup', rateLimitMiddleware, authController.signup);
router.post('/login',rateLimitMiddleware, authController.login);
router.post('/forgot-password',rateLimitMiddleware, authController.forgotPassword);
router.post('/verify-email',rateLimitMiddleware, authController.verifyEmail);
router.post('/reset-password',rateLimitMiddleware, authController.resetPassword);
router.post('/resend-verification-email',rateLimitMiddleware, authController.resendVerificationEmail);



router.get('/logout', authMiddleware, authController.logout);
router.get('/me', authMiddleware, authController.userDetails);



module.exports = router;