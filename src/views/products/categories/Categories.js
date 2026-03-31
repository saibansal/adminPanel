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
  CForm,
  CFormLabel,
  CFormInput,
  CFormSelect,
  CFormTextarea,
  CSpinner,
  CAlert,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CBadge,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash, cilReload, cilFolder, cilPlus } from '@coreui/icons'
import API_CONFIG from 'src/apiConfig'

const Categories = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Feedback modals
  const [editModal, setEditModal] = useState({ visible: false, category: null })
  const [deleteConfirm, setDeleteConfirm] = useState({ visible: false, id: null })

  // New Category State
  const [newCat, setNewCat] = useState({
    name: '',
    slug: '',
    parent: 0,
    description: '',
  })

  const authParams = `consumer_key=${API_CONFIG.CONSUMER_KEY}&consumer_secret=${API_CONFIG.CONSUMER_SECRET}`

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}wc/v3/products/categories?per_page=100&${authParams}`)
      if (!response.ok) throw new Error('Failed to synchronize with WooCommerce Categories')
      const data = await response.json()
      setCategories(data)
    } catch (err) {
      console.error('Fetch Categories error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAddCategory = async (e) => {
    if (e) e.preventDefault()
    if (!newCat.name) return
    setSubmitting(true)
    setError(null)

    const submissionData = { ...newCat }
    if (!submissionData.slug || submissionData.slug.trim() === '') {
      delete submissionData.slug
    }

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}wc/v3/products/categories?${authParams}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      })

      if (response.ok) {
        setSuccess(`Category "${newCat.name}" added successfully!`)
        setNewCat({ name: '', slug: '', parent: 0, description: '' })
        fetchCategories()
        setTimeout(() => setSuccess(null), 3000)
      } else {
        const errData = await response.json()
        throw new Error(errData.message || 'Failed to create category')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteCategory = async () => {
    const id = deleteConfirm.id
    setSubmitting(true)
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}wc/v3/products/categories/${id}?force=true&${authParams}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        setSuccess('Category permanently removed.')
        setCategories(categories.filter((c) => c.id !== id))
        setDeleteConfirm({ visible: false, id: null })
        setTimeout(() => setSuccess(null), 3000)
      }
    } catch (err) {
      setError('Delete operation failed.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateCategory = async () => {
    const { id, name, description, slug, parent } = editModal.category
    setSubmitting(true)
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}wc/v3/products/categories/${id}?${authParams}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, slug, parent }),
      })
      if (response.ok) {
        setSuccess(`Category "${name}" updated.`)
        fetchCategories()
        setEditModal({ visible: false, category: null })
        setTimeout(() => setSuccess(null), 3000)
      }
    } catch (err) {
      setError('Update failed.')
    } finally {
      setSubmitting(false)
    }
  }

  // Organize hierarchical structure for display
  const renderCategoryRows = (parentId = 0, level = 0) => {
    return categories
      .filter((cat) => cat.parent === parentId)
      .map((cat) => (
        <React.Fragment key={cat.id}>
          <CTableRow>
            <CTableDataCell>
              <div style={{ marginLeft: `${level * 20}px` }} className="d-flex align-items-center">
                {level > 0 && <span className="text-muted opacity-50 me-2">—</span>}
                <CIcon icon={cilFolder} className="text-warning me-2" size="sm" />
                <span className="fw-bold">{cat.name}</span>
              </div>
            </CTableDataCell>
            <CTableDataCell className="small text-muted text-truncate" style={{ maxWidth: '200px' }}>
              {cat.description || 'No description'}
            </CTableDataCell>
            <CTableDataCell className="small font-monospace">{cat.slug}</CTableDataCell>
            <CTableDataCell className="text-center">
              <CBadge color="light" className="text-dark border">{cat.count}</CBadge>
            </CTableDataCell>
            <CTableDataCell className="text-center">
              <div className="d-flex justify-content-center gap-1">
                <CButton color="info" variant="ghost" size="sm" onClick={() => setEditModal({ visible: true, category: { ...cat } })}>
                  <CIcon icon={cilPencil} />
                </CButton>
                <CButton color="danger" variant="ghost" size="sm" onClick={() => setDeleteConfirm({ visible: true, id: cat.id })}>
                  <CIcon icon={cilTrash} />
                </CButton>
              </div>
            </CTableDataCell>
          </CTableRow>
          {renderCategoryRows(cat.id, level + 1)}
        </React.Fragment>
      ))
  }

  return (
    <CRow>
      <CCol md={4}>
        <CCard className="mb-4 shadow-sm border-0">
          <CCardHeader className="bg-white py-3">
            <div className="fw-bold">
              <CIcon icon={cilPlus} className="me-2 text-primary" />
              Add New Product Category
            </div>
          </CCardHeader>
          <CCardBody>
            <CForm className="g-3" onSubmit={handleAddCategory}>
              <div className="mb-3">
                <CFormLabel htmlFor="categoryName" className="small fw-bold">Name</CFormLabel>
                <CFormInput
                  type="text"
                  id="categoryName"
                  placeholder="The name as it appears on your site"
                  value={newCat.name}
                  onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
                  required
                />
              </div>
              <div className="mb-3">
                <CFormLabel htmlFor="categorySlug" className="small fw-bold">Slug (Optional)</CFormLabel>
                <CFormInput
                  type="text"
                  id="categorySlug"
                  placeholder="URL-friendly version of the name"
                  value={newCat.slug}
                  onChange={(e) => setNewCat({ ...newCat, slug: e.target.value })}
                />
              </div>
              <div className="mb-3">
                <CFormLabel htmlFor="parentCategory" className="small fw-bold">Parent Category</CFormLabel>
                <CFormSelect
                  id="parentCategory"
                  value={newCat.parent}
                  onChange={(e) => setNewCat({ ...newCat, parent: parseInt(e.target.value) })}
                >
                  <option value={0}>None</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </CFormSelect>
              </div>
              <div className="mb-3">
                <CFormLabel htmlFor="description" className="small fw-bold">Description</CFormLabel>
                <CFormTextarea
                  id="description"
                  rows="3"
                  value={newCat.description}
                  onChange={(e) => setNewCat({ ...newCat, description: e.target.value })}
                ></CFormTextarea>
              </div>
              <CButton color="primary" type="submit" size="sm" className="w-100" disabled={submitting}>
                {submitting ? <CSpinner size="sm" /> : 'Create Category'}
              </CButton>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
      <CCol md={8}>
        {success && <CAlert color="success" className="shadow-sm border-0 mb-3">{success}</CAlert>}
        {error && <CAlert color="danger" className="shadow-sm border-0 mb-3">{error}</CAlert>}
        <CCard className="mb-4 shadow-sm border-0">
          <CCardHeader className="bg-white py-3 d-flex justify-content-between align-items-center">
            <div className="fw-bold">
              <CIcon icon={cilFolder} className="me-2 text-primary" />
              Category
            </div>
            <CButton color="light" size="sm" onClick={fetchCategories} disabled={loading}>
              {loading ? <CSpinner size="sm" /> : <CIcon icon={cilReload} />}
            </CButton>
          </CCardHeader>
          <CCardBody className="p-0">
            {loading && categories.length === 0 ? (
              <div className="text-center p-5">
                <CSpinner color="primary" />
                <p className="mt-2 text-muted">Synchronizing with WooCommerce Taxonomies...</p>
              </div>
            ) : (
              <CTable align="middle" className="mb-0 overflow-hidden" hover responsive>
                <CTableHead color="light">
                  <CTableRow>
                    <CTableHeaderCell className="border-0">Name</CTableHeaderCell>
                    <CTableHeaderCell className="border-0">Description</CTableHeaderCell>
                    <CTableHeaderCell className="border-0">Slug</CTableHeaderCell>
                    <CTableHeaderCell className="border-0 text-center">Count</CTableHeaderCell>
                    <CTableHeaderCell className="border-0 text-center">Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>{renderCategoryRows()}</CTableBody>
              </CTable>
            )}
          </CCardBody>
        </CCard>
      </CCol>

      {/* Edit Modal */}
      <CModal visible={editModal.visible} onClose={() => setEditModal({ visible: false, category: null })}>
        <CModalHeader><CModalTitle>Edit Category</CModalTitle></CModalHeader>
        <CModalBody>
          {editModal.category && (
            <CForm className="row g-3">
              <CCol md={12}>
                <CFormLabel className="small fw-bold">Name</CFormLabel>
                <CFormInput
                  value={editModal.category.name}
                  onChange={(e) => setEditModal({ ...editModal, category: { ...editModal.category, name: e.target.value } })}
                />
              </CCol>
              <CCol md={12}>
                <CFormLabel className="small fw-bold">Slug</CFormLabel>
                <CFormInput
                  value={editModal.category.slug}
                  onChange={(e) => setEditModal({ ...editModal, category: { ...editModal.category, slug: e.target.value } })}
                />
              </CCol>
              <CCol md={12}>
                <CFormLabel className="small fw-bold">Parent</CFormLabel>
                <CFormSelect
                  value={editModal.category.parent}
                  onChange={(e) => setEditModal({ ...editModal, category: { ...editModal.category, parent: parseInt(e.target.value) } })}
                >
                  <option value={0}>None</option>
                  {categories.filter(c => c.id !== editModal.category.id).map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol md={12}>
                <CFormLabel className="small fw-bold">Description</CFormLabel>
                <CFormTextarea
                  rows="3"
                  value={editModal.category.description}
                  onChange={(e) => setEditModal({ ...editModal, category: { ...editModal.category, description: e.target.value } })}
                />
              </CCol>
            </CForm>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setEditModal({ visible: false, category: null })}>Cancel</CButton>
          <CButton color="primary" onClick={handleUpdateCategory} disabled={submitting}>
            {submitting ? <CSpinner size="sm" /> : 'Save Changes'}
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Delete Confirmation */}
      <CModal visible={deleteConfirm.visible} onClose={() => setDeleteConfirm({ visible: false, id: null })}>
        <CModalHeader><CModalTitle className="text-danger">Permanently Delete Category?</CModalTitle></CModalHeader>
        <CModalBody>This will remove the category from all assigned products. This action cannot be undone.</CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setDeleteConfirm({ visible: false, id: null })}>Cancel</CButton>
          <CButton color="danger" className="text-white" onClick={handleDeleteCategory} disabled={submitting}>
            {submitting ? <CSpinner size="sm" /> : 'Delete Category'}
          </CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  )
}

export default Categories
