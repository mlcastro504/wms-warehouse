import { Toaster } from '@radix-ui/react-toast';
import { ThemeProvider } from './components/theme-provider';
import { Outlet } from 'react-router-dom';

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Toaster />
      <Outlet />
    </ThemeProvider>
  );
}

export default App;
