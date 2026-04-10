import React from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Signup from './pages/Signup'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import History from './pages/History'
import Profile from './pages/Profile'
import Referrals from './pages/Referrals'
import Withdraw from './pages/Withdraw'
import Tasks from './pages/Tasks'
import DailyBonus from './pages/DailyBonus'
import DataAirtime from './pages/DataAirtime'
import Deposit from './pages/Deposit'
import Admin from './pages/Admin'

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/history" element={<History />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/referrals" element={<Referrals />} />
        <Route path="/withdraw" element={<Withdraw />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/daily-bonus" element={<DailyBonus />} />
        <Route path="/data-airtime" element={<DataAirtime />} />
        <Route path="/deposit" element={<Deposit />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </HashRouter>
  )
}

export default App
