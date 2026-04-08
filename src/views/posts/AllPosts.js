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
  CNav,
  CNavItem,
  CNavLink,
} from '@coreui/react'
import { useNavigate } from 'react-router-dom'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash, cilPlus, cilExternalLink } from '@coreui/icons'
import API_CONFIG from 'src/apiConfig'

const AllPosts = () => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [processingId, setProcessingId] = useState(null)
  const [statusModal, setStatusModal] = useState({ visible: false, title: '', message: '', color: 'primary' })
  const [deleteConfirm, setDeleteConfirm] = useState({ visible: false, id: null })
  const [currentTab, setCurrentTab] = useState('active') // 'active' or 'trash'
  const navigate = useNavigate()

  const showStatus = (title, message, color = 'primary') => {
    setStatusModal({ visible: true, title, message, color })
  }

  useEffect(() => {
    fetchPosts()
  }, [currentTab])

  const fetchPosts = async () => {
    setLoading(true)
    setError(null)
    
    let allData = []
    let pageNum = 1
    let totalPages = 1

    try {
      const authHeader = API_CONFIG.getBasicAuthHeader()
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      }

      do {
        const statusQuery = currentTab === 'trash' ? 'status=trash' : 'status=publish,draft,pending,private,future'
        const response = await fetch(`${API_CONFIG.BASE_URL}wp/v2/posts?status=${statusQuery}&_embed&per_page=100&page=${pageNum}`, {
          headers
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || `Failed to fetch posts (Page ${pageNum})`)
        }

        const data = await response.json()
        allData = [...allData, ...data]
        
        totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '1')
        pageNum++
      } while (pageNum <= totalPages)

      setPosts(allData)
    } catch (err) {
      console.error('Fetch error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePost = (id) => {
    setDeleteConfirm({ visible: true, id })
  }

  const confirmDeletePost = async () => {
    const id = deleteConfirm.id
    setDeleteConfirm({ visible: false, id: null })
    setProcessingId(id)
    try {
      const forceParam = currentTab === 'trash' ? '?force=true' : ''
      const response = await fetch(`${API_CONFIG.BASE_URL}wp/v2/posts/${id}${forceParam}`, {
        method: 'DELETE',
        headers: {
          'Authorization': API_CONFIG.getBasicAuthHeader(),
        },
      })

      if (response.ok) {
        setPosts(posts.filter((p) => p.id !== id))
        showStatus('Success', currentTab === 'trash' ? 'Post deleted permanently.' : 'Post moved to trash.', 'success')
      } else {
        const errorData = await response.json().catch(() => ({}))
        showStatus('Delete Failed', errorData.message || 'Could not delete post.', 'danger')
      }
    } catch (err) {
      showStatus('Error', err.message || 'Network error.', 'danger')
    } finally {
      setProcessingId(null)
    }
  }

  const handleRestorePost = async (id) => {
    setProcessingId(id)
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}wp/v2/posts/${id}`, {
        method: 'POST', // WP REST API use POST for updates
        headers: {
          'Content-Type': 'application/json',
          'Authorization': API_CONFIG.getBasicAuthHeader(),
        },
        body: JSON.stringify({ status: 'publish' })
      })

      if (response.ok) {
        setPosts(posts.filter(p => p.id !== id))
        showStatus('Restored', 'Post has been moved back to Published.', 'success')
      } else {
        showStatus('Restore Failed', 'Failed to restore post.', 'danger')
      }
    } catch (err) {
      showStatus('Error', 'Network error.', 'danger')
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4 shadow-sm border-0">
          <CCardHeader className="bg-white border-bottom d-flex justify-content-between align-items-center py-3">
            <h5 className="mb-0 fw-bold text-dark">Posts</h5>
            <CButton color="primary" size="sm" onClick={() => navigate('/posts/add')}>
              <CIcon icon={cilPlus} className="me-1" /> Add Post
            </CButton>
          </CCardHeader>
          <CNav variant="tabs" className="px-3 pt-2 bg-light bg-opacity-10">
            <CNavItem>
              <CNavLink active={currentTab === 'active'} onClick={() => setCurrentTab('active')} className="cursor-pointer">
                Active Posts
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink active={currentTab === 'trash'} onClick={() => setCurrentTab('trash')} className="cursor-pointer text-danger">
                Trash Bin
              </CNavLink>
            </CNavItem>
          </CNav>
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
                    <CTableHeaderCell>Categories</CTableHeaderCell>
                    <CTableHeaderCell>Status</CTableHeaderCell>
                    <CTableHeaderCell>Date</CTableHeaderCell>
                    <CTableHeaderCell className="text-center">Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {posts.map((post) => (
                    <CTableRow key={post.id}>
                      <CTableDataCell>
                        <strong className="text-primary">{post.title.rendered}</strong>
                        <div className="small text-muted">{post.slug}</div>
                      </CTableDataCell>
                      <CTableDataCell>
                        {post._embedded?.author?.[0]?.name || 'Admin'}
                      </CTableDataCell>
                      <CTableDataCell>
                        {post._embedded?.['wp:term']?.[0]?.map(cat => (
                          <CBadge key={cat.id} color="secondary" variant="outline" className="me-1">{cat.name}</CBadge>
                        )) || 'Uncategorized'}
                      </CTableDataCell>
                      <CTableDataCell>
                        <CBadge color={post.status === 'publish' ? 'success' : 'info'}>
                          {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                        </CBadge>
                      </CTableDataCell>
                      <CTableDataCell>{new Date(post.date).toLocaleDateString()}</CTableDataCell>
                      <CTableDataCell className="text-center">
                        <div className="d-flex justify-content-center gap-1">
                          {currentTab === 'trash' ? (
                            <>
                              <CButton color="success" variant="ghost" size="sm" title="Restore" onClick={() => handleRestorePost(post.id)}>
                                 {processingId === post.id ? <CSpinner size="sm" /> : <span>Restore</span>}
                              </CButton>
                              <CButton color="danger" variant="ghost" size="sm" title="Delete Permanently" onClick={() => handleDeletePost(post.id)}>
                                <CIcon icon={cilTrash} />
                              </CButton>
                            </>
                          ) : (
                            <>
                              <CButton color="primary" variant="ghost" size="sm" title="Edit" onClick={() => navigate(`/posts/edit/${post.id}`)}>
                                <CIcon icon={cilPencil} />
                              </CButton>
                              <CButton color="danger" variant="ghost" size="sm" title="Move to Trash" disabled={processingId === post.id} onClick={() => handleDeletePost(post.id)}>
                                {processingId === post.id ? <CSpinner size="sm" /> : <CIcon icon={cilTrash} />}
                              </CButton>
                              <CButton color="success" variant="ghost" size="sm" title="View" href={post.link} target="_blank">
                                <CIcon icon={cilExternalLink} />
                              </CButton>
                            </>
                          )}
                        </div>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            )}

            {!loading && posts.length === 0 && !error && (
              <div className="text-center p-5 text-muted">No posts found.</div>
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
          <CModalTitle className="text-danger">Delete Post</CModalTitle>
        </CModalHeader>
        <CModalBody>
          Are you sure you want to move this post to the trash?
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setDeleteConfirm({ visible: false, id: null })}>
            Cancel
          </CButton>
          <CButton color="danger" className="text-white" onClick={confirmDeletePost}>
            Move to Trash
          </CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  )
}

export default AllPosts
