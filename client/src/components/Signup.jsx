import { useState } from "react";
import styles from "../styles/Signup.module.css";
import AuthSocialButtons from "./AuthSocialButtons";

export default function Signup({ onSwitch }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    mobile: "",
    gender: "",
    dob: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
      const res = await fetch("http://localhost:3001/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("Signup successful 🎉");
        setFormData({
          name: "",
          email: "",
          password: "",
          mobile: "",
          gender: "",
          dob: "",
        });
      } else {
        setError(data.error || "Signup failed");
      }
    } catch (err) {
      setError("Server error. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.signupContainer}>
      <h2 className={styles.title}>New Account</h2>

      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Enter Your Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="**********"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="example@example.com"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="mobile"
          placeholder="+32 ..."
          value={formData.mobile}
          onChange={handleChange}
          required
        />
        <select
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          required
        >
          <option value="">Select Your Gender</option>
          <option>Male</option>
          <option>Female</option>
          <option>Other</option>
        </select>
        <input
          type="date"
          name="dob"
          value={formData.dob}
          onChange={handleChange}
          required
        />
        <button
          className={styles.signupBtn}
          type="submit"
          disabled={loading}
        >
          {loading ? "Signing Up..." : "Sign Up"}
        </button>
      </form>

      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
      {success && <p style={{ color: "green", textAlign: "center" }}>{success}</p>}

      <div className={styles.or}>or sign up with</div>
      <AuthSocialButtons />

      <div className={styles.bottom}>
        Already have an account?{" "}
        <span onClick={onSwitch} className={styles.loginLink}>
          Log In
        </span>
      </div>
    </div>
  );
}
