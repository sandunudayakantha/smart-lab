
//import { Route } from "lucide-react"
import React from "react"
import { Route, Routes } from "react-router-dom"
import Home from "./pages/Home"
import CreateTemplate from "./pages/Templates/CreateTemplate"
import TestTemplates from "./pages/Templates/TestTemplates"
import UpdateTemplate from "./pages/Templates/UpdateTemplate"

function App() {


  return (
    
      <div  >
       <Routes>
       <Route path="/" element={<Home/>} />

        <Route path="/templates" element={<CreateTemplate/>} />

        <Route path="/alltemplates" element={<TestTemplates/>} />
        <Route path="/update-template/:id" element={<UpdateTemplate />} />
       </Routes>
      </div>
     
   
  )
}

export default App
