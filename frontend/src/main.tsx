import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import './utils/logger';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      onError: (error) => {
        import('./utils/logger').then(({ logError }) => {
          logError(error as Error);
        });
      }
    }
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </I18nextProvider>
  </React.StrictMode>
);
