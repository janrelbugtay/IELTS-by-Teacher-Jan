import React, { useState } from 'react';
import {
  ShoppingBag,
  Sparkles,
  Check,
  Lock,
  Image as ImageIcon,
  Play,
  Film,
  Gamepad2,
  Trophy,
  X,
  Bike,
  Shirt,
  Crown,
  User,
  Zap,
  ArrowRight,
  RotateCcw,
  Star
} from 'lucide-react';
import { EraVerseAvatar3D } from './EraVerseAvatar3D';

export interface EraShopItem {
  id: string;
  name: string;
  category: 'vehicles' | 'clothes' | 'belts' | 'accessories';
  price: number;
  badge: string;
  desc: string;
  previewColor: string;
  applyKey: 'vehicleType' | 'clothingType' | 'beltType' | 'hatType' | 'accessoryType';
  applyValue: string;
  shirtColorOverride?: string;
  pantsColorOverride?: string;
}

export const ERASHOP_CATALOG: EraShopItem[] = [
  // VEHICLES (BIKE & SKATEBOARD)
  {
    id: 'vehicle-bike',
    name: 'Era Turbo Mountain Bike',
    category: 'vehicles',
    price: 150,
    badge: '+65% Campus Speed',
    desc: 'Ride a 3D emerald turbo bicycle across the EraVerse campus & sports park!',
    previewColor: 'from-emerald-500 to-teal-600',
    applyKey: 'vehicleType',
    applyValue: 'bike'
  },
  {
    id: 'vehicle-skateboard',
    name: 'Pro Street Skateboard',
    category: 'vehicles',
    price: 110,
    badge: '+45% Campus Speed',
    desc: 'Cruise smoothly around EraVerse on a custom 3D pro street skateboard!',
    previewColor: 'from-rose-500 to-orange-500',
    applyKey: 'vehicleType',
    applyValue: 'skateboard'
  },

  // BELTS & WAIST GEAR
  {
    id: 'belt-gold',
    name: 'Golden Championship Belt',
    category: 'belts',
    price: 85,
    badge: 'Band 9.0 Champion',
    desc: 'Gleaming 3D gold championship belt with a jewel buckle around your waist.',
    previewColor: 'from-amber-400 to-yellow-600',
    applyKey: 'beltType',
    applyValue: 'gold_belt'
  },
  {
    id: 'belt-cyber',
    name: 'Neon Cyber Utility Belt',
    category: 'belts',
    price: 70,
    badge: 'Glowing Neon',
    desc: 'Futuristic glowing cyan utility belt crafted for EraVerse explorers.',
    previewColor: 'from-cyan-500 to-blue-600',
    applyKey: 'beltType',
    applyValue: 'cyber_belt'
  },
  {
    id: 'belt-star',
    name: 'Candy Pink Star Belt',
    category: 'belts',
    price: 60,
    badge: "Candy's Pick",
    desc: 'Signature rose-pink boutique waist belt with a golden star buckle.',
    previewColor: 'from-pink-500 to-rose-600',
    applyKey: 'beltType',
    applyValue: 'star_belt'
  },
  {
    id: 'belt-leather',
    name: 'Classic Academy Leather Belt',
    category: 'belts',
    price: 40,
    badge: 'Classic Style',
    desc: 'Rich vintage leather belt with a polished brass buckle.',
    previewColor: 'from-amber-700 to-stone-800',
    applyKey: 'beltType',
    applyValue: 'leather_belt'
  },

  // CLOTHES & OUTFITS
  {
    id: 'clothes-cyber',
    name: 'Neon Cyber Metallic Jacket',
    category: 'clothes',
    price: 95,
    badge: 'LED Collar',
    desc: 'High-tech metallic jacket with an illuminated neon cyan collar.',
    previewColor: 'from-indigo-600 to-cyan-500',
    applyKey: 'clothingType',
    applyValue: 'cyber_jacket',
    shirtColorOverride: '#0284c7'
  },
  {
    id: 'clothes-royal',
    name: 'Royal Academy Gold Blazer',
    category: 'clothes',
    price: 90,
    badge: 'VIP Outfit',
    desc: 'Tailored crimson & gold lapel suit for top IELTS scholars.',
    previewColor: 'from-red-600 to-amber-600',
    applyKey: 'clothingType',
    applyValue: 'royal_suit',
    shirtColorOverride: '#dc2626'
  },
  {
    id: 'clothes-skirt',
    name: 'Candy Boutique Skirt Outfit',
    category: 'clothes',
    price: 75,
    badge: 'Boutique Fashion',
    desc: 'Stylish pleated campus skirt & cropped varsity top set.',
    previewColor: 'from-pink-500 to-purple-600',
    applyKey: 'clothingType',
    applyValue: 'skirt_outfit',
    shirtColorOverride: '#db2777',
    pantsColorOverride: '#be185d'
  },
  {
    id: 'clothes-hoodie',
    name: 'Streetwear Cozy Hoodie',
    category: 'clothes',
    price: 65,
    badge: 'Campus Favorite',
    desc: 'Relaxed 3D pullover hoodie with sculpted back hood.',
    previewColor: 'from-violet-600 to-purple-700',
    applyKey: 'clothingType',
    applyValue: 'hoodie',
    shirtColorOverride: '#7c3aed'
  },

  // ACCESSORIES & HEADGEAR
  {
    id: 'acc-wings',
    name: 'Sky Valkyrie 3D Wings',
    category: 'accessories',
    price: 130,
    badge: 'Legendary Backwear',
    desc: 'Luminous 3D feathered wings worn on your back across EraVerse!',
    previewColor: 'from-sky-400 to-indigo-500',
    applyKey: 'accessoryType',
    applyValue: 'wings'
  },
  {
    id: 'acc-visor',
    name: 'Holo-Laser Cyber Visor',
    category: 'accessories',
    price: 75,
    badge: 'Animated Glow',
    desc: 'Glowing electric cyan futuristic visor eyewear.',
    previewColor: 'from-cyan-400 to-blue-700',
    applyKey: 'accessoryType',
    applyValue: 'cyber_visor'
  },
  {
    id: 'hat-halo',
    name: 'Radiant Golden Halo',
    category: 'accessories',
    price: 110,
    badge: 'Mythic Headgear',
    desc: 'Floating golden ring of light hovering above your character’s head.',
    previewColor: 'from-yellow-400 to-amber-500',
    applyKey: 'hatType',
    applyValue: 'halo'
  },
  {
    id: 'hat-crown',
    name: 'Imperial Golden Crown',
    category: 'accessories',
    price: 80,
    badge: 'Royal Crown',
    desc: 'Solid gold royal crown worn by leaderboard champions.',
    previewColor: 'from-amber-500 to-orange-600',
    applyKey: 'hatType',
    applyValue: 'crown'
  },
  {
    id: 'hat-headphones',
    name: 'Pro DJ Studio Headset',
    category: 'accessories',
    price: 55,
    badge: 'Audio Pro',
    desc: 'Cyan metallic wrap-around studio headphones.',
    previewColor: 'from-teal-500 to-cyan-600',
    applyKey: 'hatType',
    applyValue: 'headphones'
  },
  {
    id: 'acc-shades',
    name: 'VIP Midnight Aviator Shades',
    category: 'accessories',
    price: 45,
    badge: 'Cool Look',
    desc: 'Sleek dark obsidian sunglasses for sunny campus days.',
    previewColor: 'from-slate-700 to-slate-900',
    applyKey: 'accessoryType',
    applyValue: 'shades'
  }
];

// Exact "Life at Kỷ Nguyên Era" photos & "Videos" from Home.tsx
export const ERA_GALLERY_PHOTOS = [
  {
    url: 'https://lh3.googleusercontent.com/d/1-fCPfoRG-EUkT3DqIXhzFHJxQ-QmTM_7',
    title: 'Life at Kỷ Nguyên Era — Moment 1',
    caption: 'A vibrant community of learners achieving their dreams together.'
  },
  {
    url: 'https://lh3.googleusercontent.com/d/1VetrKou8pNQKGBd-iGHZMlwqALwlRBGG',
    title: 'Life at Kỷ Nguyên Era — Moment 2',
    caption: 'Interactive classroom activities and collaborative English practice.'
  },
  {
    url: 'https://lh3.googleusercontent.com/d/1_3lzGwmEDN56unEeW6S_DGe2vddHiWpV',
    title: 'Life at Kỷ Nguyên Era — Moment 3',
    caption: 'Building confidence and friendships across every Cambridge & IELTS level.'
  },
  {
    url: 'https://lh3.googleusercontent.com/d/1gucSgi-fzlN-TDFWMI59HGPXFx7uyGaf',
    title: 'Life at Kỷ Nguyên Era — Moment 4',
    caption: 'Celebrating academic milestones and student achievements.'
  },
  {
    url: 'https://lh3.googleusercontent.com/d/1iwvqSUapjg5QL4kLlmTSCgv-70aBZc3v',
    title: 'Life at Kỷ Nguyên Era — Moment 5',
    caption: 'Engaging lessons led by dedicated, certified teachers.'
  },
  {
    url: 'https://lh3.googleusercontent.com/d/1s-QjIXsvF695O5rz2HrgMSwhw5H0QEFn',
    title: 'Life at Kỷ Nguyên Era — Moment 6',
    caption: 'Hands-on teamwork and joyful learning moments at Kỷ Nguyên Era.'
  },
  {
    url: 'https://lh3.googleusercontent.com/d/1tOj4WMEFtk634gq18dgylYb5gj_jxK0q',
    title: 'Life at Kỷ Nguyên Era — Moment 7',
    caption: 'Students practicing real-world communication with enthusiasm.'
  },
  {
    url: 'https://lh3.googleusercontent.com/d/1MCsDCEvuik-2gvgKPMXmxkh-nnCzaMG6',
    title: 'Life at Kỷ Nguyên Era — Moment 8',
    caption: 'Modern learning spaces designed for student success.'
  },
  {
    url: 'https://lh3.googleusercontent.com/d/1kefJhlEcA1KG5B8MJt40EsjOFBH2yX1I',
    title: 'Life at Kỷ Nguyên Era — Moment 9',
    caption: 'Unforgettable memories with our Kỷ Nguyên Era family.'
  }
];

export const ERA_GALLERY_VIDEOS = [
  { id: '1m3tRXayFhFQGk7P4TgtK0Vc1kwNvk6-V', title: 'Life at Kỷ Nguyên Era — Highlight Video 1' },
  { id: '1ec3Ee5VTwWkep1L4-strCnOx3evHoE0e', title: 'Life at Kỷ Nguyên Era — Highlight Video 2' },
  { id: '1G39tMBVChShT-bU52uwjHqZV7NYwduhr', title: 'Life at Kỷ Nguyên Era — Highlight Video 3' },
  { id: '1jmkstraxzjwScvee4npqHGiRJOHp1DzA', title: 'Life at Kỷ Nguyên Era — Highlight Video 4' },
  { id: '1UV_enof7q1KvsshgHkSE1ly5qOZKSLBc', title: 'Life at Kỷ Nguyên Era — Highlight Video 5' },
  { id: '1nlYKmV4DLV3xIqRTSYM_AOvvj9ig_qBJ', title: 'Life at Kỷ Nguyên Era — Highlight Video 6' }
];

// ============================================================================
// 1. ERASHOP MODAL (WITH CANDY SHOPKEEPER, GEM ECONOMY & FULL BODY CUSTOMIZER)
// ============================================================================
interface EraShopModalProps {
  isOpen: boolean;
  initialTab?: 'shop' | 'customizer';
  initialCategory?: 'all' | 'vehicles' | 'clothes' | 'belts' | 'accessories';
  playerProfile: any;
  eraGems: number;
  ownedItems: string[];
  isAdmin: boolean;
  onUpdateProfile: (updated: any) => void;
  onBuyItem: (item: EraShopItem) => void;
  onEquipItem: (item: EraShopItem) => void;
  onSaveAndSync: () => void;
  onClose: () => void;
}

export const EraShopModal: React.FC<EraShopModalProps> = ({
  isOpen,
  initialTab = 'shop',
  initialCategory = 'all',
  playerProfile,
  eraGems,
  ownedItems,
  isAdmin,
  onUpdateProfile,
  onBuyItem,
  onEquipItem,
  onSaveAndSync,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'shop' | 'customizer'>(initialTab);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'vehicles' | 'clothes' | 'belts' | 'accessories'>(initialCategory);

  if (!isOpen) return null;

  const filteredShopItems =
    selectedCategory === 'all'
      ? ERASHOP_CATALOG
      : ERASHOP_CATALOG.filter((item) => item.category === selectedCategory);

  const isItemEquipped = (item: EraShopItem) => {
    return (playerProfile[item.applyKey] || 'none') === item.applyValue;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-[2rem] max-w-6xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-pink-200 overflow-hidden">
        {/* Top Boutique Header with Candy Shopkeeper & Era Gems Balance */}
        <div className="bg-gradient-to-r from-pink-600 via-rose-600 to-amber-500 px-6 py-4 text-white flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-widest bg-white/20 px-2.5 py-0.5 rounded-full">
                  ERAVERSE BOUTIQUE & GEAR STORE
                </span>
                <span className="text-[11px] font-extrabold text-amber-200">
                  ★ Hosted by Candy (IELTS 2)
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">EraSHOP & Character Studio</h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Era Gems Wallet Pill */}
            <div className="flex items-center gap-2.5 bg-slate-950/85 border-2 border-amber-300/80 rounded-2xl px-4 py-2 shadow-lg">
              <span className="text-xl">💎</span>
              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300">Your Era Gems</div>
                <div className="text-lg font-black text-white leading-tight">{eraGems.toLocaleString()} 💎</div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main 2-Column Content */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
          {/* LEFT COLUMN (4 cols): Live 3D Character Preview + Candy Shopkeeper Greeting */}
          <div className="lg:col-span-4 p-5 bg-gradient-to-b from-slate-50 to-pink-50/30 flex flex-col justify-between gap-4">
            <div>
              {/* Live 3D Character Viewport */}
              <div className="relative w-full h-64 sm:h-72 rounded-3xl overflow-hidden border-4 border-white shadow-xl bg-sky-400">
                <EraVerseAvatar3D
                  shirtColor={playerProfile.shirtColor}
                  hairColor={playerProfile.hairColor}
                  skinColor={playerProfile.skinColor}
                  hatType={playerProfile.hatType}
                  accessoryType={playerProfile.accessoryType}
                  gender={playerProfile.gender || 'boy'}
                  hairStyle={playerProfile.hairStyle || 'classic'}
                  bodyType={playerProfile.bodyType || 'regular'}
                  clothingType={playerProfile.clothingType || 'varsity'}
                  pantsColor={playerProfile.pantsColor || '#1e293b'}
                  beltType={playerProfile.beltType || 'none'}
                  vehicleType={playerProfile.vehicleType || 'none'}
                  name={playerProfile.name}
                  cohort={playerProfile.cohort}
                  showNameplate={true}
                  className="w-full h-full"
                />
                <div className="absolute bottom-2.5 inset-x-3 flex items-center justify-between pointer-events-none">
                  <span className="bg-slate-950/75 backdrop-blur-md text-white text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg border border-white/15">
                    {(playerProfile.gender || 'boy').toUpperCase()} • {(playerProfile.bodyType || 'regular').toUpperCase()}
                  </span>
                  {playerProfile.vehicleType && playerProfile.vehicleType !== 'none' && (
                    <span className="bg-emerald-600/90 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-lg shadow">
                      🚲 Riding: {playerProfile.vehicleType.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>

              {/* Candy Shopkeeper Card */}
              <div className="mt-4 bg-white rounded-2xl p-3.5 border border-pink-200 shadow-sm flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-emerald-500 shrink-0 shadow">
                  <EraVerseAvatar3D
                    shirtColor="#10b981"
                    hairColor="#dc2626"
                    skinColor="#fcd34d"
                    hatType="crown"
                    accessoryType="none"
                    gender="girl"
                    hairStyle="long"
                    clothingType="skirt_outfit"
                    beltType="gold_belt"
                    name="Candy"
                    cohort="IELTS 2"
                    interactive={false}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-xs text-slate-900">Candy</span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-pink-100 text-pink-700">
                      EraSHOP Manager
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 leading-snug">
                    "Hi <strong>{playerProfile.name}</strong>! Collect 💎 Era Gems in EraGames & around campus to buy Bikes, Skateboards, Belts, Clothes & customize your character!"
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Unequip Vehicle / Belt Bar & Save Button */}
            <div className="space-y-2.5">
              <div className="flex flex-wrap gap-2">
                {playerProfile.vehicleType && playerProfile.vehicleType !== 'none' && (
                  <button
                    type="button"
                    onClick={() => onUpdateProfile({ ...playerProfile, vehicleType: 'none' })}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs cursor-pointer transition-colors"
                  >
                    Unequip {playerProfile.vehicleType === 'bike' ? 'Bike' : 'Skateboard'}
                  </button>
                )}
                {playerProfile.beltType && playerProfile.beltType !== 'none' && (
                  <button
                    type="button"
                    onClick={() => onUpdateProfile({ ...playerProfile, beltType: 'none' })}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs cursor-pointer transition-colors"
                  >
                    Remove Belt
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={onSaveAndSync}
                className="w-full py-3.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-pink-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Save & Sync to Dashboard Profile</span>
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN (8 cols): EraSHOP Items Catalog & Boy/Girl/Body Customizer */}
          <div className="lg:col-span-8 flex flex-col max-h-[75vh]">
            {/* Mode Switcher Tabs */}
            <div className="px-6 pt-4 pb-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('shop')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
                    activeTab === 'shop'
                      ? 'bg-pink-600 text-white shadow-md'
                      : 'bg-white text-slate-700 border border-slate-200 hover:border-pink-400'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>EraSHOP Store (Bikes, Skateboards, Belts & Clothes)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('customizer')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
                    activeTab === 'customizer'
                      ? 'bg-[#1E4DB7] text-white shadow-md'
                      : 'bg-white text-slate-700 border border-slate-200 hover:border-blue-400'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>Customize Boy / Girl, Hair, Skin & Body</span>
                </button>
              </div>
            </div>

            {activeTab === 'shop' ? (
              <div className="p-6 overflow-y-auto space-y-5 flex-1">
                {/* Category Filter Buttons */}
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      { id: 'all', label: 'All Shop Items', icon: ShoppingBag },
                      { id: 'vehicles', label: '🚲 Bikes & Skateboards', icon: Bike },
                      { id: 'belts', label: '✨ Belts & Waist Gear', icon: Star },
                      { id: 'clothes', label: '👕 Clothes & Outfits', icon: Shirt },
                      { id: 'accessories', label: '👑 Crowns, Wings & Visors', icon: Crown }
                    ] as const
                  ).map(({ id, label }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setSelectedCategory(id)}
                      className={`px-3.5 py-2 rounded-xl font-extrabold text-xs border transition-all cursor-pointer ${
                        selectedCategory === id
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-pink-400'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {/* Shop Items Grid with Era Gem Prices */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredShopItems.map((item) => {
                    const isOwned = ownedItems.includes(item.id);
                    const equipped = isItemEquipped(item);
                    const canAfford = eraGems >= item.price;

                    return (
                      <div
                        key={item.id}
                        className={`rounded-2xl p-4 border-2 transition-all flex flex-col justify-between ${
                          equipped
                            ? 'border-emerald-500 bg-emerald-50/40 shadow-md'
                            : isOwned
                            ? 'border-blue-300 bg-blue-50/20 hover:border-blue-400'
                            : 'border-slate-200 bg-white hover:border-pink-400 hover:shadow-md'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2.5">
                            <span
                              className={`text-[10px] font-black uppercase tracking-wider text-white px-2.5 py-1 rounded-lg bg-gradient-to-r ${item.previewColor}`}
                            >
                              {item.badge}
                            </span>

                            {/* Explicit Price Tag in Era Gems */}
                            <span
                              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black border ${
                                isOwned
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                  : canAfford
                                  ? 'bg-amber-50 text-amber-900 border-amber-300'
                                  : 'bg-slate-100 text-slate-500 border-slate-200'
                              }`}
                            >
                              {isOwned ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-600" /> Owned
                                </>
                              ) : (
                                <>💎 {item.price} Era Gems</>
                              )}
                            </span>
                          </div>

                          <h3 className="text-base font-black text-slate-900 mb-1">{item.name}</h3>
                          <p className="text-xs text-slate-600 leading-relaxed mb-4">{item.desc}</p>
                        </div>

                        {isOwned ? (
                          <button
                            type="button"
                            onClick={() => onEquipItem(item)}
                            className={`w-full py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                              equipped
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                          >
                            <Check className="w-4 h-4" />
                            <span>{equipped ? 'Equipped ✓ (Click to Unequip)' : 'Equip Now'}</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onBuyItem(item)}
                            className={`w-full py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
                              canAfford
                                ? 'bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white shadow-sm'
                                : 'bg-slate-200 text-slate-500 hover:bg-slate-300'
                            }`}
                          >
                            {canAfford ? (
                              <>
                                <span>Buy & Equip — 💎 {item.price} Gems</span>
                              </>
                            ) : (
                              <>
                                <Lock className="w-3.5 h-3.5" />
                                <span>Need {item.price - eraGems} more 💎 Gems (Play EraGames!)</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* CHARACTER & BODY STUDIO TAB (Boy / Girl, Hair Style, Hair Color, Skin Tone, Body Build, Colors) */
              <div className="p-6 overflow-y-auto space-y-5 flex-1">
                {/* 1. Boy or Girl Character Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                      1. Character Gender (Boy / Girl)
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      {(
                        [
                          { id: 'boy', label: '👦 Boy Character', defaultHair: 'classic' },
                          { id: 'girl', label: '👧 Girl Character', defaultHair: 'long' }
                        ] as const
                      ).map((g) => (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() =>
                            onUpdateProfile({
                              ...playerProfile,
                              gender: g.id,
                              hairStyle:
                                playerProfile.hairStyle === 'classic' && g.id === 'girl'
                                  ? 'long'
                                  : playerProfile.hairStyle === 'long' && g.id === 'boy'
                                  ? 'classic'
                                  : playerProfile.hairStyle || g.defaultHair
                            })
                          }
                          className={`py-3 px-3 rounded-xl font-extrabold text-xs border-2 transition-all cursor-pointer ${
                            (playerProfile.gender || 'boy') === g.id
                              ? g.id === 'girl'
                                ? 'border-pink-600 bg-pink-50 text-pink-900 shadow-sm'
                                : 'border-blue-600 bg-blue-50 text-blue-900 shadow-sm'
                              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          {g.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. Body Build / Proportions */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                      2. Body Build & Height
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {(
                        [
                          { id: 'slim', label: 'Slim' },
                          { id: 'regular', label: 'Regular' },
                          { id: 'athletic', label: 'Athletic' },
                          { id: 'tall', label: 'Tall' }
                        ] as const
                      ).map((b) => (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => onUpdateProfile({ ...playerProfile, bodyType: b.id })}
                          className={`py-3 px-2 rounded-xl font-extrabold text-xs border-2 transition-all cursor-pointer ${
                            (playerProfile.bodyType || 'regular') === b.id
                              ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-sm'
                              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          {b.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 3. Hairstyle */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                    3. Hair Style
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {(
                      [
                        { id: 'classic', label: 'Classic Cut' },
                        { id: 'spiky', label: 'Spiky Quiff' },
                        { id: 'long', label: 'Long Flowing' },
                        { id: 'ponytail', label: 'Sport Ponytail' },
                        { id: 'twintails', label: 'Twin Pigtails' }
                      ] as const
                    ).map((hs) => (
                      <button
                        key={hs.id}
                        type="button"
                        onClick={() => onUpdateProfile({ ...playerProfile, hairStyle: hs.id })}
                        className={`py-2.5 px-3 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                          (playerProfile.hairStyle || 'classic') === hs.id
                            ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        {hs.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Hair Color & Skin Tone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                      4. Hair Color
                    </label>
                    <div className="flex flex-wrap gap-2.5">
                      {[
                        '#1c1917',
                        '#451a03',
                        '#7c2d12',
                        '#dc2626',
                        '#b45309',
                        '#facc15',
                        '#ec4899',
                        '#2563eb'
                      ].map((hex) => (
                        <button
                          key={hex}
                          type="button"
                          onClick={() => onUpdateProfile({ ...playerProfile, hairColor: hex })}
                          className={`w-9 h-9 rounded-xl border-2 cursor-pointer transition-transform ${
                            playerProfile.hairColor === hex
                              ? 'scale-110 border-blue-600 shadow-md'
                              : 'border-slate-200'
                          }`}
                          style={{ backgroundColor: hex }}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                      5. Skin Tone
                    </label>
                    <div className="flex flex-wrap gap-2.5">
                      {['#fef3c7', '#fef08a', '#fde68a', '#fcd34d', '#f1c27d', '#fdba74', '#d97706', '#92400e'].map(
                        (hex) => (
                          <button
                            key={hex}
                            type="button"
                            onClick={() => onUpdateProfile({ ...playerProfile, skinColor: hex })}
                            className={`w-9 h-9 rounded-xl border-2 cursor-pointer transition-transform ${
                              playerProfile.skinColor === hex
                                ? 'scale-110 border-blue-600 shadow-md'
                                : 'border-slate-200'
                            }`}
                            style={{ backgroundColor: hex }}
                          />
                        )
                      )}
                    </div>
                  </div>
                </div>

                {/* 5. Top / Jacket Color & Pants / Skirt Color */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                      6. Top / Jacket Color
                    </label>
                    <div className="flex flex-wrap gap-2.5">
                      {[
                        '#2563eb',
                        '#10b981',
                        '#db2777',
                        '#9333ea',
                        '#f59e0b',
                        '#ef4444',
                        '#06b6d4',
                        '#0f172a'
                      ].map((hex) => (
                        <button
                          key={hex}
                          type="button"
                          onClick={() => onUpdateProfile({ ...playerProfile, shirtColor: hex })}
                          className={`w-9 h-9 rounded-xl border-2 cursor-pointer transition-transform ${
                            playerProfile.shirtColor === hex
                              ? 'scale-110 border-slate-900 shadow-md'
                              : 'border-slate-200'
                          }`}
                          style={{ backgroundColor: hex }}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                      7. Pants / Skirt Color
                    </label>
                    <div className="flex flex-wrap gap-2.5">
                      {[
                        '#1e293b',
                        '#0f172a',
                        '#1d4ed8',
                        '#be185d',
                        '#047857',
                        '#7c2d12',
                        '#f8fafc',
                        '#6d28d9'
                      ].map((hex) => (
                        <button
                          key={hex}
                          type="button"
                          onClick={() => onUpdateProfile({ ...playerProfile, pantsColor: hex })}
                          className={`w-9 h-9 rounded-xl border-2 cursor-pointer transition-transform ${
                            (playerProfile.pantsColor || '#1e293b') === hex
                              ? 'scale-110 border-blue-600 shadow-md'
                              : 'border-slate-200'
                          }`}
                          style={{ backgroundColor: hex }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* 8. Character Nickname */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                      Character Nickname
                    </label>
                    <input
                      type="text"
                      value={playerProfile.name}
                      onChange={(e) => onUpdateProfile({ ...playerProfile, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                      IELTS Class Group
                    </label>
                    {isAdmin ? (
                      <div className="grid grid-cols-2 gap-2">
                        {(['IELTS 1', 'IELTS 2'] as const).map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => onUpdateProfile({ ...playerProfile, cohort: c })}
                            className={`py-2.5 rounded-xl font-extrabold text-xs border-2 cursor-pointer ${
                              playerProfile.cohort === c
                                ? 'border-blue-600 bg-blue-50 text-blue-900'
                                : 'border-slate-200 text-slate-600'
                            }`}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-200 font-extrabold text-xs text-slate-700 flex items-center justify-between">
                        <span>{playerProfile.cohort}</span>
                        <span className="text-blue-600">Assigned Group</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 2. ERA GALLERY MODAL ("LIFE AT KỶ NGUYÊN ERA" PHOTOS & CAMPUS VIDEOS)
// ============================================================================
interface EraGalleryModalProps {
  isOpen: boolean;
  initialTab?: 'all' | 'photos' | 'videos';
  onClose: () => void;
}

export const EraGalleryModal: React.FC<EraGalleryModalProps> = ({
  isOpen,
  initialTab = 'all',
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'photos' | 'videos'>(initialTab);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [lightboxPhoto, setLightboxPhoto] = useState<{ url: string; title: string; caption: string } | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-[2rem] max-w-6xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-cyan-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-700 via-teal-600 to-blue-700 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center border border-white/25">
              <ImageIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-widest text-cyan-200">
                ERAVERSE CAMPUS EXHIBITION HALL
              </span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                Era Gallery — Life at Kỷ Nguyên Era & Videos
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {(
              [
                { id: 'all', label: 'All Photos & Videos', icon: Sparkles },
                { id: 'photos', label: `Life at Kỷ Nguyên Era Photos (${ERA_GALLERY_PHOTOS.length})`, icon: ImageIcon },
                { id: 'videos', label: `Campus Highlight Videos (${ERA_GALLERY_VIDEOS.length})`, icon: Film }
              ] as const
            ).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-extrabold text-xs border transition-all cursor-pointer ${
                  activeTab === id
                    ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-teal-400'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
          <span className="text-xs font-bold text-slate-500">
            Click any photo to enlarge or any video to watch in HD!
          </span>
        </div>

        {/* Content Scroll */}
        <div className="p-6 overflow-y-auto space-y-10 flex-1">
          {/* SECTION 1: LIFE AT KỶ NGUYÊN ERA PHOTOS */}
          {(activeTab === 'all' || activeTab === 'photos') && (
            <div>
              <div className="text-center max-w-2xl mx-auto mb-6">
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Life at Kỷ Nguyên Era
                </h3>
                <p className="text-slate-500 text-sm sm:text-base mt-1">
                  A vibrant community of learners achieving their dreams together.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {ERA_GALLERY_PHOTOS.map((photo, idx) => (
                  <div
                    key={idx}
                    onClick={() => setLightboxPhoto(photo)}
                    className="group relative rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all cursor-pointer bg-slate-100 aspect-[4/3]"
                  >
                    <img
                      src={photo.url}
                      alt={photo.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider bg-teal-500 text-white px-2.5 py-0.5 rounded-full">
                          Kỷ Nguyên Era
                        </span>
                        <h4 className="text-white font-bold text-sm mt-1">{photo.title}</h4>
                        <p className="text-slate-200 text-xs line-clamp-2">{photo.caption}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 2: VIDEOS */}
          {(activeTab === 'all' || activeTab === 'videos') && (
            <div>
              <div className="text-center max-w-2xl mx-auto mb-6">
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Videos</h3>
                <p className="text-slate-500 text-sm sm:text-base mt-1">
                  Watch highlights and stories from our campus.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {ERA_GALLERY_VIDEOS.map((video) => (
                  <div
                    key={video.id}
                    className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-lg border border-slate-200 bg-slate-950"
                  >
                    {playingVideoId !== video.id ? (
                      <div
                        className="absolute inset-0 cursor-pointer group"
                        onClick={() => setPlayingVideoId(video.id)}
                      >
                        <img
                          src={`https://drive.google.com/thumbnail?id=${video.id}&sz=w1000`}
                          alt={video.title}
                          className="w-full h-full object-cover opacity-85 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-16 h-16 bg-slate-950/70 group-hover:bg-teal-600 rounded-full flex items-center justify-center transition-colors border-2 border-white/40 shadow-xl">
                            <Play className="w-7 h-7 text-white ml-1" fill="currentColor" />
                          </div>
                        </div>
                        <div className="absolute bottom-3 left-4 right-4 text-white font-bold text-xs truncate">
                          {video.title}
                        </div>
                      </div>
                    ) : (
                      <iframe
                        src={`https://drive.google.com/file/d/${video.id}/preview?autoplay=1&vq=hd1080`}
                        width="100%"
                        height="100%"
                        allow="autoplay; fullscreen"
                        allowFullScreen
                        title={video.title}
                        className="border-0 w-full h-full"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Photo Lightbox Modal */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxPhoto(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-slate-950 rounded-3xl overflow-hidden border border-white/20 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setLightboxPhoto(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={lightboxPhoto.url}
              alt={lightboxPhoto.title}
              className="w-full max-h-[75vh] object-contain bg-black"
              referrerPolicy="no-referrer"
            />
            <div className="p-5 text-white">
              <h4 className="font-black text-lg">{lightboxPhoto.title}</h4>
              <p className="text-slate-300 text-sm mt-1">{lightboxPhoto.caption}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 3. ERAGAMES ARCADE MODAL (PLAY MINI-GAMES TO EARN 💎 ERA GEMS FOR ERASHOP!)
// ============================================================================
interface EraGamesModalProps {
  isOpen: boolean;
  eraGems: number;
  onRewardGems: (gemsWon: number, xpWon: number, gameTitle: string) => void;
  onOpenEraShop: () => void;
  onClose: () => void;
}

const VOCAB_BLITZ_QUESTIONS = [
  {
    word: 'UBIQUITOUS',
    prompt: 'Select the closest academic synonym for "UBIQUITOUS":',
    options: ['Present everywhere at once', 'Extremely rare and fragile', 'Financially unprofitable', 'Strictly confidential'],
    correct: 0
  },
  {
    word: 'MITIGATE',
    prompt: 'In IELTS Writing Task 2, what does "MITIGATE" mean?',
    options: ['Make a problem less severe', 'Accelerate pollution', 'Ignore statistical evidence', 'Construct a tall building'],
    correct: 0
  },
  {
    word: 'PRAGMATIC',
    prompt: 'What is a "PRAGMATIC" approach to solving an issue?',
    options: ['Practical and realistic', 'Purely emotional', 'Ancient and outdated', 'Uncertain and hesitant'],
    correct: 0
  },
  {
    word: 'EXACERBATE',
    prompt: 'Traffic congestion can "EXACERBATE" urban air quality. This means:',
    options: ['Worsen an already bad situation', 'Completely purify the air', 'Reduce travel time', 'Sponsor public parks'],
    correct: 0
  },
  {
    word: 'RESILIENT',
    prompt: 'A "RESILIENT" community is one that can:',
    options: ['Recover quickly from difficulties', 'Avoid all modern technology', 'Only speak one language', 'Relocate every winter'],
    correct: 0
  }
];

const SCRAMBLE_PUZZLES = [
  { scrambled: 'F L U E N C Y', answer: 'FLUENCY', hint: 'Smooth and effortless flow in IELTS Speaking' },
  { scrambled: 'C O H E R E N C E', answer: 'COHERENCE', hint: 'Logical organization of ideas in IELTS Writing' },
  { scrambled: 'L E X I C A L', answer: 'LEXICAL', hint: 'Relating to vocabulary resource and word choice' },
  { scrambled: 'S U S T A I N A B L E', answer: 'SUSTAINABLE', hint: 'Environmentally friendly over the long term' },
  { scrambled: 'I N N O V A T I O N', answer: 'INNOVATION', hint: 'A new method, idea, or technological breakthrough' }
];

const PENALTY_IDIOM_QUESTIONS = [
  {
    situation: 'Keeper Max dives left! Complete the idiom: "Studying every day made the IELTS exam a piece of ___!"',
    options: ['cake', 'stone', 'cloud', 'thunder'],
    correct: 0
  },
  {
    situation: 'Top corner shot! Choose the Band 8.0 linker: "___ the rain, the football match continued."',
    options: ['Despite', 'Although', 'However', 'Because'],
    correct: 0
  },
  {
    situation: 'Championship penalty! "Technology has ___ a dramatic transformation in modern education."',
    options: ['brought about', 'taken off', 'looked after', 'given up'],
    correct: 0
  }
];

export const EraGamesModal: React.FC<EraGamesModalProps> = ({
  isOpen,
  eraGems,
  onRewardGems,
  onOpenEraShop,
  onClose
}) => {
  const [selectedGame, setSelectedGame] = useState<'vocab' | 'scramble' | 'penalty'>('vocab');

  // Game 1 state: Vocab Blitz
  const [vocabIdx, setVocabIdx] = useState(0);
  const [vocabScore, setVocabScore] = useState(0);
  const [vocabFinished, setVocabFinished] = useState(false);

  // Game 2 state: Word Scramble
  const [scrambleIdx, setScrambleIdx] = useState(0);
  const [scrambleInput, setScrambleInput] = useState('');
  const [scrambleFeedback, setScrambleFeedback] = useState<string | null>(null);

  // Game 3 state: Penalty Shootout
  const [penaltyIdx, setPenaltyIdx] = useState(0);
  const [penaltyGoals, setPenaltyGoals] = useState(0);
  const [penaltyDone, setPenaltyDone] = useState(false);

  if (!isOpen) return null;

  const currentVocab = VOCAB_BLITZ_QUESTIONS[vocabIdx % VOCAB_BLITZ_QUESTIONS.length];
  const currentScramble = SCRAMBLE_PUZZLES[scrambleIdx % SCRAMBLE_PUZZLES.length];
  const currentPenalty = PENALTY_IDIOM_QUESTIONS[penaltyIdx % PENALTY_IDIOM_QUESTIONS.length];

  const handleVocabAnswer = (optIdx: number) => {
    const isCorrect = optIdx === currentVocab.correct;
    const nextScore = isCorrect ? vocabScore + 1 : vocabScore;
    if (vocabIdx + 1 >= VOCAB_BLITZ_QUESTIONS.length) {
      setVocabScore(nextScore);
      setVocabFinished(true);
      const gemsWon = Math.max(20, nextScore * 12);
      onRewardGems(gemsWon, nextScore * 30, 'IELTS Vocabulary Speed Blitz');
    } else {
      setVocabScore(nextScore);
      setVocabIdx(vocabIdx + 1);
    }
  };

  const handleScrambleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (scrambleInput.trim().toUpperCase() === currentScramble.answer) {
      onRewardGems(50, 80, `Word Scramble (${currentScramble.answer})`);
      setScrambleFeedback(`🎉 Correct! "${currentScramble.answer}" unlocked +50 💎 Era Gems!`);
      setScrambleInput('');
      setTimeout(() => {
        setScrambleFeedback(null);
        setScrambleIdx((i) => (i + 1) % SCRAMBLE_PUZZLES.length);
      }, 1200);
    } else {
      setScrambleFeedback('Not quite! Check the letters and hint above.');
    }
  };

  const handlePenaltyShot = (optIdx: number) => {
    const isGoal = optIdx === currentPenalty.correct;
    const nextGoals = isGoal ? penaltyGoals + 1 : penaltyGoals;
    if (penaltyIdx + 1 >= PENALTY_IDIOM_QUESTIONS.length) {
      setPenaltyGoals(nextGoals);
      setPenaltyDone(true);
      const gems = Math.max(25, nextGoals * 25);
      onRewardGems(gems, nextGoals * 40, 'Grammar & Idiom Penalty Shootout');
    } else {
      setPenaltyGoals(nextGoals);
      setPenaltyIdx(penaltyIdx + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-[2rem] max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-purple-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-fuchsia-600 px-6 py-5 text-white flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center border border-white/25">
              <Gamepad2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-widest text-purple-200">
                ERAVERSE ARCADE & GEM ARENA
              </span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                EraGames — Play & Win 💎 Era Gems!
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-950/85 border-2 border-amber-300/80 rounded-2xl px-4 py-2">
              <span className="text-lg">💎</span>
              <div>
                <div className="text-[10px] font-bold uppercase text-amber-300">Era Gems</div>
                <div className="text-base font-black text-white">{eraGems.toLocaleString()} 💎</div>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenEraShop}
              className="bg-pink-500 hover:bg-pink-600 text-white font-black text-xs px-4 py-3 rounded-2xl shadow-lg flex items-center gap-1.5 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Spend in EraSHOP</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Game Selector Tabs */}
        <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap gap-2">
          {(
            [
              { id: 'vocab', label: '⚡ Game 1: Vocabulary Speed Blitz (+60 💎)', icon: Zap },
              { id: 'scramble', label: '🔤 Game 2: Academic Word Scramble (+50 💎)', icon: Sparkles },
              { id: 'penalty', label: '⚽ Game 3: Idiom Penalty Shootout (+75 💎)', icon: Trophy }
            ] as const
          ).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setSelectedGame(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs border transition-all cursor-pointer ${
                selectedGame === id
                  ? 'bg-purple-600 text-white border-purple-600 shadow-md'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-purple-400'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Active Game Stage */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1">
          {selectedGame === 'vocab' && (
            <div className="max-w-2xl mx-auto">
              {!vocabFinished ? (
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-6 sm:p-8 border-2 border-purple-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-purple-600 text-white">
                      Question {vocabIdx + 1} of {VOCAB_BLITZ_QUESTIONS.length}
                    </span>
                    <span className="text-xs font-extrabold text-purple-800">
                      Reward: Up to +60 💎 Era Gems
                    </span>
                  </div>
                  <div className="text-3xl font-black text-indigo-950 mb-2">{currentVocab.word}</div>
                  <p className="text-sm font-bold text-slate-600 mb-6">{currentVocab.prompt}</p>

                  <div className="grid grid-cols-1 gap-3">
                    {currentVocab.options.map((opt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleVocabAnswer(idx)}
                        className="w-full text-left px-5 py-4 rounded-2xl bg-white hover:bg-purple-600 text-slate-800 hover:text-white font-extrabold text-sm border border-purple-200 shadow-xs transition-all cursor-pointer flex items-center justify-between group"
                      >
                        <span>{opt}</span>
                        <ArrowRight className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-8 border-2 border-emerald-300">
                  <div className="text-5xl mb-3">🏆</div>
                  <h3 className="text-2xl font-black text-slate-900">
                    Blitz Complete! Score: {vocabScore} / {VOCAB_BLITZ_QUESTIONS.length}
                  </h3>
                  <p className="text-emerald-700 font-extrabold text-base mt-2">
                    You earned +{Math.max(20, vocabScore * 12)} 💎 Era Gems!
                  </p>
                  <div className="mt-6 flex justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setVocabIdx(0);
                        setVocabScore(0);
                        setVocabFinished(false);
                      }}
                      className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs flex items-center gap-2 cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" /> Play Again
                    </button>
                    <button
                      type="button"
                      onClick={onOpenEraShop}
                      className="px-6 py-3 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-black text-xs flex items-center gap-2 cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4" /> Visit Candy in EraSHOP
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {selectedGame === 'scramble' && (
            <div className="max-w-2xl mx-auto bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-6 sm:p-8 border-2 border-amber-200">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-amber-500 text-slate-950">
                  Puzzle {scrambleIdx + 1} of {SCRAMBLE_PUZZLES.length}
                </span>
                <span className="text-xs font-extrabold text-amber-900">Reward: +50 💎 Era Gems</span>
              </div>

              <div className="text-center my-6">
                <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                  Unscramble this Academic IELTS Word:
                </div>
                <div className="text-3xl sm:text-4xl font-black tracking-widest text-slate-900 bg-white py-4 px-6 rounded-2xl border border-amber-300 shadow-inner">
                  {currentScramble.scrambled
                    .split(' ')
                    .reverse()
                    .join('  ')}
                </div>
                <p className="text-xs font-bold text-amber-800 mt-3">💡 Hint: {currentScramble.hint}</p>
              </div>

              <form onSubmit={handleScrambleSubmit} className="flex gap-3">
                <input
                  type="text"
                  value={scrambleInput}
                  onChange={(e) => setScrambleInput(e.target.value)}
                  placeholder="Type the unscrambled word..."
                  className="flex-1 px-4 py-3.5 rounded-2xl bg-white border-2 border-amber-300 font-black text-slate-900 uppercase tracking-wider focus:outline-none focus:border-amber-600"
                />
                <button
                  type="submit"
                  className="px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm cursor-pointer shadow-md"
                >
                  Submit (+50 💎)
                </button>
              </form>

              {scrambleFeedback && (
                <div className="mt-4 p-3.5 rounded-xl bg-white border border-amber-300 text-center font-extrabold text-sm text-slate-800">
                  {scrambleFeedback}
                </div>
              )}
            </div>
          )}

          {selectedGame === 'penalty' && (
            <div className="max-w-2xl mx-auto">
              {!penaltyDone ? (
                <div className="bg-gradient-to-br from-emerald-50 to-cyan-50 rounded-3xl p-6 sm:p-8 border-2 border-emerald-300">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-600 text-white">
                      Penalty Kick {penaltyIdx + 1} of {PENALTY_IDIOM_QUESTIONS.length}
                    </span>
                    <span className="text-xs font-extrabold text-emerald-800">
                      Goals Scored: ⚽ {penaltyGoals}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 mb-6">
                    {currentPenalty.situation}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentPenalty.options.map((opt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handlePenaltyShot(idx)}
                        className="py-4 px-5 rounded-2xl bg-white hover:bg-emerald-600 text-slate-900 hover:text-white font-black text-sm border-2 border-emerald-200 transition-all cursor-pointer shadow-xs"
                      >
                        ⚽ Shoot: "{opt}"
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-8 border-2 border-emerald-300">
                  <div className="text-5xl mb-3">⚽🏆</div>
                  <h3 className="text-2xl font-black text-slate-900">
                    Shootout Finished! Goals: {penaltyGoals} / {PENALTY_IDIOM_QUESTIONS.length}
                  </h3>
                  <p className="text-emerald-700 font-extrabold text-base mt-2">
                    You won +{Math.max(25, penaltyGoals * 25)} 💎 Era Gems!
                  </p>
                  <div className="mt-6 flex justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setPenaltyIdx(0);
                        setPenaltyGoals(0);
                        setPenaltyDone(false);
                      }}
                      className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-2 cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" /> Shoot Again
                    </button>
                    <button
                      type="button"
                      onClick={onOpenEraShop}
                      className="px-6 py-3 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-black text-xs flex items-center gap-2 cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4" /> Spend Gems in EraSHOP
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
