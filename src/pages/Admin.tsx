import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth, db } from '../lib/firebase'
import { collection, getDocs, doc, updateDoc, addDoc, deleteDoc, query, where } from 'firebase/firestore'

export default function Admin() {
  const [passcode, setPasscode] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [withdrawals, setWithdrawals] = useState<any[]>([])
  const [deposits, setDeposits] = useState<any[]>([])
  const [taskSubmissions, setTaskSubmissions] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [newTask, setNewTask] = useState({ category: '', price: '', peopleNeeded: '', link: '', description: '' })
  const [withdrawalLocks, setWithdrawalLocks] = useState({ task: false, referral: false, daily: false })
  const [fixTapLocked, setFixTapLocked] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (authenticated) {
      fetchAllData()
    }
  }, [authenticated])

  const fetchAllData = async () => {
    const withdrawalsSnap = await getDocs(collection(db, 'withdrawals'))
    const depositsSnap = await getDocs(collection(db, 'deposits'))
    const tasksSnap = await getDocs(collection(db, 'tasks'))
    const usersSnap = await getDocs(collection(db, 'users'))
    const submissionsSnap = await getDocs(collection(db, 'taskSubmissions'))

    setWithdrawals(withdrawalsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    setDeposits(depositsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    setTasks(tasksSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    setUsers(usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    setTaskSubmissions(submissionsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (passcode === '2006') {
      setAuthenticated(true)
    } else {
      alert('Invalid passcode')
    }
  }

  const approveWithdrawal = async (withdrawalId: string, userId: string, amount: number, balanceType: string) => {
    await updateDoc(doc(db, 'withdrawals', withdrawalId), { status: 'approved', processedAt: new Date() })
    const userRef = doc(db, 'users', userId)
    const updateField = balanceType === 'icoins' ? 'iCoinsBalance' : `${balanceType}Balance`
    await updateDoc(userRef, { [updateField]: 0 })
    fetchAllData()
  }

  const declineWithdrawal = async (withdrawalId: string) => {
    await updateDoc(doc(db, 'withdrawals', withdrawalId), { status: 'declined', processedAt: new Date() })
    fetchAllData()
  }

  const approveDeposit = async (depositId: string, userId: string, amount: number, planType: string) => {
    await updateDoc(doc(db, 'deposits', depositId), { status: 'approved', approvedAt: new Date() })
    
    const userRef = doc(db, 'users', userId)
    const userDoc = await getDoc(userRef)
    const referredBy = userDoc.data()?.referredBy
    
    await updateDoc(userRef, {
      plan: planType,
      depositBalance: amount,
      planExpiryDate: planType === 'basic' ? new Date(Date.now() + 5 * 30 * 24 * 60 * 60 * 1000) : null
    })
    
    if (referredBy) {
      const commission = amount * 0.10
      const referrerRef = doc(db, 'users', referredBy)
      await updateDoc(referrerRef, { referralBalance: (userDoc.data()?.referralBalance || 0) + commission })
      await addDoc(collection(db, 'transactions'), {
        userId: referredBy,
        type: 'referral_commission',
        amount: commission,
        fromUserId: userId,
        createdAt: new Date()
      })
    }
    fetchAllData()
  }

  const declineDeposit = async (depositId: string) => {
    await updateDoc(doc(db, 'deposits', depositId), { status: 'declined' })
    fetchAllData()
  }

  const approveTask = async (submissionId: string, userId: string, earnedAmount: number) => {
    await updateDoc(doc(db, 'taskSubmissions', submissionId), { status: 'approved', processedAt: new Date() })
    await updateDoc(doc(db, 'users', userId), { taskBalance: (await (await getDoc(doc(db, 'users', userId))).data()?.taskBalance || 0) + earnedAmount })
    fetchAllData()
  }

  const declineTask = async (submissionId: string) => {
    await updateDoc(doc(db, 'taskSubmissions', submissionId), { status: 'declined' })
    fetchAllData()
  }

  const addTask = async () => {
    if (!newTask.category || !newTask.price || !newTask.peopleNeeded) return
    await addDoc(collection(db, 'tasks'), {
      ...newTask,
      price: parseFloat(newTask.price),
      peopleNeeded: parseInt(newTask.peopleNeeded),
      isActive: true,
      createdAt: new Date()
    })
    setNewTask({ category: '', price: '', peopleNeeded: '', link: '', description: '' })
    fetchAllData()
  }

  const deleteTask = async (taskId: string) => {
    await deleteDoc(doc(db, 'tasks', taskId))
    fetchAllData()
  }

  if (!authenticated) {
    return (
      <div style={{ background: '#0A0F2C', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <form onSubmit={handleLogin} style={{ background: '#1C2541', padding: '30px', borderRadius: '16px' }}>
          <h2 style={{ color: '#B026FF' }}>Admin Access</h2>
          <input type="password" placeholder="Enter passcode" value={passcode} onChange={(e) => setPasscode(e.target.value)} style={inputStyle} />
          <button type="submit" style={buttonStyle}>Login</button>
        </form>
      </div>
    )
  }

  return (
    <div style={{ background: '#0A0F2C', minHeight: '100vh', padding: '20px', paddingBottom: '80px' }}>
      <h2 style={{ color: '#B026FF' }}>Admin Panel</h2>

      <h3>Withdrawal Requests</h3>
      {withdrawals.filter(w => w.status === 'pending').map(w => (
        <div key={w.id} style={cardStyle}>
          <p>User: {w.userId}</p>
          <p>Amount: ₦{w.amount}</p>
          <p>Type: {w.balanceType}</p>
          <p>Bank: {w.bankName}</p>
          <p>Account: {w.accountNumber}</p>
          <button onClick={() => approveWithdrawal(w.id, w.userId, w.amount, w.balanceType)} style={approveButton}>Approve</button>
          <button onClick={() => declineWithdrawal(w.id)} style={declineButton}>Decline</button>
        </div>
      ))}

      <h3>Deposit Requests</h3>
      {deposits.filter(d => d.status === 'pending').map(d => (
        <div key={d.id} style={cardStyle}>
          <p>User: {d.userId}</p>
          <p>Amount: ₦{d.amount}</p>
          <p>Plan: {d.planType}</p>
          <a href={d.receiptImageUrl} target="_blank">View Receipt</a>
          <button onClick={() => approveDeposit(d.id, d.userId, d.amount, d.planType)} style={approveButton}>Approve</button>
          <button onClick={() => declineDeposit(d.id)} style={declineButton}>Decline</button>
        </div>
      ))}

      <h3>Task Submissions</h3>
      {taskSubmissions.filter(s => s.status === 'pending').map(s => (
        <div key={s.id} style={cardStyle}>
          <p>User: {s.userId}</p>
          <p>Earned: ₦{s.earnedAmount}</p>
          <a href={s.proofImageUrl} target="_blank">View Proof</a>
          <button onClick={() => approveTask(s.id, s.userId, s.earnedAmount)} style={approveButton}>Approve</button>
          <button onClick={() => declineTask(s.id)} style={declineButton}>Decline</button>
        </div>
      ))}

      <h3>Add Task</h3>
      <div style={cardStyle}>
        <input placeholder="Category" value={newTask.category} onChange={(e) => setNewTask({...newTask, category: e.target.value})} style={inputStyle} />
        <input placeholder="Price (₦)" value={newTask.price} onChange={(e) => setNewTask({...newTask, price: e.target.value})} style={inputStyle} />
        <input placeholder="People Needed" value={newTask.peopleNeeded} onChange={(e) => setNewTask({...newTask, peopleNeeded: e.target.value})} style={inputStyle} />
        <input placeholder="Link" value={newTask.link} onChange={(e) => setNewTask({...newTask, link: e.target.value})} style={inputStyle} />
        <input placeholder="Description" value={newTask.description} onChange={(e) => setNewTask({...newTask, description: e.target.value})} style={inputStyle} />
        <button onClick={addTask} style={buttonStyle}>Add Task</button>
      </div>

      <h3>All Users ({users.length})</h3>
      {users.map(u => (
        <div key={u.id} style={cardStyle}>
          <p>{u.username} - {u.email} - Plan: {u.plan}</p>
        </div>
      ))}

      <button onClick={() => navigate('/')} style={buttonStyle}>Back to Site</button>

      <div style={bottomNavStyle}>
        <button onClick={() => navigate('/')} style={navItemStyle}>🏠 Home</button>
      </div>
    </div>
  )
}

const inputStyle = {
  width: '100%',
  padding: '10px',
  margin: '5px 0',
  borderRadius: '8px',
  border: '1px solid #00E5FF',
  background: '#1C2541',
  color: 'white',
}

const buttonStyle = {
  padding: '10px 20px',
  background: 'linear-gradient(135deg, #00E5FF, #B026FF)',
  border: 'none',
  borderRadius: '8px',
  color: 'white',
  cursor: 'pointer',
  margin: '5px',
}

const approveButton = {
  padding: '5px 15px',
  background: '#00F5D4',
  border: 'none',
  borderRadius: '8px',
  color: '#0A0F2C',
  cursor: 'pointer',
  marginRight: '10px',
}

const declineButton = {
  padding: '5px 15px',
  background: '#FF4D6D',
  border: 'none',
  borderRadius: '8px',
  color: 'white',
  cursor: 'pointer',
}

const cardStyle = {
  background: '#1C2541',
  padding: '15px',
  borderRadius: '12px',
  marginBottom: '10px',
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
