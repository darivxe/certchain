const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    role: {
        type: String,
        enum: ['student', 'university'],
        required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    // You can add more fields as needed
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);