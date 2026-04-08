import React, { useState, useEffect } from 'react'
import {
  CCol,
  CRow,
  CForm,
  CFormLabel,
  CFormInput,
  CFormSwitch,
  CButton,
  CAlert,
  CSpinner,
  CFormTextarea,
  CBadge,
  CTabContent,
  CTabPane,
  CNav,
  CNavItem,
  CNavLink
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSave, cilLockLocked, cilGlobeAlt, cilTerminal, cilEnvelopeClosed, cilShieldAlt } from '@coreui/icons'

const PayPalSettings = ({ gateway, onSave, onCancel }) => {
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [activeTab, setActiveTab] = useState('general')

  // Check if this is the modern PayPal Payments plugin (ppcp-gateway)
  const isModern = gateway?.id === 'ppcp-gateway'

  const [config, setConfig] = useState({
    enabled: gateway?.enabled ?? true,
    title: gateway?.settings?.title?.value || gateway?.title || 'PayPal',
    description: gateway?.settings?.description?.value || gateway?.description || '',
    
    // Legacy / Standard fields
    email: gateway?.settings?.email?.value || '',
    testmode: gateway?.settings?.testmode?.value === 'yes' || gateway?.settings?.sandbox?.value === 'yes',
    
    // Modern / PayPal Payments fields (ppcp-gateway)
    environment: gateway?.settings?.environment?.value || 'sandbox',
    client_id: gateway?.settings?.client_id?.value || '',
    client_secret: gateway?.settings?.client_secret?.value || '',
    sandbox_client_id: gateway?.settings?.sandbox_client_id?.value || '',
    sandbox_client_secret: gateway?.settings?.sandbox_client_secret?.value || '',
    
    // Common fields
    debug: gateway?.settings?.debug?.value === 'yes',
  })

  useEffect(() => {
    if (gateway && gateway.settings) {
      const s = gateway.settings
      setConfig({
        enabled: gateway.enabled,
        title: s.title?.value || gateway.title,
        description: s.description?.value || gateway.description,
        
        email: s.email?.value || s.merchant_id?.value || '',
        testmode: s.testmode?.value === 'yes' || s.sandbox?.value === 'yes',
        
        environment: s.environment?.value || (s.testmode?.value === 'yes' ? 'sandbox' : 'live'),
        client_id: s.client_id?.value || '',
        client_secret: s.client_secret?.value || '',
        sandbox_client_id: s.sandbox_client_id?.value || '',
        sandbox_client_secret: s.sandbox_client_secret?.value || '',
        
        debug: s.debug?.value === 'yes',
      })
    }
  }, [gateway])

  const handleLocalSave = async () => {
    setIsSaving(true)
    
    const settings = {
        title: config.title,
        description: config.description,
        debug: config.debug ? 'yes' : 'no',
    }

    if (isModern) {
        settings.environment = config.environment
        settings.client_id = config.client_id
        settings.client_secret = config.client_secret
        settings.sandbox_client_id = config.sandbox_client_id
        settings.sandbox_client_secret = config.sandbox_client_secret
    } else {
        settings.email = config.email
        settings.testmode = config.testmode ? 'yes' : 'no'
    }

    const payload = {
      title: config.title,
      description: config.description,
      enabled: config.enabled,
      settings: settings
    }

    if (onSave) {
      await onSave(gateway?.id, payload)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    }
    setIsSaving(false)
  }

  const isSandbox = isModern ? config.environment === 'sandbox' : config.testmode

  return (
    <div className="paypal-settings-view">
      {showSuccess && (
        <CAlert color="success" className="mb-4 border-0 shadow-sm d-flex align-items-center">
          <CIcon icon={cilSave} className="me-2" />
          PayPal configuration synced with WooCommerce successfully.
        </CAlert>
      )}

      <CNav variant="tabs" className="mb-4">
        <CNavItem>
          <CNavLink active={activeTab === 'general'} onClick={() => setActiveTab('general')} style={{cursor: 'pointer'}}>General</CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink active={activeTab === 'api'} onClick={() => setActiveTab('api')} style={{cursor: 'pointer'}}>API Credentials</CNavLink>
        </CNavItem>
      </CNav>

      <CForm className="row g-4">
        <CTabContent>
          <CTabPane visible={activeTab === 'general'}>
            <CRow className="g-3">
                <CCol md={12}>
                  <div className="d-flex justify-content-between align-items-center bg-light p-3 rounded mb-2">
                    <div>
                      <h6 className="mb-1">Gateway Status</h6>
                      <div className="text-muted small">Enable or disable this payment method.</div>
                    </div>
                    <CFormSwitch
                      size="xl"
                      checked={config.enabled}
                      onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                    />
                  </div>
                </CCol>

                <CCol md={12}>
                  <CFormLabel className="fw-bold small">Method Title</CFormLabel>
                  <CFormInput
                    value={config.title}
                    onChange={(e) => setConfig({ ...config, title: e.target.value })}
                  />
                </CCol>

                <CCol md={12}>
                  <CFormLabel className="fw-bold small">Description</CFormLabel>
                  <CFormTextarea
                    rows={2}
                    value={config.description}
                    onChange={(e) => setConfig({ ...config, description: e.target.value })}
                  />
                </CCol>

                {isModern && (
                    <CCol md={12}>
                        <CFormLabel className="fw-bold small">Environment</CFormLabel>
                        <div className="d-flex gap-3">
                            <CButton 
                                color={config.environment === 'live' ? 'primary' : 'outline-primary'} 
                                size="sm" 
                                onClick={() => setConfig({...config, environment: 'live'})}
                            >Live / Production</CButton>
                            <CButton 
                                color={config.environment === 'sandbox' ? 'warning' : 'outline-warning'} 
                                size="sm" 
                                onClick={() => setConfig({...config, environment: 'sandbox'})}
                            >Sandbox / Testing</CButton>
                        </div>
                    </CCol>
                )}

                {!isModern && (
                    <CCol md={12}>
                        <CFormSwitch
                            label="Enable Sandbox Mode"
                            checked={config.testmode}
                            onChange={(e) => setConfig({ ...config, testmode: e.target.checked })}
                        />
                    </CCol>
                )}
            </CRow>
          </CTabPane>

          <CTabPane visible={activeTab === 'api'}>
            <CRow className="g-3">
                {isModern ? (
                    <>
                        <CCol md={12}>
                            <h6 className="mb-3 text-primary"><CIcon icon={cilShieldAlt} className="me-2" />API Credentials</h6>
                        </CCol>
                        {config.environment === 'live' ? (
                            <>
                                <CCol md={12}>
                                    <CFormLabel className="small fw-bold">Live Client ID</CFormLabel>
                                    <CFormInput 
                                        value={config.client_id}
                                        onChange={(e) => setConfig({...config, client_id: e.target.value})}
                                    />
                                </CCol>
                                <CCol md={12}>
                                    <CFormLabel className="small fw-bold">Live Secret Key</CFormLabel>
                                    <CFormInput 
                                        type="password"
                                        value={config.client_secret}
                                        onChange={(e) => setConfig({...config, client_secret: e.target.value})}
                                    />
                                </CCol>
                            </>
                        ) : (
                            <>
                                <CCol md={12}>
                                    <CFormLabel className="small fw-bold">Sandbox Client ID</CFormLabel>
                                    <CFormInput 
                                        value={config.sandbox_client_id}
                                        onChange={(e) => setConfig({...config, sandbox_client_id: e.target.value})}
                                    />
                                </CCol>
                                <CCol md={12}>
                                    <CFormLabel className="small fw-bold">Sandbox Secret Key</CFormLabel>
                                    <CFormInput 
                                        type="password"
                                        value={config.sandbox_client_secret}
                                        onChange={(e) => setConfig({...config, sandbox_client_secret: e.target.value})}
                                    />
                                </CCol>
                            </>
                        )}
                    </>
                ) : (
                    <>
                        <CCol md={12}>
                            <CFormLabel className="fw-bold small">PayPal Email</CFormLabel>
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0"><CIcon icon={cilEnvelopeClosed} className="text-muted" /></span>
                                <CFormInput
                                    type="email"
                                    className="border-start-0"
                                    value={config.email}
                                    onChange={(e) => setConfig({ ...config, email: e.target.value })}
                                />
                            </div>
                        </CCol>
                    </>
                )}
                
                <CCol md={12} className="mt-4 pt-2 border-top">
                    <CFormSwitch
                        label="Enable Debug Logging"
                        checked={config.debug}
                        onChange={(e) => setConfig({ ...config, debug: e.target.checked })}
                    />
                    <small className="text-muted d-block ms-4">Records all PayPal activity in the WooCommerce log file.</small>
                </CCol>
            </CRow>
          </CTabPane>
        </CTabContent>

        <CCol md={12} className="d-flex justify-content-end gap-2 mt-4">
          <CButton color="secondary" variant="ghost" onClick={onCancel}>Cancel</CButton>
          <CButton color="primary" className="px-4 shadow-sm" onClick={handleLocalSave} disabled={isSaving}>
            {isSaving ? <CSpinner size="sm" /> : <><CIcon icon={cilSave} className="me-2" />Sync Settings</>}
          </CButton>
        </CCol>
      </CForm>
    </div>
  )
}

export default PayPalSettings
