const Post = require('../models/postModel');
const User = require('../models/userModel');
const path = require('path');
const fs = require('fs');
const { v4: uuid } = require('uuid');

// POST : api/posts

// Protected Route
exports.createPost = async (req, res) => {

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

                // const currentUser = await User.findById(req.user.userId);
                // if(!currentUser) {
                //     return res.status(400).json({ message: "User not found" });
                // }
                // const userPostCount =  1;
                // await User.findByIdAndUpdate(req.user.userId, { $inc: { posts: userPostCount } });

                const updatedUser = await User.findByIdAndUpdate(
                    req.user.userId,
                    { $push: { posts: newPost._id } }, // Add the post ID to the user's posts array
                    { new: true } // Return the updated user document
                );

                if (!updatedUser) {
                    return res.status(400).json({ message: "User not found or update failed" });
                }

                return res.status(201).json(newPost);
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// GET : api/posts/get-allposts
// Unprotected Route
exports.getPosts = async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 })
        .populate('creator', 'name email');

        return res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// GET : api/posts/:id
// Unprotected Route
exports.getPost = async (req, res) => {
    try {

        const { id } = req.params;
        const post = await Post.findById(id);

        if(!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        return res.status(200).json(post);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


// GET : api/posts/categories/:category
exports.getCatPosts = async (req, res) => {

    try {
        const { category } = req.params;
        const posts = await Post.find({ category }).sort({ createdAt: -1 });
        // console.log(posts);
        if(!posts || posts.length === 0) {
            return res.status(404).json({ message: "No posts found for this category" });
        }
        return res.status(200).json(posts);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


// GET : api/posts/users/:id
// Protected Route
exports.getUserPosts = async (req, res) => {
    try {
        const { id } = req.params;
        const posts = await Post.find({ creator: id }).sort({ createdAt: -1 });
        console.log(posts);
        if(!posts || posts.length === 0) {
            return res.status(404).json({ message: "No posts found for this user" });
        }
        return res.status(200).json(posts);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


// PATCH : api/posts/:id


// DELETE : api/posts/:id
// Protected Route
exports.deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        if(!id) {
            return res.status(400).json({ message: "Post ID is required" });
        }

        const post = await Post.findById(id);
        const fileName = post?.thumbnail;
        if(fileName) {
            fs.unlinkSync(path.join(__dirname, '..', '/uploads', fileName), async (err) => {
                if(err) {
                    return res.status(500).json({ message: "File deletion failed" });
                } else {
                    await Post.findByIdAndDelete(id);
                    const currentUser = await User.findByIdAndUpdate(req.user.userId, { $pull: { posts: id } });

                    console.log("File deleted successfully");
                }
            });
        }
        return res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
