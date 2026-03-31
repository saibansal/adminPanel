/**
 * WordPress API Configuration
 * 
 * Update these values with your actual site URL and WooCommerce credentials.
 * To get WooCommerce keys: WP Dashboard > WooCommerce > Settings > Advanced > REST API.
 */

const API_CONFIG = {
  // Use Vercel Environment Variables or fallback to Local Sync
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost/wordpress/wordpress-backend/wp-json/',


  //   {
  //   "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vbG9jYWxob3N0L3dvcmRwcmVzcy93b3JkcHJlc3MtYmFja2VuZCIsImlhdCI6MTc3NDQ0MDM5MiwibmJmIjoxNzc0NDQwMzkyLCJleHAiOjE3NzUwNDUxOTIsImRhdGEiOnsidXNlciI6eyJpZCI6IjEifX19.zgfwpb6tau74qoihFl6Se6PGgIvkZbtbffGHpKFqcyE",
  //   "user_email": "vishal@vismaad.com",
  //   "user_nicename": "admin",
  //   "user_display_name": "admin"
  // }


  CONSUMER_KEY: import.meta.env.VITE_CONSUMER_KEY || 'ck_2e385c7db77c3e2afab7ac9df70378c7a29e4df1',
  CONSUMER_SECRET: import.meta.env.VITE_CONSUMER_SECRET || 'cs_e1992fe48b1f17ac2cc19da72cb0b121d77a6905',

  getToken: () => localStorage.getItem('jwt_token'),
  getUser: () => JSON.parse(localStorage.getItem('user_info') || '{}'),

  getBasicAuthHeader: () => {
    return 'Basic ' + btoa(`${API_CONFIG.CONSUMER_KEY}:${API_CONFIG.CONSUMER_SECRET}`);
  },

  getJWTHeader: () => {
    const token = API_CONFIG.getToken();
    return token ? `Bearer ${token}` : '';
  },

  logout: () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_info');
    window.location.href = '#/login';
  }
};

export default API_CONFIG;