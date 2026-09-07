import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { api } from '../api.js'

export default function MyBookingsPage() {
  const location = useLocation()
  const justBooked = location.state?.justBooked

  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  function load() {
    setError(null)
    api.get('/api/bookings/mine?page=1&pageSize=20')
      .then(setData)
      .catch((err) => setError(err.message))
  }
  useEffect(load, [])

  async function cancel(id) {
    if (!confirm('לבטל את ההזמנה?')) return
    try {
      await api.del(`/api/bookings/${id}`)
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  if (error) return <p className="error">{error}</p>
  if (!data) return <p>טוען...</p>

  return (
    <div>
      <h1>ההזמנות שלי</h1>
      {justBooked && <p className="success">ההזמנה #{justBooked} נקלטה בהצלחה!</p>}
      {data.items.length === 0 && <p>אין הזמנות עדיין.</p>}

      <div className="cards">
        {data.items.map((b) => (
          <div key={b.id} className="card">
            <div className="card-head">
              <strong>{b.hallName} · {b.venueName}</strong>
              <span className={`badge ${b.status}`}>{b.status}</span>
            </div>
            <p>{new Date(b.date).toLocaleDateString('he-IL')} · {b.shift}</p>
            <p>{b.eventType} · {b.hostName} · {b.guestCount} אורחים</p>
            <p>סה"כ: ₪{b.totalPrice.toLocaleString()}</p>
            {b.status !== 'Cancelled' && (
              <button className="btn-danger" onClick={() => cancel(b.id)}>ביטול הזמנה</button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
