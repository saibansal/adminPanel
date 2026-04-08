import React, { useState, useEffect } from 'react'
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
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CBadge,
  CAvatar,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormLabel,
  CAlert,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilPeople,
  cilSearch,
  cilFilter,
  cilExternalLink,
  cilPlus,
  cilReload,
  cilCloudDownload,
  cilCloudUpload,
  cilTrash,
  cilPencil,
  cilLockLocked,
  cilLockUnlocked,
  cilBan
} from '@coreui/icons'
import API_CONFIG from '../../apiConfig'

const AllCustomers = () => {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  // Form state
  const [newCustomer, setNewCustomer] = useState({ first_name: '', last_name: '', email: '' })
  const [editingCustomer, setEditingCustomer] = useState(null)

  const [importProgress, setImportProgress] = useState(null)
  const [statusModal, setStatusModal] = useState({ visible: false, title: '', message: '', color: 'primary' })
  const [deleteConfirm, setDeleteConfirm] = useState({ visible: false, id: null })

  const showStatus = (title, message, color = 'primary') => {
    setStatusModal({ visible: true, title, message, color })
  }

  const fetchCustomers = async () => {
    setLoading(true)
    const authParams = `consumer_key=${API_CONFIG.CONSUMER_KEY}&consumer_secret=${API_CONFIG.CONSUMER_SECRET}`
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}wc/v3/customers?${authParams}&per_page=100`)
      if (!response.ok) throw new Error('API Sync Failed')
      const data = await response.json()

      const transformed = data.map(c => {
        const lockMeta = c.meta_data?.find(m => m.key === '_customer_locked')
        return {
          id: c.id,
          name: `${c.first_name || ''} ${c.last_name || ''}`.trim() || c.username || 'Anonymous',
          first_name: c.first_name,
          last_name: c.last_name,
          email: c.email,
          orders: c.orders_count || 0,
          spent: `$${c.total_spent || '0.00'}`,
          location: c.billing ? `${c.billing.city || ''}, ${c.billing.country || ''}`.replace(/^, /, '').trim() : 'Not provided',
          avatar: c.avatar_url,
          is_locked: lockMeta ? lockMeta.value === '1' : false,
          date_created: c.date_created ? c.date_created.split('T')[0] : 'N/A',
          raw: c
        }
      })
      setCustomers(transformed)
      setError(null)
    } catch (err) {
      setError(err.message)
      setCustomers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  const handleDeleteCustomer = (id) => {
    setDeleteConfirm({ visible: true, id })
  }

  const confirmDeleteCustomer = async () => {
    const id = deleteConfirm.id
    setDeleteConfirm({ visible: false, id: null })
    setLoading(true)
    const authParams = `consumer_key=${API_CONFIG.CONSUMER_KEY}&consumer_secret=${API_CONFIG.CONSUMER_SECRET}`
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}wc/v3/customers/${id}?force=true&${authParams}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        setCustomers(customers.filter(c => c.id !== id))
        showStatus('Success', 'Customer deleted successfully.', 'success')
      } else {
        showStatus('Error', 'Failed to delete customer.', 'danger')
      }
    } catch (err) {
      showStatus('Error', 'Network error during deletion.', 'danger')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleLock = async (cust) => {
    const newLockStatus = !cust.is_locked
    const authParams = `consumer_key=${API_CONFIG.CONSUMER_KEY}&consumer_secret=${API_CONFIG.CONSUMER_SECRET}`

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}wc/v3/customers/${cust.id}?${authParams}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meta_data: [{ key: '_customer_locked', value: newLockStatus ? '1' : '0' }]
        })
      })

      if (response.ok) {
        setCustomers(customers.map(c => c.id === cust.id ? { ...c, is_locked: newLockStatus } : c))
      } else {
        showStatus('Update Failed', 'Failed to update lock status.', 'warning')
      }
    } catch (err) {
      showStatus('Connection Error', 'Network error.', 'danger')
    }
  }

  const openEditModal = (cust) => {
    setEditingCustomer({ ...cust })
    setShowEditModal(true)
  }

  const handleSaveEdit = async () => {
    if (!editingCustomer.email) return
    setLoading(true)
    const authParams = `consumer_key=${API_CONFIG.CONSUMER_KEY}&consumer_secret=${API_CONFIG.CONSUMER_SECRET}`

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}wc/v3/customers/${editingCustomer.id}?${authParams}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: editingCustomer.first_name,
          last_name: editingCustomer.last_name,
          email: editingCustomer.email
        })
      })

      if (response.ok) {
        setShowEditModal(false)
        fetchCustomers()
        showStatus('Success', 'Profile updated successfully!', 'success')
      } else {
        const errData = await response.json()
        showStatus('Update Error', errData.message || 'Failed to save changes.', 'danger')
      }
    } catch (err) {
      showStatus('Network Error', 'Could not reach the server.', 'danger')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    const headers = ['ID', 'Name', 'Email', 'Location', 'Orders', 'Spent', 'Date Created']
    const csvContent = [
      headers.join(','),
      ...customers.map(c => `${c.id},"${c.name}","${c.email}","${c.location}",${c.orders},"${c.spent}",${c.date_created}`)
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.setAttribute('hidden', '')
    a.setAttribute('href', url)
    a.setAttribute('download', `woo_customers_export_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const handleImport = (event) => {
    const file = event.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (e) => {
      const text = e.target.result
      const lines = text.split('\n').slice(1).filter(line => line.trim())
      const authParams = `consumer_key=${API_CONFIG.CONSUMER_KEY}&consumer_secret=${API_CONFIG.CONSUMER_SECRET}`

      setLoading(true)
      let successCount = 0
      const total = lines.length

      for (let i = 0; i < total; i++) {
        setImportProgress(`Importing ${i + 1} of ${total}...`)
        const line = lines[i]
        const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
        const nameValue = (parts[1] || 'Imported').replace(/"/g, '')
        const emailValue = (parts[2] || '').replace(/"/g, '')

        if (!emailValue) continue

        const customerData = {
          first_name: nameValue.split(' ')[0],
          last_name: nameValue.split(' ').slice(1).join(' ') || 'Customer',
          email: emailValue
        }

        try {
          const id = parts[0]
          const isUpdate = id && !isNaN(id) && parseInt(id) > 0
          const apiUrl = isUpdate
            ? `${API_CONFIG.BASE_URL}wc/v3/customers/${id}?${authParams}`
            : `${API_CONFIG.BASE_URL}wc/v3/customers?${authParams}`

          const response = await fetch(apiUrl, {
            method: isUpdate ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(customerData)
          })
          if (response.ok) {
            successCount++
          } else if (isUpdate) {
            const createResponse = await fetch(`${API_CONFIG.BASE_URL}wc/v3/customers?${authParams}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(customerData)
            })
            if (createResponse.ok) successCount++
          }
        } catch (err) {
          console.error('Customer import row failed:', err)
        }
      }

      setImportProgress(null)
      showStatus('Import Complete', `${successCount} customers registered in WooCommerce.`, 'success')
      fetchCustomers()
    }
    reader.readAsText(file)
  }

  const handleAddCustomer = async () => {
    if (!newCustomer.email) {
      showStatus('Required Field', 'Email is required for new customers.', 'warning')
      return
    }
    setLoading(true)
    const authParams = `consumer_key=${API_CONFIG.CONSUMER_KEY}&consumer_secret=${API_CONFIG.CONSUMER_SECRET}`
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}wc/v3/customers?${authParams}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCustomer)
      })
      if (response.ok) {
        setShowAddModal(false)
        fetchCustomers()
        setNewCustomer({ first_name: '', last_name: '', email: '' })
        showStatus('Success', 'New customer registered successfully.', 'success')
      } else {
        const errData = await response.json()
        showStatus('Registration Error', errData.message || 'Failed to register customer.', 'danger')
      }
    } catch (err) {
      showStatus('Network Error', 'Connection failed.', 'danger')
    } finally {
      setLoading(false)
    }
  }

  return (
    <CRow>
      <CCol xs={12}>
        {error && <CAlert color="danger" className="mb-4">Connection Error: {error}</CAlert>}
        {importProgress && <CAlert color="info" className="mb-4"><CSpinner size="sm" className="me-2" /> {importProgress}</CAlert>}
        <CCard className="mb-4 shadow-sm border-0">
          <CCardHeader className="bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
            <div className="fw-bold fs-5 text-dark">
              <CIcon icon={cilPeople} className="me-2 text-primary" />
              Customer List
              <CButton variant="ghost" size="sm" className="ms-2 p-0 text-muted" onClick={fetchCustomers} title="Refresh Sync">
                <CIcon icon={cilReload} size="sm" />
              </CButton>
            </div>
            <div className="d-flex gap-2">
              <input type="file" id="cust-import-input" hidden accept=".csv" onChange={handleImport} />
              <CButton color="outline-primary" size="sm" onClick={() => document.getElementById('cust-import-input').click()}>
                <CIcon icon={cilCloudUpload} className="me-1" /> Import
              </CButton>
              <CButton color="outline-primary" size="sm" onClick={handleExport}>
                <CIcon icon={cilCloudDownload} className="me-1" /> Export
              </CButton>
              <CButton color="primary" size="sm" onClick={() => setShowAddModal(true)}>
                <CIcon icon={cilPlus} className="me-1" /> Add Customer
              </CButton>
            </div>
          </CCardHeader>
          <CCardBody>
            <div className="mb-4 d-flex justify-content-between">
              <CInputGroup className="w-50">
                <CInputGroupText><CIcon icon={cilSearch} /></CInputGroupText>
                <CFormInput placeholder="Search customers..." />
              </CInputGroup>
              <div className="d-flex gap-2 align-items-center text-muted small">
                Total: <CBadge color="primary" shape="rounded-pill">{customers.length}</CBadge>
              </div>
            </div>

            {loading && !importProgress ? (
              <div className="text-center py-5"><CSpinner color="primary" /></div>
            ) : (
              <CTable align="middle" className="mb-0 border" hover responsive>
                <CTableHead className="text-nowrap">
                  <CTableRow>
                    <CTableHeaderCell className="bg-body-tertiary">Customer Name</CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary">Email Address</CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary">Location</CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary text-center">Orders</CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary text-center">Total Spent</CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary text-center">Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {customers.map((cust) => (
                    <CTableRow key={cust.id} className={cust.is_locked ? 'opacity-50 grayscale bg-light' : ''}>
                      <CTableDataCell>
                        <div className="d-flex align-items-center">
                          <CAvatar src={cust.avatar || `https://i.pravatar.cc/150?u=${cust.email}`} color="light" className="me-3" size="md" />
                          <div>
                            <div className="fw-bold">{cust.name} {cust.is_locked && <CBadge color="danger" size="sm" className="ms-1">Locked</CBadge>}</div>
                            <div className="small text-muted">Customer since {cust.date_created}</div>
                          </div>
                        </div>
                      </CTableDataCell>
                      <CTableDataCell>{cust.email}</CTableDataCell>
                      <CTableDataCell>{cust.location}</CTableDataCell>
                      <CTableDataCell className="text-center">{cust.orders}</CTableDataCell>
                      <CTableDataCell className="text-center fw-bold">{cust.spent}</CTableDataCell>
                      <CTableDataCell className="text-center">
                        <div className="d-flex justify-content-center gap-1">
                          <CButton color="primary" variant="ghost" size="sm" title="View Profile">
                            <CIcon icon={cilExternalLink} />
                          </CButton>
                          <CButton color="success" variant="ghost" size="sm" title="Edit Profile" onClick={() => openEditModal(cust)}>
                            <CIcon icon={cilPencil} />
                          </CButton>
                          <CButton
                            color={cust.is_locked ? "dark" : "warning"}
                            variant="ghost"
                            size="sm"
                            title={cust.is_locked ? "Unlock Access" : "Lock Access"}
                            onClick={() => handleToggleLock(cust)}
                          >
                            <CIcon icon={cust.is_locked ? cilLockUnlocked : cilLockLocked} />
                          </CButton>
                          <CButton color="danger" variant="ghost" size="sm" title="Delete" onClick={() => handleDeleteCustomer(cust.id)}>
                            <CIcon icon={cilTrash} />
                          </CButton>
                        </div>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                  {customers.length === 0 && !loading && (
                    <CTableRow>
                      <CTableDataCell colSpan={6} className="text-center py-5 text-muted">No customers found.</CTableDataCell>
                    </CTableRow>
                  )}
                </CTableBody>
              </CTable>
            )}
          </CCardBody>
        </CCard>
      </CCol>

      {/* Add Modal */}
      <CModal visible={showAddModal} onClose={() => setShowAddModal(false)}>
        <CModalHeader><CModalTitle>New Customer Registration</CModalTitle></CModalHeader>
        <CModalBody>
          <CForm className="row g-3">
            <CCol md={6}>
              <CFormLabel>First Name</CFormLabel>
              <CFormInput
                value={newCustomer.first_name}
                onChange={(e) => setNewCustomer({ ...newCustomer, first_name: e.target.value })}
                placeholder="e.g. Tony"
              />
            </CCol>
            <CCol md={6}>
              <CFormLabel>Last Name</CFormLabel>
              <CFormInput
                value={newCustomer.last_name}
                onChange={(e) => setNewCustomer({ ...newCustomer, last_name: e.target.value })}
                placeholder="Stark"
              />
            </CCol>
            <CCol md={12}>
              <CFormLabel>Email Address</CFormLabel>
              <CFormInput
                type="email"
                value={newCustomer.email}
                onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                placeholder="tony@stark.com"
              />
            </CCol>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowAddModal(false)}>Cancel</CButton>
          <CButton color="primary" onClick={handleAddCustomer} disabled={loading}>
            {loading ? <CSpinner size="sm" className="me-2" /> : null}
            Register Customer
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Edit Modal */}
      <CModal visible={showEditModal} onClose={() => setShowEditModal(false)}>
        <CModalHeader><CModalTitle>Edit Customer Profile</CModalTitle></CModalHeader>
        <CModalBody>
          {editingCustomer && (
            <CForm className="row g-3">
              <CCol md={6}>
                <CFormLabel>First Name</CFormLabel>
                <CFormInput
                  value={editingCustomer.first_name}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, first_name: e.target.value })}
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Last Name</CFormLabel>
                <CFormInput
                  value={editingCustomer.last_name}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, last_name: e.target.value })}
                />
              </CCol>
              <CCol md={12}>
                <CFormLabel>Email Address</CFormLabel>
                <CFormInput
                  type="email"
                  value={editingCustomer.email}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, email: e.target.value })}
                />
              </CCol>
            </CForm>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowEditModal(false)}>Cancel</CButton>
          <CButton color="primary" onClick={handleSaveEdit} disabled={loading}>
            {loading ? <CSpinner size="sm" className="me-2" /> : null}
            Save Changes
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Status Backdrop Modal */}
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
          <CModalTitle className="text-danger">Delete Customer</CModalTitle>
        </CModalHeader>
        <CModalBody>
          Are you sure you want to permanently delete this customer from WooCommerce? This action cannot be undone.
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setDeleteConfirm({ visible: false, id: null })}>
            Cancel
          </CButton>
          <CButton color="danger" className="text-white" onClick={confirmDeleteCustomer}>
            Delete Permanently
          </CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  )
}

export default AllCustomers
