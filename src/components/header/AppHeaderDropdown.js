import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CAvatar,
  CBadge,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import {
  cilLockLocked,
  cilSettings,
  cilUser,
  cilAccountLogout,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'

import avatar8 from './../../assets/images/avatars/8.jpg'
import API_CONFIG from 'src/apiConfig'

const AppHeaderDropdown = () => {
  const navigate = useNavigate()
  const user = API_CONFIG.getUser()

  const handleLogout = (e) => {
    e.preventDefault()
    API_CONFIG.logout()
  }

  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle placement="bottom-end" className="py-0 pe-0 d-flex align-items-center" caret={false}>
        <div className="me-2 d-none d-md-block text-end">
          <div className="fw-bold small">{user.displayName || 'Guest'}</div>
          <div className="text-muted small" style={{ fontSize: '10px' }}>Administrator</div>
        </div>
        <CAvatar src={avatar8} size="md" />
      </CDropdownToggle>
      <CDropdownMenu className="pt-0 shadow border-0" placement="bottom-end">
        <CDropdownHeader className="bg-light fw-semibold mb-2 py-2">Account</CDropdownHeader>
        <CDropdownItem
          onClick={() => navigate('/profile')}
          style={{ cursor: 'pointer' }}
        >
          <CIcon icon={cilUser} className="me-2 text-primary" />
          My Profile
        </CDropdownItem>
        <CDropdownItem
          onClick={() => navigate('/account')}
          style={{ cursor: 'pointer' }}
        >
          <CIcon icon={cilSettings} className="me-2 text-info" />
          Settings
        </CDropdownItem>
        <CDropdownDivider />
        <CDropdownItem
          onClick={handleLogout}
          style={{ cursor: 'pointer' }}
          className="text-danger"
        >
          <CIcon icon={cilAccountLogout} className="me-2" />
          Logout
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderDropdown
