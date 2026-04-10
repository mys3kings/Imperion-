import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth, db } from '../lib/firebase'
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore'

export default function Dashboard() {
  const [userData, setUserData] = useState<any>(null)
  const [tapsToday, setTapsToday] = useState(0)
  const [icoins, setIcoins] = useState(0)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        navigate('/login')
        return
      }
      const docRef = doc(db, 'users', user.uid)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        setUserData(docSnap.data())
        setTapsToday(docSnap.data().tapsToday || 0)
        setIcoins(docSnap.data().iCoinsBalance || 0)
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const handleTap = async () => {
    if (!auth.currentUser) return
    if (tapsToday >= 200) {
      alert('You have reached your daily tap limit (200 taps)!')
      return
    }
    const userRef = doc(db, 'users', auth.currentUser.uid)
    await updateDoc(userRef, {
      tapsToday: increment(1),
      iCoinsBalance: increment(10),
    })
    setTapsToday(prev => prev + 1)
    setIcoins(prev => prev + 10)
  }

  if (loading) return <div style={{ padding: '20px', color: 'white' }}>Loading...</div>

  return (
    <div style={{ background: '#0A0F2C', minHeight: '100vh', padding: '20px', paddingBottom: '80px' }}>
      <h2 style={{ color: '#B026FF' }}>Welcome, {userData?.username}</h2>
      <p>Plan: <span style={{ color: '#00E5FF' }}>{userData?.plan || 'None'}</span></p>

      <div style={{ textAlign: 'center', margin: '30px 0' }}>
        <div onClick={handleTap} style={coinStyle}>🪙 I Coin</div>
        <p>Taps Today: {tapsToday}/200</p>
        <p>I Coins: {icoins}</p>
        <div style={progressBarStyle}>
          <div style={{ ...progressFillStyle, width: `${(tapsToday / 200) * 100}%` }}></div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        <button onClick={() => navigate('/tasks')} style={quickLinkStyle}>📋 Tasks</button>
        <button onClick={() => navigate('/withdraw')} style={quickLinkStyle}>💰 Withdraw</button>
        <button onClick={() => navigate('/deposit')} style={quickLinkStyle}>💳 Deposit</button>
        <button onClick={() => navigate('/referrals')} style={quickLinkStyle}>👥 Referrals</button>
      </div>

      <div style={bottomNavStyle}>
        <button onClick={() => navigate('/')} style={navItemStyle}>🏠 Home</button>
        <button onClick={() => navigate('/history')} style={navItemStyle}>📜 History</button>
        <button onClick={() => navigate('/profile')} style={navItemStyle}>👤 Profile</button>
      </div>
    </div>
  )
}

const coinStyle = {
  width: '120px',
  height: '120px',
  background: 'radial-gradient(circle at 30% 30%, #FFD700, #FFA500)',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 20px',
  cursor: 'pointer',
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#fff',
  boxShadow: '0 0 20px rgba(255,215,0,0.5)',
}

const progressBarStyle = {
  width: '100%',
  height: '8px',
  background: '#2a3450',
  borderRadius: '10px',
  marginTop: '10px',
}

const progressFillStyle = {
  height: '100%',
  background: '#00F5D4',
  borderRadius: '10px',
}

const quickLinkStyle = {
  padding: '12px',
  background: '#1C2541',
  border: '1px solid #00E5FF',
  borderRadius: '12px',
  color: 'white',
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
