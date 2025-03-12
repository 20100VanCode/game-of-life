import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Function to prevent default scrolling behavior
const preventScrolling = () => {
  // Prevent touchmove events
  document.addEventListener('touchmove', (e) => {
    e.preventDefault();
  }, { passive: false });
  
  // Prevent scroll events
  document.addEventListener('scroll', (e) => {
    e.preventDefault();
    window.scrollTo(0, 0);
  }, { passive: false });
  
  // Lock viewport to prevent user scaling
  const viewportMeta = document.querySelector('meta[name="viewport"]');
  if (viewportMeta) {
    viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
  } else {
    // Create viewport meta if it doesn't exist
    const meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    document.head.appendChild(meta);
  }
};

// Initialize scroll prevention when the component mounts
const AppWithScrollPrevention = () => {
  useEffect(() => {
    preventScrolling();
  }, []);

  return <App />;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppWithScrollPrevention />
  </StrictMode>,
);
