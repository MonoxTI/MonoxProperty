import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Prop from './Pages/Addprop.tsx';
import PropertyList from './Pages/AllProp.tsx';
import LeasesList from './Pages/AllLease.tsx';
import AllTenants from './Pages/AllTenant.tsx';
import Register from './Pages/Register.tsx';
import Login from './Pages/Login.tsx';
import AddExpense from './Pages/AddExpense.tsx';
import AddLease from './Pages/AddLease.tsx';
import AddTenant from './Pages/AddTenant.tsx';
import LeasesManagement from './Pages/GetLease.tsx';
import TenantsManagement from './Pages/GetTenant.tsx';
import PropertiesManagement from './Pages/DeleteProp.tsx';
import ExpenseLookupDelete from './Pages/DeleteExpense.tsx';
import RecordPayment from './Pages/Monthly.tsx';
import HomeDashboard from './Pages/Home.tsx';
import PropReport from './Pages/PropReport.tsx';
import PropertyDetail from './Pages/Propertydetail.tsx';

function App() {
  return (
    <>
      <Routes>
        {/* Default route — shows login page */}
        <Route path='/' element={<Login />} />

        {/* Other routes */}
        <Route path='/add-property' element={<Prop />} />
        <Route path='/add-expense' element={<AddExpense />} />
        <Route path='/add-lease' element={<AddLease />} />
        <Route path='/add-tenant' element={<AddTenant />} />
        <Route path='/Lease' element={<LeasesManagement />} />
        <Route path='/Tenant' element={<TenantsManagement />} />
        <Route path='/Property' element={<PropertiesManagement />} />
        <Route path='/deleteExpense' element={<ExpenseLookupDelete />} />
        <Route path='/register' element={<Register />} />
        <Route path='/login' element={<Login />} />
        <Route path='/add-rent-payment' element={<RecordPayment />} />
        <Route path='/home' element={<HomeDashboard />} />
        <Route path='/reports' element={<PropReport />} />
        <Route path='/properties/:propertyName' element={<PropertyDetail />} />
      </Routes>
    </>
  );
}

export default App;