import { useState } from 'react'
import './App.css'
import AuthPage from './pages/AuthPage.tsx'
import { Routes, Route } from "react-router-dom"

function App() {
  return (
    <Routes>
      <Route path="/" element={<AuthPage />} />
    </Routes>
  )
}

export default App
