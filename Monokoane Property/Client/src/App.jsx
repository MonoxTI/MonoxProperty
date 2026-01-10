import React from 'react'
import {Routes, Route} from 'react-router-dom'

import Prop from './Pages/Addprop.tsx'
import PropertyList from './Pages/AllProp.tsx'
import LeasesList from './Pages/AllLease.tsx'
import AllTenants from './Pages/AllTenant.tsx'
import Register from './Pages/Register.tsx'
import Login from './Pages/Login.tsx'
import AddExpense from './Pages/AddExpense.tsx'
import AddLease from './Pages/AddLease.tsx'
import AddTenant from './Pages/AddTenant.tsx'
import LeaseLookupDelete from './Pages/GetLease.tsx'
import TenantLookupDelete from './Pages/GetTenant.tsx'
import PropertyLookupDelete from './Pages/DeleteProp.tsx'
import ExpenseLookupDelete from './Pages/DeleteExpense.tsx'
import RecordPayment from './Pages/Monthly.tsx'
import HomeDashboard from './Pages/Home.tsx'

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
        
        <Route path='/add-property' element={<Prop/>}/>{/* Done */}
        <Route path='/add-expense' element={<AddExpense/>}/>{/* Done */}
        <Route path='/add-lease' element={<AddLease/>}/>{/* Done */}
        <Route path='/add-tenant' element={<AddTenant/>}/>{/* Done */}
        <Route path='/allProp' element={<PropertyList/>}/>{/* Done */}
        <Route path='/allLease' element={<LeasesList/>}/>{/* Done */}
        <Route path='/allTenant' element={<AllTenants/>}/>{/* Done */}
        <Route path='/getLease' element={<LeaseLookupDelete/>}/>{/* Done */}
        <Route path='/getTenant' element={<TenantLookupDelete/>}/>{/* Done */}
        <Route path='/deleteProp' element={<PropertyLookupDelete/>}/>{/* Done */}
        <Route path='/deleteExpense' element={<ExpenseLookupDelete/>}/>{/* Done */}
        <Route path='/register' element={<Register/>}/>{/* Done */}
        <Route path='/login' element={<Login/>}/>{/* Done */}
        <Route path='/add-rent-payment' element={<RecordPayment/>}/>{/* Done */}
        <Route path='/home' element={<HomeDashboard/>}/>{/* Done */}
      </Routes>
    </>
  )
}

export default App
