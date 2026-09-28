'use client';

import React, { useState, useMemo } from 'react';
import { 
  ROOM_DATA, 
  DayOfWeek, 
  RoomSchedule, 
  getCurrentPeriodFromTime, 
  getCurrentDayOfWeek 
} from '@/data/roomData';
import { LocatorHeader } from '@/components/locator/LocatorHeader';
import { FreeRoomsShowcase } from '@/components/locator/FreeRoomsShowcase';
import { QuickRecommendation } from '@/components/locator/QuickRecommendation';
import { AIRoomScout } from '@/components/locator/AIRoomScout';
import { LocatorStats } from '@/components/locator/LocatorStats';
import { LocatorFilters, ViewMode, StatusFilter, ACFilter } from '@/components/locator/LocatorFilters';
import { RoomCard } from '@/components/locator/RoomCard';
import { CampusFloorMap } from '@/components/locator/CampusFloorMap';
import { FloorGroupedView } from '@/components/locator/FloorGroupedView';
import { MasterMatrixView } from '@/components/locator/MasterMatrixView';
import { RoomDetailModal } from '@/components/locator/RoomDetailModal';
import { VisualBuildingMap } from '@/components/locator/VisualBuildingMap';
import { RoomCountdownModal } from '@/components/locator/RoomCountdownModal';
import { SearchX } from 'lucide-react';

export default function FreeClassLocatorPage() {
  // State initialization: defaults to today and current live period
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(() => getCurrentDayOfWeek());
  const [selectedPeriod, setSelectedPeriod] = useState<number>(() => getCurrentPeriodFromTime());

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [acFilter, setAcFilter] = useState<ACFilter>('all');
  const [floorFilter, setFloorFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('visual-map');
  const [onlyFreeFilter, setOnlyFreeFilter] = useState<boolean>(false);

  // Modal inspection state
  const [selectedRoomModal, setSelectedRoomModal] = useState<RoomSchedule | null>(null);

  // Available unique floors
  const availableFloors = useMemo(() => {
    const floorSet = new Set(ROOM_DATA.map(r => r.floor));
    return Array.from(floorSet);
  }, []);

  // Filtered rooms logic
  const filteredRooms = useMemo(() => {
    const periodIndex = selectedPeriod - 1;

    return ROOM_DATA.filter(room => {
      const isRoomFree = (room.occupied[selectedDay]?.[periodIndex] ?? 1) === 0;

      // 0. Only Free shortcut filter
      if (onlyFreeFilter && !isRoomFree) return false;

      // 1. Search Query filter (room name, floor)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = room.room.toLowerCase().includes(q);
        const matchesFloor = room.floor.toLowerCase().includes(q);
        if (!matchesName && !matchesFloor) return false;
      }

      // 2. Status filter
      if (statusFilter === 'free' && !isRoomFree) return false;
      if (statusFilter === 'occupied' && isRoomFree) return false;

      // 3. AC filter
      if (acFilter === 'ac' && !room.isAC) return false;
      if (acFilter === 'non-ac' && room.isAC) return false;

      // 4. Floor filter
      if (floorFilter !== 'all' && room.floor !== floorFilter) return false;

      return true;
    });
  }, [selectedDay, selectedPeriod, searchQuery, statusFilter, acFilter, floorFilter, onlyFreeFilter]);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 relative selection:bg-emerald-600 selection:text-white pb-24">
      {/* Background Subtle Gradient Glow */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-emerald-50/70 via-teal-50/30 to-transparent pointer-events-none -z-10" />

      {/* Corner Decorative Accent */}
      <div className="absolute bottom-6 right-6 grid grid-cols-4 gap-2 opacity-25 pointer-events-none hidden sm:grid">
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 1. Header with live clock & cross-route navigation */}
        <LocatorHeader selectedDay={selectedDay} selectedPeriod={selectedPeriod} />

        {/* 2. Free Rooms Live Showcase: Big Vacant Rooms Banner with 1-click Free filter */}
        <FreeRoomsShowcase
          rooms={ROOM_DATA}
          selectedDay={selectedDay}
          selectedPeriod={selectedPeriod}
          onlyFreeFilter={onlyFreeFilter}
          setOnlyFreeFilter={setOnlyFreeFilter}
          onSelectRoom={setSelectedRoomModal}
        />

        {/* 3. Instant AI Smart Recommendation Spotlight */}
        <QuickRecommendation
          rooms={ROOM_DATA}
          selectedDay={selectedDay}
          selectedPeriod={selectedPeriod}
          onSelectRoom={setSelectedRoomModal}
        />

        {/* 4. Interactive AI Campus Room Scout: Chatbot / Instant Prompt Chips */}
        <AIRoomScout
          selectedDay={selectedDay}
          selectedPeriod={selectedPeriod}
        />

        {/* 5. Real-time Status KPI Summary Cards */}
        <LocatorStats
          rooms={ROOM_DATA}
          selectedDay={selectedDay}
          selectedPeriod={selectedPeriod}
        />

        {/* 6. Filter, Day, Period, and Search Control Panel */}
        <LocatorFilters
          selectedDay={selectedDay}
          setSelectedDay={setSelectedDay}
          selectedPeriod={selectedPeriod}
          setSelectedPeriod={setSelectedPeriod}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          acFilter={acFilter}
          setAcFilter={setAcFilter}
          floorFilter={floorFilter}
          setFloorFilter={setFloorFilter}
          viewMode={viewMode}
          setViewMode={setViewMode}
          availableFloors={availableFloors}
        />

        {/* 7. Main Content: Visual Floor Plan Map / Cards View / Map View / Floor View / Matrix View */}
        {filteredRooms.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <SearchX className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No Classrooms Match Your Filters</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Try turning off the &quot;Only Free&quot; filter, clearing search keywords, or selecting another period.
            </p>
            <button
              type="button"
              onClick={() => {
                setOnlyFreeFilter(false);
                setSearchQuery('');
                setStatusFilter('all');
                setAcFilter('all');
                setFloorFilter('all');
              }}
              className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : viewMode === 'visual-map' ? (
          <VisualBuildingMap
            rooms={filteredRooms}
            selectedDay={selectedDay}
            selectedPeriod={selectedPeriod}
            onSelectRoom={setSelectedRoomModal}
          />
        ) : viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredRooms.map(room => (
              <RoomCard
                key={room.room}
                room={room}
                selectedDay={selectedDay}
                selectedPeriod={selectedPeriod}
                onSelectPeriod={setSelectedPeriod}
                onOpenDetails={setSelectedRoomModal}
              />
            ))}
          </div>
        ) : viewMode === 'map' ? (
          <CampusFloorMap
            rooms={filteredRooms}
            selectedDay={selectedDay}
            selectedPeriod={selectedPeriod}
            onSelectRoom={setSelectedRoomModal}
          />
        ) : viewMode === 'floors' ? (
          <FloorGroupedView
            rooms={filteredRooms}
            selectedDay={selectedDay}
            selectedPeriod={selectedPeriod}
            onSelectPeriod={setSelectedPeriod}
            onOpenDetails={setSelectedRoomModal}
          />
        ) : (
          <MasterMatrixView
            rooms={filteredRooms}
            selectedDay={selectedDay}
            selectedPeriod={selectedPeriod}
            onSelectPeriod={setSelectedPeriod}
            onOpenDetails={setSelectedRoomModal}
          />
        )}
      </div>

      {/* 8. Live Countdown & Squad Share Modal */}
      <RoomCountdownModal
        room={selectedRoomModal}
        selectedDay={selectedDay}
        selectedPeriod={selectedPeriod}
        onClose={() => setSelectedRoomModal(null)}
      />
    </div>
  );
}
