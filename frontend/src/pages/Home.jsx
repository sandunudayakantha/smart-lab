import React from 'react'
import CreateTemplate from './Templates/CreateTemplate'
import { useNavigate } from 'react-router-dom'

const Home = () => {
  const navigate = useNavigate();

  // Step 2: Define the click handler
  const handleCreateTemplateClick = () => {
    navigate("/templates"); // Navigate to the `/templates` route
  };

  const handleManageTemplateClick = () => {
    navigate("/alltemplates"); // Navigate to the `/templates` route
  };

  const handleManageReportClick = () => {
    navigate("/reports"); // Navigate to the `/templates` route
  };


  return (
    <div className="bg-blue">
      <h1 className="text-2xl font-bold text-blue-500">Welcome to Smart Lab</h1>
      <p className="mt-4 text-gray-700">Dashboard Overview</p>

     
      
    </div>
  )
}

export default Home
