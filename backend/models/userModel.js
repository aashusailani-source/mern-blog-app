const { Schema, model } = require('mongoose');

const userSchema = new Schema({
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    avatar: { type: String},
    posts: [{type: Schema.Types.ObjectId, ref: 'Post', required: true}],
});

const User = model('User', userSchema);

module.exports = User;