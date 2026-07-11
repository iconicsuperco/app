import { Navigate } from 'react-router-dom'
import type { RouteObject } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { LibraryPage } from './pages/LibraryPage'

export const routes: RouteObject[] = [
  { path: '/', element: <Navigate to="/library" replace /> },
  { path: '/library', element: <LibraryPage /> },
  { path: '/home', element: <HomePage /> },
]
