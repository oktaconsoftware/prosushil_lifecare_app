
'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Geolocation } from '@capacitor/geolocation';

// Import Components
import { TopHeader, Sidebar, BottomNav } from '../../components/sales/Navigation';
import TerritoryTab from '../../components/sales/TerritoryTab';
import AddShopTab from '../../components/sales/AddShop'; 
import DealsTab from '../../components/sales/DealsTab';

export default function SalesDashboard() {
  const router = useRouter();

  // App Navigation State
  const [mobileNav, setMobileNav] = useState('route'); 
  const [currentGps, setCurrentGps] = useState(null);
  
  // Route State
  const [targets, setTargets] = useState([]);
  const [masterTerritories, setMasterTerritories] = useState([]); 
  const [isLoadingRoute, setIsLoadingRoute] = useState(true);

  // Derived Stats for UI
  const totalCollection = targets.reduce((sum, t) => sum + (Number(t.Collection) || 0), 0);
  const totalPipeline = targets.reduce((sum, t) => sum + (Number(t.orderAmount) || 0), 0);
  const completedCount = targets.filter(t => t.status === 'COMPLETED').length;
  const completedDeals = targets.filter(t => t.status === 'COMPLETED').reverse();
  
  // 1. Start Background GPS Tracking
  useEffect(() => {
    let watchId;
    const startTracking = async () => {
      try {
        await Geolocation.requestPermissions();
        watchId = await Geolocation.watchPosition({ enableHighAccuracy: true }, (pos) => {
          if (pos) setCurrentGps({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        });
      } catch (err) { 
        console.warn("GPS tracking not available on desktop or permission denied."); 
      }
    };
    startTracking();
    return () => { if (watchId) Geolocation.clearWatch({ id: watchId }); };
  }, []);

  // 2. Fetch Territories & Agent's Route
  const fetchInitialData = useCallback(async () => {
    setIsLoadingRoute(true);
    try {
      const agentId = localStorage.getItem('employeeId') || 'PL-1043'; 
      const routeRes = await fetch(`/api/sales/visits?agentId=${agentId}&_t=${Date.now()}`, { cache: 'no-store' });
      const routeData = await routeRes.json();
      
      // Extract BOTH arrays from the API format
      if (routeData && routeData.targets) {
        setTargets(routeData.targets);
        setMasterTerritories(routeData.masterAreas || []); 
      } else if (Array.isArray(routeData)) {
        setTargets(routeData); // Fallback
      }

    } catch (err) { 
      console.error("Failed to load initial dashboard data:", err); 
    } finally { 
      setIsLoadingRoute(false); 
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

// 🚨 1. THE NUCLEAR LOGOUT FUNCTION (Keep this exactly the same)
  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    document.cookie = "employeeId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "userRole=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = '/'; 
  };

  // 🚨 2. STRICT 8-HOUR SHIFT TIMER
  useEffect(() => {
    // 8 hours in milliseconds (8 hours * 60 mins * 60 secs * 1000)
    const SHIFT_LIMIT = 8 * 60 * 60 * 1000; 
    
    // Fetch the exact time they logged in from local storage
    const loginTime = localStorage.getItem('loginTimestamp');
    
    if (!loginTime) {
      // If for some reason the timestamp is missing, log them out for safety
      handleLogout();
      return;
    }

    // Calculate how much time they have been logged in
    const timeElapsed = Date.now() - parseInt(loginTime, 10);
    const timeLeft = SHIFT_LIMIT - timeElapsed;

    if (timeLeft <= 0) {
      // If their 8 hours are already up, kick them out instantly
      handleLogout();
    } else {
      // Otherwise, set a strict timer for the EXACT time remaining.
      // Unlike the old timer, moving the mouse will NOT reset this!
      const timeoutId = setTimeout(handleLogout, timeLeft);
      
      // Cleanup if they navigate away
      return () => clearTimeout(timeoutId);
    }
  }, []);

  return (
    <div className="flex h-[100dvh] w-full top-0 overflow-hidden font-sans" style={{ background: '#f1f5f9' }}>
      
      <Sidebar mobileNav={mobileNav} setMobileNav={setMobileNav} handleLogout={handleLogout} />

      <main className="flex-1 flex flex-col h-[100dvh] overflow-hidden relative w-full">
        
        <TopHeader mobileNav={mobileNav} handleLogout={handleLogout} />

        {/* ── 1. ROUTE / TERRITORY TAB (Now handles the Fast Check-In Form) ── */}
        {mobileNav === 'route' && (
          <TerritoryTab 
            targets={targets} 
            masterTerritories={masterTerritories} 
            isLoadingRoute={isLoadingRoute} 
            totalCollection={totalCollection}
            onRefreshData={fetchInitialData} // 👈 Tells TerritoryTab to refresh this dashboard when done!
          />
        )}

        {/* ── 2. ADD SHOP TAB ── */}
        {mobileNav === 'add-shop' && (
          <AddShopTab 
            targets={targets} 
            onSuccess={fetchInitialData} 
            setMobileNav={setMobileNav}  
          />
        )}
        {mobileNav === 'deals' && (
    
          <DealsTab targets={targets} />
        )}

        <BottomNav mobileNav={mobileNav} setMobileNav={setMobileNav} />

      </main>
    </div>
  );
}