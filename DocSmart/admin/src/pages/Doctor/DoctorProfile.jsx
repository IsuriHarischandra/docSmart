import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DoctorContext } from '../../context/DoctorContext'
import { AppContext } from '../../context/AppContext'
import { toast } from 'react-toastify'
import axios from 'axios'

const DoctorProfile = () => {
    const { dToken, profileData, setProfileData, getProfileData } = useContext(DoctorContext)
    const { currency, backendUrl } = useContext(AppContext)
    const [isEdit, setIsEdit] = useState(false)
    const [errors, setErrors] = useState({
        addressLine1: '',
        addressLine2: '',
        about: ''
    })
    const navigate = useNavigate()

    // Validation functions
    const validateAddress = (value) => {
        if (!value.trim()) return 'Address is required'
        if (value.length < 10) return 'Address must be at least 10 characters'
        if (value.length > 255) return 'Address must be less than 255 characters'
        if (!/^[a-zA-Z0-9\s,.-]*$/.test(value)) return 'Address can only contain letters, numbers, spaces, commas, and periods'
        return ''
    }

    const validateAbout = (value) => {
        if (!value.trim()) return 'About information is required'
        const wordCount = value.trim().split(/\s+/).length
        if (wordCount > 255) return 'About must be less than 255 words'
        return ''
    }

    const handleAddressLine1Change = (e) => {
        const value = e.target.value
        setProfileData(prev => ({ ...prev, address: { ...prev.address, line1: value } }))
        setErrors({...errors, addressLine1: validateAddress(value)})
    }

    const handleAddressLine2Change = (e) => {
        const value = e.target.value
        setProfileData(prev => ({ ...prev, address: { ...prev.address, line2: value } }))
        setErrors({...errors, addressLine2: validateAddress(value)})
    }

    const handleAboutChange = (e) => {
        const value = e.target.value
        setProfileData(prev => ({ ...prev, about: value }))
        setErrors({...errors, about: validateAbout(value)})
    }

    const hasErrors = () => {
        return Object.values(errors).some(error => error !== '') || 
               !profileData?.address?.line1 || 
               !profileData?.address?.line2 || 
               !profileData?.about
    }

    const updateProfile = async () => {
        // Validate all fields before submission
        const validationErrors = {
            addressLine1: validateAddress(profileData?.address?.line1 || ''),
            addressLine2: validateAddress(profileData?.address?.line2 || ''),
            about: validateAbout(profileData?.about || '')
        }
        
        setErrors(validationErrors)

        if (Object.values(validationErrors).some(error => error !== '')) {
            return
        }

        try {
            const updateData = {
                address: profileData.address,
                fees: profileData.fees,
                about: profileData.about,
                available: profileData.available
            }

            const { data } = await axios.post(backendUrl + '/api/doctor/update-profile', updateData, { headers: { dToken } })

            if (data.success) {
                toast.success(data.message)
                setIsEdit(false)
                getProfileData()
            } else {
                toast.error(data.message)
            }

            setIsEdit(false)
        } catch (error) {
            toast.error(error.message)
            console.log(error)
        }
    }

    const handleDeleteProfile = () => {
        if (window.confirm('Are you sure you want to delete your profile? This action cannot be undone.')) {
            // Clear profile data from frontend only
            setProfileData(null)
            toast.success('Profile Successfully Deleted')
            navigate('/') // Navigate to home page
        }
    }

    useEffect(() => {
        if (dToken) {
            getProfileData()
        }
    }, [dToken])

    return profileData && (
        <div>
            <div className='flex flex-col gap-4 m-5'>
                <div>
                    <img className='bg-primary/80 w-full sm:max-w-64 rounded-lg' src={profileData.image} alt="" />
                </div>

                <div className='flex-1 border border-stone-100 rounded-lg p-8 py-7 bg-white'>
                    {/* ----- Doc Info : name, degree, experience ----- */}
                    <p className='flex items-center gap-2 text-3xl font-medium text-gray-700'>{profileData.name}</p>
                    <div className='flex items-center gap-2 mt-1 text-gray-600'>
                        <p>{profileData.degree} - {profileData.speciality}</p>
                        <button className='py-0.5 px-2 border text-xs rounded-full'>{profileData.experience}</button>
                    </div>

                    {/* ----- Doc About ----- */}
                    <div>
                        <p className='flex items-center gap-1 text-sm font-medium text-[#262626] mt-3'>About :</p>
                        {
                            isEdit ? (
                                <>
                                    <textarea 
                                        onChange={handleAboutChange} 
                                        className={`w-full outline-primary p-2 ${errors.about ? 'border border-red-500' : ''}`} 
                                        rows={8} 
                                        value={profileData.about} 
                                    />
                                    {errors.about && <p className="text-red-500 text-sm mt-1">{errors.about}</p>}
                                </>
                            ) : (
                                <p className='text-sm text-gray-600 max-w-[700px] mt-1'>
                                    {profileData.about}
                                </p>
                            )
                        }
                    </div>

                    <p className='text-gray-600 font-medium mt-4'>
                        Appointment fee: <span className='text-gray-800'>
                            {currency} {
                                isEdit ? (
                                    <input 
                                        type='number' 
                                        onChange={(e) => setProfileData(prev => ({ ...prev, fees: e.target.value }))} 
                                        value={profileData.fees} 
                                        className="border rounded px-2 py-1 w-24"
                                    />
                                ) : (
                                    profileData.fees
                                )
                            }
                        </span>
                    </p>

                    <div className='flex gap-2 py-2'>
                        <p>Address:</p>
                        <div className='text-sm'>
                            {isEdit ? (
                                <>
                                    <input 
                                        type='text' 
                                        onChange={handleAddressLine1Change} 
                                        value={profileData.address.line1} 
                                        className={`w-full mb-1 ${errors.addressLine1 ? 'border border-red-500' : ''}`}
                                    />
                                    {errors.addressLine1 && <p className="text-red-500 text-sm">{errors.addressLine1}</p>}
                                    <input 
                                        type='text' 
                                        onChange={handleAddressLine2Change} 
                                        value={profileData.address.line2} 
                                        className={`w-full mt-2 ${errors.addressLine2 ? 'border border-red-500' : ''}`}
                                    />
                                    {errors.addressLine2 && <p className="text-red-500 text-sm">{errors.addressLine2}</p>}
                                </>
                            ) : (
                                <>
                                    {profileData.address.line1}
                                    <br />
                                    {profileData.address.line2}
                                </>
                            )}
                        </div>
                    </div>

                    <div className='flex gap-1 pt-2'>
                        <input 
                            type="checkbox" 
                            onChange={() => isEdit && setProfileData(prev => ({ ...prev, available: !prev.available }))} 
                            checked={profileData.available} 
                        />
                        <label htmlFor="">Available</label>
                    </div>

                    <div className="flex gap-3 mt-5">
                        {
                            isEdit ? (
                                <button 
                                    onClick={updateProfile} 
                                    className={`px-4 py-1 border border-primary text-sm rounded-full hover:bg-primary hover:text-white transition-all ${hasErrors() ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    disabled={hasErrors()}
                                >
                                    Save
                                </button>
                            ) : (
                                <>
                                    <button 
                                        onClick={() => setIsEdit(prev => !prev)} 
                                        className='px-4 py-1 border border-primary text-sm rounded-full hover:bg-primary hover:text-white transition-all'
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        onClick={handleDeleteProfile}
                                        className='px-4 py-1 border border-red-500 text-sm rounded-full hover:bg-red-500 hover:text-white transition-all'
                                    >
                                        Delete
                                    </button>
                                </>
                            )
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DoctorProfile