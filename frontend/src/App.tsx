import './App.css'
import AuthPage from './pages/AuthPage.tsx'
import { Routes, Route } from "react-router-dom"
import DashboardPage from './pages/DashboardPage.tsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<AuthPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
    </Routes>
  )
}

export default App
