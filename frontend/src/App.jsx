import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import  {Routes, Route} from 'react-router-dom'
import { Rating } from './../../backend/src/domain/review/Rating';
import Home from './components/home/Home'
import RegisterPage from './pages/RegisterPage'
import LoginPage from './pages/Login'
import { DriverDashboard } from './pages/DriverDashboard'
import { RideRatingPage } from './pages/RideRatingPage'
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <Routes>

      <Route path='/' element={<Home />} />
      <Route path='/register' element={<RegisterPage />} />
      <Route path='/login' element={<LoginPage />} />
      <Route path='/driverDashboard' element={<DriverDashboard />} />
      <Route path='/rating' element={<RideRatingPage />} />

    </Routes> 
     
    </>
  )
}

export default App
