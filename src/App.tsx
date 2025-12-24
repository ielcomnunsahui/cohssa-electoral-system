import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { GlobalAuthDialog } from "@/components/GlobalAuthDialog";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import AdminLogin from "./pages/AdminLogin";
import AdminResetPassword from "./pages/AdminResetPassword";
import AdminDashboard from "./pages/AdminDashboard";
import Committee from "./pages/Committee";
import VoterRegister from "./pages/VoterRegister";
import VoterLogin from "./pages/VoterLogin";
import AspirantLogin from "./pages/AspirantLogin";
import Rules from "./pages/Rules";
import Candidates from "./pages/Candidates";
import Support from "./pages/Support";
import VoterHelpDesk from "./pages/VoterHelpDesk";
import Demo from "./pages/Demo";
import Results from "./pages/Results";
import NotFound from "./pages/NotFound";
import StudentList from "./pages/admin/StudentList";
import AspirantReview from "./pages/admin/AspirantReview";
import AspirantDetail from "./pages/admin/AspirantDetail";
import CandidateManagement from "./pages/admin/CandidateManagement";
import PositionManagement from "./pages/admin/PositionManagement";
import TimelineManagement from "./pages/admin/TimelineManagement";
import LiveControl from "./pages/admin/LiveControl";
import AdminActivityDashboard from "./pages/admin/AdminActivityDashboard";
import VoterManagement from "./pages/admin/VoterManagement";
import VoterDashboard from "./pages/VoterDashboard";
import AspirantDashboard from "./pages/aspirant/AspirantDashboard";
import ApplicationWizard from "./pages/aspirant/ApplicationWizard";
import StudentPortal from "./pages/StudentPortal";
import AboutCollege from "./pages/AboutCollege";
import AboutCOHSSA from "./pages/AboutCOHSSA";
import Editorial from "./pages/Editorial";
import ContentManagement from "./pages/admin/ContentManagement";
import ResourceManagement from "./pages/admin/ResourceManagement";
import TextbookManagement from "./pages/admin/TextbookManagement";
import EventsManagement from "./pages/admin/EventsManagement";
import EditorialReview from "./pages/admin/EditorialReview";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <GlobalAuthDialog />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/reset-password" element={<AdminResetPassword />} />
              <Route 
                path="/admin/dashboard" 
                element={
                  <ProtectedRoute requiredRole="admin" redirectTo="/admin/login">
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/students" 
                element={
                  <ProtectedRoute requiredRole="admin" redirectTo="/admin/login">
                    <StudentList />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/aspirants" 
                element={
                  <ProtectedRoute requiredRole="admin" redirectTo="/admin/login">
                    <AspirantReview />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/aspirants/:id" 
                element={
                  <ProtectedRoute requiredRole="admin" redirectTo="/admin/login">
                    <AspirantDetail />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/candidates" 
                element={
                  <ProtectedRoute requiredRole="admin" redirectTo="/admin/login">
                    <CandidateManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/positions" 
                element={
                  <ProtectedRoute requiredRole="admin" redirectTo="/admin/login">
                    <PositionManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/timeline" 
                element={
                  <ProtectedRoute requiredRole="admin" redirectTo="/admin/login">
                    <TimelineManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/live-control" 
                element={
                  <ProtectedRoute requiredRole="admin" redirectTo="/admin/login">
                    <LiveControl />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/activity" 
                element={
                  <ProtectedRoute requiredRole="admin" redirectTo="/admin/login">
                    <AdminActivityDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/voters" 
                element={
                  <ProtectedRoute requiredRole="admin" redirectTo="/admin/login">
                    <VoterManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/content" 
                element={
                  <ProtectedRoute requiredRole="admin" redirectTo="/admin/login">
                    <ContentManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/resources" 
                element={
                  <ProtectedRoute requiredRole="admin" redirectTo="/admin/login">
                    <ResourceManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/textbooks" 
                element={
                  <ProtectedRoute requiredRole="admin" redirectTo="/admin/login">
                    <TextbookManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/events" 
                element={
                  <ProtectedRoute requiredRole="admin" redirectTo="/admin/login">
                    <EventsManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/editorial" 
                element={
                  <ProtectedRoute requiredRole="admin" redirectTo="/admin/login">
                    <EditorialReview />
                  </ProtectedRoute>
                } 
              />
              <Route path="/committee" element={<Committee />} />
              <Route path="/voter/register" element={<VoterRegister />} />
              <Route path="/voter/login" element={<VoterLogin />} />
              <Route path="/voter/help" element={<VoterHelpDesk />} />
              <Route 
                path="/voter/dashboard" 
                element={
                  <ProtectedRoute redirectTo="/voter/login">
                    <VoterDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route path="/aspirant/login" element={<AspirantLogin />} />
              <Route 
                path="/aspirant/dashboard" 
                element={
                  <ProtectedRoute redirectTo="/aspirant/login">
                    <AspirantDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/aspirant/apply" 
                element={
                  <ProtectedRoute redirectTo="/aspirant/login">
                    <ApplicationWizard />
                  </ProtectedRoute>
                } 
              />
              <Route path="/rules" element={<Rules />} />
              <Route path="/candidates" element={<Candidates />} />
              <Route path="/support" element={<Support />} />
              <Route path="/demo" element={<Demo />} />
              <Route path="/results" element={<Results />} />
              <Route path="/portal" element={<StudentPortal />} />
              <Route path="/about/college" element={<AboutCollege />} />
              <Route path="/about/cohssa" element={<AboutCOHSSA />} />
              <Route path="/editorial" element={<Editorial />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;