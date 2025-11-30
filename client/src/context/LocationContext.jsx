import { createContext, useContext, useState, useEffect } from 'react';

const LocationContext = createContext();

export const useLocationContext = () => {
    return useContext(LocationContext);
};

export const LocationProvider = ({ children }) => {
    const [selectedCity, setSelectedCity] = useState('');
    const [userLocation, setUserLocation] = useState(null);
    const [isNearMe, setIsNearMe] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);
    const [locationError, setLocationError] = useState(null);

    const [searchKeyword, setSearchKeyword] = useState('');

    // Always default to Near Me (detect location) on mount/refresh
    // Removed auto-detect on mount to prevent "User denied" errors if permission wasn't granted yet
    // and to ensure the prompt only appears when the user explicitly requests it.
    useEffect(() => {
        // Optional: Check if we already have a saved city preference
        const savedCity = localStorage.getItem('pw_studios_city');
        if (savedCity) {
            setSelectedCity(savedCity);
            if (savedCity === 'Near Me') {
                // If they previously chose Near Me, we *could* try to detect, 
                // but let's wait for them to click or just show the last known state if we persisted coords (we didn't).
                // So just set it to 'Near Me' and let them re-trigger if needed, or maybe just default to empty/all.
            }
        }
    }, []);

    const updateCity = (city) => {
        setSelectedCity(city);
        setIsNearMe(false);
        // We no longer persist the city to localStorage
        // localStorage.setItem('pw_studios_city', city); 
    };

    const detectLocation = () => {
        return new Promise((resolve, reject) => {
            if (navigator.geolocation) {
                setLocationLoading(true);
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        setUserLocation({
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        });
                        setIsNearMe(true);
                        setSelectedCity('Near Me');
                        localStorage.setItem('pw_studios_city', 'Near Me');
                        setLocationError(null);
                        setLocationLoading(false);
                        resolve(position);
                    },
                    (error) => {
                        console.error("Error getting location:", error);
                        setLocationError("Could not get your location.");
                        setLocationLoading(false);
                        reject(error);
                    },
                    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
                );
            } else {
                const error = "Geolocation is not supported by this browser.";
                setLocationError(error);
                reject(new Error(error));
            }
        });
    };

    const value = {
        selectedCity,
        setSelectedCity: updateCity,
        userLocation,
        isNearMe,
        detectLocation,
        locationLoading,
        locationError,
        searchKeyword,
        setSearchKeyword
    };

    return (
        <LocationContext.Provider value={value}>
            {children}
        </LocationContext.Provider>
    );
};
