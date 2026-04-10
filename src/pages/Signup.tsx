import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc, getDocs, query, where, collection } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'

export default function Signup() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [referralCode, setReferralCode] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const q = query(collection(db, 'users'), where('username', '==', username))
    const snapshot = await getDocs(q)
    if (!snapshot.empty) {
      alert('❌ Username already taken. Please choose another.')
      setLoading(false)
      return
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      const urlParams = new URLSearchParams(window.location.search)
      const urlRef = urlParams.get('ref')
      const referredBy = referralCode || urlRef || null

      await setDoc(doc(db, 'users', user.uid), {
        username,
        email,
        phone,
        referredBy,
        plan: 'none',
        taskBalance: 0,
        referralBalance: 0,
        dailyBalance: 0,
        iCoinsBalance: 0,
        tapsToday: 0,
        lastTapDate: null,
        createdAt: new Date(),
      })

      alert('✅ Account created successfully! Redirecting to login...')
      setTimeout(() => navigate('/login'), 2000)
    } catch (error: any) {
      alert('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto', background: '#0A0F2C', minHeight: '100vh' }}>
      <h2 style={{ color: '#B026FF' }}>Create Account</h2>
      <form onSubmit={handleSignup}>
        <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required style={inputStyle} />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
        <input type="tel" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} required style={inputStyle} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} />
        <input type="text" placeholder="Referral Code (Optional)" value={referralCode} onChange={(e) => setReferralCode(e.target.value)} style={inputStyle} />
        <button type="submit" disabled={loading} style={buttonStyle}>
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>
      <p style={{ marginTop: '20px', textAlign: 'center' }}>
        Already have an account? <a href="#/login" style={{ color: '#00E5FF' }}>Login</a>
      </p>
    </div>
  )
}

const inputStyle = {
  width: '100%',
  padding: '12px',
  margin: '10px 0',
  borderRadius: '8px',
  border: '1px solid #00E5FF',
  background: '#1C2541',
  color: 'white',
}

const buttonStyle = {
  width: '100%',
  padding: '12px',
  background: 'linear-gradient(135deg, #00E5FF, #B026FF)',
  border: 'none',
  borderRadius: '8px',
  color: 'white',
  fontWeight: 'bold',
  cursor: 'pointer',
          }
