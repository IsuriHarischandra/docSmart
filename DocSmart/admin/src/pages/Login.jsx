import axios from 'axios'
import React, { useContext, useState } from 'react'
import { DoctorContext } from '../context/DoctorContext'
import { AdminContext } from '../context/AdminContext'
import { toast } from 'react-toastify'
import { FaEye, FaEyeSlash } from 'react-icons/fa'

const Login = () => {
  const [state, setState] = useState('Admin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  
  const backendUrl = import.meta.env.VITE_BACKEND_URL
  const { setDToken } = useContext(DoctorContext)
  const { setAToken } = useContext(AdminContext)

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    try {
      if (state === 'Admin') {
        const { data } = await axios.post(backendUrl + '/api/admin/login', { email, password })
        if (data.success) {
          setAToken(data.token)
          localStorage.setItem('aToken', data.token)
        } else {
          toast.error(data.message)
        }
      } else {
        const { data } = await axios.post(backendUrl + '/api/doctor/login', { email, password })
        if (data.success) {
          setDToken(data.token)
          localStorage.setItem('dToken', data.token)
        } else {
          toast.error(data.message)
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <form onSubmit={onSubmitHandler} className='min-h-[80vh] flex items-center'>
      <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-[#5E5E5E] text-sm shadow-lg'>
        <p className='text-2xl font-semibold m-auto'><span className='text-[#1F2B5B]'>{state}</span> Login</p>
        
        <div className='w-full'>
          <p>Email</p>
          <input 
            onChange={(e) => setEmail(e.target.value)} 
            value={email} 
            className='border border-[#DADADA] rounded w-full p-2 mt-1' 
            type="email" 
            required 
          />
        </div>
        
        <div className='w-full relative'>
          <p>Password</p>
          <input 
            onChange={(e) => setPassword(e.target.value)} 
            value={password} 
            className='border border-[#DADADA] rounded w-full p-2 mt-1 pr-10' 
            type={showPassword ? "text" : "password"} 
            required 
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-3 top-9 text-gray-500 focus:outline-none"
          >
            {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
          </button>
        </div>
        
        <button className='bg-[#1F2B5B] text-white w-full py-2 rounded-md text-base hover:bg-primary-dark transition-colors'>
          Login
        </button>
        
        {
          state === 'Admin'
            ? <p>Doctor Login? <span onClick={() => setState('Doctor')} className='text-primary underline cursor-pointer hover:text-primary-dark'>Click here</span></p>
            : <p>Admin Login? <span onClick={() => setState('Admin')} className='text-primary underline cursor-pointer hover:text-primary-dark'>Click here</span></p>
        }
      </div>
    </form>
  )
}

export default Login