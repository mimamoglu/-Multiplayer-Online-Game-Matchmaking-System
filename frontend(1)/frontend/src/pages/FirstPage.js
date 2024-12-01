import React, { useState } from 'react'
import Navbar from '../components/Navbar' // Navbar bileÅŸenini dahil edin
import API_BASE_URL from '../config'

function FirstPage () {
  const [currentSlide, setCurrentSlide] = useState(0) // Slider kontrolÃ¼
  const [data1, setData1] = useState([]) // Players data
  const [data2, setData2] = useState([]) // Blacklist data
  const [data3, setData3] = useState([]) // Game sessions data

  const [playerPage, setPlayerPage] = useState(1) // Players pagination
  const [blacklistPage, setBlacklistPage] = useState(1) // Blacklist pagination
  const [gameSessionPage, setGameSessionPage] = useState(1) // Game sessions pagination

  const rowsPerPage = 5

  const fetchData = async (url, setData) => {
    try {
      const response = await fetch(`${API_BASE_URL}${url}`)
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const paginate = (data, page) => {
    const start = (page - 1) * rowsPerPage
    const end = start + rowsPerPage
    return data.slice(start, end)
  }

  const PaginationControls = ({ currentPage, totalPages, onPageChange }) => (
    <div style={styles.pagination}>
      <button
        style={styles.pageButton}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || totalPages === 0}
      >
        Previous
      </button>
      <span>
        {totalPages > 0 ? `Page ${currentPage} of ${totalPages}` : 'No Data'}
      </span>
      <button
        style={styles.pageButton}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || totalPages === 0}
      >
        Next
      </button>
    </div>
  )

  const PlayerTable = ({ data }) => {
    const totalPages = Math.ceil(data.length / rowsPerPage)
    return (
      <>
        <table style={styles.table}>
          <thead>
            <tr>
              <th>Player ID</th>
              <th>Username</th>
              <th>Skill Rating</th>
              <th>Games Played</th>
              <th>Win Rate</th>
              <th>Server IP</th>
            </tr>
          </thead>
          <tbody>
            {paginate(data, playerPage).map(row => (
              <tr key={row.playerid}>
                <td>{row.playerid}</td>
                <td>{row.username}</td>
                <td>{row.skillrating}</td>
                <td>{row.gamesplayed}</td>
                <td>{row.winrate}%</td>
                <td>{row.serverip}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <PaginationControls
          currentPage={playerPage}
          totalPages={totalPages}
          onPageChange={setPlayerPage}
        />
      </>
    )
  }

  const BlacklistTable = ({ data }) => {
    const totalPages = Math.ceil(data.length / rowsPerPage)
    return (
      <>
        <table style={styles.table}>
          <thead>
            <tr>
              <th>Blacklist ID</th>
              <th>Report Count</th>
              <th>Last Report Date</th>
              <th>Suspicious Score</th>
              <th>Player ID</th>
            </tr>
          </thead>
          <tbody>
            {paginate(data, blacklistPage).map(row => (
              <tr key={row.blacklistid}>
                <td>{row.blacklistid}</td>
                <td>{row.reportcount}</td>
                <td>{new Date(row.lastreportdate).toLocaleString()}</td>
                <td>{row.suspiciousactivityscore}</td>
                <td>{row.playerid}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <PaginationControls
          currentPage={blacklistPage}
          totalPages={totalPages}
          onPageChange={setBlacklistPage}
        />
      </>
    )
  }

  const GameSessionTable = ({ data }) => {
    const totalPages = Math.ceil(data.length / rowsPerPage)
    return (
      <>
        <table style={styles.table}>
          <thead>
            <tr>
              <th>Game Session ID</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Status</th>
              <th>Game Model ID</th>
              <th>Region ID</th>
            </tr>
          </thead>
          <tbody>
            {paginate(data, gameSessionPage).map(row => (
              <tr key={row.gamesessionid}>
                <td>{row.gamesessionid}</td>
                <td>{new Date(row.starttime).toLocaleString()}</td>
                <td>
                  {row.endtime ? new Date(row.endtime).toLocaleString() : 'N/A'}
                </td>
                <td>{row.sessionstatus}</td>
                <td>{row.gamemodelid}</td>
                <td>{row.regionid || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <PaginationControls
          currentPage={gameSessionPage}
          totalPages={totalPages}
          onPageChange={setGameSessionPage}
        />
      </>
    )
  }

  const slides = [
    {
      button: (
        <button
          style={styles.button}
          onClick={() => fetchData('/api/players/', setData1)}
        >
          Get Players
        </button>
      ),
      table: <PlayerTable data={data1} />
    },
    {
      button: (
        <button
          style={styles.button}
          onClick={() => fetchData('/api/blacklist/', setData2)}
        >
          Get Blacklists
        </button>
      ),
      table: <BlacklistTable data={data2} />
    },
    {
      button: (
        <button
          style={styles.button}
          onClick={() => fetchData('/api/gamesession/', setData3)}
        >
          Get Game Sessions
        </button>
      ),
      table: <GameSessionTable data={data3} />
    }
  ]

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <h1>DASHBOARD</h1>
        <div style={styles.slider}>
          {slides[currentSlide].button}
          {slides[currentSlide].table}
        </div>
        <div style={styles.controls}>
          <button
            style={styles.controlButton}
            onClick={() =>
              setCurrentSlide(prev =>
                prev === 0 ? slides.length - 1 : prev - 1
              )
            }
          > 
          ← Previous
          </button>
          <button
            style={styles.controlButton}
            onClick={() =>
              setCurrentSlide(prev =>
                prev === slides.length - 1 ? 0 : prev + 1
              )
            }
          >
            Next →
          </button>
        </div>
      </div>
    </>
  )
}

const styles = {
  container: {
    padding: '2rem',
    backgroundColor: '#1b1f38',
    color: '#ffffff',
    textAlign: 'center'
  },
  slider: {
    margin: '2rem auto',
    padding: '1rem',
    backgroundColor: '#28354e',
    borderRadius: '10px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
    width: '80%',
    textAlign: 'center'
  },
  button: {
    backgroundColor: '#00bcd4',
    color: '#ffffff',
    padding: '0.5rem 1rem',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginBottom: '1rem',
    fontSize: '1rem',
    transition: 'background 0.3s ease'
  },
  table: {
    width: '100%',
    marginTop: '1rem',
    borderCollapse: 'collapse',
    backgroundColor: '#34495e',
    color: '#ffffff'
  },
  controls: {
    marginTop: '1rem',
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem'
  },
  controlButton: {
    backgroundColor: '#34495e',
    color: '#ffffff',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1rem'
  },
  pagination: {
    marginTop: '1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  pageButton: {
    backgroundColor: '#00bcd4',
    color: '#ffffff',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1rem'
  }
}

export default FirstPage;