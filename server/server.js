const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const path = require('path');
const { User, Studio } = require('./models');
const passport = require('passport');
const configurePassport = require('./config/passport');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const studioRoutes = require('./routes/studioRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

dotenv.config();
connectDB();
configurePassport();

const app = express();

app.use(cors());
app.set('trust proxy', 1); // Trust first proxy (Ngrok)
app.use(express.json());
app.use(passport.initialize());
app.use(morgan('dev'));

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/studios', studioRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', require('./routes/adminRoutes'));

app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

if (process.env.NODE_ENV === 'production') {
    // This block is intentionally left empty as per the instruction's incomplete snippet.
    // The original routes for recommendationRoutes and adminRoutes are kept outside this block
    // as the instruction's syntax for them within the if block was malformed.
}

// Seeder Endpoint (DEV ONLY)
app.get('/api/seed', async (req, res) => {
    await User.deleteMany({});
    await Studio.deleteMany({});

    const adminUser = await User.create({
        name: 'Super Admin',
        email: 'admin@pw.live',
        password: 'password123',
        role: 'super_admin',
        location: 'Noida'
    });

    const facultyUser = await User.create({
        name: 'Alakh Pandey',
        email: 'alakh@pw.live',
        password: 'password123',
        role: 'faculty',
        location: 'Noida'
    });

    await Studio.create([
        {
            name: 'Studio Alpha - Noida',
            location: 'Noida',
            address: 'Sector 62, Noida',
            capacity: 5,
            facilities: ['Smart Board', '4K Camera', 'Soundproofing'],
            admin: adminUser._id,
            images: ['https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=1000']
        },
        {
            name: 'Studio Beta - Delhi',
            location: 'Delhi',
            address: 'Kalusarai, Delhi',
            capacity: 3,
            facilities: ['Green Screen', 'Podcast Setup'],
            admin: adminUser._id,
            images: ['https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80&w=1000']
        }
    ]);

    res.send('Data Seeded!');
});

app.get('/', (req, res) => {
    res.send('API is running...');
});

// Error Handling
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
