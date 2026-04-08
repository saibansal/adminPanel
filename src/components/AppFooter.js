import React from 'react'
import { CFooter } from '@coreui/react'

const AppFooter = () => {
  return (
    <CFooter className="px-4">
      <div>&copy; 2026 &nbsp;
        <a href="#" target="_blank" rel="noopener noreferrer">
          Vismaad Inc
        </a>
        {/* <span className="ms-1">.</span> */}
      </div>
      <div className="ms-auto">
        <span className="me-1">Powered by</span>
        <a href="#" target="_blank" rel="noopener noreferrer">
          Vismaad Inc
        </a>
      </div>
    </CFooter>
  )
}

export default React.memo(AppFooter)
