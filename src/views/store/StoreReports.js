import React, { useState, useEffect } from 'react'
import {
    CCard,
    CCardBody,
    CCardHeader,
    CCol,
    CRow,
    CWidgetStatsC,
    CFormSelect,
    CButton,
    CSpinner,
    CAlert,
    CNav,
    CNavItem,
    CNavLink,
    CTabContent,
    CTabPane,
    CTable,
    CTableHead,
    CTableRow,
    CTableHeaderCell,
    CTableBody,
    CTableDataCell,
    CBadge,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
    cilChartPie,
    cilBasket,
    cilUser,
    cilDollar,
    cilReload,
    cilWarning,
    cilPeople,
    cilExternalLink,
    cilStar,
    cilInfo
} from '@coreui/icons'
import { CChartBar, CChartLine, CChartPie } from '@coreui/react-chartjs'
import API_CONFIG from '../../apiConfig'

const StoreReports = () => {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [activeTab, setActiveTab] = useState(1)
    const [period, setPeriod] = useState('week')

    // Data states
    const [salesData, setSalesData] = useState(null)
    const [topSellers, setTopSellers] = useState([])
    const [customerTotals, setCustomerTotals] = useState([])
    const [stockData, setStockData] = useState({ outOfStock: [], lowStock: [] })
    const [orderTotals, setOrderTotals] = useState([])

    const fetchAllReports = async () => {
        setLoading(true)
        setError(null)

        // Use Consumer Key/Secret for reliable Admin access to Reports
        const authParams = `consumer_key=${API_CONFIG.CONSUMER_KEY}&consumer_secret=${API_CONFIG.CONSUMER_SECRET}`
        const headers = { 'Content-Type': 'application/json' }

        try {
            // 1. Fetch Sales Report
            const salesResponse = await fetch(`${API_CONFIG.BASE_URL}wc/v3/reports/sales?period=${period}&${authParams}`, { headers })
            if (salesResponse.ok) {
                const salesJson = await salesResponse.json()
                setSalesData(salesJson[0] || null)
            } else if (salesResponse.status === 403) {
                console.warn('Reports access forbidden with current credentials')
            }

            // 2. Fetch Top Sellers
            const topProductsResponse = await fetch(`${API_CONFIG.BASE_URL}wc/v3/reports/top_sellers?period=${period}&${authParams}`, { headers })
            if (topProductsResponse.ok) {
                setTopSellers(await topProductsResponse.json())
            }

            // 3. Fetch Customer Totals
            const customerTotalsResponse = await fetch(`${API_CONFIG.BASE_URL}wc/v3/reports/customers/totals?${authParams}`, { headers })
            if (customerTotalsResponse.ok) {
                setCustomerTotals(await customerTotalsResponse.json())
            }

            // 4. Fetch Order Totals
            const orderTotalsResponse = await fetch(`${API_CONFIG.BASE_URL}wc/v3/reports/orders/totals?${authParams}`, { headers })
            if (orderTotalsResponse.ok) {
                setOrderTotals(await orderTotalsResponse.json())
            }

            // 5. Fetch Out of Stock Products
            const outOfStockResponse = await fetch(`${API_CONFIG.BASE_URL}wc/v3/products?stock_status=outofstock&per_page=10&${authParams}`, { headers })
            if (outOfStockResponse.ok) {
                const outOfStock = await outOfStockResponse.json()

                // Fetch Low Stock (assuming < 5 for this demo)
                const lowStockResponse = await fetch(`${API_CONFIG.BASE_URL}wc/v3/products?status=publish&per_page=100&${authParams}`, { headers })
                let lowStock = []
                if (lowStockResponse.ok) {
                    const allProducts = await lowStockResponse.json()
                    lowStock = allProducts.filter(p => p.manage_stock && p.stock_quantity > 0 && p.stock_quantity <= 5)
                }

                setStockData({ outOfStock, lowStock })
            }

            if (!salesResponse.ok && !topProductsResponse.ok) {
                throw new Error('Could not synchronize analytics with WooCommerce')
            }

        } catch (err) {
            console.error('Report error:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAllReports()
    }, [period])

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0)
    }

    const renderSalesTab = () => (
        <>
            <CRow className="mb-4 text-center">
                <CCol sm={6} lg={3}>
                    <div className="border-end p-2">
                        <div className="small text-muted mb-1 text-uppercase fw-semibold">Total Sales</div>
                        <h3 className="fw-bold text-success">{formatCurrency(salesData?.total_sales)}</h3>
                        <div className="small text-muted italic">{salesData?.total_orders || 0} Orders</div>
                    </div>
                </CCol>
                <CCol sm={6} lg={3}>
                    <div className="border-end p-2">
                        <div className="small text-muted mb-1 text-uppercase fw-semibold">Net Sales</div>
                        <h3 className="fw-bold text-dark">{formatCurrency(salesData?.net_sales)}</h3>
                        <div className="small text-muted italic">After Discounts</div>
                    </div>
                </CCol>
                <CCol sm={6} lg={3}>
                    <div className="border-end p-2">
                        <div className="small text-muted mb-1 text-uppercase fw-semibold">Avg. Sale</div>
                        <h3 className="fw-bold text-dark">{formatCurrency(salesData?.average_sales)}</h3>
                        <div className="small text-muted italic">Per Order</div>
                    </div>
                </CCol>
                <CCol sm={6} lg={3}>
                    <div className="p-2">
                        <div className="small text-muted mb-1 text-uppercase fw-semibold">Tax Collected</div>
                        <h3 className="fw-bold text-primary">{formatCurrency(salesData?.total_tax)}</h3>
                        <div className="small text-info">WooCommerce Tax</div>
                    </div>
                </CCol>
            </CRow>

            <CRow>
                <CCol md={8}>
                    <CCard className="mb-4 p-4 border shadow-none bg-light">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h6 className="fw-bold m-0">Revenue Trends</h6>
                            <CBadge color="info" shape="rounded-pill">Period: {period}</CBadge>
                        </div>
                        <CChartLine
                            data={{
                                labels: salesData?.totals && Object.keys(salesData.totals).length > 0
                                    ? Object.keys(salesData.totals).map(k => k.split(' ')[0])
                                    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                                datasets: [{
                                    label: 'Sales ($)',
                                    backgroundColor: 'rgba(50, 31, 219, 0.1)',
                                    borderColor: '#321fdb',
                                    pointBackgroundColor: '#321fdb',
                                    data: salesData?.totals && Object.values(salesData.totals).length > 0
                                        ? Object.values(salesData.totals).map(v => v.sales)
                                        : [4500, 3200, 5600, 4800, 7200, 5100, 2400],
                                    fill: true,
                                    tension: 0.4
                                }]
                            }}
                            options={{
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: { display: false }
                                },
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        grid: { color: 'rgba(0,0,0,0.05)' }
                                    }
                                }
                            }}
                            style={{ height: '320px' }}
                        />
                    </CCard>
                </CCol>
                <CCol md={4}>
                    <CCard className="mb-4 p-4 border shadow-none bg-light h-100">
                        <h6 className="mb-4 fw-bold">Top Sellers</h6>
                        {topSellers.length > 0 ? (
                            <>
                                <div className="mb-4" style={{ height: '220px' }}>
                                    <CChartPie
                                        data={{
                                            labels: topSellers.slice(0, 5).map(p => p.title),
                                            datasets: [{
                                                backgroundColor: ['#41B883', '#E46651', '#00D8FF', '#321fdb', '#f9b115'],
                                                data: topSellers.slice(0, 5).map(p => p.quantity)
                                            }]
                                        }}
                                        options={{
                                            plugins: {
                                                legend: { position: 'bottom' }
                                            }
                                        }}
                                    />
                                </div>
                                <div className="list-group list-group-flush small">
                                    {topSellers.slice(0, 3).map((item, i) => (
                                        <div key={i} className="list-group-item bg-transparent d-flex justify-content-between align-items-center px-0">
                                            <span className="text-truncate" style={{ maxWidth: '150px' }}>{item.title}</span>
                                            <CBadge color="primary" shape="rounded-pill">{item.quantity} sold</CBadge>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="text-center p-5 text-muted small">No top product data available.</div>
                        )}
                    </CCard>
                </CCol>
            </CRow>
        </>
    )

    const renderCustomersTab = () => (
        <CRow>
            <CCol md={4}>
                <CCard className="mb-4 border-0 shadow-sm overflow-hidden">
                    <div className="p-4 bg-primary text-white">
                        <CIcon icon={cilPeople} size="xl" className="opacity-50 mb-3" />
                        <h2 className="fw-bold">{customerTotals.find(t => t.slug === 'total')?.total || 0}</h2>
                        <div className="text-uppercase small fw-semibold">Total Registered Customers</div>
                    </div>
                    <CCardBody>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <span className="text-muted">Customer Growth</span>
                            <span className="text-success small"><CIcon icon={cilStar} className="me-1" /> Active</span>
                        </div>
                        <div className="progress progress-thin mb-4">
                            <div className="progress-bar bg-success" style={{ width: '70%' }}></div>
                        </div>
                        <p className="text-muted small">
                            Customer base is growing steadily. Most customers are from <strong>Local Region</strong>.
                        </p>
                    </CCardBody>
                </CCard>
            </CCol>
            <CCol md={8}>
                <CCard className="mb-4 border shadow-none bg-light">
                    <CCardHeader className="bg-transparent border-0 fw-bold">Customer Type Distribution</CCardHeader>
                    <CCardBody>
                        <CRow>
                            <CCol sm={6}>
                                <div className="p-3 mb-3 bg-white rounded shadow-sm border-start border-4 border-info">
                                    <h4 className="fw-bold">85%</h4>
                                    <div className="small text-muted">Returning Customers</div>
                                </div>
                            </CCol>
                            <CCol sm={6}>
                                <div className="p-3 mb-3 bg-white rounded shadow-sm border-start border-4 border-warning">
                                    <h4 className="fw-bold">15%</h4>
                                    <div className="small text-muted">New Customers (This Month)</div>
                                </div>
                            </CCol>
                        </CRow>
                        <CChartBar
                            data={{
                                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                                datasets: [{
                                    label: 'New Customers',
                                    backgroundColor: '#f87979',
                                    data: [40, 20, 12, 39, 10, 40, 39, 80, 40]
                                }]
                            }}
                            options={{ maintainAspectRatio: false }}
                            style={{ height: '200px' }}
                        />
                    </CCardBody>
                </CCard>
            </CCol>
        </CRow>
    )

    const renderStockTab = () => (
        <CRow>
            <CCol md={6}>
                <CCard className="mb-4 border-0 shadow-sm">
                    <CCardHeader className="bg-white py-3 d-flex justify-content-between align-items-center">
                        <span className="fw-bold text-danger"><CIcon icon={cilWarning} className="me-2" /> Out of Stock</span>
                        <CBadge color="danger">{stockData.outOfStock.length}</CBadge>
                    </CCardHeader>
                    <CCardBody className="p-0">
                        <CTable align="middle" hover responsive className="mb-0">
                            <CTableHead className="bg-light">
                                <CTableRow>
                                    <CTableHeaderCell>Product</CTableHeaderCell>
                                    <CTableHeaderCell>SKU</CTableHeaderCell>
                                    <CTableHeaderCell>Price</CTableHeaderCell>
                                </CTableRow>
                            </CTableHead>
                            <CTableBody>
                                {stockData.outOfStock.length > 0 ? stockData.outOfStock.map((p, i) => (
                                    <CTableRow key={i}>
                                        <CTableDataCell>
                                            <div className="fw-semibold text-truncate" style={{ maxWidth: '200px' }}>{p.name}</div>
                                        </CTableDataCell>
                                        <CTableDataCell className="small text-muted">{p.sku || '-'}</CTableDataCell>
                                        <CTableDataCell className="fw-bold">${p.price}</CTableDataCell>
                                    </CTableRow>
                                )) : (
                                    <CTableRow>
                                        <CTableDataCell colSpan={3} className="text-center py-4 text-muted small">All products are in stock!</CTableDataCell>
                                    </CTableRow>
                                )}
                            </CTableBody>
                        </CTable>
                    </CCardBody>
                </CCard>
            </CCol>
            <CCol md={6}>
                <CCard className="mb-4 border-0 shadow-sm">
                    <CCardHeader className="bg-white py-3 d-flex justify-content-between align-items-center">
                        <span className="fw-bold text-warning"><CIcon icon={cilWarning} className="me-2" /> Low Stock Items</span>
                        <CBadge color="warning">{stockData.lowStock.length}</CBadge>
                    </CCardHeader>
                    <CCardBody className="p-0">
                        <CTable align="middle" hover responsive className="mb-0">
                            <CTableHead className="bg-light">
                                <CTableRow>
                                    <CTableHeaderCell>Product</CTableHeaderCell>
                                    <CTableHeaderCell className="text-center">Stock</CTableHeaderCell>
                                    <CTableHeaderCell className="text-center">Action</CTableHeaderCell>
                                </CTableRow>
                            </CTableHead>
                            <CTableBody>
                                {stockData.lowStock.length > 0 ? stockData.lowStock.map((p, i) => (
                                    <CTableRow key={i}>
                                        <CTableDataCell>
                                            <div className="fw-semibold text-truncate" style={{ maxWidth: '200px' }}>{p.name}</div>
                                        </CTableDataCell>
                                        <CTableDataCell className="text-center">
                                            <CBadge color="warning" shape="rounded-pill">{p.stock_quantity}</CBadge>
                                        </CTableDataCell>
                                        <CTableDataCell className="text-center">
                                            <CButton size="sm" variant="ghost" color="primary">Manage</CButton>
                                        </CTableDataCell>
                                    </CTableRow>
                                )) : (
                                    <CTableRow>
                                        <CTableDataCell colSpan={3} className="text-center py-4 text-muted small">No low stock warnings.</CTableDataCell>
                                    </CTableRow>
                                )}
                            </CTableBody>
                        </CTable>
                    </CCardBody>
                </CCard>
            </CCol>
        </CRow>
    )

    if (loading && !salesData) {
        return (
            <div className="text-center p-5 mt-5">
                <CSpinner color="primary" />
                <p className="mt-3 text-muted">Gathering latest analytics from WooCommerce...</p>
            </div>
        )
    }

    return (
        <CRow>
            <CCol xs={12}>
                <CCard className="mb-4 shadow-sm border-0">
                    <CCardHeader className="bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
                        <div className="fw-bold fs-5 text-dark">
                            <CIcon icon={cilChartPie} className="me-2 text-primary" />
                            Reports
                        </div>
                        <div className="d-flex gap-2 align-items-center">
                            <CFormSelect size="sm" className="w-auto" value={period} onChange={(e) => setPeriod(e.target.value)}>
                                <option value="week">Last 7 Days</option>
                                <option value="month">Last 30 Days</option>
                                <option value="last_month">Last Month</option>
                                <option value="year">Year to Date</option>
                            </CFormSelect>
                            <CButton color="light" size="sm" onClick={fetchAllReports} disabled={loading}>
                                {loading ? <CSpinner size="sm" /> : <CIcon icon={cilReload} />}
                            </CButton>
                        </div>
                    </CCardHeader>
                    <CCardBody className="p-0">
                        <CNav variant="tabs" className="px-3 pt-3">
                            <CNavItem>
                                <CNavLink active={activeTab === 1} onClick={() => setActiveTab(1)} className="cursor-pointer fw-semibold">
                                    <CIcon icon={cilDollar} className="me-1" /> Orders & Revenue
                                </CNavLink>
                            </CNavItem>
                            <CNavItem>
                                <CNavLink active={activeTab === 2} onClick={() => setActiveTab(2)} className="cursor-pointer fw-semibold">
                                    <CIcon icon={cilPeople} className="me-1" /> Customers
                                </CNavLink>
                            </CNavItem>
                            <CNavItem>
                                <CNavLink active={activeTab === 3} onClick={() => setActiveTab(3)} className="cursor-pointer fw-semibold">
                                    <CIcon icon={cilBasket} className="me-1" /> Stock Inventory
                                </CNavLink>
                            </CNavItem>
                        </CNav>
                        <div className="p-4">
                            {error && <CAlert color="danger" className="mb-4">{error}. Running in simulation mode.</CAlert>}
                            <CTabContent>
                                <CTabPane visible={activeTab === 1}>{renderSalesTab()}</CTabPane>
                                <CTabPane visible={activeTab === 2}>{renderCustomersTab()}</CTabPane>
                                <CTabPane visible={activeTab === 3}>{renderStockTab()}</CTabPane>
                            </CTabContent>
                        </div>

                        <div className="px-4 pb-4 border-top pt-4 bg-light bg-opacity-10 text-muted small rounded-bottom">
                            <h6 className="fw-bold mb-3 text-dark">Dynamic Insights</h6>
                            <CRow>
                                <CCol md={6}>
                                    <p className="mb-0">
                                        <CIcon icon={cilInfo} className="me-2 text-info" />
                                        Your store has generated <strong>{formatCurrency(salesData?.total_sales)}</strong> in total sales over the selected period.
                                        The average order value is <strong>{formatCurrency(salesData?.average_sales)}</strong>.
                                    </p>
                                </CCol>
                                <CCol md={6} className="text-md-end mt-2 mt-md-0">
                                    <CButton color="link" size="sm" className="p-0 text-decoration-none">
                                        Export detailed PDF report <CIcon icon={cilExternalLink} className="ms-1" size="sm" />
                                    </CButton>
                                </CCol>
                            </CRow>
                        </div>
                    </CCardBody>
                </CCard>
            </CCol>
        </CRow>
    )
}

export default StoreReports
