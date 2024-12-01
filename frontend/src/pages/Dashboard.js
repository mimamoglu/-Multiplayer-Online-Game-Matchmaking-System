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
  } = useGlobalState() // Global state'den userID çekildi
  const dispatch = useGlobalDispatch()

  const [queueTime, setQueueTime] = useState(0) // Sayaç değeri
  const [showPopup, setShowPopup] = useState(false) // Popup kontrolü
  const currentPlayerId = userID
  useEffect(() => {
    let timer
    let gameFoundTimer

    if (isPlaying) {
      // Sayaç başlatılır
      timer = setInterval(() => {
        setQueueTime(prevTime => prevTime + 1)
      }, 1000)

      // Oyun bulma süresi ayarlanır
      const randomTime = Math.floor(Math.random() * 5) + 5 // 5-10 saniye
      gameFoundTimer = setTimeout(() => {
        setShowPopup(true) // Popup göster
        clearInterval(timer) // Sayaç durdurulur
      }, randomTime * 1000)
    }

    return () => {
      clearInterval(timer)
      clearTimeout(gameFoundTimer)
    }
  }, [isPlaying])

  const handlePlayClick = async () => {
    dispatch({ type: 'SET_IS_PLAYING', payload: true })
    setQueueTime(0)
    dispatch({ type: 'SET_GAME_SUMMARY', payload: null })

    try {
      const response_ = await fetch(
        `${API_BASE_URL}/api/players/${currentPlayerId}/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: ' '
        }
      )
      const response = await fetch(`${API_BASE_URL}/api/queue/`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })
      const data = await response.json()
      dispatch({ type: 'SET_QUEUED_PLAYERS', payload: data })
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
      const response = await fetch(`${API_BASE_URL}/accept-game`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userID })
      })
      const data = await response.json()
      dispatch({ type: 'SET_IN_GAME_PLAYERS', payload: data.players })
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
      await fetch(`${API_BASE_URL}/reject-game`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userID })
      })
    } catch (error) {
      console.error('Error rejecting game:', error)
    }
  }

  // Oyunu bitirme servisi
  const handleEndGame = async () => {
    dispatch({ type: 'SET_IN_GAME', payload: false })

    try {
      const response = await fetch(`${API_BASE_URL}/end-game`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userID })
      })
      const data = await response.json()
      dispatch({ type: 'SET_GAME_SUMMARY', payload: data.summary })
    } catch (error) {
      console.error('Error ending game:', error)
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
                <button style={styles.playButton} onClick={handlePlayClick}>
                  Play
                </button>
              )}
            </>
          )}
        </div>

        {gameSummary && (
          <SummaryTable
            players={gameSummary}
            onReport={playerId => alert(`Player with ID ${playerId} reported.`)}
          />
        )}

        {/* Sağ: Oyuncular Tablosu */}
        {/* Sağ: Queue Table */}
        {isPlaying && !inGame && (
          <div style={styles.rightSection}>
            <h3 style={styles.playersTitle}>Queued Players</h3>
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
        )}

        {inGame && (
          <div style={styles.rightSection}>
            <h3 style={styles.playersTitle}>In-Game Players</h3>
            <ul style={styles.playerList}>
              {inGamePlayers.map(player => (
                <li
                  key={player.id}
                  style={{
                    ...styles.playerItem,
                    ...(player.id === currentPlayerId
                      ? styles.currentPlayer
                      : {})
                  }}
                >
                  {player.name}
                </li>
              ))}
            </ul>
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
  playButton: {
    background: '#00bcd4',
    color: '#ffffff',
    padding: '1rem 2rem',
    border: 'none',
    borderRadius: '10px',
    fontSize: '1.5rem',
    cursor: 'pointer',
    transition: 'background 0.3s ease'
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
  }
}

export default Dashboard
