import React from "react";

function SummaryTable({ players, onReport }) {
  return (
    <div style={styles.summaryContainer}>
      <h2 style={styles.summaryTitle}>Game Summary</h2>
      <table style={styles.summaryTable}>
        <thead>
          <tr>
            <th>Player Name</th>
            <th>Points</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player) => (
            <tr key={player.id}>
              <td style={styles.playerCell}>{player.name}</td>
              <td style={styles.pointsCell}>{player.points}</td>
              <td>
                <button
                  style={styles.reportButton}
                  onClick={() => onReport(player.id)}
                >
                  Report
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  summaryContainer: {
    marginTop: "2rem",
    padding: "1rem",
    backgroundColor: "#28354e",
    borderRadius: "10px",
    color: "#ffffff",
    textAlign: "center",
  },
  summaryTitle: {
    fontSize: "1.5rem",
    marginBottom: "1rem",
  },
  summaryTable: {
    width: "100%",
    borderCollapse: "collapse",
    backgroundColor: "#34495e",
    color: "#ffffff",
    borderRadius: "5px",
    overflow: "hidden",
  },
  playerCell: {
    padding: "0.5rem",
    textAlign: "left",
    borderBottom: "1px solid #2c3e50",
  },
  pointsCell: {
    padding: "0.5rem",
    textAlign: "center",
    borderBottom: "1px solid #2c3e50",
  },
  reportButton: {
    backgroundColor: "#e74c3c",
    color: "#ffffff",
    padding: "0.5rem 1rem",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: "bold",
    transition: "background 0.3s ease",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
  },
  reportButtonHover: {
    backgroundColor: "#c0392b",
  }
};

export default SummaryTable;