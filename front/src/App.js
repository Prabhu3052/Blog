import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './Context/AuthContext';
import Navbar from './Components/Navbar';
import LoadingSpinner from './Components/Loadspinner';
import { AnimatePresence } from 'framer-motion';
import './App.css';

// Lazy load pages for better performance
const Home = lazy(() => import('./Pages/Home'));
const Login = lazy(() => import('./Pages/Login'));
const Signup = lazy(() => import('./Pages/Signup'));
const Blogs = lazy(() => import('./Pages/Blogs'));
const BlogDetails = lazy(() => import('./Pages/BlogDetails'));
const CreateBlog = lazy(() => import('./Pages/CreateBlog'));
const EditBlog = lazy(() => import('./Pages/EditBlog'));
const Profile = lazy(() => import('./Pages/Profile'));

// Protected Route Component
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

// Public Only Route Component
function PublicOnlyRoute({ children }) {
  const { user } = useAuth();
  return !user ? children : <Navigate to="/" replace />;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app-container">
          <Navbar />
          
          <Suspense fallback={<LoadingSpinner fullPage />}>
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<Home />} />
                
                {/* Public only routes */}
                <Route path="/login" element={
                  <PublicOnlyRoute>
                    <Login />
                  </PublicOnlyRoute>
                } />
                <Route path="/signup" element={
                  <PublicOnlyRoute>
                    <Signup />
                  </PublicOnlyRoute>
                } />
                
                {/* Protected routes */}
                <Route path="/blogs" element={<Blogs />} />
                <Route path="/blogs/:id" element={<BlogDetails />} />
                <Route path="/create" element={
                  <PublicOnlyRoute>
                    <CreateBlog />
                  </PublicOnlyRoute>
                } />
                <Route path="/edit/:id" element={
                  <PublicOnlyRoute>
                    <EditBlog />
                  </PublicOnlyRoute>
                } />
                <Route path="/profile" element={
                  <PublicOnlyRoute>
                    <Profile />
                  </PublicOnlyRoute>
                } />
                
                {/* 404 fallback */}
                <Route path="*" element={
                  <div className="not-found">
                    <h1>404 - Page Not Found</h1>
                    <p>The page you're looking for doesn't exist.</p>
                  </div>
                } />
              </Routes>
            </AnimatePresence>
          </Suspense>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;