import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LocationProvider } from './context/LocationContext';
import Navbar from './components/Navbar';
import { Toaster } from 'react-hot-toast';
import axios from 'axios';

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
    if (loading) return <div>Loading...</div>;
    return user ? children : <Navigate to="/login" />;
};

const Layout = ({ children }) => {
    const location = useLocation();
    const isLoginPage = location.pathname === '/login';
    return (
        <>
            {!isLoginPage && <Navbar />}
            {children}
        </>
    );
};

function App() {
    return (
        <AuthProvider>
            <ThemeProvider>
                <LocationProvider>
                    <Router>
                        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
                            <Toaster position="top-center" reverseOrder={false} />
                            <Layout>
                                <Suspense fallback={
                                    <div className="flex justify-center items-center h-screen bg-transparent">
                                        <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
                                            <div className="h-full bg-primary animate-progress"></div>
                                        </div>
                                    </div>
                                }>
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
    );
}

export default App;
