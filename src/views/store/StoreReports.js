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
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilChartPie, cilBasket, cilUser, cilDollar, cilReload } from '@coreui/icons'
import { CChartBar, CChartLine, CChartPie } from '@coreui/react-chartjs'
import API_CONFIG from '../../apiConfig'

const StoreReports = () => {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [reportData, setReportData] = useState(null)
    const [topSellers, setTopSellers] = useState([])
    const [period, setPeriod] = useState('week')

    const fetchReports = async () => {
        setLoading(true)
        setError(null)
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': API_CONFIG.getJWTHeader()
        }

        try {
            // Fetch Sales Report (Revenue stats)
            const salesResponse = await fetch(`${API_CONFIG.BASE_URL}wc/v3/reports/sales?period=${period}`, { headers })
            if (!salesResponse.ok) {
                const errData = await salesResponse.json()
                throw new Error(errData.message || 'Failed to fetch sales reports')
            }
            const salesJson = await salesResponse.json()

            // For top products
            const topProductsResponse = await fetch(`${API_CONFIG.BASE_URL}wc/v3/reports/top_sellers?period=${period}`, { headers })
            if (topProductsResponse.ok) {
                setTopSellers(await topProductsResponse.json())
            }

            setReportData(salesJson[0] || null)
        } catch (err) {
            console.error('Report error:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchReports()
    }, [period])

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0)
    }

    if (loading && !reportData) {
        return (
            <div className="text-center p-5 mt-5">
                <CSpinner color="primary" />
                <p className="mt-3 text-muted">Synchronizing with WooCommerce Analytics...</p>
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
                            WooCommerce Analytics: Revenue
                        </div>
                        <div className="d-flex gap-2 align-items-center">
                            <CFormSelect size="sm" className="w-auto" value={period} onChange={(e) => setPeriod(e.target.value)}>
                                <option value="week">Last 7 Days (Week)</option>
                                <option value="month">Last 30 Days (Month)</option>
                                <option value="last_month">Last Month</option>
                                <option value="year">Year to Date (Year)</option>
                            </CFormSelect>
                            <CButton color="light" size="sm" onClick={fetchReports} disabled={loading}>
                                {loading ? <CSpinner size="sm" /> : <CIcon icon={cilReload} />}
                            </CButton>
                        </div>
                    </CCardHeader>
                    <CCardBody className="p-4">
                        {error && <CAlert color="danger">{error}. Showing cached or sample data.</CAlert>}
                        <CRow className="mb-4 text-center">
                            <CCol sm={6} lg={3}>
                                <div className="border-end p-2">
                                    <div className="small text-muted mb-1">TOTAL SALES (NET)</div>
                                    <h3 className="fw-bold text-success">{formatCurrency(reportData?.total_sales)}</h3>
                                    <div className="small text-muted italic">{reportData?.total_orders || 0} Orders</div>
                                </div>
                            </CCol>
                            <CCol sm={6} lg={3}>
                                <div className="border-end p-2">
                                    <div className="small text-muted mb-1">AVERAGE ORDER VALUE</div>
                                    <h3 className="fw-bold text-dark">{formatCurrency(reportData?.average_sales)}</h3>
                                    <div className="small text-muted italic">Per Customer</div>
                                </div>
                            </CCol>
                            <CCol sm={6} lg={3}>
                                <div className="border-end p-2">
                                    <div className="small text-muted mb-1">TAX COLLECTED</div>
                                    <h3 className="fw-bold text-dark">{formatCurrency(reportData?.total_tax)}</h3>
                                    <div className="small text-muted italic">WooCommerce Tax</div>
                                </div>
                            </CCol>
                            <CCol sm={6} lg={3}>
                                <div className="p-2">
                                    <div className="small text-muted mb-1">SHIPPING REVENUE</div>
                                    <h3 className="fw-bold text-primary">{formatCurrency(reportData?.total_shipping)}</h3>
                                    <div className="small text-info">Deliveries</div>
                                </div>
                            </CCol>
                        </CRow>

                        <CRow>
                            <CCol md={8}>
                                <CCard className="mb-4 p-4 border shadow-none bg-light">
                                    <h6 className="mb-4 fw-bold">Recent Store Sales Growth</h6>
                                    <CChartLine
                                        data={{
                                            labels: reportData?.totals && Object.keys(reportData.totals).length > 0
                                                ? Object.keys(reportData.totals).map(k => k.split(' ')[0])
                                                : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                                            datasets: [{
                                                label: 'Sales Amount ($)',
                                                backgroundColor: 'rgba(50, 31, 219, 0.1)',
                                                borderColor: '#321fdb',
                                                pointBackgroundColor: '#321fdb',
                                                data: reportData?.totals && Object.values(reportData.totals).length > 0
                                                    ? Object.values(reportData.totals).map(v => v.sales)
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
                                                    beginAtZero: true
                                                }
                                            }
                                        }}
                                        style={{ height: '300px' }}
                                    />
                                </CCard>
                            </CCol>
                            <CCol md={4}>
                                <CCard className="mb-4 p-4 border shadow-none bg-light h-100">
                                    <h6 className="mb-4 fw-bold">Top Performing Products</h6>
                                    {topSellers.length > 0 ? (
                                        <CChartPie
                                            data={{
                                                labels: topSellers.map(p => p.title),
                                                datasets: [{
                                                    backgroundColor: ['#41B883', '#E46651', '#00D8FF', '#321fdb', '#f9b115'],
                                                    data: topSellers.map(p => p.quantity)
                                                }]
                                            }}
                                            options={{
                                                plugins: {
                                                    legend: { position: 'bottom' }
                                                }
                                            }}
                                        />
                                    ) : (
                                        <div className="text-center p-5 text-muted small">No sales data recorded for top products yet.</div>
                                    )}
                                </CCard>
                            </CCol>
                        </CRow>

                        <div className="mt-4 border-top pt-4">
                            <h6 className="fw-bold mb-3">Live Insights</h6>
                            <p className="text-muted small">
                                Based on the selected period (<strong>{period.replace('_', ' ')}</strong>), your store has recorded
                                <strong> {reportData?.total_orders || 0}</strong> orders with a total discount of
                                <strong> {formatCurrency(reportData?.total_discount)}</strong>.
                                {topSellers.length > 0 && ` Your current top mover is ${topSellers[0].title}.`}
                            </p>
                        </div>
                    </CCardBody>
                </CCard>
            </CCol>
        </CRow>
    )
}

export default StoreReports
