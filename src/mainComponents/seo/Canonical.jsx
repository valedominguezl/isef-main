import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const Canonical = () => {
  const location = useLocation();

  return (
    <Helmet>
      <link rel="canonical" href={`https://isefsanluis.net${location.pathname}`} />
    </Helmet>
  );
};

export default Canonical;
