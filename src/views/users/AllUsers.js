import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CButton,
  CSpinner,
  CAlert,
  CAvatar,
  CBadge,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash, cilUserPlus, cilUser } from '@coreui/icons'
import API_CONFIG from 'src/apiConfig'
import avatar8 from './../../assets/images/avatars/8.jpg'

const AllUsers = () => {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [processingId, setProcessingId] = useState(null)
  const [statusModal, setStatusModal] = useState({ visible: false, title: '', message: '', color: 'primary' })
  const [deleteConfirm, setDeleteConfirm] = useState({ visible: false, id: null })

  const showStatus = (title, message, color = 'primary') => {
    setStatusModal({ visible: true, title, message, color })
  }

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}wp/v2/users?context=edit`, {
        headers: {
          'Authorization': API_CONFIG.getJWTHeader()
        }
      })
      if (response.ok) {
        setUsers(await response.json())
      } else {
        const err = await response.json()
        setError(err.message || 'Failed to load users.')
      }
    } catch (err) {
      setError('Connection error.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleDelete = (id) => {
    setDeleteConfirm({ visible: true, id })
  }

  const confirmDelete = async () => {
    const id = deleteConfirm.id
    setDeleteConfirm({ visible: false, id: null })
    try {
      setProcessingId(id)
      const response = await fetch(`${API_CONFIG.BASE_URL}wp/v2/users/${id}?reassign=1`, {
        method: 'DELETE',
        headers: {
          'Authorization': API_CONFIG.getJWTHeader()
        }
      })
      if (response.ok) {
        setUsers(users.filter((u) => u.id !== id))
        showStatus('Success', 'User deleted successfully.', 'success')
      } else {
        showStatus('Error', 'Failed to delete user. Administrators cannot be deleted via API easily.', 'danger')
      }
    } catch (err) {
      showStatus('Error', 'Network error during deletion.', 'danger')
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4 shadow-sm border-0">
          <CCardHeader className="bg-white py-3 d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Users</h5>
            <CButton color="primary" size="sm" onClick={() => navigate('/users/add')}>
              <CIcon icon={cilUserPlus} className="me-2" /> Add New User
            </CButton>
          </CCardHeader>
          <CCardBody>
            {error && <CAlert color="danger">{error}</CAlert>}
            {loading ? (
              <div className="text-center p-5"><CSpinner color="primary" /></div>
            ) : (
              <CTable align="middle" className="mb-0 border" hover responsive>
                <CTableHead className="text-nowrap mt-4">
                  <CTableRow>
                    <CTableHeaderCell className="bg-body-tertiary text-center"><CIcon icon={cilUser} /></CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary">Username</CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary">Name</CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary">Email</CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary">Role</CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary text-center">Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {users.map((user) => (
                    <CTableRow v-for="item in tableItems" key={user.id}>
                      <CTableDataCell className="text-center">
                        <CAvatar size="md" src={user.avatar_urls?.['48'] || avatar8} />
                      </CTableDataCell>
                      <CTableDataCell>
                        <div className="fw-bold">{user.slug}</div>
                        <div className="small text-body-secondary text-nowrap">ID: {user.id}</div>
                      </CTableDataCell>
                      <CTableDataCell>{user.name}</CTableDataCell>
                      <CTableDataCell>{user.email}</CTableDataCell>
                      <CTableDataCell>
                        <CBadge color="info">{user.roles?.[0] || 'Subscriber'}</CBadge>
                      </CTableDataCell>
                      <CTableDataCell className="text-center">
                        <CButton color="info" variant="ghost" size="sm" onClick={() => navigate(`/users/edit/${user.id}`)}>
                          <CIcon icon={cilPencil} />
                        </CButton>
                        <CButton color="danger" variant="ghost" size="sm" disabled={processingId === user.id} onClick={() => handleDelete(user.id)}>
                          {processingId === user.id ? <CSpinner size="sm" /> : <CIcon icon={cilTrash} />}
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            )}
          </CCardBody>
        </CCard>
      </CCol>
      {/* Status Modal */}
      <CModal visible={statusModal.visible} onClose={() => setStatusModal({ ...statusModal, visible: false })}>
        <CModalHeader>
          <CModalTitle className={`text-${statusModal.color}`}>{statusModal.title}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {statusModal.message}
        </CModalBody>
        <CModalFooter>
          <CButton color={statusModal.color} onClick={() => setStatusModal({ ...statusModal, visible: false })}>
            Understand
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Delete Confirmation Modal */}
      <CModal visible={deleteConfirm.visible} onClose={() => setDeleteConfirm({ visible: false, id: null })}>
        <CModalHeader>
          <CModalTitle className="text-danger">Delete User</CModalTitle>
        </CModalHeader>
        <CModalBody>
          Are you sure you want to delete this user? This will move their content to the administrator. This action cannot be undone.
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setDeleteConfirm({ visible: false, id: null })}>
            Cancel
          </CButton>
          <CButton color="danger" className="text-white" onClick={confirmDelete}>
            Delete User
          </CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  )
}

export default AllUsers
