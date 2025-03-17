
//import { Route } from "lucide-react"
import React from "react"
import { Route, Routes } from "react-router-dom"
import Home from "../pages/Home"
import createTemplate from "../pages/createTemplate"

function App() {


  return (
    
      <div>
       <Routes>
        <Route path="/" element={<Home/>} />

        <Route path="/templates" element={<createTemplate/>} />
       </Routes>
      </div>
     
   
  )
}

export default App
