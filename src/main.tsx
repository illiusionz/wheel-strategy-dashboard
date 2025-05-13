import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import 'swiper/swiper-bundle.css';
import 'simplebar-react/dist/simplebar.min.css';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import App from './App.tsx';
import { AppWrapper } from './components/common/PageMeta.tsx';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { QueryProvider } from './context/QueryProvider.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryProvider>
      <ThemeProvider>
        <AppWrapper>
          <App />
        </AppWrapper>
      </ThemeProvider>
    </QueryProvider>
  </StrictMode>
);
