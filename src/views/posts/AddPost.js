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

const AddPost = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditMode = !!id
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [categories, setCategories] = useState([])
  const [tags, setTags] = useState([])
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [showAddCat, setShowAddCat] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [parentCat, setParentCat] = useState('0')
  const [addingCat, setAddingCat] = useState(false)

  const [postData, setPostData] = useState({
    title: '',
    content: '',
    status: 'publish',
    categories: [],
    tags: [],
    featured_media: 0,
    featured_media_url: '',
    excerpt: '',
    comment_status: 'open',
  })

  const handleAddCategory = async () => {
    if (!newCatName) return
    setAddingCat(true)
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}wp/v2/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': API_CONFIG.getJWTHeader()
        },
        body: JSON.stringify({ 
          name: newCatName,
          parent: parseInt(parentCat)
        })
      })
      if (response.ok) {
        const newCat = await response.json()
        setCategories(prev => [...prev, newCat])
        setPostData(prev => ({ ...prev, categories: [...prev.categories, newCat.id] }))
        setNewCatName('')
        setParentCat('0')
        setShowAddCat(false)
      } else {
        const errData = await response.json()
        alert(errData.message || 'Error adding category')
      }
    } catch (err) {
      console.error('Add Category Error:', err)
    } finally {
      setAddingCat(false)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { 'Authorization': API_CONFIG.getJWTHeader() }
        const [catRes, tagRes] = await Promise.all([
          fetch(`${API_CONFIG.BASE_URL}wp/v2/categories?per_page=100`, { headers }),
          fetch(`${API_CONFIG.BASE_URL}wp/v2/tags?per_page=100`, { headers }),
        ])

        if (catRes.ok) setCategories(await catRes.json())
        if (tagRes.ok) setTags(await tagRes.json())

        if (isEditMode) {
          const res = await fetch(`${API_CONFIG.BASE_URL}wp/v2/posts/${id}?_embed`, { headers })
          if (res.ok) {
            const data = await res.json()
            setPostData({
              ...data,
              title: data.title.rendered,
              content: data.content.rendered,
              excerpt: data.excerpt.rendered,
              featured_media_url: data._embedded?.['wp:featuredmedia']?.[0]?.source_url || '',
            })
          }
        }
      } catch (err) {
        console.error('Initial fetch failed:', err)
        setError('Failed to load post data.')
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
      const formData = new FormData()
      formData.append('file', file)
      formData.append('title', file.name)
      const res = await fetch(`${API_CONFIG.BASE_URL}wp/v2/media`, {
        method: 'POST',
        headers: { 'Authorization': API_CONFIG.getJWTHeader() },
        body: formData
      })
      if (res.ok) {
        const media = await res.json()
        setPostData(prev => ({ ...prev, featured_media: media.id, featured_media_url: media.source_url }))
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
        title: postData.title,
        content: postData.content,
        status: postData.status,
        categories: postData.categories,
        tags: postData.tags,
        excerpt: postData.excerpt,
        comment_status: postData.comment_status
      }

      if (postData.featured_media > 0) {
        payload.featured_media = postData.featured_media
      }

      const apiUrl = `${API_CONFIG.BASE_URL}wp/v2/posts${isEditMode ? `/${id}` : ''}`
      const response = await fetch(apiUrl, {
        method: isEditMode ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': API_CONFIG.getJWTHeader()
        },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        setSuccess(`Post ${isEditMode ? 'updated' : 'published'} successfully!`)
        if (!isEditMode) setTimeout(() => navigate('/posts/all'), 1500)
      } else {
        const errData = await response.json()
        console.error('WP Post Error Response:', errData)
        throw new Error(errData.message || 'Failed to save post.')
      }
    } catch (err) {
      console.error('Submission Error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const renderCategoryTree = (parentId = 0, level = 0) => {
    return categories
      .filter(cat => cat.parent === parentId)
      .map(cat => (
        <React.Fragment key={cat.id}>
          <CFormCheck 
            label={cat.name} 
            checked={postData.categories.includes(cat.id)}
            onChange={(e) => {
              const newCats = e.target.checked 
                ? [...postData.categories, cat.id] 
                : postData.categories.filter(id => id !== cat.id)
              setPostData({ ...postData, categories: newCats })
            }}
            className="small"
            style={{ marginLeft: `${level * 20}px` }}
          />
          {renderCategoryTree(cat.id, level + 1)}
        </React.Fragment>
      ))
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
              value={postData.title}
              onChange={(e) => setPostData({ ...postData, title: e.target.value })}
              required
            />
            <CFormTextarea
              rows="20"
              className="border-0 bg-transparent p-0 no-focus-outline fs-5"
              placeholder="Start writing or type / to choose a block..."
              value={postData.content}
              onChange={(e) => setPostData({ ...postData, content: e.target.value })}
            />
          </CCardBody>
        </CCard>
      </CCol>

      <CCol lg={3}>
        <CCard className="mb-4 shadow-sm border-0">
          <CCardHeader className="bg-white py-3 fw-bold border-bottom">Post Settings</CCardHeader>
          <CCardBody className="p-3">
            <div className="mb-3">
              <CFormLabel className="small fw-bold">Status</CFormLabel>
              <CFormSelect size="sm" value={postData.status} onChange={(e) => setPostData({ ...postData, status: e.target.value })}>
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
                  onClick={() => document.getElementById('post-img-input').click()}
               >
                  {postData.featured_media_url ? (
                    <img src={postData.featured_media_url} className="img-fluid rounded" alt="Featured" />
                  ) : (
                    <div className="py-4 text-muted"><CIcon icon={cilImage} size="xl" className="opacity-25" /><br/>Set featured image</div>
                  )}
                  {uploading && <div className="position-absolute top-50 start-50 translate-middle"><CSpinner size="sm"/></div>}
                  <input type="file" id="post-img-input" hidden onChange={handleImageUpload} accept="image/*" />
               </div>
            </div>
            <div className="mb-3">
              <CFormLabel className="small fw-bold">Categories</CFormLabel>
              <div className="border rounded p-2 bg-light" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {categories.length === 0 ? (
                  <div className="text-muted small p-2">No categories found.</div>
                ) : (
                  renderCategoryTree(0)
                )}
              </div>
              <div className="mt-2 text-start">
                {showAddCat ? (
                  <div className="p-2 border rounded bg-white shadow-sm">
                    <CFormInput 
                      placeholder="Category name" 
                      size="sm" 
                      className="mb-2" 
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                    />
                    <CFormSelect 
                      size="sm" 
                      className="mb-2" 
                      value={parentCat}
                      onChange={(e) => setParentCat(e.target.value)}
                    >
                      <option value="0">— Parent Category —</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </CFormSelect>
                    <div className="d-flex justify-content-between">
                      <CButton 
                        color="secondary" 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setShowAddCat(false)}
                      >
                        Cancel
                      </CButton>
                      <CButton 
                        color="primary" 
                        size="sm" 
                        onClick={handleAddCategory}
                        disabled={!newCatName || addingCat}
                      >
                        {addingCat ? <CSpinner size="sm" /> : 'Add'}
                      </CButton>
                    </div>
                  </div>
                ) : (
                  <CButton 
                    color="link" 
                    size="sm" 
                    className="p-0 text-decoration-none" 
                    onClick={() => setShowAddCat(true)}
                  >
                    + Add New Category
                  </CButton>
                )}
              </div>
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

export default AddPost
