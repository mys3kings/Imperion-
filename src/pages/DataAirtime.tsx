import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth, db } from '../lib/firebase'
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore'

export default function DataAirtime() {
  const [taskBalance, setTaskBalance] = useState(0)
  const [hasPurchased, setHasPurchased] = useState(false)
  const [phone, setPhone] = useState('')
  const [network, setNetwork] = useState('mtn')
  const [type, setType] = useState('airtime')
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser
      if (!user) {
        navigate('/login')
        return
      }

      const userDoc = await getDoc(doc(db, 'users', user.uid))
      setTaskBalance(userDoc.data()?.taskBalance || 0)
      setHasPurchased(userDoc.data()?.hasPurchasedAirtime || false)
      setLoading(false)
    }

    fetchData()
  }, [])

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault()

    if (hasPurchased) {
      alert('You have already purchased airtime/data once. This is a one-time offer.')
      return
    }

    if (taskBalance < 500) {
      alert(`Insufficient task balance. You need ₦500. Your balance: ₦${taskBalance}`)
      return
    }

    setPurchasing(true)
    try {
      const user = auth.currentUser
      if (!user) throw new Error('Not logged in')

      const userRef = doc(db, 'users', user.uid)
      await updateDoc(userRef, {
        taskBalance: increment(-200),
        hasPurchasedAirtime: true
      })

      alert(`✅ ${type === 'airtime' ? 'Airtime' : 'Data'} of ₦200 sent to ${phone} on ${network.toUpperCase()}!`)
      setTaskBalance(prev => prev - 200)
      setHasPurchased(true)
    } catch (error: any) {
      alert('Error: ' + error.message)
    } finally {
      setPurchasing(false)
    }
  }

  if (loading) return <div style={{ padding: '20px', color: 'white' }}>Loading...</div>

  return (
    <div style={{ background: '#0A0F2C', minHeight: '100vh', padding: '20px', paddingBottom: '80px' }}>
      <h2 style={{ color: '#B026FF' }}>Buy Airtime / Data</h2>

      <div style={cardStyle}>
        <p><strong>Your Task Balance:</strong> ₦{taskBalance}</p>
        <p><strong>Required:</strong> ₦500</p>
        <p><strong>Cost:</strong> ₦200 (one-time offer)</p>
        {hasPurchased && <p style={{ color: '#FF4D6D' }}>⚠️ You have already used this offer. One per user lifetime.</p>}
      </div>

      {!hasPurchased && taskBalance >= 500 && (
        <form onSubmit={handlePurchase}>
          <div style={formGroupStyle}>
            <label>Phone Number</label>
            <input type="tel" placeholder="08012345678" value={phone} onChange={(e) => setPhone(e.target.value)} required style={inputStyle} />
          </div>

          <div style={formGroupStyle}>
            <label>Network</label>
            <select value={network} onChange={(e) => setNetwork(e.target.value)} style={inputStyle}>
              <option value="mtn">MTN</option>
              <option value="glo">Glo</option>
              <option value="airtel">Airtel</option>
              <option value="9mobile">9mobile</option>
            </select>
          </div>

          <div style={formGroupStyle}>
            <label>Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)} style={inputStyle}>
              <option value="airtime">Airtime (₦200)</option>
              <option value="data">Data (₦200 worth)</option>
            </select>
          </div>

          <button type="submit" disabled={purchasing} style={buttonStyle}>
            {purchasing ? 'Processing...' : `Buy ₦200 ${type}`}
          </button>
        </form>
      )}

      <div style={bottomNavStyle}>
        <button onClick={() => navigate('/')} style={navItemStyle}>🏠 Home</button>
        <button onClick={() => navigate('/dashboard')} style={navItemStyle}>📊 Dashboard</button>
        <button onClick={() => navigate('/profile')} style={navItemStyle}>👤 Profile</button>
      </div>
    </div>
  )
}

const cardStyle = {
  background: '#1C2541',
  padding: '16px',
  borderRadius: '16px',
  marginBottom: '20px',
  border: '1px solid #00E5FF',
}

const formGroupStyle = {
  marginBottom: '15px',
}

const inputStyle = {
  width: '100%',
  padding: '12px',
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

const bottomNavStyle = {
  position: 'fixed' as const,
  bottom: 0,
  left: 0,
  right: 0,
  display: 'flex',
  justifyContent: 'space-around',
  padding: '12px',
  background: '#1C2541',
  borderTop: '1px solid #00E5FF',
}

const navItemStyle = {
  background: 'none',
  border: 'none',
  color: '#8D99AE',
  cursor: 'pointer',
        }
