import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CForm,
  CFormLabel,
  CFormInput,
  CButton,
  CAvatar,
  CAlert,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilUser, cilSave, cilShieldAlt } from '@coreui/icons'
import API_CONFIG from 'src/apiConfig'
import avatar8 from './../../../assets/images/avatars/8.jpg'

const Profile = () => {
  const [user, setUser] = useState({
    name: '',
    email: '',
    displayName: '',
    firstName: '',
    lastName: '',
    description: '',
  })
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProfile = async () => {
      const token = API_CONFIG.getToken()
      if (!token) {
        setError('You are not logged in. Please log in to view your profile.')
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}wp/v2/users/me`, {
          headers: {
            'Authorization': API_CONFIG.getJWTHeader()
          }
        })
        if (response.ok) {
          const data = await response.json()
          setUser({
            name: data.slug,
            email: data.email,
            displayName: data.name,
            firstName: data.first_name,
            lastName: data.last_name,
            description: data.description,
          })
        } else {
          const errData = await response.json().catch(() => ({}))
          console.error('Profile Fetch Error:', errData)
          setError(errData.message || 'Failed to load profile data from WordPress.')
        }
      } catch (err) {
        console.error('Fetch Exception:', err)
        setError('Connection error: Could not reach the WordPress server.')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const handleUpdate = async (e) => {
    e.preventDefault()
    setUpdating(true)
    setSuccess(null)
    setError(null)

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}wp/v2/users/me`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': API_CONFIG.getJWTHeader()
        },
        body: JSON.stringify({
          first_name: user.firstName,
          last_name: user.lastName,
          description: user.description,
          name: user.displayName,
        })
      })

      if (response.ok) {
        setSuccess('Profile updated successfully!')
        // Update local info
        const updated = await response.json()
        localStorage.setItem('user_info', JSON.stringify({
          email: updated.email,
          name: updated.slug,
          displayName: updated.name,
        }))
      } else {
        setError('Failed to update profile.')
      }
    } catch (err) {
      setError('Connection error.')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) return <div className="text-center p-5"><CSpinner color="primary" /></div>

  return (
    <CRow>
      <CCol md={4}>
        <CCard className="mb-4 shadow-sm border-0">
          <CCardBody className="text-center p-5">
            <CAvatar src={avatar8} size="xl" className="mb-3 border shadow-sm" style={{ width: '120px', height: '120px' }} />
            <h4 className="mb-1">{user.displayName}</h4>
            <p className="text-muted small">Administrator</p>
            <hr />
            <div className="text-start small mt-4">
               <div className="mb-2"><strong>Username:</strong> {user.name}</div>
               <div className="mb-2"><strong>Email:</strong> {user.email}</div>
            </div>
          </CCardBody>
        </CCard>
      </CCol>

      <CCol md={8}>
        <CCard className="mb-4 shadow-sm border-0">
          <CCardHeader className="bg-white py-3 fw-bold">
            <CIcon icon={cilUser} className="me-2" />
            Profile Details
          </CCardHeader>
          <CCardBody className="p-4">
            {success && <CAlert color="success">{success}</CAlert>}
            {error && <CAlert color="danger">{error}</CAlert>}
            
            <CForm onSubmit={handleUpdate}>
              <CRow className="mb-3">
                <CCol md={6}>
                  <CFormLabel>First Name</CFormLabel>
                  <CFormInput 
                    value={user.firstName}
                    onChange={(e) => setUser({...user, firstName: e.target.value})}
                  />
                </CCol>
                <CCol md={6}>
                  <CFormLabel>Last Name</CFormLabel>
                  <CFormInput 
                    value={user.lastName}
                    onChange={(e) => setUser({...user, lastName: e.target.value})}
                  />
                </CCol>
              </CRow>

              <div className="mb-3">
                <CFormLabel>Display Name</CFormLabel>
                <CFormInput 
                  value={user.displayName}
                  onChange={(e) => setUser({...user, displayName: e.target.value})}
                  required
                />
                <div className="form-text small">This is how your name will appear in the dashboard.</div>
              </div>

              <div className="mb-4">
                <CFormLabel>Biographical Info</CFormLabel>
                <CFormInput 
                  as="textarea"
                  rows={4}
                  value={user.description}
                  onChange={(e) => setUser({...user, description: e.target.value})}
                />
              </div>

              <CButton color="primary" type="submit" disabled={updating}>
                {updating ? <CSpinner size="sm" /> : <><CIcon icon={cilSave} className="me-2" /> Save Changes</>}
              </CButton>
            </CForm>
          </CCardBody>
        </CCard>

        <CCard className="mb-4 shadow-sm border-0 border-top border-warning border-3">
          <CCardHeader className="bg-white py-3 fw-bold">
             <CIcon icon={cilShieldAlt} className="me-2" />
             Security Setting
          </CCardHeader>
          <CCardBody className="p-4">
            <p className="text-muted small">Passwords must be updated through the main WordPress website for security reasons.</p>
            <CButton color="warning" variant="outline" size="sm" href={`${API_CONFIG.BASE_URL.replace('/wp-json/', '')}/wp-admin/profile.php`} target="_blank">
               Go to WordPress Profile Settings
            </CButton>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default Profile
