const { Router } = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { createPost } = require('../controllers/postControllers');

const router = Router();

router.post('/', authMiddleware, createPost);
// router.get('/:id', getPost);
// router.get('/categories/:category', getCatPosts);
// router.get('/users/:id', getUserPosts);
// router.patch('/:id', authMiddleware, editPost);
// router.delete('/:id', authMiddleware, deletePost);

module.exports = router;
