import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth, db } from '../lib/firebase'
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'

export default function Referrals() {
  const [referralLink, setReferralLink] = useState('')
  const [totalReferrals, setTotalReferrals] = useState(0)
  const [totalCommissions, setTotalCommissions] = useState(0)
  const [referredUsers, setReferredUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchReferrals = async () => {
      const user = auth.currentUser
      if (!user) {
        navigate('/login')
        return
      }

      const userDoc = await getDoc(doc(db, 'users', user.uid))
      const referralCode = userDoc.data()?.username || user.uid
      setReferralLink(`${window.location.origin}/#/signup?ref=${referralCode}`)

      const referralsQuery = query(collection(db, 'referrals'), where('referrerUserId', '==', user.uid))
      const referralsSnap = await getDocs(referralsQuery)
      const referrals = referralsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setTotalReferrals(referrals.length)
      setTotalCommissions(referrals.reduce((sum, r) => sum + (r.commissionEarned || 0), 0))
      setReferredUsers(referrals)
      setLoading(false)
    }

    fetchReferrals()
  }, [])

  if (loading) return <div style={{ padding: '20px', color: 'white' }}>Loading...</div>

  return (
    <div style={{ background: '#0A0F2C', minHeight: '100vh', padding: '20px', paddingBottom: '80px' }}>
      <h2 style={{ color: '#B026FF' }}>Referrals</h2>

      <div style={cardStyle}>
        <p><strong>Your Referral Link:</strong></p>
        <input type="text" value={referralLink} readOnly style={inputStyle} />
        <button onClick={() => navigator.clipboard.writeText(referralLink)} style={buttonStyle}>Copy Link</button>
      </div>

      <div style={cardStyle}>
        <p><strong>Total Referrals:</strong> {totalReferrals}</p>
        <p><strong>Total Commissions Earned:</strong> ₦{totalCommissions}</p>
      </div>

      <h3 style={{ color: '#00E5FF' }}>Referred Users</h3>
      {referredUsers.map(ref => (
        <div key={ref.id} style={cardStyle}>
          <p>User ID: {ref.referredUserId}</p>
          <p>Commission: ₦{ref.commissionEarned || 0}</p>
        </div>
      ))}

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

const inputStyle = {
  width: '100%',
  padding: '10px',
  borderRadius: '8px',
  border: '1px solid #00E5FF',
  background: '#0A0F2C',
  color: 'white',
  marginBottom: '10px',
}

const buttonStyle = {
  width: '100%',
  padding: '10px',
  background: 'linear-gradient(135deg, #00E5FF, #B026FF)',
  border: 'none',
  borderRadius: '8px',
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
