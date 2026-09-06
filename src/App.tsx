import { RouterProvider } from 'react-router'
import { router } from './routes'

/**
 * The app is only the router: providers live in RootLayout so that they are
 * inside the router's tree and can therefore use hooks like `useNavigate`.
 */
export function App() {
  return <RouterProvider router={router} />
}
