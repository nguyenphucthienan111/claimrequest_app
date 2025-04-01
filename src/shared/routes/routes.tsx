import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "../../modules/auth/hooks/useAuth";
import { userRoutes } from "../../modules/users/routes";
import { adminRoutes } from "../../modules/admin/routes";
import { financeRoutes } from "../../modules/finance/routes";
import { approvalRoutes } from "../../modules/approval/routes";
import { commonRoutes } from "../../modules/common/routes";
import { PreloaderProvider, usePreloader } from "../hooks/usePreloader";
import { useEffect } from "react";

const PageLoader: React.FC = () => {
  const { setLoading, visitedPages, markPageAsVisited } = usePreloader();
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;

    if (!visitedPages.has(path)) {
      setLoading(true);
      markPageAsVisited(path);
      const randomDelay = Math.random() * (2000 - 1000) + 1000;
      setTimeout(() => setLoading(false), randomDelay);
    }
  }, [location.pathname]);

  return null;
};

const AppRoutes = () => {

  return (
    <AuthProvider>
      <PreloaderProvider>
        <Router>
          <PageLoader />
          <Routes>
            {/* Import route từ các module */}
            {commonRoutes.map((route, index) => (
              <Route key={index} path={route.path} element={route.element}>
                {route.children?.map((child, childIndex) => (
                  <Route
                    key={childIndex}
                    path={child.path}
                    element={child.element}
                  />
                ))}
              </Route>
            ))}

            {adminRoutes.map((route, index) => (
              <Route key={index} path={route.path} element={route.element}>
                {route.children?.map((child, childIndex) => (
                  <Route
                    key={childIndex}
                    path={child.path}
                    element={child.element}
                  />
                ))}
              </Route>
            ))}

            {userRoutes.map((route, index) => (
              <Route key={index} path={route.path} element={route.element}>
                {route.children?.map((child, childIndex) => (
                  <Route
                    key={childIndex}
                    path={child.path}
                    element={child.element}
                  />
                ))}
              </Route>
            ))}

            {approvalRoutes.map((route, index) => (
              <Route key={index} path={route.path} element={route.element}>
                {route.children?.map((child, childIndex) => (
                  <Route
                    key={childIndex}
                    path={child.path}
                    element={child.element}
                  />
                ))}
              </Route>
            ))}

            {financeRoutes.map((route, index) => (
              <Route key={index} path={route.path} element={route.element}>
                {route.children?.map((child, childIndex) => (
                  <Route
                    key={childIndex}
                    path={child.path}
                    element={child.element}
                  />
                ))}
              </Route>
            ))}
          </Routes>
        </Router>
      </PreloaderProvider>
    </AuthProvider>
  )
};

export default AppRoutes;