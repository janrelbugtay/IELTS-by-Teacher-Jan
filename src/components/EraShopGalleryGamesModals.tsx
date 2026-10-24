import React, { useState, useRef } from 'react';
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
  Star,
  Camera,
  Download,
  Eye,
  Palette,
  Award,
  RefreshCw,
  Sliders,
  Scissors,
  Glasses
} from 'lucide-react';
import { EraVerseAvatar3D } from './EraVerseAvatar3D';
import {
  SKIN_TONES,
  FACE_SHAPES,
  EAR_STYLES,
  EYE_SHAPES,
  EYE_COLORS,
  EYEBROW_STYLES,
  NOSE_SHAPES,
  MOUTH_STYLES,
  SKIN_DETAILS,
  HAIR_COLORS,
  HAIRSTYLES,
  TOP_STYLES,
  JACKET_STYLES,
  BOTTOM_STYLES,
  BELT_STYLES,
  SHOE_STYLES,
  HEADGEAR_ITEMS,
  ACCESSORY_ITEMS,
  VEHICLE_ITEMS,
  CLOTHING_PALETTE,
  STUDIO_THEMES,
  REFERENCE_PRESETS,
  IELTS_QUIZ_QUESTIONS,
  normalizeCharacterOptions
} from '../utils/realisticCharacterBuilder';

export interface EraShopItem {
  id: string;
  name: string;
  category: 'vehicles' | 'clothes' | 'belts' | 'accessories' | 'hair' | 'headgear';
  price: number;
  dollarPrice?: number;
  badge: string;
  desc: string;
  previewColor: string;
  applyKey: string;
  applyValue: string;
  shirtColorOverride?: string;
  pantsColorOverride?: string;
  extraUpdates?: Record<string, any>;
}

export const ERASHOP_CATALOG: EraShopItem[] = [
  // VEHICLES (BIKE & SKATEBOARD)
  {
    id: 'vehicle-bike',
    name: 'City Cruiser Bicycle',
    category: 'vehicles',
    price: 150,
    dollarPrice: 15,
    badge: '+65% Campus Speed',
    desc: 'Ride a 3D cruiser bicycle with spoked wheels & basket across EraVerse!',
    previewColor: 'from-emerald-500 to-teal-600',
    applyKey: 'vehicleType',
    applyValue: 'bike',
    extraUpdates: { rideStyle: 'cruiser_bike' }
  },
  {
    id: 'vehicle-skateboard',
    name: 'Pro Street Skateboard',
    category: 'vehicles',
    price: 110,
    dollarPrice: 11,
    badge: '+45% Campus Speed',
    desc: 'Cruise smoothly around EraVerse on a custom 3D pro street skateboard!',
    previewColor: 'from-rose-500 to-orange-500',
    applyKey: 'vehicleType',
    applyValue: 'skateboard',
    extraUpdates: { rideStyle: 'skateboard' }
  },
  // BELTS & WAIST GEAR
  {
    id: 'belt-gold',
    name: 'Golden Championship Belt',
    category: 'belts',
    price: 85,
    dollarPrice: 8,
    badge: 'Band 9.0 Champion',
    desc: 'Gleaming 3D gold championship belt with a jewel buckle around your waist.',
    previewColor: 'from-amber-400 to-yellow-600',
    applyKey: 'beltType',
    applyValue: 'gold_belt',
    extraUpdates: { beltStyle: 'Belt_Gold' }
  },
  {
    id: 'belt-cyber',
    name: 'Clean White Sport Belt',
    category: 'belts',
    price: 50,
    dollarPrice: 5,
    badge: 'Sport Style',
    desc: 'Crisp white sport belt with polished chrome buckle.',
    previewColor: 'from-cyan-500 to-blue-600',
    applyKey: 'beltType',
    applyValue: 'cyber_belt',
    extraUpdates: { beltStyle: 'Belt_White' }
  },
  {
    id: 'belt-leather',
    name: 'Classic Academy Leather Belt',
    category: 'belts',
    price: 40,
    dollarPrice: 4,
    badge: 'Classic Style',
    desc: 'Rich vintage leather belt with a polished brass buckle.',
    previewColor: 'from-amber-700 to-stone-800',
    applyKey: 'beltType',
    applyValue: 'leather_belt',
    extraUpdates: { beltStyle: 'Belt_Brown' }
  },
  // CLOTHES & OUTFITS
  {
    id: 'clothes-cyber',
    name: 'Neon Techwear Jacket',
    category: 'clothes',
    price: 95,
    dollarPrice: 9,
    badge: 'LED Collar',
    desc: 'High-tech jacket with an illuminated neon cyan collar.',
    previewColor: 'from-indigo-600 to-cyan-500',
    applyKey: 'clothingType',
    applyValue: 'cyber_jacket',
    shirtColorOverride: '#0284c7',
    extraUpdates: { jacketStyle: 'cyber_jacket', jacketPrimary: '#0F172A', jacketSecondary: '#22D3EE' }
  },
  {
    id: 'clothes-royal',
    name: 'Prep Crest Blazer',
    category: 'clothes',
    price: 90,
    dollarPrice: 9,
    badge: 'VIP Outfit',
    desc: 'Tailored academy blazer with gold lapel trim for top IELTS scholars.',
    previewColor: 'from-red-600 to-amber-600',
    applyKey: 'clothingType',
    applyValue: 'royal_suit',
    shirtColorOverride: '#dc2626',
    extraUpdates: { topStyle: 'oxford_shirt', jacketStyle: 'school_blazer' }
  },
  {
    id: 'clothes-skirt',
    name: 'Floral Mandarin Top & Pleated Skirt',
    category: 'clothes',
    price: 75,
    dollarPrice: 7,
    badge: 'Ref #3 Set',
    desc: 'Sky-blue daisy Mandarin top & white pleated skater skirt.',
    previewColor: 'from-pink-500 to-purple-600',
    applyKey: 'clothingType',
    applyValue: 'skirt_outfit',
    shirtColorOverride: '#38BDF8',
    pantsColorOverride: '#FFFFFF',
    extraUpdates: { topStyle: 'qipao_daisy', bottomStyle: 'pleated_skirt', shoeStyle: 'mary_janes' }
  },
  {
    id: 'clothes-hoodie',
    name: 'Layered Zip Hoodie Vest',
    category: 'clothes',
    price: 65,
    dollarPrice: 6,
    badge: 'Ref #4 Set',
    desc: 'Sleeveless zip hoodie vest worn over a graphic crewneck tee.',
    previewColor: 'from-violet-600 to-purple-700',
    applyKey: 'clothingType',
    applyValue: 'hoodie',
    shirtColorOverride: '#F97316',
    extraUpdates: { topStyle: 'casual_tee', jacketStyle: 'hoodie_vest' }
  },
  // ACCESSORIES & HEADGEAR
  {
    id: 'acc-wings',
    name: 'Feathered Valkyrie Wings',
    category: 'accessories',
    price: 130,
    dollarPrice: 13,
    badge: 'Legendary Backwear',
    desc: 'Luminous 3D feathered wings worn on your back across EraVerse!',
    previewColor: 'from-sky-400 to-indigo-500',
    applyKey: 'accessoryType',
    applyValue: 'wings'
  },
  {
    id: 'acc-visor',
    name: 'Holographic Cyber Visor',
    category: 'accessories',
    price: 75,
    dollarPrice: 7,
    badge: 'Animated Glow',
    desc: 'Glowing electric cyan futuristic visor eyewear.',
    previewColor: 'from-cyan-400 to-blue-700',
    applyKey: 'accessoryType',
    applyValue: 'cyber_visor'
  },
  {
    id: 'hat-halo',
    name: 'Radiant Floating Halo',
    category: 'accessories',
    price: 110,
    dollarPrice: 11,
    badge: 'Mythic Headgear',
    desc: 'Floating golden ring of light hovering above your character’s head.',
    previewColor: 'from-yellow-400 to-amber-500',
    applyKey: 'hatType',
    applyValue: 'halo',
    extraUpdates: { hatStyle: 'angel_halo' }
  },
  {
    id: 'hat-crown',
    name: 'Royal Champion Crown',
    category: 'accessories',
    price: 80,
    dollarPrice: 8,
    badge: 'Royal Crown',
    desc: 'Solid gold royal crown worn by leaderboard champions.',
    previewColor: 'from-amber-500 to-orange-600',
    applyKey: 'hatType',
    applyValue: 'crown',
    extraUpdates: { hatStyle: 'gold_crown' }
  },
  {
    id: 'hat-headphones',
    name: 'Neon Cat-Ear Headphones',
    category: 'accessories',
    price: 55,
    dollarPrice: 5,
    badge: 'Audio Pro',
    desc: 'Over-ear studio headphones with glowing neon cat ears.',
    previewColor: 'from-teal-500 to-cyan-600',
    applyKey: 'hatType',
    applyValue: 'headphones',
    extraUpdates: { hatStyle: 'cat_headphones' }
  },
  {
    id: 'acc-shades',
    name: 'Gold Aviator Shades',
    category: 'accessories',
    price: 45,
    dollarPrice: 4,
    badge: 'Cool Look',
    desc: 'Sleek dark obsidian lenses in thin gold frames.',
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
// 1. ERASHOP & REALISTIC 3D CHARACTER WARDROBE STUDIO (REALISTIC MESH v10+)
// ============================================================================
interface EraShopModalProps {
  isOpen: boolean;
  initialTab?: 'shop' | 'customizer';
  initialCategory?: 'all' | 'vehicles' | 'clothes' | 'belts' | 'accessories';
  playerProfile: any;
  eraGems: number;
  eraDollars?: number;
  ownedItems: string[];
  isAdmin: boolean;
  onUpdateProfile: (updated: any) => void;
  onBuyItem: (item: EraShopItem, currency?: 'gems' | 'dollars') => void;
  onEquipItem: (item: EraShopItem) => void;
  onSaveAndSync: () => void;
  onClose: () => void;
  onRewardGems?: (gemsWon: number, dollarsWon: number, reason: string) => void;
}

type StudioTab = 'body' | 'hair' | 'clothes' | 'headgear' | 'props' | 'bikes';
type BodySubTab = 'skin_body' | 'face_ears' | 'eyes_brows' | 'nose_mouth';
type ClothesSubTab = 'tops' | 'jackets' | 'bottoms' | 'belts' | 'shoes';

interface TryOnState {
  item: EraShopItem;
  previewOverrides: Record<string, any>;
}

export const EraShopModal: React.FC<EraShopModalProps> = ({
  isOpen,
  initialTab = 'shop',
  initialCategory = 'all',
  playerProfile,
  eraGems,
  eraDollars = 0,
  ownedItems,
  isAdmin,
  onUpdateProfile,
  onBuyItem,
  onSaveAndSync,
  onClose,
  onRewardGems
}) => {
  // Determine initial studio tab from legacy initialTab / initialCategory
  const getInitialStudioTab = (): StudioTab => {
    if (initialTab === 'customizer') return 'body';
    if (initialCategory === 'vehicles') return 'bikes';
    if (initialCategory === 'belts' || initialCategory === 'clothes') return 'clothes';
    if (initialCategory === 'accessories') return 'props';
    return 'clothes';
  };

  const [mainTab, setMainTab] = useState<StudioTab>(getInitialStudioTab());
  const [bodySubTab, setBodySubTab] = useState<BodySubTab>('skin_body');
  const [clothesSubTab, setClothesSubTab] = useState<ClothesSubTab>(
    initialCategory === 'belts' ? 'belts' : 'tops'
  );

  // 3D Viewport Controls
  const [animMode, setAnimMode] = useState<'idle' | 'walk' | 'wave' | 'ride' | 'tpose'>('idle');
  const [camFocus, setCamFocus] = useState<'full' | 'face'>('full');
  const [autoSpin, setAutoSpin] = useState<boolean>(false);
  const [studioThemeId, setStudioThemeId] = useState<string>('studio_white');

  // Try-On Preview State for locked shop items
  const [tryOn, setTryOn] = useState<TryOnState | null>(null);

  // Snapshot / 3D Student ID Card Modal
  const captureFnRef = useRef<(() => string | null) | null>(null);
  const [snapshotDataUrl, setSnapshotDataUrl] = useState<string | null>(null);

  // IELTS Quiz Modal inside EraSHOP
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizSelected, setQuizSelected] = useState<number | null>(null);

  if (!isOpen) return null;

  const normalized = normalizeCharacterOptions(playerProfile);
  const activePreview = tryOn
    ? normalizeCharacterOptions({ ...playerProfile, ...tryOn.previewOverrides })
    : normalized;

  const currentStudioTheme =
    STUDIO_THEMES.find((t) => t.id === studioThemeId) || STUDIO_THEMES[0];

  // Check if an item ID is owned (free items are always owned)
  const checkIsOwned = (id: string, price: number) => {
    if (price === 0) return true;
    if (ownedItems.includes(id)) return true;
    // Also check legacy catalog aliases
    if (id === 'cruiser_bike' && ownedItems.includes('vehicle-bike')) return true;
    if (id === 'skateboard' && ownedItems.includes('vehicle-skateboard')) return true;
    if (id === 'Belt_Gold' && ownedItems.includes('belt-gold')) return true;
    if (id === 'Belt_White' && ownedItems.includes('belt-cyber')) return true;
    if (id === 'Belt_Brown' && ownedItems.includes('belt-leather')) return true;
    if (id === 'cyber_jacket' && ownedItems.includes('clothes-cyber')) return true;
    if (id === 'school_blazer' && ownedItems.includes('clothes-royal')) return true;
    if (id === 'qipao_daisy' && ownedItems.includes('clothes-skirt')) return true;
    if (id === 'hoodie_vest' && ownedItems.includes('clothes-hoodie')) return true;
    if (id === 'angel_wings' && ownedItems.includes('acc-wings')) return true;
    if (id === 'cyber_visor' && ownedItems.includes('acc-visor')) return true;
    if (id === 'angel_halo' && ownedItems.includes('hat-halo')) return true;
    if (id === 'gold_crown' && ownedItems.includes('hat-crown')) return true;
    if (id === 'cat_headphones' && ownedItems.includes('hat-headphones')) return true;
    if (id === 'aviator_sun' && ownedItems.includes('acc-shades')) return true;
    return false;
  };

  // Apply profile changes & keep legacy keys in sync
  const updateAvatarFields = (changes: Record<string, any>) => {
    setTryOn(null);
    const merged: Record<string, any> = { ...playerProfile, ...changes };

    if (changes.gender) {
      merged.gender = changes.gender;
    }
    if (changes.skinTone) {
      merged.skinColor = changes.skinTone;
    }
    if (changes.topColor) {
      merged.shirtColor = changes.topColor;
    }
    if (changes.bottomColor) {
      merged.pantsColor = changes.bottomColor;
    }
    if (changes.hatStyle !== undefined) {
      merged.hatType = changes.hatStyle;
    }
    if (changes.beltStyle !== undefined) {
      merged.beltType = changes.beltStyle;
    }
    if (changes.rideStyle !== undefined) {
      merged.vehicleType =
        changes.rideStyle === 'cruiser_bike' || changes.rideStyle === 'gold_bike'
          ? 'bike'
          : changes.rideStyle === 'skateboard' || changes.rideStyle === 'scooter'
          ? 'skateboard'
          : changes.rideStyle;
    }
    onUpdateProfile(merged);
  };

  // Handle clicking a catalog item (Equip immediately if owned, or Try-On if locked)
  const handleSelectCatalogItem = (
    itemId: string,
    name: string,
    price: number,
    dollarPrice: number,
    badge: string,
    desc: string,
    applyKey: string,
    applyValue: any,
    extraUpdates: Record<string, any> = {}
  ) => {
    const owned = checkIsOwned(itemId, price);
    const allChanges = { [applyKey]: applyValue, ...extraUpdates };

    if (owned) {
      updateAvatarFields(allChanges);
      if (applyKey === 'rideStyle') {
        setAnimMode(applyValue === 'none' ? 'idle' : 'ride');
      }
    } else {
      const shopItem: EraShopItem = {
        id: itemId,
        name,
        category: 'clothes',
        price,
        dollarPrice: dollarPrice || Math.max(1, Math.round(price / 10)),
        badge,
        desc,
        previewColor: 'from-pink-500 to-indigo-600',
        applyKey,
        applyValue: typeof applyValue === 'string' ? applyValue : String(itemId),
        extraUpdates: allChanges
      };
      setTryOn({
        item: shopItem,
        previewOverrides: allChanges
      });
      if (applyKey === 'rideStyle') {
        setAnimMode(applyValue === 'none' ? 'idle' : 'ride');
      }
    }
  };

  // Purchase the currently previewed or selected shop item
  const executePurchase = (shopItem: EraShopItem, currency: 'gems' | 'dollars') => {
    const effectivePrice =
      currency === 'dollars'
        ? shopItem.dollarPrice || Math.max(1, Math.round(shopItem.price / 10))
        : shopItem.price;

    const itemForHandler: EraShopItem = {
      ...shopItem,
      price: effectivePrice
    };

    onBuyItem(itemForHandler, currency);
    if (shopItem.extraUpdates) {
      updateAvatarFields(shopItem.extraUpdates);
    }
    setTryOn(null);
  };

  const handleTakeSnapshot = () => {
    if (captureFnRef.current) {
      const dataUrl = captureFnRef.current();
      if (dataUrl) setSnapshotDataUrl(dataUrl);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-[2rem] max-w-7xl w-full h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* TOP HEADER BAR */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-5 py-3.5 text-white flex flex-wrap items-center justify-between gap-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center shadow-lg border border-white/20">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest bg-pink-500/20 text-pink-300 border border-pink-400/30 px-2.5 py-0.5 rounded-full">
                  Realistic Mesh v10+
                </span>
                <span className="text-[11px] font-bold text-amber-300">
                  ★ Hosted by Candy (EraSHOP Manager)
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                EraSHOP & 3D Character Wardrobe Studio
              </h2>
            </div>
          </div>

          {/* Wallets + Earn Gems + ID Snapshot + Close */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Era Gems Wallet */}
            <div className="flex items-center gap-2 bg-slate-950/90 border border-pink-400/40 rounded-2xl px-3.5 py-1.5 shadow">
              <span className="text-base">💎</span>
              <div>
                <div className="text-[9px] font-extrabold uppercase tracking-wider text-pink-300 leading-none">
                  Era Gems
                </div>
                <div className="text-sm font-black text-white">{eraGems.toLocaleString()}</div>
              </div>
            </div>

            {/* Era Dollar Wallet */}
            <div className="flex items-center gap-2 bg-slate-950/90 border border-emerald-400/40 rounded-2xl px-3.5 py-1.5 shadow">
              <span className="text-base">💵</span>
              <div>
                <div className="text-[9px] font-extrabold uppercase tracking-wider text-emerald-300 leading-none">
                  Era Dollar
                </div>
                <div className="text-sm font-black text-white">${eraDollars.toLocaleString()}</div>
              </div>
            </div>

            {/* Earn +80 Gems IELTS Quiz Button */}
            {onRewardGems && (
              <button
                type="button"
                onClick={() => {
                  setQuizIndex((prev) => (prev + 1) % IELTS_QUIZ_QUESTIONS.length);
                  setQuizSelected(null);
                  setShowQuizModal(true);
                }}
                className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>IELTS Quiz (+80 💎)</span>
              </button>
            )}

            {/* 3D ID Snapshot Button */}
            <button
              type="button"
              onClick={handleTakeSnapshot}
              className="px-3.5 py-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
              title="Capture 3D Student ID Portrait"
            >
              <Camera className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">3D ID Card</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MAIN 2-COLUMN WORKSPACE */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 overflow-hidden">
          {/* ==============================================================
              LEFT COLUMN (5 cols): INTERACTIVE 3D STUDIO VIEWPORT & PRESETS
             ============================================================== */}
          <div className="lg:col-span-5 p-4 sm:p-5 bg-slate-50 flex flex-col justify-between gap-3 overflow-y-auto">
            {/* Live 3D Stage */}
            <div
              className="relative w-full h-72 sm:h-80 lg:h-[360px] rounded-3xl overflow-hidden border-2 border-slate-200/80 shadow-inner shrink-0"
              style={{ background: currentStudioTheme.bg }}
            >
              <EraVerseAvatar3D
                {...activePreview}
                width={440}
                height={360}
                interactive={true}
                showPedestal={true}
                animationMode={animMode}
                cameraFocus={camFocus}
                autoSpin={autoSpin}
                studioTheme={studioThemeId}
                onSnapshotReady={(fn) => {
                  captureFnRef.current = fn;
                }}
                className="w-full h-full"
              />

              {/* Top-Left Camera Focus & Spin Controls */}
              <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setCamFocus(camFocus === 'full' ? 'face' : 'full')}
                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-extrabold backdrop-blur-md border transition-all cursor-pointer flex items-center gap-1 ${
                    camFocus === 'face'
                      ? 'bg-indigo-600 text-white border-indigo-400 shadow'
                      : 'bg-white/85 text-slate-800 border-slate-200 hover:bg-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{camFocus === 'face' ? 'Face Close-Up' : 'Full Body'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAutoSpin(!autoSpin)}
                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-extrabold backdrop-blur-md border transition-all cursor-pointer flex items-center gap-1 ${
                    autoSpin
                      ? 'bg-pink-600 text-white border-pink-400 shadow'
                      : 'bg-white/85 text-slate-800 border-slate-200 hover:bg-white'
                  }`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${autoSpin ? 'animate-spin' : ''}`} />
                  <span>Spin</span>
                </button>
              </div>

              {/* Top-Right Studio Backdrop Cycler */}
              <div className="absolute top-3 right-3">
                <button
                  type="button"
                  onClick={() => {
                    const idx = STUDIO_THEMES.findIndex((t) => t.id === studioThemeId);
                    const next = STUDIO_THEMES[(idx + 1) % STUDIO_THEMES.length];
                    setStudioThemeId(next.id);
                  }}
                  className="px-2.5 py-1.5 rounded-xl text-[11px] font-extrabold bg-white/85 hover:bg-white text-slate-800 border border-slate-200 backdrop-blur-md cursor-pointer flex items-center gap-1 shadow-xs"
                >
                  <Palette className="w-3.5 h-3.5 text-pink-600" />
                  <span>{currentStudioTheme.name}</span>
                </button>
              </div>

              {/* Bottom Pose Switcher Pill Bar */}
              <div className="absolute bottom-3 inset-x-3 flex items-center justify-center gap-1 bg-slate-900/80 backdrop-blur-md p-1.5 rounded-2xl border border-white/15">
                {(
                  [
                    { id: 'idle', label: 'Idle' },
                    { id: 'walk', label: 'Walk' },
                    { id: 'wave', label: 'Wave' },
                    { id: 'ride', label: 'Ride' },
                    { id: 'tpose', label: 'T-Pose' }
                  ] as const
                ).map((pose) => (
                  <button
                    key={pose.id}
                    type="button"
                    onClick={() => setAnimMode(pose.id)}
                    className={`flex-1 py-1 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer ${
                      animMode === pose.id
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {pose.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Try-On Floating Purchase Banner (when previewing a locked item) */}
            {tryOn && (
              <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-pink-950 text-white p-3.5 rounded-2xl border border-pink-400/40 shadow-lg flex flex-col gap-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-pink-300">
                      TRY-ON PREVIEW MODE
                    </span>
                    <h4 className="text-sm font-black text-white">{tryOn.item.name}</h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTryOn(null)}
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-slate-200 cursor-pointer"
                  >
                    Revert
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => executePurchase(tryOn.item, 'gems')}
                    className="flex-1 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-black text-xs cursor-pointer shadow"
                  >
                    Buy for 💎 {tryOn.item.price} Gems
                  </button>
                  <button
                    type="button"
                    onClick={() => executePurchase(tryOn.item, 'dollars')}
                    className="flex-1 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs cursor-pointer shadow"
                  >
                    Buy for 💵 ${tryOn.item.dollarPrice || Math.max(1, Math.round(tryOn.item.price / 10))}
                  </button>
                </div>
              </div>
            )}

            {/* Quick Reference Archetype Presets (#001 - #004) */}
            <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-700">
                  Quick Reference Archetypes (1-Click Style)
                </span>
                <span className="text-[10px] font-bold text-indigo-600">Instant Morph</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {REFERENCE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      updateAvatarFields({
                        ...preset.config,
                        gender: preset.config.gender === 'female' ? 'girl' : 'boy'
                      });
                    }}
                    className="p-2 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/40 text-left transition-all cursor-pointer"
                  >
                    <div className="text-[9px] font-black uppercase text-indigo-600">{preset.badge}</div>
                    <div className="text-xs font-black text-slate-900 truncate">{preset.name}</div>
                    <div className="text-[10px] text-slate-500 truncate">{preset.subtitle}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Candy Boutique Greeting + Save & Sync Button */}
            <div className="space-y-2.5">
              <div className="bg-white rounded-2xl p-3 border border-pink-200 flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-pink-400 shrink-0 bg-pink-50">
                  <EraVerseAvatar3D
                    gender="female"
                    skinTone="#FFE7D6"
                    hairStyle="twin_buns"
                    hairColor="#1C1917"
                    topStyle="qipao_daisy"
                    topColor="#EC4899"
                    bottomStyle="pleated_skirt"
                    bottomColor="#FFFFFF"
                    hatStyle="gold_crown"
                    size={48}
                    interactive={false}
                    showPedestal={false}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-xs text-slate-900">Candy</span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-pink-100 text-pink-700">
                      EraSHOP Stylist
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug mt-0.5">
                    "Customize your sculpted face, eyes, hair, layered outfits & bikes! Click any locked item to try it on live in 3D!"
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onSaveAndSync}
                className="w-full py-3.5 bg-gradient-to-r from-pink-600 via-rose-600 to-indigo-600 hover:from-pink-700 hover:to-indigo-700 text-white font-black text-sm rounded-2xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Save & Sync 3D Character to EraVerse & Dashboard</span>
              </button>
            </div>
          </div>

          {/* ==============================================================
              RIGHT COLUMN (7 cols): 6-TAB WARDROBE & ANATOMICAL CUSTOMIZER
             ============================================================== */}
          <div className="lg:col-span-7 flex flex-col min-h-0 bg-white">
            {/* 6 Main Category Tabs */}
            <div className="px-4 pt-3 pb-2.5 bg-slate-50 border-b border-slate-200 grid grid-cols-3 sm:grid-cols-6 gap-1.5 shrink-0">
              {(
                [
                  { id: 'body', label: 'Body/Skin', badge: 'FREE', icon: User },
                  { id: 'hair', label: 'Hair', badge: '12 Styles', icon: Scissors },
                  { id: 'clothes', label: 'Clothes', badge: 'Layered', icon: Shirt },
                  { id: 'headgear', label: 'Headgear', badge: 'Hats/Clips', icon: Crown },
                  { id: 'props', label: 'Props', badge: 'Gear', icon: Glasses },
                  { id: 'bikes', label: 'Bikes', badge: '3D Rides', icon: Bike }
                ] as const
              ).map((t) => {
                const Icon = t.icon;
                const active = mainTab === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setMainTab(t.id);
                      if (t.id === 'body' && (bodySubTab === 'eyes_brows' || bodySubTab === 'nose_mouth')) {
                        setCamFocus('face');
                      } else if (t.id === 'bikes') {
                        setCamFocus('full');
                      }
                    }}
                    className={`p-2 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                      active
                        ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-xs font-black leading-tight">{t.label}</span>
                    <span
                      className={`text-[9px] font-extrabold px-1.5 rounded-full ${
                        active ? 'bg-pink-500 text-white' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {t.badge}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* TAB CONTENT AREA */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* ============================================================
                  TAB 1: BODY, SKIN & SCULPTED FACIAL ANATOMY (100% FREE)
                 ============================================================ */}
              {mainTab === 'body' && (
                <div className="space-y-5">
                  {/* 4 Anatomical Sub-Tabs */}
                  <div className="flex flex-wrap gap-2 pb-3 border-b border-slate-200">
                    {(
                      [
                        { id: 'skin_body', label: '1. Skin & Proportions', focus: 'full' as const },
                        { id: 'face_ears', label: '2. Face Shape & Ears', focus: 'face' as const },
                        { id: 'eyes_brows', label: '3. Eyes & Eyebrows', focus: 'face' as const },
                        { id: 'nose_mouth', label: '4. Nose, Lips & Details', focus: 'face' as const }
                      ]
                    ).map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => {
                          setBodySubTab(st.id as BodySubTab);
                          setCamFocus(st.focus);
                        }}
                        className={`px-3.5 py-2 rounded-xl font-extrabold text-xs border transition-all cursor-pointer ${
                          bodySubTab === st.id
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-indigo-400'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>

                  {bodySubTab === 'skin_body' && (
                    <div className="space-y-5">
                      {/* Gender & Nickname */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                            Character Gender
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {(
                              [
                                { id: 'boy', label: '👦 Boy / Male' },
                                { id: 'girl', label: '👧 Girl / Female' }
                              ] as const
                            ).map((g) => {
                              const isSelected =
                                (g.id === 'girl' && activePreview.gender === 'female') ||
                                (g.id === 'boy' && activePreview.gender === 'male');
                              return (
                                <button
                                  key={g.id}
                                  type="button"
                                  onClick={() =>
                                    updateAvatarFields({
                                      gender: g.id,
                                      hairStyle: g.id === 'girl' ? 'twin_buns' : 'fluffy_swept'
                                    })
                                  }
                                  className={`py-2.5 px-3 rounded-xl font-extrabold text-xs border-2 cursor-pointer transition-all ${
                                    isSelected
                                      ? 'border-indigo-600 bg-indigo-50 text-indigo-950 shadow-xs'
                                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                                  }`}
                                >
                                  {g.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                            Character Nickname
                          </label>
                          <input
                            type="text"
                            value={playerProfile.name || ''}
                            onChange={(e) => updateAvatarFields({ name: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600"
                          />
                        </div>
                      </div>

                      {/* 16 Skin Tones */}
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                          Natural PBR Skin Tone (16 Shades — FREE)
                        </label>
                        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                          {SKIN_TONES.map((tone) => (
                            <button
                              key={tone.id}
                              type="button"
                              onClick={() => updateAvatarFields({ skinTone: tone.hex })}
                              className={`group p-1.5 rounded-xl border-2 flex flex-col items-center gap-1 cursor-pointer transition-all ${
                                activePreview.skinTone.toLowerCase() === tone.hex.toLowerCase()
                                  ? 'border-indigo-600 bg-indigo-50/50 scale-105 shadow-xs'
                                  : 'border-slate-200 hover:border-slate-400'
                              }`}
                              title={tone.name}
                            >
                              <span
                                className="w-7 h-7 rounded-full border border-black/10 shadow-inner"
                                style={{ backgroundColor: tone.hex }}
                              />
                              <span className="text-[9px] font-bold text-slate-600 truncate w-full text-center">
                                {tone.name.split(' ')[1] || tone.name}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Body Proportions Sliders */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                        <div>
                          <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                            <span>Height Scale</span>
                            <span className="text-indigo-600">{Math.round(activePreview.bodyScale * 100)}%</span>
                          </div>
                          <input
                            type="range"
                            min={0.88}
                            max={1.12}
                            step={0.01}
                            value={activePreview.bodyScale}
                            onChange={(e) => updateAvatarFields({ bodyScale: parseFloat(e.target.value) })}
                            className="w-full accent-indigo-600 cursor-pointer"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                            <span>Body Build / Softness</span>
                            <span className="text-indigo-600">{Math.round(activePreview.chubbiness * 100)}%</span>
                          </div>
                          <input
                            type="range"
                            min={0.88}
                            max={1.15}
                            step={0.01}
                            value={activePreview.chubbiness}
                            onChange={(e) => updateAvatarFields({ chubbiness: parseFloat(e.target.value) })}
                            className="w-full accent-indigo-600 cursor-pointer"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                            <span>Head Proportion</span>
                            <span className="text-indigo-600">{Math.round(activePreview.headScale * 100)}%</span>
                          </div>
                          <input
                            type="range"
                            min={0.92}
                            max={1.16}
                            step={0.01}
                            value={activePreview.headScale}
                            onChange={(e) => updateAvatarFields({ headScale: parseFloat(e.target.value) })}
                            className="w-full accent-indigo-600 cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {bodySubTab === 'face_ears' && (
                    <div className="space-y-5">
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                          3D Sculpted Face & Jawline Shape (10 Topologies)
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                          {FACE_SHAPES.map((fs) => (
                            <button
                              key={fs.id}
                              type="button"
                              onClick={() => updateAvatarFields({ faceShape: fs.id })}
                              className={`p-3 rounded-xl border-2 text-left cursor-pointer transition-all ${
                                activePreview.faceShape === fs.id
                                  ? 'border-indigo-600 bg-indigo-50/60 shadow-xs'
                                  : 'border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              <div className="text-xs font-black text-slate-900">{fs.name}</div>
                              <div className="text-[10px] text-slate-500 mt-0.5">{fs.desc}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                        <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                          <span>Chin & Jawline Definition</span>
                          <span className="text-indigo-600">{Math.round(activePreview.jawDefine * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min={0.1}
                          max={1.0}
                          step={0.05}
                          value={activePreview.jawDefine}
                          onChange={(e) => updateAvatarFields({ jawDefine: parseFloat(e.target.value) })}
                          className="w-full accent-indigo-600 cursor-pointer"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                          Ear Style & Piercings
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                          {EAR_STYLES.map((ear) => (
                            <button
                              key={ear.id}
                              type="button"
                              onClick={() => updateAvatarFields({ earStyle: ear.id })}
                              className={`p-2.5 rounded-xl border-2 font-bold text-xs cursor-pointer transition-all ${
                                activePreview.earStyle === ear.id
                                  ? 'border-indigo-600 bg-indigo-50 text-indigo-950'
                                  : 'border-slate-200 text-slate-700 hover:border-slate-300'
                              }`}
                            >
                              {ear.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {bodySubTab === 'eyes_brows' && (
                    <div className="space-y-5">
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                          Eye Shape (6 Anatomical Styles)
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {EYE_SHAPES.map((es) => (
                            <button
                              key={es.id}
                              type="button"
                              onClick={() => updateAvatarFields({ eyeShape: es.id })}
                              className={`p-2.5 rounded-xl border-2 font-bold text-xs cursor-pointer transition-all ${
                                activePreview.eyeShape === es.id
                                  ? 'border-indigo-600 bg-indigo-50 text-indigo-950'
                                  : 'border-slate-200 text-slate-700 hover:border-slate-300'
                              }`}
                            >
                              {es.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                          Procedural Radial Iris Color (12 Colors)
                        </label>
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                          {EYE_COLORS.map((ec) => (
                            <button
                              key={ec.id}
                              type="button"
                              onClick={() => updateAvatarFields({ eyeColor: ec.id })}
                              className={`p-2 rounded-xl border-2 flex flex-col items-center gap-1 cursor-pointer transition-all ${
                                activePreview.eyeColor === ec.id
                                  ? 'border-indigo-600 bg-indigo-50 scale-105'
                                  : 'border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              <span
                                className="w-6 h-6 rounded-full border-2 border-white shadow"
                                style={{ backgroundColor: ec.hex }}
                              />
                              <span className="text-[10px] font-bold text-slate-700 truncate w-full text-center">
                                {ec.name.split(' ')[1] || ec.name}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                          3D Eyebrow Shape
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {EYEBROW_STYLES.map((eb) => (
                            <button
                              key={eb.id}
                              type="button"
                              onClick={() => updateAvatarFields({ eyebrowStyle: eb.id })}
                              className={`p-2.5 rounded-xl border-2 font-bold text-xs cursor-pointer transition-all ${
                                activePreview.eyebrowStyle === eb.id
                                  ? 'border-indigo-600 bg-indigo-50 text-indigo-950'
                                  : 'border-slate-200 text-slate-700 hover:border-slate-300'
                              }`}
                            >
                              {eb.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {bodySubTab === 'nose_mouth' && (
                    <div className="space-y-5">
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                          Sculpted 3D Nose Bridge & Tip
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {NOSE_SHAPES.map((ns) => (
                            <button
                              key={ns.id}
                              type="button"
                              onClick={() => updateAvatarFields({ noseShape: ns.id })}
                              className={`p-2.5 rounded-xl border-2 font-bold text-xs cursor-pointer transition-all ${
                                activePreview.noseShape === ns.id
                                  ? 'border-indigo-600 bg-indigo-50 text-indigo-950'
                                  : 'border-slate-200 text-slate-700 hover:border-slate-300'
                              }`}
                            >
                              {ns.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                          Mouth & Lip Expression (8 Styles)
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {MOUTH_STYLES.map((ms) => (
                            <button
                              key={ms.id}
                              type="button"
                              onClick={() => updateAvatarFields({ mouthStyle: ms.id })}
                              className={`p-2.5 rounded-xl border-2 font-bold text-xs cursor-pointer transition-all ${
                                activePreview.mouthStyle === ms.id
                                  ? 'border-indigo-600 bg-indigo-50 text-indigo-950'
                                  : 'border-slate-200 text-slate-700 hover:border-slate-300'
                              }`}
                            >
                              {ms.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-black uppercase tracking-wider text-slate-700">
                            Freckles, Beauty Marks & Blush
                          </label>
                          <button
                            type="button"
                            onClick={() => updateAvatarFields({ blush: !activePreview.blush })}
                            className={`px-3 py-1 rounded-full text-xs font-extrabold cursor-pointer border ${
                              activePreview.blush
                                ? 'bg-rose-100 text-rose-800 border-rose-300'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            Cheek Blush: {activePreview.blush ? 'ON' : 'OFF'}
                          </button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {SKIN_DETAILS.map((sd) => (
                            <button
                              key={sd.id}
                              type="button"
                              onClick={() => updateAvatarFields({ skinDetail: sd.id })}
                              className={`p-2.5 rounded-xl border-2 font-bold text-xs cursor-pointer transition-all ${
                                activePreview.skinDetail === sd.id
                                  ? 'border-indigo-600 bg-indigo-50 text-indigo-950'
                                  : 'border-slate-200 text-slate-700 hover:border-slate-300'
                              }`}
                            >
                              {sd.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ============================================================
                  TAB 2: VOLUMETRIC 3D HAIRSTYLES & HAIR COLOR
                 ============================================================ */}
              {mainTab === 'hair' && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                      Hair Color Palette (15 Natural & Fantasy Shades — FREE)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {HAIR_COLORS.map((hc) => (
                        <button
                          key={hc.id}
                          type="button"
                          onClick={() => updateAvatarFields({ hairColor: hc.hex })}
                          className={`w-9 h-9 rounded-xl border-2 cursor-pointer transition-transform ${
                            activePreview.hairColor.toLowerCase() === hc.hex.toLowerCase()
                              ? 'scale-110 border-indigo-600 shadow-md ring-2 ring-indigo-300'
                              : 'border-slate-200 hover:scale-105'
                          }`}
                          style={{ backgroundColor: hc.hex }}
                          title={hc.name}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                      Volumetric Sculpted 3D Hairstyles (4 FREE + 8 Boutique Cuts)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {HAIRSTYLES.map((h) => {
                        const owned = checkIsOwned(h.id, h.price);
                        const equipped = activePreview.hairStyle === h.id;
                        return (
                          <div
                            key={h.id}
                            onClick={() =>
                              handleSelectCatalogItem(
                                h.id,
                                h.name,
                                h.price,
                                h.dollarPrice,
                                h.badge,
                                h.desc,
                                'hairStyle',
                                h.id
                              )
                            }
                            className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                              equipped
                                ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                                : owned
                                ? 'border-slate-200 hover:border-indigo-300 bg-white'
                                : 'border-slate-200 hover:border-pink-400 bg-slate-50/60'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800">
                                  {h.badge}
                                </span>
                                {owned ? (
                                  <span className="text-[11px] font-black text-emerald-700 flex items-center gap-1">
                                    <Check className="w-3.5 h-3.5" /> {h.price === 0 ? 'FREE' : 'Owned'}
                                  </span>
                                ) : (
                                  <span className="text-[11px] font-black text-pink-700">
                                    💎 {h.price} • 💵 ${h.dollarPrice}
                                  </span>
                                )}
                              </div>
                              <div className="text-sm font-black text-slate-900">{h.name}</div>
                              <div className="text-[11px] text-slate-500 mt-0.5">{h.desc}</div>
                            </div>

                            {!owned && (
                              <div
                                className="flex gap-1.5 pt-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  type="button"
                                  onClick={() =>
                                    executePurchase(
                                      {
                                        id: h.id,
                                        name: h.name,
                                        category: 'hair',
                                        price: h.price,
                                        dollarPrice: h.dollarPrice,
                                        badge: h.badge,
                                        desc: h.desc,
                                        previewColor: 'from-pink-500 to-indigo-600',
                                        applyKey: 'hairStyle',
                                        applyValue: h.id,
                                        extraUpdates: { hairStyle: h.id }
                                      },
                                      'gems'
                                    )
                                  }
                                  className="flex-1 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-700 text-white font-black text-[11px] cursor-pointer"
                                >
                                  💎 {h.price}
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    executePurchase(
                                      {
                                        id: h.id,
                                        name: h.name,
                                        category: 'hair',
                                        price: h.price,
                                        dollarPrice: h.dollarPrice,
                                        badge: h.badge,
                                        desc: h.desc,
                                        previewColor: 'from-emerald-500 to-teal-600',
                                        applyKey: 'hairStyle',
                                        applyValue: h.id,
                                        extraUpdates: { hairStyle: h.id }
                                      },
                                      'dollars'
                                    )
                                  }
                                  className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] cursor-pointer"
                                >
                                  💵 ${h.dollarPrice}
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ============================================================
                  TAB 3: LAYERED CLOTHING (TOPS, JACKETS, BOTTOMS, BELTS, SHOES)
                 ============================================================ */}
              {mainTab === 'clothes' && (
                <div className="space-y-5">
                  {/* 5 Clothing Sub-Tabs */}
                  <div className="flex flex-wrap gap-1.5 pb-3 border-b border-slate-200">
                    {(
                      [
                        { id: 'tops', label: '👕 Inner Tops (7)' },
                        { id: 'jackets', label: '🧥 Outer Jackets/Vests (8)' },
                        { id: 'bottoms', label: '👖 Pants & Skirts (7)' },
                        { id: 'belts', label: '✨ Waist Belts (5)' },
                        { id: 'shoes', label: '👟 3D Footwear (6)' }
                      ] as const
                    ).map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setClothesSubTab(st.id)}
                        className={`px-3 py-2 rounded-xl font-extrabold text-xs border transition-all cursor-pointer ${
                          clothesSubTab === st.id
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-indigo-400'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>

                  {/* Color Swatches for active clothing layer */}
                  {clothesSubTab === 'tops' && (
                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2.5">
                      <div>
                        <span className="block text-[11px] font-black uppercase text-slate-600 mb-1.5">
                          Top Primary Fabric Color
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {CLOTHING_PALETTE.map((hex) => (
                            <button
                              key={hex}
                              type="button"
                              onClick={() => updateAvatarFields({ topColor: hex })}
                              className={`w-7 h-7 rounded-lg border-2 cursor-pointer ${
                                activePreview.topColor.toLowerCase() === hex.toLowerCase()
                                  ? 'border-slate-950 scale-110 shadow'
                                  : 'border-slate-200'
                              }`}
                              style={{ backgroundColor: hex }}
                            />
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="block text-[11px] font-black uppercase text-slate-600 mb-1.5">
                          Collar / Badge / Piping Trim Color
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {CLOTHING_PALETTE.slice(0, 12).map((hex) => (
                            <button
                              key={hex}
                              type="button"
                              onClick={() => updateAvatarFields({ topSecondary: hex })}
                              className={`w-6 h-6 rounded-lg border cursor-pointer ${
                                activePreview.topSecondary.toLowerCase() === hex.toLowerCase()
                                  ? 'border-slate-950 scale-110 shadow'
                                  : 'border-slate-200'
                              }`}
                              style={{ backgroundColor: hex }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {clothesSubTab === 'jackets' && (
                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                      <span className="block text-[11px] font-black uppercase text-slate-600">
                        Jacket / Vest Primary & Pocket Accent Color
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {CLOTHING_PALETTE.map((hex) => (
                          <button
                            key={hex}
                            type="button"
                            onClick={() => updateAvatarFields({ jacketPrimary: hex })}
                            className={`w-7 h-7 rounded-lg border-2 cursor-pointer ${
                              activePreview.jacketPrimary.toLowerCase() === hex.toLowerCase()
                                ? 'border-slate-950 scale-110 shadow'
                                : 'border-slate-200'
                            }`}
                            style={{ backgroundColor: hex }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {clothesSubTab === 'bottoms' && (
                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                      <span className="block text-[11px] font-black uppercase text-slate-600">
                        Pants / Shorts / Pleated Skirt Color
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {CLOTHING_PALETTE.map((hex) => (
                          <button
                            key={hex}
                            type="button"
                            onClick={() => updateAvatarFields({ bottomColor: hex })}
                            className={`w-7 h-7 rounded-lg border-2 cursor-pointer ${
                              activePreview.bottomColor.toLowerCase() === hex.toLowerCase()
                                ? 'border-slate-950 scale-110 shadow'
                                : 'border-slate-200'
                            }`}
                            style={{ backgroundColor: hex }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {clothesSubTab === 'shoes' && (
                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                      <span className="block text-[11px] font-black uppercase text-slate-600">
                        3D Shoe Color
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {CLOTHING_PALETTE.map((hex) => (
                          <button
                            key={hex}
                            type="button"
                            onClick={() => updateAvatarFields({ shoeColor: hex })}
                            className={`w-7 h-7 rounded-lg border-2 cursor-pointer ${
                              activePreview.shoeColor.toLowerCase() === hex.toLowerCase()
                                ? 'border-slate-950 scale-110 shadow'
                                : 'border-slate-200'
                            }`}
                            style={{ backgroundColor: hex }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Catalog Cards for Selected Clothing Sub-Tab */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(clothesSubTab === 'tops'
                      ? TOP_STYLES.map((it) => ({
                          ...it,
                          applyKey: 'topStyle',
                          equipped: activePreview.topStyle === it.id,
                          extra: {
                            topStyle: it.id,
                            topColor: it.defaultPrimary,
                            topSecondary: it.defaultSecondary
                          }
                        }))
                      : clothesSubTab === 'jackets'
                      ? JACKET_STYLES.map((it) => ({
                          ...it,
                          applyKey: 'jacketStyle',
                          equipped: activePreview.jacketStyle === it.id,
                          extra: {
                            jacketStyle: it.id,
                            jacketPrimary: it.defaultPrimary,
                            jacketSecondary: it.defaultSecondary
                          }
                        }))
                      : clothesSubTab === 'bottoms'
                      ? BOTTOM_STYLES.map((it) => ({
                          ...it,
                          applyKey: 'bottomStyle',
                          equipped: activePreview.bottomStyle === it.id,
                          extra: { bottomStyle: it.id, bottomColor: it.defaultColor }
                        }))
                      : clothesSubTab === 'belts'
                      ? BELT_STYLES.map((it) => ({
                          ...it,
                          applyKey: 'beltStyle',
                          equipped: activePreview.beltStyle === it.id,
                          extra: { beltStyle: it.id }
                        }))
                      : SHOE_STYLES.map((it) => ({
                          ...it,
                          applyKey: 'shoeStyle',
                          equipped: activePreview.shoeStyle === it.id,
                          extra: { shoeStyle: it.id, shoeColor: it.defaultColor }
                        }))
                    ).map((item) => {
                      const owned = checkIsOwned(item.id, item.price);
                      return (
                        <div
                          key={item.id}
                          onClick={() =>
                            handleSelectCatalogItem(
                              item.id,
                              item.name,
                              item.price,
                              item.dollarPrice,
                              item.badge,
                              item.desc,
                              item.applyKey,
                              item.id,
                              item.extra
                            )
                          }
                          className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                            item.equipped
                              ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                              : owned
                              ? 'border-slate-200 hover:border-indigo-300 bg-white'
                              : 'border-slate-200 hover:border-pink-400 bg-slate-50/60'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800">
                                {item.badge}
                              </span>
                              {owned ? (
                                <span className="text-[11px] font-black text-emerald-700 flex items-center gap-1">
                                  <Check className="w-3.5 h-3.5" /> {item.price === 0 ? 'FREE' : 'Owned'}
                                </span>
                              ) : (
                                <span className="text-[11px] font-black text-pink-700">
                                  💎 {item.price} • 💵 ${item.dollarPrice}
                                </span>
                              )}
                            </div>
                            <div className="text-sm font-black text-slate-900">{item.name}</div>
                            <div className="text-[11px] text-slate-500 mt-0.5">{item.desc}</div>
                          </div>

                          {!owned && (
                            <div className="flex gap-1.5 pt-1" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={() =>
                                  executePurchase(
                                    {
                                      id: item.id,
                                      name: item.name,
                                      category: 'clothes',
                                      price: item.price,
                                      dollarPrice: item.dollarPrice,
                                      badge: item.badge,
                                      desc: item.desc,
                                      previewColor: 'from-pink-500 to-indigo-600',
                                      applyKey: item.applyKey,
                                      applyValue: item.id,
                                      extraUpdates: item.extra
                                    },
                                    'gems'
                                  )
                                }
                                className="flex-1 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-700 text-white font-black text-[11px] cursor-pointer"
                              >
                                Buy 💎 {item.price}
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  executePurchase(
                                    {
                                      id: item.id,
                                      name: item.name,
                                      category: 'clothes',
                                      price: item.price,
                                      dollarPrice: item.dollarPrice,
                                      badge: item.badge,
                                      desc: item.desc,
                                      previewColor: 'from-emerald-500 to-teal-600',
                                      applyKey: item.applyKey,
                                      applyValue: item.id,
                                      extraUpdates: item.extra
                                    },
                                    'dollars'
                                  )
                                }
                                className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] cursor-pointer"
                              >
                                Buy 💵 ${item.dollarPrice}
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ============================================================
                  TAB 4: 3D HEADGEAR, HAIR CLIPS, CROWNS & HEADPHONES
                 ============================================================ */}
              {mainTab === 'headgear' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {HEADGEAR_ITEMS.map((item) => {
                    const owned = checkIsOwned(item.id, item.price);
                    const equipped = activePreview.hatStyle === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() =>
                          handleSelectCatalogItem(
                            item.id,
                            item.name,
                            item.price,
                            item.dollarPrice,
                            item.badge,
                            item.desc,
                            'hatStyle',
                            item.id
                          )
                        }
                        className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                          equipped
                            ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                            : owned
                            ? 'border-slate-200 hover:border-indigo-300 bg-white'
                            : 'border-slate-200 hover:border-pink-400 bg-slate-50/60'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800">
                              {item.badge}
                            </span>
                            {owned ? (
                              <span className="text-[11px] font-black text-emerald-700 flex items-center gap-1">
                                <Check className="w-3.5 h-3.5" /> {item.price === 0 ? 'FREE' : 'Owned'}
                              </span>
                            ) : (
                              <span className="text-[11px] font-black text-pink-700">
                                💎 {item.price} • 💵 ${item.dollarPrice}
                              </span>
                            )}
                          </div>
                          <div className="text-sm font-black text-slate-900">{item.name}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{item.desc}</div>
                        </div>

                        {!owned && (
                          <div className="flex gap-1.5 pt-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() =>
                                executePurchase(
                                  {
                                    id: item.id,
                                    name: item.name,
                                    category: 'headgear',
                                    price: item.price,
                                    dollarPrice: item.dollarPrice,
                                    badge: item.badge,
                                    desc: item.desc,
                                    previewColor: 'from-pink-500 to-indigo-600',
                                    applyKey: 'hatStyle',
                                    applyValue: item.id,
                                    extraUpdates: { hatStyle: item.id }
                                  },
                                  'gems'
                                )
                              }
                              className="flex-1 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-700 text-white font-black text-[11px] cursor-pointer"
                            >
                              Buy 💎 {item.price}
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                executePurchase(
                                  {
                                    id: item.id,
                                    name: item.name,
                                    category: 'headgear',
                                    price: item.price,
                                    dollarPrice: item.dollarPrice,
                                    badge: item.badge,
                                    desc: item.desc,
                                    previewColor: 'from-emerald-500 to-teal-600',
                                    applyKey: 'hatStyle',
                                    applyValue: item.id,
                                    extraUpdates: { hatStyle: item.id }
                                  },
                                  'dollars'
                                )
                              }
                              className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] cursor-pointer"
                            >
                              Buy 💵 ${item.dollarPrice}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ============================================================
                  TAB 5: 3D WEARABLE PROPS (GLASSES, SMARTWATCH, BACKPACK, WINGS)
                 ============================================================ */}
              {mainTab === 'props' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-200">
                    <span className="text-xs font-bold text-slate-600">
                      Equip multiple accessories together (Eyewear + Wristwatch + Backpack/Wings + Neckwear)
                    </span>
                    {activePreview.accessories.length > 0 && (
                      <button
                        type="button"
                        onClick={() => updateAvatarFields({ accessories: [], accessoryType: 'none', glassesStyle: 'None' })}
                        className="px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-xs font-bold text-slate-800 cursor-pointer"
                      >
                        Clear All Props
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {ACCESSORY_ITEMS.map((item) => {
                      const owned = checkIsOwned(item.id, item.price);
                      const equipped = activePreview.accessories.includes(item.id);

                      const computeNextAccessories = () => {
                        const current = [...activePreview.accessories];
                        if (current.includes(item.id)) {
                          return current.filter((x) => x !== item.id);
                        }
                        // Replace same-slot prop so eyewear doesn't stack on eyewear
                        const sameSlotIds = ACCESSORY_ITEMS.filter((a) => a.slot === item.slot).map((a) => a.id);
                        const filtered = current.filter((x) => !sameSlotIds.includes(x));
                        return [...filtered, item.id];
                      };

                      return (
                        <div
                          key={item.id}
                          onClick={() => {
                            const nextAcc = computeNextAccessories();
                            handleSelectCatalogItem(
                              item.id,
                              item.name,
                              item.price,
                              item.dollarPrice,
                              item.badge,
                              item.desc,
                              'accessories',
                              nextAcc,
                              { accessories: nextAcc }
                            );
                          }}
                          className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                            equipped
                              ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                              : owned
                              ? 'border-slate-200 hover:border-indigo-300 bg-white'
                              : 'border-slate-200 hover:border-pink-400 bg-slate-50/60'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800">
                                {item.badge} • {item.slot.toUpperCase()}
                              </span>
                              {owned ? (
                                <span className="text-[11px] font-black text-emerald-700 flex items-center gap-1">
                                  <Check className="w-3.5 h-3.5" /> {equipped ? 'Equipped' : 'Owned'}
                                </span>
                              ) : (
                                <span className="text-[11px] font-black text-pink-700">
                                  💎 {item.price} • 💵 ${item.dollarPrice}
                                </span>
                              )}
                            </div>
                            <div className="text-sm font-black text-slate-900">{item.name}</div>
                            <div className="text-[11px] text-slate-500 mt-0.5">{item.desc}</div>
                          </div>

                          {!owned && (
                            <div className="flex gap-1.5 pt-1" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={() => {
                                  const nextAcc = computeNextAccessories();
                                  executePurchase(
                                    {
                                      id: item.id,
                                      name: item.name,
                                      category: 'accessories',
                                      price: item.price,
                                      dollarPrice: item.dollarPrice,
                                      badge: item.badge,
                                      desc: item.desc,
                                      previewColor: 'from-pink-500 to-indigo-600',
                                      applyKey: 'accessories',
                                      applyValue: item.id,
                                      extraUpdates: { accessories: nextAcc }
                                    },
                                    'gems'
                                  );
                                }}
                                className="flex-1 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-700 text-white font-black text-[11px] cursor-pointer"
                              >
                                Buy 💎 {item.price}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const nextAcc = computeNextAccessories();
                                  executePurchase(
                                    {
                                      id: item.id,
                                      name: item.name,
                                      category: 'accessories',
                                      price: item.price,
                                      dollarPrice: item.dollarPrice,
                                      badge: item.badge,
                                      desc: item.desc,
                                      previewColor: 'from-emerald-500 to-teal-600',
                                      applyKey: 'accessories',
                                      applyValue: item.id,
                                      extraUpdates: { accessories: nextAcc }
                                    },
                                    'dollars'
                                  );
                                }}
                                className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] cursor-pointer"
                              >
                                Buy 💵 ${item.dollarPrice}
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ============================================================
                  TAB 6: 3D BICYCLES, SKATEBOARDS, SCOOTER & EXAM DESK
                 ============================================================ */}
              {mainTab === 'bikes' && (
                <div className="space-y-4">
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                    <span className="block text-[11px] font-black uppercase text-slate-600">
                      Vehicle Custom Paint Color
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {CLOTHING_PALETTE.slice(0, 14).map((hex) => (
                        <button
                          key={hex}
                          type="button"
                          onClick={() => updateAvatarFields({ bikeColor: hex })}
                          className={`w-7 h-7 rounded-lg border-2 cursor-pointer ${
                            activePreview.bikeColor.toLowerCase() === hex.toLowerCase()
                              ? 'border-slate-950 scale-110 shadow'
                              : 'border-slate-200'
                          }`}
                          style={{ backgroundColor: hex }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {VEHICLE_ITEMS.map((item) => {
                      const owned = checkIsOwned(item.id, item.price);
                      const equipped = activePreview.rideStyle === item.id;
                      return (
                        <div
                          key={item.id}
                          onClick={() =>
                            handleSelectCatalogItem(
                              item.id,
                              item.name,
                              item.price,
                              item.dollarPrice,
                              item.badge,
                              item.desc,
                              'rideStyle',
                              item.id,
                              {
                                rideStyle: item.id,
                                vehicleType:
                                  item.id === 'cruiser_bike' || item.id === 'gold_bike'
                                    ? 'bike'
                                    : item.id === 'skateboard' || item.id === 'scooter'
                                    ? 'skateboard'
                                    : 'none'
                              }
                            )
                          }
                          className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                            equipped
                              ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                              : owned
                              ? 'border-slate-200 hover:border-indigo-300 bg-white'
                              : 'border-slate-200 hover:border-pink-400 bg-slate-50/60'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800">
                                {item.badge}
                              </span>
                              {owned ? (
                                <span className="text-[11px] font-black text-emerald-700 flex items-center gap-1">
                                  <Check className="w-3.5 h-3.5" /> {item.price === 0 ? 'FREE' : 'Owned'}
                                </span>
                              ) : (
                                <span className="text-[11px] font-black text-pink-700">
                                  💎 {item.price} • 💵 ${item.dollarPrice}
                                </span>
                              )}
                            </div>
                            <div className="text-sm font-black text-slate-900">{item.name}</div>
                            <div className="text-[11px] text-slate-500 mt-0.5">{item.desc}</div>
                          </div>

                          {!owned && (
                            <div className="flex gap-1.5 pt-1" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={() =>
                                  executePurchase(
                                    {
                                      id: item.id,
                                      name: item.name,
                                      category: 'vehicles',
                                      price: item.price,
                                      dollarPrice: item.dollarPrice,
                                      badge: item.badge,
                                      desc: item.desc,
                                      previewColor: 'from-pink-500 to-indigo-600',
                                      applyKey: 'rideStyle',
                                      applyValue: item.id,
                                      extraUpdates: {
                                        rideStyle: item.id,
                                        vehicleType:
                                          item.id === 'cruiser_bike' || item.id === 'gold_bike'
                                            ? 'bike'
                                            : 'skateboard'
                                      }
                                    },
                                    'gems'
                                  )
                                }
                                className="flex-1 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-700 text-white font-black text-[11px] cursor-pointer"
                              >
                                Buy 💎 {item.price}
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  executePurchase(
                                    {
                                      id: item.id,
                                      name: item.name,
                                      category: 'vehicles',
                                      price: item.price,
                                      dollarPrice: item.dollarPrice,
                                      badge: item.badge,
                                      desc: item.desc,
                                      previewColor: 'from-emerald-500 to-teal-600',
                                      applyKey: 'rideStyle',
                                      applyValue: item.id,
                                      extraUpdates: {
                                        rideStyle: item.id,
                                        vehicleType:
                                          item.id === 'cruiser_bike' || item.id === 'gold_bike'
                                            ? 'bike'
                                            : 'skateboard'
                                      }
                                    },
                                    'dollars'
                                  )
                                }
                                className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] cursor-pointer"
                              >
                                Buy 💵 ${item.dollarPrice}
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================================
          SUB-MODAL A: 3D STUDENT ID CARD SNAPSHOT & PNG DOWNLOAD
         ==================================================================== */}
      {snapshotDataUrl && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-indigo-600">
                OFFICIAL ERAVERSE 3D STUDENT ID
              </span>
              <button
                type="button"
                onClick={() => setSnapshotDataUrl(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden border-2 border-indigo-100 bg-gradient-to-b from-sky-50 to-indigo-50 p-4 shadow-inner">
              <img
                src={snapshotDataUrl}
                alt="3D Student Avatar"
                className="w-56 h-56 object-contain mx-auto"
              />
              <div className="mt-2 pt-2 border-t border-indigo-200/60">
                <div className="text-lg font-black text-slate-900">{playerProfile.name}</div>
                <div className="text-xs font-bold text-indigo-600">{playerProfile.cohort} • Kỷ Nguyên Era</div>
              </div>
            </div>

            <div className="flex gap-2">
              <a
                href={snapshotDataUrl}
                download={`${(playerProfile.name || 'student').toLowerCase()}-3d-avatar.png`}
                className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download PNG Portrait</span>
              </a>
              <button
                type="button"
                onClick={() => setSnapshotDataUrl(null)}
                className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          SUB-MODAL B: IELTS VOCABULARY QUIZ (+80 ERA GEMS REWARD)
         ==================================================================== */}
      {showQuizModal && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-amber-300 space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-black text-xs">
                ⚡ IELTS BOOSTER QUIZ • +80 💎 ERA GEMS
              </span>
              <button
                type="button"
                onClick={() => setShowQuizModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h3 className="text-base font-black text-slate-900">
              {IELTS_QUIZ_QUESTIONS[quizIndex].q}
            </h3>

            <div className="grid grid-cols-1 gap-2">
              {IELTS_QUIZ_QUESTIONS[quizIndex].options.map((opt, idx) => {
                const isCorrect = idx === IELTS_QUIZ_QUESTIONS[quizIndex].correct;
                const isChosen = quizSelected === idx;
                return (
                  <button
                    key={opt}
                    type="button"
                    disabled={quizSelected !== null}
                    onClick={() => {
                      setQuizSelected(idx);
                      if (isCorrect && onRewardGems) {
                        onRewardGems(80, 5, 'Correct IELTS Booster Quiz Answer!');
                      }
                    }}
                    className={`p-3.5 rounded-xl border-2 text-left font-bold text-xs transition-all cursor-pointer flex items-center justify-between ${
                      quizSelected === null
                        ? 'border-slate-200 hover:border-indigo-500 bg-slate-50'
                        : isCorrect
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-950'
                        : isChosen
                        ? 'border-rose-500 bg-rose-50 text-rose-950'
                        : 'border-slate-200 opacity-60'
                    }`}
                  >
                    <span>{opt}</span>
                    {quizSelected !== null && isCorrect && (
                      <span className="text-emerald-700 font-black">+80 💎</span>
                    )}
                  </button>
                );
              })}
            </div>

            {quizSelected !== null && (
              <div className="p-3.5 rounded-2xl bg-slate-100 text-xs text-slate-700 space-y-2">
                <p className="font-bold">{IELTS_QUIZ_QUESTIONS[quizIndex].explanation}</p>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setQuizIndex((prev) => (prev + 1) % IELTS_QUIZ_QUESTIONS.length);
                      setQuizSelected(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-black text-xs cursor-pointer"
                  >
                    Next Question
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
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
  eraDollars?: number;
  onRewardGems: (gemsWon: number, xpWon: number, dollarsWon: number, gameTitle: string) => void;
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
  eraDollars = 0,
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
      const dollarsWon = Math.max(25, nextScore * 20);
      onRewardGems(gemsWon, nextScore * 30, dollarsWon, 'IELTS Vocabulary Speed Blitz');
    } else {
      setVocabScore(nextScore);
      setVocabIdx(vocabIdx + 1);
    }
  };

  const handleScrambleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (scrambleInput.trim().toUpperCase() === currentScramble.answer) {
      onRewardGems(50, 80, 50, `Word Scramble (${currentScramble.answer})`);
      setScrambleFeedback(`🎉 Correct! "${currentScramble.answer}" unlocked +50 💎 Era Gems & +$50 💵 Era Dollars!`);
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
      const dollars = Math.max(30, nextGoals * 35);
      onRewardGems(gems, nextGoals * 40, dollars, 'Grammar & Idiom Penalty Shootout');
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

          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-2 bg-slate-950/85 border-2 border-pink-400/80 rounded-2xl px-3.5 py-2">
              <span className="text-lg animate-pulse">💎</span>
              <div>
                <div className="text-[9px] font-bold uppercase text-pink-300">Era Gems</div>
                <div className="text-base font-black text-white">{eraGems.toLocaleString()} 💎</div>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-950/85 border-2 border-emerald-400/80 rounded-2xl px-3.5 py-2">
              <span className="text-lg">💵</span>
              <div>
                <div className="text-[9px] font-bold uppercase text-emerald-300">Era Dollar</div>
                <div className="text-base font-black text-white">${eraDollars.toLocaleString()}</div>
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
