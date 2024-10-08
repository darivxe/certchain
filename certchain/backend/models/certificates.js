const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    university: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    issueDate: {
        type: Date,
        required: true,
    },
    hash: {
        type: String,
        required: true,
        unique: true,
    },
    // Additional fields can be added as needed
}, { timestamps: true });

module.exports = mongoose.model('Certificate', certificateSchema);
