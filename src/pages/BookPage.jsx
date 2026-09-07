import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { api, ApiError } from '../api.js'

export default function BookPage() {
  const { slotId } = useParams()
  const navigate = useNavigate()

  const [slot, setSlot] = useState(null)
  const [loadError, setLoadError] = useState(null)

  const [eventType, setEventType] = useState('Wedding')
  const [hostName, setHostName] = useState('')
  const [guestCount, setGuestCount] = useState(100)
  const [notes, setNotes] = useState('')

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [conflict, setConflict] = useState(false) // 409 — the case the assignment cares about

  useEffect(() => {
    api.get(`/api/hall-slots/${slotId}`)
      .then(setSlot)
      .catch((err) => setLoadError(err.message))
  }, [slotId])

  async function submit(e) {
    e.preventDefault()
    setError(null)
    setConflict(false)
    setBusy(true)
    try {
      const booking = await api.post('/api/bookings', {
        hallSlotId: Number(slotId),
        eventType,
        hostName,
        guestCount: Number(guestCount),
        notes: notes || null,
        extraServices: [],
      })
      navigate('/my-bookings', { state: { justBooked: booking.id } })
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setConflict(true) // the slot was taken by someone else in the meantime
      } else if (err instanceof ApiError && err.status === 401) {
        navigate('/login')
      } else {
        setError(err.message)
      }
    } finally {
      setBusy(false)
    }
  }

  if (loadError) return <p className="error">{loadError}</p>
  if (!slot) return <p>טוען...</p>

  return (
    <div className="card form-card">
      <h1>הזמנת אולם</h1>
      <p className="slot-summary">
        <strong>{slot.hallName}</strong> · {slot.venueName}<br />
        {new Date(slot.date).toLocaleDateString('he-IL')} · {slot.shift} · ₪{slot.basePrice.toLocaleString()}
      </p>

      {conflict ? (
        <div className="conflict-box">
          <h2>התאריך נתפס 😕</h2>
          <p>מישהו אחר הזמין את ה־slot הזה ממש עכשיו (תשובת 409 מהשרת). בבקשה בחרי אולם או תאריך אחר.</p>
          <Link className="btn" to="/">חזרה לרשימת האולמות</Link>
        </div>
      ) : (
        <form onSubmit={submit}>
          <label>סוג אירוע
            <select value={eventType} onChange={(e) => setEventType(e.target.value)}>
              <option>Wedding</option>
              <option>BarMitzvah</option>
              <option>Engagement</option>
              <option>ShevaBrachos</option>
              <option>CommunityEvent</option>
            </select>
          </label>
          <label>שם בעל/ת השמחה
            <input value={hostName} onChange={(e) => setHostName(e.target.value)} required maxLength={200} />
          </label>
          <label>מספר אורחים
            <input type="number" min={1} max={5000} value={guestCount}
                   onChange={(e) => setGuestCount(e.target.value)} required />
          </label>
          <label>הערות (אופציונלי)
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} maxLength={2000} />
          </label>

          {error && <p className="error">{error}</p>}

          <button type="submit" disabled={busy}>{busy ? 'שולח...' : 'אשר הזמנה'}</button>
        </form>
      )}
    </div>
  )
}
