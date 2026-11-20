import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { Legal } from './pages/Legal'
import { PortfolioGallery } from './pages/PortfolioGallery'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="legal/:slug" element={<Legal />} />
          <Route path="portfolio/:category" element={<PortfolioGallery />} />
          <Route path="services" element={<Navigate to="/#services" replace />} />
          <Route path="taxi" element={<Navigate to="/#taxi" replace />} />
          <Route path="events" element={<Navigate to="/#events" replace />} />
          <Route path="packages" element={<Navigate to="/#packages" replace />} />
          <Route path="estimator" element={<Navigate to="/#estimator" replace />} />
          <Route path="connect" element={<Navigate to="/#connect" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
