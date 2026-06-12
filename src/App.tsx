import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Navbar } from './components/Navbar'
import { Login } from './pages/Login'
import { Signup } from './pages/Signup'
import { Landing } from './pages/Landing'
import { Dashboard } from './pages/Dashboard'
import { Businesses } from './pages/Businesses'
import { CreateBusiness } from './pages/CreateBusiness'
import { BusinessDetail } from './pages/BusinessDetail'
import { Segments } from './pages/SegmentsPage'
import { Campaigns } from './pages/CampaignsPage'
import { CampaignDetail } from './pages/CampaignDetail'
import { Analytics } from './pages/Analytics'

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-area">{children}</main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
        <Route path="/businesses" element={<ProtectedRoute><AppLayout><Businesses /></AppLayout></ProtectedRoute>} />
        <Route path="/businesses/new" element={<ProtectedRoute><AppLayout><CreateBusiness /></AppLayout></ProtectedRoute>} />
        <Route path="/businesses/:businessId" element={<ProtectedRoute><AppLayout><BusinessDetail /></AppLayout></ProtectedRoute>} />
        <Route path="/businesses/:businessId/campaigns/:campaignId" element={<ProtectedRoute><AppLayout><CampaignDetail /></AppLayout></ProtectedRoute>} />
        <Route path="/segments" element={<ProtectedRoute><AppLayout><Segments /></AppLayout></ProtectedRoute>} />
        <Route path="/campaigns" element={<ProtectedRoute><AppLayout><Campaigns /></AppLayout></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><AppLayout><Analytics /></AppLayout></ProtectedRoute>} />
        <Route path="/businesses/:businessId/analytics" element={<ProtectedRoute><AppLayout><Analytics /></AppLayout></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}
