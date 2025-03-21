import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Register.css';
import Navbar from '../NavigationBar/Navbar';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        surname: '',
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
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                password: formData.password,
            }),
        };

        fetch("http://localhost:8080/register", requestOptions)
            .then((response) => response.text())
            .then((result) => {
                console.log(result);
                //TODO:login sayfasına yönlendirme
            })
            .catch((error) => {
                console.error(error);
            });
    };

    return (
        <div className="page-container">
            <Navbar /> {/* Navbar sayfanın en üstüne eklendi */}
            <div className="register-container">
                <div className="register-box">
                    <form onSubmit={handleSubmit}>
                        <h3>create account</h3>

                        <div className="input-group">
                            <label>name</label>
                            <input
                                type="text"
                                name="name"
                                className="register-input"
                                placeholder="enter your name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                autoCapitalize="none"
                            />
                        </div>

                        <div className="input-group">
                            <label>surname</label>
                            <input
                                type="text"
                                name="surname"
                                className="register-input"
                                placeholder="enter your surname"
                                value={formData.surname}
                                onChange={handleChange}
                                required
                                autoCapitalize="none"
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
                                autoCapitalize="none"
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
                                autoCapitalize="none"
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
                                autoCapitalize="none"
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
