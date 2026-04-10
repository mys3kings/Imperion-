import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth, db } from '../lib/firebase'
import { collection, query, where, getDocs, addDoc, doc, getDoc, updateDoc } from 'firebase/firestore'

export default function Tasks() {
  const [tasks, setTasks] = useState<any[]>([])
  const [submissions, setSubmissions] = useState<any[]>([])
  const [userPlan, setUserPlan] = useState('none')
  const [multiplier, setMultiplier] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [selectedTask, setSelectedTask] = useState<any>(null)
  const [proofUrl, setProofUrl] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser
      if (!user) {
        navigate('/login')
        return
      }

      const userDoc = await getDoc(doc(db, 'users', user.uid))
      const plan = userDoc.data()?.plan || 'none'
      setUserPlan(plan)
      setMultiplier(plan === 'premium' ? 1 : plan === 'basic' ? 0.4 : 0)

      const tasksQuery = query(collection(db, 'tasks'), where('isActive', '==', true))
      const tasksSnap = await getDocs(tasksQuery)
      setTasks(tasksSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })))

      const submissionsQuery = query(collection(db, 'taskSubmissions'), where('userId', '==', user.uid))
      const submissionsSnap = await getDocs(submissionsQuery)
      setSubmissions(submissionsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
      setLoading(false)
    }

    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTask) return
    if (userPlan === 'none') {
      alert('You need to activate a plan (Basic or Premium) to do tasks.')
      return
    }

    setSubmitting(true)
    try {
      const user = auth.currentUser
      if (!user) throw new Error('Not logged in')

      const earnedAmount = selectedTask.price * multiplier

      await addDoc(collection(db, 'taskSubmissions'), {
        userId: user.uid,
        taskId: selectedTask.id,
        taskPrice: selectedTask.price,
        proofImageUrl: proofUrl,
        status: 'pending',
        multiplier,
        earnedAmount,
        submittedAt: new Date()
      })

      alert(`Task submitted! You will earn ₦${earnedAmount} when approved.`)
      setSelectedTask(null)
      setProofUrl('')
    } catch (error: any) {
      alert('Error: ' + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div style={{ padding: '20px', color: 'white' }}>Loading...</div>

  return (
    <div style={{ background: '#0A0F2C', minHeight: '100vh', padding: '20px', paddingBottom: '80px' }}>
      <h2 style={{ color: '#B026FF' }}>Available Tasks</h2>
      <p>Your multiplier: <strong>{multiplier}x</strong> (You earn {multiplier * 100}% of task price)</p>

      {tasks.map(task => (
        <div key={task.id} style={cardStyle}>
          <h3 style={{ color: '#00E5FF' }}>{task.category}</h3>
          <p>Price: ₦{task.price}</p>
          <p>You will earn: ₦{task.price * multiplier}</p>
          <p>People Needed: {task.peopleNeeded}</p>
          <p>{task.description}</p>
          <a href={task.link} target="_blank" rel="noopener noreferrer" style={{ color: '#00E5FF' }}>Task Link</a>
          <button onClick={() => setSelectedTask(task)} style={buttonStyle}>Submit Proof</button>
        </div>
      ))}

      <h3 style={{ color: '#00E5FF', marginTop: '20px' }}>My Submissions</h3>
      {submissions.map(sub => (
        <div key={sub.id} style={cardStyle}>
          <p>Earned: ₦{sub.earnedAmount}</p>
          <p>Status: <span style={{ color: sub.status === 'approved' ? '#00F5D4' : sub.status === 'declined' ? '#FF4D6D' : '#FFD700' }}>{sub.status}</span></p>
        </div>
      ))}

      {selectedTask && (
        <div style={modalStyle}>
          <div style={modalContentStyle}>
            <h3>Submit Proof for {selectedTask.category}</h3>
            <form onSubmit={handleSubmit}>
              <input type="text" placeholder="Image URL (upload to Imgur or similar)" value={proofUrl} onChange={(e) => setProofUrl(e.target.value)} required style={inputStyle} />
              <button type="submit" disabled={submitting} style={buttonStyle}>{submitting ? 'Submitting...' : 'Submit'}</button>
              <button type="button" onClick={() => setSelectedTask(null)} style={cancelButtonStyle}>Cancel</button>
            </form>
          </div>
        </div>
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
  marginBottom: '15px',
  border: '1px solid #00E5FF',
}

const inputStyle = {
  width: '100%',
  padding: '12px',
  borderRadius: '8px',
  border: '1px solid #00E5FF',
  background: '#1C2541',
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
  marginTop: '10px',
}

const cancelButtonStyle = {
  width: '100%',
  padding: '10px',
  background: '#FF4D6D',
  border: 'none',
  borderRadius: '8px',
  color: 'white',
  cursor: 'pointer',
  marginTop: '10px',
}

const modalStyle = {
  position: 'fixed' as const,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0,0,0,0.8)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
}

const modalContentStyle = {
  background: '#1C2541',
  padding: '20px',
  borderRadius: '16px',
  width: '90%',
  maxWidth: '400px',
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
