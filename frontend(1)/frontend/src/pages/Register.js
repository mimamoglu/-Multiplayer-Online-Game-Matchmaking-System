import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API_BASE_URL from '../config' // API URL'sini config'den alÄ±n

function Register () {
  const [error, setError] = useState(null) // Hata mesajÄ±nÄ± tutmak iÃ§in
  const navigate = useNavigate() // YÃ¶nlendirme iÃ§in

  const handleRegister = async e => {
    e.preventDefault()
    setError(null) // Hata mesajÄ±nÄ± sÄ±fÄ±rla

    const formData = new FormData(e.target)
    const username = formData.get('username')
    const password = formData.get('password')
    const skillrating = 0;
    const winrate = 0;
    const gamesplayed = 0;

    try {
      const response = await fetch(`${API_BASE_URL}/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password, skillrating, winrate, gamesplayed })
      })

      if (!response.ok) {
        throw new Error('Registration failed. Please check your inputs.')
      }

      const result = await response.json()
      if (result.message) {
        navigate('/') // Login sayfasÄ±na yÃ¶nlendir
      } else {
        throw new Error(result.message || 'Unknown error occurred.')
      }
    } catch (error) {
      setError(error.message) // Hata mesajÄ±nÄ± ayarla
    }
  }

  return (
    <div className='register-page' style={styles.container}>
      <h2>Register</h2>
      <form onSubmit={handleRegister} style={styles.form}>
        <label style={styles.label}>
          Username:
          <input type='text' name='username' required style={styles.input} />
        </label>
        <label style={styles.label}>
          Password:
          <input
            type='password'
            name='password'
            required
            style={styles.input}
          />
        </label>
        <button type='submit' style={styles.button}>
          Register
        </button>
        {error && <p style={styles.error}>{error}</p>}{' '}
        {/* Hata mesajÄ±nÄ± gÃ¶ster */}
      </form>
    </div>
  )
}

const styles = {
  container: {
    textAlign: 'center',
    marginTop: '5rem',
    color: '#ffffff',
    fontFamily: 'Arial, sans-serif'
  },
  form: {
    maxWidth: '400px',
    margin: '0 auto',
    padding: '1rem',
    backgroundColor: '#28354e',
    borderRadius: '10px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
  },
  label: {
    display: 'block',
    marginBottom: '1rem',
    color: '#cccccc'
  },
  input: {
    width: '100%',
    padding: '0.5rem',
    marginBottom: '1rem',
    borderRadius: '5px',
    border: 'none',
    backgroundColor: '#34495e',
    color: '#ffffff'
  },
  button: {
    background: '#00bcd4',
    color: '#ffffff',
    padding: '0.5rem 1rem',
    border: 'none',
    borderRadius: '5px',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'background 0.3s ease'
  },
  error: {
    color: '#e74c3c',
    marginTop: '1rem'
  }
}

export default Register;