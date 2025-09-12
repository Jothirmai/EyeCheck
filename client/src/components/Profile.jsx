import React, { useState, useEffect } from "react";
import "../styles/ProfileCard.css";

const ResponsiveProfileCard = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(null); // initially null
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch profile from backend API
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/profile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`, // token saved at login
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch profile");
        }

        const data = await res.json();

        // Map backend fields -> frontend state
        setProfile({
          fullName: data.name,
          email: data.email,
          mobileNumber: data.mobile,
          gender: data.gender,
          dateOfBirth: data.dob, // assuming format is "YYYY-MM-DD"
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSave = () => {
    setIsEditing(false);
    // You can call PUT /api/profile here to update in backend
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  if (loading) return <div className="profile-container">Loading...</div>;
  if (error) return <div className="profile-container">❌ {error}</div>;
  if (!profile) return null;

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <h2>Profile Information</h2>
          <div className="profile-image">
            <div className="avatar">{profile.fullName.charAt(0)}</div>
          </div>
        </div>

        <div className="profile-content">
          <div className="profile-field">
            <label>Full Name</label>
            {isEditing ? (
              <input
                type="text"
                name="fullName"
                value={profile.fullName}
                onChange={handleChange}
                placeholder="Full Name"
              />
            ) : (
              <div className="profile-value">{profile.fullName}</div>
            )}
          </div>

          <div className="profile-field">
            <label>Email</label>
            {isEditing ? (
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleChange}
                placeholder="Email Address"
              />
            ) : (
              <div className="profile-value">{profile.email}</div>
            )}
          </div>

          <div className="profile-field">
            <label>Mobile Number</label>
            {isEditing ? (
              <input
                type="tel"
                name="mobileNumber"
                value={profile.mobileNumber}
                onChange={handleChange}
                placeholder="Mobile Number"
              />
            ) : (
              <div className="profile-value">{profile.mobileNumber}</div>
            )}
          </div>

          <div className="profile-field">
            <label>Gender</label>
            {isEditing ? (
              <select
                name="gender"
                value={profile.gender}
                onChange={handleChange}
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            ) : (
              <div className="profile-value">{profile.gender}</div>
            )}
          </div>

          <div className="profile-field">
            <label>Date Of Birth</label>
            {isEditing ? (
              <input
                type="date"
                name="dateOfBirth"
                value={profile.dateOfBirth}
                onChange={(e) =>
                  setProfile((prevState) => ({
                    ...prevState,
                    dateOfBirth: e.target.value,
                  }))
                }
              />
            ) : (
              <div className="profile-value">{profile.dateOfBirth}</div>
            )}
          </div>
        </div>

        <div className="profile-actions">
          {isEditing ? (
            <>
              <button className="save-btn" onClick={handleSave}>
                Save Changes
              </button>
              <button className="cancel-btn" onClick={handleCancel}>
                Cancel
              </button>
            </>
          ) : (
            <button className="modify-btn" onClick={() => setIsEditing(true)}>
              Modify Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResponsiveProfileCard;
