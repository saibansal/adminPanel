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
  CFormTextarea,
  CFormSelect,
  CButton,
  CFormCheck,
  CSpinner,
  CAlert,
  CBadge,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSave, cilTrash, cilImage, cilPlus } from '@coreui/icons'
import API_CONFIG from 'src/apiConfig'

const AddPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditMode = !!id
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState(null)
  const [uploading, setUploading] = useState(false)

  const [pageData, setPageData] = useState({
    title: '',
    content: '',
    status: 'publish',
    featured_media: 0,
    featured_media_url: '',
    parent: 0,
    menu_order: 0,
    template: '',
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { 'Authorization': API_CONFIG.getJWTHeader() }
        if (isEditMode) {
          const res = await fetch(`${API_CONFIG.BASE_URL}wp/v2/pages/${id}?_embed`, { headers })
          if (res.ok) {
            const data = await res.json()
            setPageData({
              ...data,
              title: data.title.rendered,
              content: data.content.rendered,
              featured_media_url: data._embedded?.['wp:featuredmedia']?.[0]?.source_url || '',
            })
          }
        }
      } catch (err) {
        console.error('Initial fetch failed:', err)
        setError('Failed to load page data.')
      } finally {
        setInitialLoading(false)
      }
    }
    fetchData()
  }, [id, isEditMode])

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      let processedFile = file;
      const formData = new FormData()
      formData.append('file', processedFile)
      formData.append('title', processedFile.name)
      const res = await fetch(`${API_CONFIG.BASE_URL}wp/v2/media`, {
        method: 'POST',
        headers: { 'Authorization': API_CONFIG.getJWTHeader() },
        body: formData
      })
      if (res.ok) {
        const media = await res.json()
        setPageData(prev => ({ ...prev, featured_media: media.id, featured_media_url: media.source_url }))
      }
    } catch (err) {
      console.error('Upload failed:', err)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const payload = {
        title: pageData.title,
        content: pageData.content,
        status: pageData.status,
        menu_order: pageData.menu_order,
        template: pageData.template,
      }

      if (pageData.featured_media > 0) {
        payload.featured_media = pageData.featured_media
      }
      
      if (pageData.parent > 0) {
        payload.parent = pageData.parent
      }

      const apiUrl = `${API_CONFIG.BASE_URL}wp/v2/pages${isEditMode ? `/${id}` : ''}`
      const response = await fetch(apiUrl, {
        method: isEditMode ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': API_CONFIG.getJWTHeader()
        },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        setSuccess(`Page ${isEditMode ? 'updated' : 'published'} successfully!`)
        if (!isEditMode) setTimeout(() => navigate('/pages/all'), 1500)
      } else {
        const errData = await response.json()
        console.error('WP Page Error Response:', errData)
        throw new Error(errData.message || 'Failed to save page.')
      }
    } catch (err) {
      console.error('Submission Error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) return <div className="text-center p-5 mt-5"><CSpinner color="primary" /></div>

  return (
    <CRow>
      <CCol lg={9}>
        <CCard className="mb-4 shadow-sm border-0">
          <CCardBody className="p-4">
            {error && <CAlert color="danger" dismissible>{error}</CAlert>}
            {success && <CAlert color="success" dismissible>{success}</CAlert>}
            <CFormInput
              size="lg"
              className="fw-bold border-0 border-bottom rounded-0 fs-2 mb-4 p-0 no-focus-outline"
              placeholder="Add title"
              value={pageData.title}
              onChange={(e) => setPageData({ ...pageData, title: e.target.value })}
              required
            />
            <CFormTextarea
              rows="20"
              className="border-0 bg-transparent p-0 no-focus-outline fs-5"
              placeholder="Start writing or type / to choose a block..."
              value={pageData.content}
              onChange={(e) => setPageData({ ...pageData, content: e.target.value })}
            />
          </CCardBody>
        </CCard>
      </CCol>

      <CCol lg={3}>
        <CCard className="mb-4 shadow-sm border-0">
          <CCardHeader className="bg-white py-3 fw-bold border-bottom">Page Settings</CCardHeader>
          <CCardBody className="p-3">
            <div className="mb-3">
              <CFormLabel className="small fw-bold">Status</CFormLabel>
              <CFormSelect size="sm" value={pageData.status} onChange={(e) => setPageData({ ...pageData, status: e.target.value })}>
                <option value="publish">Published</option>
                <option value="draft">Draft</option>
                <option value="pending">Pending Review</option>
                <option value="private">Private</option>
              </CFormSelect>
            </div>
            <div className="mb-3">
               <CFormLabel className="small fw-bold">Featured Image</CFormLabel>
               <div 
                  className="bg-light border rounded text-center p-2 cursor-pointer position-relative" 
                  style={{ minHeight: '120px' }}
                  onClick={() => document.getElementById('page-img-input').click()}
               >
                  {pageData.featured_media_url ? (
                    <img src={pageData.featured_media_url} className="img-fluid rounded" alt="Featured" />
                  ) : (
                    <div className="py-4 text-muted"><CIcon icon={cilImage} size="xl" className="opacity-25" /><br/>Set featured image</div>
                  )}
                  {uploading && <div className="position-absolute top-50 start-50 translate-middle"><CSpinner size="sm"/></div>}
                  <input type="file" id="page-img-input" hidden onChange={handleImageUpload} accept="image/*" />
               </div>
            </div>
            <div className="mb-3">
              <CFormLabel className="small fw-bold">Menu Order</CFormLabel>
              <CFormInput type="number" size="sm" value={pageData.menu_order} onChange={(e) => setPageData({ ...pageData, menu_order: parseInt(e.target.value) })} />
            </div>
            <div className="mb-4 pt-4 border-top">
              <CButton color="primary" className="w-100" onClick={handleSubmit} disabled={loading}>
                {loading ? <CSpinner size="sm" /> : (isEditMode ? 'Update' : 'Publish')}
              </CButton>
            </div>
          </CCardBody>
        </CCard>
      </CCol>

      <style>{`
        .no-focus-outline:focus { outline: none; box-shadow: none; border-bottom-color: #321fdb !important; }
        .cursor-pointer { cursor: pointer; }
      `}</style>
    </CRow>
  )
}

export default AddPage
