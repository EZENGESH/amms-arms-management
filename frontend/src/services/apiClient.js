import axios from 'axios';
const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(
          'http://localhost:8000/api/auth/token/refresh/',
          { refresh: refreshToken }
        );
        
        localStorage.setItem('access_token', response.data.access);
        originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
        return api(originalRequest);
      } catch (err) {
        console.error('Refresh token failed:', err);
        // Redirect to login or handle logout
      }
    }
    
    return Promise.reject(error);
  }
);


const USE_MOCK_API = false; // Ensure this is set to true

if (USE_MOCK_API) {
  const setupMock = async () => {
    const MockAdapter = (await import('axios-mock-adapter')).default;
    const mock = new MockAdapter(api, { delayResponse: 500 });

    // Mock login
    mock.onPost('/auth/login/').reply((config) => {
      let credentials;
      try {
        credentials = JSON.parse(config.data);
      } catch (e) {
        return [400, { message: 'Invalid JSON' }];
      }

      const { username, password } = credentials;

      if (username === 'admin' && password === 'admin') {
        return [200, { user: { username: 'admin', role: 'admin' }, token: 'mock-token' }];
      }

      return [401, { message: 'Invalid credentials' }];
    });

    // Mock inventory
    mock.onGet('/inventory/').reply((config) => {
      const authHeader = config.headers.Authorization;

      if (!authHeader || authHeader !== 'Bearer mock-token') {
        return [401, { message: 'Unauthorized' }];
      }

      return [
        200,
        [
          { id: 1, name: 'AK-47', category: 'Rifle', stock: 20 },
          { id: 2, name: 'M4 Carbine', category: 'Rifle', stock: 15 },
          { id: 3, name: 'Glock 17', category: 'Handgun', stock: 30 },
        ],
      ];
    });

    // Mock reports
    mock.onGet('/reports/').reply(200, [
      { id: 1, title: 'Monthly Report' },
      { id: 2, title: 'Annual Report' },
      { id: 3, title: 'Inventory Report' },
    ]);
  };

  setupMock();
}

export default api;