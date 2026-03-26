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
  CFormTextarea,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash } from '@coreui/icons'

const Tags = () => {
  const tags = [
    { id: 1, name: 'New Arrival', description: 'Just arrived products', slug: 'new-arrival', count: 15 },
    { id: 2, name: 'Sale', description: 'Discounted items', slug: 'sale', count: 10 },
  ]

  return (
    <CRow>
      <CCol md={4}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Add New Tag</strong>
          </CCardHeader>
          <CCardBody>
            <CForm className="g-3">
              <div className="mb-3">
                <CFormLabel htmlFor="tagName">Name</CFormLabel>
                <CFormInput type="text" id="tagName" placeholder="Enter tag name" />
              </div>
              <div className="mb-3">
                <CFormLabel htmlFor="tagSlug">Slug</CFormLabel>
                <CFormInput type="text" id="tagSlug" placeholder="Enter tag slug" />
              </div>
              <div className="mb-3">
                <CFormLabel htmlFor="tagDescription">Description</CFormLabel>
                <CFormTextarea id="tagDescription" rows="3"></CFormTextarea>
              </div>
              <CButton color="primary" type="submit" size="sm">
                Add New Tag
              </CButton>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
      <CCol md={8}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Product Tags</strong>
          </CCardHeader>
          <CCardBody>
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
                {tags.map((item, index) => (
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
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default Tags
