import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const ScrollToSection = ({ page, id, children }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleClick = () => {
        // Si no se pasa 'page', usamos la página actual
        const targetPage = page || location.pathname;

        // Redirigir a la página especificada (o a la actual si no se pasa 'page')
        navigate(targetPage);

        // Esperar un poco para que la página se cargue y luego hacer scroll
        setTimeout(() => {
            const section = document.getElementById(id);
            if (section) {
                section.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 500); // Esperamos 500 ms para que se cargue la página
    };

    return (
        <a onClick={handleClick} style={{ textDecoration: 'underline', cursor: 'pointer' }}>
            {children}
        </a>
    );
};

export default ScrollToSection;