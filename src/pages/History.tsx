import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth, db } from '../lib/firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'

export default function History() {
  const [deposits, setDeposits] = useState<any[]>([])
  const [withdrawals, setWithdrawals] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchHistory = async () => {
      const user = auth.currentUser
      if (!user) {
        navigate('/login')
        return
      }

      const depositsQuery = query(collection(db, 'deposits'), where('userId', '==', user.uid))
      const withdrawalsQuery = query(collection(db, 'withdrawals'), where('userId', '==', user.uid))
      const tasksQuery = query(collection(db, 'taskSubmissions'), where('userId', '==', user.uid))

      const [depositsSnap, withdrawalsSnap, tasksSnap] = await Promise.all([
        getDocs(depositsQuery),
        getDocs(withdrawalsQuery),
        getDocs(tasksQuery),
      ])

      setDeposits(depositsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
      setWithdrawals(withdrawalsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
      setTasks(tasksSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
      setLoading(false)
    }

    fetchHistory()
  }, [])

  if (loading) return <div style={{ padding: '20px', color: 'white' }}>Loading...</div>

  return (
    <div style={{ background: '#0A0F2C', minHeight: '100vh', padding: '20px', paddingBottom: '80px' }}>
      <h2 style={{ color: '#B026FF' }}>Transaction History</h2>

      <h3 style={{ color: '#00E5FF', marginTop: '20px' }}>Deposits</h3>
      {deposits.map(deposit => (
        <div key={deposit.id} style={cardStyle}>
          <p>Amount: ₦{deposit.amount}</p>
          <p>Status: <span style={{ color: deposit.status === 'approved' ? '#00F5D4' : '#FF4D6D' }}>{deposit.status}</span></p>
          <p>Date: {deposit.createdAt?.toDate?.().toLocaleDateString() || 'Pending'}</p>
        </div>
      ))}

      <h3 style={{ color: '#00E5FF', marginTop: '20px' }}>Withdrawals</h3>
      {withdrawals.map(withdrawal => (
        <div key={withdrawal.id} style={cardStyle}>
          <p>Amount: ₦{withdrawal.amount}</p>
          <p>Type: {withdrawal.balanceType}</p>
          <p>Status: <span style={{ color: withdrawal.status === 'approved' ? '#00F5D4' : '#FF4D6D' }}>{withdrawal.status}</span></p>
        </div>
      ))}

      <h3 style={{ color: '#00E5FF', marginTop: '20px' }}>Task Submissions</h3>
      {tasks.map(task => (
        <div key={task.id} style={cardStyle}>
          <p>Earned: ₦{task.earnedAmount}</p>
          <p>Status: <span style={{ color: task.status === 'approved' ? '#00F5D4' : '#FF4D6D' }}>{task.status}</span></p>
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
  padding: '12px',
  borderRadius: '12px',
  marginBottom: '10px',
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
