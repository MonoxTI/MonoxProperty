import React from 'react'
import {Routes, Route} from 'react-router-dom'

import Prop from './Pages/Addprop.tsx'
import PropertyList from './Pages/AllProp.tsx'
import LeasesList from './Pages/AllLease.tsx'
import AllTenants from './Pages/AllTenant.tsx'
import PropertyByName from './Pages/GetProp.tsx'
import Register from './Pages/Register.tsx'
import Login from './Pages/Login.tsx'
import AddExpense from './Pages/AddExpense.tsx'
import AddLease from './Pages/AddLease.tsx'
import AddTenant from './Pages/AddTenant.tsx'
import ExpenseDetail from './Pages/GetExpense.tsx'
import GetLease from './Pages/GetLease.tsx'
import GetTenant from './Pages/GetTenant.tsx'
import DeleteProperty from './Pages/DeleteProp.tsx'
import DeleteTenant from './Pages/DeleteTenat.tsx'
import DeleteLease from './Pages/DeleteLease.tsx'
import DeleteExpense from './Pages/DeleteExpense.tsx'
import AddRentPayment from './Pages/Monthly.tsx'

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
        <Route path='/allLease' element={<LeasesList/>}/>
        <Route path='/allTenant' element={<AllTenants/>}/>
        <Route path='/getProp' element={<PropertyByName/>}/>
        <Route path='/getExpense' element={<ExpenseDetail/>}/>
        <Route path='/getLease' element={<GetLease/>}/>
        <Route path='/getTenant' element={<GetTenant/>}/>
        <Route path='/deleteProp' element={<DeleteProperty/>}/>
        <Route path='/deleteTenant' element={<DeleteTenant/>}/>
        <Route path='/deleteLease' element={<DeleteLease/>}/>
        <Route path='/deleteExpense' element={<DeleteExpense/>}/>
        <Route path='/register' element={<Register/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/add-rent-payment' element={<AddRentPayment/>}/>
      </Routes>
    </>
  )
}

export default App
