import React, { useEffect, useState } from "react";
import { FaArrowLeft, FaEdit, FaSave } from "react-icons/fa";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const Settings = ({ onBack }) => {
  const { user, updateUser } = useAuth();
  if (!user) {
    return <div>Please log in to view your profile.</div>;
  }
  const currentUserId = user._id;

  const [userData, setUserData] = useState({
    fullName: "",
    email: "",
    username: "",
  });
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line
  }, []);

  const fetchUser = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/user/${currentUserId}`
      );
      setUserData(res.data);
    } catch (err) {
      console.error("Failed to fetch user", err);
    }
  };

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const res = await axios.put(`http://localhost:5000/api/user/${user._id}`, {
        fullName: userData.fullName,
        email: userData.email,
      });
      setEditMode(false);
      fetchUser();
      updateUser(res.data); // This updates context and localStorage
      alert("User updated successfully");
    } catch (err) {
      alert("Failed to update user");
    }
  };

  return (
    <div className="w-100 h-100 p-4">
      <div className="mb-4">
        <button className="btn btn-light" onClick={onBack}>
          <FaArrowLeft /> Back
        </button>
      </div>
      <h4>My Profile</h4>
      <table className="table">
        <tbody>
          <tr>
            <th>Full Name</th>
            <td>
              {editMode ? (
                <input
                  name="fullName"
                  value={userData.fullName}
                  onChange={handleChange}
                />
              ) : (
                userData.fullName
              )}
            </td>
          </tr>
          <tr>
            <th>Email</th>
            <td>
              {editMode ? (
                <input
                  name="email"
                  value={userData.email}
                  onChange={handleChange}
                />
              ) : (
                userData.email
              )}
            </td>
          </tr>
          <tr>
            <th>Username</th>
            <td>{userData.username}</td>
          </tr>
          <tr>
            <th>Edit</th>
            <td>
              {editMode ? (
                <button className="btn btn-success btn-sm" onClick={handleSave}>
                  <FaSave />
                </button>
              ) : (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setEditMode(true)}
                >
                  <FaEdit />
                </button>
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Settings;
