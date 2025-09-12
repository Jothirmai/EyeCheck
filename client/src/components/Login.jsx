import { useState } from "react";
import styles from "../styles/Login.module.css";
import AuthSocialButtons from "./AuthSocialButtons";
import { useNavigate } from "react-router-dom";

export default function Login({ onSwitch }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useNavigate()

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:3001/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
       router("/camera")
        setSuccess("Login successful 🎉");
        localStorage.setItem("token", data.token); // store JWT in localStorage (or cookie if more secure)
        // redirect user -> e.g., dashboard
        // window.location.href = "/dashboard";
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("Server error. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.logoBlock}>
        <img src="/logo.png" alt="EyeCheck logo" className={styles.logo} />
      </div>
      <h2 className={styles.title}>Welcome</h2>

      <form className={styles.form} onSubmit={handleSubmit}>
        <label>Email or Mobile Number</label>
        <input
          type="text"
          name="email"
          placeholder="Enter"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <label>Password</label>
        <input
          type="password"
          name="password"
          placeholder="Enter Password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <div className={styles.forgot}>
          <a href="#">Forgot Password?</a>
        </div>

        <button
          className={styles.loginBtn}
          type="submit"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Log In"}
        </button>
      </form>

      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
      {success && <p style={{ color: "green", textAlign: "center" }}>{success}</p>}

      <div className={styles.or}>or log in with</div>
      <AuthSocialButtons />

      <div className={styles.bottom}>
        Don't have an account?{" "}
        <span onClick={onSwitch} className={styles.signupLink}>
          Sign Up
        </span>
      </div>
    </div>
  );
}
