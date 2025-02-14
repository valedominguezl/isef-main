import React from 'react';
import useLoadingA from './useLoadingA';

const LoadingAnchor = ({ href, target, children, ...rest }) => {
  // Aquí se llama el hook dentro del componente
  const handleLoadingClick = useLoadingA();

  return (
    <a href={href} target={target} onClick={handleLoadingClick} {...rest}>
      {children}
    </a>
  );
};

export default LoadingAnchor;
