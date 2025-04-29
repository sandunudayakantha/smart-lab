import React from 'react'
import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import slLogo from '../assets/slLogo.png'

const Navbar = () => {
    const navigate = useNavigate()

    const logout = () => {
        navigate('/')
        // Note: AdminContext implementation needed for these features
        // aToken && setAToken('')
        // aToken && localStorage.removeItem('aToken')
    } 

    return (
        <div className='flex justify-between items-center px-4 sm:px-10 py-3 border-b bg-white'>
            <div className='flex items-center gap-2 text-xs'>
                <img className='w-36 sm:w-40 cursor-pointer' src={slLogo} alt="Smart Lab Logo" />
                <p className='border px-2.5 py-0.5 rounded-full border-gray-500 text-gray-600'>Test</p>
            </div>
            <button onClick={logout} className='bg-primary text-white text-sm px-10 py-2 rounded-full'>
                Logout
            </button>
        </div>
    )
}

export default Navbar