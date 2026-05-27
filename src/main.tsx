import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import SystemAdminApp from './SystemAdminApp.tsx'
import SignupApp from './SignupApp.tsx'

const path = window.location.pathname;

// TODO: 실서버 연동 시 운영자 권한(Admin Role) 검증 로직 추가 예정
const isSystemAdminRoute = path.startsWith('/admin');
const isSignupRoute = path.startsWith('/signup');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isSystemAdminRoute ? <SystemAdminApp /> : isSignupRoute ? <SignupApp /> : <App />}
  </StrictMode>,
)
