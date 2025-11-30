import { motion } from 'motion/react';

interface LoadingSkeletonProps {
  type?: 'card' | 'table' | 'header' | 'chip' | 'button' | 'text' | 'circle' | 'rectangle';
  width?: string;
  height?: string;
  className?: string;
  count?: number;
}

export function LoadingSkeleton({ 
  type = 'rectangle', 
  width, 
  height, 
  className = '',
  count = 1 
}: LoadingSkeletonProps) {
  
  const getTypeStyles = () => {
    switch (type) {
      case 'card':
        return {
          width: width || '100%',
          height: height || '200px',
          borderRadius: '16px',
        };
      case 'table':
        return {
          width: width || '100%',
          height: height || '400px',
          borderRadius: '24px',
        };
      case 'header':
        return {
          width: width || '100%',
          height: height || '80px',
          borderRadius: '12px',
        };
      case 'chip':
        return {
          width: width || '60px',
          height: height || '60px',
          borderRadius: '50%',
        };
      case 'button':
        return {
          width: width || '120px',
          height: height || '48px',
          borderRadius: '12px',
        };
      case 'text':
        return {
          width: width || '200px',
          height: height || '20px',
          borderRadius: '4px',
        };
      case 'circle':
        return {
          width: width || '48px',
          height: height || '48px',
          borderRadius: '50%',
        };
      default: // rectangle
        return {
          width: width || '100%',
          height: height || '40px',
          borderRadius: '8px',
        };
    }
  };

  const styles = getTypeStyles();

  const skeletonElement = (
    <motion.div
      className={`relative overflow-hidden ${className}`}
      style={{
        ...styles,
        background: 'linear-gradient(90deg, rgba(30, 30, 30, 0.8) 0%, rgba(50, 50, 50, 0.8) 50%, rgba(30, 30, 30, 0.8) 100%)',
        backgroundSize: '200% 100%',
      }}
      animate={{
        backgroundPosition: ['0% 0%', '100% 0%'],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'linear',
      }}
    >
      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%)',
        }}
        animate={{
          x: ['-100%', '200%'],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </motion.div>
  );

  // Render multiple skeletons if count > 1
  if (count > 1) {
    return (
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index}>{skeletonElement}</div>
        ))}
      </div>
    );
  }

  return skeletonElement;
}

// Preset skeleton layouts for common use cases
export function TableLoadingSkeleton() {
  return (
    <div className="w-full h-full flex items-center justify-center p-8">
      <div className="max-w-6xl w-full space-y-6">
        {/* Header */}
        <LoadingSkeleton type="header" />
        
        {/* Table area */}
        <LoadingSkeleton type="table" height="500px" />
        
        {/* Chips row */}
        <div className="flex gap-4 justify-center">
          <LoadingSkeleton type="chip" />
          <LoadingSkeleton type="chip" />
          <LoadingSkeleton type="chip" />
          <LoadingSkeleton type="chip" />
          <LoadingSkeleton type="chip" />
        </div>
      </div>
    </div>
  );
}

export function CardLoadingSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <LoadingSkeleton type="card" />
      <div className="flex gap-4">
        <LoadingSkeleton type="text" width="40%" />
        <LoadingSkeleton type="text" width="60%" />
      </div>
    </div>
  );
}

export function ProfileLoadingSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4">
      <LoadingSkeleton type="circle" width="64px" height="64px" />
      <div className="flex-1 space-y-2">
        <LoadingSkeleton type="text" width="60%" />
        <LoadingSkeleton type="text" width="40%" />
      </div>
    </div>
  );
}
