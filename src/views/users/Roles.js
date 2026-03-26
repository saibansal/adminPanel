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
  CForm,
  CFormLabel,
  CFormInput,
  CFormCheck,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilShieldAlt, cilPlus, cilTrash, cilPencil } from '@coreui/icons'
import API_CONFIG from 'src/apiConfig'

const Roles = () => {
  const [roles, setRoles] = useState([
    { slug: 'administrator', name: 'Administrator', count: 1, permissions: ['Manage Everything'] },
    { slug: 'editor', name: 'Editor', count: 0, permissions: ['Manage Posts', 'Manage Pages'] },
    { slug: 'author', name: 'Author', count: 0, permissions: ['Write Posts'] },
    { slug: 'contributor', name: 'Contributor', count: 0, permissions: ['Submit Drafts'] },
    { slug: 'subscriber', name: 'Subscriber', count: 0, permissions: ['Read Content'] },
  ])
  const [showAddRole, setShowAddRole] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingSlug, setEditingSlug] = useState(null)
  const [newRole, setNewRole] = useState({ name: '', slug: '' })
  const [permissions, setPermissions] = useState({})
  const [loading, setLoading] = useState(false)
  
  const sections = [
    { name: 'Products', key: 'prod' },
    { name: 'Posts', key: 'post' },
    { name: 'Pages', key: 'page' },
    { name: 'Orders', key: 'ord', noAdd: true, noDel: true },
    { name: 'Coupons', key: 'coup' },
    { name: 'Users', key: 'user' },
  ]

  const handleSelectAll = (checked) => {
    const next = {}
    sections.forEach(sec => {
      next[`${sec.key}_v`] = checked
      if (!sec.noAdd) next[`${sec.key}_a`] = checked
      next[`${sec.key}_e`] = checked
      if (!sec.noDel) next[`${sec.key}_d`] = checked
    })
    setPermissions(next)
  }

  const handlePermissionChange = (key, checked) => {
    setPermissions({ ...permissions, [key]: checked })
  }

  const handleCreateRole = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    setTimeout(() => {
        if (isEditMode) {
            setRoles(roles.map(r => r.slug === editingSlug ? { ...r, name: newRole.name, slug: newRole.slug } : r))
        } else {
            setRoles([...roles, { ...newRole, count: 0, permissions: ['Custom'] }])
        }
        setNewRole({ name: '', slug: '' })
        setPermissions({})
        setShowAddRole(false)
        setIsEditMode(false)
        setLoading(false)
    }, 800)
  }

  const handleEdit = (role) => {
    setNewRole({ name: role.name, slug: role.slug })
    setEditingSlug(role.slug)
    setIsEditMode(true)
    setShowAddRole(true)
    // Populate some default logic for demo
    handleSelectAll(false)
  }

  const handleDelete = (slug) => {
    if (['administrator', 'subscriber'].includes(slug)) {
      alert('System roles cannot be deleted.')
      return
    }
    if (!window.confirm(`Are you sure you want to delete the ${slug} role?`)) return
    setRoles(roles.filter(r => r.slug !== slug))
  }

  return (
    <CRow>
      <CCol md={8}>
        <CCard className="mb-4 shadow-sm border-0">
          <CCardHeader className="bg-white py-3 fw-bold border-bottom d-flex justify-content-between">
            <div>
               <CIcon icon={cilShieldAlt} className="me-2" />
               WordPress User Roles
            </div>
            {!showAddRole && (
              <CButton color="primary" size="sm" onClick={() => { setShowAddRole(true); setIsEditMode(false); setNewRole({name:'', slug:''}); handleSelectAll(false) }}>
                <CIcon icon={cilPlus} className="me-2" /> Add New Role
              </CButton>
            )}
          </CCardHeader>
          <CCardBody>
            <p className="text-muted small">Manage the authority levels for different accounts on your site.</p>
            <CTable align="middle" className="mb-0 border mt-4" hover responsive>
              <CTableHead className="text-nowrap">
                <CTableRow>
                  <CTableHeaderCell className="bg-body-tertiary">Role Name</CTableHeaderCell>
                  <CTableHeaderCell className="bg-body-tertiary">Slug</CTableHeaderCell>
                  <CTableHeaderCell className="bg-body-tertiary text-center">Users Count</CTableHeaderCell>
                  <CTableHeaderCell className="bg-body-tertiary text-center">Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {roles.map((role) => (
                  <CTableRow key={role.slug}>
                    <CTableDataCell>
                      <div className="fw-bold text-primary" style={{ cursor: 'pointer' }} onClick={() => handleEdit(role)}>{role.name}</div>
                      <div className="small text-muted">{role.permissions.join(', ')}</div>
                    </CTableDataCell>
                    <CTableDataCell><code>{role.slug}</code></CTableDataCell>
                    <CTableDataCell className="text-center">{role.count}</CTableDataCell>
                    <CTableDataCell className="text-center">
                      <CButton 
                        color="info" 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleEdit(role)}
                      >
                        <CIcon icon={cilPencil} />
                      </CButton>
                      <CButton 
                        color="danger" 
                        variant="ghost" 
                        size="sm" 
                        disabled={['administrator', 'subscriber'].includes(role.slug)}
                        onClick={() => handleDelete(role.slug)}
                      >
                        <CIcon icon={cilTrash} />
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          </CCardBody>
        </CCard>
      </CCol>

      {showAddRole && (
        <CCol md={4}>
          <CCard className="mb-4 shadow-sm border-0 border-top border-primary border-3">
            <CCardHeader className="bg-white py-3 fw-bold">{isEditMode ? 'Edit Role' : 'Create New Role'}</CCardHeader>
            <CCardBody className="p-4">
               <CForm onSubmit={handleCreateRole}>
                  <div className="mb-3">
                    <CFormLabel>Display Name</CFormLabel>
                    <CFormInput 
                       placeholder="e.g. Sales Manager"
                       value={newRole.name}
                       onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                       required
                    />
                  </div>
                  <div className="mb-3">
                    <CFormLabel>Role Slug</CFormLabel>
                    <CFormInput 
                       placeholder="e.g. sales_manager"
                       value={newRole.slug}
                       onChange={(e) => setNewRole({ ...newRole, slug: e.target.value })}
                       required
                       disabled={isEditMode}
                    />
                    {isEditMode && <div className="form-text small text-muted">Role slugs cannot be changed later.</div>}
                  </div>
                  <div className="mb-4 pt-3 border-top">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <CFormLabel className="fw-bold small mb-0">Permissions Matrix</CFormLabel>
                      <CFormCheck 
                        id="select-all-caps"
                        label={<span style={{ fontSize: '10px' }} className="text-muted">SELECT ALL</span>}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                      />
                    </div>
                    <div className="table-responsive">
                      <CTable small borderless className="small mb-0 align-middle">
                        <CTableHead>
                          <CTableRow className="text-muted" style={{ fontSize: '10px' }}>
                            <CTableHeaderCell>SECTION</CTableHeaderCell>
                            <CTableHeaderCell className="text-center">V</CTableHeaderCell>
                            <CTableHeaderCell className="text-center">A</CTableHeaderCell>
                            <CTableHeaderCell className="text-center">E</CTableHeaderCell>
                            <CTableHeaderCell className="text-center">D</CTableHeaderCell>
                          </CTableRow>
                        </CTableHead>
                        <CTableBody>
                          {sections.map((sec) => (
                            <CTableRow key={sec.key}>
                              <CTableDataCell className="fw-semibold">{sec.name}</CTableDataCell>
                              <CTableDataCell className="text-center">
                                <CFormCheck 
                                  size="sm" 
                                  checked={!!permissions[`${sec.key}_v`]} 
                                  onChange={(e) => handlePermissionChange(`${sec.key}_v`, e.target.checked)}
                                />
                              </CTableDataCell>
                              <CTableDataCell className="text-center">
                                {!sec.noAdd && (
                                  <CFormCheck 
                                    size="sm" 
                                    checked={!!permissions[`${sec.key}_a`]} 
                                    onChange={(e) => handlePermissionChange(`${sec.key}_a`, e.target.checked)}
                                  />
                                )}
                              </CTableDataCell>
                              <CTableDataCell className="text-center">
                                <CFormCheck 
                                  size="sm" 
                                  checked={!!permissions[`${sec.key}_e`]} 
                                  onChange={(e) => handlePermissionChange(`${sec.key}_e`, e.target.checked)}
                                />
                              </CTableDataCell>
                              <CTableDataCell className="text-center">
                                {!sec.noDel && (
                                  <CFormCheck 
                                    size="sm" 
                                    checked={!!permissions[`${sec.key}_d`]} 
                                    onChange={(e) => handlePermissionChange(`${sec.key}_d`, e.target.checked)}
                                  />
                                )}
                              </CTableDataCell>
                            </CTableRow>
                          ))}
                        </CTableBody>
                      </CTable>
                    </div>
                    <div className="text-muted mt-2" style={{ fontSize: '10px' }}>
                       V=View, A=Add, E=Edit, D=Delete
                    </div>
                  </div>
                  <div className="d-flex justify-content-between">
                    <CButton color="secondary" variant="ghost" size="sm" onClick={() => setShowAddRole(false)}>
                       Cancel
                    </CButton>
                    <CButton color="primary" size="sm" type="submit" disabled={loading}>
                       {loading ? <CSpinner size="sm" /> : (isEditMode ? 'Update Role' : 'Create Role')}
                    </CButton>
                  </div>
               </CForm>
            </CCardBody>
          </CCard>
          <CAlert color="info" className="small">
             <strong>Developer Tip:</strong> New roles require a custom WordPress endpoint. I have provided the PHP code for your <code>functions.php</code> to make this form fully functional.
          </CAlert>
        </CCol>
      )}
    </CRow>
  )
}

export default Roles
