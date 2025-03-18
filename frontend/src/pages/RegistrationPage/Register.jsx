import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Register.css';
import Navbar from '../NavigationBar/Navbar';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            alert("Passwords don't match!");
            return;
        }
        console.log('Registration data:', formData);
    };

    return (
        <div className="page-container">
            <Navbar /> {/* Navbar sayfanın en üstüne eklendi */}
            <div className="register-container">
                <div className="register-box">
                    <form onSubmit={handleSubmit}>
                        <h3>create account</h3>

                        <div className="input-group">
                            <label>username</label>
                            <input
                                type="text"
                                name="username"
                                className="register-input"
                                placeholder="enter your username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label>email</label>
                            <input
                                type="email"
                                name="email"
                                className="box"
                                placeholder="enter your email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label>password</label>
                            <input
                                type="password"
                                name="password"
                                className="box"
                                placeholder="enter your password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label>confirm password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                className="box"
                                placeholder="confirm your password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <input type="submit" value="register now" className="register-btn" />

                        <p>already have an account ? <Link to="/login">sign in</Link></p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;
