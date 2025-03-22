import React from 'react'

const Navbar = () => {
  return (
    
    <div className='flex items-center gap-2  justify-between'>
        
        <p className='border px-2.5 py-0.5 rounded-full border-gray-500 text-gray-600  '>Smart Lab</p>

        <button  className='bg-primary text-black text-sm px-10 py-2 rounded-full'>Logout</button>
    </div>
    

  )
}

export default Navbar
