import { lazy, StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

const App = lazy(() => import('./App.tsx'))
const SystemAdminApp = lazy(() => import('./SystemAdminApp.tsx'))
const SignupApp = lazy(() => import('./SignupApp.tsx'))
const SubscriptionApp = lazy(() => import('./SubscriptionApp.tsx'))

const path = window.location.pathname;

// TODO: 실서버 연동 시 운영자 권한(Admin Role) 검증 로직 추가 예정
const isSystemAdminRoute = path.startsWith('/admin');
const isSignupRoute = path.startsWith('/signup');
const isSubscriptionRoute = path.startsWith('/subscription');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={null}>
      {isSystemAdminRoute ? <SystemAdminApp /> : isSignupRoute ? <SignupApp /> : isSubscriptionRoute ? <SubscriptionApp /> : <App />}
    </Suspense>
  </StrictMode>,
)
