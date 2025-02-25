import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const ScrollToSection = ({ page, id, children, className = '' }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleClick = () => {
        const targetPage = page || location.pathname;
        navigate(targetPage);
        setTimeout(() => {
            const section = document.getElementById(id);
            if (section) {
                section.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 500);
    };

    return (
        <a
            onClick={handleClick}
            className={className}
        >
            {children}
        </a>
    );
};

export default ScrollToSection;
