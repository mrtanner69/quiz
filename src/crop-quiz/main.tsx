import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import CropQuiz from './CropQuiz.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CropQuiz />
  </StrictMode>,
)
