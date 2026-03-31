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
  CAlert,
  CBadge,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react'
import { useNavigate } from 'react-router-dom'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash, cilPlus, cilReload, cilLockLocked, cilLockUnlocked } from '@coreui/icons'
import API_CONFIG from '../../apiConfig'

const AllCoupons = () => {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [statusModal, setStatusModal] = useState({ visible: false, title: '', message: '', color: 'primary' })
  const [deleteConfirm, setDeleteConfirm] = useState({ visible: false, id: null })
  const navigate = useNavigate()

  const showStatus = (title, message, color = 'primary') => {
    setStatusModal({ visible: true, title, message, color })
  }

  const fetchCoupons = async () => {
    setLoading(true)
    setError(null)
    const authParams = `consumer_key=${API_CONFIG.CONSUMER_KEY}&consumer_secret=${API_CONFIG.CONSUMER_SECRET}`
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}wc/v3/coupons?${authParams}`)
      if (!response.ok) throw new Error('Failed to synchronize with WooCommerce')
      const data = await response.json()
      setCoupons(data)
    } catch (err) {
      setError(err.message)
      setCoupons([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCoupons()
  }, [])

  const handleDeleteCoupon = (id) => {
    setDeleteConfirm({ visible: true, id })
  }

  const confirmDeleteCoupon = async () => {
    const id = deleteConfirm.id
    setDeleteConfirm({ visible: false, id: null })
    setLoading(true)
    const authParams = `consumer_key=${API_CONFIG.CONSUMER_KEY}&consumer_secret=${API_CONFIG.CONSUMER_SECRET}`
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}wc/v3/coupons/${id}?force=true&${authParams}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        setCoupons(coupons.filter((c) => c.id !== id))
        showStatus('Success', 'Coupon deleted successfully.', 'success')
      } else {
        showStatus('Error', 'Failed to delete coupon.', 'danger')
      }
    } catch (err) {
      showStatus('Error', err.message || 'Network error.', 'danger')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (coupon) => {
    const newStatus = coupon.status === 'publish' ? 'draft' : 'publish'
    setLoading(true)
    const authParams = `consumer_key=${API_CONFIG.CONSUMER_KEY}&consumer_secret=${API_CONFIG.CONSUMER_SECRET}`
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}wc/v3/coupons/${coupon.id}?${authParams}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        const updatedCoupon = await response.json()
        setCoupons(coupons.map(c => c.id === coupon.id ? updatedCoupon : c))
        showStatus('Success', `Coupon ${newStatus === 'publish' ? 'unlocked' : 'locked'} successfully.`, 'success')
      } else {
        showStatus('Error', 'Failed to update coupon status.', 'danger')
      }
    } catch (err) {
      showStatus('Error', err.message || 'Network error.', 'danger')
    } finally {
      setLoading(false)
    }
  }

  const getDiscountTypeLabel = (type) => {
    const types = {
      percent: 'Percentage',
      percentage: 'Percentage',
      fixed_cart: 'Fixed Cart',
      fixed_product: 'Fixed Product',
    }
    return types[type] || type
  }

  return (
    <CRow>
      <CCol xs={12}>
        {error && <CAlert color="danger" className="mb-4">Sync Error: {error}</CAlert>}
        <CCard className="mb-4 shadow-sm border-0">
          <CCardHeader className="bg-white border-bottom d-flex justify-content-between align-items-center py-3">
            <h5 className="mb-0 fw-bold text-dark">
              Discount Coupons
              <CButton variant="ghost" size="sm" className="ms-2 p-0 text-muted" onClick={fetchCoupons}>
                <CIcon icon={cilReload} size="sm" />
              </CButton>
            </h5>
            <CButton color="primary" size="sm" onClick={() => navigate('/coupons/add')}>
              <CIcon icon={cilPlus} className="me-1" /> Add Coupon
            </CButton>
          </CCardHeader>
          <CCardBody>
            {loading ? (
              <div className="text-center py-5"><CSpinner color="primary" /></div>
            ) : (
              <CTable align="middle" className="mb-0 border" hover responsive>
                <CTableHead className="bg-light">
                  <CTableRow>
                    <CTableHeaderCell>Code</CTableHeaderCell>
                    <CTableHeaderCell>Type</CTableHeaderCell>
                    <CTableHeaderCell>Amount</CTableHeaderCell>
                    <CTableHeaderCell>Usage Limit</CTableHeaderCell>
                    <CTableHeaderCell>Expiry</CTableHeaderCell>
                    <CTableHeaderCell className="text-center">Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {coupons.map((coupon) => (
                    <CTableRow key={coupon.id}>
                      <CTableDataCell>
                        <strong className="text-primary">{coupon.code.toUpperCase()}</strong>
                      </CTableDataCell>
                      <CTableDataCell>{getDiscountTypeLabel(coupon.discount_type)}</CTableDataCell>
                      <CTableDataCell className="fw-bold fs-5">
                        {['percent', 'percentage'].includes(coupon.discount_type) ? `${coupon.amount}%` : `$${coupon.amount}`}
                      </CTableDataCell>
                      <CTableDataCell>
                        <CBadge color="light" className="text-dark border me-1">{coupon.usage_count}</CBadge>
                        <span className="text-muted">/ {coupon.usage_limit || 'Unlimited'}</span>
                      </CTableDataCell>
                      <CTableDataCell>
                        {coupon.date_expires ? (
                          new Date(coupon.date_expires).toLocaleDateString()
                        ) : (
                          <span className="text-muted small">Never</span>
                        )}
                      </CTableDataCell>
                      <CTableDataCell className="text-center">
                        <div className="d-flex justify-content-center gap-1">
                          <CButton
                            color={coupon.status === 'publish' ? 'success' : 'warning'}
                            variant="ghost"
                            size="sm"
                            title={coupon.status === 'publish' ? 'Lock Coupon' : 'Unlock Coupon'}
                            onClick={() => handleToggleStatus(coupon)}
                          >
                            <CIcon icon={coupon.status === 'publish' ? cilLockUnlocked : cilLockLocked} />
                          </CButton>
                          <CButton
                            color="info"
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/coupons/edit/${coupon.id}`)}
                          >
                            <CIcon icon={cilPencil} />
                          </CButton>
                          <CButton
                            color="danger"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCoupon(coupon.id)}
                          >
                            <CIcon icon={cilTrash} />
                          </CButton>
                        </div>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                  {coupons.length === 0 && !loading && (
                    <CTableRow>
                      <CTableDataCell colSpan={6} className="text-center py-5 text-muted">No active coupons found in store.</CTableDataCell>
                    </CTableRow>
                  )}
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
          <CModalTitle className="text-danger">Delete Coupon</CModalTitle>
        </CModalHeader>
        <CModalBody>
          Are you sure you want to permanently delete this coupon from WooCommerce? This action cannot be undone.
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setDeleteConfirm({ visible: false, id: null })}>
            Cancel
          </CButton>
          <CButton color="danger" className="text-white" onClick={confirmDeleteCoupon}>
            Delete Permanently
          </CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  )
}

export default AllCoupons
