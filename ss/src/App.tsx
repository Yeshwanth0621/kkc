import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { ErrorBoundary } from './components/ui/ErrorBoundary'
import { Navbar } from './components/layout/Navbar'
import { Admin } from './pages/Admin'
import { CraftingGuide } from './pages/CraftingGuide'
import { Crafting } from './pages/Crafting'
import { Dashboard } from './pages/Dashboard'
import { Leaderboard } from './pages/Leaderboard'
import { Login } from './pages/Login'
import { Trade } from './pages/Trade'

function App() {
  return (
    <ErrorBoundary>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/crafting"
          element={
            <ProtectedRoute>
              <Crafting />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trade"
          element={
            <ProtectedRoute>
              <Trade />
            </ProtectedRoute>
          }
        />
        <Route path="/crafting-guide" element={<CraftingGuide />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <Admin />
            </ProtectedRoute>
          }
        />
        <Route path="/leaderboard" element={<Leaderboard />} />
      </Routes>
    </ErrorBoundary>
  )
}

export default App
