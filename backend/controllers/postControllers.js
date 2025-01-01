const Post = require('../models/postModel');
const User = require('../models/userModel');
const path = require('path');
const fs = require('fs');
const { v4: uuid } = require('uuid');

// POST : api/posts

// Protected Route
const createPost = async (req, res) => {

    try {
        const { title, category, description } = req.body;

        if (!title || !category || !description || !req.files) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const validCategories = [
            "Agriculture",
            "Business",
            "Education",
            "Entertainment",
            "Art",
            "Investment",
            "Uncategorized",
            "Weather",
          ];
          if (!validCategories.includes(category)) {
            return res.status(400).json({ message: `${category} is not supported` });
          }

        const { thumbnail } = req.files;
        // check the file size
        if (thumbnail.size > 2000000) {
            return res.status(400).json({ message: "File size is too large" });
        }

        let fileName = thumbnail.name;
        let splittedFileName = fileName.split('.');
        let newFileName = splittedFileName[0] + uuid() + '.' + splittedFileName[splittedFileName.length - 1];
        thumbnail.mv(path.join(__dirname, '..', '/uploads', newFileName), async (err) => {
            if (err) {
                return res.status(500).json({ message: "File upload failed" });
            }else {
                const newPost = await Post.create({ ...req.body, thumbnail: newFileName, creator: req.user.userId });
                if (!newPost) {
                    return res.status(400).json({ message: "Post creation failed" });
                }
                const currentUser = await User.findById(req.user.userId);
                if(!currentUser) {
                    return res.status(400).json({ message: "User not found" });
                }
                const userPostCount =  1;
                await User.findByIdAndUpdate(req.user.userId, { $inc: { posts: userPostCount } });
                return res.status(201).json(newPost);
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// exports.getPosts = async (req, res) => {
//     const posts = await Post.find();
//     res.json(posts);
// };

module.exports = { createPost };