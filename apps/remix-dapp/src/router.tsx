import { createBrowserRouter } from 'react-router-dom';
import HomePage from './pages/Home';

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
]);

export default router;
