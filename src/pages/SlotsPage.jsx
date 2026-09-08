import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api.js'
import { useAuth } from '../auth.jsx'

const PAGE_SIZE = 5

export default function SlotsPage() {
  const { user } = useAuth()
  const [page, setPage] = useState(1)
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  // Pagination is done by the SERVER: we ask for one page, it returns that page + the totals.
  useEffect(() => {
    setLoading(true)
    setError(null)
    api.get(`/api/hall-slots?page=${page}&pageSize=${PAGE_SIZE}`)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [page])

  if (loading) return <p>טוען...</p>
  if (error) return <p className="error">{error}</p>

  const totalPages = data.totalPages || 1

  return (
    <div>
      <h1>אולמות</h1>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>אולם</th><th>מתחם</th><th>תאריך</th><th>משמרת</th><th>מחיר</th><th>סטטוס</th><th></th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((s) => (
              <tr key={s.id}>
                <td>{s.hallName}</td>
                <td>{s.venueName}</td>
                <td>{new Date(s.date).toLocaleDateString('he-IL')}</td>
                <td>{s.shift}</td>
                <td>₪{s.basePrice.toLocaleString()}</td>
                <td><span className={`badge ${s.status}`}>{s.status}</span></td>
                <td>
                  {s.status === 'Available' && user?.role === 'Customer' && (
                    <Link className="btn-sm" to={`/book/${s.id}`}>הזמנה</Link>
                  )}
                  {s.status === 'Available' && !user && (
                    <Link className="btn-sm" to="/login">התחברי כדי להזמין</Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pager">
        <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>← הקודם</button>
        <span>עמוד {data.page} מתוך {totalPages} · {data.totalCount} סה"כ</span>
        <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>הבא →</button>
      </div>
    </div>
  )
}
