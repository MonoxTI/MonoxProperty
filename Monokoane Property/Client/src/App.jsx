import React from 'react'
import {Routes, Route} from 'react-router-dom'

import Prop from './Pages/prop.tsx'

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
      </Routes>
    </>
  )
}

export default App
