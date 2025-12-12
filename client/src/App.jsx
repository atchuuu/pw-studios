import { Suspense, lazy, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LocationProvider } from './context/LocationContext';
import Navbar from './components/Navbar';
import { Toaster } from 'react-hot-toast';
import axios from 'axios';
import BrandLoader from './components/common/BrandLoader';
import OfflinePage from './pages/OfflinePage';
import ErrorBoundary from './components/common/ErrorBoundary';

// Skip ngrok browser warning
axios.defaults.headers.common['ngrok-skip-browser-warning'] = 'true';

// Lazy load pages
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const StudioDetails = lazy(() => import('./pages/StudioDetails'));
const EditStudio = lazy(() => import('./pages/EditStudio'));
const MyBookings = lazy(() => import('./pages/MyBookings'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const UserProfile = lazy(() => import('./pages/UserProfile'));

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <BrandLoader />;
    return user ? children : <Navigate to="/login" />;
};

import Sidebar from './components/Sidebar';
import PageHeader from './components/PageHeader';

const Layout = ({ children }) => {
    const location = useLocation();
    const isLoginPage = location.pathname === '/login';
    const isDashboard = location.pathname === '/' || location.pathname === '/dashboard';

    // State for Sidebar
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    if (isLoginPage) return <>{children}</>;

    return (
        <>
            {isDashboard ? (
                <Navbar onOpenSidebar={() => setIsSidebarOpen(true)} />
            ) : (
                <PageHeader onOpenSidebar={() => setIsSidebarOpen(true)} />
            )}

            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {children}
        </>
    );
};

function App() {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (!isOnline) {
        return <OfflinePage type="offline" />;
    }

    return (
        <ErrorBoundary>
            <AuthProvider>
                <ThemeProvider>
                    <LocationProvider>
                        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
                                <Toaster position="top-center" reverseOrder={false} />
                                <Layout>
                                    <Suspense fallback={<BrandLoader fullScreen={false} text="Loading Application..." />}>
                                        <Routes>
                                            <Route path="/login" element={<Login />} />
                                            <Route path="/dashboard" element={
                                                <PrivateRoute>
                                                    <Dashboard />
                                                </PrivateRoute>
                                            } />
                                            <Route path="/studios/:id" element={
                                                <PrivateRoute>
                                                    <StudioDetails />
                                                </PrivateRoute>
                                            } />
                                            <Route path="/studios/:id/edit" element={
                                                <PrivateRoute>
                                                    <EditStudio />
                                                </PrivateRoute>
                                            } />
                                            <Route path="/bookings" element={
                                                <PrivateRoute>
                                                    <MyBookings />
                                                </PrivateRoute>
                                            } />
                                            <Route path="/admin" element={
                                                <PrivateRoute>
                                                    <AdminDashboard />
                                                </PrivateRoute>
                                            } />
                                            <Route path="/profile" element={
                                                <PrivateRoute>
                                                    <UserProfile />
                                                </PrivateRoute>
                                            } />
                                            <Route path="/" element={<Navigate to="/dashboard" />} />
                                        </Routes>
                                    </Suspense>
                                </Layout>
                            </div>
                        </Router>
                    </LocationProvider>
                </ThemeProvider>
            </AuthProvider>
        </ErrorBoundary>
    );
}

export default App;
