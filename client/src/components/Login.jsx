import styles from '../styles/Login.module.css';
import AuthSocialButtons from './AuthSocialButtons';

export default function Login({ onSwitch }) {
  return (
    <div className={styles.loginContainer}>
      <div className={styles.logoBlock}>
        <img src="/logo.png" alt="EyeCheck logo" className={styles.logo} />
      </div>
      <h2 className={styles.title}>Welcome</h2>
      <form className={styles.form}>
        <label>Email or Mobile Number</label>
        <input type="text" placeholder="Enter" required />
        <label>Password</label>
        <input type="password" placeholder="Enter Password" required />
        <div className={styles.forgot}>
          <a href="#">Forgot Password?</a>
        </div>
        <button className={styles.loginBtn} type="submit">Log In</button>
      </form>
      <div className={styles.or}>or log in with</div>
      <AuthSocialButtons />
      <div className={styles.bottom}>
        Don't have an account? <span onClick={onSwitch} className={styles.signupLink}>Sign Up</span>
      </div>
    </div>
  );
}
