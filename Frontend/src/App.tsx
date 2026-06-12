import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Splash from './screens/Splash'
import RoleSelect from './screens/RoleSelect'
import ParentAuth from './screens/parent/ParentAuth'
import AddChild from './screens/parent/AddChild'
import ChildCard from './screens/parent/ChildCard'
import Dashboard from './screens/parent/Dashboard'
import UploadBook from './screens/parent/UploadBook'
import Settings from './screens/parent/Settings'
import ChildLogs from './screens/parent/ChildLogs'
import PackReview from './screens/parent/PackReview'
import KidScan from './screens/kid/KidScan'
import KidHome from './screens/kid/KidHome'
import LevelMap from './screens/kid/LevelMap'
import Game from './screens/kid/Game'
import LevelComplete from './screens/kid/LevelComplete'
import Battle from './screens/kid/Battle'
import Leaderboard from './screens/kid/Leaderboard'
import Profile from './screens/kid/Profile'

export default function App() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22, ease: 'easeInOut' }}
      >
        <Routes location={location}>
          <Route path="/" element={<Splash />} />
          <Route path="/role" element={<RoleSelect />} />

          {/* Parent */}
          <Route path="/parent/auth" element={<ParentAuth />} />
          <Route path="/parent/add-child" element={<AddChild />} />
          <Route path="/parent/child/:id/card" element={<ChildCard />} />
          <Route path="/parent/dashboard" element={<Dashboard />} />
          <Route path="/parent/upload" element={<UploadBook />} />
          <Route path="/parent/settings" element={<Settings />} />
          <Route path="/parent/packs" element={<PackReview />} />
          <Route path="/parent/child/:id/logs" element={<ChildLogs />} />

          {/* Kid */}
          <Route path="/kid/scan" element={<KidScan />} />
          <Route path="/kid/home" element={<KidHome />} />
          <Route path="/kid/map/:packId" element={<LevelMap />} />
          <Route path="/kid/play/:packId/:seq" element={<Game />} />
          <Route path="/kid/complete" element={<LevelComplete />} />
          <Route path="/kid/battle" element={<Battle />} />
          <Route path="/kid/leaderboard" element={<Leaderboard />} />
          <Route path="/kid/profile" element={<Profile />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}
