import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./MainLayout";
import NewsHome from "./NewsHome";
import ArticleDetail from "./pages/ArticleDetails";
import AdminDashboard from "./pages/AdminDashboard";
import SearchResults from "./SearchResults";
import LoginPage from "./auth/LoginPage";
import SignupPage from "./auth/SignupPage";
import { ProtectedRoute } from "./ProtectedRoute";
import AdsDetails from "./pages/AdsDetails";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          {/* These will appear inside the <Outlet /> of MainLayout */}
          <Route index element={<NewsHome />} />
          <Route path="/category/:categoryName" element={<NewsHome />} />
          <Route path="/article/:slug" element={<ArticleDetail />} />
          <Route path="/ad-details/:id" element={<AdsDetails />} />

          {/* Admin Route */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
