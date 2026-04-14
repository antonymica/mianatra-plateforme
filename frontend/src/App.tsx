import { Toaster } from 'react-hot-toast';

import { AppRoutes } from './routes/AppRoutes';
import { AuthProvider } from './hooks/useAuth';

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          className: 'text-sm',
        }}
      />
    </AuthProvider>
  );
}

export default App;
