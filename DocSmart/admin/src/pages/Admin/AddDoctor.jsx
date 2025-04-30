import React, { useContext, useState } from 'react'
import { assets } from '../../assets/assets'
import { toast } from 'react-toastify'
import axios from 'axios'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'
import { FaEye, FaEyeSlash } from 'react-icons/fa'

const AddDoctor = () => {
    const [docImg, setDocImg] = useState(false)
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [experience, setExperience] = useState('1 Year')
    const [fees, setFees] = useState('')
    const [about, setAbout] = useState('')
    const [speciality, setSpeciality] = useState('General physician')
    const [degree, setDegree] = useState('')
    const [address1, setAddress1] = useState('')
    const [address2, setAddress2] = useState('')
    
    // Validation states
    const [errors, setErrors] = useState({
        name: '',
        email: '',
        password: '',
        address1: '',
        address2: '',
        degree: '',
        fees: ''
    })

    const { backendUrl } = useContext(AppContext)
    const { aToken } = useContext(AdminContext)

    // Validation functions
    const validateName = (value) => {
        if (!value.trim()) return 'Name is required'
        if (!/^[a-zA-Z\s]*$/.test(value)) return 'Name should not contain special characters'
        return ''
    }

    const validateEmail = (value) => {
        if (!value.trim()) return 'Email is required'
        if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) return 'Invalid email format'
        return ''
    }

    const validatePassword = (value) => {
        if (!value.trim()) return 'Password is required'
        if (value.length < 8) return 'Password must be at least 8 characters'
        if (value.length > 50) return 'Password must be less than 50 characters'
        return ''
    }

    const validateAddress = (value) => {
        if (!value.trim()) return 'Address is required'
        if (value.length < 10) return 'Address must be at least 10 characters'
        if (value.length > 255) return 'Address must be less than 255 characters'
        if (!/^[a-zA-Z0-9\s,.-]*$/.test(value)) return 'Address can only contain letters, numbers, spaces, commas, and periods'
        return ''
    }

    const validateDegree = (value) => {
        if (!value.trim()) return 'Degree is required'
        if (!/^[a-zA-Z\s.]*$/.test(value)) return 'Degree can only contain letters, spaces, and dots'
        return ''
    }

    const validateFees = (value) => {
        if (!value.trim()) return 'Fees is required'
        if (isNaN(value)) return 'Fees must be a number'
        return ''
    }

    // Handle input changes with validation
    const handleNameChange = (e) => {
        const value = e.target.value
        setName(value)
        setErrors({...errors, name: validateName(value)})
    }

    const handleEmailChange = (e) => {
        const value = e.target.value
        setEmail(value)
        setErrors({...errors, email: validateEmail(value)})
    }

    const handlePasswordChange = (e) => {
        const value = e.target.value
        setPassword(value)
        setErrors({...errors, password: validatePassword(value)})
    }

    const handleAddress1Change = (e) => {
        const value = e.target.value
        setAddress1(value)
        setErrors({...errors, address1: validateAddress(value)})
    }

    const handleAddress2Change = (e) => {
        const value = e.target.value
        setAddress2(value)
        setErrors({...errors, address2: validateAddress(value)})
    }

    const handleDegreeChange = (e) => {
        const value = e.target.value
        setDegree(value)
        setErrors({...errors, degree: validateDegree(value)})
    }

    const handleFeesChange = (e) => {
        const value = e.target.value
        setFees(value)
        setErrors({...errors, fees: validateFees(value)})
    }

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword)
    }

    const hasErrors = () => {
        return Object.values(errors).some(error => error !== '') || 
               !name || !email || !password || !address1 || !address2 || !degree || !fees || !docImg
    }

    const onSubmitHandler = async (event) => {
        event.preventDefault()

        // Validate all fields before submission
        const validationErrors = {
            name: validateName(name),
            email: validateEmail(email),
            password: validatePassword(password),
            address1: validateAddress(address1),
            address2: validateAddress(address2),
            degree: validateDegree(degree),
            fees: validateFees(fees)
        }
        
        setErrors(validationErrors)

        if (Object.values(validationErrors).some(error => error !== '') || !docImg) {
            if (!docImg) {
                toast.error('Doctor image is required')
            }
            return
        }

        try {
            const formData = new FormData();
            formData.append('image', docImg)
            formData.append('name', name)
            formData.append('email', email)
            formData.append('password', password)
            formData.append('experience', experience)
            formData.append('fees', Number(fees))
            formData.append('about', about)
            formData.append('speciality', speciality)
            formData.append('degree', degree)
            formData.append('address', JSON.stringify({ line1: address1, line2: address2 }))

            const { data } = await axios.post(backendUrl + '/api/admin/add-doctor', formData, { headers: { aToken } })
            if (data.success) {
                toast.success(data.message)
                setDocImg(false)
                setName('')
                setPassword('')
                setEmail('')
                setAddress1('')
                setAddress2('')
                setDegree('')
                setAbout('')
                setFees('')
                setErrors({
                    name: '',
                    email: '',
                    password: '',
                    address1: '',
                    address2: '',
                    degree: '',
                    fees: ''
                })
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
            console.log(error)
        }
    }

    return (
        <form onSubmit={onSubmitHandler} className='m-5 w-full'>
            <p className='mb-3 text-lg font-medium'>Add Doctor</p>

            <div className='bg-white px-8 py-8 border rounded w-full max-w-4xl max-h-[80vh] overflow-y-scroll'>
                <div className='flex items-center gap-4 mb-8 text-gray-500'>
                    <label htmlFor="doc-img">
                        <img className='w-16 bg-gray-100 rounded-full cursor-pointer' src={docImg ? URL.createObjectURL(docImg) : assets.upload_area} alt="" />
                    </label>
                    <input onChange={(e) => setDocImg(e.target.files[0])} type="file" name="" id="doc-img" hidden />
                    <p>Upload doctor <br /> picture</p>
                </div>

                <div className='flex flex-col lg:flex-row items-start gap-10 text-gray-600'>
                    <div className='w-full lg:flex-1 flex flex-col gap-4'>
                        <div className='flex-1 flex flex-col gap-1'>
                            <p>Your name</p>
                            <input 
                                onChange={handleNameChange} 
                                value={name} 
                                className={`border rounded px-3 py-2 ${errors.name ? 'border-red-500' : ''}`} 
                                type="text" 
                                placeholder='Name' 
                            />
                            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                        </div>

                        <div className='flex-1 flex flex-col gap-1'>
                            <p>Doctor Email</p>
                            <input 
                                onChange={handleEmailChange} 
                                value={email} 
                                className={`border rounded px-3 py-2 ${errors.email ? 'border-red-500' : ''}`} 
                                type="email" 
                                placeholder='Email' 
                            />
                            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                        </div>

                        <div className='flex-1 flex flex-col gap-1 relative'>
                            <p>Set Password</p>
                            <input 
                                onChange={handlePasswordChange} 
                                value={password} 
                                className={`border rounded px-3 py-2 ${errors.password ? 'border-red-500' : ''} pr-10`} 
                                type={showPassword ? "text" : "password"} 
                                placeholder='Password' 
                            />
                            <button
                                type="button"
                                onClick={togglePasswordVisibility}
                                className="absolute right-3 top-8 text-gray-500 focus:outline-none"
                            >
                                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                            </button>
                            {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
                        </div>

                        <div className='flex-1 flex flex-col gap-1'>
                            <p>Experience</p>
                            <select onChange={e => setExperience(e.target.value)} value={experience} className='border rounded px-2 py-2'>
                                <option value="1 Year">1 Year</option>
                                <option value="2 Year">2 Years</option>
                                <option value="3 Year">3 Years</option>
                                <option value="4 Year">4 Years</option>
                                <option value="5 Year">5 Years</option>
                                <option value="6 Year">6 Years</option>
                                <option value="8 Year">8 Years</option>
                                <option value="9 Year">9 Years</option>
                                <option value="10 Year">10 Years</option>
                            </select>
                        </div>

                        <div className='flex-1 flex flex-col gap-1'>
                            <p>Fees</p>
                            <input 
                                onChange={handleFeesChange} 
                                value={fees} 
                                className={`border rounded px-3 py-2 ${errors.fees ? 'border-red-500' : ''}`} 
                                type="number" 
                                placeholder='Doctor fees' 
                            />
                            {errors.fees && <p className="text-red-500 text-sm">{errors.fees}</p>}
                        </div>
                    </div>

                    <div className='w-full lg:flex-1 flex flex-col gap-4'>
                        <div className='flex-1 flex flex-col gap-1'>
                            <p>Speciality</p>
                            <select onChange={e => setSpeciality(e.target.value)} value={speciality} className='border rounded px-2 py-2'>
                                <option value="General physician">General physician</option>
                                <option value="Gynecologist">Gynecologist</option>
                                <option value="Dermatologist">Dermatologist</option>
                                <option value="Pediatricians">Pediatricians</option>
                                <option value="Neurologist">Neurologist</option>
                                <option value="Gastroenterologist">Gastroenterologist</option>
                            </select>
                        </div>

                        <div className='flex-1 flex flex-col gap-1'>
                            <p>Degree</p>
                            <input 
                                onChange={handleDegreeChange} 
                                value={degree} 
                                className={`border rounded px-3 py-2 ${errors.degree ? 'border-red-500' : ''}`} 
                                type="text" 
                                placeholder='Degree' 
                            />
                            {errors.degree && <p className="text-red-500 text-sm">{errors.degree}</p>}
                        </div>

                        <div className='flex-1 flex flex-col gap-1'>
                            <p>Address Line 1</p>
                            <input 
                                onChange={handleAddress1Change} 
                                value={address1} 
                                className={`border rounded px-3 py-2 ${errors.address1 ? 'border-red-500' : ''}`} 
                                type="text" 
                                placeholder='Address 1' 
                            />
                            {errors.address1 && <p className="text-red-500 text-sm">{errors.address1}</p>}
                        </div>

                        <div className='flex-1 flex flex-col gap-1'>
                            <p>Address Line 2</p>
                            <input 
                                onChange={handleAddress2Change} 
                                value={address2} 
                                className={`border rounded px-3 py-2 ${errors.address2 ? 'border-red-500' : ''}`} 
                                type="text" 
                                placeholder='Address 2' 
                            />
                            {errors.address2 && <p className="text-red-500 text-sm">{errors.address2}</p>}
                        </div>
                    </div>
                </div>

                <div>
                    <p className='mt-4 mb-2'>About Doctor</p>
                    <textarea 
                        onChange={e => setAbout(e.target.value)} 
                        value={about} 
                        className='w-full px-4 pt-2 border rounded' 
                        rows={5} 
                        placeholder='write about doctor'
                    ></textarea>
                </div>

                <button 
                    type='submit' 
                    className={`px-10 py-3 mt-4 text-white rounded-full ${hasErrors() ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#1F2B5B]'}`}
                    disabled={hasErrors()}
                >
                    Add doctor
                </button>
            </div>
        </form>
    )
}

export default AddDoctor