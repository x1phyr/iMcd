import { Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/layout'
import { HomePage, CouponsPage, CampaignsPage, SettingsPage } from '@/pages'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/coupons" element={<CouponsPage />} />
        <Route path="/campaigns" element={<CampaignsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  )
}
