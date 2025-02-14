import React from "react";
import styles from "./Skeleton.module.scss";

const Skeleton = () => {
  return (
    <div className={styles.curso}>
      <div className={styles.title}></div>
      <div className={styles.subTitle}></div>
      <div className={styles.button}></div>
    </div>
  );
};

export default Skeleton;
