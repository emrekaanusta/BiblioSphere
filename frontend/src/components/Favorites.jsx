import React from 'react';

const Favorites = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="favorites-container">
            <div className="favorites-sidebar">
                <div className="favorites-header">
                    <h3>My Favorites</h3>
                    <button onClick={onClose} className="close-btn">
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                <div className="favorites-items">
                    {/* Empty favorites message */}
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <p>No favorites yet</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Favorites; 