import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, InfoWindowF, useGoogleMap } from '@react-google-maps/api';
import { useTheme } from '../context/ThemeContext';

// Custom Advanced Marker Component
const AdvancedMarker = ({ position, onClick, pinStyles }) => {
    const map = useGoogleMap();
    const markerRef = useRef(null);

    useEffect(() => {
        if (!map) return;

        // Create PinElement
        const pinElement = new google.maps.marker.PinElement({
            background: pinStyles?.background,
            borderColor: pinStyles?.borderColor,
            glyphColor: pinStyles?.glyphColor,
            scale: pinStyles?.scale || 1
        });

        // Create AdvancedMarkerElement
        const marker = new google.maps.marker.AdvancedMarkerElement({
            map,
            position,
            content: pinElement.element,
            title: pinStyles?.title
        });

        // Add Click Listener
        if (onClick) {
            marker.addListener('click', onClick);
        }

        markerRef.current = marker;

        return () => {
            marker.map = null;
        };
    }, [map, position, onClick, pinStyles]);

    return null;
};

const containerStyle = {
    width: '100%',
    height: '100%'
};

const defaultCenter = {
    lat: 28.6139,
    lng: 77.2090
};

// Map Styles
const darkModeStyles = [
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
];

const lightModeStyles = []; // Default Google Maps styling

const StudioMap = ({ studios, userLocation, selectedStudioId, onStudioClick }) => {
    const [selectedStudio, setSelectedStudio] = useState(null);
    const { theme } = useTheme();

    // Update internal state if selectedStudioId changes from parent
    useEffect(() => {
        if (selectedStudioId) {
            const studio = studios.find(s => s._id === selectedStudioId);
            if (studio) setSelectedStudio(studio);
        } else {
            setSelectedStudio(null);
        }
    }, [selectedStudioId, studios]);

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries: ['marker'] // Required for AdvancedMarkerElement
    });

    const center = useMemo(() => {
        if (selectedStudio) {
            return { lat: parseFloat(selectedStudio.lat), lng: parseFloat(selectedStudio.lng) };
        }
        return studios.length > 0
            ? { lat: parseFloat(studios[0].lat) || defaultCenter.lat, lng: parseFloat(studios[0].lng) || defaultCenter.lng }
            : defaultCenter;
    }, [studios, selectedStudio]);

    const mapRef = useRef(null);

    const onLoad = React.useCallback(function callback(map) {
        mapRef.current = map;
    }, []);

    const onUnmount = React.useCallback(function callback(map) {
        mapRef.current = null;
    }, []);

    // Fit bounds to show all studios
    useEffect(() => {
        if (mapRef.current && studios.length > 0) {
            const bounds = new window.google.maps.LatLngBounds();
            studios.forEach(studio => {
                if (!isNaN(parseFloat(studio.lat)) && !isNaN(parseFloat(studio.lng))) {
                    bounds.extend({ lat: parseFloat(studio.lat), lng: parseFloat(studio.lng) });
                }
            });
            if (userLocation) {
                bounds.extend({ lat: userLocation.lat, lng: userLocation.lng });
            }
            mapRef.current.fitBounds(bounds);
        }
    }, [studios, userLocation, isLoaded]);

    if (!isLoaded) return <div>Loading Map...</div>;

    const pinIcon = {
        path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
        fillOpacity: 1,
        strokeWeight: 2,
        strokeColor: "#ffffff",
        scale: 2,
        anchor: { x: 12, y: 22 }
    };

    return (

        <div className="h-full w-full rounded-none overflow-hidden">
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={10}
                onLoad={onLoad}
                onUnmount={onUnmount}
                options={{
                    disableDefaultUI: false,
                    zoomControl: true,
                    styles: theme === 'dark' ? darkModeStyles : lightModeStyles,
                    mapId: 'DEMO_MAP_ID' // Required for Advanced Markers
                }}
            >
                {studios.map((studio) => {
                    let coords = null;
                    if (!isNaN(parseFloat(studio.lat)) && !isNaN(parseFloat(studio.lng))) {
                        coords = { lat: parseFloat(studio.lat), lng: parseFloat(studio.lng) };
                    } else if (studio.coordinates && Array.isArray(studio.coordinates) && studio.coordinates.length === 2) {
                        coords = { lat: parseFloat(studio.coordinates[1]), lng: parseFloat(studio.coordinates[0]) };
                    } else if (studio.coordinates && studio.coordinates.coordinates && Array.isArray(studio.coordinates.coordinates)) {
                        coords = { lat: parseFloat(studio.coordinates.coordinates[1]), lng: parseFloat(studio.coordinates.coordinates[0]) };
                    } else if (studio.location && studio.location.coordinates && Array.isArray(studio.location.coordinates)) {
                        coords = { lat: parseFloat(studio.location.coordinates[1]), lng: parseFloat(studio.location.coordinates[0]) };
                    }

                    if (!coords) return null;

                    const isSelected = selectedStudioId === studio._id;

                    return (
                        <AdvancedMarker
                            key={studio._id}
                            position={coords}
                            onClick={() => onStudioClick(studio)}
                            pinStyles={{
                                background: isSelected ? "#5a189a" : "#EF4444", // Purple if selected, Red default
                                borderColor: "#ffffff",
                                glyphColor: "#ffffff",
                                scale: 1.2, // Slightly larger
                                title: studio.name
                            }}
                        />
                    );
                })}

                {selectedStudio && (
                    <InfoWindowF
                        position={{ lat: parseFloat(selectedStudio.lat), lng: parseFloat(selectedStudio.lng) }}
                        onCloseClick={() => onStudioClick(null)}
                        options={{ pixelOffset: new window.google.maps.Size(0, -40) }} // Adjust for pin height
                    >
                        <div className="p-2 min-w-[200px] max-w-[250px]">
                            <h3 className="font-bold text-gray-900 text-base mb-1">{selectedStudio.name}</h3>
                            <p className="text-xs text-gray-600 mb-2 line-clamp-6">{selectedStudio.address}</p>
                            <a
                                href={selectedStudio.googleMapLink || `https://www.google.com/maps/dir/?api=1&destination=${selectedStudio.lat},${selectedStudio.lng}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block bg-brand-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-brand-700 transition-colors"
                            >
                                Get Directions
                            </a >
                        </div >
                    </InfoWindowF >
                )}

                {
                    userLocation && (
                        <AdvancedMarker
                            position={{ lat: userLocation.lat, lng: userLocation.lng }}
                            pinStyles={{
                                background: "#4285F4", // Blue for user
                                borderColor: "#ffffff",
                                glyphColor: "#ffffff",
                                scale: 1,
                                title: "You are here"
                            }}
                        />
                    )
                }
            </GoogleMap >
        </div >
    );
};

export default React.memo(StudioMap);
