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
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash } from '@coreui/icons'
import API_CONFIG from 'src/apiConfig'

const Categories = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    setLoading(true)
    setError(null)
    const { BASE_URL } = API_CONFIG;

    try {
      // Trying WooCommerce API first with JWT Authentication
      let response = await fetch(`${BASE_URL}wc/v3/products/categories`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': API_CONFIG.getJWTHeader()
        }
      })

      let data;
      const contentType = response.headers.get('content-type');

      if (response.ok && contentType && contentType.includes('application/json')) {
        data = await response.json()
        console.log('Fetched Product Categories from WooCommerce:', data)
        setCategories(data)
      } else {
        // Log the raw response for debugging
        if (response.status === 401) {
          console.error('Authentication Failed. Checking fallback or logging error...');
        }

        const text = await response.text();
        console.warn('WooCommerce API response not OK or not JSON. Status:', response.status);

        // Fallback to standard WP categories
        response = await fetch(`${BASE_URL}wp/v2/categories`, {
          headers: {
            'Authorization': API_CONFIG.getJWTHeader()
          }
        })
        const fallbackContentType = response.headers.get('content-type');

        if (response.ok && fallbackContentType && fallbackContentType.includes('application/json')) {
          data = await response.json()
          console.log('Fetched Basic WordPress Categories:', data)
          setCategories(data.map(cat => ({
            id: cat.id,
            name: cat.name,
            description: cat.description,
            slug: cat.slug,
            count: cat.count || 0
          })))
        } else {
          throw new Error('401 Unauthorized: Invalid or expired JWT token. Please ensure your token in apiConfig.js is correct.')
        }
      }
    } catch (err) {
      console.error('Error fetching categories:', err)
      setError(err.message || 'Could not connect to WordPress. Please check your API settings.')
      // Fallback dummy data for development
      setCategories([
        { id: 1, name: 'Electronics', description: 'Gadgets and gizmos', slug: 'electronics', count: 45 },
        { id: 2, name: 'Clothing', description: 'Fashion and apparel', slug: 'clothing', count: 22 },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <CRow>
      <CCol md={4}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Add New Category</strong>
          </CCardHeader>
          <CCardBody>
            <CForm className="g-3">
              <div className="mb-3">
                <CFormLabel htmlFor="categoryName">Name</CFormLabel>
                <CFormInput type="text" id="categoryName" placeholder="Enter category name" />
              </div>
              <div className="mb-3">
                <CFormLabel htmlFor="categorySlug">Slug</CFormLabel>
                <CFormInput type="text" id="categorySlug" placeholder="Enter category slug" />
              </div>
              <div className="mb-3">
                <CFormLabel htmlFor="parentCategory">Parent Category</CFormLabel>
                <CFormSelect id="parentCategory">
                  <option value="none">None</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </CFormSelect>
              </div>
              <div className="mb-3">
                <CFormLabel htmlFor="description">Description</CFormLabel>
                <CFormTextarea id="description" rows="3"></CFormTextarea>
              </div>
              <CButton color="primary" type="submit" size="sm">
                Add New Category
              </CButton>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
      <CCol md={8}>
        <CCard className="mb-4">
          <CCardHeader>
            <div className="d-flex justify-content-between align-items-center">
              <strong>Categories</strong>
              <CButton color="outline-info" size="sm" onClick={fetchCategories} disabled={loading}>
                {loading ? <CSpinner size="sm" /> : 'Refresh'}
              </CButton>
            </div>
          </CCardHeader>
          <CCardBody>
            {error && <CAlert color="warning">{error}</CAlert>}

            {loading && categories.length === 0 ? (
              <div className="text-center p-5">
                <CSpinner color="primary" />
                <p className="mt-2 text-muted">Fetching categories from WordPress...</p>
              </div>
            ) : (
              <CTable align="middle" className="mb-0 border" hover responsive>
                <CTableHead className="text-nowrap">
                  <CTableRow>
                    <CTableHeaderCell className="bg-body-tertiary">Name</CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary">Description</CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary">Slug</CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary text-center">Count</CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary text-center">Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {categories.map((item, index) => (
                    <CTableRow key={index}>
                      <CTableDataCell>
                        <div className="fw-bold text-info">{item.name}</div>
                      </CTableDataCell>
                      <CTableDataCell>{item.description}</CTableDataCell>
                      <CTableDataCell>{item.slug}</CTableDataCell>
                      <CTableDataCell className="text-center">{item.count}</CTableDataCell>
                      <CTableDataCell className="text-center">
                        <CButton color="info" size="sm" className="me-2">
                          <CIcon icon={cilPencil} />
                        </CButton>
                        <CButton color="danger" size="sm">
                          <CIcon icon={cilTrash} />
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
    </CRow>
  )
}

export default Categories
