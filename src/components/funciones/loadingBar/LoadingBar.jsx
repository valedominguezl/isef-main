import React from 'react';
import { useLoading } from '../context/LoadingContext.jsx';
import styles from './LoadingBar.module.scss';

const LoadingBar = () => {
  const { loading } = useLoading();

  return (
    <div className={`${styles.loadingBar} ${loading ? styles.active : ''}`}></div>
  );
};

export default LoadingBar;
