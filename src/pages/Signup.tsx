import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { signup } from '../api/auth'
import { Button } from '../components/Button'
import { Input } from '../components/Input'

export function Signup() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const form = new FormData(e.currentTarget)
    try {
      const res = await signup(
        form.get('email') as string,
        form.get('password') as string,
        form.get('name') as string,
      )
      localStorage.setItem('token', res.token)
      localStorage.setItem('user', JSON.stringify(res.user))
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo"><span>x</span>eno CRM</div>
        <div className="auth-subtitle">Create a new account</div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <Input label="Name" name="name" required autoComplete="name" />
          <Input label="Email" name="email" type="email" required autoComplete="email" />
          <Input label="Password" name="password" type="password" required autoComplete="new-password" />
          <Button variant="primary" size="default" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }} disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account ↳'}
          </Button>
        </form>
        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  )
}
