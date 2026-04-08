import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CForm,
  CFormLabel,
  CFormCheck,
  CButton,
  CListGroup,
  CListGroupItem,
  CCardFooter,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCreditCard, cilCheckCircle } from '@coreui/icons'

const Checkout = () => {
  const [gateways, setGateways] = useState({
    bank: true,
    cod: true
  })
  const [selectedGateway, setSelectedGateway] = useState('cod')
  const [isOrdered, setIsOrdered] = useState(false)

  // Load settings from "Admin Panel" simulation
  useEffect(() => {
    const savedSettings = localStorage.getItem('wc_store_settings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        // Map any legacy settings to our simple view
        setGateways({
          bank: true,
          cod: true
        })
      } catch (e) {}
    }
  }, [])

  const handlePlaceOrder = () => {
    setIsOrdered(true)
  }

  if (isOrdered) {
    return (
      <div className="text-center py-5">
        <CIcon icon={cilCheckCircle} size="3xl" className="text-success mb-3" />
        <h3>Order Placed Successfully!</h3>
        <p className="text-muted">Thank you for your purchase. We are processing your order using <strong>{selectedGateway.toUpperCase()}</strong>.</p>
        <CButton color="primary" onClick={() => setIsOrdered(false)}>Back to Shop</CButton>
      </div>
    )
  }

  return (
    <CRow className="justify-content-center">
      <CCol md={8}>
        <CCard className="shadow-sm border-0 mb-4">
          <CCardHeader className="bg-white py-3 fw-bold fs-5">
            <CIcon icon={cilCreditCard} className="me-2 text-primary" />
            Secure Checkout
          </CCardHeader>
          <CCardBody>
            <h6 className="mb-4 text-secondary">SELECT PAYMENT METHOD</h6>
            <CListGroup flush className="border rounded">
              {gateways.bank && (
                <CListGroupItem
                  className={`p-3 cursor-pointer ${selectedGateway === 'bank' ? 'bg-light' : ''}`}
                  onClick={() => setSelectedGateway('bank')}
                >
                  <CFormCheck
                    type="radio"
                    name="paymentMethod"
                    id="bank"
                    label={
                      <div className="ms-2">
                        <div className="fw-bold">Direct Bank Transfer</div>
                        <div className="small text-muted">Make your payment directly into our bank account.</div>
                      </div>
                    }
                    checked={selectedGateway === 'bank'}
                    onChange={() => setSelectedGateway('bank')}
                  />
                </CListGroupItem>
              )}

              {gateways.cod && (
                <CListGroupItem
                  className={`p-3 cursor-pointer ${selectedGateway === 'cod' ? 'bg-light' : ''}`}
                  onClick={() => setSelectedGateway('cod')}
                >
                  <CFormCheck
                    type="radio"
                    name="paymentMethod"
                    id="cod"
                    label={
                      <div className="ms-2">
                        <div className="fw-bold">Cash on delivery</div>
                        <div className="small text-muted">Pay with cash upon delivery.</div>
                      </div>
                    }
                    checked={selectedGateway === 'cod'}
                    onChange={() => setSelectedGateway('cod')}
                  />
                </CListGroupItem>
              )}
            </CListGroup>

            <div className="mt-4 px-3">
              <CFormCheck id="order-note" label="Add a note to your order" />
            </div>
          </CCardBody>
          <CCardFooter className="bg-white border-0 text-end p-4">
            <CButton
              color="primary"
              size="lg"
              className="px-5 shadow-sm"
              onClick={handlePlaceOrder}
            >
              Place Order
            </CButton>
          </CCardFooter>
        </CCard>
      </CCol>

      <CCol md={4}>
        <CCard className="shadow-sm border-0">
          <CCardBody>
            <h6 className="fw-bold mb-3">Order Summary</h6>
            <div className="d-flex justify-content-between mb-2">
              <span>Subtotal</span>
              <span className="fw-bold">$120.00</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span>Shipping</span>
              <span className="text-success">Free</span>
            </div>
            <hr />
            <div className="d-flex justify-content-between mb-0 fs-5 fw-bold text-primary">
              <span>Total</span>
              <span>$120.00</span>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default Checkout
