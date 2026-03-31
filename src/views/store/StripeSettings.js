import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
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
  CBadge
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSave, cilLockLocked, cilGlobeAlt, cilTerminal } from '@coreui/icons'

const StripeSettings = () => {
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const [config, setConfig] = useState({
    enabled: true,
    title: 'Credit Card (Stripe)',
    description: 'Pay with your credit card via Stripe.',
    testMode: true,
    testPublishableKey: '',
    testSecretKey: '',
    livePublishableKey: '',
    liveSecretKey: '',
    webhookSecret: '',
    capture: true,
  })

  useEffect(() => {
    // Load existing config from localStorage or API if available
    const saved = localStorage.getItem('stripe_config')
    if (saved) {
      setConfig(JSON.parse(saved))
    }
  }, [])

  const handleSave = () => {
    setIsSaving(true)
    localStorage.setItem('stripe_config', JSON.stringify(config))

    // Simulate API call to save settings to WooCommerce
    setTimeout(() => {
      setIsSaving(false)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    }, 1500)
  }

  return (
    <div className="stripe-settings-view">
      {showSuccess && (
        <CAlert color="success" className="mb-4 border-0 shadow-sm">
          Stripe configuration has been successfully updated and synchronized.
        </CAlert>
      )}

      <CRow>
        <CCol md={8}>
          <CCard className="border-0 shadow-sm mb-4">
            <CCardBody className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="mb-0">Stripe API Configuration</h5>
                <CBadge color={config.testMode ? 'warning' : 'success'} shape="rounded-pill">
                  {config.testMode ? 'Test Mode' : 'Live Mode'}
                </CBadge>
              </div>

              <CForm className="row g-4">
                <CCol md={12}>
                  <CFormSwitch
                    label="Enable Stripe"
                    id="stripeEnable"
                    checked={config.enabled}
                    onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                  />
                  <div className="text-muted small ms-4">When enabled, customers can pay with credit cards at checkout.</div>
                </CCol>

                <CCol md={12}>
                  <CFormSwitch
                    label="Enable Test Mode"
                    id="stripeTestMode"
                    checked={config.testMode}
                    onChange={(e) => setConfig({ ...config, testMode: e.target.checked })}
                  />
                  <div className="text-muted small ms-4">Use test keys for development and live keys for production orders.</div>
                </CCol>

                <hr className="my-4 opacity-10" />

                {config.testMode ? (
                  <>
                    <h6 className="mb-0"><CIcon icon={cilTerminal} className="me-2" />Test Credentials</h6>
                    <CCol md={12}>
                      <CFormLabel className="small fw-bold">Test Publishable Key</CFormLabel>
                      <CFormInput
                        placeholder="pk_test_..."
                        value={config.testPublishableKey}
                        onChange={(e) => setConfig({ ...config, testPublishableKey: e.target.value })}
                      />
                    </CCol>
                    <CCol md={12}>
                      <CFormLabel className="small fw-bold">Test Secret Key</CFormLabel>
                      <CFormInput
                        type="password"
                        placeholder="sk_test_..."
                        value={config.testSecretKey}
                        onChange={(e) => setConfig({ ...config, testSecretKey: e.target.value })}
                      />
                    </CCol>
                  </>
                ) : (
                  <>
                    <h6 className="mb-0 text-success"><CIcon icon={cilGlobeAlt} className="me-2" />Live Credentials</h6>
                    <CCol md={12}>
                      <CFormLabel className="small fw-bold text-success">Live Publishable Key</CFormLabel>
                      <CFormInput
                        placeholder="pk_live_..."
                        value={config.livePublishableKey}
                        onChange={(e) => setConfig({ ...config, livePublishableKey: e.target.value })}
                      />
                    </CCol>
                    <CCol md={12}>
                      <CFormLabel className="small fw-bold text-success">Live Secret Key</CFormLabel>
                      <CFormInput
                        type="password"
                        placeholder="sk_live_..."
                        value={config.liveSecretKey}
                        onChange={(e) => setConfig({ ...config, liveSecretKey: e.target.value })}
                      />
                    </CCol>
                  </>
                )}

                <hr className="my-4 opacity-10" />

                <CCol md={12}>
                  <h6 className="mb-3"><CIcon icon={cilLockLocked} className="me-2" />Webhooks & Security</h6>
                  <CFormLabel className="small fw-bold">Webhook Signing Secret</CFormLabel>
                  <CFormInput
                    type="password"
                    placeholder="whsec_..."
                    value={config.webhookSecret}
                    onChange={(e) => setConfig({ ...config, webhookSecret: e.target.value })}
                  />
                  <div className="text-muted small mt-2">Required to handle events like successful payments and partial refunds automatically.</div>
                </CCol>

                <CCol md={12} className="pt-3">
                  <CButton color="primary" className="px-5 shadow-sm" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? <CSpinner size="sm" /> : <><CIcon icon={cilSave} className="me-2" />Save Stripe Settings</>}
                  </CButton>
                </CCol>
              </CForm>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol md={4}>
          <CCard className="border-0 shadow-sm mb-4">
            <CCardBody className="p-4">
              <h5 className="mb-3">Display Settings</h5>
              <CForm className="row g-3">
                <CCol md={12}>
                  <CFormLabel className="small fw-bold">Method Title</CFormLabel>
                  <CFormInput
                    value={config.title}
                    onChange={(e) => setConfig({ ...config, title: e.target.value })}
                  />
                  <div className="text-muted small mt-1">Shown to customers during checkout.</div>
                </CCol>
                <CCol md={12}>
                  <CFormLabel className="small fw-bold">Method Description</CFormLabel>
                  <CFormTextarea
                    rows={3}
                    value={config.description}
                    onChange={(e) => setConfig({ ...config, description: e.target.value })}
                  />
                </CCol>
                <CCol md={12} className="mt-4">
                  <CFormSwitch
                    label="Capture payment immediately"
                    id="stripeCapture"
                    checked={config.capture}
                    onChange={(e) => setConfig({ ...config, capture: e.target.checked })}
                  />
                  <div className="text-muted small ms-4">If unchecked, payments will be authorized but must be captured manually in the dashboard.</div>
                </CCol>
              </CForm>
            </CCardBody>
          </CCard>

          <CAlert color="info" className="border-0 shadow-sm">
            <h6 className="alert-heading">Need help?</h6>
            <p className="small mb-0">
              You can find your API keys in the <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer">Stripe Dashboard</a>. Make sure to choose the correct keys for Test or Live mode.
            </p>
          </CAlert>
        </CCol>
      </CRow>
    </div>
  )
}

export default StripeSettings
