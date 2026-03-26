import React from 'react'
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
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash } from '@coreui/icons'

const Brands = () => {
  const brands = [
    { id: 1, name: 'Brand A', slug: 'brand-a', count: 12 },
    { id: 2, name: 'Brand B', slug: 'brand-b', count: 8 },
  ]

  return (
    <CRow>
      <CCol md={4}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Add New Brand</strong>
          </CCardHeader>
          <CCardBody>
            <CForm className="g-3">
              <div className="mb-3">
                <CFormLabel htmlFor="brandName">Name</CFormLabel>
                <CFormInput type="text" id="brandName" placeholder="Enter brand name" />
                <div className="small text-muted mt-1">The name is how it appears on your site.</div>
              </div>
              <div className="mb-3">
                <CFormLabel htmlFor="brandSlug">Slug</CFormLabel>
                <CFormInput type="text" id="brandSlug" placeholder="Enter brand slug" />
                <div className="small text-muted mt-1">The "slug" is the URL-friendly version of the name. It is usually all lowercase and contains only letters, numbers, and hyphens.</div>
              </div>
              <CButton color="primary" type="submit" size="sm">
                Add New Brand
              </CButton>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
      <CCol md={8}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Brands</strong>
          </CCardHeader>
          <CCardBody>
            <CTable align="middle" className="mb-0 border" hover responsive>
              <CTableHead className="text-nowrap">
                <CTableRow>
                  <CTableHeaderCell className="bg-body-tertiary">Name</CTableHeaderCell>
                  <CTableHeaderCell className="bg-body-tertiary">Slug</CTableHeaderCell>
                  <CTableHeaderCell className="bg-body-tertiary text-center">Count</CTableHeaderCell>
                  <CTableHeaderCell className="bg-body-tertiary text-center">Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {brands.map((item, index) => (
                  <CTableRow key={index}>
                    <CTableDataCell>
                      <div className="fw-semibold text-info">{item.name}</div>
                    </CTableDataCell>
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
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default Brands
