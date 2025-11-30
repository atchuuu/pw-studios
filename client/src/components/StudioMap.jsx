import React, { useState, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';

const containerStyle = {
    width: '100%',
    height: '100%'
};

const defaultCenter = {
    lat: 28.6139,
    lng: 77.2090
};

const StudioMap = ({ studios, userLocation }) => {
    const [selectedStudio, setSelectedStudio] = useState(null);

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    });

    const center = useMemo(() => {
        return studios.length > 0
            ? { lat: parseFloat(studios[0].lat) || defaultCenter.lat, lng: parseFloat(studios[0].lng) || defaultCenter.lng }
            : defaultCenter;
    }, [studios]);

    if (!isLoaded) return <div>Loading Map...</div>;

    return (
        <div className="h-[500px] w-full rounded-lg overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={10}
            >
                {studios.map((studio) => {
                    const lat = parseFloat(studio.lat);
                    const lng = parseFloat(studio.lng);
                    if (isNaN(lat) || isNaN(lng)) return null;

                    return (
                        <Marker
                            key={studio._id}
                            position={{ lat, lng }}
                            onClick={() => setSelectedStudio(studio)}
                        />
                    );
                })}

                {userLocation && (
                    <Marker
                        position={{ lat: userLocation.lat, lng: userLocation.lng }}
                        icon={{
                            path: window.google.maps.SymbolPath.CIRCLE,
                            scale: 8,
                            fillColor: "#4285F4",
                            fillOpacity: 1,
                            strokeColor: "white",
                            strokeWeight: 2,
                        }}
                        title="You are here"
                    />
                )}

                {selectedStudio && (
                    <InfoWindow
                        position={{ lat: parseFloat(selectedStudio.lat), lng: parseFloat(selectedStudio.lng) }}
                        onCloseClick={() => setSelectedStudio(null)}
                    >
                        <div className="text-center p-2">
                            <h3 className="font-bold text-gray-900 mb-1">{selectedStudio.name}</h3>
                            <p className="text-sm text-gray-600 mb-2">{selectedStudio.address}</p>
                            <div className="flex flex-col gap-1">
                                <a href={`/studios/${selectedStudio._id}`} className="text-primary text-sm font-medium hover:underline">View Details</a>
                                <a
                                    href={selectedStudio.googleMapLink || `https://www.google.com/maps/dir/?api=1&destination=${selectedStudio.lat},${selectedStudio.lng}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 text-sm font-medium hover:underline"
                                >
                                    Get Directions
                                </a>
                            </div>
                        </div>
                    </InfoWindow>
                )}
            </GoogleMap>
        </div>
    );
};

export default React.memo(StudioMap);
