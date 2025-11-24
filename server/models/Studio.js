const mongoose = require('mongoose');

const studioSchema = mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String, required: true },
    address: { type: String, required: true },
    capacity: { type: Number, required: true },
    facilities: [{ type: String }], // e.g., ["Smart Board", "4K Camera"]
    images: [{ type: String }],
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Studio Admin
}, { timestamps: true });

const Studio = mongoose.model('Studio', studioSchema);

module.exports = Studio;
