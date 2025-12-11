const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { User } = require('../models');

const configurePassport = () => {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: `${process.env.SERVER_URL}/api/auth/google/callback`,
                proxy: true,
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    const email = profile.emails[0].value;
                    const domain = email.split('@')[1];
                    const allowedDomains = ['pw.live', 'physicswallah.org'];

                    if (!allowedDomains.includes(domain)) {
                        return done(null, false, { message: 'Only PW work email accounts are allowed.' });
                    }

                    // Check if user exists
                    let user = await User.findOne({ email });

                    if (user) {
                        // Update googleId if not present (linking accounts)
                        if (!user.googleId) {
                            user.googleId = profile.id;
                        }
                        // Update profile picture if not present or if it's a google image (to refresh expired URLs)
                        if (
                            (!user.profilePicture || user.profilePicture.includes('googleusercontent.com')) &&
                            profile.photos &&
                            profile.photos[0]
                        ) {
                            user.profilePicture = profile.photos[0].value;
                        }
                        await user.save();
                        return done(null, user);
                    }

                    // Create new user
                    user = await User.create({
                        name: profile.displayName,
                        email: email,
                        googleId: profile.id,
                        role: 'faculty', // Default role
                        profilePicture: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
                        // Password is required by schema but not used for OAuth. 
                        // We can set a random dummy password or modify schema to make it optional.
                        // For now, setting a dummy password to satisfy schema if not modified yet.
                        password: Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8),
                    });

                    return done(null, user);
                } catch (error) {
                    return done(error, null);
                }
            }
        )
    );
};

module.exports = configurePassport;
