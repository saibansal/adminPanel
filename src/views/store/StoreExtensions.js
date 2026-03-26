import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CButton,
  CBadge,
  CAvatar,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPuzzle, cilCloudDownload, cilTrash, cilPowerStandby } from '@coreui/icons'

const StoreExtensions = () => {
    const plugins = [
        { name: 'WooCommerce Payments', version: '7.1.0', author: 'WooCommerce', status: 'Active', desc: 'Securely accept credit cards, Apple Pay, and Google Pay.' },
        { name: 'Mailchimp for WooCommerce', version: '3.3.0', author: 'Mailchimp', status: 'Active', desc: 'Sync your customers and their purchase data to Mailchimp.' },
        { name: 'Stripe Gateway', version: '8.0.1', author: 'WooCommerce', status: 'Inactive', desc: 'Accept credit card payments via Stripe.' },
        { name: 'Elementor Pro', version: '3.20.1', author: 'Elementor', status: 'Active', desc: 'Premium page building capabilities for your store.' },
    ]

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4 shadow-sm border-0">
          <CCardHeader className="bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
            <div className="fw-bold fs-5 text-dark">
                <CIcon icon={cilPuzzle} className="me-2 text-primary" />
                Store Extensions & Plugins
            </div>
            <CButton color="primary" size="sm">
                <CIcon icon={cilCloudDownload} className="me-1" /> Add New Extension
            </CButton>
          </CCardHeader>
          <CCardBody className="p-4">
             <div className="mb-4 text-muted small border-bottom pb-2">
                 Total Active Extensions: <CBadge color="success">3</CBadge>
             </div>
             <CRow>
                {plugins.map((plugin, idx) => (
                    <CCol md={6} key={idx} className="mb-4">
                         <div className="p-3 border rounded h-100 bg-white shadow-sm hover-shadow transition-all d-flex gap-3">
                             <CAvatar color={plugin.status === 'Active' ? 'primary' : 'secondary'} size="lg" className="text-white fw-bold">
                                {plugin.name.charAt(0)}
                             </CAvatar>
                             <div className="flex-grow-1">
                                 <div className="d-flex justify-content-between align-items-start mb-1">
                                    <div className="fw-bold text-dark">{plugin.name}</div>
                                    <CBadge color={plugin.status === 'Active' ? 'success' : 'secondary'} size="sm">{plugin.status}</CBadge>
                                 </div>
                                 <div className="small text-muted mb-2">Version {plugin.version} | by {plugin.author}</div>
                                 <p className="small text-muted mb-3" style={{ height: '40px', overflow: 'hidden' }}>{plugin.desc}</p>
                                 <div className="d-flex justify-content-between align-items-center border-top pt-2">
                                     <div className="d-flex gap-2">
                                        <CButton color="outline-info" size="sm">Configure</CButton>
                                        <CButton color={plugin.status === 'Active' ? 'outline-warning' : 'outline-success'} size="sm">
                                            {plugin.status === 'Active' ? 'Deactivate' : 'Activate'}
                                        </CButton>
                                     </div>
                                     <CButton color="ghost-danger" size="sm"><CIcon icon={cilTrash} /></CButton>
                                 </div>
                             </div>
                         </div>
                    </CCol>
                ))}
             </CRow>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default StoreExtensions
