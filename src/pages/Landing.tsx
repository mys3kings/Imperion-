import React, { useState, useEffect } from 'react'
import { collection, getDocs, addDoc, query, orderBy, limit } from 'firebase/firestore'
import { db } from '../lib/firebase'

export default function Landing() {
  const [reviews, setReviews] = useState<any[]>([])
  const [reviewText, setReviewText] = useState('')
  const [rating, setRating] = useState(5)

  useEffect(() => {
    const fetchReviews = async () => {
      const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'), limit(10))
      const snapshot = await getDocs(q)
      setReviews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    }
    fetchReviews()
  }, [])

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reviewText.trim()) return
    await addDoc(collection(db, 'reviews'), {
      username: 'Guest',
      reviewText,
      rating,
      createdAt: new Date()
    })
    setReviewText('')
    alert('Review submitted!')
  }

  return (
    <div style={{ background: '#0A0F2C', minHeight: '100vh', paddingBottom: '60px' }}>
      {/* Hero Section */}
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h1 style={{ fontSize: '2.5rem', color: '#B026FF' }}>💰 IMPERION</h1>
        <p style={{ fontSize: '1.2rem', marginTop: '16px', color: '#8D99AE' }}>
          Earn money by simply creating TikTok videos, completing tasks, and tapping the I Coin!
        </p>
        <a href="#/signup">
          <button className="btn-primary" style={{ marginTop: '24px' }}>Get Started</button>
        </a>
      </div>

      {/* Apps Section */}
      <div style={{ padding: '20px', display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
        <div style={{ background: '#1C2541', padding: '20px', borderRadius: '16px', textAlign: 'center', width: '100px' }}>🎵 TikTok</div>
        <div style={{ background: '#1C2541', padding: '20px', borderRadius: '16px', textAlign: 'center', width: '100px' }}>💬 WhatsApp</div>
        <div style={{ background: '#1C2541', padding: '20px', borderRadius: '16px', text-align: 'center', width: '100px' }}>📸 Instagram</div>
      </div>

      {/* Pricing Section */}
      <div style={{ padding: '20px' }}>
        <h2 style={{ color: '#00E5FF', textAlign: 'center' }}>What does it take to join Imperion?</h2>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '20px' }}>
          <div style={{ background: '#1C2541', borderRadius: '16px', padding: '20px', width: '200px', textAlign: 'center' }}>
            <h3>Basic</h3>
            <p style={{ fontSize: '24px', color: '#FFD700' }}>₦1,000</p>
            <p>5 Months Access</p>
            <p>40% earning rate</p>
          </div>
          <div style={{ background: '#1C2541', borderRadius: '16px', padding: '20px', width: '200px', textAlign: 'center', border: '2px solid #00E5FF' }}>
            <h3>Premium</h3>
            <p style={{ fontSize: '24px', color: '#FFD700' }}>₦2,500</p>
            <p>Lifetime Access</p>
            <p>100% earning rate</p>
          </div>
        </div>
      </div>

      {/* Features */}
      <div style={{ padding: '20px' }}>
        <h2 style={{ color: '#00E5FF', textAlign: 'center' }}>Features</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginTop: '20px' }}>
          <div style={{ background: '#1C2541', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>🎯 Daily Tasks</div>
          <div style={{ background: '#1C2541', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>🪙 Fix Tap Game</div>
          <div style={{ background: '#1C2541', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>🎁 Daily Bonus</div>
          <div style={{ background: '#1C2541', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>👥 Referrals</div>
          <div style={{ background: '#1C2541', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>📱 Airtime/Data</div>
          <div style={{ background: '#1C2541', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>💳 Withdrawals</div>
        </div>
      </div>

      {/* Reviews Section */}
      <div style={{ padding: '20px' }}>
        <h2 style={{ color: '#00E5FF', textAlign: 'center' }}>What Members Say</h2>
        {reviews.map(review => (
          <div key={review.id} style={{ background: '#1C2541', margin: '10px 0', padding: '12px', borderRadius: '12px' }}>
            <p><strong>{review.username}</strong> {'⭐'.repeat(review.rating)}</p>
            <p>{review.reviewText}</p>
          </div>
        ))}
        <form onSubmit={submitReview} style={{ marginTop: '20px' }}>
          <textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} placeholder="Write a review..." style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#1C2541', color: 'white', border: '1px solid #00E5FF' }} />
          <select value={rating} onChange={(e) => setRating(Number(e.target.value))} style={{ marginTop: '10px', padding: '8px', background: '#1C2541', color: 'white' }}>
            {[1,2,3,4,5].map(r => <option key={r}>{r} Stars</option>)}
          </select>
          <button type="submit" className="btn-primary" style={{ marginTop: '10px', width: '100%' }}>Submit Review</button>
        </form>
      </div>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '20px', color: '#8D99AE' }}>
        <p>© 2025 IMPERION - Your Earning Platform</p>
        <div style={{ marginTop: '10px' }}>
          <a href="https://chat.whatsapp.com/DkUVaf1ZIus1rxummUzXYW" style={{ color: '#00E5FF', margin: '0 10px' }}>WhatsApp Group 1</a>
          <a href="https://chat.whatsapp.com/Fjjnm7F5vIQHKaKZRFxakU" style={{ color: '#00E5FF', margin: '0 10px' }}>WhatsApp Group 2</a>
        </div>
      </footer>
    </div>
  )
      }
