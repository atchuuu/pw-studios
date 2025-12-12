const asyncHandler = require('express-async-handler');
const { Studio, Booking } = require('../models');

// @desc    Get all studios
// @route   GET /api/studios
// @access  Private
const getStudios = asyncHandler(async (req, res) => {
    const { keyword, city, minCapacity, facilities, sort, lat, lng, minDistance, maxDistance, numStudios, date, time } = req.query;

    let query = {};

    if (keyword) {
        query.name = { $regex: keyword, $options: 'i' };
    }

    if (city) {
        query.city = { $regex: city, $options: 'i' };
    }

    if (minCapacity) {
        query.capacity = { $gte: Number(minCapacity) };
    }

    if (numStudios) {
        query.numStudios = { $gte: Number(numStudios) };
    }

    if (facilities) {
        const facilitiesArray = facilities.split(',');
        query.facilities = { $all: facilitiesArray };
    }

    if (lat && lng) {
        query.coordinates = {
            $near: {
                $geometry: {
                    type: "Point",
                    coordinates: [parseFloat(lng), parseFloat(lat)]
                },
                $minDistance: minDistance ? Number(minDistance) * 1000 : 0,
                $maxDistance: maxDistance ? Number(maxDistance) * 1000 : 5000000 // Default 5000km
            }
        };
    }

    let sortOption = {};
    if (sort === 'name') {
        sortOption.name = 1;
    } else if (sort === 'capacity') {
        sortOption.capacity = -1; // Descending
    } else if (sort === 'capacity_asc') {
        sortOption.capacity = 1; // Ascending
    } else if (sort === 'city') {
        sortOption.city = 1; // Ascending
    }

    let studios;
    if (lat && lng) {
        studios = await Studio.find(query);
    } else {
        studios = await Studio.find(query).sort(sortOption);
    }

    // Availability Filter
    if (date && time) {
        const queryDate = new Date(`${date}T${time}`);
        const queryEndTime = new Date(queryDate.getTime() + 60 * 60 * 1000); // Assume 1 hour slot

        // Find conflicting bookings
        const conflictingBookings = await Booking.find({
            status: 'confirmed',
            $or: [
                { startTime: { $lt: queryEndTime }, endTime: { $gt: queryDate } }
            ]
        });

        // Count booked units per studio
        const bookedCounts = {};
        conflictingBookings.forEach(booking => {
            const studioId = booking.studio.toString();
            bookedCounts[studioId] = (bookedCounts[studioId] || 0) + 1;
        });

        // Filter studios
        studios = studios.filter(studio => {
            const bookedUnits = bookedCounts[studio._id.toString()] || 0;
            return studio.numStudios > bookedUnits;
        });
    }

    res.json(studios);
});

// @desc    Get studio by ID
// @route   GET /api/studios/:id
// @access  Private
const getStudioById = asyncHandler(async (req, res) => {
    const studio = await Studio.findById(req.params.id);
    if (studio) {
        res.json(studio);
    } else {
        res.status(404);
        throw new Error('Studio not found');
    }
});

// Helper to generate unique studio code
const generateUniqueStudioCode = async (city) => {
    const baseCode = city ? city.substring(0, 3).toUpperCase() : 'XXX';
    // Find all studios with this base code
    const studios = await Studio.find({ studioCode: { $regex: `^${baseCode}` } });

    let maxNum = 0;
    studios.forEach(s => {
        const numPart = parseInt(s.studioCode.replace(baseCode, ''));
        if (!isNaN(numPart) && numPart > maxNum) {
            maxNum = numPart;
        }
    });

    const nextNum = (maxNum + 1).toString().padStart(2, '0');
    return `${baseCode}${nextNum}`;
};

// @desc    Create a studio
// @route   POST /api/studios
// @access  Private/Admin
// @desc    Create a studio
// @route   POST /api/studios
// @access  Private/Admin
const createStudio = asyncHandler(async (req, res) => {
    const { name, description, address, city, area, lat, lng, numStudios, interiorPhotos, exteriorPhotos, pocEmail, googleMapLink, facilities } = req.body;

    const studioCode = await generateUniqueStudioCode(city);

    // Generate studio numbers based on code
    const studioNumbers = [];
    for (let i = 1; i <= (numStudios || 1); i++) {
        studioNumbers.push(`${studioCode}-${i.toString().padStart(3, '0')}`);
    }

    const studio = new Studio({
        name,
        description,
        address,
        city,
        area,
        lat: lat || 28.6139,
        lng: lng || 77.2090,
        coordinates: {
            type: 'Point',
            coordinates: [lng || 77.2090, lat || 28.6139]
        },
        numStudios: numStudios || 1,
        studioCode,
        studioNumbers,
        interiorPhotos: interiorPhotos || [],
        exteriorPhotos: exteriorPhotos || [],
        coverPhoto: req.body.coverPhoto || '/assets/profile-banner.png',
        pocEmail: pocEmail || '',
        googleMapLink: googleMapLink || '',
        facilities: facilities || [],
        user: req.user._id,
    });

    const createdStudio = await studio.save();
    res.status(201).json(createdStudio);
});
const getRecommendations = asyncHandler(async (req, res) => {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
        res.status(400);
        throw new Error('Latitude and Longitude are required');
    }

    try {
        const studios = await Studio.aggregate([
            {
                $geoNear: {
                    near: {
                        type: "Point",
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    distanceField: "distance",
                    maxDistance: 5000000, // 5000km
                    spherical: true,
                    key: "coordinates" // Explicitly specify the index key
                }
            },
            { $limit: 12 }
        ]);

        res.json(studios);
    } catch (error) {
        console.error("Recommendation Error:", error);
        res.status(500).json({ message: "Failed to fetch recommendations", error: error.message });
    }
});

// @desc    Update studio
// @route   PUT /api/studios/:id
// @access  Private/Admin
// @desc    Update studio
// @route   PUT /api/studios/:id
// @access  Private/Admin
const updateStudio = asyncHandler(async (req, res) => {
    const studio = await Studio.findById(req.params.id);

    if (!studio) {
        res.status(404);
        throw new Error('Studio not found');
    }

    // RBAC Check
    const isSuperAdmin = req.user.role === 'super_admin';
    const isAssigned = req.user.assignedStudios && req.user.assignedStudios.some(id => id.toString() === studio._id.toString());

    // Allow super_admin OR assigned studio_admin/faculty_coordinator
    if (!isSuperAdmin && !isAssigned) {
        res.status(403);
        throw new Error('Not authorized to update this studio');
    }

    studio.name = req.body.name || studio.name;
    studio.description = req.body.description || studio.description;
    studio.location = req.body.location || studio.location;
    studio.city = req.body.city || studio.city;
    studio.area = req.body.area || studio.area;
    studio.address = req.body.address || studio.address;
    studio.capacity = req.body.capacity || studio.capacity;
    studio.numStudios = req.body.numStudios || studio.numStudios;
    studio.pocName = req.body.pocName || studio.pocName;
    studio.pocEmail = req.body.pocEmail || studio.pocEmail;
    studio.pocContact = req.body.pocContact || studio.pocContact;
    studio.facultyCoordinator = req.body.facultyCoordinator || studio.facultyCoordinator;
    studio.driveLinkInside = req.body.driveLinkInside || studio.driveLinkInside;
    studio.driveLinkOutside = req.body.driveLinkOutside || studio.driveLinkOutside;
    studio.googleMapLink = req.body.googleMapLink || studio.googleMapLink;
    studio.driveLink = req.body.driveLink || studio.driveLink;
    studio.facilities = req.body.facilities || studio.facilities;
    studio.images = req.body.images || studio.images;
    studio.interiorPhotos = req.body.interiorPhotos || studio.interiorPhotos;
    studio.exteriorPhotos = req.body.exteriorPhotos || studio.exteriorPhotos;
    studio.coverPhoto = req.body.coverPhoto || studio.coverPhoto;

    if (req.body.lat && req.body.lng) {
        studio.lat = req.body.lat;
        studio.lng = req.body.lng;
        studio.coordinates = {
            type: 'Point',
            coordinates: [req.body.lng, req.body.lat]
        };
    }

    const updatedStudio = await studio.save();
    res.json(updatedStudio);
});


// @desc    Get all unique cities
// @route   GET /api/studios/cities
// @access  Public
const getStudioCities = asyncHandler(async (req, res) => {
    const cities = await Studio.distinct('city');
    res.json(cities.filter(city => city)); // Filter out null/undefined
});

// @desc    Delete studio
// @route   DELETE /api/studios/:id
// @access  Private/Admin
const deleteStudio = asyncHandler(async (req, res) => {
    const studio = await Studio.findById(req.params.id);

    if (!studio) {
        res.status(404);
        throw new Error('Studio not found');
    }

    // RBAC Check: Only Super Admin can delete studios
    if (req.user.role !== 'super_admin') {
        res.status(403);
        throw new Error('Not authorized to delete studios');
    }

    await studio.deleteOne();
    res.json({ message: 'Studio removed' });
});

// @desc    Get all unique facilities
// @route   GET /api/studios/facilities
// @access  Public
const getStudioFacilities = asyncHandler(async (req, res) => {
    const facilities = await Studio.distinct('facilities');
    // Filter out null, empty strings, and ensure uniqueness/trim if needed (distinct does uniqueness)
    res.json(facilities.filter(f => f));
});

module.exports = {
    getStudios,
    getStudioById,
    createStudio,
    updateStudio,
    deleteStudio,
    getRecommendations,
    getStudioCities,
    getStudioFacilities
};
