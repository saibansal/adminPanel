/**
 * Application Routes Configuration
 *
 * Defines all protected routes in the application using React lazy loading
 * for code splitting and performance optimization.
 *
 * Each route object contains:
 * - path: URL path for the route
 * - name: Human-readable name for breadcrumbs
 * - element: Lazy-loaded React component
 * - exact: (optional) Requires exact path match
 *
 * @module routes
 */

import React from 'react'

// Products
const AllProducts = React.lazy(() => import('./views/products/all/AllProducts'))
const AddProduct = React.lazy(() => import('./views/products/add/AddProduct'))
const Brands = React.lazy(() => import('./views/products/brands/Brands'))
const Categories = React.lazy(() => import('./views/products/categories/index'))
const Tags = React.lazy(() => import('./views/products/tags/Tags'))
const Attributes = React.lazy(() => import('./views/products/attributes/Attributes'))

// Coupons
const AllCoupons = React.lazy(() => import('./views/coupons/AllCoupons'))
const AddCoupon = React.lazy(() => import('./views/coupons/AddCoupon'))

// Posts
const AllPosts = React.lazy(() => import('./views/posts/AllPosts'))
const AddPost = React.lazy(() => import('./views/posts/AddPost'))

// Pages
const AllPages = React.lazy(() => import('./views/pages/AllPages'))
const AddPage = React.lazy(() => import('./views/pages/AddPage'))

// Profile
const Profile = React.lazy(() => import('./views/pages/profile/Profile'))

// Users
const AllUsers = React.lazy(() => import('./views/users/AllUsers'))
const AddUser = React.lazy(() => import('./views/users/AddUser'))
const Roles = React.lazy(() => import('./views/users/Roles'))

// Store Management
const AllOrders = React.lazy(() => import('./views/store/AllOrders'))
const AllCustomers = React.lazy(() => import('./views/store/AllCustomers'))
const StoreReports = React.lazy(() => import('./views/store/StoreReports'))
const StoreSettings = React.lazy(() => import('./views/store/StoreSettings'))
const StoreStatus = React.lazy(() => import('./views/store/StoreStatus'))
const StoreExtensions = React.lazy(() => import('./views/store/StoreExtensions'))

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/profile', name: 'Profile', element: Profile },
  { path: '/account', name: 'Account Settings', element: Profile },

  // Store Management
  { path: '/orders', name: 'Orders', element: AllOrders, exact: true },
  { path: '/orders/all', name: 'All Orders', element: AllOrders },
  { path: '/customers/all', name: 'Customers', element: AllCustomers },
  { path: '/reports', name: 'Reports', element: StoreReports },
  { path: '/settings', name: 'Settings', element: StoreSettings },
  { path: '/status', name: 'Status', element: StoreStatus },
  { path: '/extensions', name: 'Extensions', element: StoreExtensions },

  // Users
  { path: '/users', name: 'Users', element: AllUsers, exact: true },
  { path: '/users/all', name: 'All Users', element: AllUsers },
  { path: '/users/add', name: 'Add User', element: AddUser },
  { path: '/users/edit/:id', name: 'Edit User', element: AddUser },
  { path: '/users/roles', name: 'User Roles', element: Roles },

  { path: '/products', name: 'Products', element: AllProducts, exact: true },
  { path: '/products/all', name: 'All Products', element: AllProducts },
  { path: '/products/add', name: 'Add Product', element: AddProduct },
  { path: '/products/edit/:id', name: 'Edit Product', element: AddProduct },
  { path: '/products/brands', name: 'Brands', element: Brands },
  { path: '/products/categories', name: 'Categories', element: Categories },
  { path: '/products/tags', name: 'Tags', element: Tags },
  { path: '/products/attributes', name: 'Attributes', element: Attributes },
  
  // Coupons
  { path: '/coupons', name: 'Coupons', element: AllCoupons, exact: true },
  { path: '/coupons/all', name: 'All Coupons', element: AllCoupons },
  { path: '/coupons/add', name: 'Add Coupon', element: AddCoupon },
  { path: '/coupons/edit/:id', name: 'Edit Coupon', element: AddCoupon },

  // Posts
  { path: '/posts', name: 'Posts', element: AllPosts, exact: true },
  { path: '/posts/all', name: 'All Posts', element: AllPosts },
  { path: '/posts/add', name: 'Add Post', element: AddPost },
  { path: '/posts/edit/:id', name: 'Edit Post', element: AddPost },

  // Pages
  { path: '/pages', name: 'Pages', element: AllPages, exact: true },
  { path: '/pages/all', name: 'All Pages', element: AllPages },
  { path: '/pages/add', name: 'Add Page', element: AddPage },
  { path: '/pages/edit/:id', name: 'Edit Page', element: AddPage },
]

export default routes
