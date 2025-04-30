import React, { useState } from 'react'
import { useContext } from 'react'
import { NavLink } from 'react-router-dom'

import home_icon from '../assets/home_icon.svg'
import appointment_icon from '../assets/appointment_icon.svg'
import add_icon from '../assets/add_icon.svg'
import people_icon from '../assets/people_icon.svg'
import list_icon from '../assets/list_icon.svg'

import ReceiptIcon from '@mui/icons-material/Receipt';


const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(true);

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className={`min-h-screen bg-white border-r transition-all duration-300 ${isOpen ? 'w-72' : 'w-20'}`}>
            <div className="flex justify-end p-4">
                <button
                    onClick={toggleSidebar}
                    className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
                >
                    <img 
                        src={list_icon} 
                        alt="toggle" 
                        className={`w-6 h-6 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    />
                </button>
            </div>
            
            <ul className='text-[#515151] mt-5'>
                <NavLink 
                    className={({isActive}) => 
                        `flex items-center gap-3 py-3.5 px-3 md:px-6 cursor-pointer 
                        ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}
                        ${!isOpen ? 'justify-center' : ''}`
                    } 
                    to={'/'}>
                    <img src={home_icon} alt="" className="w-6 h-6" />
                    <p className={`transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
                        Dashboard
                    </p>
                </NavLink>

                <NavLink 
                    className={({isActive}) => 
                        `flex items-center gap-3 py-3.5 px-3 md:px-6 cursor-pointer 
                        ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}
                        ${!isOpen ? 'justify-center' : ''}`
                    }
                    to={'/create-invoice'}>
                    <img src={appointment_icon} alt="" className="w-6 h-6" />
                    <p className={`transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
                        Create Invoice
                    </p>
                </NavLink>

                <NavLink 
                    className={({isActive}) => 
                        `flex items-center gap-3 py-3.5 px-3 md:px-6 cursor-pointer 
                        ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}
                        ${!isOpen ? 'justify-center' : ''}`
                    }
                    to={'/allreports'}>
                    <img src={add_icon} alt="" className="w-6 h-6" />
                    <p className={`transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
                        Reports
                    </p>
                </NavLink>

                <NavLink 
                    className={({isActive}) => 
                        `flex items-center gap-3 py-3.5 px-3 md:px-6 cursor-pointer 
                        ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}
                        ${!isOpen ? 'justify-center' : ''}`
                    }
                    to={'/dashboard'}>
                    <img src={people_icon} alt="" className="w-6 h-6" />
                    <p className={`transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
                        Inventory
                    </p>
                </NavLink>

                <NavLink 
                    className={({isActive}) => 
                        `flex items-center gap-3 py-3.5 px-3 md:px-6 cursor-pointer 
                        ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}
                        ${!isOpen ? 'justify-center' : ''}`
                    }
                    to={'/alltemplates'}>
                    <img src={people_icon} alt="" className="w-6 h-6" />
                    <p className={`transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
                        Manage Test Templates
                    </p>
                </NavLink>



                <NavLink className= "flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer border-r-4 border-primary hover:bg-blue-100 "
                to={"/invoices"}>
                    
                    <p>Invoice Manager</p>
                </NavLink>


            </ul>
        </div>
    )
}

export default Sidebar