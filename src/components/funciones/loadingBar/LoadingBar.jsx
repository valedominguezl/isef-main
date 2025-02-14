import React from 'react';
import { useLoading } from '@/components/funciones/context/LoadingContext';
import styles from './LoadingBar.module.scss';

const LoadingBar = () => {
  const { loading } = useLoading();

  return (
    <div className={`${styles.loadingBar} ${loading ? styles.active : ''}`}></div>
  );
};

export default LoadingBar;
