import { createContext, useContext, useState, useEffect } from 'react';

const LocationContext = createContext();

export const useLocationContext = () => useContext(LocationContext);

export const LocationProvider = ({ children }) => {
    const [location, setLocation] = useState({ lat: null, lng: null, error: null });
    const [loadingLocation, setLoadingLocation] = useState(true);

    useEffect(() => {
        if (!navigator.geolocation) {
            setLocation(prev => ({ ...prev, error: 'Geolocation is not supported by your browser', loading: false }));
            setLoadingLocation(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    error: null
                });
                setLoadingLocation(false);
            },
            (error) => {
                setLocation(prev => ({ ...prev, error: error.message }));
                setLoadingLocation(false);
            }
        );
    }, []);

    return (
        <LocationContext.Provider value={{ location, loadingLocation }}>
            {children}
        </LocationContext.Provider>
    );
};
