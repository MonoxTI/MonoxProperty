import React from 'react'
import {Routes, Route, Link} from 'react-router-dom'

import Prop from './Pages/Addprop.tsx'
import PropertyList from './Pages/AllProp.tsx'
import LeasesList from './Pages/AllLease.tsx'
import AllTenants from './Pages/AllTenant.tsx'
import Register from './Pages/Register.tsx'
import Login from './Pages/Login.tsx'
import AddExpense from './Pages/AddExpense.tsx'
import AddLease from './Pages/AddLease.tsx'
import AddTenant from './Pages/AddTenant.tsx'
import LeasesManagement from './Pages/GetLease.tsx'
import TenantsManagement from './Pages/GetTenant.tsx'
import PropertiesManagement from './Pages/DeleteProp.tsx'
import ExpenseLookupDelete from './Pages/DeleteExpense.tsx'
import RecordPayment from './Pages/Monthly.tsx'
import HomeDashboard from './Pages/Home.tsx'



function App() {
  return (
    <>
      <Routes>
        <Route path='/add-property' element={<Prop/>}/>{/* Done */}
        <Route path='/add-expense' element={<AddExpense/>}/>{/* Done */}
        <Route path='/add-lease' element={<AddLease/>}/>{/* Done */}
        <Route path='/add-tenant' element={<AddTenant/>}/>{/* Done */}
        <Route path='/Lease' element={<LeasesManagement/>}/>{/* Done */}
        <Route path='/Tenant' element={<TenantsManagement/>}/>{/* Done */}
        <Route path='/Property' element={<PropertiesManagement/>}/>{/* Done */}
        <Route path='/deleteExpense' element={<ExpenseLookupDelete/>}/>{/* Done */}
        <Route path='/register' element={<Register/>}/>{/* Done */}
        <Route path='/login' element={<Login/>}/>{/* Done */}
        <Route path='/add-rent-payment' element={<RecordPayment/>}/>{/* Done */}
        <Route path='/home' element={<HomeDashboard/>}/>{/* Done */}
      </Routes>
    </>
  )
}

export default App;