import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ConversationProvider } from '@elevenlabs/react'
import './index.css'
import App from './App.tsx'
import { GameProvider } from './store/GameStore.tsx'
import ErrorBoundary from './components/ErrorBoundary.tsx'
import { LanguageProvider } from './lib/lang.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <LanguageProvider>
          <GameProvider>
            <ConversationProvider>
              <App />
            </ConversationProvider>
          </GameProvider>
        </LanguageProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)
