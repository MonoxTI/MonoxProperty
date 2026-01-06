import React from 'react'
import {Routes, Route} from 'react-router-dom'

import Prop from './Pages/Addprop.tsx'
import PropertyList from './Pages/AllProp.tsx'
import PropertyByName from './Pages/GetProp.tsx'
import Register from './Pages/Register.tsx'
import Login from './Pages/Login.tsx'
import AddExpense from './Pages/AddExpense.tsx'
import AddLease from './Pages/AddLease.tsx'
import AddTenant from './Pages/AddTenant.tsx'


function Header(){
  return (
    <>
  <h1>Monokoane Property</h1>
  </>
)}

function App() {
  return (
    <>
      <Routes>
        <Route path='/' element={<Header/>}/>
        <Route path='/add-property' element={<Prop/>}/>
        <Route path='/add-expense' element={<AddExpense/>}/>
        <Route path='/add-lease' element={<AddLease/>}/>
        <Route path='/add-tenant' element={<AddTenant/>}/>
        <Route path='/allProp' element={<PropertyList/>}/>
        <Route path='/getProp' element={<PropertyByName/>}/>
        <Route path='/register' element={<Register/>}/>
        <Route path='/login' element={<Login/>}/>
      </Routes>
    </>
  )
}

export default App
