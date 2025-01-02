const bcrypt = require('bcrypt');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

// Register a new user 
// Post request to /api/users/register
// unprotected route
const registerUser = async (req, res) => {

    try{
        const {name, email, password, confirmPassword} = req.body;
        if(!name || !email || !password || !confirmPassword) {
            return res.status(400).json({error: {
                message: "Invalid request body",
                details: "Name, email, password, and confirmPassword are required",
            }});
        }

        const newEmail = email.toLowerCase();
        const emailExists = await User.findOne({email: newEmail});
        if(emailExists) {
            return res.status(400).json({error: {
                message: "Email already exists",
                details: "The email you provided is already in use",
            }});
        }

        if(password !== confirmPassword) {
            return res.status(400).json({error: {
                message: "Password and confirmPassword do not match",
                details: "The password and confirmPassword you provided do not match",
            }});
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            username: name,
            email: newEmail,
            password: hashedPassword,
        });
        await newUser.save();
        return res.status(201).json({message: "User registered successfully"});

    }catch(err){
        return res.status(500).json({error: {
            message: "Registering user failed",
            details: err.message,
        }});
    }
};

// Login a user
// Post request to /api/users/login
// unprotected route
const loginUser = async (req, res) => {

    try{
        const {email, password} = req.body;
        const newEmail = email.toLowerCase();
        const user = await User.findOne({email: newEmail}).populate('posts');
        if(!user) {
            return res.status(400).json({error: {
                message: "User not found",
                details: "The email you provided does not exist",
            }});
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if(!isPasswordCorrect) {
            return res.status(400).json({error: {
                message: "Password is incorrect",
                details: "The password you provided is incorrect",
            }});
        }

        const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET, {expiresIn: '1h'});

        res.cookie('token', token, { httpOnly: true, sameSite: 'Strict', maxAge: 3600000 });

        res.setHeader('Authorization', `Bearer ${token}`);

        return res.status(200).json({
            message: "User logged in successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
            },
            posts: user.posts,
            token,
        });
    }catch(err){
        return res.status(500).json({error: {
            message: "Logging in user failed",
            details: err.message,
        }});
    }
};  

// Post request user profile
// Post request to /api/users/:id
// protected route
const getUserProfile = async (req, res) => {

    const id = req.params.id;
    const user = await User.findById(id).select('-password');

    if(!user) {
        return res.status(404).json({error: {
            message: "User not found",
            details: "The user you are trying to fetch does not exist",
        }});
    }

    return res.status(200).json({user});
};

// post request to change user avatar
// post request to /api/users/changeavatar
// protected route
const changeUserAvatar = async (req, res) => {

    try{
        if(!req.files.avatar) {
            return res.status(400).json({error: {
                message: "Avatar is required",
                details: "The avatar you are trying to upload is required",
            }});
        }

    }catch(err){
        return res.status(500).json({error: {
            message: "Changing user avatar failed",
            details: err.message,
        }});
    }
};

// post request to edit user profile
// post request to /api/users/editprofile
// protected route
const editUserProfile = async (req, res) => {
    try{
        const {name, email, currentPassword, newPassword, confirmNewPassword} = req.body;
        
        if(!name || !email || !currentPassword || !newPassword || !confirmNewPassword) {
            return res.status(400).json({error: {
                message: "Invalid request body",
                details: "Name, email, currentPassword, newPassword, and confirmNewPassword are required",
            }});
        }

        const user = await User.findById(req.user.userId);
        if(!user) {
            return res.status(404).json({error: {
                message: "User not found",
                details: "The user you are trying to edit does not exist",
            }});
        }

        const newEmail = email.toLowerCase();
        const emailExists = await User.findOne({email: newEmail});
        if(emailExists) {
            return res.status(400).json({error: {
                message: "Email already exists",
                details: "The email you provided is already in use",
            }});
        }

        const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
        if(!isPasswordCorrect) {
            return res.status(400).json({error: {
                message: "Current password is incorrect",
                details: "The current password you provided is incorrect",
            }});
        }

        if(newPassword !== confirmNewPassword) {
            return res.status(400).json({error: {
                message: "New password and confirm new password do not match",
                details: "The new password and confirm new password you provided do not match",
            }});
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        const newInfo = await User.findByIdAndUpdate(req.user.userId, {username: name, email: newEmail, password: hashedNewPassword}, {new: true});

        return res.status(200).json({message: "User profile edited successfully", user: newInfo});

    }catch(err){
        return res.status(500).json({error: {message: "Editing user profile failed"}});
    }
};

// post request to get all users
// post request to /api/users/authors
// protected route
const getAuthors = async (req, res) => {
    try{
        const authors = await User.find().select('-password');
        return res.status(200).json({authors});
    }catch(err){
        return res.status(500).json({error: {
            message: "Fetching authors failed",
            details: err.message,
        }});
    }
};


module.exports = { registerUser, loginUser, getUserProfile, changeUserAvatar, editUserProfile, getAuthors };