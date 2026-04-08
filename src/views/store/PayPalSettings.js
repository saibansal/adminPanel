import React, { useState, useEffect } from 'react'
import {
    CCard,
    CCardBody,
    CCardHeader,
    CCol,
    CRow,
    CForm,
    CFormLabel,
    CFormInput,
    CFormSelect,
    CButton,
    CFormSwitch,
    CAlert,
    CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSettings, cilSave, cilCloudDownload } from '@coreui/icons'
import API_CONFIG from '../../apiConfig'

const PayPalSettings = () => {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState(null)
    const [settings, setSettings] = useState({
        enabled: false,
        mode: 'sandbox', // 'sandbox' or 'live'
        sandbox_client_id: '',
        sandbox_client_secret: '',
        live_client_id: '',
        live_client_secret: '',
        email: '',
    })

    useEffect(() => {
        fetchPayPalSettings()
    }, [])

    const fetchPayPalSettings = async () => {
        setLoading(true)
        try {
            // In a real WooCommerce environment, these would be stored in wp_options 
            // via a custom REST endpoint or the standard options API.
            // For now, we simulate fetching or use a custom endpoint if available.
            const response = await fetch(`${API_CONFIG.BASE_URL}sakoon/v1/settings/paypal`, {
                headers: {
                    'Authorization': API_CONFIG.getBasicAuthHeader()
                }
            })
            
            if (response.ok) {
                const data = await response.json()
                setSettings(prev => ({ ...prev, ...data }))
            } else {
                // If endpoint doesn't exist yet, we just stay with defaults
                console.log('PayPal settings endpoint not found, using defaults')
            }
        } catch (err) {
            console.error('Error fetching PayPal settings:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        setSaving(true)
        setSuccess(false)
        setError(null)
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}sakoon/v1/settings/paypal`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': API_CONFIG.getBasicAuthHeader()
                },
                body: JSON.stringify(settings)
            })

            if (response.ok) {
                setSuccess(true)
                setTimeout(() => setSuccess(false), 3000)
            } else {
                const data = await response.json()
                throw new Error(data.message || 'Failed to save settings')
            }
        } catch (err) {
            setError(err.message)
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div className="text-center p-5"><CSpinner color="primary" /></div>

    return (
        <CRow>
            <CCol xs={12}>
                <CCard className="mb-4 shadow-sm border-0">
                    <CCardHeader className="bg-white py-3 fw-bold d-flex align-items-center">
                        <CIcon icon={cilSettings} className="me-2 text-primary" />
                        PayPal Payment Gateway Configuration
                    </CCardHeader>
                    <CCardBody className="p-4">
                        {success && <CAlert color="success" className="mb-4">Settings saved successfully!</CAlert>}
                        {error && <CAlert color="danger" className="mb-4">{error}</CAlert>}

                        <CForm className="row g-4">
                            <CCol md={12}>
                                <div className="d-flex align-items-center justify-content-between p-3 bg-light rounded border">
                                    <div>
                                        <h6 className="mb-0 fw-bold">Enable PayPal</h6>
                                        <small className="text-muted">Allow customers to pay via PayPal at checkout</small>
                                    </div>
                                    <CFormSwitch
                                        size="xl"
                                        checked={settings.enabled}
                                        onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                                    />
                                </div>
                            </CCol>

                            <CCol md={12}>
                                <CFormLabel className="fw-bold fs-5">Environment Mode</CFormLabel>
                                <div className="d-flex gap-4 p-3 border rounded bg-white shadow-sm">
                                    <div className="form-check">
                                        <input 
                                            className="form-check-input" 
                                            type="radio" 
                                            name="paypalMode" 
                                            id="modeSandbox" 
                                            checked={settings.mode === 'sandbox'}
                                            onChange={() => setSettings({ ...settings, mode: 'sandbox' })}
                                        />
                                        <label className="form-check-label fw-semibold" htmlFor="modeSandbox">
                                            Sandbox (Testing)
                                        </label>
                                    </div>
                                    <div className="form-check">
                                        <input 
                                            className="form-check-input" 
                                            type="radio" 
                                            name="paypalMode" 
                                            id="modeLive" 
                                            checked={settings.mode === 'live'}
                                            onChange={() => setSettings({ ...settings, mode: 'live' })}
                                        />
                                        <label className="form-check-label fw-semibold" htmlFor="modeLive" style={{ color: '#059669' }}>
                                            Live (Production)
                                        </label>
                                    </div>
                                </div>
                                <div className="text-muted small mt-2">
                                    Use Sandbox mode to test payments without real money. Switch to Live mode for actual transactions.
                                </div>
                            </CCol>

                            <hr className="my-4 opacity-10" />

                            <CCol md={12}>
                                <h6 className="fw-bold mb-3 border-start border-primary border-4 ps-2">Credentials</h6>
                            </CCol>

                            {settings.mode === 'sandbox' ? (
                                <>
                                    <CCol md={6}>
                                        <CFormLabel className="small fw-bold text-uppercase opacity-75">Sandbox Client ID</CFormLabel>
                                        <CFormInput
                                            placeholder="Enter Sandbox Client ID"
                                            value={settings.sandbox_client_id}
                                            onChange={(e) => setSettings({ ...settings, sandbox_client_id: e.target.value })}
                                        />
                                    </CCol>
                                    <CCol md={6}>
                                        <CFormLabel className="small fw-bold text-uppercase opacity-75">Sandbox Client Secret</CFormLabel>
                                        <CFormInput
                                            type="password"
                                            placeholder="Enter Sandbox Client Secret"
                                            value={settings.sandbox_client_secret}
                                            onChange={(e) => setSettings({ ...settings, sandbox_client_secret: e.target.value })}
                                        />
                                    </CCol>
                                </>
                            ) : (
                                <>
                                    <CCol md={6}>
                                        <CFormLabel className="small fw-bold text-uppercase opacity-75" style={{ color: '#05603d' }}>Live Client ID</CFormLabel>
                                        <CFormInput
                                            placeholder="Enter Live Client ID"
                                            value={settings.live_client_id}
                                            onChange={(e) => setSettings({ ...settings, live_client_id: e.target.value })}
                                        />
                                    </CCol>
                                    <CCol md={6}>
                                        <CFormLabel className="small fw-bold text-uppercase opacity-75" style={{ color: '#05603d' }}>Live Client Secret</CFormLabel>
                                        <CFormInput
                                            type="password"
                                            placeholder="Enter Live Client Secret"
                                            value={settings.live_client_secret}
                                            onChange={(e) => setSettings({ ...settings, live_client_secret: e.target.value })}
                                        />
                                    </CCol>
                                </>
                            )}

                            <CCol md={12}>
                                <CFormLabel className="small fw-bold text-uppercase opacity-75">PayPal Email Address</CFormLabel>
                                <CFormInput
                                    type="email"
                                    placeholder="your-paypal-email@example.com"
                                    value={settings.email}
                                    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                                />
                                <div className="text-muted small mt-1">This is the email address associated with your PayPal account.</div>
                            </CCol>

                            <CCol md={12} className="pt-4 border-top">
                                <CButton color="primary" className="px-5 shadow-sm" onClick={handleSave} disabled={saving}>
                                    {saving ? <CSpinner size="sm" className="me-2" /> : <CIcon icon={cilSave} className="me-2" />}
                                    Save PayPal Settings
                                </CButton>
                            </CCol>
                        </CForm>
                    </CCardBody>
                </CCard>

                <CCard className="bg-light border-0">
                    <CCardBody className="p-4 d-flex align-items-start gap-3">
                        <CIcon icon={cilCloudDownload} className="text-info mt-1" size="xl" />
                        <div>
                            <h6 className="fw-bold">How to get credentials?</h6>
                            <p className="text-muted small mb-0">
                                1. Log in to the <a href="https://developer.paypal.com/dashboard/applications/" target="_blank" rel="noreferrer" className="text-primary fw-bold text-decoration-none">PayPal Developer Portal</a>.
                                <br />2. Go to 'Apps & Credentials' and create a new REST API app.
                                <br />3. Copy the Client ID and Secret for both Sandbox and Live environments.
                            </p>
                        </div>
                    </CCardBody>
                </CCard>
            </CCol>
        </CRow>
    )
}

export default PayPalSettings
