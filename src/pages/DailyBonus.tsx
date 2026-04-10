import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth, db } from '../lib/firebase'
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore'

export default function DailyBonus() {
  const [canClaim, setCanClaim] = useState(true)
  const [timeLeft, setTimeLeft] = useState('')
  const [userPlan, setUserPlan] = useState('none')
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const checkBonus = async () => {
      const user = auth.currentUser
      if (!user) {
        navigate('/login')
        return
      }

      const userDoc = await getDoc(doc(db, 'users', user.uid))
      const plan = userDoc.data()?.plan || 'none'
      setUserPlan(plan)

      const lastClaim = userDoc.data()?.lastBonusClaim
      if (lastClaim) {
        const lastClaimDate = lastClaim.toDate()
        const nextClaimDate = new Date(lastClaimDate.getTime() + 24 * 60 * 60 * 1000)
        if (nextClaimDate > new Date()) {
          setCanClaim(false)
          const diff = nextClaimDate.getTime() - new Date().getTime()
          const hours = Math.floor(diff / (1000 * 60 * 60))
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
          setTimeLeft(`${hours}h ${minutes}m`)
        }
      }
      setLoading(false)
    }

    checkBonus()
  }, [])

  const handleClaim = async () => {
    if (!canClaim) {
      alert(`You can claim again in ${timeLeft}`)
      return
    }

    if (userPlan === 'none') {
      alert('You need to activate a plan (Basic or Premium) to claim daily bonus.')
      return
    }

    setClaiming(true)
    try {
      const user = auth.currentUser
      if (!user) throw new Error('Not logged in')

      const bonusAmount = userPlan === 'premium' ? 100 : 40
      const userRef = doc(db, 'users', user.uid)

      await updateDoc(userRef, {
        dailyBalance: increment(bonusAmount),
        lastBonusClaim: new Date()
      })

      alert(`✅ You claimed ₦${bonusAmount} daily bonus!`)
      setCanClaim(false)
      setTimeLeft('24h 0m')
    } catch (error: any) {
      alert('Error: ' + error.message)
    } finally {
      setClaiming(false)
    }
  }

  if (loading) return <div style={{ padding: '20px', color: 'white' }}>Loading...</div>

  const bonusAmount = userPlan === 'premium' ? 100 : userPlan === 'basic' ? 40 : 0

  return (
    <div style={{ background: '#0A0F2C', minHeight: '100vh', padding: '20px', paddingBottom: '80px', textAlign: 'center' }}>
      <h2 style={{ color: '#B026FF' }}>Daily Bonus</h2>

      <div style={cardStyle}>
        <p style={{ fontSize: '48px' }}>🎁</p>
        <h3>Claim Your Daily Bonus</h3>
        <p>Amount: <strong style={{ color: '#FFD700', fontSize: '24px' }}>₦{bonusAmount}</strong></p>
        <p>Plan: {userPlan === 'premium' ? 'Premium (100%)' : userPlan === 'basic' ? 'Basic (40%)' : 'No Plan'}</p>

        {canClaim ? (
          <button onClick={handleClaim} disabled={claiming} style={buttonStyle}>
            {claiming ? 'Claiming...' : 'Claim Bonus'}
          </button>
        ) : (
          <div>
            <p style={{ color: '#FF4D6D' }}>Next claim available in:</p>
            <p style={{ fontSize: '24px', color: '#00E5FF' }}>{timeLeft}</p>
          </div>
        )}
      </div>

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
  padding: '30px',
  borderRadius: '24px',
  marginTop: '40px',
  border: '1px solid #00E5FF',
}

const buttonStyle = {
  padding: '12px 30px',
  background: 'linear-gradient(135deg, #00E5FF, #B026FF)',
  border: 'none',
  borderRadius: '40px',
  color: 'white',
  fontWeight: 'bold',
  cursor: 'pointer',
  fontSize: '18px',
  marginTop: '20px',
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
