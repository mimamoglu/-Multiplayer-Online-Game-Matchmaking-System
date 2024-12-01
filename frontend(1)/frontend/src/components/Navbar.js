import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import avatar from '../../src/ape.jpg';
import API_BASE_URL from '../config'; // API URL'si
import { useGlobalState } from '../GlobalState'; // Global state kullanımı

function Navbar() {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const { userID } = useGlobalState(); // Global store'dan userID al
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null); // Kullanıcı bilgilerini saklamak için

  // Kullanıcı bilgilerini almak için bir API çağrısı
  useEffect(() => {
    if (userID) {
      fetch(`${API_BASE_URL}/api/players/${userID}/`, {
        method: 'GET',
        headers: { "Content-Type": "application/json" }
      })
        .then((response) => response.json())
        .then((data) => {
          setUserInfo(data);
        })
        .catch((error) => {
          console.error("Error fetching player info:", error);
        });
    }
  }, [userID]);

  const handleLoginNavigate = () => {
    navigate('/');
  };

  return (
    <nav style={styles.navbar}>
      {userID && userInfo ? (
        <div
          style={styles.userContainer}
          onMouseEnter={() => setDropdownOpen(true)}
          onMouseLeave={() => setDropdownOpen(false)}
        >
          <div style={styles.userInfo}>
            <img src={avatar} alt="Avatar" style={styles.avatar} />
            <span style={styles.username}>{userInfo.username}</span>
          </div>
          {isDropdownOpen && (
            <div style={styles.dropdown}>
              <p><strong>Username:</strong> {userInfo.username}</p>
              <p><strong>Skill Rating:</strong> {userInfo.skillrating}</p>
              <p><strong>Games Played:</strong> {userInfo.gamesplayed}</p>
              <p><strong>Win Rate:</strong> {userInfo.winrate}%</p>
              {userInfo.serverip && <p><strong>Server IP:</strong> {userInfo.serverip}</p>}
            </div>
          )}
        </div>
      ) : (
        <button style={styles.loginButton} onClick={handleLoginNavigate}>
          Login
        </button>
      )}
      <ul style={styles.navLinks}>
        <li><Link to="/dashboard" style={styles.link}>PLAY</Link></li>
        <li><Link to="/firstpage" style={styles.link}>DASHBOARD</Link></li>
      </ul>
    </nav>
  );
}

const styles = {
  navbar: {
    background: "#1b1f38",
    padding: "1rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
  },
  userContainer: {
    position: "relative",
    display: "inline-block",
    cursor: "pointer",
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  avatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    border: "2px solid #00bcd4",
  },
  username: {
    color: "#ffffff",
    fontSize: "1rem",
    fontWeight: "bold",
  },
  dropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    background: "#28354e",
    color: "#ffffff",
    padding: "1rem",
    borderRadius: "5px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
    marginTop: "0.5rem",
    zIndex: 10,
    width: "250px",
  },
  navLinks: {
    listStyle: "none",
    display: "flex",
    gap: "1.5rem",
  },
  link: {
    color: "#ffffff",
    textDecoration: "none",
    fontSize: "1rem",
    transition: "color 0.3s ease",
  },
  loginButton: {
    background: "#00bcd4",
    color: "#ffffff",
    border: "none",
    borderRadius: "5px",
    padding: "0.5rem 1rem",
    cursor: "pointer",
    fontSize: "1rem",
  },
};

export default Navbar;