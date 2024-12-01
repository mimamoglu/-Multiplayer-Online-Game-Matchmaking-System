import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav style={styles.navbar}>
      <div style={styles.logo}>My Dashboard</div>
      <ul style={styles.navLinks}>
        <li><Link to="/" style={styles.link}>Dashboard</Link></li>
        <li><Link to="/firstpage" style={styles.link}>Control Center</Link></li>
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
  logo: {
    color: "#00bcd4",
    fontSize: "1.5rem",
    fontWeight: "bold",
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
};

export default Navbar;