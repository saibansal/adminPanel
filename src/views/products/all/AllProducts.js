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
  CButton,
  CSpinner,
  CAlert,
  CBadge,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react'
import { useNavigate } from 'react-router-dom'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash, cilExternalLink, cilCode } from '@coreui/icons'
import API_CONFIG from 'src/apiConfig'

const AllProducts = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [visible, setVisible] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [processingId, setProcessingId] = useState(null)
  const [statusModal, setStatusModal] = useState({ visible: false, title: '', message: '', color: 'primary' })
  const [deleteConfirm, setDeleteConfirm] = useState({ visible: false, id: null })
  const navigate = useNavigate()

  const showStatus = (title, message, color = 'primary') => {
    setStatusModal({ visible: true, title, message, color })
  }

  useEffect(() => {
    fetchAllProducts()
  }, [])

  const fetchAllProducts = async () => {
    setLoading(true)
    setError(null)
    const { BASE_URL } = API_CONFIG
    let allProducts = []
    let page = 1
    let totalPages = 1

    try {
      // Loop to fetch all pages if there are more than 100 products
      do {
        const response = await fetch(`${BASE_URL}wc/v3/products?per_page=100&page=${page}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': API_CONFIG.getJWTHeader(),
          },
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || `Failed to fetch products (Page ${page})`)
        }

        const data = await response.json()
        allProducts = [...allProducts, ...data]
        
        // Get total pages from headers
        totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '1')
        page++
      } while (page <= totalPages)

      console.log('Fetched Total Products:', allProducts.length, allProducts)
      setProducts(allProducts)
    } catch (err) {
      console.error('Error fetching products:', err)
      setError(err.message || 'Could not connect to WordPress. Please check your API settings.')
      // Fallback
      setProducts([
        {
          id: 1,
          name: 'Sample Product 1 (Demo)',
          sku: 'DEMO001',
          stock_status: 'instock',
          price: '20.00',
          categories: [{ name: 'Electronics' }],
          attributes: [{ name: 'Color', options: ['Red', 'Blue'] }],
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const renderAttributes = (attributes) => {
    if (!attributes || attributes.length === 0) return <small className="text-muted">No options</small>
    return attributes.map((attr, idx) => (
      <div key={idx} className="small">
        <strong className="text-dark">{attr.name}:</strong> {attr.options.join(', ')}
      </div>
    ))
  }

  const showRawData = (product) => {
    setSelectedProduct(product)
    setVisible(true)
  }

  const handleDeleteProduct = (id) => {
    setDeleteConfirm({ visible: true, id })
  }

  const confirmDeleteProduct = async () => {
    const id = deleteConfirm.id
    setDeleteConfirm({ visible: false, id: null })
    setProcessingId(id)
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}wc/v3/products/${id}?force=true`, {
        method: 'DELETE',
        headers: {
          'Authorization': API_CONFIG.getJWTHeader(),
        },
      })

      if (response.ok) {
        setProducts(products.filter((p) => p.id !== id))
        showStatus('Success', 'Product deleted successfully.', 'success')
      } else {
        const errorData = await response.json()
        showStatus('Delete Failed', errorData.message || 'Failed to delete product', 'danger')
      }
    } catch (err) {
      showStatus('Error', err.message || 'Network error.', 'danger')
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4 shadow-sm border-0">
          <CCardHeader className="bg-white border-bottom d-flex justify-content-between align-items-center py-3">
            <h5 className="mb-0">
              <strong>All Products</strong>
              <small className="ms-2 text-muted fw-normal">({products.length} items total)</small>
            </h5>
            <CButton color="outline-primary" size="sm" onClick={fetchAllProducts} disabled={loading}>
              {loading ? <CSpinner size="sm" className="me-1" /> : 'Refresh All'}
            </CButton>
          </CCardHeader>
          <CCardBody>
            {error && <CAlert color="danger">{error}</CAlert>}

            {loading && products.length === 0 ? (
              <div className="text-center p-5">
                <CSpinner color="primary" />
                <p className="mt-2 text-muted">Fetching all products from WooCommerce...</p>
                <small className="text-muted">This may take a moment depending on your catalog size.</small>
              </div>
            ) : (
              <CTable align="middle" className="mb-0 border rounded" hover responsive>
                <CTableHead className="bg-light">
                  <CTableRow>
                    <CTableHeaderCell>Image</CTableHeaderCell>
                    <CTableHeaderCell>Product Name</CTableHeaderCell>
                    <CTableHeaderCell>SKU</CTableHeaderCell>
                    <CTableHeaderCell>Status</CTableHeaderCell>
                    <CTableHeaderCell>Price</CTableHeaderCell>
                    <CTableHeaderCell>Options / Attributes</CTableHeaderCell>
                    <CTableHeaderCell>Categories</CTableHeaderCell>
                    <CTableHeaderCell className="text-center">Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {products.map((item) => (
                    <CTableRow key={item.id}>
                      <CTableDataCell>
                        {item.images && item.images[0] ? (
                          <img
                            src={item.images[0].src}
                            alt={item.name}
                            style={{ width: '45px', height: '45px', objectFit: 'cover' }}
                            className="rounded border"
                          />
                        ) : (
                          <div
                            className="bg-light rounded d-flex align-items-center justify-content-center border"
                            style={{ width: '45px', height: '45px' }}
                          >
                            <CIcon icon={cilExternalLink} className="text-muted opacity-50" />
                          </div>
                        )}
                      </CTableDataCell>
                      <CTableDataCell style={{ minWidth: '200px' }}>
                        <div className="fw-bold text-primary">{item.name}</div>
                        <div className="small text-muted d-flex align-items-center">
                          ID: {item.id} 
                          <CButton 
                            variant="ghost" 
                            color="dark" 
                            size="sm" 
                            className="ms-1 p-0 px-1 py-0 height-auto" 
                            title="View All Data"
                            onClick={() => showRawData(item)}
                          >
                            <CIcon icon={cilCode} size="sm" />
                          </CButton>
                        </div>
                      </CTableDataCell>
                      <CTableDataCell>
                        <code>{item.sku || 'N/A'}</code>
                      </CTableDataCell>
                      <CTableDataCell>
                        <CBadge
                          color={item.stock_status === 'instock' ? 'success' : 'danger'}
                          shape="pill"
                        >
                          {item.stock_status === 'instock' ? 'In Stock' : 'Out of Stock'}
                        </CBadge>
                        {item.manage_stock && (
                          <div className="small text-muted mt-1">Qty: {item.stock_quantity || 0}</div>
                        )}
                      </CTableDataCell>
                      <CTableDataCell>
                        <div className="fw-bold text-dark">${item.price || '0.00'}</div>
                        {item.regular_price && item.regular_price !== item.price && (
                          <div className="small text-decoration-line-through text-muted">
                            ${item.regular_price}
                          </div>
                        )}
                      </CTableDataCell>
                      <CTableDataCell>{renderAttributes(item.attributes)}</CTableDataCell>
                      <CTableDataCell>
                        {item.categories &&
                          item.categories.map((cat, idx) => (
                            <CBadge key={idx} color="secondary" className="me-1 mb-1" variant="outline">
                              {cat.name}
                            </CBadge>
                          ))}
                      </CTableDataCell>
                      <CTableDataCell className="text-center">
                        <div className="d-flex justify-content-center">
                          <CButton 
                            color="info" 
                            size="sm" 
                            className="me-2 text-white shadow-sm" 
                            title="Edit"
                            onClick={() => navigate(`/products/edit/${item.id}`)}
                          >
                            <CIcon icon={cilPencil} />
                          </CButton>
                          <CButton 
                            color="danger" 
                            size="sm" 
                            className="text-white shadow-sm" 
                            title="Delete"
                            disabled={processingId === item.id}
                            onClick={() => handleDeleteProduct(item.id)}
                          >
                             {processingId === item.id ? <CSpinner size="sm" /> : <CIcon icon={cilTrash} />}
                          </CButton>
                        </div>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            )}

            {!loading && products.length === 0 && !error && (
              <div className="text-center p-5 text-muted">
                No products found in your WooCommerce store.
              </div>
            )}
          </CCardBody>
        </CCard>
      </CCol>

      {/* Raw Data Modal */}
      <CModal visible={visible} onClose={() => setVisible(false)} size="lg" scrollable>
        <CModalHeader>
          <CModalTitle>All Product Data: {selectedProduct?.name}</CModalTitle>
        </CModalHeader>
        <CModalBody className="bg-dark text-light">
          <pre className="m-0" style={{ fontSize: '11px' }}>
            {JSON.stringify(selectedProduct, null, 2)}
          </pre>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisible(false)}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>
      {/* Status Modal */}
      <CModal visible={statusModal.visible} onClose={() => setStatusModal({ ...statusModal, visible: false })}>
        <CModalHeader>
          <CModalTitle className={`text-${statusModal.color}`}>{statusModal.title}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {statusModal.message}
        </CModalBody>
        <CModalFooter>
          <CButton color={statusModal.color} onClick={() => setStatusModal({ ...statusModal, visible: false })}>
            Understand
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Delete Confirmation Modal */}
      <CModal visible={deleteConfirm.visible} onClose={() => setDeleteConfirm({ visible: false, id: null })}>
        <CModalHeader>
          <CModalTitle className="text-danger">Delete Product</CModalTitle>
        </CModalHeader>
        <CModalBody>
          Are you sure you want to permanently delete this product from WooCommerce? This action cannot be undone.
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setDeleteConfirm({ visible: false, id: null })}>
            Cancel
          </CButton>
          <CButton color="danger" className="text-white" onClick={confirmDeleteProduct}>
            Delete Permanently
          </CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  )
}

export default AllProducts
