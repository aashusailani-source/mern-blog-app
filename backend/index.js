const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { connect } = require('mongoose');
const upload = require('express-fileupload');
require('dotenv').config();

const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');

const app = express();
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(upload());
app.use('/uploads', express.static('uploads'));
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);


connect(process.env.MONGO_URI).then(app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
  })).catch(err => console.log(err));