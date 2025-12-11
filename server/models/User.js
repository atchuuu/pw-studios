const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    googleId: { type: String },
    role: {
        type: String,
        enum: ['faculty', 'studio_admin', 'super_admin', 'faculty_coordinator'],
        default: 'faculty'
    },
    location: { type: String }, // e.g., "Noida", "Delhi"
    profilePicture: { type: String },
    assignedStudios: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Studio' }]
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
