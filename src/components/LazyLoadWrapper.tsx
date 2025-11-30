import { Suspense, ComponentType } from 'react';
import { LoadingSkeleton } from './LoadingSkeleton';

interface LazyLoadWrapperProps {
  Component: ComponentType<any>;
  fallback?: React.ReactNode;
  [key: string]: any;
}

/**
 * Wrapper component for lazy-loaded components with loading fallback
 * Provides consistent loading experience across all lazy-loaded components
 */
export function LazyLoadWrapper({ 
  Component, 
  fallback, 
  ...props 
}: LazyLoadWrapperProps) {
  return (
    <Suspense fallback={fallback || <LoadingSkeleton />}>
      <Component {...props} />
    </Suspense>
  );
}

/**
 * Custom loading fallback for specific component types
 */
export function ModalLoadingFallback() {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-8 border border-gray-700 shadow-2xl">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
        <p className="text-gray-400 mt-4">Loading...</p>
      </div>
    </div>
  );
}

/**
 * Loading fallback for game components
 */
export function GameLoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-24 h-24 mx-auto mb-6">
          {/* Dice animation */}
          <div className="absolute inset-0 bg-red-600 rounded-lg animate-pulse"></div>
          <div className="absolute inset-2 bg-white rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-red-600 rounded-full"></div>
          </div>
        </div>
        <h2 className="text-2xl text-white mb-2">Loading Casino Table...</h2>
        <p className="text-gray-400">Preparing your gaming experience</p>
      </div>
    </div>
  );
}

/**
 * Loading fallback for settings/menu components
 */
export function SettingsLoadingFallback() {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-700 w-full max-w-2xl mx-4">
        <div className="space-y-4">
          <div className="h-8 bg-gray-800 rounded animate-pulse"></div>
          <div className="h-32 bg-gray-800 rounded animate-pulse"></div>
          <div className="h-32 bg-gray-800 rounded animate-pulse"></div>
          <div className="h-12 bg-gray-800 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}

/**
 * Compact loading fallback for small components
 */
export function CompactLoadingFallback() {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500"></div>
    </div>
  );
}
