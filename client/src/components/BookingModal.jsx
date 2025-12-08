
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCalendarAlt, FaClock, FaTimes, FaBuilding, FaCheckCircle, FaDoorOpen, FaChevronDown } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../utils/apiConfig';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Custom Time Scroll Component
const TimeColumn = ({ options, value, onChange, label }) => {
    const containerRef = useRef(null);
    const isScrolling = useRef(false);
    const timeoutRef = useRef(null);

    // Item height logic: h-12 = 48px (3rem)
    const ITEM_HEIGHT = 48;
    // Container height: h-56 = 224px. Center = 112px.
    // To center first item (top at 0 relative to list), padTop = 112 - 24 = 88px.
    // Let's use h-48 (192px) container for tighter look? Or stick to h-56.
    // 56 => 14rem = 224px.
    // Padding to center: (224 - 48)/2 = 88px.
    const PADDING_Y = 88;

    // Scroll to value on mount/change if not currently user-scrolling
    useEffect(() => {
        if (containerRef.current && !isScrolling.current) {
            const index = options.indexOf(value);
            if (index !== -1) {
                containerRef.current.scrollTo({
                    top: index * ITEM_HEIGHT,
                    behavior: 'smooth'
                });
            }
        }
    }, [value, options]);

    const handleScroll = (e) => {
        isScrolling.current = true;
        clearTimeout(timeoutRef.current);

        const scrollTop = e.target.scrollTop;

        // Calculate centered index directly
        const centeredIndex = Math.round(scrollTop / ITEM_HEIGHT);
        const validIndex = Math.max(0, Math.min(centeredIndex, options.length - 1));

        // Visual updates can happen via CSS or React state, but for "Scroll to Select"
        // we want to update the actual value when scrolling stops (snap).

        // Debounce the actual selection to avoid rapid-fire updates during scroll
        timeoutRef.current = setTimeout(() => {
            isScrolling.current = false;
            const newValue = options[validIndex];
            if (newValue && newValue !== value) {
                onChange(newValue);
            }
        }, 100); // Quick debounce for responsive feel
    };

    return (
        <div className="flex-1 h-56 relative bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-100 dark:border-white/5 shadow-inner overflow-hidden">
            <div className="absolute top-0 inset-x-0 z-10 bg-white/90 dark:bg-[#1A1A1A]/90 backdrop-blur-md text-center text-[10px] font-bold uppercase py-2 text-gray-400 border-b border-gray-100 dark:border-white/5 tracking-widest">
                {label}
            </div>

            {/* Gradient Masks */}
            <div className="absolute inset-x-0 top-[33px] h-20 bg-gradient-to-b from-white dark:from-[#1A1A1A] via-white/80 dark:via-[#1A1A1A]/80 to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white dark:from-[#1A1A1A] via-white/80 dark:via-[#1A1A1A]/80 to-transparent z-10 pointer-events-none" />

            {/* Center Lens Indicators */}
            <div className="absolute top-1/2 left-4 right-4 h-12 -translate-y-1/2 border-y border-brand-200 dark:border-brand-500/30 pointer-events-none rounded-lg z-0" />

            <div
                ref={containerRef}
                onScroll={handleScroll}
                className="h-full overflow-y-auto snap-y snap-mandatory no-scrollbar relative z-0"
            >
                <div style={{ paddingTop: PADDING_Y, paddingBottom: PADDING_Y }}>
                    {options.map((opt) => (
                        <button
                            key={opt}
                            onClick={() => {
                                // Manual click to select
                                onChange(opt);
                                // Scroll will be handled by useEffect
                            }}
                            className={`
                                h-12 w-full flex items-center justify-center snap-center transition-all duration-200
                                ${value === opt
                                    ? 'text-3xl font-bold text-brand-600 dark:text-brand-400 scale-100 opacity-100'
                                    : 'text-xl font-medium text-gray-300 dark:text-gray-700 scale-90 opacity-40 blur-[0.5px]'
                                }
                            `}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

const TimePicker = ({ label, value, onChange, minTime, badge }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Parse minTime ("HH:MM") to numbers for comparison
    const minH = minTime ? parseInt(minTime.split(':')[0]) : -1;
    const minM = minTime ? parseInt(minTime.split(':')[1]) : -1;

    // Parse current value
    const [selectedHour, setSelectedHour] = useState(value ? value.split(':')[0] : '12');
    const [selectedMinute, setSelectedMinute] = useState(value ? value.split(':')[1] : '00');

    // Generate Options (Filtered)
    const hours = Array.from({ length: 16 }, (_, i) => (i + 6).toString().padStart(2, '0'))
        .filter(h => !minTime || parseInt(h) >= minH); // Strict filtering of hours before minHour

    // Filter minutes: If selected hour IS the minHour, only show minutes >= minMinute
    const minutes = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0'))
        .filter(m => {
            if (minTime && parseInt(selectedHour) === minH) {
                return parseInt(m) >= minM;
            }
            return true;
        });

    useEffect(() => {
        if (value) {
            const [h, m] = value.split(':');
            setSelectedHour(h);
            setSelectedMinute(m);
        }
    }, [value]);

    useEffect(() => {
        // Validation: If current selection becomes invalid due to minTime change, reset it
        if (minTime) {
            const currH = parseInt(selectedHour);
            const currM = parseInt(selectedMinute);

            if (currH < minH || (currH === minH && currM < minM)) {
                // Auto-correct to minTime properties
                // Find first valid minute
                const validMinutes = Array.from({ length: 12 }, (_, i) => (i * 5))
                    .filter(m => (minH === minH) ? m >= minM : true);

                const nextM = validMinutes.length > 0 ? validMinutes[0].toString().padStart(2, '0') : '00';
                const newTime = minTime; // simplistic fallback
                onChange(newTime);
            }
        }
    }, [minTime, selectedHour, selectedMinute]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleTimeChange = (type, val) => {
        let newH = selectedHour;
        let newM = selectedMinute;

        if (type === 'hour') newH = val;
        if (type === 'minute') newM = val;

        const newTime = `${newH}:${newM}`;
        onChange(newTime);
    };

    return (
        <div className="flex-1 relative" ref={containerRef}>
            <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</label>
                {badge}
            </div>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    w-full flex items-center justify-between bg-white dark:bg-black/20 
                    border ${isOpen ? 'border-brand-500 ring-4 ring-brand-500/10' : 'border-gray-200 dark:border-white/10'} 
                    rounded-2xl px-5 py-4 transition-all group
                    text-left
                `}
            >
                <div className="flex items-baseline gap-1">
                    <span className={`text-3xl font-bold font-mono tracking-tight ${value ? 'text-gray-900 dark:text-white' : 'text-gray-300 dark:text-gray-600'}`}>
                        {value || '--:--'}
                    </span>
                    {value && <span className="text-xs font-bold text-gray-400 ml-1">HRS</span>}
                </div>
                <FaClock className={`text-xl transition-colors ${isOpen ? 'text-brand-500' : 'text-gray-300 dark:text-gray-600 group-hover:text-gray-400'}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full left-0 right-0 mt-2 p-3 bg-white dark:bg-[#1f1f1f] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 z-50 flex gap-2"
                    >
                        <TimeColumn
                            label="HOURS"
                            options={hours}
                            value={selectedHour}
                            onChange={(v) => handleTimeChange('hour', v)}
                        />
                        <div className="self-center font-bold text-gray-300 mb-6">:</div>
                        <TimeColumn
                            label="MINS"
                            options={minutes}
                            value={selectedMinute}
                            onChange={(v) => handleTimeChange('minute', v)}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const BookingModal = ({ studio, isOpen, onClose }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedUnit, setSelectedUnit] = useState(studio?.studioNumbers?.[0] || null);
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [bookedSlots, setBookedSlots] = useState([]); // Kept for reference or visualization if needed, but primary logic changes
    const [unavailableRanges, setUnavailableRanges] = useState([]); // Store booked ranges to validate against
    const [loading, setLoading] = useState(false);
    const [showUnitDropdown, setShowUnitDropdown] = useState(false);

    // Generate next 30 days for the Date Strip
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        dates.push({
            fullDate: d.toISOString().split('T')[0],
            dayName: d.toLocaleDateString('en-US', { weekday: 'short' }), // Mon, Tue
            dayNumber: d.getDate(), // 18, 19
            month: d.toLocaleDateString('en-US', { month: 'short' }), // Nov, Dec
            isToday: i === 0
        });
    }

    // Generate slots from 6 AM to 8 PM
    const slots = [];
    for (let i = 6; i <= 20; i++) {
        slots.push(i);
    }

    useEffect(() => {
        if (!isOpen) return;
        // Reset state when modal opens
        setDate(new Date().toISOString().split('T')[0]);
        setSelectedUnit(studio?.studioNumbers?.[0] || null);
        setStartTime('');
        setEndTime('');
    }, [isOpen, studio]);

    useEffect(() => {
        const fetchBookings = async () => {
            if (!date || !selectedUnit || !isOpen) return;
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await axios.get(`${API_BASE_URL}/bookings/studio/${studio._id}?date=${date}&studioUnit=${selectedUnit}`, config);
                // Store full booking objects to check ranges
                setUnavailableRanges(data.map(b => ({
                    start: new Date(b.startTime),
                    end: new Date(b.endTime)
                })));
            } catch (error) {
                console.error("Failed to fetch bookings", error);
            }
        };
        fetchBookings();
    }, [studio, date, selectedUnit, user, isOpen]);

    // Helper to get studio ID safely
    const id = studio?._id;

    const handleBook = async () => {
        if (!startTime || !endTime || !selectedUnit) return;
        setLoading(true);
        try {
            // Construct ISO strings
            const startDateTime = new Date(`${date}T${startTime}:00`);
            const endDateTime = new Date(`${date}T${endTime}:00`);

            // Frontend Validation
            if (endDateTime <= startDateTime) {
                toast.error('End time must be after start time');
                setLoading(false);
                return;
            }

            // Client-side Overlap Check with 10-minute Buffer
            // We need to find the specific booking that blocks us to give helpful feedback
            const conflictingBooking = unavailableRanges.find(booking => {
                // Buffer Logic: A gap of 10 mins is required between bookings.
                // So effective blocked range is [ExistingStart - 10m, ExistingEnd + 10m]
                // Conflict if: RequestedStart < (ExistingEnd + 10m) AND RequestedEnd > (ExistingStart - 10m)

                const blockedStart = new Date(booking.start.getTime() - 10 * 60000);
                const blockedEnd = new Date(booking.end.getTime() + 10 * 60000);

                return startDateTime < blockedEnd && endDateTime > blockedStart;
            });

            if (conflictingBooking) {
                // Calculate when the user can likely start (after the conflicting booking + buffer)
                const availableFrom = new Date(conflictingBooking.end.getTime() + 10 * 60000);

                // Format for Input (HH:mm)
                const hours = availableFrom.getHours().toString().padStart(2, '0');
                const minutes = availableFrom.getMinutes().toString().padStart(2, '0');
                const newStartStr = `${hours}:${minutes}`;

                // Format for Display (Friendly)
                const displayTime = availableFrom.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                setStartTime(newStartStr);
                toast.error(`Slot unavailable! Auto-adjusted Start Time to ${displayTime} (after 10m buffer).`);
                setLoading(false);
                return;
            }

            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.post(`${API_BASE_URL}/bookings`, {
                studioId: studio._id,
                studioUnit: selectedUnit,
                startTime: startDateTime.toISOString(),
                endTime: endDateTime.toISOString()
            }, config);

            toast.success(`Booking Confirmed: ${startTime} - ${endTime}`);
            onClose();
            navigate('/bookings');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Booking failed');
        } finally {
            setLoading(false);
        }
    };

    const handleSlotClick = (hour) => {
        const startStr = hour.toString().padStart(2, '0') + ':00';
        const endStr = (hour + 1).toString().padStart(2, '0') + ':00';
        setStartTime(startStr);
        setEndTime(endStr);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/90 backdrop-blur-md">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 30 }}
                        className="relative bg-white dark:bg-[#1A1A1A] w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border border-gray-200 dark:border-white/10 flex flex-col no-scrollbar transition-colors duration-300"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 dark:border-white/10 flex justify-between items-center bg-white/80 dark:bg-white/5 sticky top-0 z-30 backdrop-blur-xl transition-colors">
                            <div>
                                <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Book Session</h2>
                                <p className="text-gray-500 dark:text-gray-400 text-xs mt-1 font-medium">{studio.name}</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <div className="p-6 space-y-8 flex-grow">

                            {/* 1. Unit Selection (Dropdown) */}
                            <div className="relative">
                                <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4 block ml-1">Select Studio Unit</label>
                                <button
                                    onClick={() => setShowUnitDropdown(!showUnitDropdown)}
                                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-5 py-4 flex items-center justify-between text-left hover:bg-white dark:hover:bg-white/10 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="bg-white dark:bg-white/10 p-2 rounded-lg text-brand-600 dark:text-brand-400">
                                            <FaBuilding />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white text-lg">{selectedUnit}</p>
                                            <p className="text-xs text-gray-500">Studio Room</p>
                                        </div>
                                    </div>
                                    <FaChevronDown className={`text-gray-400 transition-transform duration-300 ${showUnitDropdown ? 'rotate-180' : ''}`} />
                                </button>

                                <AnimatePresence>
                                    {showUnitDropdown && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1f1f1f] border border-gray-100 dark:border-white/10 rounded-xl shadow-xl z-50 overflow-hidden max-h-60 overflow-y-auto custom-scrollbar"
                                        >
                                            <div className="flex flex-wrap gap-2 p-3">
                                                {studio.studioNumbers.map(unit => (
                                                    <button
                                                        key={unit}
                                                        onClick={() => {
                                                            setSelectedUnit(unit);
                                                            setStartTime('');
                                                            setEndTime('');
                                                            setShowUnitDropdown(false);
                                                        }}
                                                        className={`
                                                            py-2 px-4 rounded-full border transition-all text-sm font-bold flex items-center justify-center gap-2
                                                            ${selectedUnit === unit
                                                                ? 'bg-brand-600 border-brand-500 text-white shadow-md'
                                                                : 'bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 hover:border-gray-200 dark:hover:border-white/20'
                                                            }
                                                        `}
                                                    >
                                                        {unit}
                                                        {selectedUnit === unit && <FaCheckCircle className="text-[10px]" />}
                                                    </button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                {/* Overlay to close dropdown when clicking outside */}
                                {showUnitDropdown && (
                                    <div className="fixed inset-0 z-40" onClick={() => setShowUnitDropdown(false)} />
                                )}
                            </div>

                            {/* 2. Date Selection (Strip) */}
                            <div>
                                <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4 block ml-1">Select Date</label>
                                <div className="flex gap-3 overflow-x-auto pb-2 snap-x no-scrollbar">
                                    {dates.map((d) => {
                                        const isSelected = date === d.fullDate;
                                        return (
                                            <button
                                                key={d.fullDate}
                                                onClick={() => {
                                                    setDate(d.fullDate);
                                                    setStartTime('');
                                                    setEndTime('');
                                                }}
                                                className={`
                                                    flex-shrink-0 w-20 flex flex-col items-center justify-center py-4 rounded-2xl border transition-all snap-start
                                                    ${isSelected
                                                        ? 'bg-gray-900 dark:bg-white text-white dark:text-black border-gray-900 dark:border-white shadow-lg scale-105'
                                                        : 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-400 dark:text-gray-400 hover:bg-white dark:hover:bg-white/10 hover:border-gray-300 dark:hover:border-white/20'
                                                    }
                                                `}
                                            >
                                                <span className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isSelected ? 'text-gray-400 dark:text-gray-500' : 'text-gray-400 dark:text-gray-500'}`}>{d.month}</span>
                                                <span className={`text-2xl font-bold mb-1 ${isSelected ? 'text-white dark:text-black' : 'text-gray-900 dark:text-white'}`}>{d.dayNumber}</span>
                                                <span className={`text-xs font-semibold ${isSelected ? 'text-brand-400 dark:text-brand-600' : 'text-gray-500'}`}>{d.isToday ? 'Today' : d.dayName}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* 3. Time Selection (Granular) */}
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4 block ml-1">
                                    Select Time <span className="text-gray-500 dark:text-gray-600 normal-case ml-2">{selectedUnit ? `for ${selectedUnit}` : '(Select Unit First)'}</span>
                                </label>

                                <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-6 border border-gray-100 dark:border-white/5 transition-colors">
                                    <div className="flex flex-col sm:flex-row gap-6">
                                        {/* Start Time Picker */}
                                        {/* Start Time Picker */}
                                        <TimePicker
                                            label="Start Time"
                                            value={startTime}
                                            minTime={new Date().toISOString().split('T')[0] === date ? new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : undefined}
                                            onChange={(val) => {
                                                setStartTime(val);
                                                // Auto-advance end time if not set or invalid
                                                if (!endTime || val >= endTime) {
                                                    // Default +1 hour logic could go here, or leave empty
                                                }
                                            }}
                                            badge={startTime && <span className="text-xs font-bold text-brand-500 bg-brand-50 dark:bg-brand-900/20 px-2 py-0.5 rounded">FROM</span>}
                                        />

                                        {/* End Time Picker */}
                                        <TimePicker
                                            label="End Time"
                                            value={endTime}
                                            minTime={startTime}
                                            onChange={(val) => setEndTime(val)}
                                            badge={endTime && <span className="text-xs font-bold text-brand-500 bg-brand-50 dark:bg-brand-900/20 px-2 py-0.5 rounded">TO</span>}
                                        />
                                    </div>

                                    {!selectedUnit && (
                                        <div className="absolute inset-0 bg-white/50 dark:bg-black/50 backdrop-blur-[1px] rounded-2xl flex items-center justify-center z-10">
                                            <span className="bg-white dark:bg-black px-4 py-2 rounded-full text-sm font-bold shadow-lg">Select Unit First</span>
                                        </div>
                                    )}
                                </div>

                                {/* Quick Slots Grid */}
                                <div className="mt-8">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="h-[1px] bg-gray-200 dark:bg-white/10 flex-1"></div>
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">OR SELECT HOURLY SLOT</span>
                                        <div className="h-[1px] bg-gray-200 dark:bg-white/10 flex-1"></div>
                                    </div>

                                    <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-5 border border-gray-100 dark:border-white/5 transition-colors">
                                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                            {slots.map((hour) => {
                                                const timeLabel = `${hour.toString().padStart(2, '0')}:00`;

                                                // Check bounds using full Date objects to match unavailableRanges
                                                const slotStart = new Date(date);
                                                slotStart.setHours(hour, 0, 0, 0);

                                                const slotEnd = new Date(date);
                                                slotEnd.setHours(hour + 1, 0, 0, 0);

                                                const isBooked = unavailableRanges.some(range =>
                                                    range.start < slotEnd && range.end > slotStart
                                                );

                                                // Check for past time
                                                const currentHour = new Date().getHours();
                                                const isToday = dates[0].fullDate === date;
                                                const isPast = isToday && hour <= currentHour;

                                                // Visual Selection State (matches if Start Time matches hour)
                                                const isSelected = startTime === `${hour.toString().padStart(2, '0')}:00`;

                                                return (
                                                    <button
                                                        key={hour}
                                                        disabled={isBooked || !selectedUnit || isPast}
                                                        onClick={() => handleSlotClick(hour)}
                                                        className={`
                                                            py-3 px-2 rounded-xl text-sm font-bold transition-all relative
                                                            ${!selectedUnit
                                                                ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-500'
                                                                : (isBooked || isPast)
                                                                    ? 'bg-red-50 dark:bg-red-500/10 text-red-300 dark:text-red-500/50 cursor-not-allowed border border-red-100 dark:border-red-500/10'
                                                                    : isSelected
                                                                        ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30 scale-105 ring-2 ring-brand-500 ring-offset-2 dark:ring-offset-[#1A1A1A] z-10'
                                                                        : 'bg-white dark:bg-black/20 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-white/5'
                                                            }
                                                        `}
                                                    >
                                                        {timeLabel}
                                                        {isBooked && (
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                <div className="w-full h-[1px] bg-red-300 dark:bg-red-500/50 rotate-[-20deg]"></div>
                                                            </div>
                                                        )}
                                                        {isPast && !isBooked && (
                                                            <div className="absolute inset-0 bg-gray-200/50 dark:bg-black/50 rounded-xl" />
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        {!selectedUnit && (
                                            <p className="text-center text-gray-500 text-sm mt-4">select a unit above to view slots</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-gray-100 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-md sticky bottom-0 z-30 transition-colors">

                            {/* Selection Summary */}
                            <div className="flex justify-between items-center mb-4 text-sm">
                                <div className="flex flex-col">
                                    <span className="text-gray-400 dark:text-gray-500 font-medium text-xs uppercase tracking-wider">Booking Preview</span>
                                    <span className="text-gray-900 dark:text-white font-bold flex items-center gap-2">
                                        {selectedUnit ? selectedUnit : <span className="opacity-50">Select Unit</span>}
                                        <span className="text-gray-300 dark:text-gray-700">•</span>
                                        {date ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : <span className="opacity-50">Date</span>}
                                        <span className="text-gray-300 dark:text-gray-700">•</span>
                                        {startTime && endTime ? `${startTime} - ${endTime}` : <span className="opacity-50">Select Time</span>}
                                    </span>
                                </div>
                                {startTime && endTime && (
                                    <div className="bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 px-3 py-1 rounded-full text-xs font-bold border border-brand-200 dark:border-brand-700/50">
                                        Ready
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handleBook}
                                disabled={loading || !startTime || !endTime || !selectedUnit}
                                className="w-full bg-gray-900 dark:bg-white text-white dark:text-black py-4 rounded-xl font-bold text-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-all shadow-xl shadow-gray-900/10 dark:shadow-white/5 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 transform active:scale-[0.98]"
                            >
                                {loading ? 'Processing...' : 'Confirm Booking'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default BookingModal;
