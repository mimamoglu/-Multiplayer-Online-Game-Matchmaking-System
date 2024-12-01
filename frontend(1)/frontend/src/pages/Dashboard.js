import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import SummaryTable from '../components/SummaryTable'
import { useGlobalState, useGlobalDispatch } from '../GlobalState'
import API_BASE_URL from '../config'

function Dashboard () {
  const {
    queuedPlayers,
    inGamePlayers,
    gameSummary,
    isPlaying,
    inGame,
    userID
  } = useGlobalState()
  const dispatch = useGlobalDispatch()

  const [queueTime, setQueueTime] = useState(0)
  const [showPopup, setShowPopup] = useState(false)
  const [selectedGameMode, setSelectedGameMode] = useState('GM001')
  const [gameSessionId, setGameSessionId] = useState(null)
  const currentPlayerId = userID

  const gameModes = [
    { id: 'GM001', name: 'Solo' },
    { id: 'GM002', name: 'Team' },
    { id: 'GM003', name: 'Battle Royale' },
    { id: 'GM004', name: 'Co-op' },
    { id: 'GM005', name: 'Deathmatch' }
  ]
  useEffect(() => {
    let timer

    if (isPlaying) {
      timer = setInterval(async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/queue/`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          })
          const data = await response.json()
          const reversedData = [...data].reverse()
          dispatch({ type: 'SET_QUEUED_PLAYERS', payload: reversedData })

          if (reversedData.length >= 100) {
            clearInterval(timer)
            setQueueTime(0)
            setShowPopup(true)
          } else {
            setQueueTime(prevTime => prevTime + 1)
          }
        } catch (error) {
          console.error('Error polling queue:', error)
          clearInterval(timer)
        }
      }, 1000)
    }

    return () => clearInterval(timer)
  }, [isPlaying, dispatch])

  const handlePlayClick = async () => {
    dispatch({ type: 'SET_IS_PLAYING', payload: true })
    setQueueTime(0)
    dispatch({ type: 'SET_GAME_SUMMARY', payload: null })

    try {
      await fetch(`${API_BASE_URL}/api/players/${currentPlayerId}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gamemodeid: selectedGameMode })
      })
    } catch (error) {
      console.error('Error starting queue:', error)
    }
  }

  // Oyunu kabul etme servisi
  const handleAcceptGame = async () => {
    setShowPopup(false)
    dispatch({ type: 'SET_IS_PLAYING', payload: false })
    setQueueTime(0)
    dispatch({ type: 'SET_IN_GAME', payload: true })

    try {
      const matchmakingResponse = await fetch(
        `${API_BASE_URL}/api/matchmaking/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        }
      )

      if (matchmakingResponse.ok) {
        const response = await fetch(
          `${API_BASE_URL}/api/sessionparticipant/gamesession/${userID}`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          }
        )

        if (!response.ok) {
          throw new Error('Failed to fetch session participants.')
        }

        const data = await response.json()

        const sessionId = data.game_id
          .replace('Gamesession object (', '')
          .replace(')', '')
          .trim() // Clean the session ID
        setGameSessionId(sessionId)

        const inGamePlayers = data.players.map(playerId => ({
          playerId: playerId.trim()
        }))

        dispatch({ type: 'SET_IN_GAME_PLAYERS', payload: inGamePlayers })
      } else {
        throw new Error('Matchmaking service failed.')
      }
    } catch (error) {
      console.error('Error accepting game:', error)
    }
  }

  // Oyunu reddetme servisi
  const handleRejectGame = async () => {
    setShowPopup(false)
    dispatch({ type: 'SET_IS_PLAYING', payload: false })
    dispatch({ type: 'SET_QUEUED_PLAYERS', payload: [] })

    try {
      await fetch(`${API_BASE_URL}/api/players/${userID}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      })
    } catch (error) {
      console.error('Error rejecting game:', error)
    }
  }

  // Oyunu bitirme servisi
  const handleEndGame = async () => {
    dispatch({ type: 'SET_IN_GAME', payload: false })

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/gamesession/${gameSessionId}/`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userID })
        }
      )
      const data = await response.json()
      dispatch({ type: 'SET_GAME_SUMMARY', payload: data.summary })
    } catch (error) {
      console.error('Error ending game:', error)
    }
  }
  const handleReport = async reportedPlayerId => {
    const reporterId = userID
    const reason = prompt('Enter the reason for reporting this player:')

    if (!reason) {
      alert('Report canceled. Reason is required.')
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reporterId,
          reportedId: reportedPlayerId,
          reason
        })
      })

      if (!response.ok) {
        throw new Error('Failed to submit the report. Please try again.')
      }

      const data = await response.json()
      alert(data.message)
    } catch (error) {
      console.error('Error reporting player:', error)
      alert('An error occurred while submitting the report.')
    }
  }

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        {/* Sol: Ana Sayfa */}
        <div style={styles.leftSection}>
          {inGame ? (
            <>
              <h2 style={styles.inGameText}>Oyunda...</h2>
              <button style={styles.endGameButton} onClick={handleEndGame}>
                Oyunu Bitir
              </button>
            </>
          ) : (
            <>
              {isPlaying && <h2 style={styles.queueText}>In Queue...</h2>}
              {isPlaying && (
                <p style={styles.timer}>Time in Queue: {queueTime}s</p>
              )}
              {!isPlaying && (
                <div style={styles.gameModeContainer}>
                  <label style={styles.gameModeLabel} htmlFor='gameMode'>
                    Select Game Mode
                  </label>
                  <select
                    id='gameMode'
                    style={styles.gameModeSelect}
                    onMouseEnter={e =>
                      (e.currentTarget.style.backgroundColor =
                        styles.gameModeSelectHover.backgroundColor)
                    }
                    onMouseLeave={e =>
                      (e.currentTarget.style.backgroundColor =
                        styles.gameModeSelect.backgroundColor)
                    }
                    value={selectedGameMode}
                    onChange={e => setSelectedGameMode(e.target.value)}
                  >
                    {gameModes.map(mode => (
                      <option key={mode.id} value={mode.id}>
                        {mode.name}
                      </option>
                    ))}
                  </select>
                  <button
                    style={styles.playButton}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform =
                        styles.playButtonHover.transform
                      e.currentTarget.style.boxShadow =
                        styles.playButtonHover.boxShadow
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow =
                        styles.playButton.boxShadow
                    }}
                    onClick={handlePlayClick}
                  >
                    Join Game
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {gameSummary && (
          <SummaryTable
            players={gameSummary}
            onReport={playerId => handleReport(playerId)}
          />
        )}

        {/* Sag: Queue Table */}
        {isPlaying && !inGame && (
          <div style={styles.rightSection}>
            <h3 style={styles.playersTitle}>Queued Players</h3>
            <div style={styles.scrollableTable}>
              <table style={styles.queueTable}>
                <thead>
                  <tr>
                    <th>Queue ID</th>
                    <th>Join Time</th>
                    <th>Status</th>
                    <th>Player ID</th>
                    <th>Game Model</th>
                  </tr>
                </thead>
                <tbody>
                  {queuedPlayers.map(player => (
                    <tr
                      key={player.playerid}
                      style={
                        player.playerid === currentPlayerId
                          ? { ...styles.playerRow, ...styles.currentPlayer }
                          : styles.playerRow
                      }
                    >
                      <td>{player.queueid}</td>
                      <td>{new Date(player.jointime).toLocaleString()}</td>
                      <td>{player.status}</td>
                      <td>{player.playerid}</td>
                      <td>{player.preferredgamemodelid}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {inGame && (
          <div style={styles.rightSection}>
            <h3 style={styles.playersTitle}>In-Game Players</h3>
            <div style={styles.scrollableTable}>
              <table style={styles.queueTable}>
                <thead>
                  <tr>
                    <th>Player ID</th>
                  </tr>
                </thead>
                <tbody>
                  {inGamePlayers.map(player => (
                    <tr key={player.playerId}>
                      <td>{player.playerId}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Popup */}
        {showPopup && (
          <div style={styles.popup}>
            <h3 style={styles.popupTitle}>Game Found!</h3>
            <p>Do you want to accept this match?</p>
            <div style={styles.popupButtons}>
              <button style={styles.acceptButton} onClick={handleAcceptGame}>
                Accept
              </button>
              <button style={styles.rejectButton} onClick={handleRejectGame}>
                Reject
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: '5rem',
    padding: '0 2rem',
    color: '#ffffff',
    fontFamily: 'Arial, sans-serif'
  },
  leftSection: {
    flex: 1,
    textAlign: 'center',
    marginRight: '1rem'
  },
  rightSection: {
    flex: 0.3,
    backgroundColor: '#28354e',
    padding: '1rem',
    borderRadius: '10px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
  },
  queueText: {
    fontSize: '1.5rem',
    color: '#00bcd4',
    marginBottom: '1rem'
  },
  inGameText: {
    fontSize: '1.5rem',
    color: '#27ae60',
    marginBottom: '1rem'
  },
  timer: {
    fontSize: '1.25rem',
    color: '#ffffff',
    marginBottom: '2rem'
  },
  endGameButton: {
    background: '#e74c3c',
    color: '#ffffff',
    padding: '0.75rem 1.5rem',
    border: 'none',
    borderRadius: '5px',
    fontSize: '1.25rem',
    cursor: 'pointer',
    marginTop: '1rem'
  },
  playersTitle: {
    fontSize: '1.25rem',
    color: '#00bcd4',
    marginBottom: '1rem',
    textAlign: 'center'
  },
  playerList: {
    listStyleType: 'none',
    padding: 0,
    margin: 0,
    maxHeight: '300px',
    overflowY: 'auto'
  },
  playerItem: {
    padding: '0.5rem',
    margin: '0.5rem 0',
    backgroundColor: '#34495e',
    borderRadius: '5px',
    textAlign: 'center',
    color: '#ffffff'
  },
  scrollableTable: {
    maxHeight: '300px',
    overflowY: 'auto',
    marginTop: '1rem',
    border: '1px solid #34495e',
    borderRadius: '5px'
  },
  queueTable: {
    width: '100%',
    borderCollapse: 'collapse',
    color: '#ffffff',
    textAlign: 'left'
  },
  playerRow: {
    backgroundColor: '#34495e',
    borderBottom: '1px solid #28354e'
  },
  currentPlayer: {
    backgroundColor: '#00bcd4',
    fontWeight: 'bold'
  },
  popup: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#34495e',
    padding: '2rem',
    borderRadius: '10px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
    textAlign: 'center',
    zIndex: 1000,
    color: '#ffffff'
  },
  popupTitle: {
    fontSize: '1.5rem',
    marginBottom: '1rem'
  },
  popupButtons: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
    marginTop: '1rem'
  },
  acceptButton: {
    backgroundColor: '#00bcd4',
    color: '#ffffff',
    padding: '0.5rem 1rem',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer'
  },
  rejectButton: {
    backgroundColor: '#e74c3c',
    color: '#ffffff',
    padding: '0.5rem 1rem',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer'
  },
  gameModeContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '2rem',
    backgroundColor: '#1b1f38',
    padding: '1rem 2rem',
    borderRadius: '10px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.4)',
    width: 'fit-content',
    margin: '0 auto'
  },
  gameModeLabel: {
    fontSize: '1.5rem',
    color: '#00bcd4',
    fontWeight: 'bold',
    textShadow: '0 0 5px rgba(0, 188, 212, 0.6)',
    marginBottom: '0.5rem'
  },
  gameModeSelect: {
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    fontSize: '1.2rem',
    backgroundColor: '#28354e',
    color: '#ffffff',
    border: '2px solid #00bcd4',
    cursor: 'pointer',
    transition: 'background 0.3s ease, transform 0.2s ease',
    outline: 'none',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
  },
  gameModeSelectHover: {
    backgroundColor: '#34495e',
    transform: 'scale(1.05)'
  },
  playButton: {
    background: 'linear-gradient(135deg, #00bcd4, #0277bd)',
    color: '#ffffff',
    padding: '1rem 2.5rem',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.3s ease',
    boxShadow: '0 8px 15px rgba(0, 0, 0, 0.4)'
  },
  playButtonHover: {
    transform: 'translateY(-5px)',
    boxShadow: '0 12px 20px rgba(0, 0, 0, 0.5)'
  }
}

export default Dashboard
