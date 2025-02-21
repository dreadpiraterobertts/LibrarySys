import React from 'react'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import LoanManagement from './pages/LoanManagement'
import {BrowserRouter,Routes,Route,Navigate} from 'react-router-dom'
import Books from './pages/Books'
import Users from './pages/Users'
import IssueLoan from './forms/IssueLoan'


const App = () => {
  return (
    <div>
      <BrowserRouter>
      <Navbar/>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path='/loan' element = {<LoanManagement/>}/>
        <Route path='/book' element = {<Books/>}/>
        <Route path='/user' element = {<Users/>}/>
        <Route path='issue' element = {<IssueLoan/>}/>
      </Routes>
      
      </BrowserRouter>
     
      
    </div>
  )
}

export default App