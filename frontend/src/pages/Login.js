import React, { useState } from 'react'
import { useGlobalDispatch } from '../GlobalState' // Global state'e erişim için import
import API_BASE_URL from '../config' // API URL'sini config'den alın
import { useNavigate, Link } from 'react-router-dom' // Link bileşeni eklendi

function Login () {
  const [error, setError] = useState(null) // Hata mesajını tutmak için
  const dispatch = useGlobalDispatch() // Global state'i güncellemek için dispatch
  const navigate = useNavigate()

  const handleLogin = async e => {
    e.preventDefault()
    setError(null) // Hata mesajını sıfırla

    const formData = new FormData(e.target)
    const username = formData.get('username')
    const password = formData.get('password')

    try {
      const response = await fetch(`${API_BASE_URL}/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      })

      if (!response.ok) {
        throw new Error('Login failed. Please check your credentials.')
      }

      const result = await response.json()
      console.log(result.playerid)
      if (result.playerid) {
        dispatch({ type: 'SET_USER_ID', payload: result.playerid }) // Global store'a userID setle
        navigate('/dashboard')
      } else {
        throw new Error('Invalid response from server.')
      }
    } catch (error) {
      setError(error.message) // Hata mesajını ayarla
    }
  }

  return (
    <div className='login-page' style={styles.container}>
      <h2>Login</h2>
      <form onSubmit={handleLogin} style={styles.form}>
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
          Login
        </button>
        {error && <p style={styles.error}>{error}</p>}{' '}
        {/* Hata mesajını göster */}
      </form>
      {/* Register Link */}
      <p style={styles.registerText}>
        Haven't registered yet?{' '}
        <Link to='/register' style={styles.link}>
          Register here
        </Link>
      </p>
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
  },
  registerText: {
    marginTop: '1rem',
    color: '#cccccc',
    fontSize: '0.9rem'
  },
  link: {
    color: '#00bcd4',
    textDecoration: 'none'
  }
}

export default Login
