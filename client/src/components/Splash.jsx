import styles from '../styles/Splash.module.css';

export default function Splash() {
  return (
    <div className={styles.container}>
      <div className={styles.logoBlock}>
        <img src="/logo.png" alt="EyeCheck logo" className={styles.logo} />
        <h1 className={styles.brand}>EyeCheck</h1>
        <p className={styles.tagline}>Detect Early See Clearly</p>
      </div>
    </div>
  );
}
