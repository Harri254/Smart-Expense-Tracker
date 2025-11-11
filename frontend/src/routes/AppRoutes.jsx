import React from 'react'
import { Routes, Route } from 'react-router-dom'
import LandingLayout from '../layouts/LandingLayout'
import AuthLayout from '../layouts/AuthLayout'
import DashboardLayout from '../layouts/DashboardLayout'
import ProtectedRoute from '../components/layout/ProtectedRoute'

import Home from '../pages/Home'
import Register from '../pages/Register'
import Login from '../pages/Login'
import Dashboard from '../pages/Dashboard'
import AddTransaction from '../pages/AddExpense'
import Analytics from '../pages/Analytics'
import Settings from '../pages/Settings'

export default function AppRoutes(){
  return (
    <Routes>
      <Route path="/" element={<LandingLayout><Home/></LandingLayout>} />
      <Route path="/register" element={<AuthLayout><Register/></AuthLayout>} />
      <Route path="/login" element={<AuthLayout><Login/></AuthLayout>} />

      <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout><Dashboard/></DashboardLayout></ProtectedRoute>} />
      <Route path="/add" element={<ProtectedRoute><DashboardLayout><AddTransaction/></DashboardLayout></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><DashboardLayout><Analytics/></DashboardLayout></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><DashboardLayout><Settings/></DashboardLayout></ProtectedRoute>} />
    </Routes>
  )
}
