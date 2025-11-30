import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import StudioDetails from './pages/StudioDetails';
import MyBookings from './pages/MyBookings';
import UserProfile from './pages/UserProfile';
import StudioList from './components/Admin/StudioList';
import EditStudio from './pages/EditStudio';
import { Toaster } from 'react-hot-toast';

const PrivateRoute = ({ children, roles = [] }) => {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>;

    if (!user) return <Navigate to="/login" />;

    if (roles.length > 0 && !roles.includes(user.role)) {
        return <Navigate to="/" />;
    }

    return children;
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <LocationProvider>
                    <ThemeProvider>
                        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-200">
                            <Navbar />
                            <Routes>
                                <Route path="/login" element={<Login />} />
                                <Route path="/" element={
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
                                    <PrivateRoute roles={['super_admin']}>
                                        <EditStudio />
                                    </PrivateRoute>
                                } />
                                <Route path="/bookings" element={
                                    <PrivateRoute>
                                        <MyBookings />
                                    </PrivateRoute>
                                } />
                                <Route path="/profile" element={
                                    <PrivateRoute>
                                        <UserProfile />
                                    </PrivateRoute>
                                } />
                                <Route path="/admin/studios" element={
                                    <PrivateRoute roles={['super_admin']}>
                                        <StudioList />
                                    </PrivateRoute>
                                } />
                            </Routes>
                            <Toaster position="top-right" />
                        </div>
                    </ThemeProvider>
                </LocationProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;
