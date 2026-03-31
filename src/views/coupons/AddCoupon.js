import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CForm,
  CFormLabel,
  CFormInput,
  CFormTextarea,
  CFormSelect,
  CButton,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
  CFormCheck,
  CSpinner,
  CAlert,
} from '@coreui/react'
import API_CONFIG from 'src/apiConfig'

const AddCoupon = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditMode = !!id
  const [activeKey, setActiveKey] = useState(1)
  const [loading, setLoading] = useState(false)
  const [initialDataLoading, setInitialDataLoading] = useState(true)
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState(null)

  const [couponData, setCouponData] = useState({
    code: '',
    amount: '',
    discount_type: 'fixed_cart',
    description: '',
    date_expires: '',
    free_shipping: false,
    individual_use: false,
    exclude_sale_items: false,
    minimum_amount: '',
    maximum_amount: '',
    product_ids: [],
    excluded_product_ids: [],
    product_categories: [],
    excluded_product_categories: [],
    usage_limit: '',
    usage_limit_per_user: '',
    limit_usage_to_x_items: '',
    customer_emails: [],
    email_restrictions_input: '',
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { 'Authorization': API_CONFIG.getBasicAuthHeader() }
        const [catRes, prodRes] = await Promise.all([
          fetch(`${API_CONFIG.BASE_URL}wc/v3/products/categories?per_page=100`, { headers }),
          fetch(`${API_CONFIG.BASE_URL}wc/v3/products?per_page=100`, { headers }),
        ])

        if (catRes.ok) setCategories(await catRes.json())
        if (prodRes.ok) setProducts(await prodRes.json())

        if (isEditMode) {
          const res = await fetch(`${API_CONFIG.BASE_URL}wc/v3/coupons/${id}`, { headers })
          if (res.ok) {
            const data = await res.json()
            setCouponData({
              ...data,
              email_restrictions_input: data.email_restrictions ? data.email_restrictions.join(', ') : '',
              date_expires: data.date_expires ? data.date_expires.split('T')[0] : '',
            })
          }
        }
      } catch (err) {
        console.error('Error fetching initial data:', err)
        setError('Failed to load coupon data.')
      } finally {
        setInitialDataLoading(false)
      }
    }
    fetchData()
  }, [id, isEditMode])

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target
    setCouponData(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value
    }))
  }

  const handleMultiSelect = (e, field) => {
    const values = Array.from(e.target.selectedOptions, option => parseInt(option.value));
    setCouponData(prev => ({ ...prev, [field]: values }));
  }

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const submissionData = { ...couponData }

      // 1. Sanitize Discount Type (WC expects 'percent' not 'percentage')
      if (submissionData.discount_type === 'percentage') {
        submissionData.discount_type = 'percent'
      }

      // 2. Sanitize Amount (Must be string representation of number)
      submissionData.amount = submissionData.amount ? submissionData.amount.toString() : '0'

      // 3. Sanitize Usage Limits (Must be integers or removed if empty)
      const numericFields = ['usage_limit', 'usage_limit_per_user', 'limit_usage_to_x_items']
      numericFields.forEach(field => {
        if (submissionData[field] === '' || submissionData[field] === null || submissionData[field] === undefined) {
          delete submissionData[field]
        } else {
          submissionData[field] = parseInt(submissionData[field], 10)
        }
      })

      // 4. Sanitize Spend Amounts
      if (submissionData.minimum_amount === '') delete submissionData.minimum_amount
      if (submissionData.maximum_amount === '') delete submissionData.maximum_amount

      // 5. Process emails
      if (submissionData.email_restrictions_input) {
        submissionData.email_restrictions = submissionData.email_restrictions_input
          .split(',')
          .map(email => email.trim())
          .filter(email => email !== '')
      }
      delete submissionData.email_restrictions_input

      const apiUrl = isEditMode
        ? `${API_CONFIG.BASE_URL}wc/v3/coupons/${id}`
        : `${API_CONFIG.BASE_URL}wc/v3/coupons`

      const response = await fetch(apiUrl, {
        method: isEditMode ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': API_CONFIG.getBasicAuthHeader()
        },
        body: JSON.stringify(submissionData)
      })

      if (response.ok) {
        setSuccess(`Coupon ${isEditMode ? 'updated' : 'created'} successfully!`)
        if (!isEditMode) {
          setTimeout(() => navigate('/coupons/all'), 1500)
        }
      } else {
        const errData = await response.json()
        throw new Error(errData.message || 'Error processing request.')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (initialDataLoading) {
    return (
      <div className="text-center p-5">
        <CSpinner color="primary" />
        <p className="mt-3 text-muted">Loading coupon editor...</p>
      </div>
    )
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4 shadow-sm border-0">
          <CCardHeader className="bg-white py-3 fw-bold border-bottom">
            <h5 className="mb-0">{isEditMode ? `Edit Coupon: ${couponData.code}` : 'Add New Coupon'}</h5>
          </CCardHeader>
          <CCardBody className="p-4">
            {error && <CAlert color="danger" dismissible>{error}</CAlert>}
            {success && <CAlert color="success" dismissible>{success}</CAlert>}

            <CForm onSubmit={handleSubmit}>
              <div className="mb-4">
                <CFormInput
                  type="text"
                  id="code"
                  size="lg"
                  placeholder="Coupon code"
                  className="fw-bold border-primary border-2 mb-2"
                  value={couponData.code || ""}
                  onChange={handleChange}
                  required
                />
                <CFormTextarea
                  id="description"
                  placeholder="Description (optional)"
                  rows="2"
                  className="bg-light border-0"
                  value={couponData.description || ""}
                  onChange={handleChange}
                />
              </div>

              {/* Coupon Data Box */}
              <CCard className="mb-4 border shadow-sm rounded-3 overflow-hidden">
                <CCardHeader className="bg-light border-bottom py-3">
                  <strong className="text-secondary">Coupon Data</strong>
                </CCardHeader>
                <CCardBody className="p-0">
                  <div className="d-flex flex-row" style={{ minHeight: '400px' }}>
                    {/* Tabs Sidebar */}
                    <div className="bg-light border-end" style={{ width: '180px' }}>
                      <CNav variant="pills" className="flex-column p-0">
                        {[
                          { key: 1, label: 'General' },
                          { key: 2, label: 'Usage restriction' },
                          { key: 3, label: 'Usage limits' },
                        ].map(tab => (
                          <CNavItem key={tab.key}>
                            <CNavLink
                              className={`rounded-0 border-bottom text-dark py-3 px-3 cursor-pointer ${activeKey === tab.key ? 'bg-white border-end-0 fw-bold border-start border-start-4 border-primary' : ''}`}
                              active={activeKey === tab.key}
                              onClick={() => setActiveKey(tab.key)}
                              component="button"
                              type="button"
                            >
                              {tab.label}
                            </CNavLink>
                          </CNavItem>
                        ))}
                      </CNav>
                    </div>

                    {/* Tabs Content */}
                    <div className="flex-fill p-4">
                      <CTabContent>
                        {/* GENERAL TAB */}
                        <CTabPane visible={activeKey === 1}>
                          <CRow className="mb-3">
                            <CFormLabel className="col-sm-4 text-sm-end fw-semibold">Discount type</CFormLabel>
                            <CCol sm={8}>
                              <CFormSelect id="discount_type" value={couponData.discount_type} onChange={handleChange}>
                                <option value="percent">Percentage discount</option>
                                <option value="fixed_cart">Fixed cart discount</option>
                                <option value="fixed_product">Fixed product discount</option>
                              </CFormSelect>
                            </CCol>
                          </CRow>
                          <CRow className="mb-3">
                            <CFormLabel className="col-sm-4 text-sm-end fw-semibold">Coupon amount</CFormLabel>
                            <CCol sm={8}>
                              <CFormInput type="text" id="amount" value={couponData.amount || ""} onChange={handleChange} placeholder="0" />
                            </CCol>
                          </CRow>
                          <CRow className="mb-3">
                            <CFormLabel className="col-sm-4 text-sm-end fw-semibold">Allow free shipping</CFormLabel>
                            <CCol sm={8} className="pt-1">
                              <CFormCheck id="free_shipping" label={`Check this box if the coupon grants free shipping. A free shipping method must be enabled in your shipping zone and be set to require "a valid free shipping coupon" (or "either") for this to work.`} checked={couponData.free_shipping} onChange={handleChange} className="small text-muted" />
                            </CCol>
                          </CRow>
                          <CRow className="mb-3">
                            <CFormLabel className="col-sm-4 text-sm-end fw-semibold">Coupon expiry date</CFormLabel>
                            <CCol sm={8}>
                              <CFormInput type="date" id="date_expires" value={couponData.date_expires || ""} onChange={handleChange} />
                            </CCol>
                          </CRow>
                        </CTabPane>

                        {/* USAGE RESTRICTION TAB */}
                        <CTabPane visible={activeKey === 2}>
                          <CRow className="mb-3">
                            <CFormLabel className="col-sm-4 text-sm-end fw-semibold">Minimum spend</CFormLabel>
                            <CCol sm={8}>
                              <CFormInput type="text" id="minimum_amount" value={couponData.minimum_amount || ""} onChange={handleChange} placeholder="No minimum" />
                            </CCol>
                          </CRow>
                          <CRow className="mb-3">
                            <CFormLabel className="col-sm-4 text-sm-end fw-semibold">Maximum spend</CFormLabel>
                            <CCol sm={8}>
                              <CFormInput type="text" id="maximum_amount" value={couponData.maximum_amount || ""} onChange={handleChange} placeholder="No maximum" />
                            </CCol>
                          </CRow>
                          <CRow className="mb-3">
                            <CFormLabel className="col-sm-4 text-sm-end fw-semibold">Individual use only</CFormLabel>
                            <CCol sm={8} className="pt-1">
                              <CFormCheck id="individual_use" label="Check this box if the coupon cannot be used in conjunction with other coupons." checked={couponData.individual_use} onChange={handleChange} className="small" />
                            </CCol>
                          </CRow>
                          <CRow className="mb-3 border-bottom pb-3">
                            <CFormLabel className="col-sm-4 text-sm-end fw-semibold">Exclude sale items</CFormLabel>
                            <CCol sm={8} className="pt-1">
                              <CFormCheck id="exclude_sale_items" label="Check this box if the coupon should not apply to items on sale. Per-item coupons will only work if the item is not on sale. Per-cart coupons will only work if there are no sale items in the cart." checked={couponData.exclude_sale_items} onChange={handleChange} className="small" />
                            </CCol>
                          </CRow>

                          <CRow className="mb-3 mt-3">
                            <CFormLabel className="col-sm-4 text-sm-end fw-semibold">Products</CFormLabel>
                            <CCol sm={8}>
                              <CFormSelect id="product_ids" multiple size="4" value={couponData.product_ids} onChange={(e) => handleMultiSelect(e, 'product_ids')}>
                                {products.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}
                              </CFormSelect>
                            </CCol>
                          </CRow>
                          <CRow className="mb-3">
                            <CFormLabel className="col-sm-4 text-sm-end fw-semibold">Exclude products</CFormLabel>
                            <CCol sm={8}>
                              <CFormSelect id="excluded_product_ids" multiple size="4" value={couponData.excluded_product_ids} onChange={(e) => handleMultiSelect(e, 'excluded_product_ids')}>
                                {products.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}
                              </CFormSelect>
                            </CCol>
                          </CRow>
                          <CRow className="mb-3 pt-3 border-top">
                            <CFormLabel className="col-sm-4 text-sm-end fw-semibold">Product categories</CFormLabel>
                            <CCol sm={8}>
                              <CFormSelect id="product_categories" multiple size="4" value={couponData.product_categories} onChange={(e) => handleMultiSelect(e, 'product_categories')}>
                                {categories.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
                              </CFormSelect>
                            </CCol>
                          </CRow>
                          <CRow className="mb-3">
                            <CFormLabel className="col-sm-4 text-sm-end fw-semibold">Exclude categories</CFormLabel>
                            <CCol sm={8}>
                              <CFormSelect id="excluded_product_categories" multiple size="4" value={couponData.excluded_product_categories} onChange={(e) => handleMultiSelect(e, 'excluded_product_categories')}>
                                {categories.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
                              </CFormSelect>
                            </CCol>
                          </CRow>
                          <CRow className="mb-3 pt-3 border-top">
                            <CFormLabel className="col-sm-4 text-sm-end fw-semibold">Email restrictions</CFormLabel>
                            <CCol sm={8}>
                              <CFormInput type="text" id="email_restrictions_input" value={couponData.email_restrictions_input} onChange={handleChange} placeholder="No restrictions (comma separated)" />
                            </CCol>
                          </CRow>
                        </CTabPane>

                        {/* USAGE LIMITS TAB */}
                        <CTabPane visible={activeKey === 3}>
                          <CRow className="mb-3">
                            <CFormLabel className="col-sm-4 text-sm-end fw-semibold">Usage limit per coupon</CFormLabel>
                            <CCol sm={8}>
                              <CFormInput type="number" id="usage_limit" value={couponData.usage_limit || ""} onChange={handleChange} placeholder="Unlimited usage" />
                            </CCol>
                          </CRow>
                          <CRow className="mb-3">
                            <CFormLabel className="col-sm-4 text-sm-end fw-semibold">Limit usage to X items</CFormLabel>
                            <CCol sm={8}>
                              <CFormInput type="number" id="limit_usage_to_x_items" value={couponData.limit_usage_to_x_items || ""} onChange={handleChange} placeholder="All qualifying items in cart" />
                            </CCol>
                          </CRow>
                          <CRow className="mb-3">
                            <CFormLabel className="col-sm-4 text-sm-end fw-semibold">Usage limit per user</CFormLabel>
                            <CCol sm={8}>
                              <CFormInput type="number" id="usage_limit_per_user" value={couponData.usage_limit_per_user || ""} onChange={handleChange} placeholder="Unlimited usage" />
                            </CCol>
                          </CRow>
                        </CTabPane>
                      </CTabContent>
                    </div>
                  </div>
                </CCardBody>
              </CCard>

              <div className="text-end">
                <CButton color="secondary" className="me-2" onClick={() => navigate('/coupons/all')}>Cancel</CButton>
                <CButton color="primary" type="submit" disabled={loading} style={{ minWidth: '120px' }}>
                  {loading ? <CSpinner size="sm" /> : (isEditMode ? 'Update Coupon' : 'Publish')}
                </CButton>
              </div>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default AddCoupon
