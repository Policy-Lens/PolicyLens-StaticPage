import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import RegistrationPage from './Components/Registration.jsx'
import LoginPage from './Components/login.jsx'
import AppLayout from './App.jsx'

createRoot(document.getElementById('root')).render(
  
  
  <StrictMode>
   {/* <RegistrationPage/> */}
   <AppLayout/>
  </StrictMode>,
)
