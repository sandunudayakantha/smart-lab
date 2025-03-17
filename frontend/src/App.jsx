
//import { Route } from "lucide-react"
import React from "react"
import { Route, Routes } from "react-router-dom"
import Home from "./pages/Home"
import CreateTemplate from "./pages/createTemplate"
import TestTemplates from "./pages/TestTemplates"

function App() {


  return (
    
      <div  >
       <Routes>
       <Route path="/" element={<Home/>} />

        <Route path="/templates" element={<CreateTemplate/>} />

        <Route path="/alltemplates" element={<TestTemplates/>} />
       </Routes>
      </div>
     
   
  )
}

export default App
