import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './pages/App';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Prices from './pages/Prices';
import Weather from './pages/Weather';
import Subscription from './pages/Subscription';
import './index.css';

const router = createBrowserRouter([
  { path: '/', element: <App />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'prices', element: <Prices /> },
      { path: 'weather', element: <Weather /> },
      { path: 'subscription', element: <Subscription /> }
    ]
  },
  { path: '/login', element: <Login /> },
  { path: '/signup', element: <Signup /> },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);