import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth, db } from '../lib/firebase'
import { doc, getDoc } from 'firebase/firestore'

export default function Profile() {
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchProfile = async () => {
      const user = auth.currentUser
      if (!user) {
        navigate('/login')
        return
      }
      const docRef = doc(db, 'users', user.uid)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        setUserData(docSnap.data())
      }
      setLoading(false)
    }
    fetchProfile()
  }, [])

  if (loading) return <div style={{ padding: '20px', color: 'white' }}>Loading...</div>

  const multiplier = userData?.plan === 'basic' ? '0.4x (40%)' : userData?.plan === 'premium' ? '1x (100%)' : 'No plan'

  return (
    <div style={{ background: '#0A0F2C', minHeight: '100vh', padding: '20px', paddingBottom: '80px' }}>
      <h2 style={{ color: '#B026FF' }}>My Profile</h2>

      <div style={cardStyle}>
        <p><strong>Username:</strong> {userData?.username}</p>
        <p><strong>Email:</strong> {userData?.email}</p>
        <p><strong>Phone:</strong> {userData?.phone}</p>
        <p><strong>Plan:</strong> <span style={{ color: '#00E5FF' }}>{userData?.plan || 'None'}</span></p>
        <p><strong>Multiplier:</strong> {multiplier}</p>
        {userData?.planExpiryDate && <p><strong>Plan Expires:</strong> {userData.planExpiryDate.toDate?.().toLocaleDateString()}</p>}
      </div>

      <div style={cardStyle}>
        <h3 style={{ color: '#00E5FF' }}>Balances</h3>
        <p>Task Balance: ₦{userData?.taskBalance || 0}</p>
        <p>Referral Balance: ₦{userData?.referralBalance || 0}</p>
        <p>Daily Balance: ₦{userData?.dailyBalance || 0}</p>
        <p>I Coins: {userData?.iCoinsBalance || 0}</p>
      </div>

      <div style={bottomNavStyle}>
        <button onClick={() => navigate('/')} style={navItemStyle}>🏠 Home</button>
        <button onClick={() => navigate('/dashboard')} style={navItemStyle}>📊 Dashboard</button>
        <button onClick={() => navigate('/history')} style={navItemStyle}>📜 History</button>
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
