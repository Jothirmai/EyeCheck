import styles from '../styles/Signup.module.css';
import AuthSocialButtons from './AuthSocialButtons';

export default function Signup({ onSwitch }) {
  return (
    <div className={styles.signupContainer}>
      <h2 className={styles.title}>New Account</h2>
      <form className={styles.form}>
        <input type="text" placeholder="Enter Your Name" required />
        <input type="password" placeholder="**********" required />
        <input type="email" placeholder="example@example.com" required />
        <input type="text" placeholder="+32 ..." required />
        <select required>
          <option value="">Select Your Gender</option>
          <option>Male</option>
          <option>Female</option>
          <option>Other</option>
        </select>
        <input type="date" required />
        <button className={styles.signupBtn} type="submit">Sign Up</button>
      </form>
      <div className={styles.or}>or sign up with</div>
      <AuthSocialButtons />
      <div className={styles.bottom}>
        Already have an account?{" "}
        <span onClick={onSwitch} className={styles.loginLink}>Log In</span>
      </div>
    </div>
  );
}
