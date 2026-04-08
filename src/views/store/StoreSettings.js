import React, { useState, useEffect } from 'react'
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
    CTable,
    CTableHead,
    CTableRow,
    CTableHeaderCell,
    CTableBody,
    CTableDataCell,
    CBadge,
    CModal,
    CModalHeader,
    CModalTitle,
    CModalBody,
    CModalFooter,
    CFormTextarea,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSettings, cilSave, cilCheckCircle, cilReload, cilChevronBottom, cilChevronRight } from '@coreui/icons'
import API_CONFIG from '../../apiConfig'

const StoreSettings = () => {
    const [activeTab, setActiveTab] = useState('general')
    const [isSaving, setIsSaving] = useState(false)
    const [isFetching, setIsFetching] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const [shippingZones, setShippingZones] = useState([])
    const [showAddZoneModal, setShowAddZoneModal] = useState(false)
    const [newZoneName, setNewZoneName] = useState('')
    const [zoneRegions, setZoneRegions] = useState([])
    const [zoneMethods, setZoneMethods] = useState([])
    const [editingZone, setEditingZone] = useState(null)
    const [showAddMethodForm, setShowAddMethodForm] = useState(false)
    const [allCountries, setAllCountries] = useState([])
    const [regionSearch, setRegionSearch] = useState('')
    const [expandedCountries, setExpandedCountries] = useState([])
    const [pages, setPages] = useState([])
    const [settings, setSettings] = useState({
        enableStock: true,
        lowStockThreshold: 2,
        outOfStockThreshold: 0,
<<<<<<< HEAD
        storeAddress: '',
        city: ''
=======
        storeAddress: '123 Commerce St',
        city: 'New York',
        gateways: {
            paypal: false,
            bank: false,
            cod: true
        },
        advanced: {
            // Page Setup
            cart_page: '',
            checkout_page: '',
            myaccount_page: '',
            terms_page: '',
            // Checkout Endpoints
            checkout_pay: 'order-pay',
            checkout_order_received: 'order-received',
            add_payment_method: 'add-payment-method',
            delete_payment_method: 'delete-payment-method',
            set_default_payment_method: 'set-default-payment-method',
            // Account Endpoints
            orders: 'orders',
            view_order: 'view-order',
            edit_account: 'edit-account',
            edit_address: 'edit-address',
            payment_methods: 'payment-methods',
            lost_password: 'lost-password',
            customer_logout: 'customer-logout'
        }
>>>>>>> a00c0a5d408c7a47a227656e62dea81ad2cefd91
    })
    const [errorMsg, setErrorMsg] = useState(null)

    const tabs = [
        { id: 'general', name: 'General' },
        { id: 'products', name: 'Products' },
        { id: 'tax', name: 'Tax' },
        { id: 'shipping', name: 'Shipping' },
        { id: 'privacy', name: 'Accounts & Privacy' },
        { id: 'emails', name: 'Emails' },
        { id: 'integration', name: 'Integration' },
        { id: 'visibility', name: 'Site visibility' },
        { id: 'pos', name: 'Point of Sale' },
        { id: 'advanced', name: 'Advanced' },
    ]

    const handleSave = async () => {
        setIsSaving(true)
<<<<<<< HEAD
        // Synchronize with front-end Checkout
        localStorage.setItem('wc_store_settings', JSON.stringify(settings))
=======
        const authHeader = API_CONFIG.getBasicAuthHeader()
>>>>>>> a00c0a5d408c7a47a227656e62dea81ad2cefd91

        try {
            if (activeTab === 'advanced') {
                const advancedData = [
                    { id: 'woocommerce_cart_page_id', value: settings.advanced.cart_page },
                    { id: 'woocommerce_checkout_page_id', value: settings.advanced.checkout_page },
                    { id: 'woocommerce_myaccount_page_id', value: settings.advanced.myaccount_page },
                    { id: 'woocommerce_terms_page_id', value: settings.advanced.terms_page },
                    { id: 'woocommerce_checkout_pay_endpoint', value: settings.advanced.checkout_pay },
                    { id: 'woocommerce_checkout_order_received_endpoint', value: settings.advanced.checkout_order_received },
                    { id: 'woocommerce_myaccount_add_payment_method_endpoint', value: settings.advanced.add_payment_method },
                    { id: 'woocommerce_myaccount_delete_payment_method_endpoint', value: settings.advanced.delete_payment_method },
                    { id: 'woocommerce_myaccount_set_default_payment_method_endpoint', value: settings.advanced.set_default_payment_method },
                    { id: 'woocommerce_myaccount_orders_endpoint', value: settings.advanced.orders },
                    { id: 'woocommerce_myaccount_view_order_endpoint', value: settings.advanced.view_order },
                    { id: 'woocommerce_myaccount_edit_account_endpoint', value: settings.advanced.edit_account },
                    { id: 'woocommerce_myaccount_edit_address_endpoint', value: settings.advanced.edit_address },
                    { id: 'woocommerce_myaccount_payment_methods_endpoint', value: settings.advanced.payment_methods },
                    { id: 'woocommerce_myaccount_lost_password_endpoint', value: settings.advanced.lost_password },
                    { id: 'woocommerce_logout_endpoint', value: settings.advanced.customer_logout }
                ];

                await fetch(`${API_CONFIG.BASE_URL}wc/v3/settings/advanced/batch`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Authorization': authHeader },
                    body: JSON.stringify({ update: advancedData })
                });
            }

            localStorage.setItem('wc_payment_settings', JSON.stringify(settings.gateways))
            setShowSuccess(true)
            setTimeout(() => setShowSuccess(false), 3000)
        } catch (err) {
            console.error('Save failed:', err)
        } finally {
            setIsSaving(false)
        }
    }

    const handleAddZone = async () => {
        if (!newZoneName) return
        setIsSaving(true)
        try {
            const authHeader = API_CONFIG.getBasicAuthHeader()
            const zoneId = editingZone ? editingZone.id : null

            // 1. Save main zone name
            const zoneResp = await fetch(`${API_CONFIG.BASE_URL}wc/v3/shipping/zones${zoneId ? `/${zoneId}` : ''}`, {
                method: zoneId ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': authHeader },
                body: JSON.stringify({ name: newZoneName })
            });

            if (zoneResp.ok) {
                const savedZone = await zoneResp.json();
                const finalZoneId = savedZone.id;

                // 2. Save Regions (Locations)
                await fetch(`${API_CONFIG.BASE_URL}wc/v3/shipping/zones/${finalZoneId}/locations`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Authorization': authHeader },
                    body: JSON.stringify(zoneRegions)
                });

                // 3. Save Methods (This is simplified - in production you'd reconcile existing vs new)
                // For now, we'll just add new ones if they don't have an instance_id
                for (const method of zoneMethods) {
                    if (!method.instance_id) {
                        await fetch(`${API_CONFIG.BASE_URL}wc/v3/shipping/zones/${finalZoneId}/methods`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Authorization': authHeader },
                            body: JSON.stringify({
                                method_id: method.method_id,
                                enabled: method.enabled,
                                settings: method.settings
                            })
                        });
                    }
                }

                setShowAddZoneModal(false)
                setEditingZone(null)
                setNewZoneName('')
                setZoneRegions([])
                setZoneMethods([])
                fetchRemoteConfig() // Refresh list
            }
        } catch (err) {
            console.error('Failed to save zone details:', err)
        } finally {
            setIsSaving(false)
        }
    }

    const handleEditZone = async (zone) => {
        setIsFetching(true)
        const authHeader = API_CONFIG.getBasicAuthHeader()
        try {
            // Fetch regions and methods for this specific zone
            const [locResp, methResp] = await Promise.all([
                fetch(`${API_CONFIG.BASE_URL}wc/v3/shipping/zones/${zone.id}/locations`, { headers: { 'Authorization': authHeader } }),
                fetch(`${API_CONFIG.BASE_URL}wc/v3/shipping/zones/${zone.id}/methods`, { headers: { 'Authorization': authHeader } })
            ]);

            if (locResp.ok && methResp.ok) {
                setEditingZone(zone);
                setNewZoneName(zone.name);
                setZoneRegions(await locResp.json());
                setZoneMethods(await methResp.json());
                setShowAddZoneModal(true);
            }
        } catch (err) {
            console.error('Failed to fetch zone details:', err);
        } finally {
            setIsFetching(false);
        }
    }



    const fetchPages = async () => {
        try {
            const authHeader = API_CONFIG.getBasicAuthHeader()
            const resp = await fetch(`${API_CONFIG.BASE_URL}wp/v2/pages?per_page=100&status=publish`, {
                headers: { 'Authorization': authHeader }
            })
            if (resp.ok) {
                const data = await resp.json()
                setPages(data.map(p => ({ id: p.id, title: p.title.rendered })))
            }
        } catch (err) {
            console.error('Failed to pre-fetch location data:', err)
        }
    }

    const fetchRemoteConfig = async () => {
        setIsFetching(true)
        setErrorMsg(null)
        try {
            const authHeader = API_CONFIG.getBasicAuthHeader()
            const extractJson = (text) => {
                try {
                    return JSON.parse(text);
                } catch (e) {
                    const start = text.indexOf('[');
                    const last = text.lastIndexOf(']');
                    if (start !== -1 && last !== -1 && last > start) {
                        return JSON.parse(text.substring(start, last + 1));
                    }
                    const sObj = text.indexOf('{');
                    const eObj = text.lastIndexOf('}');
                    if (sObj !== -1 && eObj !== -1 && eObj > sObj) {
                        return JSON.parse(text.substring(sObj, eObj + 1));
                    }
                    throw e;
                }
            };

            if (activeTab === 'shipping') {
                const resp = await fetch(`${API_CONFIG.BASE_URL}wc/v3/shipping/zones`, {
                    headers: { 'Authorization': authHeader }
                });
                const text = await resp.text();
                let data = [];
                try {
                    data = extractJson(text);
                } catch (e) {
                    console.error('Failed to parse shipping zones JSON:', e, text);
                }

                if (resp.ok) {
                    try {
                        const rowResp = await fetch(`${API_CONFIG.BASE_URL}wc/v3/shipping/zones/0`, {
                            headers: { 'Authorization': authHeader }
                        });
                        if (rowResp.ok) {
                            const rowText = await rowResp.text();
                            const rowData = extractJson(rowText);
                            if (!data.find(z => z.id === 0)) data.push(rowData);
                        }
                    } catch (e) {
                        console.warn('Zone 0 fetch failed', e);
                    }
                    setShippingZones(data);
                } else {
                    setErrorMsg(`Failed to load shipping zones: ${data.message || resp.statusText}`);
                }
                return;
            }

            const resp = await fetch(`${API_CONFIG.BASE_URL}wc/v3/settings/${activeTab}`, {
                headers: { 'Authorization': authHeader }
            });

            const text = await resp.text();
            if (resp.ok) {
                const data = extractJson(text);
                const newSettings = { ...settings };
                data.forEach(item => {
                    if (item.id === 'woocommerce_store_address') newSettings.storeAddress = item.value;
                    if (item.id === 'woocommerce_store_city') newSettings.city = item.value;
                    if (item.id === 'woocommerce_manage_stock') newSettings.enableStock = item.value === 'yes';
                    if (item.id === 'woocommerce_notify_low_stock_amount') newSettings.lowStockThreshold = item.value;
                    if (item.id === 'woocommerce_notify_no_stock_amount') newSettings.outOfStockThreshold = item.value;
                    
                    // Advanced Page setup
                    if (item.id === 'woocommerce_cart_page_id') newSettings.advanced.cart_page = String(item.value);
                    if (item.id === 'woocommerce_checkout_page_id') newSettings.advanced.checkout_page = String(item.value);
                    if (item.id === 'woocommerce_myaccount_page_id') newSettings.advanced.myaccount_page = String(item.value);
                    if (item.id === 'woocommerce_terms_page_id') newSettings.advanced.terms_page = String(item.value);

                    // Checkout Endpoints
                    if (item.id === 'woocommerce_checkout_pay_endpoint') newSettings.advanced.checkout_pay = item.value;
                    if (item.id === 'woocommerce_checkout_order_received_endpoint') newSettings.advanced.checkout_order_received = item.value;
                    if (item.id === 'woocommerce_myaccount_add_payment_method_endpoint') newSettings.advanced.add_payment_method = item.value;
                    if (item.id === 'woocommerce_myaccount_delete_payment_method_endpoint') newSettings.advanced.delete_payment_method = item.value;
                    if (item.id === 'woocommerce_myaccount_set_default_payment_method_endpoint') newSettings.advanced.set_default_payment_method = item.value;

                    // Account Endpoints
                    if (item.id === 'woocommerce_myaccount_orders_endpoint') newSettings.advanced.orders = item.value;
                    if (item.id === 'woocommerce_myaccount_view_order_endpoint') newSettings.advanced.view_order = item.value;
                    if (item.id === 'woocommerce_myaccount_edit_account_endpoint') newSettings.advanced.edit_account = item.value;
                    if (item.id === 'woocommerce_myaccount_edit_address_endpoint') newSettings.advanced.edit_address = item.value;
                    if (item.id === 'woocommerce_myaccount_payment_methods_endpoint') newSettings.advanced.payment_methods = item.value;
                    if (item.id === 'woocommerce_myaccount_lost_password_endpoint') newSettings.advanced.lost_password = item.value;
                    if (item.id === 'woocommerce_logout_endpoint') newSettings.advanced.customer_logout = item.value;
                });
                setSettings(newSettings);
            }
        } catch (err) {
            console.error('Remote fetch failed:', err);
        } finally {
            setIsFetching(false)
        }
    }

    // Initial fetch for remote config and countries
    useEffect(() => {
        const fetchBaseData = async () => {
            const authHeader = API_CONFIG.getBasicAuthHeader()
            try {
                const countryResp = await fetch(`${API_CONFIG.BASE_URL}wc/v3/data/countries`, {
                    headers: { 'Authorization': authHeader }
                })
                if (countryResp.ok) {
                    setAllCountries(await countryResp.json())
                }
            } catch (err) {
                console.error('Failed to pre-fetch location data:', err)
            }
        }
        fetchBaseData();
        fetchPages();
        fetchRemoteConfig();
    }, [activeTab]);

    return (
        <CRow>
            <CCol xs={12}>
                {showSuccess && (
                    <CAlert color="success" className="mb-3 border-0 shadow-sm d-flex align-items-center">
                        <CIcon icon={cilSave} className="me-2" />
                        Settings successfully saved to your WooCommerce store.
                    </CAlert>
                )}
                {errorMsg && (
                    <CAlert color="danger" dismissible onClose={() => setErrorMsg(null)} className="mb-3 border-0 shadow-sm">
                        {errorMsg}
                    </CAlert>
                )}
                <CCard className="mb-4 shadow-sm border-0">
                    <CCardHeader className="bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
                        <div className="fw-bold fs-5 text-dark">
                            <CIcon icon={cilSettings} className="me-2 text-primary" />
                            Settings
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
                                                onChange={(e) => setSettings({ ...settings, storeAddress: e.target.value })}
                                            />
                                        </CCol>
                                        <CCol md={6}>
                                            <CFormLabel>City</CFormLabel>
                                            <CFormInput
                                                value={settings.city}
                                                onChange={(e) => setSettings({ ...settings, city: e.target.value })}
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
                                                onChange={(e) => setSettings({ ...settings, enableStock: e.target.checked })}
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
                                                        onChange={(e) => setSettings({ ...settings, lowStockThreshold: e.target.value })}
                                                    />
                                                    <div className="text-muted small">When stock reaches this number, the low stock notification will be sent.</div>
                                                </CCol>

                                                <CCol md={6}>
                                                    <CFormLabel className="fw-bold small">Out of stock threshold</CFormLabel>
                                                    <CFormInput
                                                        type="number"
                                                        value={settings.outOfStockThreshold}
                                                        onChange={(e) => setSettings({ ...settings, outOfStockThreshold: e.target.value })}
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

                                <CTabPane visible={activeTab === 'shipping'}>
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <h5 className="mb-0">Shipping Zones</h5>
                                        <div className="d-flex gap-2">
                                            <CButton color="primary" size="sm" onClick={() => setShowAddZoneModal(true)}>
                                                <CIcon icon={cilReload} className="me-1" style={{ transform: 'rotate(45deg)' }} /> Add shipping zone
                                            </CButton>
                                            <CButton color="outline-primary" size="sm" onClick={() => window.open('http://localhost/wordpress/wordpress-backend/wp-admin/admin.php?page=wc-settings&tab=shipping', '_blank')}>
                                                Manage in WP Admin
                                            </CButton>
                                        </div>
                                    </div>
                                    <p className="text-muted small mb-4">
                                        A shipping zone is a geographic area where a certain set of shipping methods are offered.
                                        WooCommerce will match a customer to a single zone using their shipping address and present the shipping methods within that zone to them.
                                    </p>

                                    {isFetching ? (
                                        <div className="text-center py-5"><CSpinner color="primary" /></div>
                                    ) : (
                                        <CTable align="middle" className="mb-0 border rounded overflow-hidden shadow-sm" hover responsive>
                                            <CTableHead color="light">
                                                <CTableRow>
                                                    <CTableHeaderCell>Zone Name</CTableHeaderCell>
                                                    <CTableHeaderCell>Regions</CTableHeaderCell>
                                                    <CTableHeaderCell>Shipping Methods</CTableHeaderCell>
                                                </CTableRow>
                                            </CTableHead>
                                            <CTableBody>
                                                {shippingZones.map((zone) => (
                                                    <CTableRow key={zone.id} onClick={() => handleEditZone(zone)} style={{ cursor: 'pointer' }}>
                                                        <CTableDataCell>
                                                            <div className="fw-bold text-primary">{zone.name}</div>
                                                            {zone.id === 0 && <small className="text-muted d-block text-uppercase" style={{ fontSize: '10px' }}>Global Default</small>}
                                                        </CTableDataCell>
                                                        <CTableDataCell>
                                                            <span className="small text-muted">
                                                                {zone.formatted_location || (zone.id === 0 ? 'Locations not covered by other zones' : 'No regions defined')}
                                                            </span>
                                                        </CTableDataCell>
                                                        <CTableDataCell>
                                                            <CBadge color="info" shape="rounded-pill" className="px-3" style={{ fontSize: '11px' }}>Manage Methods</CBadge>
                                                        </CTableDataCell>
                                                    </CTableRow>
                                                ))}
                                                {shippingZones.length === 0 && !errorMsg && (
                                                    <CTableRow>
                                                        <CTableDataCell colSpan={3} className="text-center py-5 text-muted">
                                                            No shipping zones configured yet.
                                                        </CTableDataCell>
                                                    </CTableRow>
                                                )}
                                            </CTableBody>
                                        </CTable>
                                    )}
                                </CTabPane>

                                {/* Modal for Adding/Editing Shipping Zone */}
                                <CModal visible={showAddZoneModal} onClose={() => {
                                    setShowAddZoneModal(false);
                                    setEditingZone(null);
                                    setNewZoneName('');
                                    setZoneRegions([]);
                                    setZoneMethods([]);
                                }} size="lg">
                                    <CModalHeader>
                                        <CModalTitle>{editingZone ? `Edit Shipping Zone: ${editingZone.name}` : 'Add shipping zone'}</CModalTitle>
                                    </CModalHeader>
                                    <CModalBody>
                                        <CRow className="g-3 mb-4">
                                            <CCol md={12}>
                                                <CFormLabel className="fw-bold">Zone Name</CFormLabel>
                                                <CFormInput
                                                    placeholder="e.g. Domestic / California"
                                                    value={newZoneName}
                                                    onChange={(e) => setNewZoneName(e.target.value)}
                                                    required
                                                />
                                                <div className="text-muted small mt-1">Provide a descriptive name for this zone.</div>
                                            </CCol>
                                            <CCol md={12}>
                                                <CFormLabel className="fw-bold">Zone Regions</CFormLabel>

                                                {/* Searchable Checkbox List */}
                                                <CFormInput
                                                    placeholder="Search countries or states..."
                                                    className="mb-2 shadow-sm"
                                                    value={regionSearch}
                                                    onChange={(e) => setRegionSearch(e.target.value)}
                                                />

                                                <div className="border rounded bg-white overflow-auto mb-2 px-0 py-0 shadow-sm" style={{ maxHeight: '350px' }}>
                                                    {allCountries.length === 0 ? (
                                                        <div className="text-center py-5 text-muted">
                                                            <CSpinner size="sm" className="me-2" /> Loading locations...
                                                        </div>
                                                    ) : (() => {
                                                        const search = regionSearch.toLowerCase();
                                                        return allCountries.map(country => {
                                                            const matchedStates = (country.states || []).filter(s => s.name.toLowerCase().includes(search));
                                                            const countryMatches = country.name.toLowerCase().includes(search);

                                                            if (!countryMatches && matchedStates.length === 0) return null; const isExpanded = expandedCountries.includes(country.code) || (search && matchedStates.length > 0);

                                                            return (
                                                                <div key={country.code} className="border-bottom last-child-border-0">
                                                                    <div className="bg-light px-2 py-2 d-flex align-items-center sticky-top shadow-sm border-bottom" style={{ top: 0, zIndex: 1 }}>
                                                                        <div
                                                                            className="me-1 cursor-pointer hover-bg-gray rounded"
                                                                            style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                                            onClick={() => {
                                                                                setExpandedCountries(prev =>
                                                                                    prev.includes(country.code)
                                                                                        ? prev.filter(c => c !== country.code)
                                                                                        : [...prev, country.code]
                                                                                );
                                                                            }}
                                                                        >
                                                                            <CIcon
                                                                                icon={isExpanded ? cilChevronBottom : cilChevronRight}
                                                                                size="sm"
                                                                                className="text-muted"
                                                                            />
                                                                        </div>
                                                                        <CFormCheck
                                                                            id={`zone-reg-${country.code}`}
                                                                            checked={zoneRegions.some(r => r.code === country.code)}
                                                                            onChange={(e) => {
                                                                                const newReg = e.target.checked
                                                                                    ? [...zoneRegions, { code: country.code, type: 'country' }]
                                                                                    : zoneRegions.filter(r => r.code !== country.code);
                                                                                setZoneRegions(newReg);
                                                                            }}
                                                                        />
                                                                        <label htmlFor={`zone-reg-${country.code}`} className="ms-2 mb-0 fw-bold small text-dark d-flex justify-content-between w-100 cursor-pointer">
                                                                            <span>{country.name}</span>
                                                                            <CBadge color="primary" size="sm" shape="rounded-pill" style={{ opacity: 0.6, fontSize: '9px' }}>{country.states?.length || 0} STATES</CBadge>
                                                                        </label>
                                                                    </div>
                                                                    {isExpanded && (
                                                                        <div className="py-1 bg-white">
                                                                            {(matchedStates.length > 0 ? matchedStates : (regionSearch ? [] : (country.states || []))).map(state => {
                                                                                const stateCode = `${country.code}:${state.code}`;
                                                                                return (
                                                                                    <div key={stateCode} className="d-flex align-items-center py-1 px-4 ms-4 hover-bg-light rounded">
                                                                                        <CFormCheck
                                                                                            id={`zone-reg-${stateCode}`}
                                                                                            checked={zoneRegions.some(r => r.code === stateCode)}
                                                                                            onChange={(e) => {
                                                                                                const newReg = e.target.checked
                                                                                                    ? [...zoneRegions, { code: stateCode, type: 'state' }]
                                                                                                    : zoneRegions.filter(r => r.code !== stateCode);
                                                                                                setZoneRegions(newReg);
                                                                                            }}
                                                                                        />
                                                                                        <label htmlFor={`zone-reg-${stateCode}`} className="ms-2 mb-0 small text-muted d-flex justify-content-between w-100 cursor-pointer">
                                                                                            <span>{state.name}</span>
                                                                                        </label>
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                            ;
                                                        });
                                                    })()}
                                                </div>
                                                <div className="text-muted d-flex justify-content-between small px-1">
                                                    <span>Selected: {zoneRegions.length} regions</span>
                                                    <CButton variant="ghost" size="sm" className="p-0 text-primary" onClick={() => setZoneRegions([])}>Clear all</CButton>
                                                </div>
                                            </CCol>
                                        </CRow>

                                        <hr className="my-4 opacity-10" />

                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h6 className="mb-0 fw-bold">Shipping Methods</h6>
                                            <CButton color="outline-primary" size="sm" onClick={() => setShowAddMethodForm(true)}>Add method</CButton>
                                        </div>

                                        {showAddMethodForm && (
                                            <CCard className="mb-3 border-primary bg-light">
                                                <CCardBody className="p-3">
                                                    <div className="d-flex gap-2 align-items-end">
                                                        <div className="flex-grow-1">
                                                            <CFormLabel className="small">Select method</CFormLabel>
                                                            <CFormSelect id="new-method-type" defaultValue="flat_rate">
                                                                <option value="flat_rate">Flat Rate</option>
                                                                <option value="free_shipping">Free Shipping</option>
                                                                <option value="local_pickup">Local Pickup</option>
                                                            </CFormSelect>
                                                        </div>
                                                        <CButton color="primary" size="sm" onClick={() => {
                                                            const type = document.getElementById('new-method-type').value;
                                                            const methodNames = {
                                                                flat_rate: 'Flat rate',
                                                                free_shipping: 'Free shipping',
                                                                local_pickup: 'Local pickup'
                                                            };
                                                            setZoneMethods([...zoneMethods, {
                                                                id: Date.now(),
                                                                method_id: type,
                                                                title: methodNames[type],
                                                                enabled: true,
                                                                settings: { cost: '0' }
                                                            }]);
                                                            setShowAddMethodForm(false);
                                                        }}>Add</CButton>
                                                        <CButton color="secondary" variant="ghost" size="sm" onClick={() => setShowAddMethodForm(false)}>Cancel</CButton>
                                                    </div>
                                                </CCardBody>
                                            </CCard>
                                        )}

                                        <CTable align="middle" className="mb-0 border small" hover>
                                            <CTableHead color="light">
                                                <CTableRow>
                                                    <CTableHeaderCell>Title</CTableHeaderCell>
                                                    <CTableHeaderCell>Enabled</CTableHeaderCell>
                                                    <CTableHeaderCell>Description</CTableHeaderCell>
                                                    <CTableHeaderCell className="text-end">Actions</CTableHeaderCell>
                                                </CTableRow>
                                            </CTableHead>
                                            <CTableBody>
                                                {zoneMethods.map((m, idx) => (
                                                    <CTableRow key={m.id || idx}>
                                                        <CTableDataCell className="fw-bold">{m.title}</CTableDataCell>
                                                        <CTableDataCell>
                                                            <CFormSwitch checked={m.enabled} onChange={(e) => {
                                                                const newMethods = [...zoneMethods];
                                                                newMethods[idx].enabled = e.target.checked;
                                                                setZoneMethods(newMethods);
                                                            }} />
                                                        </CTableDataCell>
                                                        <CTableDataCell className="text-muted">
                                                            {m.method_id === 'flat_rate' ? `Cost: ${m.settings?.cost || '0'}` : 'N/A'}
                                                        </CTableDataCell>
                                                        <CTableDataCell className="text-end">
                                                            <CButton color="danger" variant="ghost" size="sm" onClick={() => {
                                                                setZoneMethods(zoneMethods.filter((_, i) => i !== idx));
                                                            }}>Remove</CButton>
                                                        </CTableDataCell>
                                                    </CTableRow>
                                                ))}
                                                {zoneMethods.length === 0 && (
                                                    <CTableRow>
                                                        <CTableDataCell colSpan={4} className="text-center py-3 text-muted">
                                                            No shipping methods added to this zone.
                                                        </CTableDataCell>
                                                    </CTableRow>
                                                )}
                                            </CTableBody>
                                        </CTable>
                                    </CModalBody>
                                    <CModalFooter>
                                        <CButton color="secondary" onClick={() => setShowAddZoneModal(false)}>Cancel</CButton>
                                        <CButton color="primary" onClick={handleAddZone} disabled={isSaving || !newZoneName}>
                                            {isSaving ? <CSpinner size="sm" /> : 'Save changes'}
                                        </CButton>
                                    </CModalFooter>
                                </CModal>

<<<<<<< HEAD
                                <CTabPane visible={activeTab === 'pos'}>
=======
                                <CTabPane visible={activeTab === 'payments'}>
                                    <h5 className="mb-4">Payment Gateways</h5>
                                    <div className="list-group list-group-flush border rounded overflow-hidden">
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
                                </CTabPane>                                <CTabPane visible={activeTab === 'pos'}>
>>>>>>> a00c0a5d408c7a47a227656e62dea81ad2cefd91
                                    <CAlert color="info" className="d-flex align-items-center">
                                        <div>Point of Sale (POS) integration is active. You can manage your physical terminals here.</div>
                                    </CAlert>
                                    <h5 className="mt-4">Terminal Management</h5>
                                    <CButton color="outline-primary" size="sm">Initialize New Terminal</CButton>
                                </CTabPane>

                                <CTabPane visible={activeTab === 'advanced'}>
                                    <h5 className="mb-4">Page Setup</h5>
                                    <CForm className="row g-3 mb-5 px-3">
                                        <CRow className="mb-3 align-items-center">
                                            <CFormLabel className="col-sm-4 text-sm-end fw-semibold">Cart page</CFormLabel>
                                            <CCol sm={8}>
                                                <CFormSelect
                                                    value={settings.advanced.cart_page}
                                                    onChange={(e) => setSettings({ ...settings, advanced: { ...settings.advanced, cart_page: e.target.value } })}
                                                >
                                                    <option value="">Select a page...</option>
                                                    {pages.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                                                </CFormSelect>
                                            </CCol>
                                        </CRow>
                                        <CRow className="mb-3 align-items-center">
                                            <CFormLabel className="col-sm-4 text-sm-end fw-semibold">Checkout page</CFormLabel>
                                            <CCol sm={8}>
                                                <CFormSelect
                                                    value={settings.advanced.checkout_page}
                                                    onChange={(e) => setSettings({ ...settings, advanced: { ...settings.advanced, checkout_page: e.target.value } })}
                                                >
                                                    <option value="">Select a page...</option>
                                                    {pages.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                                                </CFormSelect>
                                            </CCol>
                                        </CRow>
                                        <CRow className="mb-3 align-items-center">
                                            <CFormLabel className="col-sm-4 text-sm-end fw-semibold">My account page</CFormLabel>
                                            <CCol sm={8}>
                                                <CFormSelect
                                                    value={settings.advanced.myaccount_page}
                                                    onChange={(e) => setSettings({ ...settings, advanced: { ...settings.advanced, myaccount_page: e.target.value } })}
                                                >
                                                    <option value="">Select a page...</option>
                                                    {pages.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                                                </CFormSelect>
                                            </CCol>
                                        </CRow>
                                        <CRow className="mb-3 align-items-center">
                                            <CFormLabel className="col-sm-4 text-sm-end fw-semibold">Terms and conditions</CFormLabel>
                                            <CCol sm={8}>
                                                <CFormSelect
                                                    value={settings.advanced.terms_page}
                                                    onChange={(e) => setSettings({ ...settings, advanced: { ...settings.advanced, terms_page: e.target.value } })}
                                                >
                                                    <option value="">Select a page (optional)...</option>
                                                    {pages.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                                                </CFormSelect>
                                            </CCol>
                                        </CRow>
                                    </CForm>

                                    <h5 className="mb-4 pt-3 border-top">Checkout Endpoints</h5>
                                    <p className="small text-muted mb-4 px-3">Endpoints are appended to your page URLs to handle specific actions during the checkout process. They should be unique.</p>
                                    <CForm className="row g-3 mb-5 px-3">
                                        {[
                                            { label: 'Pay', key: 'checkout_pay' },
                                            { label: 'Order received', key: 'checkout_order_received' },
                                            { label: 'Add payment method', key: 'add_payment_method' },
                                            { label: 'Delete payment method', key: 'delete_payment_method' },
                                            { label: 'Set default payment method', key: 'set_default_payment_method' }
                                        ].map(item => (
                                            <CRow className="mb-3 align-items-center" key={item.key}>
                                                <CFormLabel className="col-sm-4 text-sm-end fw-semibold">{item.label}</CFormLabel>
                                                <CCol sm={8}>
                                                    <CFormInput
                                                        value={settings.advanced[item.key]}
                                                        onChange={(e) => setSettings({ ...settings, advanced: { ...settings.advanced, [item.key]: e.target.value } })}
                                                    />
                                                </CCol>
                                            </CRow>
                                        ))}
                                    </CForm>

                                    <h5 className="mb-4 pt-3 border-top">Account Endpoints</h5>
                                    <p className="small text-muted mb-4 px-3">Endpoints are appended to your page URLs to handle specific actions on the accounts page. They should be unique.</p>
                                    <CForm className="row g-3 px-3">
                                        {[
                                            { label: 'Orders', key: 'orders' },
                                            { label: 'View order', key: 'view_order' },
                                            { label: 'Edit account', key: 'edit_account' },
                                            { label: 'Edit address', key: 'edit_address' },
                                            { label: 'Payment methods', key: 'payment_methods' },
                                            { label: 'Lost password', key: 'lost_password' },
                                            { label: 'Logout', key: 'customer_logout' }
                                        ].map(item => (
                                            <CRow className="mb-3 align-items-center" key={item.key}>
                                                <CFormLabel className="col-sm-4 text-sm-end fw-semibold">{item.label}</CFormLabel>
                                                <CCol sm={8}>
                                                    <CFormInput
                                                        value={settings.advanced[item.key]}
                                                        onChange={(e) => setSettings({ ...settings, advanced: { ...settings.advanced, [item.key]: e.target.value } })}
                                                    />
                                                </CCol>
                                            </CRow>
                                        ))}
                                    </CForm>
                                </CTabPane>

                                {/* Fallback for other tabs */}
<<<<<<< HEAD
                                {!['general', 'products', 'tax', 'pos', 'shipping'].includes(activeTab) && (
                                    <CTabPane visible>
                                        <div className="text-center py-5">
                                            <div className="text-muted mb-3">Settings for <strong>{tabs.find(t => t.id === activeTab)?.name}</strong> are being synchronized with your WordPress site.</div>
                                            <CButton color="primary" variant="outline" size="sm" onClick={fetchRemoteConfig} disabled={isFetching}>
                                                {isFetching ? <CSpinner size="sm" /> : <><CIcon icon={cilReload} className="me-1" /> Fetch Remote Config</>}
                                            </CButton>
                                        </div>
                                    </CTabPane>
=======
                                {!['general', 'products', 'tax', 'payments', 'pos', 'shipping', 'advanced'].includes(activeTab) && (
                                    <div className="text-center py-5">
                                        <div className="text-muted mb-3">Settings for <strong>{tabs.find(t => t.id === activeTab)?.name}</strong> are being synchronized with your WordPress site.</div>
                                        <CButton color="primary" variant="outline" size="sm" onClick={fetchRemoteConfig} disabled={isFetching}>
                                            {isFetching ? <CSpinner size="sm" /> : <><CIcon icon={cilReload} className="me-1" /> Fetch Remote Config</>}
                                        </CButton>
                                    </div>
>>>>>>> a00c0a5d408c7a47a227656e62dea81ad2cefd91
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
