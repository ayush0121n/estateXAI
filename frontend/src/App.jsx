import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Properties from './pages/Properties';
import PropertyDetail from './pages/PropertyDetail';
import PGs from './pages/PGs';
import PGDetail from './pages/PGDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ListProperty from './pages/ListProperty';
import ListPG from './pages/ListPG';
import Profile from './pages/Profile';
import Compare from './pages/Compare';
import AIPredictor from './pages/AIPredictor';
import Roommates from './pages/Roommates';
import RentalToolkit from './pages/RentalToolkit';
import NotFound from './pages/NotFound';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#161933',
                color: '#ffffff',
                border: '1px solid rgba(201, 163, 94, 0.3)',
                borderRadius: '12px',
                fontSize: '14px',
              },
              success: { iconTheme: { primary: '#22d3a5', secondary: '#fff' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <main style={{ flex: 1 }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/properties" element={<Properties />} />
                <Route path="/properties/:id" element={<PropertyDetail />} />
                <Route path="/pgs" element={<PGs />} />
                <Route path="/pgs/:id" element={<PGDetail />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/compare" element={<Compare />} />
                <Route path="/ai-prediction" element={<AIPredictor />} />
                <Route path="/roommates" element={<Roommates />} />
                <Route path="/rental-toolkit" element={<RentalToolkit />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/list-property" element={<ProtectedRoute roles={['owner', 'admin']}><ListProperty /></ProtectedRoute>} />
                <Route path="/list-pg" element={<ProtectedRoute roles={['owner', 'admin']}><ListPG /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                {/* Route aliases – fix 404s for common alternative URLs */}
                <Route path="/signup" element={<Navigate to="/register" replace />} />
                <Route path="/find-flatmates" element={<Navigate to="/roommates" replace />} />
                <Route path="/pg-hostel" element={<Navigate to="/pgs" replace />} />
                <Route path="/ai-predictor" element={<Navigate to="/ai-prediction" replace />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
