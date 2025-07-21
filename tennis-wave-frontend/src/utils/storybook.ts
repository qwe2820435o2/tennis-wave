/**
 * Check if the current environment is Storybook
 * @returns boolean indicating if we're in Storybook environment
 */
export const isStorybook = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  
  return (
    window.location.href.includes('storybook') || 
    window.location.href.includes('localhost:6006') ||
    window.location.href.includes('6006')
  );
};

/**
 * Get a mock router for Storybook environment
 * @returns mock router object
 */
export const getMockRouter = () => ({
  push: () => {},
  replace: () => {},
  back: () => {},
  forward: () => {},
  refresh: () => {},
  prefetch: () => {},
});

/**
 * Get a mock pathname for Storybook environment
 * @returns default pathname
 */
export const getMockPathname = (): string => '/'; 