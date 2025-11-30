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
    useEffect(() => {
        detectLocation();
    }, []);

    const updateCity = (city) => {
        setSelectedCity(city);
        setIsNearMe(false);
        // We no longer persist the city to localStorage
        // localStorage.setItem('pw_studios_city', city); 
    };

    const detectLocation = () => {
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
                    localStorage.setItem('pw_studios_city', 'Near Me'); // Persist Near Me
                    setLocationError(null);
                    setLocationLoading(false);
                },
                (error) => {
                    console.error("Error getting location:", error);
                    setLocationError("Could not get your location.");
                    setLocationLoading(false);
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        } else {
            setLocationError("Geolocation is not supported by this browser.");
        }
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
