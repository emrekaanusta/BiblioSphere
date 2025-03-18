import React from 'react';
import { Link } from 'react-router-dom';

const ProfileDropdown = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="profile-dropdown-container">
            <div className="profile-dropdown">
                <Link to="/login" className="dropdown-item" onClick={onClose}>
                    <i className="fas fa-sign-in-alt"></i> Login
                </Link>
                <Link to="/register" className="dropdown-item" onClick={onClose}>
                    <i className="fas fa-user-plus"></i> Sign Up
                </Link>
            </div>
        </div>
    );
};

export default ProfileDropdown; 