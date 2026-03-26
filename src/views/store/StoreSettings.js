import React, { useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
  CForm,
  CFormLabel,
  CFormInput,
  CFormSelect,
  CButton,
  CFormSwitch,
  CAlert,
  CFormCheck,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSettings, cilSave, cilCheckCircle } from '@coreui/icons'

const StoreSettings = () => {
  const [activeTab, setActiveTab] = useState('general')
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [settings, setSettings] = useState({
    enableStock: true,
    lowStockThreshold: 2,
    outOfStockThreshold: 0,
    storeAddress: '123 Commerce St',
    city: 'New York',
    gateways: {
        stripe: true,
        paypal: false,
        bank: false,
        cod: true
    }
  })

  const tabs = [
    { id: 'general', name: 'General' },
    { id: 'products', name: 'Products' },
    { id: 'tax', name: 'Tax' },
    { id: 'shipping', name: 'Shipping' },
    { id: 'payments', name: 'Payments' },
    { id: 'privacy', name: 'Accounts & Privacy' },
    { id: 'emails', name: 'Emails' },
    { id: 'integration', name: 'Integration' },
    { id: 'visibility', name: 'Site visibility' },
    { id: 'pos', name: 'Point of Sale' },
    { id: 'advanced', name: 'Advanced' },
  ]

  const handleSave = () => {
    setIsSaving(true)
    // Synchronize with front-end Checkout
    localStorage.setItem('wc_payment_settings', JSON.stringify(settings.gateways))

    // Simulate API call
    setTimeout(() => {
        setIsSaving(false)
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
    }, 1000)
  }

  return (
    <CRow>
      <CCol xs={12}>
        {showSuccess && (
           <CAlert color="success" className="mb-3 border-0 shadow-sm d-flex align-items-center">
              <CIcon icon={cilSave} className="me-2" />
              Settings successfully saved to your WooCommerce store.
           </CAlert>
        )}
        <CCard className="mb-4 shadow-sm border-0">
          <CCardHeader className="bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
            <div className="fw-bold fs-5 text-dark">
                <CIcon icon={cilSettings} className="me-2 text-primary" />
                WooCommerce Store Settings
            </div>
            <CButton color="primary" size="sm" onClick={handleSave} disabled={isSaving}>
                {isSaving ? <CSpinner size="sm" /> : <><CIcon icon={cilSave} className="me-1" /> Save Changes</>}
            </CButton>
          </CCardHeader>
          <CCardBody className="p-0">
             {/* Horizontal Tabs matching Screenshot */}
             <div className="border-bottom bg-light">
                <CNav variant="underline-border" className="px-3">
                    {tabs.map((tab) => (
                        <CNavItem key={tab.id}>
                            <CNavLink 
                                active={activeTab === tab.id} 
                                onClick={() => setActiveTab(tab.id)}
                                style={{ cursor: 'pointer', fontSize: '13px', fontWeight: activeTab === tab.id ? '600' : '400' }}
                                className="py-3 px-3 border-0"
                            >
                                {tab.name}
                            </CNavLink>
                        </CNavItem>
                    ))}
                </CNav>
             </div>

             <div className="p-4" style={{ minHeight: '500px' }}>
                <CTabContent>
                    <CTabPane visible={activeTab === 'general'}>
                         <h5 className="mb-4">Store Address</h5>
                         <CForm className="row g-3">
                             <CCol md={12}>
                                 <CFormLabel>Address line 1</CFormLabel>
                                 <CFormInput 
                                    value={settings.storeAddress} 
                                    onChange={(e) => setSettings({...settings, storeAddress: e.target.value})}
                                 />
                             </CCol>
                             <CCol md={6}>
                                 <CFormLabel>City</CFormLabel>
                                 <CFormInput 
                                    value={settings.city} 
                                    onChange={(e) => setSettings({...settings, city: e.target.value})}
                                 />
                             </CCol>
                             <CCol md={6}>
                                 <CFormLabel>Country / State</CFormLabel>
                                 <CFormSelect>
                                     <option>United States (US) — New York</option>
                                 </CFormSelect>
                             </CCol>
                             <CCol md={6}>
                                 <CFormLabel>Postcode / ZIP</CFormLabel>
                                 <CFormInput defaultValue="10001" />
                             </CCol>
                         </CForm>
                    </CTabPane>

                    <CTabPane visible={activeTab === 'products'}>
                         <h5 className="mb-4">Inventory Configuration</h5>
                         <CForm className="row g-3">
                             {/* Enable Stock Management */}
                             <CCol md={12} className="mb-2">
                                 <CFormSwitch 
                                    label="Enable stock management" 
                                    id="enableStockSwitch"
                                    checked={settings.enableStock} 
                                    onChange={(e) => setSettings({...settings, enableStock: e.target.checked})}
                                 />
                                 <div className="text-muted small ms-4">Control whether stock is tracked automatically at the product level.</div>
                             </CCol>

                             {settings.enableStock && (
                                <>
                                 {/* Hold Stock (minutes) */}
                                 <CCol md={12}>
                                     <CFormLabel className="fw-bold small">Hold stock (minutes)</CFormLabel>
                                     <CFormInput 
                                        type="number" 
                                        placeholder="60" 
                                        className="w-25"
                                        defaultValue={60}
                                     />
                                     <div className="text-muted small">Hold stock (for unpaid orders) for x minutes. When this limit is reached, the pending order will be cancelled. Leave blank to disable.</div>
                                 </CCol>

                                 <hr className="my-4 opacity-10" />

                                 {/* Notifications */}
                                 <CCol md={12}>
                                     <h6 className="mb-3">Notifications</h6>
                                     <div className="mb-2">
                                         <CFormCheck label="Enable low stock notifications" defaultChecked />
                                     </div>
                                     <div className="mb-3">
                                         <CFormCheck label="Enable out of stock notifications" defaultChecked />
                                     </div>
                                 </CCol>

                                 {/* Notification Recipient */}
                                 <CCol md={6}>
                                     <CFormLabel className="fw-bold small">Notification recipient(s)</CFormLabel>
                                     <CFormInput defaultValue="admin@example.com" />
                                     <div className="text-muted small">Notifications will be sent to this email address.</div>
                                 </CCol>

                                 <CCol md={12}></CCol>

                                 {/* Thresholds */}
                                 <CCol md={6}>
                                     <CFormLabel className="fw-bold small">Low stock threshold</CFormLabel>
                                     <CFormInput 
                                        type="number" 
                                        value={settings.lowStockThreshold} 
                                        onChange={(e) => setSettings({...settings, lowStockThreshold: e.target.value})}
                                     />
                                     <div className="text-muted small">When stock reaches this number, the low stock notification will be sent.</div>
                                 </CCol>

                                 <CCol md={6}>
                                     <CFormLabel className="fw-bold small">Out of stock threshold</CFormLabel>
                                     <CFormInput 
                                        type="number" 
                                        value={settings.outOfStockThreshold} 
                                        onChange={(e) => setSettings({...settings, outOfStockThreshold: e.target.value})}
                                     />
                                     <div className="text-muted small">When stock reaches this number, the status will change to "out of stock" and notification sent.</div>
                                 </CCol>
                                </>
                             )}

                             <hr className="my-3 opacity-10" />

                             {/* Out of Stock Visibility */}
                             <CCol md={12}>
                                 <CFormCheck label="Out of stock visibility" defaultChecked={false} />
                                 <div className="text-muted small ms-4">Hide out of stock items from the catalog.</div>
                             </CCol>

                             <CCol md={6}>
                                 <CFormLabel className="fw-bold small">Stock display format</CFormLabel>
                                 <CFormSelect defaultValue="never">
                                     <option value="always">Always show quantity remaining in stock</option>
                                     <option value="low">Only show quantity remaining in stock when low</option>
                                     <option value="never">Never show quantity remaining in stock</option>
                                 </CFormSelect>
                             </CCol>
                         </CForm>
                    </CTabPane>

                    <CTabPane visible={activeTab === 'tax'}>
                        <h5 className="mb-4">Tax Options</h5>
                        <CForm>
                            <div className="mb-3">
                                <CFormSwitch label="Enable automated taxes" />
                                <div className="text-muted small ms-4">Calculates taxes automatically based on customer's location.</div>
                            </div>
                            <CCol md={6} className="mb-3">
                                <CFormLabel>Prices entered with tax</CFormLabel>
                                <CFormSelect defaultValue="no">
                                    <option value="yes">Yes, I will enter prices inclusive of tax</option>
                                    <option value="no">No, I will enter prices exclusive of tax</option>
                                </CFormSelect>
                            </CCol>
                        </CForm>
                    </CTabPane>

                    <CTabPane visible={activeTab === 'payments'}>
                        <h5 className="mb-4">Payment Gateways</h5>
                        <div className="list-group list-group-flush border rounded overflow-hidden">
                            {/* Stripe */}
                            <div className="list-group-item d-flex justify-content-between align-items-center bg-light">
                                <div className="d-flex align-items-center">
                                    <div className="fw-bold">Stripe</div>
                                    <CIcon icon={cilCheckCircle} className="ms-2 text-success small" />
                                </div>
                                <CFormSwitch 
                                    checked={settings.gateways.stripe} 
                                    onChange={(e) => setSettings({
                                        ...settings, 
                                        gateways: { ...settings.gateways, stripe: e.target.checked }
                                    })}
                                />
                            </div>

                            {/* PayPal */}
                            <div className="list-group-item d-flex justify-content-between align-items-center">
                                <div className="fw-bold">PayPal</div>
                                <CFormSwitch 
                                    checked={settings.gateways.paypal} 
                                    onChange={(e) => setSettings({
                                        ...settings, 
                                        gateways: { ...settings.gateways, paypal: e.target.checked }
                                    })}
                                />
                            </div>

                            {/* Bank Transfer */}
                            <div className="list-group-item d-flex justify-content-between align-items-center">
                                <div className="fw-bold">Direct Bank Transfer</div>
                                <CFormSwitch 
                                    checked={settings.gateways.bank} 
                                    onChange={(e) => setSettings({
                                        ...settings, 
                                        gateways: { ...settings.gateways, bank: e.target.checked }
                                    })}
                                />
                            </div>

                            {/* Cash on Delivery */}
                            <div className="list-group-item d-flex justify-content-between align-items-center">
                                <div className="fw-bold">Cash on delivery</div>
                                <CFormSwitch 
                                    checked={settings.gateways.cod} 
                                    onChange={(e) => setSettings({
                                        ...settings, 
                                        gateways: { ...settings.gateways, cod: e.target.checked }
                                    })}
                                />
                            </div>
                        </div>
                        <div className="text-muted small mt-3 px-2">
                            <CIcon icon={cilCheckCircle} className="text-success me-1" />
                            Active settings will be synchronized with the front-end checkout upon saving.
                        </div>
                    </CTabPane>

                    <CTabPane visible={activeTab === 'pos'}>
                         <CAlert color="info" className="d-flex align-items-center">
                             <div>Point of Sale (POS) integration is active. You can manage your physical terminals here.</div>
                         </CAlert>
                         <h5 className="mt-4">Terminal Management</h5>
                         <CButton color="outline-primary" size="sm">Initialize New Terminal</CButton>
                    </CTabPane>

                    {/* Fallback for other tabs */}
                    {!['general', 'products', 'tax', 'payments', 'pos'].includes(activeTab) && (
                        <div className="text-center py-5">
                             <div className="text-muted mb-3">Settings for <strong>{tabs.find(t => t.id === activeTab)?.name}</strong> are being synchronized with your WordPress site.</div>
                             <CButton color="light" size="sm">Fetch Remote Config</CButton>
                        </div>
                    )}
                </CTabContent>
             </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}


export default StoreSettings
