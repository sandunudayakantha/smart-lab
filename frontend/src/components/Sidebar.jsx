import React from 'react'
import { NavLink } from 'react-router-dom'

const Sidebar = () => {
  return (
    <div className='min-h-screen bg-white border-r  '>
      


      <ul>
        
            
                <NavLink className='flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer $border-r-4 hover:bg-blue-100 '
                to={"/"}
                >
                    
                    <p>Home</p>
                </NavLink>

                <NavLink className='flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer hover:bg-blue-100'
               
                >
                    
                    <p>Create Invoice</p>
                </NavLink>

                <NavLink className= 'flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer border-r-4 hover:bg-blue-100'>
                    <p>Enter Results</p>
                </NavLink>

                <NavLink className= "flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer border-r-4 border-primary hover:bg-blue-100 "
                to={"allreports"}>
                    
                    <p>Reports</p>
                </NavLink>

                <NavLink className= "flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer border-r-4 border-primary hover:bg-blue-100 "
                to={"/dashboard"}>
                    
                    <p>Inventory</p>
                </NavLink>

                <NavLink className= "flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer border-r-4 border-primary hover:bg-blue-100 "
                to={"/alltemplates"}>
                    
                    <p>Manage  Test Templates</p>
                </NavLink>

            </ul>
        





    </div>)
  
}

export default Sidebar
