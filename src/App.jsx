import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/src/Layout';

// Lazy load pages for better performance
const Dashboard = lazy(() => import('@/Pages/Dashboard'));
const GameModes = lazy(() => import('@/Pages/GameModes'));
const GameSession = lazy(() => import('@/Pages/GameSession'));
const LevelCreator = lazy(() => import('@/Pages/LevelCreator'));
const Profile = lazy(() => import('@/Pages/Profile'));
const AdminDashboard = lazy(() => import('@/Pages/AdminDashboard'));
const CommunityLevels = lazy(() => import('@/Pages/CommunityLevels'));
const Settings = lazy(() => import('@/Pages/Settings'));

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-white text-lg">Loading...</div>
  </div>
);

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/dashboard"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <Dashboard />
              </Suspense>
            }
          />
          <Route
            path="/game-modes"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <GameModes />
              </Suspense>
            }
          />
          <Route
            path="/game-session"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <GameSession />
              </Suspense>
            }
          />
          <Route
            path="/level-creator"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <LevelCreator />
              </Suspense>
            }
          />
          <Route
            path="/profile"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <Profile />
              </Suspense>
            }
          />
          <Route
            path="/admin"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <AdminDashboard />
              </Suspense>
            }
          />
          <Route
            path="/community-levels"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <CommunityLevels />
              </Suspense>
            }
          />
          <Route
            path="/settings"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <Settings />
              </Suspense>
            }
          />
        </Route>
      </Routes>
    </Router>
  );
}
