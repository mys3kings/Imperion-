import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth, db } from '../lib/firebase'
import { doc, getDoc, addDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore'

export default function Withdraw() {
  const [balances, setBalances] = useState({
    taskBalance: 0,
    referralBalance: 0,
    dailyBalance: 0,
    iCoinsBalance: 0
  })
  const [selectedType, setSelectedType] = useState('task')
  const [amount, setAmount] = useState('')
  const [bankName, setBankName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountHolderName, setAccountHolderName] = useState('')
  const [withdrawals, setWithdrawals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  const minimums = {
    task: 2500,
    referral: 1500,
    daily: 3000,
    icoins: 20  // 2000 I Coins = ₦20
  }

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser
      if (!user) {
        navigate('/login')
        return
      }

      const userDoc = await getDoc(doc(db, 'users', user.uid))
      const userData = userDoc.data()
      setBalances({
        taskBalance: userData?.taskBalance || 0,
        referralBalance: userData?.referralBalance || 0,
        dailyBalance: userData?.dailyBalance || 0,
        iCoinsBalance: userData?.iCoinsBalance || 0
      })

      const withdrawalsQuery = query(collection(db, 'withdrawals'), where('userId', '==', user.uid))
      const withdrawalsSnap = await getDocs(withdrawalsQuery)
      setWithdrawals(withdrawalsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
      setLoading(false)
    }

    fetchData()
  }, [])

  const getMaxAmount = () => {
    switch (selectedType) {
      case 'task': return balances.taskBalance
      case 'referral': return balances.referralBalance
      case 'daily': return balances.dailyBalance
      case 'icoins': return Math.floor(balances.iCoinsBalance / 100)
      default: return 0
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const withdrawAmount = parseFloat(amount)
    const maxAmount = getMaxAmount()
    const minimum = minimums[selectedType as keyof typeof minimums]

    if (withdrawAmount < minimum) {
      alert(`Minimum withdrawal for ${selectedType} is ₦${minimum}`)
      return
    }

    if (withdrawAmount > maxAmount) {
      alert(`Insufficient balance. You have ₦${maxAmount}`)
      return
    }

    setSubmitting(true)
    try {
      const user = auth.currentUser
      if (!user) throw new Error('Not logged in')

      await addDoc(collection(db, 'withdrawals'), {
        userId: user.uid,
        amount: withdrawAmount,
        balanceType: selectedType,
        bankName,
        accountNumber,
        accountHolderName,
        status: 'pending',
        createdAt: new Date()
      })

      alert('Withdrawal request submitted successfully!')
      setAmount('')
      setBankName('')
      setAccountNumber('')
      setAccountHolderName('')
    } catch (error: any) {
      alert('Error: ' + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div style={{ padding: '20px', color: 'white' }}>Loading...</div>

  return (
    <div style={{ background: '#0A0F2C', minHeight: '100vh', padding: '20px', paddingBottom: '80px' }}>
      <h2 style={{ color: '#B026FF' }}>Withdraw Funds</h2>

      <div style={cardStyle}>
        <h3 style={{ color: '#00E5FF' }}>Your Balances</h3>
        <p>Task Balance: ₦{balances.taskBalance}</p>
        <p>Referral Balance: ₦{balances.referralBalance}</p>
        <p>Daily Balance: ₦{balances.dailyBalance}</p>
        <p>I Coins: {balances.iCoinsBalance} (≈ ₦{Math.floor(balances.iCoinsBalance / 100)})</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={formGroupStyle}>
          <label>Select Balance Type</label>
          <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} style={inputStyle}>
            <option value="task">Task Balance (Min ₦2500)</option>
            <option value="referral">Referral Balance (Min ₦1500)</option>
            <option value="daily">Daily Balance (Min ₦3000)</option>
            <option value="icoins">I Coins (Min ₦20 / 2000 I Coins)</option>
          </select>
        </div>

        <div style={formGroupStyle}>
          <label>Amount (₦)</label>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter amount" required style={inputStyle} />
        </div>

        <div style={formGroupStyle}>
          <label>Bank Name</label>
          <input type="text" value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="e.g., Opay, Moniepoint, GTBank" required style={inputStyle} />
        </div>

        <div style={formGroupStyle}>
          <label>Account Number</label>
          <input type="text" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="10-digit account number" required style={inputStyle} />
        </div>

        <div style={formGroupStyle}>
          <label>Account Holder Name</label>
          <input type="text" value={accountHolderName} onChange={(e) => setAccountHolderName(e.target.value)} placeholder="Full name on account" required style={inputStyle} />
        </div>

        <button type="submit" disabled={submitting} style={buttonStyle}>
          {submitting ? 'Submitting...' : 'Submit Withdrawal Request'}
        </button>
      </form>

      <h3 style={{ color: '#00E5FF', marginTop: '20px' }}>Withdrawal History</h3>
      {withdrawals.map(w => (
        <div key={w.id} style={cardStyle}>
          <p>Amount: ₦{w.amount}</p>
          <p>Type: {w.balanceType}</p>
          <p>Status: <span style={{ color: w.status === 'approved' ? '#00F5D4' : w.status === 'declined' ? '#FF4D6D' : '#FFD700' }}>{w.status}</span></p>
          <p>Date: {w.createdAt?.toDate?.().toLocaleDateString() || 'Pending'}</p>
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
  fontSize: '16px',
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
