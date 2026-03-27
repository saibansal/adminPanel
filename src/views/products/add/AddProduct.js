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
  CFormFeedback,
  CSpinner,
  CAlert,
  CBadge,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilSave, cilImage, cilTrash, cilCloudUpload } from '@coreui/icons'
import API_CONFIG from 'src/apiConfig'

const AddProduct = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditMode = !!id
  const [activeKey, setActiveKey] = useState(1)
  const [loading, setLoading] = useState(false)
  const [initialDataLoading, setInitialDataLoading] = useState(true)
  const [categories, setCategories] = useState([])
  const [globalAttributes, setGlobalAttributes] = useState([])
  const [taxClasses, setTaxClasses] = useState([])
  const [shippingClasses, setShippingClasses] = useState([])
  const [selectedAttrId, setSelectedAttrId] = useState('')
  const [expandedVariationIndex, setExpandedVariationIndex] = useState(null)
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingGallery, setUploadingGallery] = useState(false)
  const [statusModal, setStatusModal] = useState({ visible: false, title: '', message: '', color: 'primary' })

  const showStatus = (title, message, color = 'primary') => {
    setStatusModal({ visible: true, title, message, color })
  }

  const [allProducts, setAllProducts] = useState([])
  const [variations, setVariations] = useState([])

  // Form State
  const [productData, setProductData] = useState({
    name: '',
    type: 'simple',
    status: 'publish',
    description: '',
    short_description: '',
    sku: '',
    regular_price: '',
    sale_price: '',
    date_on_sale_from: '',
    date_on_sale_to: '',
    external_url: '',
    button_text: '',
    manage_stock: false,
    stock_status: 'instock',
    stock_quantity: '',
    backorders: 'no',
    low_stock_amount: '',
    sold_individually: false,
    weight: '',
    dimensions: { length: '', width: '', height: '' },
    shipping_class: '',
    tax_status: 'taxable',
    tax_class: '',
    categories: [],
    tags_input: '',
    upsell_ids: [],
    cross_sell_ids: [],
    grouped_products: [],
    purchase_note: '',
    menu_order: 0,
    reviews_allowed: true,
    virtual: false,
    downloadable: false,
    download_limit: -1,
    download_expiry: -1,
    downloadable_files: [],
    attributes: [],
    images: []
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { 'Authorization': API_CONFIG.getBasicAuthHeader() }
        const [catRes, attrRes, taxRes, shipRes, prodRes] = await Promise.all([
          fetch(`${API_CONFIG.BASE_URL}wc/v3/products/categories`, { headers }),
          fetch(`${API_CONFIG.BASE_URL}wc/v3/products/attributes`, { headers }),
          fetch(`${API_CONFIG.BASE_URL}wc/v3/taxes/classes`, { headers }),
          fetch(`${API_CONFIG.BASE_URL}wc/v3/products/shipping_classes`, { headers }),
          fetch(`${API_CONFIG.BASE_URL}wc/v3/products`, { headers })
        ])

        if (catRes.ok) setCategories(await catRes.json())
        if (attrRes.ok) setGlobalAttributes(await attrRes.json())
        if (taxRes.ok) setTaxClasses(await taxRes.json())
        if (shipRes.ok) setShippingClasses(await shipRes.json())
        if (prodRes.ok) setAllProducts(await prodRes.json())
      } catch (err) {
        console.error('Error fetching initial data:', err)
      } finally {
        setInitialDataLoading(false)
      }
    }
    fetchData()
  }, [])

  // 2. Fetch data for Edit Mode
  useEffect(() => {
    if (!id) return

    const fetchProduct = async () => {
      setInitialDataLoading(true)
      try {
        const headers = { 'Authorization': API_CONFIG.getBasicAuthHeader() }
        const res = await fetch(`${API_CONFIG.BASE_URL}wc/v3/products/${id}`, { headers })
        if (res.ok) {
          const data = await res.json()

          // Flatten tags for input
          const tagsInput = data.tags ? data.tags.map(t => t.name).join(', ') : ''

          setProductData({
            ...data,
            tags_input: tagsInput,
            // Ensure numeric fields aren't null for UI
            low_stock_amount: data.low_stock_amount || '',
            stock_quantity: data.stock_quantity || '',
          })

          // If variable product, fetch variations
          if (data.type === 'variable') {
            const varRes = await fetch(`${API_CONFIG.BASE_URL}wc/v3/products/${id}/variations?per_page=100`, { headers })
            if (varRes.ok) {
              const varData = await varRes.json()
              setVariations(varData.map(v => ({
                ...v,
                // Ensure dimensions exist
                dimensions: v.dimensions || { length: '', width: '', height: '' }
              })))
            }
          }
        }
      } catch (err) {
        console.error('Error fetching product for edit:', err)
        showStatus('Load Error', 'Failed to load product for editing.', 'danger')
      } finally {
        setInitialDataLoading(false)
      }
    }
    fetchProduct()
  }, [id])

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target
    if (id.includes('.')) {
      const [parent, child] = id.split('.')
      setProductData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }))
    } else {
      setProductData(prev => {
        const newData = { ...prev, [id]: type === 'checkbox' ? checked : value };

        // Auto-switch tabs if the current one is being hidden
        if (id === 'type' || id === 'virtual') {
          const isVirtual = id === 'virtual' ? checked : prev.virtual;
          const pType = id === 'type' ? value : prev.type;

          let validTabs = [
            { key: 1, show: pType !== 'grouped' },
            { key: 2, show: true },
            { key: 3, show: !isVirtual && ['simple', 'variable'].includes(pType) },
            { key: 7, show: true },
            { key: 4, show: true },
            { key: 6, show: pType === 'variable' },
            { key: 5, show: true }
          ].filter(t => t.show).map(t => t.key);

          if (!validTabs.includes(activeKey)) {
            setActiveKey(validTabs[0]);
          }
        }

        return newData;
      })
    }
  }

  const [newCatName, setNewCatName] = useState('')
  const [addingCat, setAddingCat] = useState(false)

  const uploadImage = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', file.name);

      const response = await fetch(`${API_CONFIG.BASE_URL}wp/v2/media`, {
        method: 'POST',
        headers: {
          'Authorization': API_CONFIG.getJWTHeader()
        },
        body: formData
      });

      if (response.ok) {
        return await response.json();
      } else {
        const err = await response.json();
        console.error('Upload failed:', err);
        return null;
      }
    } catch (err) {
      console.error('Upload logic error:', err);
      return null;
    }
  }

  const handleFileUpload = async (e, isGallery = false) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (isGallery) setUploadingGallery(true);
    else setUploadingImage(true);

    const uploadedImages = [];
    try {
      for (let i = 0; i < files.length; i++) {
        let file = files[i];
        const uploaded = await uploadImage(file);
        if (uploaded) {
          uploadedImages.push({ src: uploaded.source_url });
        }
      }

      if (uploadedImages.length > 0) {
        if (isGallery) {
          setProductData(prev => ({
            ...prev,
            images: [...prev.images, ...uploadedImages]
          }));
        } else {
          setProductData(prev => ({
            ...prev,
            images: [uploadedImages[0], ...prev.images.slice(1)]
          }));
        }
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload image(s).');
    } finally {
      if (isGallery) setUploadingGallery(false);
      else setUploadingImage(false);
    }
  }

  const handleDownloadableFileChange = (index, field, value) => {
    setProductData(prev => {
      const newFiles = [...prev.downloadable_files];
      if (newFiles[index]) {
        newFiles[index] = { ...newFiles[index], [field]: value };
      }
      return { ...prev, downloadable_files: newFiles };
    });
  }

  const addDownloadableFile = () => {
    setProductData(prev => ({
      ...prev,
      downloadable_files: [...prev.downloadable_files, { name: '', file: '' }]
    }));
  }

  const handleAddNewCategory = async () => {
    if (!newCatName.trim()) return;
    setAddingCat(true);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}wc/v3/products/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': API_CONFIG.getBasicAuthHeader()
        },
        body: JSON.stringify({ name: newCatName.trim() })
      });
      if (response.ok) {
        const newCat = await response.json();
        setCategories(prev => [...prev, newCat]);
        setProductData(prev => ({
          ...prev,
          categories: [...prev.categories, { id: newCat.id }]
        }));
        setNewCatName('');
      }
    } catch (err) {
      console.error('Error adding category:', err);
    } finally {
      setAddingCat(false);
    }
  }

  const handleCategoryToggle = (catId) => {
    setProductData(prev => {
      const exists = prev.categories.find(c => c.id === catId)
      if (exists) {
        return { ...prev, categories: prev.categories.filter(c => c.id !== catId) }
      } else {
        return { ...prev, categories: [...prev.categories, { id: catId }] }
      }
    })
  }

  const addAttribute = async () => {
    // 1. Custom Product Attribute
    if (!selectedAttrId) {
      setProductData(prev => ({
        ...prev,
        attributes: [
          ...prev.attributes,
          {
            id: 0,
            name: '',
            position: prev.attributes.length,
            visible: true,
            variation: false,
            options: [],
            rawValue: '', // Add this for textarea editing
            isCustom: true
          }
        ]
      }));
      return;
    }

    // 2. Global Attribute
    const attr = globalAttributes.find(a => a.id.toString() === selectedAttrId);
    if (!attr) return;

    // Check if already added
    if (productData.attributes.find(a => a.id === attr.id)) return;

    // Fetch terms for this attribute (optional but helpful)
    let fetchedTerms = [];
    try {
      const resp = await fetch(`${API_CONFIG.BASE_URL}wc/v3/products/attributes/${attr.id}/terms`, {
        headers: { 'Authorization': API_CONFIG.getBasicAuthHeader() }
      });
      if (resp.ok) fetchedTerms = await resp.json();
    } catch (e) {
      console.error('Error fetching terms:', e);
    }

    setProductData(prev => ({
      ...prev,
      attributes: [...prev.attributes, {
        id: attr.id,
        name: attr.name,
        position: prev.attributes.length,
        visible: true,
        variation: false,
        options: [],
        availableTerms: fetchedTerms.map(t => t.name)
      }]
    }));
    setSelectedAttrId('');
  }

  const handleSelectAllTerms = (index) => {
    const newAttrs = [...productData.attributes];
    if (newAttrs[index].availableTerms) {
      newAttrs[index].options = [...newAttrs[index].availableTerms];
      setProductData(prev => ({ ...prev, attributes: newAttrs }));
    }
  }

  const handleSelectNoTerms = (index) => {
    const newAttrs = [...productData.attributes];
    newAttrs[index].options = [];
    setProductData(prev => ({ ...prev, attributes: newAttrs }));
  }

  const handleAttributeChange = (index, field, value) => {
    const newAttrs = [...productData.attributes];
    if (field === 'options') {
      if (newAttrs[index].isCustom) {
        newAttrs[index].rawValue = value;
        // Keep options in sync but more leniently
        newAttrs[index].options = value.split('|').map(v => v.trim()).filter(v => v !== '');
      } else {
        // For global badges, value is already an array joined with | or similar logic
        newAttrs[index][field] = value.split('|').map(v => v.trim()).filter(v => v !== '');
      }
    } else {
      newAttrs[index][field] = value;
    }
    setProductData(prev => ({ ...prev, attributes: newAttrs }));
  }

  const removeAttribute = (index) => {
    setProductData(prev => ({
      ...prev,
      attributes: prev.attributes.filter((_, i) => i !== index)
    }));
  }

  const generateVariations = () => {
    const variationAttrs = productData.attributes.filter(a => a.variation && a.options.length > 0);
    if (variationAttrs.length === 0) return;

    // Cartesion product of options
    const combos = variationAttrs.reduce((acc, attr) => {
      const results = [];
      attr.options.forEach(opt => {
        if (acc.length === 0) {
          results.push([{ id: attr.id, name: attr.name, option: opt }]);
        } else {
          acc.forEach(combo => {
            results.push([...combo, { id: attr.id, name: attr.name, option: opt }]);
          });
        }
      });
      return results;
    }, []);

    const newVariations = combos.map((combo, idx) => ({
      id: `new-${idx}`,
      regular_price: productData.regular_price,
      sale_price: productData.sale_price,
      sku: `${productData.sku}-${idx + 1}`,
      manage_stock: false,
      stock_status: 'instock',
      stock_quantity: '',
      weight: '',
      dimensions: { length: '', width: '', height: '' },
      attributes: combo,
      enabled: true,
      virtual: false,
      downloadable: false,
      image: null,
      description: '',
      shipping_class: '',
      tax_class: '',
      gtin: '' // GTIN, UPC, EAN, or ISBN
    }));

    setVariations(newVariations);
    setExpandedVariationIndex(0); // Expand first one
  }

  const addVariation = () => {
    const variationAttrs = productData.attributes.filter(a => a.variation);
    if (variationAttrs.length === 0) {
      showStatus('Missing Configuration', 'Please mark at least one attribute for "Variations" and add options first.', 'warning')
      return
    }

    const newVar = {
      id: `new-${Date.now()}`,
      regular_price: '',
      sale_price: '',
      sku: '',
      manage_stock: false,
      stock_status: 'instock',
      stock_quantity: '',
      weight: '',
      dimensions: { length: '', width: '', height: '' },
      attributes: variationAttrs.map(a => ({ id: a.id, name: a.name, option: '' })),
      enabled: true,
      virtual: false,
      downloadable: false,
      image: null,
      description: '',
      shipping_class: '',
      tax_class: '',
      gtin: ''
    };

    setVariations(prev => [...prev, newVar]);
    setExpandedVariationIndex(variations.length); // Expand the new one
  }

  const handleVariationChange = (index, field, value) => {
    const newVars = [...variations];
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      newVars[index][parent] = { ...newVars[index][parent], [child]: value }
    } else {
      newVars[index][field] = value;
    }
    setVariations(newVars);
  }

  const removeVariation = (index) => {
    setVariations(prev => prev.filter((_, i) => i !== index));
  }

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Process Tags
      const tags = productData.tags_input
        ? productData.tags_input.split(',').map(name => ({ name: name.trim() }))
        : [];

      const submissionData = {
        ...productData,
        tags: tags
      };

      // Clean up the data for API
      delete submissionData.tags_input;

      // Sanitize numeric fields for WooCommerce API
      if (submissionData.low_stock_amount === '' || submissionData.low_stock_amount === null) {
        delete submissionData.low_stock_amount;
      } else {
        submissionData.low_stock_amount = parseInt(submissionData.low_stock_amount);
      }

      if (submissionData.stock_quantity === '' || submissionData.stock_quantity === null) {
        delete submissionData.stock_quantity;
      } else {
        submissionData.stock_quantity = parseInt(submissionData.stock_quantity);
      }

      if (submissionData.menu_order === '' || submissionData.menu_order === null) {
        submissionData.menu_order = 0;
      } else {
        submissionData.menu_order = parseInt(submissionData.menu_order);
      }

      // Digital Product Fields Sanitization
      if (submissionData.download_limit === '' || submissionData.download_limit === null) {
        submissionData.download_limit = -1;
      } else {
        submissionData.download_limit = parseInt(submissionData.download_limit);
      }

      if (submissionData.download_expiry === '' || submissionData.download_expiry === null) {
        submissionData.download_expiry = -1;
      } else {
        submissionData.download_expiry = parseInt(submissionData.download_expiry);
      }

      // Convert prices to strings (WC API standard)
      if (submissionData.regular_price) submissionData.regular_price = submissionData.regular_price.toString();
      if (submissionData.sale_price) submissionData.sale_price = submissionData.sale_price.toString();

      // Variations sanitization if variable
      const sanitizedVariations = variations.map(v => {
        const varCopy = { ...v };
        if (varCopy.regular_price) varCopy.regular_price = varCopy.regular_price.toString();
        if (varCopy.sale_price) varCopy.sale_price = varCopy.sale_price.toString();
        if (varCopy.stock_quantity === '' || varCopy.stock_quantity === null) {
          delete varCopy.stock_quantity;
        } else {
          varCopy.stock_quantity = parseInt(varCopy.stock_quantity);
        }
        if (varCopy.weight === '') delete varCopy.weight;
        return varCopy;
      });

      const apiUrl = isEditMode
        ? `${API_CONFIG.BASE_URL}wc/v3/products/${id}`
        : `${API_CONFIG.BASE_URL}wc/v3/products`;

      const response = await fetch(apiUrl, {
        method: isEditMode ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': API_CONFIG.getBasicAuthHeader()
        },
        body: JSON.stringify(submissionData)
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.message || `Error ${isEditMode ? 'updating' : 'creating'} product.`)
      }

      const newProduct = await response.json();
      const parentId = isEditMode ? id : newProduct.id;

      // If variable, create/update variations
      if (productData.type === 'variable' && sanitizedVariations.length > 0) {
        for (const variation of sanitizedVariations) {
          const varData = { ...variation };
          const varId = varData.id && typeof varData.id === 'number' ? varData.id : null;

          // Delete temp fields
          delete varData.id;

          const varActionUrl = varId
            ? `${API_CONFIG.BASE_URL}wc/v3/products/${parentId}/variations/${varId}`
            : `${API_CONFIG.BASE_URL}wc/v3/products/${parentId}/variations`;

          await fetch(varActionUrl, {
            method: varId ? 'PUT' : 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': API_CONFIG.getBasicAuthHeader()
            },
            body: JSON.stringify(varData)
          });
        }
      }
      
      showStatus('Success', `Product successfully ${isEditMode ? 'updated' : 'published'}!`, 'success')
      if (!isEditMode) {
        // Reset form for new product
        setProductData(prev => ({
          ...prev,
          name: '',
          sku: '',
          regular_price: '',
          sale_price: '',
          description: '',
          short_description: '',
          tags_input: '',
          attributes: []
        }))
        setVariations([])
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (initialDataLoading) {
    return (
      <div className="text-center p-5 mt-5">
        <CSpinner color="primary" />
        <p className="mt-3 text-muted">Building product editor...</p>
      </div>
    )
  }

  return (
    <CRow>
      <CCol lg={9}>
        {/* Main Content Area */}
        <CCard className="mb-4 shadow-sm border-0">
          <CCardBody>
            {error && <CAlert color="danger" dismissible>{error}</CAlert>}
            {success && <CAlert color="success" dismissible>{success}</CAlert>}

            <div className="mb-4">
              <CFormInput
                type="text"
                id="name"
                name="name"
                size="lg"
                placeholder="Product name"
                className="fw-bold border-top-0 border-start-0 border-end-0 rounded-0 fs-3 px-0 border-bottom-2 no-focus-outline"
                value={productData.name}
                onChange={handleChange}
              />
            </div>

            <div className="mb-4">
              <CFormLabel className="fw-bold">Product Description</CFormLabel>
              <CFormTextarea
                id="description"
                rows="8"
                placeholder="Describe your product in detail..."
                className="bg-light border-0"
                value={productData.description}
                onChange={handleChange}
              ></CFormTextarea>
            </div>

            {/* Product Data Box */}
            <CCard className="mb-4 border shadow-sm rounded-3 overflow-hidden">
              <CCardHeader className="bg-light border-bottom py-3 d-flex align-items-center flex-wrap gap-3">
                <strong className="me-2 text-secondary">Product Data —</strong>
                <CFormSelect
                  id="type"
                  size="sm"
                  style={{ width: 'auto' }}
                  value={productData.type}
                  onChange={handleChange}
                  className="shadow-sm"
                >
                  <option value="simple">Simple product</option>
                  <option value="grouped">Grouped product</option>
                  <option value="external">External/Affiliate product</option>
                  <option value="variable">Variable product</option>
                </CFormSelect>
                <div className="d-flex gap-3 ms-3">
                  <CFormCheck id="virtual" label="Virtual" checked={productData.virtual} onChange={handleChange} />
                  <CFormCheck id="downloadable" label="Downloadable" checked={productData.downloadable} onChange={handleChange} />
                </div>
              </CCardHeader>
              <CCardBody className="p-0">
                <div className="d-flex flex-row" style={{ minHeight: '350px' }}>
                  {/* Tabs Sidebar */}
                  <div className="bg-light border-end" style={{ width: '160px' }}>
                    <CNav variant="pills" className="flex-column p-0">
                      {[
                        { key: 1, label: 'General', show: productData.type !== 'grouped' },
                        { key: 2, label: 'Inventory', show: true },
                        { key: 3, label: 'Shipping', show: !productData.virtual && ['simple', 'variable'].includes(productData.type) },
                        { key: 7, label: 'Linked Products', show: true },
                        { key: 4, label: 'Attributes', show: true },
                        { key: 6, label: 'Variations', show: productData.type === 'variable' },
                        { key: 5, label: 'Advanced', show: true }
                      ].filter(tab => tab.show).map(tab => (
                        <CNavItem key={tab.key}>
                          <CNavLink
                            className={`rounded-0 border-bottom text-dark py-2 ${activeKey === tab.key ? 'bg-white border-end-0 fw-bold border-start border-start-4 border-primary' : ''}`}
                            active={activeKey === tab.key}
                            onClick={() => setActiveKey(tab.key)}
                            component="button"
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
                      <CTabPane visible={activeKey === 1}>
                        {productData.type === 'external' && (
                          <>
                            <CRow className="mb-3">
                              <CFormLabel className="col-sm-4 text-sm-end fw-semibold text-primary">Product URL</CFormLabel>
                              <CCol sm={8}>
                                <CFormInput type="text" id="external_url" placeholder="https://..." value={productData.external_url} onChange={handleChange} />
                              </CCol>
                            </CRow>
                            <CRow className="mb-3">
                              <CFormLabel className="col-sm-4 text-sm-end fw-semibold">Button text</CFormLabel>
                              <CCol sm={8}>
                                <CFormInput type="text" id="button_text" placeholder="Buy product" value={productData.button_text} onChange={handleChange} />
                              </CCol>
                            </CRow>
                            <hr className="my-4 opacity-10" />
                          </>
                        )}

                        {(productData.type === 'simple' || productData.type === 'external') && (
                          <>
                            <CRow className="mb-3">
                              <CFormLabel className="col-sm-4 text-sm-end fw-semibold">Regular price ($)</CFormLabel>
                              <CCol sm={8}>
                                <CFormInput type="text" id="regular_price" value={productData.regular_price} onChange={handleChange} />
                              </CCol>
                            </CRow>
                            <CRow className="mb-3">
                              <CFormLabel className="col-sm-4 text-sm-end fw-semibold">Sale price ($)</CFormLabel>
                              <CCol sm={8}>
                                <div className="d-flex flex-column gap-2">
                                  <CFormInput type="text" id="sale_price" value={productData.sale_price} onChange={handleChange} />
                                  <div className="d-flex gap-2">
                                    <CFormInput type="date" id="date_on_sale_from" size="sm" value={productData.date_on_sale_from} onChange={handleChange} />
                                    <CFormInput type="date" id="date_on_sale_to" size="sm" value={productData.date_on_sale_to} onChange={handleChange} />
                                  </div>
                                </div>
                              </CCol>
                            </CRow>
                          </>
                        )}

                        {productData.type === 'variable' && (
                          <div className="alert alert-info py-2 small mb-3">
                            Prices are managed in the <strong>Variations</strong> tab.
                          </div>
                        )}

                        <hr className="my-4 opacity-10" />
                        <CRow className="mb-3">
                          <CFormLabel className="col-sm-4 text-sm-end fw-semibold">Tax status</CFormLabel>
                          <CCol sm={8}>
                            <CFormSelect id="tax_status" value={productData.tax_status} onChange={handleChange}>
                              <option value="taxable">Taxable</option>
                              <option value="shipping">Shipping only</option>
                              <option value="none">None</option>
                            </CFormSelect>
                          </CCol>
                        </CRow>
                        <CRow className="mb-3">
                          <CFormLabel className="col-sm-4 text-sm-end fw-semibold">Tax class</CFormLabel>
                          <CCol sm={8}>
                            <CFormSelect id="tax_class" value={productData.tax_class} onChange={handleChange}>
                              <option value="">Standard</option>
                              {taxClasses.map(cls => (
                                <option key={cls.slug} value={cls.slug}>{cls.name}</option>
                              ))}
                            </CFormSelect>
                          </CCol>
                        </CRow>
                        {productData.downloadable && productData.type === 'simple' && (
                          <>
                            <hr className="my-4 opacity-10" />
                            <div className="mb-3 fw-bold small text-secondary px-3">Downloadable files</div>
                            {/* Downloadable fields */}
                            <CRow className="mb-3 px-3">
                              <CCol md={6}>
                                <CFormLabel className="small fw-bold">Download limit</CFormLabel>
                                <CFormInput type="number" id="download_limit" placeholder="Unlimited" value={productData.download_limit === -1 ? '' : productData.download_limit} onChange={handleChange} size="sm" />
                              </CCol>
                              <CCol md={6}>
                                <CFormLabel className="small fw-bold">Download expiry</CFormLabel>
                                <CFormInput type="number" id="download_expiry" placeholder="Never" value={productData.download_expiry === -1 ? '' : productData.download_expiry} onChange={handleChange} size="sm" />
                              </CCol>
                            </CRow>
                            {productData.downloadable_files.map((file, idx) => (
                              <div key={idx} className="bg-light p-3 rounded mb-2 mx-3 shadow-sm border">
                                <CRow className="g-2">
                                  <CCol md={6}>
                                    <CFormLabel className="small mb-1">File Name</CFormLabel>
                                    <CFormInput size="sm" placeholder="e.g. eBook PDF" value={file.name} onChange={(e) => handleDownloadableFileChange(idx, 'name', e.target.value)} />
                                  </CCol>
                                  <CCol md={6}>
                                    <CFormLabel className="small mb-1">File URL</CFormLabel>
                                    <div className="d-flex gap-1">
                                      <CFormInput
                                        size="sm"
                                        placeholder="http://..."
                                        value={file.file}
                                        readOnly
                                        className="bg-light"
                                      />
                                      <CButton
                                        color="secondary"
                                        variant="outline"
                                        size="sm"
                                        disabled={file.file === 'Uploading...'}
                                        onClick={() => document.getElementById(`download-file-input-${idx}`).click()}
                                      >
                                        {file.file === 'Uploading...' ? 'Please wait...' : 'Choose'}
                                      </CButton>
                                      <input
                                        type="file"
                                        id={`download-file-input-${idx}`}
                                        hidden
                                        onChange={async (e) => {
                                          const uploadedFile = e.target.files[0];
                                          if (uploadedFile) {
                                            handleDownloadableFileChange(idx, 'file', 'Uploading...');
                                            const uploaded = await uploadImage(uploadedFile);
                                            if (uploaded) {
                                              handleDownloadableFileChange(idx, 'file', uploaded.source_url);
                                            } else {
                                              handleDownloadableFileChange(idx, 'file', '');
                                            }
                                          }
                                        }}
                                      />
                                    </div>
                                  </CCol>
                                </CRow>
                              </div>
                            ))}
                            <div className="px-3">
                              <CButton color="outline-primary" size="sm" onClick={addDownloadableFile}>Add File</CButton>
                            </div>
                          </>
                        )}
                      </CTabPane>

                      <CTabPane visible={activeKey === 6}>
                        {productData.attributes.filter(a => a.variation).length === 0 ? (
                          <div className="text-center p-5 text-muted bg-light rounded">
                            <p>Before you can add variations, you need to add some variation attributes on the <strong>Attributes</strong> tab.</p>
                            <CButton color="primary" variant="outline" size="sm" onClick={() => setActiveKey(4)}>Go to Attributes</CButton>
                          </div>
                        ) : (
                          <div className="p-3">
                            <div className="d-flex justify-content-between align-items-center mb-4 bg-light p-2 rounded border">
                              <h6 className="mb-0 fw-bold px-2">Variations</h6>
                              <div className="d-flex gap-2">
                                <CButton color="primary" size="sm" onClick={addVariation}>Add Variation</CButton>
                                <CButton color="outline-primary" size="sm" onClick={generateVariations}>Generate Variations</CButton>
                              </div>
                            </div>

                            {variations.length === 0 ? (
                              <div className="text-center p-4 bg-light rounded text-muted">
                                No variations generated yet. Click "Generate Variations" to create combinations from your attributes.
                              </div>
                            ) : (
                              <div className="variations-accordion">
                                {variations.map((v, idx) => (
                                  <CCard key={v.id} className="mb-2 shadow-sm border rounded-2 overflow-hidden">
                                    <CCardHeader
                                      className="p-2 d-flex justify-content-between align-items-center bg-white cursor-pointer hover-bg-light"
                                      onClick={() => setExpandedVariationIndex(expandedVariationIndex === idx ? null : idx)}
                                    >
                                      <div className="d-flex align-items-center gap-2">
                                        <div className="variation-img-thumb border rounded bg-light" style={{ width: '32px', height: '32px', overflow: 'hidden' }}>
                                          {v.image ? <img src={v.image.src} className="w-100 h-100 object-fit-cover" /> : null}
                                        </div>
                                        <div className="small fw-bold px-2 py-1 bg-light rounded border text-secondary">
                                          {v.attributes.map(a => `${a.name}: ${a.option || 'Any...'}`).join(', ')}
                                        </div>
                                      </div>
                                      <div className="d-flex gap-3 align-items-center">
                                        {v.regular_price && <span className="small text-success fw-bold">${v.regular_price}</span>}
                                        <CButton color="link" size="sm" className="text-danger p-0" onClick={(e) => { e.stopPropagation(); removeVariation(idx); }}>
                                          <CIcon icon={cilTrash} />
                                        </CButton>
                                        <CIcon icon={expandedVariationIndex === idx ? cilPlus : cilPlus} style={{ transform: expandedVariationIndex === idx ? 'rotate(45deg)' : 'none', transition: '0.2s' }} />
                                      </div>
                                    </CCardHeader>
                                    {expandedVariationIndex === idx && (
                                      <CCardBody className="p-3 border-top bg-light">
                                        <CRow className="g-3">
                                          <CCol md={3} className="text-center">
                                            <div
                                              className="border rounded mb-2 d-flex align-items-center justify-content-center bg-white cursor-pointer"
                                              style={{ height: '150px', borderStyle: 'dashed' }}
                                              onClick={() => document.getElementById(`var-img-${idx}`).click()}
                                            >
                                              {v.image ? (
                                                <img src={v.image.src} alt="Var" className="img-fluid h-100 object-fit-contain" />
                                              ) : (
                                                <div className="text-secondary small">
                                                  <CIcon icon={cilCloudUpload} size="xl" className="d-block mx-auto mb-1" />
                                                  Upload Image
                                                </div>
                                              )}
                                            </div>
                                            <input
                                              type="file"
                                              id={`var-img-${idx}`}
                                              hidden
                                              onChange={async (e) => {
                                                const file = e.target.files[0]
                                                if (file) {
                                                  const uploaded = await uploadImage(file)
                                                  if (uploaded) handleVariationChange(idx, 'image', { id: uploaded.id, src: uploaded.source_url })
                                                }
                                              }}
                                            />
                                          </CCol>
                                          <CCol md={9}>
                                            <CRow className="g-2">
                                              <CCol md={6}>
                                                <CFormLabel className="small fw-bold mb-1">SKU</CFormLabel>
                                                <CFormInput size="sm" value={v.sku} onChange={(e) => handleVariationChange(idx, 'sku', e.target.value)} />
                                              </CCol>
                                              <CCol md={6}>
                                                <CFormLabel className="small fw-bold mb-1">GTIN, UPC, EAN, or ISBN</CFormLabel>
                                                <CFormInput size="sm" value={v.gtin} onChange={(e) => handleVariationChange(idx, 'gtin', e.target.value)} />
                                              </CCol>
                                              <CCol md={12} className="d-flex gap-3 py-2 border-bottom border-top my-2 bg-white px-2 rounded small">
                                                <CFormCheck label="Enabled" checked={v.enabled} onChange={(e) => handleVariationChange(idx, 'enabled', e.target.checked)} />
                                                <CFormCheck label="Downloadable" checked={v.downloadable} onChange={(e) => handleVariationChange(idx, 'downloadable', e.target.checked)} />
                                                <CFormCheck label="Virtual" checked={v.virtual} onChange={(e) => handleVariationChange(idx, 'virtual', e.target.checked)} />
                                                <CFormCheck label="Manage stock?" checked={v.manage_stock} onChange={(e) => handleVariationChange(idx, 'manage_stock', e.target.checked)} />
                                              </CCol>
                                              <CCol md={6}>
                                                <CFormLabel className="small fw-bold mb-1">Regular price ($)</CFormLabel>
                                                <CFormInput size="sm" value={v.regular_price} placeholder="Variation price (required)" onChange={(e) => handleVariationChange(idx, 'regular_price', e.target.value)} />
                                              </CCol>
                                              <CCol md={6}>
                                                <CFormLabel className="small fw-bold mb-1">Sale price ($)</CFormLabel>
                                                <CFormInput size="sm" value={v.sale_price} onChange={(e) => handleVariationChange(idx, 'sale_price', e.target.value)} />
                                              </CCol>
                                              {v.manage_stock && (
                                                <>
                                                  <CCol md={6}>
                                                    <CFormLabel className="small fw-bold mb-1">Stock status</CFormLabel>
                                                    <CFormSelect size="sm" value={v.stock_status} onChange={(e) => handleVariationChange(idx, 'stock_status', e.target.value)}>
                                                      <option value="instock">In stock</option>
                                                      <option value="outofstock">Out of stock</option>
                                                      <option value="onbackorder">On backorder</option>
                                                    </CFormSelect>
                                                  </CCol>
                                                  <CCol md={6}>
                                                    <CFormLabel className="small fw-bold mb-1">Stock Qty</CFormLabel>
                                                    <CFormInput size="sm" type="number" value={v.stock_quantity} onChange={(e) => handleVariationChange(idx, 'stock_quantity', e.target.value)} />
                                                  </CCol>
                                                </>
                                              )}
                                            </CRow>
                                          </CCol>

                                          <CCol md={6}>
                                            <CFormLabel className="small fw-bold mb-1">Weight (kg)</CFormLabel>
                                            <CFormInput size="sm" placeholder="0" value={v.weight} onChange={(e) => handleVariationChange(idx, 'weight', e.target.value)} />
                                          </CCol>
                                          <CCol md={6}>
                                            <CFormLabel className="small fw-bold mb-1">Dimensions (L×W×H) (cm)</CFormLabel>
                                            <div className="d-flex gap-1">
                                              <CFormInput size="sm" placeholder="Length" value={v.dimensions.length} onChange={(e) => handleVariationChange(idx, 'dimensions.length', e.target.value)} />
                                              <CFormInput size="sm" placeholder="Width" value={v.dimensions.width} onChange={(e) => handleVariationChange(idx, 'dimensions.width', e.target.value)} />
                                              <CFormInput size="sm" placeholder="Height" value={v.dimensions.height} onChange={(e) => handleVariationChange(idx, 'dimensions.height', e.target.value)} />
                                            </div>
                                          </CCol>

                                          <CCol md={12}>
                                            <CFormLabel className="small fw-bold mb-1 text-secondary">Shipping class</CFormLabel>
                                            <CFormSelect size="sm" value={v.shipping_class} onChange={(e) => handleVariationChange(idx, 'shipping_class', e.target.value)}>
                                              <option value="">Same as parent</option>
                                              {shippingClasses.map(cls => (
                                                <option key={cls.id} value={cls.slug}>{cls.name}</option>
                                              ))}
                                            </CFormSelect>
                                          </CCol>
                                          <CCol md={12}>
                                            <CFormLabel className="small fw-bold mb-1 text-secondary">Tax class</CFormLabel>
                                            <CFormSelect size="sm" value={v.tax_class} onChange={(e) => handleVariationChange(idx, 'tax_class', e.target.value)}>
                                              <option value="">Same as parent</option>
                                              <option value="standard">Standard</option>
                                              {taxClasses.map(cls => (
                                                <option key={cls.slug} value={cls.slug}>{cls.name}</option>
                                              ))}
                                            </CFormSelect>
                                          </CCol>
                                          <CCol md={12}>
                                            <CFormLabel className="small fw-bold mb-1 text-secondary">Description</CFormLabel>
                                            <CFormTextarea size="sm" rows="2" value={v.description} onChange={(e) => handleVariationChange(idx, 'description', e.target.value)} />
                                          </CCol>
                                        </CRow>
                                      </CCardBody>
                                    )}
                                  </CCard>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </CTabPane>

                      <CTabPane visible={activeKey === 2}>
                        <CRow className="mb-3 text-nowrap">
                          <CFormLabel className="col-sm-4 text-sm-end fw-semibold">SKU</CFormLabel>
                          <CCol sm={8}>
                            <CFormInput type="text" id="sku" value={productData.sku} onChange={handleChange} />
                          </CCol>
                        </CRow>
                        <CRow className="mb-3 align-items-center">
                          <CFormLabel className="col-sm-4 text-sm-end fw-semibold">Manage stock?</CFormLabel>
                          <CCol sm={8}>
                            <CFormCheck id="manage_stock" label="Enable stock management at product level" checked={productData.manage_stock} onChange={handleChange} />
                          </CCol>
                        </CRow>
                        {productData.manage_stock && (
                          <>
                            <CRow className="mb-3">
                              <CFormLabel className="col-sm-4 text-sm-end fw-semibold">Stock quantity</CFormLabel>
                              <CCol sm={8}>
                                <CFormInput type="number" id="stock_quantity" value={productData.stock_quantity} onChange={handleChange} />
                              </CCol>
                            </CRow>
                            <CRow className="mb-3">
                              <CFormLabel className="col-sm-4 text-sm-end fw-semibold">Allow backorders?</CFormLabel>
                              <CCol sm={8}>
                                <CFormSelect id="backorders" value={productData.backorders} onChange={handleChange}>
                                  <option value="no">Do not allow</option>
                                  <option value="notify">Allow, but notify customer</option>
                                  <option value="yes">Allow</option>
                                </CFormSelect>
                              </CCol>
                            </CRow>
                            <CRow className="mb-3">
                              <CFormLabel className="col-sm-4 text-sm-end fw-semibold">Low stock threshold</CFormLabel>
                              <CCol sm={8}>
                                <CFormInput type="number" id="low_stock_amount" value={productData.low_stock_amount} onChange={handleChange} />
                              </CCol>
                            </CRow>
                          </>
                        )}
                        {!productData.manage_stock && (
                          <CRow className="mb-3">
                            <CFormLabel className="col-sm-4 text-sm-end fw-semibold">Stock status</CFormLabel>
                            <CCol sm={8}>
                              <CFormSelect id="stock_status" value={productData.stock_status} onChange={handleChange}>
                                <option value="instock">In stock</option>
                                <option value="outofstock">Out of stock</option>
                                <option value="onbackorder">On backorder</option>
                              </CFormSelect>
                            </CCol>
                          </CRow>
                        )}
                        <hr className="my-4 opacity-10" />
                        <CRow className="mb-3 align-items-center">
                          <CFormLabel className="col-sm-4 text-sm-end fw-semibold">Sold individually</CFormLabel>
                          <CCol sm={8}>
                            <CFormCheck id="sold_individually" label="Limit purchases to 1 item per order" checked={productData.sold_individually} onChange={handleChange} />
                          </CCol>
                        </CRow>
                      </CTabPane>

                      <CTabPane visible={activeKey === 3}>
                        <CRow className="mb-3">
                          <CFormLabel className="col-sm-4 text-sm-end fw-semibold">Weight (kg)</CFormLabel>
                          <CCol sm={8}>
                            <CFormInput type="text" id="weight" placeholder="0" value={productData.weight} onChange={handleChange} />
                          </CCol>
                        </CRow>
                        <CRow className="mb-3">
                          <CFormLabel className="col-sm-4 text-sm-end fw-semibold">Dimensions (cm)</CFormLabel>
                          <CCol sm={8}>
                            <div className="d-flex gap-2">
                              <CFormInput id="dimensions.length" placeholder="Length" value={productData.dimensions.length} onChange={handleChange} />
                              <CFormInput id="dimensions.width" placeholder="Width" value={productData.dimensions.width} onChange={handleChange} />
                              <CFormInput id="dimensions.height" placeholder="Height" value={productData.dimensions.height} onChange={handleChange} />
                            </div>
                          </CCol>
                        </CRow>
                        <CRow className="mb-3">
                          <CFormLabel className="col-sm-4 text-sm-end fw-semibold">Shipping class</CFormLabel>
                          <CCol sm={8}>
                            <CFormSelect id="shipping_class" value={productData.shipping_class} onChange={handleChange}>
                              <option value="">No shipping class</option>
                              {shippingClasses.map(cls => (
                                <option key={cls.id} value={cls.slug}>{cls.name}</option>
                              ))}
                            </CFormSelect>
                          </CCol>
                        </CRow>
                      </CTabPane>

                      <CTabPane visible={activeKey === 4}>
                        <div className="d-flex justify-content-between mb-3 border-bottom pb-3 px-1">
                          <CFormSelect
                            size="sm"
                            className="w-75 shadow-sm border-light-subtle"
                            id="attr-selector"
                            value={selectedAttrId}
                            onChange={(e) => setSelectedAttrId(e.target.value)}
                          >
                            <option value="">Custom product attribute</option>
                            {globalAttributes.map(attr => (
                              <option key={attr.id} value={attr.id}>{attr.name}</option>
                            ))}
                          </CFormSelect>
                          <CButton color="outline-primary" size="sm" onClick={addAttribute} className="px-3 fw-bold">Add</CButton>
                        </div>

                        {productData.attributes.length === 0 ? (
                          <div className="text-center p-5 bg-light rounded-3 text-muted border border-dashed">
                            <CIcon icon={cilPlus} size="xl" className="opacity-25 mb-2" />
                            <div>Attributes allow you to define extra product data, such as size or color.</div>
                          </div>
                        ) : (
                          <div className="attributes-list">
                            {productData.attributes.map((attr, index) => (
                              <CCard key={index} className="mb-3 shadow-sm border-light-subtle rounded-3 overflow-hidden">
                                <CCardHeader className="py-2 d-flex justify-content-between align-items-center bg-light bg-opacity-50 border-bottom">
                                  {attr.isCustom ? (
                                    <div className="d-flex align-items-center gap-2 flex-grow-1 me-3">
                                      <span className="small text-muted fw-bold text-nowrap">Name:</span>
                                      <CFormInput
                                        size="sm"
                                        placeholder="e.g. Material"
                                        value={attr.name}
                                        autoFocus
                                        onChange={(e) => handleAttributeChange(index, 'name', e.target.value)}
                                        className="bg-white border-0 py-0 fw-bold border-bottom-1"
                                      />
                                    </div>
                                  ) : (
                                    <span className="fw-bold text-primary">{attr.name}</span>
                                  )}
                                  <CButton color="link" size="sm" className="text-danger p-0" onClick={() => removeAttribute(index)}>
                                    <CIcon icon={cilTrash} />
                                  </CButton>
                                </CCardHeader>
                                <CCardBody className="p-3 bg-white">
                                  <CRow>
                                    <CCol md={8}>
                                      <div className="d-flex justify-content-between align-items-center mb-1">
                                        <CFormLabel className="small fw-bold mb-0">Value(s)</CFormLabel>
                                        {!attr.isCustom && attr.availableTerms && (
                                          <div className="d-flex gap-2">
                                            <CButton color="link" size="sm" className="p-0 small text-decoration-none" onClick={() => handleSelectAllTerms(index)}>Select all</CButton>
                                            <CButton color="link" size="sm" className="p-0 small text-decoration-none text-muted" onClick={() => handleSelectNoTerms(index)}>Select none</CButton>
                                          </div>
                                        )}
                                      </div>

                                      {attr.isCustom ? (
                                        <CFormTextarea
                                          size="sm"
                                          rows="2"
                                          placeholder="Value 1 | Value 2 | Value 3"
                                          value={attr.rawValue}
                                          onChange={(e) => handleAttributeChange(index, 'options', e.target.value)}
                                          className="bg-light border-0 shadow-none"
                                        />
                                      ) : (
                                        <div className="d-flex flex-wrap gap-1 p-2 bg-light rounded border border-light-subtle" style={{ minHeight: '80px' }}>
                                          {attr.availableTerms && attr.availableTerms.length > 0 ? (
                                            attr.availableTerms.map(term => (
                                              <CBadge
                                                key={term}
                                                color={attr.options.includes(term) ? "primary" : "secondary"}
                                                className={`cursor-pointer border ${attr.options.includes(term) ? "border-primary" : "bg-transparent text-secondary border-secondary opacity-75"}`}
                                                onClick={() => {
                                                  const exists = attr.options.includes(term);
                                                  let newOpts = exists
                                                    ? attr.options.filter(o => o !== term)
                                                    : [...attr.options, term];
                                                  handleAttributeChange(index, 'options', newOpts.join('|'));
                                                }}
                                              >
                                                {term}
                                              </CBadge>
                                            ))
                                          ) : (
                                            <span className="small text-muted p-2 italic">No predefined terms found. You can add them in the WooCommerce settings.</span>
                                          )}
                                        </div>
                                      )}
                                      <div className="small text-muted mt-1">Separate values with the " | " piping character.</div>
                                    </CCol>
                                    <CCol md={4}>
                                      <div className="pt-2 px-2 border-start h-100 d-flex flex-column gap-2 bg-light bg-opacity-25">
                                        <CFormCheck
                                          id={`attr-visible-${index}`}
                                          label="Visible"
                                          checked={attr.visible}
                                          onChange={(e) => handleAttributeChange(index, 'visible', e.target.checked)}
                                          className="small"
                                        />
                                        {productData.type === 'variable' && (
                                          <CFormCheck
                                            id={`attr-variation-${index}`}
                                            label="Variations"
                                            checked={attr.variation}
                                            onChange={(e) => handleAttributeChange(index, 'variation', e.target.checked)}
                                            className="small"
                                          />
                                        )}
                                      </div>
                                    </CCol>
                                  </CRow>
                                </CCardBody>
                              </CCard>
                            ))}
                          </div>
                        )}
                      </CTabPane>

                      <CTabPane visible={activeKey === 5}>
                        <CRow className="mb-3">
                          <CFormLabel className="col-sm-4 text-sm-end fw-semibold">Purchase note</CFormLabel>
                          <CCol sm={8}>
                            <CFormTextarea id="purchase_note" rows="2" value={productData.purchase_note} onChange={handleChange}></CFormTextarea>
                          </CCol>
                        </CRow>
                        <CRow className="mb-3">
                          <CFormLabel className="col-sm-4 text-sm-end fw-semibold">Menu order</CFormLabel>
                          <CCol sm={8}>
                            <CFormInput type="number" id="menu_order" value={productData.menu_order} onChange={handleChange} />
                          </CCol>
                        </CRow>
                        <hr className="my-3 opacity-10" />
                        <CRow className="mb-3 align-items-center">
                          <CFormLabel className="col-sm-4 text-sm-end fw-semibold">Enable reviews</CFormLabel>
                          <CCol sm={8}>
                            <CFormCheck id="reviews_allowed" label="" checked={productData.reviews_allowed} onChange={handleChange} />
                          </CCol>
                        </CRow>
                      </CTabPane>

                      <CTabPane visible={activeKey === 7}>
                        <CRow className="mb-3">
                          <CFormLabel className="col-sm-4 text-sm-end fw-semibold">Upsells</CFormLabel>
                          <CCol sm={8}>
                            <CFormSelect
                              multiple
                              id="upsell_ids"
                              size="5"
                              value={productData.upsell_ids}
                              onChange={(e) => {
                                const values = Array.from(e.target.selectedOptions, option => parseInt(option.value));
                                setProductData(prev => ({ ...prev, upsell_ids: values }));
                              }}
                            >
                              {allProducts.filter(p => p.id !== productData.id).map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                              ))}
                            </CFormSelect>
                            <div className="small text-muted mt-1">Upsells are products which you recommend instead of the currently viewed product.</div>
                          </CCol>
                        </CRow>
                        <CRow className="mb-3">
                          <CFormLabel className="col-sm-4 text-sm-end fw-semibold">Cross-sells</CFormLabel>
                          <CCol sm={8}>
                            <CFormSelect
                              multiple
                              id="cross_sell_ids"
                              size="5"
                              value={productData.cross_sell_ids}
                              onChange={(e) => {
                                const values = Array.from(e.target.selectedOptions, option => parseInt(option.value));
                                setProductData(prev => ({ ...prev, cross_sell_ids: values }));
                              }}
                            >
                              {allProducts.filter(p => p.id !== productData.id).map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                              ))}
                            </CFormSelect>
                            <div className="small text-muted mt-1">Cross-sells are products which you promote in the cart, based on the current product.</div>
                          </CCol>
                        </CRow>
                        {productData.type === 'grouped' && (
                          <CRow className="mb-3">
                            <CFormLabel className="col-sm-4 text-sm-end fw-semibold">Grouped products</CFormLabel>
                            <CCol sm={8}>
                              <CFormSelect
                                multiple
                                id="grouped_products"
                                size="5"
                                value={productData.grouped_products}
                                onChange={(e) => {
                                  const values = Array.from(e.target.selectedOptions, option => parseInt(option.value));
                                  setProductData(prev => ({ ...prev, grouped_products: values }));
                                }}
                              >
                                {allProducts.filter(p => p.id !== productData.id).map(p => (
                                  <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                              </CFormSelect>
                            </CCol>
                          </CRow>
                        )}
                      </CTabPane>
                    </CTabContent>
                  </div>
                </div>
              </CCardBody>
            </CCard>

            <div className="mb-4">
              <CFormLabel className="fw-bold">Short Description</CFormLabel>
              <CFormTextarea
                id="short_description"
                rows="4"
                placeholder="Briefly describe what makes this product great..."
                className="bg-light border-0"
                value={productData.short_description}
                onChange={handleChange}
              ></CFormTextarea>
            </div>
          </CCardBody>
        </CCard>
      </CCol>

      {/* Sidebar Area */}
      <CCol lg={3}>
        <CCard className="mb-4 shadow-sm border-0 bg-white">
          <CCardHeader className="bg-white py-3 fw-bold border-bottom">
            {isEditMode ? 'Update Product' : 'Publish'}
          </CCardHeader>
          <CCardBody>
            <div className="d-flex flex-column gap-2 mb-3">
              <div className="d-flex justify-content-between">
                <span className="text-muted"><CIcon icon={cilSave} className="me-2" /> Status:</span>
                <CBadge color={productData.status === 'publish' ? 'success' : 'info'}>
                  {productData.status === 'publish' ? 'Published' : 'Draft'}
                </CBadge>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted"><CIcon icon={cilSave} className="me-2" /> Visibility:</span>
                <span className="text-info fw-semibold">Public</span>
              </div>
            </div>
          </CCardBody>
          <div className="bg-light p-3 border-top d-flex justify-content-between">
            <CButton color="ghost-secondary" size="sm" onClick={() => setProductData({ ...productData, status: 'draft' })}>Save Draft</CButton>
            <CButton color="primary" onClick={() => {
              setProductData(p => ({ ...p, status: 'publish' }));
              handleSubmit();
            }} disabled={loading} size="sm">
              {loading ? <CSpinner size="sm" /> : (isEditMode ? 'Update' : 'Publish')}
            </CButton>
          </div>
        </CCard>

        <CCard className="mb-4 shadow-sm border-0 text-start">
          <CCardHeader className="bg-white py-3 fw-bold border-bottom">Product Categories</CCardHeader>
          <CCardBody className="px-0 py-2">
            <div className="px-3 mb-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {categories.length === 0 ? (
                <div className="text-muted small px-2">No categories found.</div>
              ) : (
                categories.map(cat => (
                  <CFormCheck
                    key={cat.id}
                    id={`cat-${cat.id}`}
                    label={cat.name}
                    className="mb-1"
                    onChange={() => handleCategoryToggle(cat.id)}
                    checked={productData.categories.some(c => c.id === cat.id)}
                  />
                ))
              )}
            </div>
            <hr className="opacity-10 my-0" />
            <div className="p-3">
              <div className="d-flex gap-2 mb-2">
                <CFormInput
                  size="sm"
                  placeholder="New category name"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                />
              </div>
              <CButton
                variant="ghost"
                color="primary"
                size="sm"
                className="p-0 border-0"
                onClick={handleAddNewCategory}
                disabled={addingCat || !newCatName}
              >
                {addingCat ? <CSpinner size="sm" /> : <><CIcon icon={cilPlus} className="me-1" /> Add new category</>}
              </CButton>
            </div>
          </CCardBody>
        </CCard>

        <CCard className="mb-4 shadow-sm border-0">
          <CCardHeader className="bg-white py-3 fw-bold border-bottom">Product Tags</CCardHeader>
          <CCardBody>
            <CFormInput
              type="text"
              placeholder="Tag 1, Tag 2, Tag 3"
              value={productData.tags_input || ''}
              onChange={(e) => setProductData({ ...productData, tags_input: e.target.value })}
            />
            <div className="small text-muted mt-2">Separate tags with commas</div>
          </CCardBody>
        </CCard>

        <CCard className="mb-4 shadow-sm border-0">
          <CCardHeader className="bg-white py-3 fw-bold border-bottom">Product Image</CCardHeader>
          <CCardBody className="text-center p-4">
            {productData.images && productData.images.length > 0 && !uploadingImage ? (
              <div className="position-relative">
                <img src={productData.images[0].src} alt="Product" className="img-fluid rounded border mb-2" style={{ maxHeight: '200px' }} />
                <CButton
                  color="danger"
                  size="sm"
                  className="position-absolute top-0 end-0 m-1 p-1 rounded-circle shadow"
                  onClick={() => setProductData(prev => ({ ...prev, images: prev.images.slice(1) }))}
                >
                  <CIcon icon={cilTrash} size="sm" />
                </CButton>
              </div>
            ) : (
              <div
                className={`border border-2 border-dashed rounded-3 p-4 bg-light mb-2 transition-all position-relative ${uploadingImage ? '' : 'cursor-pointer hover-bg-white'}`}
                style={{ minHeight: '150px' }}
                onClick={() => !uploadingImage && document.getElementById('feature-image-input').click()}
              >
                {uploadingImage ? (
                  <div className="d-flex flex-column align-items-center justify-content-center h-100 py-3">
                    <CSpinner color="primary" />
                    <div className="small text-muted mt-2 fw-bold">Processing Image...</div>
                  </div>
                ) : (
                  <>
                    <CIcon icon={cilImage} size="xl" className="text-muted mb-2 opacity-25" />
                    <div className="small text-primary fw-bold">Set product image</div>
                  </>
                )}
                <input
                  type="file"
                  id="feature-image-input"
                  hidden
                  onChange={(e) => handleFileUpload(e, false)}
                  accept="image/*"
                />
              </div>
            )}
          </CCardBody>
        </CCard>

        <CCard className="mb-4 shadow-sm border-0">
          <CCardHeader className="bg-white py-3 fw-bold border-bottom">Product Gallery</CCardHeader>
          <CCardBody className="p-3">
            <div className="d-flex flex-wrap gap-2 mb-2">
              {productData.images.slice(1).map((img, idx) => (
                <div key={idx} className="position-relative" style={{ width: '60px', height: '60px' }}>
                  <img src={img.src} alt="Gallery" className="w-100 h-100 rounded border object-fit-cover shadow-sm" />
                  <CButton
                    color="danger"
                    size="sm"
                    className="position-absolute top-0 end-0 p-0 rounded-circle shadow"
                    style={{ marginTop: '-5px', marginRight: '-5px', width: '18px', height: '18px' }}
                    onClick={() => {
                      const newImages = [...productData.images];
                      newImages.splice(idx + 1, 1);
                      setProductData(prev => ({ ...prev, images: newImages }));
                    }}
                  >
                    ×
                  </CButton>
                </div>
              ))}
              <div
                className={`bg-light rounded d-flex align-items-center justify-content-center transition-all ${uploadingGallery ? '' : 'cursor-pointer border-dashed'}`}
                style={{ width: '60px', height: '60px', border: uploadingGallery ? 'none' : '1px dashed #ccc' }}
                onClick={() => !uploadingGallery && document.getElementById('gallery-image-input').click()}
              >
                {uploadingGallery ? (
                  <CSpinner size="sm" color="primary" />
                ) : (
                  <CIcon icon={cilPlus} className="text-muted" />
                )}
                <input
                  type="file"
                  id="gallery-image-input"
                  hidden
                  multiple
                  onChange={(e) => handleFileUpload(e, true)}
                  accept="image/*"
                />
              </div>
            </div>
            <div
              className={`small fw-bold mt-2 ${uploadingGallery ? 'text-muted' : 'text-primary cursor-pointer'}`}
              onClick={() => !uploadingGallery && document.getElementById('gallery-image-input').click()}
            >
              {uploadingGallery ? 'Uploading gallery...' : 'Add product gallery images'}
            </div>
          </CCardBody>
        </CCard>
      </CCol>

      <style>
        {`
        .no-focus-outline:focus {
          outline: none;
          box-shadow: none;
          border-bottom-color: var(--cui-primary) !important;
        }
        .cursor-pointer { cursor: pointer; }
        .hover-bg-white:hover { background-color: #fff !important; border-color: var(--cui-primary) !important; }
        .transition-all { transition: all 0.2s ease-in-out; }
        .border-start-4 { border-left-width: 4px !important; }
        `}
      </style>

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
    </CRow>
  )
}

export default AddProduct
