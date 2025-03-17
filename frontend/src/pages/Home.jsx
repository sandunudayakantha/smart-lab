import React from 'react'
import CreateTemplate from './createTemplate'
import { useNavigate } from 'react-router-dom'

const Home = () => {
  const navigate = useNavigate();

  // Step 2: Define the click handler
  const handleCreateTemplateClick = () => {
    navigate("/templates"); // Navigate to the `/templates` route
  };


  return (
    <div className="bg-blue-100 p-6">
      <h1 className="text-2xl font-bold text-blue-500">Welcome to the Home Page!</h1>
      <p className="mt-4 text-gray-700">This is the Home component.</p>

     
      <button
        onClick={handleCreateTemplateClick}
        className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        Create Template
      </button>
    </div>
  )
}

export default Home
