import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Clients from './pages/Clients';
import Bookings from './pages/Bookings';
import Templates from './pages/Templates';
import Tasks from './pages/Tasks';
import Help from './pages/Help';
import { NAV_ITEMS } from './constants';

const AppLayout: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        setSidebarOpen(false); // Close sidebar on navigation on mobile
    }, [location.pathname]);

    const findCurrentPage = () => {
        // Find the most specific match for nested routes.
        const matchingPaths = NAV_ITEMS.filter(item => item.path !== '/' && location.pathname.startsWith(item.path));
        if (matchingPaths.length > 0) {
            return matchingPaths.reduce((a, b) => a.path.length > b.path.length ? a : b);
        }
        // Default to dashboard for "/" or no other match
        return NAV_ITEMS.find(item => item.path === '/');
    };

    const currentPage = findCurrentPage();
    const pageTitle = currentPage ? currentPage.name : 'Dashboard';

    return (
        <div className="flex h-screen overflow-hidden bg-slate-100 dark:bg-slate-900">
            <Sidebar isSidebarOpen={isSidebarOpen} onLogout={onLogout} />
            <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden md:ml-64">
                <Header title={pageTitle} onMenuClick={() => setSidebarOpen(!isSidebarOpen)} />
                <main className="flex-grow">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

const ProtectedRoute: React.FC<{ isAuthenticated: boolean; children: React.ReactElement }> = ({ isAuthenticated, children }) => {
    const location = useLocation();
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    return children;
};

const App: React.FC = () => {
    // Initialize auth state from localStorage for session persistence
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('authToken'));

    const handleLogin = () => setIsAuthenticated(true);
    const handleRegister = () => setIsAuthenticated(true);
    const handleLogout = () => {
        localStorage.removeItem('authToken');
        setIsAuthenticated(false);
    };

    return (
        <HashRouter>
            <Routes>
                <Route path="/login" element={!isAuthenticated ? <Login onLoginSuccess={handleLogin} /> : <Navigate to="/" />} />
                <Route path="/register" element={!isAuthenticated ? <Register onRegisterSuccess={handleRegister} /> : <Navigate to="/" />} />
                
                <Route 
                    element={
                        <ProtectedRoute isAuthenticated={isAuthenticated}>
                           <AppLayout onLogout={handleLogout} />
                        </ProtectedRoute>
                    }
                >
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/clients" element={<Clients />} />
                    <Route path="/bookings" element={<Bookings />} />
                    <Route path="/templates" element={<Templates />} />
                    <Route path="/tasks" element={<Tasks />} />
                    <Route path="/help" element={<Help />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
            </Routes>
        </HashRouter>
    );
};

export default App;