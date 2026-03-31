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
  CBadge,
  CButton,
  CSpinner,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormLabel,
  CFormSelect,
  CAlert,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilBasket,
  cilSearch,
  cilCloudDownload,
  cilCloudUpload,
  cilCheckCircle,
  cilBan,
  cilTrash,
  cilInfo
} from '@coreui/icons'
import API_CONFIG from '../../apiConfig'

const AllOrders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [newOrder, setNewOrder] = useState({ customer_id: '', total: '', status: 'processing' })
  const [processingId, setProcessingId] = useState(null)
  const [statusModal, setStatusModal] = useState({ visible: false, title: '', message: '', color: 'primary' })
  const [deleteConfirm, setDeleteConfirm] = useState({ visible: false, id: null })

  const showStatus = (title, message, color = 'primary') => {
    setStatusModal({ visible: true, title, message, color })
  }

  // Synchronize with WooCommerce REST API
  const fetchOrders = async () => {
    setLoading(true)
    try {
      const authParams = `consumer_key=${API_CONFIG.CONSUMER_KEY}&consumer_secret=${API_CONFIG.CONSUMER_SECRET}`
      const response = await fetch(`${API_CONFIG.BASE_URL}wc/v3/orders?${authParams}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      if (!response.ok) throw new Error('Failed to synchronize with WooCommerce API')
      const data = await response.json()

      // Transform API data to local UI format
      const transformed = data.map(o => ({
        id: `#${o.id}`,
        db_id: o.id,
        customer: o.billing ? `${o.billing.first_name || ''} ${o.billing.last_name || ''}`.trim() : 'Anonymous',
        date: o.date_created ? o.date_created.split('T')[0] : 'N/A',
        total: `${o.currency_symbol || '$'}${o.total}`,
        status: o.status ? o.status.charAt(0).toUpperCase() + o.status.slice(1).replace('-', ' ') : 'Unknown',
        raw: o
      }))
      setOrders(transformed)
      setError(null)
    } catch (err) {
      setError(`Sync Failed: ${err.message}`)
      setOrders([]) // Ensure no stale/dummy data is shown
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const handleUpdateStatus = async (db_id, newStatus) => {
    const apiStatus = newStatus.toLowerCase().replace(' ', '-')
    setProcessingId(db_id)
    try {
      const authParams = `consumer_key=${API_CONFIG.CONSUMER_KEY}&consumer_secret=${API_CONFIG.CONSUMER_SECRET}`
      const response = await fetch(`${API_CONFIG.BASE_URL}wc/v3/orders/${db_id}?${authParams}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: apiStatus })
      })
      if (response.ok) {
        // Optimistic UI: Update in state immediately
        setOrders(orders.map(o => o.db_id === db_id ? { ...o, status: newStatus } : o))
        showStatus('Success', `Order status updated to ${newStatus}`, 'success')
      } else {
        showStatus('Update Failed', 'Failed to update order status on server.', 'danger')
      }
    } catch (err) {
      showStatus('Network Error', 'Network error during status update.', 'danger')
    } finally {
      setProcessingId(null)
    }
  }

  const handleDeleteOrder = (db_id) => {
    setDeleteConfirm({ visible: true, id: db_id })
  }

  const confirmDeleteOrder = async () => {
    const db_id = deleteConfirm.id
    setDeleteConfirm({ visible: false, id: null })
    setLoading(true)
    const authParams = `consumer_key=${API_CONFIG.CONSUMER_KEY}&consumer_secret=${API_CONFIG.CONSUMER_SECRET}`
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}wc/v3/orders/${db_id}?force=true&${authParams}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        // Optimistic UI: Remove from state immediately
        setOrders(orders.filter(o => o.db_id !== db_id))
        showStatus('Deleted', 'Order removed from WooCommerce.', 'success')
      } else {
        showStatus('Delete Failed', 'Failed to delete order.', 'danger')
      }
    } catch (err) {
      showStatus('Error', 'Network error during deletion.', 'danger')
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (order) => {
    setSelectedOrder(order)
    setShowViewModal(true)
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed': return 'success'
      case 'Processing': return 'info'
      case 'On hold': return 'warning'
      case 'Cancelled': return 'danger'
      default: return 'secondary'
    }
  }

  const handleExport = () => {
    const headers = ['Order ID', 'Customer', 'Date', 'Status', 'Total']
    const csvContent = [
      headers.join(','),
      ...orders.map(o => `${o.id},"${o.customer}",${o.date},${o.status},"${o.total}"`)
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.setAttribute('hidden', '')
    a.setAttribute('href', url)
    a.setAttribute('download', `woo_orders_export_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const [importProgress, setImportProgress] = useState(null)

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
        setImportProgress(`Syncing ${i + 1} of ${total}...`)
        const line = lines[i]
        const [id, customer, date, status, totalAmount] = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)

        const orderData = {
          status: (status || 'processing').toLowerCase().trim().replace(' ', '-'),
          billing: {
            first_name: (customer || 'Imported').replace(/"/g, '').split(' ')[0],
            last_name: (customer || '').replace(/"/g, '').split(' ').slice(1).join(' ') || 'Customer'
          },
          fee_lines: [
            {
              name: "Imported Total",
              total: totalAmount ? totalAmount.replace(/[^0-9.]/g, '') : "0.00",
              tax_status: "none"
            }
          ]
        }

        try {
          const response = await fetch(`${API_CONFIG.BASE_URL}wc/v3/orders?${authParams}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
          })
          if (response.ok) successCount++
        } catch (err) {
          console.error('Import row failed:', err)
        }
      }

      setImportProgress(null)
      showStatus('Sync Complete', `${successCount} orders persisted to WordPress.`, 'success')
      fetchOrders()
    }
    reader.readAsText(file)
  }

  return (
    <CRow>
      <CCol xs={12}>
        {error && <CAlert color="warning" className="shadow-sm border-0">Connection Status: {error}</CAlert>}
        {importProgress && <CAlert color="info" className="shadow-sm border-0 py-2"><CSpinner size="sm" className="me-2" /> {importProgress}</CAlert>}
        <CCard className="mb-4 shadow-sm border-0">
          <CCardHeader className="bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
            <div className="fw-bold fs-5 text-dark">
              <CIcon icon={cilBasket} className="me-2 text-primary" />
              Orders
              <CButton variant="ghost" size="sm" className="ms-2 p-0 text-muted" onClick={fetchOrders} title="Refresh Sync">
                <CIcon icon={cilCloudDownload} size="sm" />
              </CButton>
            </div>
            <div className="d-flex gap-2">
              <input type="file" id="order-import-input" hidden accept=".csv" onChange={handleImport} />
              <CButton color="outline-primary" size="sm" onClick={() => document.getElementById('order-import-input').click()}>
                <CIcon icon={cilCloudUpload} className="me-1" /> Import
              </CButton>
              <CButton color="outline-primary" size="sm" onClick={handleExport}>
                <CIcon icon={cilCloudDownload} className="me-1" /> Export
              </CButton>
              <CButton color="primary" size="sm" onClick={() => setShowAddModal(true)}>Add Order</CButton>
            </div>
          </CCardHeader>
          <CCardBody>
            <div className="mb-4 d-flex justify-content-between">
              <CInputGroup className="w-25">
                <CInputGroupText><CIcon icon={cilSearch} /></CInputGroupText>
                <CFormInput placeholder="Search records..." />
              </CInputGroup>
              <div className="d-flex gap-2 align-items-center text-muted small">
                Filter:
                <CBadge color="light" shape="rounded-pill" className="text-dark border cursor-pointer">All</CBadge>
                <CBadge color="light" shape="rounded-pill" className="text-dark border cursor-pointer">Pending</CBadge>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-5"><CSpinner color="primary" /></div>
            ) : (
              <CTable align="middle" className="mb-0 border" hover responsive>
                <CTableHead className="text-nowrap">
                  <CTableRow>
                    <CTableHeaderCell className="bg-body-tertiary">ID</CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary">Customer</CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary">Date</CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary">Status</CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary">Total</CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary text-center">Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {orders.map((order, index) => (
                    <CTableRow key={index}>
                      <CTableDataCell className="fw-bold">{order.id}</CTableDataCell>
                      <CTableDataCell>{order.customer}</CTableDataCell>
                      <CTableDataCell>{order.date}</CTableDataCell>
                      <CTableDataCell>
                        <CBadge color={getStatusBadge(order.status)}>{order.status}</CBadge>
                      </CTableDataCell>
                      <CTableDataCell className="fw-bold">{order.total}</CTableDataCell>
                      <CTableDataCell className="text-center">
                        <div className="d-flex justify-content-center gap-1">
                          <CButton color="primary" variant="ghost" size="sm" onClick={() => handleViewDetails(order)}>View</CButton>
                          <CButton color="success" variant="ghost" size="sm" title="Complete" disabled={processingId === order.db_id} onClick={() => handleUpdateStatus(order.db_id, 'Completed')}>
                            {processingId === order.db_id ? <CSpinner size="sm" /> : <CIcon icon={cilCheckCircle} />}
                          </CButton>
                          <CButton color="warning" variant="ghost" size="sm" title="On Hold" disabled={processingId === order.db_id} onClick={() => handleUpdateStatus(order.db_id, 'On Hold')}>
                            {processingId === order.db_id ? <CSpinner size="sm" /> : <CIcon icon={cilInfo} />}
                          </CButton>
                          <CButton color="danger" variant="ghost" size="sm" title="Cancel" disabled={processingId === order.db_id} onClick={() => handleUpdateStatus(order.db_id, 'Cancelled')}>
                            {processingId === order.db_id ? <CSpinner size="sm" /> : <CIcon icon={cilBan} />}
                          </CButton>
                          <CButton color="danger" variant="ghost" size="sm" title="Delete" onClick={() => handleDeleteOrder(order.db_id)}><CIcon icon={cilTrash} /></CButton>
                        </div>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            )}
          </CCardBody>
        </CCard>
      </CCol>

      {/* View Order Modal */}
      <CModal visible={showViewModal} onClose={() => { setShowViewModal(false); setSelectedOrder(null); }} size="lg">
        <CModalHeader><CModalTitle>Order Details: {selectedOrder?.id}</CModalTitle></CModalHeader>
        <CModalBody>
          {selectedOrder && (
            <div className="p-2">
              <CRow className="mb-4">
                <CCol md={6}>
                  <div className="text-muted small text-uppercase fw-bold mb-1">Customer</div>
                  <h5 className="mb-0">{selectedOrder.customer}</h5>
                  <div className="text-muted small">{selectedOrder.raw?.billing?.email || 'No email available'}</div>
                </CCol>
                <CCol md={6} className="text-md-end mt-3 mt-md-0">
                  <div className="text-muted small text-uppercase fw-bold mb-1">Status</div>
                  <CBadge color={getStatusBadge(selectedOrder.status)} className="fs-6">{selectedOrder.status}</CBadge>
                </CCol>
              </CRow>
              <hr className="my-4 opacity-10" />
              <div className="text-muted small text-uppercase fw-bold mb-3">Line Items</div>
              <CTable borderless align="middle" responsive>
                <CTableHead className="bg-light">
                  <CTableRow>
                    <CTableHeaderCell>Product</CTableHeaderCell>
                    <CTableHeaderCell className="text-center">Qty</CTableHeaderCell>
                    <CTableHeaderCell className="text-end">Total</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {selectedOrder.raw?.line_items?.map((item, i) => (
                    <CTableRow key={i}>
                      <CTableDataCell>
                        <div className="fw-semibold">{item.name}</div>
                        <div className="text-muted small">#{item.product_id}</div>
                      </CTableDataCell>
                      <CTableDataCell className="text-center">{item.quantity}</CTableDataCell>
                      <CTableDataCell className="text-end fw-bold">${item.total}</CTableDataCell>
                    </CTableRow>
                  ))}
                  {!selectedOrder.raw && (
                    <CTableRow><CTableDataCell colSpan={3} className="text-center text-muted py-4">Sample data record — no items fetched.</CTableDataCell></CTableRow>
                  )}
                </CTableBody>
              </CTable>
              <CRow className="mt-4">
                <CCol md={8}></CCol>
                <CCol md={4} className="border-top pt-3">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Subtotal:</span>
                    <span>{selectedOrder.total}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2 fs-5 fw-bold text-primary">
                    <span>Total:</span>
                    <span>{selectedOrder.total}</span>
                  </div>
                </CCol>
              </CRow>
            </div>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowViewModal(false)}>Close</CButton>
          <CButton color="primary" onClick={() => window.print()}>Print Invoice</CButton>
        </CModalFooter>
      </CModal>

      {/* Manual Add Order Modal */}
      <CModal visible={showAddModal} onClose={() => setShowAddModal(false)}>
        <CModalHeader><CModalTitle>New Manual Order Record</CModalTitle></CModalHeader>
        <CModalBody>
          <CAlert color="info" className="small">Manual entry only affects this local session view for simulation.</CAlert>
          <CForm className="row g-3">
            <CCol md={12}>
              <CFormLabel>Customer Name</CFormLabel>
              <CFormInput placeholder="e.g. John Wick" />
            </CCol>
            <CCol md={6}>
              <CFormLabel>Total Amount ($)</CFormLabel>
              <CFormInput type="number" placeholder="0.00" />
            </CCol>
            <CCol md={6}>
              <CFormLabel>Initial Status</CFormLabel>
              <CFormSelect>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="on-hold">On Hold</option>
              </CFormSelect>
            </CCol>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowAddModal(false)}>Cancel</CButton>
          <CButton color="primary" onClick={() => setShowAddModal(false)}>Create Record</CButton>
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
          <CModalTitle className="text-danger">Delete Order</CModalTitle>
        </CModalHeader>
        <CModalBody>
          Are you sure you want to permanently delete this order from WooCommerce? This action cannot be undone.
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setDeleteConfirm({ visible: false, id: null })}>
            Cancel
          </CButton>
          <CButton color="danger" className="text-white" onClick={confirmDeleteOrder}>
            Delete Permanently
          </CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  )
}

export default AllOrders
