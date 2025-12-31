import React from 'react';
import './App.css';
import { Routes , Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import Workhere from './pages/Workhere.jsx'
import Profile from './pages/Profile.jsx'
import Login from './components/Login.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

function App() {
  return (
    <AuthProvider>
      <div className="App min-h-screen w-full">
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="login" element={<Login />} />
            <Route path="workhere" element={
              <ProtectedRoute>
                <Workhere />
              </ProtectedRoute>
            } />
            <Route path="profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
          </Route>
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;