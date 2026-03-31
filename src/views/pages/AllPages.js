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
import { cilPencil, cilTrash, cilPlus, cilExternalLink } from '@coreui/icons'
import API_CONFIG from 'src/apiConfig'

const AllPages = () => {
  const [pages, setPages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [processingId, setProcessingId] = useState(null)
  const [statusModal, setStatusModal] = useState({ visible: false, title: '', message: '', color: 'primary' })
  const [deleteConfirm, setDeleteConfirm] = useState({ visible: false, id: null })
  const navigate = useNavigate()

  const showStatus = (title, message, color = 'primary') => {
    setStatusModal({ visible: true, title, message, color })
  }

  useEffect(() => {
    fetchPages()
  }, [])

  const fetchPages = async () => {
    setLoading(true)
    setError(null)
    
    let allData = []
    let pageNum = 1
    let totalPages = 1

    try {
      const headers = { 'Authorization': API_CONFIG.getJWTHeader() }
      do {
        const response = await fetch(`${API_CONFIG.BASE_URL}wp/v2/pages?status=publish,draft,pending,private,future&_embed&per_page=100&page=${pageNum}`, {
          headers
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch pages (Page ${pageNum})`)
        }

        const data = await response.json()
        allData = [...allData, ...data]
        
        totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '1')
        pageNum++
      } while (pageNum <= totalPages)

      setPages(allData)
    } catch (err) {
      console.error('Fetch error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePage = (id) => {
    setDeleteConfirm({ visible: true, id })
  }

  const confirmDeletePage = async () => {
    const id = deleteConfirm.id
    setDeleteConfirm({ visible: false, id: null })
    setProcessingId(id)
    const authParams = `consumer_key=${API_CONFIG.CONSUMER_KEY}&consumer_secret=${API_CONFIG.CONSUMER_SECRET}`
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}wp/v2/pages/${id}?${authParams}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setPages(pages.filter((p) => p.id !== id))
        showStatus('Success', 'Page moved to trash.', 'success')
      } else {
        showStatus('Delete Failed', 'Could not delete page.', 'danger')
      }
    } catch (err) {
      showStatus('Error', err.message || 'Network error.', 'danger')
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4 shadow-sm border-0">
          <CCardHeader className="bg-white border-bottom d-flex justify-content-between align-items-center py-3">
            <h5 className="mb-0 fw-bold text-dark">Pages</h5>
            <CButton color="primary" size="sm" onClick={() => navigate('/pages/add')}>
              <CIcon icon={cilPlus} className="me-1" /> Add Page
            </CButton>
          </CCardHeader>
          <CCardBody>
            {error && <CAlert color="danger">{error}</CAlert>}

            {loading ? (
              <div className="text-center p-5">
                <CSpinner color="primary" />
              </div>
            ) : (
              <CTable align="middle" className="mb-0 border border-light-subtle rounded" hover responsive>
                <CTableHead className="bg-light">
                  <CTableRow>
                    <CTableHeaderCell>Title</CTableHeaderCell>
                    <CTableHeaderCell>Author</CTableHeaderCell>
                    <CTableHeaderCell>Date</CTableHeaderCell>
                    <CTableHeaderCell>Status</CTableHeaderCell>
                    <CTableHeaderCell className="text-center">Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {pages.map((page) => (
                    <CTableRow key={page.id}>
                      <CTableDataCell>
                        <strong className="text-primary">{page.title.rendered}</strong>
                        <div className="small text-muted">{page.slug}</div>
                      </CTableDataCell>
                      <CTableDataCell>
                        {page._embedded?.author?.[0]?.name || 'Admin'}
                      </CTableDataCell>
                      <CTableDataCell>
                        {new Date(page.date).toLocaleDateString()}
                      </CTableDataCell>
                      <CTableDataCell>
                        <CBadge color={page.status === 'publish' ? 'success' : 'info'}>
                          {page.status.charAt(0).toUpperCase() + page.status.slice(1)}
                        </CBadge>
                      </CTableDataCell>
                      <CTableDataCell className="text-center">
                        <div className="d-flex justify-content-center">
                          <CButton
                            color="info"
                            size="sm"
                            className="me-2 text-white"
                            onClick={() => navigate(`/pages/edit/${page.id}`)}
                          >
                            <CIcon icon={cilPencil} />
                          </CButton>
                          <CButton
                            color="danger"
                            size="sm"
                            className="text-white"
                            disabled={processingId === page.id}
                            onClick={() => handleDeletePage(page.id)}
                          >
                            {processingId === page.id ? <CSpinner size="sm" /> : <CIcon icon={cilTrash} />}
                          </CButton>
                          <CButton
                            color="dark"
                            variant="outline"
                            size="sm"
                            className="ms-2"
                            href={page.link}
                            target="_blank"
                          >
                            <CIcon icon={cilExternalLink} />
                          </CButton>
                        </div>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            )}

            {!loading && pages.length === 0 && !error && (
              <div className="text-center p-5 text-muted">No pages found.</div>
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
          <CModalTitle className="text-danger">Delete Page</CModalTitle>
        </CModalHeader>
        <CModalBody>
          Are you sure you want to move this page to the trash?
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setDeleteConfirm({ visible: false, id: null })}>
            Cancel
          </CButton>
          <CButton color="danger" className="text-white" onClick={confirmDeletePage}>
            Move to Trash
          </CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  )
}

export default AllPages
