import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { FaEye, FaEyeSlash } from 'react-icons/fa'

const Login = () => {
  const [state, setState] = useState('Sign Up')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const { backendUrl, token, setToken } = useContext(AppContext)

  const onSubmitHandler = async (event) => {
    event.preventDefault()
    
    try {
      let response;
      
      if (state === 'Sign Up') {
        response = await axios.post(`${backendUrl}/api/user/register`, { name, email, password });
      } else {
        response = await axios.post(`${backendUrl}/api/user/login`, { email, password });
      }

      const { data } = response;

      if (data.success) {
        localStorage.setItem('token', data.token);
        setToken(data.token);

        if (state === 'Sign Up') {
          navigate('/login'); // Ensure navigation after signup
        } else {
          navigate('/'); // Ensure navigation after login
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
      console.error(error);
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  }

  useEffect(() => {
    if (token && state === 'Login') {
      navigate('/');
    }
  }, [token, state, navigate]);

  return (
    <form onSubmit={onSubmitHandler} className='min-h-[80vh] flex items-center'>
      <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-[#5E5E5E] text-sm shadow-lg'>
        <p className='text-2xl font-semibold'>{state === 'Sign Up' ? 'Create Account' : 'Login'}</p>
        <p>Please {state === 'Sign Up' ? 'sign up' : 'log in'} to book an appointment</p>
        
        {state === 'Sign Up' && (
          <div className='w-full'>
            <p>Full Name</p>
            <input 
              onChange={(e) => setName(e.target.value)} 
              value={name} 
              className='border border-[#DADADA] rounded w-full p-2 mt-1' 
              type="text" 
              required 
            />
          </div>
        )}
        
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
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
          </button>
        </div>
        
        <button className='bg-[#1F2B5B] text-white w-full py-2 my-2 rounded-md text-base hover:bg-primary-dark transition-colors'>
          {state === 'Sign Up' ? 'Create account' : 'Login'}
        </button>

        {state === 'Sign Up'
          ? <p>Already have an account? <span onClick={() => setState('Login')} className='text-primary underline cursor-pointer hover:text-primary-dark'>Login here</span></p>
          : <p>Create a new account? <span onClick={() => setState('Sign Up')} className='text-primary underline cursor-pointer hover:text-primary-dark'>Click here</span></p>
        }
      </div>
    </form>
  )
}

export default Login