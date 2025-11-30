# ⚡ Performance Optimization - Quick Reference

## 🚀 Quick Commands

### Enable Performance Monitor
```javascript
localStorage.setItem('show_performance_monitor', 'true');
location.reload();
```

### Disable Performance Monitor
```javascript
localStorage.setItem('show_performance_monitor', 'false');
location.reload();
```

### Clear Cache
```javascript
localStorage.clear();
sessionStorage.clear();
```

### Check Performance Metrics
```javascript
// Open DevTools → Console
// Look for Web Vitals logs:
// [Web Vitals] LCP: XXXms
// [Web Vitals] FID: XXms
// [Web Vitals] CLS: X.XX
```

---

## 📊 Performance Hooks

### Monitor Component Performance
```typescript
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor';

function MyComponent() {
  const { renderCount, averageRenderTime } = usePerformanceMonitor('MyComponent');
  return <div>Rendered {renderCount} times</div>;
}
```

### Monitor FPS
```typescript
import { useFPSMonitor } from '../hooks/usePerformanceMonitor';

function MyComponent() {
  const fps = useFPSMonitor();
  return <div>Current FPS: {fps}</div>;
}
```

### Monitor Memory
```typescript
import { useMemoryMonitor } from '../hooks/usePerformanceMonitor';

function MyComponent() {
  const memory = useMemoryMonitor();
  return <div>Memory: {memory?.usedJSHeapSize}MB</div>;
}
```

### Debounce Values
```typescript
import { useDebounce } from '../hooks/usePerformanceMonitor';

function SearchComponent() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  
  useEffect(() => {
    // This only runs 300ms after user stops typing
    performSearch(debouncedSearch);
  }, [debouncedSearch]);
}
```

---

## 🛠️ Utility Functions

### Debounce Function
```typescript
import { debounce } from '../utils/performanceOptimization';

const handleSearch = debounce((query) => {
  console.log('Searching:', query);
}, 300);
```

### Throttle Function
```typescript
import { throttle } from '../utils/performanceOptimization';

const handleScroll = throttle(() => {
  console.log('User scrolled');
}, 100);
```

### Cache Management
```typescript
import { CacheManager } from '../utils/performanceOptimization';

// Save with 1 hour TTL
CacheManager.set('key', data, 3600000);

// Get from cache
const data = CacheManager.get('key');

// Remove specific key
CacheManager.remove('key');

// Clear all cache
CacheManager.clear();
```

### Get Network Quality
```typescript
import { getNetworkQuality } from '../utils/performanceOptimization';

const quality = getNetworkQuality(); // 'slow' | 'medium' | 'fast'
```

### Get Memory Tier
```typescript
import { getMemoryTier } from '../utils/performanceOptimization';

const tier = getMemoryTier(); // 'low' | 'medium' | 'high'
```

### Check Reduced Motion Preference
```typescript
import { prefersReducedMotion } from '../utils/performanceOptimization';

if (prefersReducedMotion()) {
  // Disable animations
}
```

---

## 🎨 Loading Fallbacks

### Modal Loading
```typescript
import { ModalLoadingFallback } from '../components/LazyLoadWrapper';

<Suspense fallback={<ModalLoadingFallback />}>
  <MyModal />
</Suspense>
```

### Settings Loading
```typescript
import { SettingsLoadingFallback } from '../components/LazyLoadWrapper';

<Suspense fallback={<SettingsLoadingFallback />}>
  <Settings />
</Suspense>
```

### Game Loading
```typescript
import { GameLoadingFallback } from '../components/LazyLoadWrapper';

<Suspense fallback={<GameLoadingFallback />}>
  <Game />
</Suspense>
```

### Compact Loading
```typescript
import { CompactLoadingFallback } from '../components/LazyLoadWrapper';

<Suspense fallback={<CompactLoadingFallback />}>
  <SmallComponent />
</Suspense>
```

---

## 💾 Lazy Loading Pattern

### Basic Lazy Loading
```typescript
import { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HeavyComponent />
    </Suspense>
  );
}
```

### With Named Export
```typescript
const Component = lazy(() => 
  import('./Module').then(m => ({ default: m.Component }))
);
```

### Preload on Hover
```typescript
const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  const preload = () => {
    import('./HeavyComponent'); // Preload on hover
  };
  
  return (
    <button onMouseEnter={preload}>
      Show Component
    </button>
  );
}
```

---

## 🔍 Performance Testing

### Run Lighthouse Audit
1. Open DevTools (F12)
2. Go to "Lighthouse" tab
3. Select "Performance"
4. Click "Analyze page load"
5. Review results

### Check Bundle Size
1. Build for production
2. Check dist/build folder
3. Look for .js file sizes
4. Aim for < 500KB main bundle

### Test Slow Network
1. Open DevTools → Network
2. Select "Slow 3G" from dropdown
3. Reload page
4. Test user experience

### Test on Mobile Device
1. Open DevTools → Device Toolbar
2. Select device (iPhone, Android)
3. Test all features
4. Check FPS and responsiveness

---

## 📈 Performance Benchmarks

### Good Scores:
- **Lighthouse Performance:** 90-100
- **First Contentful Paint:** < 1.5s
- **Time to Interactive:** < 3s
- **Speed Index:** < 3s
- **Total Blocking Time:** < 200ms
- **Cumulative Layout Shift:** < 0.1
- **Largest Contentful Paint:** < 2.5s

### FPS Targets:
- **Desktop:** 60 FPS
- **High-End Mobile:** 60 FPS
- **Mid-Range Mobile:** 45-60 FPS
- **Low-End Mobile:** 30 FPS

### Memory Usage:
- **Desktop:** < 200MB
- **High-End Mobile:** < 150MB
- **Mid-Range Mobile:** < 100MB
- **Low-End Mobile:** < 80MB

---

## 🐛 Common Issues & Fixes

### Issue: Slow Initial Load
**Fix:**
- Enable code splitting
- Lazy load heavy components
- Optimize images
- Reduce bundle size

### Issue: Low FPS During Gameplay
**Fix:**
- Reduce animation complexity
- Use React.memo
- Optimize re-renders
- Lower graphics settings

### Issue: High Memory Usage
**Fix:**
- Clear cache regularly
- Remove event listeners
- Limit state size
- Use virtualization for lists

### Issue: Choppy Animations
**Fix:**
- Use CSS transforms instead of position
- Enable GPU acceleration
- Reduce animation complexity
- Use requestAnimationFrame

---

## ✅ Performance Checklist

### Before Launch:
- [ ] Lighthouse score > 90
- [ ] Bundle size < 2MB
- [ ] Images optimized (WebP)
- [ ] Lazy loading implemented
- [ ] Caching strategy in place
- [ ] Mobile tested
- [ ] Slow network tested
- [ ] Memory leaks checked
- [ ] Error boundaries added
- [ ] Loading states for all async ops

### After Launch:
- [ ] Monitor Web Vitals
- [ ] Track user metrics
- [ ] Set up alerts
- [ ] Review performance weekly
- [ ] Optimize based on real data
- [ ] A/B test optimizations

---

## 🎯 Key Takeaways

1. **Lazy load** heavy components
2. **Debounce/throttle** expensive operations
3. **Monitor** performance metrics
4. **Cache** frequently used data
5. **Optimize** for mobile first
6. **Test** on real devices
7. **Measure** everything
8. **Iterate** based on data

---

**Remember:** Performance is not a one-time task, it's an ongoing process! 🚀

**Full Documentation:** `/PERFORMANCE_OPTIMIZATION_COMPLETE.md`
