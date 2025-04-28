import React from 'react'
import logo from '../assets/logo.png'

const Navbar = () => {
  return (
    <div className='flex items-center gap-2 justify-between'>
        
      {/* Logo Image placed next to Smart Lab text */}
      <div className="flex items-center gap-2">
        <img src={logo} alt="Smart Lab Logo" className="h-8 w-6" /> {/* Adjust size as needed */}
        <p className='border px-2.5 py-0.5 rounded-full border-gray-500 text-gray-600'>
          Smart Lab
        </p>
      </div>

      <button className='bg-primary text-black text-sm px-10 py-2 rounded-full'>
        Logout
      </button>
    </div>
  )
}

export default Navbar
