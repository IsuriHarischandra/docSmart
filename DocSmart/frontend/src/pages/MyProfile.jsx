import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { assets } from '../assets/assets';

const MyProfile = () => {
    const navigate = useNavigate();
    const [isEdit, setIsEdit] = useState(false);
    const [image, setImage] = useState(false);
    const [errors, setErrors] = useState({
        phone: '',
        addressLine1: '',
        addressLine2: '',
        gender: '',
        dob: ''
    });
    const { token, backendUrl, userData, setUserData, loadUserProfileData } = useContext(AppContext);

    // Validate phone number
    const validatePhone = (phone) => {
        if (!phone) return 'Phone number is required';
        if (!phone.startsWith('0')) return 'Phone must start with 0';
        if (phone.length !== 10) return 'Phone must be 10 digits';
        if (!/^\d+$/.test(phone)) return 'Phone must contain only numbers';
        return '';
    };

    // Validate address line
    const validateAddress = (address) => {
        if (!address) return 'Address is required';
        if (!/^[a-zA-Z0-9\s,.-]*$/.test(address)) return 'Address contains invalid characters';
        return '';
    };

    // Validate gender
    const validateGender = (gender) => {
        if (!gender || gender === 'Not Selected') return 'Gender is required';
        return '';
    };

    // Validate date of birth
    const validateDOB = (dob) => {
        if (!dob) return 'Birthday is required';
        const selectedDate = new Date(dob);
        const today = new Date();
        if (selectedDate >= today) return 'Birthday must be in the past';
        return '';
    };

    // Handle field changes with validation
    const handleChange = (field, value) => {
        setUserData(prev => ({ ...prev, [field]: value }));
        
        // Validate immediately when editing
        if (field === 'phone') {
            setErrors(prev => ({ ...prev, phone: validatePhone(value) }));
        }
        if (field === 'gender') {
            setErrors(prev => ({ ...prev, gender: validateGender(value) }));
        }
        if (field === 'dob') {
            setErrors(prev => ({ ...prev, dob: validateDOB(value) }));
        }
    };

    // Handle address changes with validation
    const handleAddressChange = (field, value) => {
        setUserData(prev => ({
            ...prev,
            address: { ...prev.address, [field]: value }
        }));

        // Validate address lines
        if (field === 'line1') {
            setErrors(prev => ({ ...prev, addressLine1: validateAddress(value) }));
        }
        if (field === 'line2') {
            setErrors(prev => ({ ...prev, addressLine2: validateAddress(value) }));
        }
    };

    // Validate all fields before submission
    const validateAllFields = () => {
        const newErrors = {
            phone: validatePhone(userData.phone),
            addressLine1: validateAddress(userData.address.line1),
            addressLine2: validateAddress(userData.address.line2),
            gender: validateGender(userData.gender),
            dob: validateDOB(userData.dob)
        };
        
        setErrors(newErrors);
        return Object.values(newErrors).every(error => !error);
    };

    // Function to update user profile data using API
    const updateUserProfileData = async () => {
        if (!validateAllFields()) {
            toast.error('Please fix all validation errors before saving');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('name', userData.name);
            formData.append('phone', userData.phone);
            formData.append('address', JSON.stringify(userData.address));
            formData.append('gender', userData.gender);
            formData.append('dob', userData.dob);
            image && formData.append('image', image);

            const { data } = await axios.post(
                `${backendUrl}/api/user/update-profile`, 
                formData, 
                { headers: { token } }
            );

            if (data.success) {
                toast.success('Profile updated successfully');
                await loadUserProfileData();
                setIsEdit(false);
                setImage(false);
            } else {
                toast.error(data.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Update error:', error);
            toast.error(error.response?.data?.message || 'Failed to update profile');
        }
    };

    // Function to handle profile deletion (frontend only)
    const handleDeleteProfile = () => {
        if (window.confirm('Are you sure you want to delete your profile? This action cannot be undone.')) {
            // Frontend-only action
            toast.success('Profile deletion requested');
            setUserData(null);
            navigate('/');
        }
    };

    if (!userData) return null;

    return (
        <div className='max-w-lg flex flex-col gap-2 text-sm pt-5'>
            {isEdit ? (
                <label htmlFor='image'>
                    <div className='inline-block relative cursor-pointer'>
                        <img 
                            className='w-36 rounded opacity-75' 
                            src={image ? URL.createObjectURL(image) : userData.image} 
                            alt="" 
                        />
                        <img 
                            className='w-10 absolute bottom-12 right-12' 
                            src={image ? '' : assets.upload_icon} 
                            alt="" 
                        />
                    </div>
                    <input 
                        onChange={(e) => setImage(e.target.files[0])} 
                        type="file" 
                        id="image" 
                        hidden 
                    />
                </label>
            ) : (
                <img className='w-36 rounded' src={userData.image} alt="" />
            )}

            {isEdit ? (
                <input 
                    className='bg-gray-50 text-3xl font-medium max-w-60' 
                    type="text" 
                    onChange={(e) => handleChange('name', e.target.value)} 
                    value={userData.name} 
                />
            ) : (
                <p className='font-medium text-3xl text-[#262626] mt-4'>{userData.name}</p>
            )}

            <hr className='bg-[#ADADAD] h-[1px] border-none' />

            <div>
                <p className='text-gray-600 underline mt-3'>CONTACT INFORMATION</p>
                <div className='grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-[#363636]'>
                    <p className='font-medium'>Email id:</p>
                    <p className='text-blue-500'>{userData.email}</p>
                    
                    <p className='font-medium'>Phone:</p>
                    {isEdit ? (
                        <div>
                            <input 
                                className={`bg-gray-50 max-w-52 ${errors.phone && 'border-red-500 border'}`} 
                                type="text" 
                                onChange={(e) => handleChange('phone', e.target.value)} 
                                value={userData.phone} 
                                maxLength={10}
                            />
                            {errors.phone && (
                                <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                            )}
                        </div>
                    ) : (
                        <p className='text-blue-500'>{userData.phone}</p>
                    )}

                    <p className='font-medium'>Address:</p>
                    {isEdit ? (
                        <div>
                            <input 
                                className={`bg-gray-50 w-full mb-1 ${errors.addressLine1 && 'border-red-500 border'}`} 
                                type="text" 
                                onChange={(e) => handleAddressChange('line1', e.target.value)} 
                                value={userData.address.line1} 
                                placeholder="Street address, P.O. box"
                            />
                            {errors.addressLine1 && (
                                <p className="text-red-500 text-xs mt-1">{errors.addressLine1}</p>
                            )}
                            <input 
                                className={`bg-gray-50 w-full ${errors.addressLine2 && 'border-red-500 border'}`} 
                                type="text" 
                                onChange={(e) => handleAddressChange('line2', e.target.value)} 
                                value={userData.address.line2} 
                                placeholder="Apt, suite, unit, building, floor"
                            />
                            {errors.addressLine2 && (
                                <p className="text-red-500 text-xs mt-1">{errors.addressLine2}</p>
                            )}
                        </div>
                    ) : (
                        <p className='text-gray-500'>
                            {userData.address.line1} <br /> {userData.address.line2}
                        </p>
                    )}
                </div>
            </div>

            <div>
                <p className='text-[#797979] underline mt-3'>BASIC INFORMATION</p>
                <div className='grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-gray-600'>
                    <p className='font-medium'>Gender:</p>
                    {isEdit ? (
                        <div>
                            <select 
                                className={`max-w-20 bg-gray-50 ${errors.gender && 'border-red-500 border'}`} 
                                onChange={(e) => handleChange('gender', e.target.value)} 
                                value={userData.gender} 
                            >
                                <option value="Not Selected">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                            {errors.gender && (
                                <p className="text-red-500 text-xs mt-1">{errors.gender}</p>
                            )}
                        </div>
                    ) : (
                        <p className='text-gray-500'>{userData.gender}</p>
                    )}

                    <p className='font-medium'>Birthday:</p>
                    {isEdit ? (
                        <div>
                            <input 
                                className={`max-w-28 bg-gray-50 ${errors.dob && 'border-red-500 border'}`} 
                                type='date' 
                                onChange={(e) => handleChange('dob', e.target.value)} 
                                value={userData.dob} 
                                max={new Date().toISOString().split('T')[0]}
                            />
                            {errors.dob && (
                                <p className="text-red-500 text-xs mt-1">{errors.dob}</p>
                            )}
                        </div>
                    ) : (
                        <p className='text-gray-500'>{userData.dob}</p>
                    )}
                </div>
            </div>

            <div className='mt-10 flex gap-4'>
                {isEdit ? (
                    <>
                        <button 
                            onClick={updateUserProfileData} 
                            className='border border-primary px-8 py-2 rounded-full hover:bg-primary hover:text-white transition-all'
                            disabled={Object.values(errors).some(error => error)}
                        >
                            Save information
                        </button>
                        <button 
                            onClick={() => setIsEdit(false)} 
                            className='border border-gray-400 px-8 py-2 rounded-full hover:bg-gray-100 transition-all'
                        >
                            Cancel
                        </button>
                    </>
                ) : (
                    <>
                        <button 
                            onClick={() => setIsEdit(true)} 
                            className='border border-primary px-8 py-2 rounded-full hover:bg-primary hover:text-white transition-all'
                        >
                            Edit
                        </button>
                        <button 
                            onClick={handleDeleteProfile} 
                            className='border border-red-500 text-red-500 px-8 py-2 rounded-full hover:bg-red-500 hover:text-white transition-all'
                        >
                            Delete Profile
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default MyProfile;