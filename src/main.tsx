import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { I18nProvider } from './i18n'

createRoot(document.getElementById('root')!).render(
  <I18nProvider>
    <HashRouter>
      <App />
    </HashRouter>
  </I18nProvider>,
)
// Redeploy trigger 1777712899
