const express = require("express");
const {
	loginWithGoogle,
	signupWithCredentials,
	loginWithCredentials,
	getCurrentUser,
} = require("../controllers/auth.controller");
const { requireAuth } = require("../middleware/auth.middleware");
const { authRouteLimiter, credentialsAttemptLimiter } = require("../middleware/rate-limit.middleware");

const router = express.Router();

router.use(authRouteLimiter);

router.post("/google", loginWithGoogle);
router.post("/signup", credentialsAttemptLimiter, signupWithCredentials);
router.post("/login", credentialsAttemptLimiter, loginWithCredentials);
router.get("/me", requireAuth, getCurrentUser);

module.exports = router;
