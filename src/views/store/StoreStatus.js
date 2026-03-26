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
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilInfo, cilCheckCircle, cilWarning, cilXCircle } from '@coreui/icons'

const StoreStatus = () => {
  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4 shadow-sm border-0">
          <CCardHeader className="bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
            <div className="fw-bold fs-5 text-dark">
                <CIcon icon={cilInfo} className="me-2 text-primary" />
                System & Store Status
            </div>
            <div>
                <CBadge color="success">System Online</CBadge>
            </div>
          </CCardHeader>
          <CCardBody>
             <h5 className="mb-4 border-bottom pb-2">WordPress Environment</h5>
             <CTable small borderless className="mb-5 overflow-hidden rounded">
                <CTableBody>
                    <CTableRow className="border-bottom">
                        <CTableHeaderCell className="bg-light py-2 px-3 fw-semibold">WordPress Version</CTableHeaderCell>
                        <CTableDataCell className="py-2 px-3">6.4.3</CTableDataCell>
                        <CTableDataCell className="text-end py-2 px-3"><CIcon icon={cilCheckCircle} className="text-success" /></CTableDataCell>
                    </CTableRow>
                    <CTableRow className="border-bottom">
                        <CTableHeaderCell className="bg-light py-2 px-3 fw-semibold">WP REST API</CTableHeaderCell>
                        <CTableDataCell className="py-2 px-3">Enabled / JSON-v2</CTableDataCell>
                        <CTableDataCell className="text-end py-2 px-3"><CIcon icon={cilCheckCircle} className="text-success" /></CTableDataCell>
                    </CTableRow>
                    <CTableRow className="border-bottom text-danger">
                        <CTableHeaderCell className="bg-light py-2 px-3 fw-semibold">PHP Version</CTableHeaderCell>
                        <CTableDataCell className="py-2 px-3">7.4.33 (Recommend 8.1+)</CTableDataCell>
                        <CTableDataCell className="text-end py-2 px-3"><CIcon icon={cilWarning} className="text-warning" /></CTableDataCell>
                    </CTableRow>
                    <CTableRow className="border-bottom">
                        <CTableHeaderCell className="bg-light py-2 px-3 fw-semibold">WP Debug Mode</CTableHeaderCell>
                        <CTableDataCell className="py-2 px-3 italic">Off</CTableDataCell>
                        <CTableDataCell className="text-end py-2 px-3"><CIcon icon={cilCheckCircle} className="text-success" /></CTableDataCell>
                    </CTableRow>
                </CTableBody>
             </CTable>

             <h5 className="mb-4 border-bottom pb-2">WooCommerce Environment</h5>
             <CTable small borderless className="mb-5 overflow-hidden rounded">
                <CTableBody>
                    <CTableRow className="border-bottom">
                        <CTableHeaderCell className="bg-light py-2 px-3 fw-semibold">WooCommerce Version</CTableHeaderCell>
                        <CTableDataCell className="py-2 px-3">8.6.1</CTableDataCell>
                        <CTableDataCell className="text-end py-2 px-3"><CIcon icon={cilCheckCircle} className="text-success" /></CTableDataCell>
                    </CTableRow>
                    <CTableRow className="border-bottom text-danger">
                        <CTableHeaderCell className="bg-light py-2 px-3 fw-semibold">WC Database Version</CTableHeaderCell>
                        <CTableDataCell className="py-2 px-3">8.5.0 (Update Recommended)</CTableDataCell>
                        <CTableDataCell className="text-end py-2 px-3"><CIcon icon={cilWarning} className="text-warning" /></CTableDataCell>
                    </CTableRow>
                    <CTableRow className="border-bottom">
                        <CTableHeaderCell className="bg-light py-2 px-3 fw-semibold">SSL Status</CTableHeaderCell>
                        <CTableDataCell className="py-2 px-3">HTTPS Active</CTableDataCell>
                        <CTableDataCell className="text-end py-2 px-3"><CIcon icon={cilCheckCircle} className="text-success" /></CTableDataCell>
                    </CTableRow>
                </CTableBody>
             </CTable>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default StoreStatus
