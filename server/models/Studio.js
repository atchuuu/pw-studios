const mongoose = require('mongoose');

const studioSchema = mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String, required: true }, // Keeping for backward compatibility or general location name
    city: { type: String },
    area: { type: String },
    address: { type: String, required: true },
    coordinates: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number] } // [lng, lat]
    },
    lat: { type: Number }, // Keeping for backward compatibility
    lng: { type: Number }, // Keeping for backward compatibility
    capacity: { type: Number }, // Deprecated, but keeping optional for now
    numStudios: { type: Number, default: 1 },
    description: { type: String }, // Dynamic studio description
    studioCode: { type: String }, // e.g., "NOI"
    studioNumbers: [{ type: String }], // e.g., ["NOI-001", "NOI-002"]
    pocName: { type: String },
    pocEmail: { type: String },
    pocContact: { type: String },
    facultyCoordinator: { type: String },
    driveLinkInside: { type: String },
    driveLinkOutside: { type: String },
    googleMapLink: { type: String },
    driveLink: { type: String },
    facilities: [{ type: String }],
    interiorPhotos: [{ type: String }],
    exteriorPhotos: [{ type: String }],
    coverPhoto: { type: String },
    images: [{ type: String }], // Keeping for backward compatibility temporarily
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

studioSchema.index({ coordinates: '2dsphere' });

const Studio = mongoose.model('Studio', studioSchema);

module.exports = Studio;
