const { Router } = require('express');
const router = Router();
const { registerUser, loginUser, getUserProfile, changeUserAvatar, editUserProfile, getAllUsers, getAuthors } = require('../controllers/userControllers');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/user/:id', getUserProfile);
router.get('/authors', getAuthors);
router.post('/changeavatar',authMiddleware, changeUserAvatar);
router.post('/editprofile',authMiddleware, editUserProfile);

module.exports = router;
