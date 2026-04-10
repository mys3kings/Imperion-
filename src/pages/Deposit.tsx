import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth, db } from '../lib/firebase'
import { addDoc, collection, query, where, getDocs } from 'firebase/firestore'

export default function Deposit() {
  const [planType, setPlanType] = useState('basic')
  const [receiptUrl, setReceiptUrl] = useState('')
  const [deposits, setDeposits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchDeposits = async () => {
      const user = auth.currentUser
      if (!user) {
        navigate('/login')
        return
      }

      const depositsQuery = query(collection(db, 'deposits'), where('userId', '==', user.uid))
      const depositsSnap = await getDocs(depositsQuery)
      setDeposits(depositsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
      setLoading(false)
    }

    fetchDeposits()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const user = auth.currentUser
      if (!user) throw new Error('Not logged in')

      const amount = planType === 'basic' ? 1000 : 2500

      await addDoc(collection(db, 'deposits'), {
        userId: user.uid,
        amount,
        planType,
        receiptImageUrl: receiptUrl,
        status: 'pending',
        createdAt: new Date()
      })

      alert(`Deposit request submitted! Please wait for admin approval. Amount: ₦${amount}`)
      setReceiptUrl('')
    } catch (error: any) {
      alert('Error: ' + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div style={{ padding: '20px', color: 'white' }}>Loading...</div>

  return (
    <div style={{ background: '#0A0F2C', minHeight: '100vh', padding: '20px', paddingBottom: '80px' }}>
      <h2 style={{ color: '#B026FF' }}>Deposit to Activate Plan</h2>

      <div style={cardStyle}>
        <h3 style={{ color: '#00E5FF' }}>Bank Account Details</h3>
        <p><strong>Account Name:</strong> Favour Ifedayo Sam Ayinde</p>
        <p><strong>Account Number:</strong> 7084318814</p>
        <p><strong>Bank:</strong> Opay</p>
        <button onClick={() => navigator.clipboard.writeText('7084318814')} style={copyButtonStyle}>Copy Account Number</button>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={formGroupStyle}>
          <label>Select Plan</label>
          <select value={planType} onChange={(e) => setPlanType(e.target.value)} style={inputStyle}>
            <option value="basic">Basic Plan - ₦1,000 (5 months, 40% earnings)</option>
            <option value="premium">Premium Plan - ₦2,500 (Lifetime, 100% earnings)</option>
          </select>
        </div>

        <div style={formGroupStyle}>
          <label>Upload Receipt Image URL</label>
          <input type="text" placeholder="Paste your image URL (Imgur, PostImage, etc.)" value={receiptUrl} onChange={(e) => setReceiptUrl(e.target.value)} required style={inputStyle} />
        </div>

        <button type="submit" disabled={submitting} style={buttonStyle}>
          {submitting ? 'Submitting...' : `Submit ₦${planType === 'basic' ? '1,000' : '2,500'} Deposit`}
        </button>
      </form>

      <h3 style={{ color: '#00E5FF', marginTop: '20px' }}>Deposit History</h3>
      {deposits.map(deposit => (
        <div key={deposit.id} style={cardStyle}>
          <p>Amount: ₦{deposit.amount}</p>
          <p>Plan: {deposit.planType}</p>
          <p>Status: <span style={{ color: deposit.status === 'approved' ? '#00F5D4' : deposit.status === 'declined' ? '#FF4D6D' : '#FFD700' }}>{deposit.status}</span></p>
          <p>Date: {deposit.createdAt?.toDate?.().toLocaleDateString() || 'Pending'}</p>
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

const copyButtonStyle = {
  padding: '8px 16px',
  background: '#00E5FF',
  border: 'none',
  borderRadius: '8px',
  color: '#0A0F2C',
  fontWeight: 'bold',
  cursor: 'pointer',
  marginTop: '10px',
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
