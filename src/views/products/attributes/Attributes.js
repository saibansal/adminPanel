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
  CFormCheck,
  CSpinner,
  CAlert,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash, cilSettings } from '@coreui/icons'
import API_CONFIG from 'src/apiConfig'

const Attributes = () => {
  const [attributes, setAttributes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchAttributes()
  }, [])

  const fetchAttributes = async () => {
    setLoading(true)
    setError(null)
    const { BASE_URL } = API_CONFIG

    try {
      const response = await fetch(`${BASE_URL}wc/v3/products/attributes`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': API_CONFIG.getBasicAuthHeader(),
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch attributes.')
      }

      const data = await response.json()
      console.log('Fetched Attributes:', data)
      setAttributes(data)
    } catch (err) {
      console.error('Error fetching attributes:', err)
      setError(err.message || 'Could not connect to WordPress.')
      // Fallback
      setAttributes([
        { id: 1, name: 'Color (Demo)', slug: 'pa_color', type: 'select', order_by: 'menu_order', has_archives: true },
        { id: 2, name: 'Size (Demo)', slug: 'pa_size', type: 'select', order_by: 'name', has_archives: false },
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
            <strong>Add New Attribute</strong>
          </CCardHeader>
          <CCardBody>
            <CForm className="g-3">
              <div className="mb-3">
                <CFormLabel htmlFor="attrName">Name</CFormLabel>
                <CFormInput type="text" id="attrName" placeholder="Enter attribute name" />
                <div className="small text-muted mt-1">Name for the attribute (shown on the front-end).</div>
              </div>
              <div className="mb-3">
                <CFormLabel htmlFor="attrSlug">Slug</CFormLabel>
                <CFormInput type="text" id="attrSlug" placeholder="Enter attribute slug" />
              </div>
              <div className="mb-3">
                <CFormCheck id="attrArchives" label="Enable Archives?" />
              </div>
              <CButton color="primary" type="submit" size="sm">
                Add Attribute
              </CButton>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
      <CCol md={8}>
        <CCard className="mb-4 shadow-sm border-0">
          <CCardHeader className="bg-white border-bottom d-flex justify-content-between align-items-center py-3">
            <h5 className="mb-0">
              <strong>Attributes</strong>
            </h5>
            <CButton color="outline-info" size="sm" onClick={fetchAttributes} disabled={loading}>
              {loading ? <CSpinner size="sm" /> : 'Refresh'}
            </CButton>
          </CCardHeader>
          <CCardBody>
            {error && <CAlert color="warning">{error}</CAlert>}

            {loading && attributes.length === 0 ? (
              <div className="text-center p-5">
                <CSpinner color="primary" />
                <p className="mt-2 text-muted">Loading attributes...</p>
              </div>
            ) : (
              <CTable align="middle" className="mb-0 border rounded" hover responsive>
                <CTableHead className="bg-light">
                  <CTableRow>
                    <CTableHeaderCell>Name</CTableHeaderCell>
                    <CTableHeaderCell>Slug</CTableHeaderCell>
                    <CTableHeaderCell className="text-center">Order By</CTableHeaderCell>
                    <CTableHeaderCell className="text-center">Archives</CTableHeaderCell>
                    <CTableHeaderCell className="text-center">Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {attributes.map((item) => (
                    <CTableRow key={item.id}>
                      <CTableDataCell>
                        <div className="fw-bold text-info">{item.name}</div>
                      </CTableDataCell>
                      <CTableDataCell><code>{item.slug}</code></CTableDataCell>
                      <CTableDataCell className="text-center text-capitalize">{item.order_by || item.order}</CTableDataCell>
                      <CTableDataCell className="text-center">
                        {item.has_archives ? (
                          <span className="text-success">Yes</span>
                        ) : (
                          <span className="text-muted">No</span>
                        )}
                      </CTableDataCell>
                      <CTableDataCell className="text-center">
                        <CButton
                          color="secondary"
                          size="sm"
                          className="me-2 text-white shadow-sm"
                          title="Configure Terms"
                        >
                          <CIcon icon={cilSettings} />
                        </CButton>
                        <CButton color="info" size="sm" className="me-2 text-white shadow-sm">
                          <CIcon icon={cilPencil} />
                        </CButton>
                        <CButton color="danger" size="sm" className="text-white shadow-sm">
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

export default Attributes
