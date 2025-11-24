import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import StudioDetails from './pages/StudioDetails';
import MyBookings from './pages/MyBookings';
import AdminDashboard from './pages/AdminDashboard';

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
                <Router>
                    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
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
                                <Route path="/" element={<Navigate to="/dashboard" />} />
                            </Routes>
                        </Layout>
                    </div>
                </Router>
            </ThemeProvider>
        </AuthProvider>
    );
}

export default App;
