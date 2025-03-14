import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import './Register.css';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreed: false
    });
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [showAgreement, setShowAgreement] = useState(false);
    
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        setErrorMessage(''); // Clear error message when input changes
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (formData.password !== formData.confirmPassword) {
            setErrorMessage('Passwords do not match!');
            return;
        }
        
        if (!formData.agreed) {
            setErrorMessage('You must accept the user agreement.');
            return;
        }
        
        console.log('User Created:', formData);
        setSuccessMessage('You have successfully registered to BiblioSphere!');
        
        setTimeout(() => {
            navigate('/login');
        }, 1000);
    };

    return (
        <div className="pageContainer">
            <Navbar />
            <div className="registerWrapper">
                <div className="registerBox" style={{ marginTop: '20px', padding: '30px', borderRadius: '10px', backgroundColor: '#fff', boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)' }}>
                    <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>Register</h2>
                    {successMessage && <p className="successMessage" style={{ color: 'green', fontWeight: 'bold', textAlign: 'center' }}>{successMessage}</p>}
                    {errorMessage && <p className="errorMessage" style={{ color: 'red', fontWeight: 'bold', textAlign: 'center' }}>{errorMessage}</p>}
                    <form onSubmit={handleSubmit}>
                        <div className="inputGroup">
                            <label>Username</label>
                            <input 
                                type="text" 
                                name="username" 
                                value={formData.username} 
                                onChange={handleChange} 
                                required
                                style={{ border: '1px solid #ccc', borderRadius: '5px', padding: '10px', width: '100%' }}
                            />
                        </div>
                        <div className="inputGroup">
                            <label>Email Address</label>
                            <input 
                                type="email" 
                                name="email" 
                                value={formData.email} 
                                onChange={handleChange} 
                                required
                                style={{ border: '1px solid #ccc', borderRadius: '5px', padding: '10px', width: '100%' }}
                            />
                        </div>
                        <div className="inputGroup">
                            <label>Password</label>
                            <input 
                                type="password" 
                                name="password" 
                                value={formData.password} 
                                onChange={handleChange} 
                                required
                                style={{ border: '1px solid #ccc', borderRadius: '5px', padding: '10px', width: '100%' }}
                            />
                        </div>
                        <div className="inputGroup">
                            <label>Confirm Password</label>
                            <input 
                                type="password" 
                                name="confirmPassword" 
                                value={formData.confirmPassword} 
                                onChange={handleChange} 
                                required
                                style={{ border: '1px solid #ccc', borderRadius: '5px', padding: '10px', width: '100%' }}
                            />
                        </div>
                        <div className="checkboxContainer" style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
                            <input 
                                type="checkbox" 
                                name="agreed" 
                                checked={formData.agreed} 
                                onChange={handleChange}
                                style={{ marginRight: '10px' }}
                            />
                            <label onClick={() => setShowAgreement(true)} style={{ cursor: 'pointer', textDecoration: 'underline', color: 'blue' }}>
                                I accept the user agreement
                            </label>
                        </div>
                        <button type="submit" className="registerBtn" style={{ backgroundColor: '#007bff', color: 'white', padding: '10px', border: 'none', borderRadius: '5px', width: '100%', marginTop: '20px', cursor: 'pointer', fontWeight: 'bold' }}>
                            Register
                        </button>
                    </form>
                </div>
            </div>
            
            {showAgreement && (
                <div className="agreementPopup" style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)' }}>
                    <div className="agreementContent">
                        <h3>User Agreement</h3>
                        <p>This is a sample user agreement. By signing up, you agree to our terms and conditions.</p>
                        <button onClick={() => setShowAgreement(false)} style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '10px', borderRadius: '5px', cursor: 'pointer' }}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Register;