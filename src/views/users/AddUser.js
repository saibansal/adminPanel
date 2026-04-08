import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CForm,
  CFormLabel,
  CFormInput,
  CFormSelect,
  CButton,
  CSpinner,
  CAlert,
  CInputGroup,
  CInputGroupText,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSave, cilUser, cilEnvelopeOpen, cilLockLocked } from '@coreui/icons'
import API_CONFIG from 'src/apiConfig'

const AddUser = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditMode = !!id
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(isEditMode)
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState(null)

  const [userData, setUserData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    name: '',
    password: '',
    roles: ['subscriber'],
    description: '',
  })

  useEffect(() => {
    if (isEditMode) {
      const fetchUser = async () => {
        try {
          const response = await fetch(`${API_CONFIG.BASE_URL}wp/v2/users/${id}?context=edit`, {
            headers: {
              'Authorization': API_CONFIG.getJWTHeader()
            },
          })
          if (response.ok) {
            const data = await response.json()
            setUserData({
              username: data.slug,
              email: data.email,
              first_name: data.first_name,
              last_name: data.last_name,
              name: data.name,
              roles: data.roles || ['subscriber'],
              description: data.description,
            })
          }
        } catch (err) {
          setError('Failed to fetch user data.')
        } finally {
          setInitialLoading(false)
        }
      }
      fetchUser()
    }
  }, [id, isEditMode])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const payload = {
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        name: userData.name,
        roles: userData.roles,
        description: userData.description,
      }

      if (!isEditMode) {
        payload.username = userData.username
        payload.password = userData.password
      } else if (userData.password) {
        payload.password = userData.password
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}wp/v2/users${isEditMode ? `/${id}` : ''}`, {
        method: isEditMode ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': API_CONFIG.getJWTHeader(),
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        setSuccess(`User ${isEditMode ? 'updated' : 'created'} successfully!`)
        if (!isEditMode) setTimeout(() => navigate('/users/all'), 1500)
      } else {
        const err = await response.json()
        setError(err.message || 'Failed to save user.')
      }
    } catch (err) {
      setError('Connection error.')
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) return <div className="text-center p-5 mt-5"><CSpinner color="primary" /></div>

  return (
    <CRow className="justify-content-center">
      <CCol md={8}>
        <CCard className="mb-4 shadow-sm border-0">
          <CCardHeader className="bg-white py-3 fw-bold border-bottom">
            {isEditMode ? 'Edit User' : 'Add New User'}
          </CCardHeader>
          <CCardBody className="p-4">
            {error && <CAlert color="danger" dismissible>{error}</CAlert>}
            {success && <CAlert color="success" dismissible>{success}</CAlert>}

            <CForm onSubmit={handleSubmit}>
              <div className="mb-3">
                <CFormLabel>Username (required)</CFormLabel>
                <CInputGroup>
                  <CInputGroupText><CIcon icon={cilUser} /></CInputGroupText>
                  <CFormInput
                    value={userData.username}
                    onChange={(e) => setUserData({ ...userData, username: e.target.value })}
                    disabled={isEditMode}
                    required
                  />
                </CInputGroup>
                {isEditMode && <div className="form-text small">Usernames cannot be changed.</div>}
              </div>

              <div className="mb-3">
                <CFormLabel>Email (required)</CFormLabel>
                <CInputGroup>
                  <CInputGroupText><CIcon icon={cilEnvelopeOpen} /></CInputGroupText>
                  <CFormInput
                    type="email"
                    value={userData.email}
                    onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                    required
                  />
                </CInputGroup>
              </div>

              <CRow className="mb-3">
                <CCol md={6}>
                  <CFormLabel>First Name</CFormLabel>
                  <CFormInput
                    value={userData.first_name}
                    onChange={(e) => setUserData({ ...userData, first_name: e.target.value })}
                  />
                </CCol>
                <CCol md={6}>
                  <CFormLabel>Last Name</CFormLabel>
                  <CFormInput
                    value={userData.last_name}
                    onChange={(e) => setUserData({ ...userData, last_name: e.target.value })}
                  />
                </CCol>
              </CRow>

              <div className="mb-3">
                <CFormLabel>Display Name</CFormLabel>
                <CFormInput
                  value={userData.name}
                  onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                  required
                />
              </div>

              <div className="mb-3">
                <CFormLabel>Role</CFormLabel>
                <CFormSelect value={userData.roles?.[0]} onChange={(e) => setUserData({ ...userData, roles: [e.target.value] })}>
                  <option value="administrator">Administrator</option>
                  <option value="editor">Editor</option>
                  <option value="author">Author</option>
                  <option value="contributor">Contributor</option>
                  <option value="subscriber">Subscriber</option>
                </CFormSelect>
              </div>

              <div className="mb-4">
                <CFormLabel>{isEditMode ? 'New Password' : 'Password'}</CFormLabel>
                <CInputGroup>
                  <CInputGroupText><CIcon icon={cilLockLocked} /></CInputGroupText>
                  <CFormInput
                    type="text" // Use text or a password field with toggle
                    placeholder={isEditMode ? 'Leave empty to keep current password' : 'Enter password'}
                    value={userData.password}
                    onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                    required={!isEditMode}
                  />
                </CInputGroup>
              </div>

              <CButton color="primary" type="submit" disabled={loading}>
                {loading ? <CSpinner size="sm" /> : <><CIcon icon={cilSave} className="me-2" /> {isEditMode ? 'Update User' : 'Add New User'}</>}
              </CButton>
              <CButton color="secondary" variant="ghost" className="ms-3" onClick={() => navigate('/users/all')}>
                Cancel
              </CButton>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default AddUser
