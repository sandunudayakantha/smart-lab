import React from 'react'
import { NavLink } from 'react-router-dom'

const Sidebar = () => {
  return (
    <div className='min-h-screen bg-white border-r'>
      


      <ul>
        
            
                <NavLink className='flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer $border-r-4  '
                to={"/"}
                >
                    
                    <p>Home</p>
                </NavLink>

                <NavLink className='flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer '
               
                >
                    
                    <p>Create Invoice</p>
                </NavLink>

                <NavLink className= 'flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer border-r-4'>
                    <p>Enter Results</p>
                </NavLink>

                <NavLink className= "flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer border-r-4 border-primary"
                to={"allreports"}>
                    
                    <p>Reports</p>
                </NavLink>

                <NavLink className= "flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer border-r-4 border-primary"
                to={"/dashboard"}>
                    
                    <p>Inventory</p>
                </NavLink>

                <NavLink className= "flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer border-r-4 border-primary"
                to={"/alltemplates"}>
                    
                    <p>Manage  Test Templates</p>
                </NavLink>

            </ul>
        





    </div>)
  
}

export default Sidebar
