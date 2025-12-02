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

        <div className="h-[500px] w-full rounded-2xl overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-700/50 glass-card">
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={10}
                options={{
                    disableDefaultUI: false,
                    zoomControl: true,
                    styles: [
                        {
                            "featureType": "all",
                            "elementType": "geometry",
                            "stylers": [{ "color": "#242f3e" }]
                        },
                        {
                            "featureType": "all",
                            "elementType": "labels.text.stroke",
                            "stylers": [{ "lightness": -80 }]
                        },
                        {
                            "featureType": "administrative",
                            "elementType": "labels.text.fill",
                            "stylers": [{ "color": "#746855" }]
                        },
                        {
                            "featureType": "administrative.locality",
                            "elementType": "labels.text.fill",
                            "stylers": [{ "color": "#d59563" }]
                        },
                        {
                            "featureType": "poi",
                            "elementType": "labels.text.fill",
                            "stylers": [{ "color": "#d59563" }]
                        },
                        {
                            "featureType": "poi.park",
                            "elementType": "geometry",
                            "stylers": [{ "color": "#263c3f" }]
                        },
                        {
                            "featureType": "poi.park",
                            "elementType": "labels.text.fill",
                            "stylers": [{ "color": "#6b9a76" }]
                        },
                        {
                            "featureType": "road",
                            "elementType": "geometry",
                            "stylers": [{ "color": "#38414e" }]
                        },
                        {
                            "featureType": "road",
                            "elementType": "geometry.stroke",
                            "stylers": [{ "color": "#212a37" }]
                        },
                        {
                            "featureType": "road",
                            "elementType": "labels.text.fill",
                            "stylers": [{ "color": "#9ca5b3" }]
                        },
                        {
                            "featureType": "road.highway",
                            "elementType": "geometry",
                            "stylers": [{ "color": "#746855" }]
                        },
                        {
                            "featureType": "road.highway",
                            "elementType": "geometry.stroke",
                            "stylers": [{ "color": "#1f2835" }]
                        },
                        {
                            "featureType": "road.highway",
                            "elementType": "labels.text.fill",
                            "stylers": [{ "color": "#f3d19c" }]
                        },
                        {
                            "featureType": "transit",
                            "elementType": "geometry",
                            "stylers": [{ "color": "#2f3948" }]
                        },
                        {
                            "featureType": "transit.station",
                            "elementType": "labels.text.fill",
                            "stylers": [{ "color": "#d59563" }]
                        },
                        {
                            "featureType": "water",
                            "elementType": "geometry",
                            "stylers": [{ "color": "#17263c" }]
                        },
                        {
                            "featureType": "water",
                            "elementType": "labels.text.fill",
                            "stylers": [{ "color": "#515c6d" }]
                        },
                        {
                            "featureType": "water",
                            "elementType": "labels.text.stroke",
                            "stylers": [{ "lightness": -20 }]
                        }
                    ]
                }}
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
                        <div className="text-center p-3 min-w-[200px]">
                            <h3 className="font-bold text-gray-900 text-lg mb-1">{selectedStudio.name}</h3>
                            <p className="text-sm text-gray-600 mb-3">{selectedStudio.address}</p>
                            <div className="flex flex-col gap-2">
                                <a href={`/studios/${selectedStudio._id}`} className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-brand-700 transition-colors">
                                    View Details
                                </a>
                                <a
                                    href={selectedStudio.googleMapLink || `https://www.google.com/maps/dir/?api=1&destination=${selectedStudio.lat},${selectedStudio.lng}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-brand-600 text-sm font-bold hover:underline"
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
