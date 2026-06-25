import { Suspense, lazy, useEffect, useRef } from "react";
import { Redirect, Route, Switch, useLocation, useParams } from "wouter";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrandingProvider } from "@/components/shared/branding-provider";
import { CookieConsentBanner } from "@/components/shared/cookie-consent-banner";
import { ProtectedRoute } from "@/components/shared/protected-route";
import { queryClient } from "@/lib/queryClient";
import NotFound from "@/pages/not-found";

const CmsHybridPage = lazy(() =>
  import("@/features/public/cms-hybrid-page").then((module) => ({
    default: module.CmsHybridPage,
  })),
);
const CmsPreviewPage = lazy(() => import("@/features/public/cms-preview-page"));
const StandaloneFormPage = lazy(() => import("@/features/public/standalone-form-page"));

const LoginPage = lazy(() => import("@/features/auth/login-page"));
const ForgotPasswordPage = lazy(() => import("@/features/auth/forgot-password-page"));
const ResetPasswordPage = lazy(() => import("@/features/auth/reset-password-page"));
const AdminSetupPage = lazy(() => import("@/features/auth/admin-setup-page"));

const AdminDashboardPage = lazy(() => import("@/features/admin/dashboard-page"));
const AdminUsersPage = lazy(() => import("@/features/admin/users-page"));
const AdminFormsPage = lazy(() => import("@/features/admin/forms-page"));
const DocsPage = lazy(() => import("@/features/admin/docs-page"));
const AdminSettingsPage = lazy(() => import("@/features/admin/settings-page"));
const AdminDesignPage = lazy(() => import("@/features/admin/design-page"));
const CmsOverviewPage = lazy(() => import("@/features/admin/cms/cms-overview-page"));
const CmsPagesPage = lazy(() => import("@/features/admin/cms/cms-pages-page"));
const CmsPageEditorPage = lazy(() => import("@/features/admin/cms/cms-page-editor-page"));
const CmsMediaPage = lazy(() => import("@/features/admin/cms/cms-media-page"));
const CmsSeoPage = lazy(() => import("@/features/admin/cms/cms-seo-page"));
const CmsSectionsPage = lazy(() => import("@/features/admin/cms/cms-sections-page"));
const CmsSectionEditorPage = lazy(() => import("@/features/admin/cms/cms-section-editor-page"));
const CmsMenusPage = lazy(() => import("@/features/admin/cms/cms-menus-page"));
const CmsSidebarsPage = lazy(() => import("@/features/admin/cms/cms-sidebars-page"));
const SystemBackupsPage = lazy(() => import("@/features/admin/system-backups-page"));

function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center" data-testid="page-loader">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}

function CmsSlugRoute() {
  const params = useParams<{ slug?: string }>();
  return <CmsHybridPage slug={params.slug || "home"} fallback={<NotFound />} />;
}

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/" component={() => <CmsHybridPage slug="home" fallback={<NotFound />} />} />
        <Route path="/preview/cms/:id" component={CmsPreviewPage} />
        <Route path="/forms/:slug" component={StandaloneFormPage} />
        <Route path="/auth/login" component={LoginPage} />
        <Route path="/auth/register">
          <Redirect to="/auth/login" replace />
        </Route>
        <Route path="/auth/forgot-password" component={ForgotPasswordPage} />
        <Route path="/auth/reset-password" component={ResetPasswordPage} />
        <Route path="/setup" component={AdminSetupPage} />

        <Route path="/admin">
          <ProtectedRoute roles={["admin", "editor"]}>
            <AdminDashboardPage />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/users">
          <ProtectedRoute roles={["admin"]}>
            <AdminUsersPage />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/forms">
          <ProtectedRoute roles={["admin", "editor"]} adminPermissions={["content"]}>
            <AdminFormsPage />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/docs">
          <ProtectedRoute roles={["admin"]}>
            <DocsPage />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/settings">
          <ProtectedRoute roles={["admin"]}>
            <AdminSettingsPage />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/design">
          <Redirect to="/admin/design/branding" />
        </Route>
        <Route path="/admin/design/branding">
          <ProtectedRoute roles={["admin", "editor"]} adminPermissions={["design"]}>
            <AdminDesignPage initialSubview="branding" />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/design/colors">
          <ProtectedRoute roles={["admin", "editor"]} adminPermissions={["design"]}>
            <AdminDesignPage initialSubview="colors" />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/design/typography">
          <ProtectedRoute roles={["admin", "editor"]} adminPermissions={["design"]}>
            <AdminDesignPage initialSubview="typography" />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/system/backups">
          <ProtectedRoute roles={["admin"]}>
            <SystemBackupsPage />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/cms">
          <ProtectedRoute roles={["admin", "editor"]} adminPermissions={["content"]}>
            <CmsOverviewPage />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/cms/pages/new">
          <ProtectedRoute roles={["admin", "editor"]} adminPermissions={["content"]}>
            <CmsPageEditorPage />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/cms/pages/:id">
          <ProtectedRoute roles={["admin", "editor"]} adminPermissions={["content"]}>
            <CmsPageEditorPage />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/cms/pages">
          <ProtectedRoute roles={["admin", "editor"]} adminPermissions={["content"]}>
            <CmsPagesPage />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/cms/media">
          <ProtectedRoute roles={["admin", "editor"]} adminPermissions={["content"]}>
            <CmsMediaPage />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/cms/sections/new">
          <ProtectedRoute roles={["admin", "editor"]} adminPermissions={["content", "design"]}>
            <CmsSectionEditorPage />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/cms/sections/:id">
          <ProtectedRoute roles={["admin", "editor"]} adminPermissions={["content", "design"]}>
            <CmsSectionEditorPage />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/cms/sections">
          <ProtectedRoute roles={["admin", "editor"]} adminPermissions={["content", "design"]}>
            <CmsSectionsPage />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/cms/seo">
          <ProtectedRoute roles={["admin", "editor"]} adminPermissions={["content"]}>
            <CmsSeoPage />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/cms/menus">
          <ProtectedRoute roles={["admin", "editor"]} adminPermissions={["design"]}>
            <CmsMenusPage />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/cms/sidebars">
          <ProtectedRoute roles={["admin", "editor"]} adminPermissions={["design"]}>
            <CmsSidebarsPage />
          </ProtectedRoute>
        </Route>

        <Route path="/:slug" component={CmsSlugRoute} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function SetupGuard({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { data: setupStatus, isLoading, isError } = useQuery<{ needsSetup: boolean }>({
    queryKey: ["/api/setup/status"],
    staleTime: 60_000,
    retry: 2,
  });

  const needsSetup = setupStatus?.needsSetup === true || (isError && !setupStatus);

  useEffect(() => {
    if (needsSetup && location !== "/setup") {
      setLocation("/setup");
    }
  }, [needsSetup, location, setLocation]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center" data-testid="setup-guard-loading">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <>{children}</>;
}

function RouteScrollManager() {
  const [location] = useLocation();
  const lastPathnameRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("scrollRestoration" in window.history)) return;
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    return () => {
      window.history.scrollRestoration = previous;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const pathname = location.split(/[?#]/)[0] || "/";
    const lastPathname = lastPathnameRef.current;
    lastPathnameRef.current = pathname;
    if (lastPathname === null || lastPathname === pathname) return;

    const frame = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: "auto" }));
    });

    return () => window.cancelAnimationFrame(frame);
  }, [location]);

  return null;
}

function RouteAdminModeManager() {
  const [location] = useLocation();

  useEffect(() => {
    if (typeof document === "undefined") return;
    const pathname = location.split(/[?#]/)[0] || "/";
    const root = document.documentElement;
    root.classList.toggle("admin-mode", pathname.startsWith("/admin"));
    return () => root.classList.remove("admin-mode");
  }, [location]);

  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrandingProvider>
        <TooltipProvider>
          <Toaster />
          <SetupGuard>
            <RouteAdminModeManager />
            <RouteScrollManager />
            <Router />
            <CookieConsentBanner />
          </SetupGuard>
        </TooltipProvider>
      </BrandingProvider>
    </QueryClientProvider>
  );
}

export default App;
