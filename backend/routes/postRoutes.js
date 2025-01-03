const { Router } = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { createPost, getAllPosts, getPost, getCatPosts, getUserPosts, deletePost, editPost } = require('../controllers/postControllers');

const router = Router();

router.post('/', authMiddleware, createPost);
router.get('/get-allposts', getAllPosts);
router.get('/:id', getPost);
router.get('/categories/:category', getCatPosts);
router.get('/users/:id', getUserPosts);
router.patch('/:id', authMiddleware, editPost);
router.delete('/:id', authMiddleware, deletePost);

module.exports = router;