
//import { Route } from "lucide-react"
import React from "react"
import { Route, Routes } from "react-router-dom"
import Home from "./pages/Home"
import CreateTemplate from "./pages/Templates/CreateTemplate"
import TestTemplates from "./pages/Templates/TestTemplates"
import UpdateTemplate from "./pages/Templates/UpdateTemplate"
import Reports from "./pages/Reports/Reports"
import CreateReport from "./pages/Reports/CreateReport"
import Navbar from "./components/Navbar"
import Sidebar from "./components/Sidebar"
import AllReports from "./pages/Reports/AllReports"
import ReportView from "./pages/Reports/ReportView"

import Dashboard from "./pages/Inventory/Dashboard";
import AddItem from "./pages/Inventory/AddItem";
import EditItem from "./pages/Inventory/EditItem";

function App() {


  return (
    
      <div>

        <Navbar/>
        <div className="flex" >

          <div><Sidebar/></div>
          <div className="w-full h-full">
          <Routes>
            <Route path="/" element={<Home/>} />

            <Route path="/templates" element={<CreateTemplate/>} />

            <Route path="/alltemplates" element={<TestTemplates/>} />
            <Route path="/update-template/:id" element={<UpdateTemplate />} />

            <Route path="/reports" element={<Reports/>} />

            <Route path="/create-report/:id" element={<CreateReport/>} />

            <Route path="/allreports" element={<AllReports/>} />


            <Route path="/reports/:id" element={<ReportView />} />


            {/* Inventory-related routes */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/AddItem" element={<AddItem />} />
            <Route path="/edit/:itemID" element={<EditItem />} />





          </Routes>
          </div>
           
            
          


        </div>
         


       

       
      </div>
     
   
  )
}

export default App
