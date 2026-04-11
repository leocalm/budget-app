import { ErrorBoundary } from './components/ErrorBoundary';
import { Router } from './Router';

import './global.css';

export default function App() {
  return (
    <ErrorBoundary>
      <Router />
    </ErrorBoundary>
  );
}
