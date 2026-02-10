/**
 * Zone building sprites - permanent architectural structures rendered
 * as actual pixel-art images with depth and detail.
 */

import governmentHall from '@/assets/buildings/government-hall.png';
import governmentTower from '@/assets/buildings/government-tower.png';
import governmentArchive from '@/assets/buildings/government-archive.png';
import workerHouse from '@/assets/buildings/worker-house.png';
import workerWorkshop from '@/assets/buildings/worker-workshop.png';
import workerBarracks from '@/assets/buildings/worker-barracks.png';
import merchantShop from '@/assets/buildings/merchant-shop.png';
import merchantTavern from '@/assets/buildings/merchant-tavern.png';
import merchantWarehouse from '@/assets/buildings/merchant-warehouse.png';

interface ZoneBuildingProps {
  variant?: number;
}

const BUILDING_STYLE: React.CSSProperties = {
  imageRendering: 'pixelated',
  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
  maxWidth: '100%',
  maxHeight: '100%',
  objectFit: 'contain',
};

function BuildingImage({ src, alt }: { src: string; alt: string }) {
  return (
    <img
      src={src}
      alt={alt}
      className="w-[56px] h-[56px] select-none pointer-events-none"
      style={BUILDING_STYLE}
      draggable={false}
    />
  );
}

// ==================== WORKER DISTRICT BUILDINGS ====================

const WORKER_BUILDINGS = [workerHouse, workerHouse, workerWorkshop, workerBarracks];
const WORKER_LABELS = ['Worker House', 'Worker House', 'Workshop', 'Barracks'];

export function WorkerHouseSprite({ variant = 0 }: ZoneBuildingProps) {
  const idx = variant % WORKER_BUILDINGS.length;
  return <BuildingImage src={WORKER_BUILDINGS[idx]} alt={WORKER_LABELS[idx]} />;
}

// ==================== MERCHANT DISTRICT BUILDINGS ====================

const MERCHANT_BUILDINGS = [merchantShop, merchantShop, merchantTavern, merchantWarehouse];
const MERCHANT_LABELS = ['Merchant Shop', 'Merchant Shop', 'Tavern', 'Warehouse'];

export function MerchantShopSprite({ variant = 0 }: ZoneBuildingProps) {
  const idx = variant % MERCHANT_BUILDINGS.length;
  return <BuildingImage src={MERCHANT_BUILDINGS[idx]} alt={MERCHANT_LABELS[idx]} />;
}

// ==================== GOVERNMENT BUILDINGS ====================

const GOV_BUILDINGS = [governmentHall, governmentHall, governmentTower, governmentArchive];
const GOV_LABELS = ['Town Hall', 'Government Hall', 'Guard Tower', 'Archive'];

export function GovernmentBuildingSprite({ variant = 0 }: ZoneBuildingProps) {
  const idx = variant % GOV_BUILDINGS.length;
  return <BuildingImage src={GOV_BUILDINGS[idx]} alt={GOV_LABELS[idx]} />;
}
