import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LocationProvider } from './context/LocationContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import StudioDetails from './pages/StudioDetails';
import EditStudio from './pages/EditStudio';
import MyBookings from './pages/MyBookings';
import AdminDashboard from './pages/AdminDashboard';
import UserProfile from './pages/UserProfile';
import { Toaster } from 'react-hot-toast';

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
                            </Layout>
                        </div>
                    </Router>
                </LocationProvider>
            </ThemeProvider>
        </AuthProvider>
    );
}

export default App;
