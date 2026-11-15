import * as THREE from 'three';

export interface RealisticCharacterOptions {
  gender?: 'male' | 'female' | 'boy' | 'girl' | string;
  skinTone?: string;
  skinColor?: string;
  bodyScale?: number;
  chubbiness?: number;
  headScale?: number;
  bodyType?: 'slim' | 'regular' | 'athletic' | 'tall' | string;
  faceShape?: string;
  jawDefine?: number;
  earStyle?: string;
  eyeShape?: string;
  eyeColor?: string;
  eyeScale?: number;
  eyebrowStyle?: string;
  noseShape?: string;
  mouthStyle?: string;
  skinDetail?: string;
  blush?: boolean;
  hairStyle?: string;
  hairColor?: string;
  topStyle?: string;
  topColor?: string;
  shirtColor?: string;
  topSecondary?: string;
  clothingType?: string;
  jacketStyle?: string;
  jacketPrimary?: string;
  jacketSecondary?: string;
  bottomStyle?: string;
  bottomColor?: string;
  pantsColor?: string;
  beltStyle?: string;
  beltType?: string;
  shoeStyle?: string;
  shoeColor?: string;
  hatStyle?: string;
  hatType?: string;
  accessories?: string[];
  accessoryType?: string;
  glassesStyle?: string;
  faceStyle?: string;
  rideStyle?: string;
  vehicleType?: string;
  bikeColor?: string;
  name?: string;
  cohort?: string;
  showNameplate?: boolean;
}

export interface BuiltRealisticCharacter {
  root: THREE.Group;
  hipsGroup: THREE.Group;
  bodyGroup: THREE.Group;
  torsoGroup: THREE.Group;
  headGroup: THREE.Group;
  leftArmGroup: THREE.Group;
  rightArmGroup: THREE.Group;
  leftLegGroup: THREE.Group;
  rightLegGroup: THREE.Group;
  eyelids: THREE.Mesh[];
  mouthGroup: THREE.Group;
  vehicleGroup: THREE.Group;
  wheelMeshes: THREE.Object3D[];
  dispose: () => void;
}

// ==========================================
// 1. COMPREHENSIVE ANATOMICAL & WARDROBE CATALOGS
// ==========================================

export const SKIN_TONES = [
  { id: 'porcelain', name: 'Porcelain Ivory', hex: '#FFE7D6' },
  { id: 'fair_peach', name: 'Fair Peach', hex: '#FFD8BE' },
  { id: 'warm_almond', name: 'Warm Almond', hex: '#F9C5A2' },
  { id: 'rosy_beige', name: 'Rosy Beige', hex: '#F3B898' },
  { id: 'light_sand', name: 'Light Sand', hex: '#EBB388' },
  { id: 'golden_honey', name: 'Golden Honey', hex: '#E09F70' },
  { id: 'warm_olive', name: 'Warm Olive', hex: '#D49264' },
  { id: 'caramel_tan', name: 'Caramel Tan', hex: '#C68252' },
  { id: 'bronze_glow', name: 'Bronze Glow', hex: '#B36E42' },
  { id: 'cinnamon', name: 'Warm Cinnamon', hex: '#9E5C34' },
  { id: 'chestnut', name: 'Rich Chestnut', hex: '#864B28' },
  { id: 'mahogany', name: 'Deep Mahogany', hex: '#6E3B1E' },
  { id: 'espresso', name: 'Warm Espresso', hex: '#542B16' },
  { id: 'ebony', name: 'Deep Ebony', hex: '#3B1D0E' },
  { id: 'elf_pearl', name: 'Fantasy Pearl', hex: '#F0F4FF' },
  { id: 'cyber_mint', name: 'Avatar Mint', hex: '#B8F2E6' },
];

export const FACE_SHAPES = [
  { id: 'soft_oval', name: 'Soft Oval (Natural)', desc: 'Balanced anatomical proportions' },
  { id: 'sculpted_v', name: 'Sculpted V-Line', desc: 'Tapered chin & sleek cheekbones' },
  { id: 'chiseled', name: 'Chiseled Athletic', desc: 'Defined jawline & strong structure' },
  { id: 'round_youth', name: 'Youthful Plush', desc: 'Full soft cheeks & gentle chin' },
  { id: 'heart', name: 'Heart / High Cheek', desc: 'Prominent cheekbones & delicate chin' },
  { id: 'diamond', name: 'Diamond Contour', desc: 'Angular cheeks & narrow forehead' },
  { id: 'pear_soft', name: 'Soft Pear', desc: 'Fuller lower jaw & gentle brow' },
  { id: 'oblong_noble', name: 'Noble Elongated', desc: 'Tall refined facial proportions' },
  { id: 'heroic_square', name: 'Heroic Square', desc: 'Strong wide jaw & bold chin' },
  { id: 'pixie_taper', name: 'Pixie Taper', desc: 'Expressive wide brow & petite chin' },
];

export const EAR_STYLES = [
  { id: 'normal', name: 'Natural Ears' },
  { id: 'small', name: 'Petite Ears' },
  { id: 'prominent', name: 'Expressive Prominent' },
  { id: 'elf', name: 'Pointed Elf Ears' },
  { id: 'pierced_gold', name: 'Gold Hoop Earrings' },
  { id: 'pierced_pearl', name: 'Pearl Stud Earrings' },
];

export const EYE_SHAPES = [
  { id: 'almond', name: 'Realistic Almond' },
  { id: 'round_bright', name: 'Large Doe Eyes' },
  { id: 'upturned', name: 'Cat-Eye Upturned' },
  { id: 'hooded', name: 'Calm Focused' },
  { id: 'gentle_droop', name: 'Gentle Kind' },
  { id: 'sharp_anime', name: 'Sharp Determined' },
];

export const EYE_COLORS = [
  { id: 'espresso', name: 'Deep Espresso', hex: '#28170E', rim: '#120904' },
  { id: 'amber', name: 'Warm Amber', hex: '#9A5B20', rim: '#4A2508' },
  { id: 'hazel', name: 'Golden Hazel', hex: '#7A6828', rim: '#383010' },
  { id: 'ocean', name: 'Sapphire Ocean', hex: '#2563EB', rim: '#1E3A8A' },
  { id: 'ice_blue', name: 'Glacier Ice', hex: '#38BDF8', rim: '#0369A1' },
  { id: 'emerald', name: 'Emerald Forest', hex: '#10B981', rim: '#064E3B' },
  { id: 'jade', name: 'Mystic Jade', hex: '#14B8A6', rim: '#115E59' },
  { id: 'violet', name: 'Amethyst Violet', hex: '#8B5CF6', rim: '#4C1D95' },
  { id: 'silver', name: 'Sterling Grey', hex: '#64748B', rim: '#1E293B' },
  { id: 'ruby', name: 'Crimson Ruby', hex: '#E11D48', rim: '#881337' },
  { id: 'gold', name: 'Celestial Gold', hex: '#F59E0B', rim: '#78350F' },
  { id: 'obsidian', name: 'Midnight Obsidian', hex: '#0F172A', rim: '#020617' },
];

export const EYEBROW_STYLES = [
  { id: 'natural_arch', name: 'Natural Soft Arch' },
  { id: 'straight_korean', name: 'Straight Youthful' },
  { id: 'bold_defined', name: 'Bold Defined' },
  { id: 'high_glam', name: 'High Expressive Arch' },
  { id: 'gentle_worried', name: 'Gentle / Soft Slope' },
  { id: 'fierce_angled', name: 'Confident Angled' },
];

export const NOSE_SHAPES = [
  { id: 'button', name: 'Soft Button Nose' },
  { id: 'aquiline', name: 'Sculpted Bridge' },
  { id: 'upturned', name: 'Cute Upturned' },
  { id: 'broad', name: 'Natural Broad' },
  { id: 'petite', name: 'Delicate Petite' },
  { id: 'roman', name: 'Strong Classic' },
];

export const MOUTH_STYLES = [
  { id: 'warm_smile', name: 'Warm Natural Smile' },
  { id: 'happy_grin', name: 'Bright Open Grin' },
  { id: 'rosebud', name: 'Plush Rosebud Lips' },
  { id: 'confident_smirk', name: 'Confident Smirk' },
  { id: 'serene_neutral', name: 'Serene Composed' },
  { id: 'cat_cute', name: 'Playful Cat Smile' },
  { id: 'surprised_o', name: 'Curious O-Mouth' },
  { id: 'coral_gloss', name: 'Glossy Coral Smile' },
];

export const SKIN_DETAILS = [
  { id: 'none', name: 'Clear Smooth Skin' },
  { id: 'freckles', name: 'Sun-Kissed Freckles' },
  { id: 'beauty_left', name: 'Beauty Mark (Left Cheek)' },
  { id: 'beauty_eye', name: 'Tear-Drop Mole (Right Eye)' },
  { id: 'bandaid', name: 'Sporty Nose Band-Aid' },
  { id: 'star_cheek', name: 'Festival Cheek Star' },
];

export const HAIR_COLORS = [
  { id: 'jet_black', name: 'Soft Jet Black', hex: '#1C1917' },
  { id: 'espresso_brown', name: 'Dark Espresso', hex: '#2E1E14' },
  { id: 'chestnut_brown', name: 'Warm Chestnut', hex: '#5C3824' },
  { id: 'cocoa_silk', name: 'Silky Cocoa', hex: '#432818' },
  { id: 'auburn_copper', name: 'Copper Auburn', hex: '#9A3412' },
  { id: 'ginger_spice', name: 'Ginger Spice', hex: '#C2410C' },
  { id: 'honey_blonde', name: 'Golden Honey Blonde', hex: '#D97706' },
  { id: 'platinum_blonde', name: 'Champagne Platinum', hex: '#FDE68A' },
  { id: 'silver_ash', name: 'Moonlight Silver', hex: '#94A3B8' },
  { id: 'snow_white', name: 'Pure Snow White', hex: '#F1F5F9' },
  { id: 'sakura_pink', name: 'Sakura Rose', hex: '#F472B6' },
  { id: 'midnight_blue', name: 'Midnight Indigo', hex: '#2563EB' },
  { id: 'lavender_mist', name: 'Lavender Mist', hex: '#A855F7' },
  { id: 'emerald_teal', name: 'Cyber Emerald', hex: '#0D9488' },
  { id: 'crimson_velvet', name: 'Crimson Velvet', hex: '#DC2626' },
];

export const HAIRSTYLES = [
  { id: 'fluffy_swept', name: 'Fluffy Swept Fringe (Ref #1/#2)', price: 0, dollarPrice: 0, badge: 'FREE', desc: 'Voluminous layered boy cut with realistic sculpted locks' },
  { id: 'twin_buns', name: 'Space Buns & Wispy Bangs (Ref #3)', price: 0, dollarPrice: 0, badge: 'FREE', desc: 'Plush double buns with face-framing side tendrils' },
  { id: 'textured_crop', name: 'Textured Tousled Crop (Ref #4)', price: 0, dollarPrice: 0, badge: 'FREE', desc: 'Modern layered short cut with natural crown volume' },
  { id: 'long_wavy', name: 'Long Flowing Waves', price: 0, dollarPrice: 0, badge: 'FREE', desc: 'Sculpted shoulder-draped flowing hair locks' },
  { id: 'french_bob', name: 'Chic Chin Bob & Bangs', price: 70, dollarPrice: 7, badge: 'POPULAR', desc: 'Rounded bob with soft inward-curled ends' },
  { id: 'high_ponytail', name: 'Dynamic High Ponytail', price: 85, dollarPrice: 8, badge: 'SPORT', desc: 'Swept high tail with S-curve flowing volume' },
  { id: 'kpop_curtain', name: 'Center-Part Curtain Locks', price: 95, dollarPrice: 9, badge: 'TRENDY', desc: 'Feathered S-curve curtain bangs with tapered back' },
  { id: 'twin_tails', name: 'Long Twin Ribbons', price: 110, dollarPrice: 11, badge: 'CUTE', desc: 'Dual cascading side tails with full bangs' },
  { id: 'Pompadour', name: 'Scholar Quiff & Taper', price: 90, dollarPrice: 9, badge: 'CLASSIC', desc: 'Swept-back volume with clean side contours' },
  { id: 'braided_crown', name: 'Dual Braided Pigtails', price: 120, dollarPrice: 12, badge: 'NEW', desc: 'Sculpted twin braids resting over the shoulders' },
  { id: 'afro_curls', name: 'Voluminous Cloud Curls', price: 100, dollarPrice: 10, badge: 'STYLE', desc: 'Richly textured spherical curl clusters' },
  { id: 'wolf_cut', name: 'Shaggy Layered Wolf Cut', price: 130, dollarPrice: 13, badge: 'HOT', desc: 'Feathered mullet-inspired layers with wispy fringe' },
];

export const TOP_STYLES = [
  { id: 'era_uniform', name: 'Era Polo Uniform (Ref #1)', price: 0, dollarPrice: 0, badge: 'FREE', defaultPrimary: '#F97316', defaultSecondary: '#FFFFFF', desc: 'Signature shirt with crisp white collar, chest pocket & cuff trim' },
  { id: 'casual_tee', name: 'Crewneck Graphic Tee (Ref #2)', price: 0, dollarPrice: 0, badge: 'FREE', defaultPrimary: '#FFFFFF', defaultSecondary: '#16A34A', desc: 'Soft cotton T-shirt with nature badge emblem' },
  { id: 'qipao_daisy', name: 'Floral Mandarin Top (Ref #3)', price: 95, dollarPrice: 9, badge: 'REF #3', defaultPrimary: '#38BDF8', defaultSecondary: '#FFFFFF', desc: 'Sky-blue top with diagonal piping, frog buttons & daisy print' },
  { id: 'sailor_blouse', name: 'Academy Sailor Blouse', price: 110, dollarPrice: 11, badge: 'ACADEMY', defaultPrimary: '#FFFFFF', defaultSecondary: '#1E3A8A', desc: 'Nautical collar with contrast stripes & satin bow' },
  { id: 'knit_sweater', name: 'Cozy Ribbed Sweater', price: 85, dollarPrice: 8, badge: 'COZY', defaultPrimary: '#F43F5E', defaultSecondary: '#FFE4E6', desc: 'Long-sleeve knit pullover with ribbed cuffs' },
  { id: 'sport_jersey', name: 'Varsity Track Top', price: 90, dollarPrice: 9, badge: 'SPORT', defaultPrimary: '#10B981', defaultSecondary: '#FFFFFF', desc: 'Athletic jersey with shoulder stripes' },
  { id: 'oxford_shirt', name: 'Crisp Button-Down Shirt', price: 80, dollarPrice: 8, badge: 'HONORS', defaultPrimary: '#E0F2FE', defaultSecondary: '#1E40AF', desc: 'Tailored collared dress shirt with placket' },
];

export const JACKET_STYLES = [
  { id: 'none', name: 'No Outer Layer (Single Top)', price: 0, dollarPrice: 0, badge: 'FREE', defaultPrimary: '#1E293B', defaultSecondary: '#F8FAFC', desc: 'Wear your shirt or blouse without an outer jacket' },
  { id: 'hoodie_vest', name: 'Layered Zip Hoodie Vest (Ref #4)', price: 120, dollarPrice: 12, badge: 'REF #4', defaultPrimary: '#1E3A8A', defaultSecondary: '#0284C7', desc: 'Sleeveless zip vest with plush hood & contrast front pockets' },
  { id: 'varsity_jacket', name: 'Letterman Varsity Jacket', price: 150, dollarPrice: 15, badge: 'POPULAR', defaultPrimary: '#991B1B', defaultSecondary: '#FEF3C7', desc: 'Open varsity bomber with contrast sleeves & striped trim' },
  { id: 'school_blazer', name: 'Prep Crest Blazer', price: 140, dollarPrice: 14, badge: 'SCHOLAR', defaultPrimary: '#1E293B', defaultSecondary: '#F59E0B', desc: 'Tailored open academy blazer with gold lapel pin' },
  { id: 'denim_jacket', name: 'Vintage Denim Trucker', price: 130, dollarPrice: 13, badge: 'COOL', defaultPrimary: '#2563EB', defaultSecondary: '#93C5FD', desc: 'Classic collared denim jacket with chest flaps' },
  { id: 'cardigan_open', name: 'Cozy Knit Cardigan', price: 115, dollarPrice: 11, badge: 'WARM', defaultPrimary: '#D97706', defaultSecondary: '#FEF3C7', desc: 'Soft open front cardigan worn over your inner shirt' },
  { id: 'puffer_vest', name: 'Quilted Down Puffer Vest', price: 135, dollarPrice: 13, badge: 'WINTER', defaultPrimary: '#E11D48', defaultSecondary: '#FFFFFF', desc: 'High-collar quilted winter vest' },
  { id: 'cyber_jacket', name: 'Neon Techwear Jacket', price: 190, dollarPrice: 19, badge: 'PRO', defaultPrimary: '#0F172A', defaultSecondary: '#22D3EE', desc: 'Futuristic high-collar jacket with glowing trim' },
];

export const BOTTOM_STYLES = [
  { id: 'cuffed_jeans', name: 'Cuffed Denim Jeans (Ref #1/#4)', price: 0, dollarPrice: 0, badge: 'FREE', defaultColor: '#2563EB', desc: 'Tailored trousers with crisp white rolled ankle cuffs' },
  { id: 'cargo_shorts', name: 'Sport Cargo Shorts (Ref #2)', price: 0, dollarPrice: 0, badge: 'FREE', defaultColor: '#15803D', desc: 'Knee-length shorts with side trim & bare lower legs' },
  { id: 'pleated_skirt', name: 'Pleated Skater Skirt (Ref #3)', price: 85, dollarPrice: 8, badge: 'REF #3', defaultColor: '#F8FAFC', desc: 'A-line pleated skirt with realistic sculptural folds' },
  { id: 'chinos', name: 'Tailored Scholar Chinos', price: 75, dollarPrice: 7, badge: 'CLASSIC', defaultColor: '#D6D3D1', desc: 'Clean tapered trousers for campus & exams' },
  { id: 'jogger_pants', name: 'Athletic Track Joggers', price: 90, dollarPrice: 9, badge: 'SPORT', defaultColor: '#1E293B', desc: 'Tapered joggers with ribbed ankle cuffs' },
  { id: 'plaid_skirt', name: 'Academy Check Skirt', price: 105, dollarPrice: 10, badge: 'ACADEMY', defaultColor: '#991B1B', desc: 'Pleated academy skirt with contrast hem stripe' },
  { id: 'denim_shorts', name: 'Rolled Summer Shorts', price: 70, dollarPrice: 7, badge: 'SUMMER', defaultColor: '#3B82F6', desc: 'Casual cuffed denim shorts' },
];

export const BELT_STYLES = [
  { id: 'none', name: 'No Belt', price: 0, dollarPrice: 0, badge: 'FREE', desc: 'Clean waistline without belt' },
  { id: 'Belt_Brown', name: 'Classic Brown Leather Belt', price: 45, dollarPrice: 4, badge: 'CLASSIC', desc: 'Warm brown leather strap with brass buckle' },
  { id: 'Belt_Black', name: 'Executive Black Belt', price: 45, dollarPrice: 4, badge: 'FORMAL', desc: 'Sleek black leather belt with silver buckle' },
  { id: 'Belt_White', name: 'Clean White Sport Belt', price: 50, dollarPrice: 5, badge: 'SPORT', desc: 'Crisp white belt with chrome buckle' },
  { id: 'Belt_Gold', name: 'Champion Gold Buckle Belt', price: 110, dollarPrice: 11, badge: 'VIP', desc: 'Luxury dark strap with gleaming gold emblem buckle' },
];

export const SHOE_STYLES = [
  { id: 'sport_sneakers', name: 'Chunky Street Sneakers (Ref #1/#2/#4)', price: 0, dollarPrice: 0, badge: 'FREE', defaultColor: '#EA580C', desc: 'Sculpted sole, toe cap, tongue & white laces' },
  { id: 'mary_janes', name: 'White Socks & Mary Janes (Ref #3)', price: 75, dollarPrice: 7, badge: 'REF #3', defaultColor: '#0284C7', desc: 'Cute strap shoes with folded white ankle socks' },
  { id: 'high_tops', name: 'Retro High-Top Kicks', price: 95, dollarPrice: 9, badge: 'POPULAR', defaultColor: '#DC2626', desc: 'Ankle-high basketball sneakers with contrast swoosh' },
  { id: 'penny_loafers', name: 'Polished Academy Loafers', price: 85, dollarPrice: 8, badge: 'SCHOLAR', defaultColor: '#451A03', desc: 'Glossy dress loafers with white crew socks' },
  { id: 'chelsea_boots', name: 'Urban Chelsea Boots', price: 110, dollarPrice: 11, badge: 'STYLE', defaultColor: '#1C1917', desc: 'Sleek ankle boots with rugged lug sole' },
  { id: 'cyber_kicks', name: 'LED Pulse Runners', price: 150, dollarPrice: 15, badge: 'PRO', defaultColor: '#06B6D4', desc: 'Futuristic sneakers with glowing sole accents' },
];

export const HEADGEAR_ITEMS = [
  { id: 'none', name: 'No Headgear', price: 0, dollarPrice: 0, badge: 'FREE', desc: 'Show full hairstyle clearly' },
  { id: 'sprout_clip', name: 'Lucky Bean Sprout (Ref #2)', price: 50, dollarPrice: 5, badge: 'REF #2', desc: 'Cute green leaf sprout perched on top of the head' },
  { id: 'daisy_clips', name: 'Twin White Daisy Clips (Ref #3)', price: 65, dollarPrice: 6, badge: 'REF #3', desc: 'Sculpted white petal daisies with golden centers' },
  { id: 'baseball_cap', name: 'Streetwear Curved Cap', price: 80, dollarPrice: 8, badge: 'SPORT', desc: 'Fitted dome cap with curved visor' },
  { id: 'bike_helmet', name: 'Aero Cycling Helmet', price: 90, dollarPrice: 9, badge: 'SAFETY', desc: 'Streamlined sports helmet with vents' },
  { id: 'straw_hat', name: 'Summer Ribbon Straw Hat', price: 95, dollarPrice: 9, badge: 'SUMMER', desc: 'Wide-brim woven sun hat with dark ribbon' },
  { id: 'beret', name: 'Artist Wool Beret', price: 85, dollarPrice: 8, badge: 'ART', desc: 'Tilted French beret with top stem' },
  { id: 'grad_cap', name: 'IELTS Band 9 Mortarboard', price: 150, dollarPrice: 15, badge: 'HONORS', desc: 'Academic graduation cap with golden tassel' },
  { id: 'cat_headphones', name: 'Neon Cat-Ear Headphones', price: 175, dollarPrice: 17, badge: 'GAMER', desc: 'Over-ear studio headphones with glowing cat ears' },
  { id: 'gold_crown', name: 'Royal Champion Crown', price: 240, dollarPrice: 24, badge: 'ROYAL', desc: 'Polished gold crown set with rubies & sapphires' },
  { id: 'angel_halo', name: 'Radiant Floating Halo', price: 210, dollarPrice: 21, badge: 'MYTHIC', desc: 'Luminous golden ring floating above the head' },
];

export const ACCESSORY_ITEMS = [
  { id: 'round_glasses', name: 'Round Scholar Glasses (Ref #1)', slot: 'eyes', price: 60, dollarPrice: 6, badge: 'REF #1', desc: 'Dark-rimmed circular frames with clear lenses' },
  { id: 'smart_watch', name: 'Blue Sport Smartwatch (Ref #2)', slot: 'wrist', price: 75, dollarPrice: 7, badge: 'REF #2', desc: 'Wristband with glowing cyan touch display' },
  { id: 'aviator_sun', name: 'Gold Aviator Shades', slot: 'eyes', price: 95, dollarPrice: 9, badge: 'COOL', desc: 'Reflective dark lenses in thin gold wireframes' },
  { id: 'cyber_visor', name: 'Holographic Cyber Visor', slot: 'eyes', price: 160, dollarPrice: 16, badge: 'CYBER', desc: 'Translucent neon visor across the eyes' },
  { id: 'school_backpack', name: '3D Campus Backpack', slot: 'back', price: 110, dollarPrice: 11, badge: 'GEAR', desc: 'Multi-pocket student backpack with shoulder straps' },
  { id: 'silk_tie', name: 'Crimson Academy Tie', slot: 'neck', price: 65, dollarPrice: 6, badge: 'PREP', desc: 'Formal silk necktie worn at the collar' },
  { id: 'gold_medal', name: 'IELTS Champion Medal', slot: 'neck', price: 130, dollarPrice: 13, badge: 'AWARD', desc: 'Blue ribbon with embossed golden medal' },
  { id: 'angel_wings', name: 'Feathered Valkyrie Wings', slot: 'back', price: 280, dollarPrice: 28, badge: 'EPIC', desc: 'Sculpted layered white wings on the back' },
];

export const VEHICLE_ITEMS = [
  { id: 'none', name: 'Standing / Walking Pose', price: 0, dollarPrice: 0, badge: 'FREE', desc: 'Standard anatomical standing stance' },
  { id: 'cruiser_bike', name: 'City Cruiser Bicycle', price: 260, dollarPrice: 26, badge: 'POPULAR', desc: 'Full 3D tubular frame, spoked wheels, chainring, pedals & basket' },
  { id: 'skateboard', name: 'Pro Street Skateboard', price: 150, dollarPrice: 15, badge: 'STREET', desc: 'Maple deck with grip tape, metallic trucks & urethane wheels' },
  { id: 'scooter', name: 'Electric Kick Scooter', price: 195, dollarPrice: 19, badge: 'URBAN', desc: 'LED stem, deck & handlebars for campus cruising' },
  { id: 'study_desk', name: 'IELTS Exam Desk & Book', price: 130, dollarPrice: 13, badge: 'STUDY', desc: 'Wooden desk with open textbook, lamp & coffee cup' },
  { id: 'gold_bike', name: 'Golden Champion Bicycle', price: 450, dollarPrice: 45, badge: 'LEGEND', desc: '24K gold metallic frame with glowing cyan rims' },
];

export const CLOTHING_PALETTE = [
  '#F97316', '#EA580C', '#FFFFFF', '#F8FAFC', '#38BDF8', '#0284C7',
  '#2563EB', '#1E3A8A', '#1E293B', '#0F172A', '#16A34A', '#15803D',
  '#10B981', '#0D9488', '#E11D48', '#F43F5E', '#F472B6', '#A855F7',
  '#7C3AED', '#F59E0B', '#D97706', '#78350F', '#D6D3D1', '#64748B',
];

export const STUDIO_THEMES = [
  { id: 'studio_white', name: 'Clean Studio (Ref)', bg: 'radial-gradient(circle at 50% 35%, #FFFFFF 0%, #F1F5F9 60%, #E2E8F0 100%)', pedestal: '#FFFFFF', ring: '#38BDF8' },
  { id: 'campus_sky', name: 'Sunny Campus', bg: 'radial-gradient(circle at 50% 30%, #E0F2FE 0%, #BAE6FD 55%, #7DD3FC 100%)', pedestal: '#F8FAFC', ring: '#0284C7' },
  { id: 'sakura_glow', name: 'Sakura Lounge', bg: 'radial-gradient(circle at 50% 30%, #FFF1F2 0%, #FFE4E6 60%, #FECDD3 100%)', pedestal: '#FFF5F7', ring: '#F43F5E' },
  { id: 'midnight_stage', name: 'Midnight Showcase', bg: 'radial-gradient(circle at 50% 30%, #1E293B 0%, #0F172A 65%, #020617 100%)', pedestal: '#1E293B', ring: '#38BDF8' },
];

export const REFERENCE_PRESETS = [
  {
    id: 'ref_1',
    name: '#001 Uniform Boy',
    subtitle: 'Orange Polo + Round Glasses',
    badge: 'REF #001',
    config: {
      gender: 'male' as const,
      skinTone: '#FFD8BE',
      bodyScale: 1.0,
      chubbiness: 1.0,
      headScale: 1.04,
      faceShape: 'soft_oval',
      jawDefine: 0.5,
      earStyle: 'normal',
      eyeShape: 'round_bright',
      eyeColor: 'espresso',
      eyeScale: 1.05,
      eyebrowStyle: 'natural_arch',
      noseShape: 'button',
      mouthStyle: 'warm_smile',
      skinDetail: 'none',
      blush: true,
      hairStyle: 'fluffy_swept',
      hairColor: '#1C1917',
      topStyle: 'era_uniform',
      topColor: '#F97316',
      topSecondary: '#FFFFFF',
      jacketStyle: 'none',
      jacketPrimary: '#1E3A8A',
      jacketSecondary: '#0284C7',
      bottomStyle: 'cuffed_jeans',
      bottomColor: '#1D4ED8',
      beltStyle: 'none',
      shoeStyle: 'sport_sneakers',
      shoeColor: '#EA580C',
      hatStyle: 'none',
      accessories: ['round_glasses'],
      rideStyle: 'none',
      bikeColor: '#F97316',
    },
  },
  {
    id: 'ref_2',
    name: '#002 Sprout & Watch',
    subtitle: 'White Tee + Shorts + Sprout',
    badge: 'REF #002',
    config: {
      gender: 'male' as const,
      skinTone: '#FFD8BE',
      bodyScale: 0.98,
      chubbiness: 0.98,
      headScale: 1.05,
      faceShape: 'soft_oval',
      jawDefine: 0.45,
      earStyle: 'normal',
      eyeShape: 'round_bright',
      eyeColor: 'espresso',
      eyeScale: 1.06,
      eyebrowStyle: 'straight_korean',
      noseShape: 'button',
      mouthStyle: 'warm_smile',
      skinDetail: 'freckles',
      blush: true,
      hairStyle: 'fluffy_swept',
      hairColor: '#3E2518',
      topStyle: 'casual_tee',
      topColor: '#FFFFFF',
      topSecondary: '#16A34A',
      jacketStyle: 'none',
      jacketPrimary: '#1E3A8A',
      jacketSecondary: '#0284C7',
      bottomStyle: 'cargo_shorts',
      bottomColor: '#15803D',
      beltStyle: 'none',
      shoeStyle: 'sport_sneakers',
      shoeColor: '#15803D',
      hatStyle: 'sprout_clip',
      accessories: ['smart_watch'],
      rideStyle: 'none',
      bikeColor: '#16A34A',
    },
  },
  {
    id: 'ref_3',
    name: '#003 Daisy Girl',
    subtitle: 'Space Buns + Floral Qipao',
    badge: 'REF #003',
    config: {
      gender: 'female' as const,
      skinTone: '#FFE7D6',
      bodyScale: 0.96,
      chubbiness: 0.96,
      headScale: 1.05,
      faceShape: 'heart',
      jawDefine: 0.35,
      earStyle: 'pierced_pearl',
      eyeShape: 'almond',
      eyeColor: 'espresso',
      eyeScale: 1.08,
      eyebrowStyle: 'natural_arch',
      noseShape: 'petite',
      mouthStyle: 'rosebud',
      skinDetail: 'none',
      blush: true,
      hairStyle: 'twin_buns',
      hairColor: '#1C1917',
      topStyle: 'qipao_daisy',
      topColor: '#38BDF8',
      topSecondary: '#FFFFFF',
      jacketStyle: 'none',
      jacketPrimary: '#1E3A8A',
      jacketSecondary: '#0284C7',
      bottomStyle: 'pleated_skirt',
      bottomColor: '#FFFFFF',
      beltStyle: 'none',
      shoeStyle: 'mary_janes',
      shoeColor: '#0284C7',
      hatStyle: 'daisy_clips',
      accessories: [],
      rideStyle: 'none',
      bikeColor: '#38BDF8',
    },
  },
  {
    id: 'ref_4',
    name: '#004 Layered Vest',
    subtitle: 'Orange Tee + Blue Hoodie Vest',
    badge: 'REF #004',
    config: {
      gender: 'male' as const,
      skinTone: '#F9C5A2',
      bodyScale: 1.02,
      chubbiness: 1.0,
      headScale: 1.03,
      faceShape: 'sculpted_v',
      jawDefine: 0.6,
      earStyle: 'normal',
      eyeShape: 'almond',
      eyeColor: 'amber',
      eyeScale: 1.04,
      eyebrowStyle: 'bold_defined',
      noseShape: 'aquiline',
      mouthStyle: 'confident_smirk',
      skinDetail: 'none',
      blush: true,
      hairStyle: 'textured_crop',
      hairColor: '#5C3824',
      topStyle: 'casual_tee',
      topColor: '#F97316',
      topSecondary: '#FFFFFF',
      jacketStyle: 'hoodie_vest',
      jacketPrimary: '#1E3A8A',
      jacketSecondary: '#0284C7',
      bottomStyle: 'cuffed_jeans',
      bottomColor: '#2563EB',
      beltStyle: 'none',
      shoeStyle: 'sport_sneakers',
      shoeColor: '#0284C7',
      hatStyle: 'none',
      accessories: ['smart_watch'],
      rideStyle: 'none',
      bikeColor: '#2563EB',
    },
  },
];

export const IELTS_QUIZ_QUESTIONS = [
  {
    q: 'Choose the most Academic Band 8+ synonym for "important":',
    options: ['Big', 'Paramount', 'Nice', 'Simple'],
    correct: 1,
    explanation: '"Paramount" means more important than anything else — ideal for IELTS Writing Task 2.',
  },
  {
    q: 'Which linking word introduces a contrasting point formally?',
    options: ['Furthermore', 'Nevertheless', 'Consequently', 'For instance'],
    correct: 1,
    explanation: '"Nevertheless" introduces a concession or contrast with high lexical sophistication.',
  },
  {
    q: 'Complete the sentence: "Had the government invested earlier, traffic congestion ___ reduced."',
    options: ['will be', 'would have been', 'was', 'is being'],
    correct: 1,
    explanation: 'Third conditional inversion ("Had + subject + past participle") pairs with "would have been".',
  },
  {
    q: 'In IELTS Academic Writing Task 1, which phrase best describes a sharp upward trend?',
    options: ['Went up a bit', 'Surged dramatically', 'Stayed normal', 'Moved nicely'],
    correct: 1,
    explanation: '"Surged dramatically" is precise, academic verb+adverb collocation for Task 1 line graphs.',
  },
];

// ==========================================
// 2. LEGACY & EXTENDED PROP NORMALIZATION
// ==========================================

export function normalizeCharacterOptions(raw: Partial<RealisticCharacterOptions> = {}): Required<RealisticCharacterOptions> {
  const gender: 'male' | 'female' =
    raw.gender === 'female' || raw.gender === 'girl' ? 'female' : 'male';

  // Map legacy hairStyle IDs smoothly
  const legacyHairMap: Record<string, string> = {
    classic: 'fluffy_swept',
    spiky: 'textured_crop',
    long: 'long_wavy',
    ponytail: 'high_ponytail',
    twintails: 'twin_tails',
    Short: 'fluffy_swept',
    Spiky: 'textured_crop',
    Curly: 'afro_curls',
    Bob: 'french_bob',
    Long: 'long_wavy',
    Ponytail: 'high_ponytail',
    Buns: 'twin_buns',
    SidePart: 'kpop_curtain',
    Quiff: 'Pompadour',
    TwinTails: 'twin_tails',
    AfroPuff: 'afro_curls',
    Wavy: 'long_wavy',
    Bald: 'textured_crop',
  };
  const rawHair = raw.hairStyle || (gender === 'female' ? 'twin_buns' : 'fluffy_swept');
  const hairStyle = HAIRSTYLES.some((h) => h.id === rawHair)
    ? rawHair
    : legacyHairMap[rawHair] || (gender === 'female' ? 'twin_buns' : 'fluffy_swept');

  // Map legacy hatStyle / hatType IDs smoothly
  const legacyHatMap: Record<string, string> = {
    None: 'none',
    none: 'none',
    cap: 'baseball_cap',
    Cap: 'baseball_cap',
    crown: 'gold_crown',
    Crown: 'gold_crown',
    headphones: 'cat_headphones',
    Headphones: 'cat_headphones',
    GradCap: 'grad_cap',
    PartyHat: 'sprout_clip',
    Beanie: 'beret',
    halo: 'angel_halo',
    Halo: 'angel_halo',
    CatEars: 'cat_headphones',
    Viking: 'bike_helmet',
    WizardHat: 'grad_cap',
    SunHat: 'straw_hat',
  };
  const rawHat = raw.hatStyle || raw.hatType || 'none';
  const hatStyle = HEADGEAR_ITEMS.some((h) => h.id === rawHat)
    ? rawHat
    : legacyHatMap[rawHat] || 'none';

  // Map legacy rideStyle / vehicleType IDs smoothly
  const legacyRideMap: Record<string, string> = {
    None: 'none',
    none: 'none',
    bike: 'cruiser_bike',
    skateboard: 'skateboard',
    Skateboard: 'skateboard',
    Scooter: 'scooter',
    Hoverboard: 'skateboard',
    MagicCarpet: 'study_desk',
    RocketPack: 'cruiser_bike',
    Cloud: 'gold_bike',
  };
  const rawRide = raw.rideStyle || raw.vehicleType || 'none';
  const rideStyle = VEHICLE_ITEMS.some((v) => v.id === rawRide)
    ? rawRide
    : legacyRideMap[rawRide] || 'none';

  // Map legacy beltStyle / beltType IDs smoothly
  const legacyBeltMap: Record<string, string> = {
    none: 'none',
    None: 'none',
    gold_belt: 'Belt_Gold',
    cyber_belt: 'Belt_White',
    star_belt: 'Belt_Gold',
    leather_belt: 'Belt_Brown',
  };
  const rawBelt = raw.beltStyle || raw.beltType || 'none';
  const beltStyle = BELT_STYLES.some((b) => b.id === rawBelt)
    ? rawBelt
    : legacyBeltMap[rawBelt] || 'none';

  // Map legacy clothingType to topStyle / jacketStyle / bottomStyle
  let derivedTopStyle = raw.topStyle;
  let derivedJacketStyle = raw.jacketStyle;
  let derivedBottomStyle = raw.bottomStyle;
  if (!derivedTopStyle && raw.clothingType) {
    if (raw.clothingType === 'cyber_jacket') {
      derivedTopStyle = 'casual_tee';
      derivedJacketStyle = derivedJacketStyle || 'cyber_jacket';
    } else if (raw.clothingType === 'royal_suit') {
      derivedTopStyle = 'oxford_shirt';
      derivedJacketStyle = derivedJacketStyle || 'school_blazer';
    } else if (raw.clothingType === 'skirt_outfit') {
      derivedTopStyle = 'qipao_daisy';
      derivedBottomStyle = derivedBottomStyle || 'pleated_skirt';
    } else if (raw.clothingType === 'hoodie') {
      derivedTopStyle = 'casual_tee';
      derivedJacketStyle = derivedJacketStyle || 'hoodie_vest';
    }
  }

  // Map legacy glassesStyle & accessoryType into accessories list
  const accSet = new Set<string>(Array.isArray(raw.accessories) ? raw.accessories : []);
  if (raw.glassesStyle && raw.glassesStyle !== 'None' && raw.glassesStyle !== 'none') {
    if (raw.glassesStyle === 'Round' || raw.glassesStyle === 'StarGlasses') accSet.add('round_glasses');
    else if (raw.glassesStyle === 'Sunglasses') accSet.add('aviator_sun');
    else if (raw.glassesStyle === 'CyberVisor' || raw.glassesStyle === 'VRHeadset') accSet.add('cyber_visor');
    else if (ACCESSORY_ITEMS.some((a) => a.id === raw.glassesStyle)) accSet.add(raw.glassesStyle);
  }
  if (raw.accessoryType && raw.accessoryType !== 'none' && raw.accessoryType !== 'None') {
    if (raw.accessoryType === 'wings') accSet.add('angel_wings');
    else if (raw.accessoryType === 'cyber_visor') accSet.add('cyber_visor');
    else if (raw.accessoryType === 'shades') accSet.add('aviator_sun');
    else if (ACCESSORY_ITEMS.some((a) => a.id === raw.accessoryType)) accSet.add(raw.accessoryType);
  }

  // Map legacy bodyType into bodyScale & chubbiness if not explicitly provided
  let bodyScale = typeof raw.bodyScale === 'number' ? raw.bodyScale : 1.0;
  let chubbiness = typeof raw.chubbiness === 'number' ? raw.chubbiness : 1.0;
  if (typeof raw.bodyScale !== 'number' && raw.bodyType) {
    if (raw.bodyType === 'slim') {
      bodyScale = 0.96;
      chubbiness = 0.92;
    } else if (raw.bodyType === 'athletic') {
      bodyScale = 1.03;
      chubbiness = 1.05;
    } else if (raw.bodyType === 'tall') {
      bodyScale = 1.08;
      chubbiness = 0.96;
    }
  }

  // Map legacy faceStyle to mouthStyle if mouthStyle not explicitly provided
  let mouthStyle = raw.mouthStyle || 'warm_smile';
  if (!raw.mouthStyle && raw.faceStyle) {
    if (raw.faceStyle === 'Cool') mouthStyle = 'confident_smirk';
    else if (raw.faceStyle === 'Wink') mouthStyle = 'happy_grin';
    else if (raw.faceStyle === 'StarEyes') mouthStyle = 'cat_cute';
    else if (raw.faceStyle === 'Determined') mouthStyle = 'serene_neutral';
  }

  const skinTone = raw.skinTone || raw.skinColor || (gender === 'female' ? '#FFE7D6' : '#FFD8BE');
  const topColor = raw.topColor || raw.shirtColor || (gender === 'female' ? '#38BDF8' : '#F97316');
  const bottomColor = raw.bottomColor || raw.pantsColor || (gender === 'female' ? '#FFFFFF' : '#2563EB');

  return {
    gender,
    skinTone,
    skinColor: skinTone,
    bodyScale,
    chubbiness,
    headScale: typeof raw.headScale === 'number' ? raw.headScale : 1.04,
    bodyType: raw.bodyType || 'regular',
    faceShape: raw.faceShape || (gender === 'female' ? 'heart' : 'soft_oval'),
    jawDefine: typeof raw.jawDefine === 'number' ? raw.jawDefine : 0.5,
    earStyle: raw.earStyle || 'normal',
    eyeShape: raw.eyeShape || 'round_bright',
    eyeColor: raw.eyeColor || 'espresso',
    eyeScale: typeof raw.eyeScale === 'number' ? raw.eyeScale : 1.05,
    eyebrowStyle: raw.eyebrowStyle || 'natural_arch',
    noseShape: raw.noseShape || 'button',
    mouthStyle,
    skinDetail: raw.skinDetail || 'none',
    blush: typeof raw.blush === 'boolean' ? raw.blush : true,
    hairStyle,
    hairColor: raw.hairColor || '#1C1917',
    topStyle: derivedTopStyle || (gender === 'female' ? 'qipao_daisy' : 'era_uniform'),
    topColor,
    shirtColor: topColor,
    topSecondary: raw.topSecondary || '#FFFFFF',
    clothingType: raw.clothingType || 'varsity',
    jacketStyle: derivedJacketStyle || 'none',
    jacketPrimary: raw.jacketPrimary || '#1E3A8A',
    jacketSecondary: raw.jacketSecondary || '#0284C7',
    bottomStyle: derivedBottomStyle || (gender === 'female' ? 'pleated_skirt' : 'cuffed_jeans'),
    bottomColor,
    pantsColor: bottomColor,
    beltStyle,
    beltType: beltStyle,
    shoeStyle: raw.shoeStyle || (gender === 'female' ? 'mary_janes' : 'sport_sneakers'),
    shoeColor: raw.shoeColor || (gender === 'female' ? '#0284C7' : '#EA580C'),
    hatStyle,
    hatType: hatStyle,
    accessories: Array.from(accSet),
    accessoryType: raw.accessoryType || 'none',
    glassesStyle: raw.glassesStyle || 'None',
    faceStyle: raw.faceStyle || 'Smile',
    rideStyle,
    vehicleType: rideStyle,
    bikeColor: raw.bikeColor || '#F97316',
    name: raw.name || 'Student',
    cohort: raw.cohort || 'IELTS 1',
    showNameplate: Boolean(raw.showNameplate),
  };
}

// ==========================================
// 3. PROCEDURAL TEXTURES & CUTE CHIBI GEOMETRY
// ==========================================

const irisTextureCache = new Map<string, THREE.CanvasTexture>();
let cachedDaisyTexture: THREE.CanvasTexture | null = null;
let cachedBlushTexture: THREE.CanvasTexture | null = null;

function harmonizeCuteSkinTone(rawHex: string): string {
  const clean = (rawHex || '#FFE7D6').trim().toLowerCase();
  const legacyMap: Record<string, string> = {
    '#fcd34d': '#FFD8BE',
    '#fef08a': '#FFE7D6',
    '#fde68a': '#FFD8BE',
    '#fef3c7': '#FFE7D6',
    '#f1c27d': '#F9C5A2',
    '#e0ac69': '#F3B898',
    '#c68642': '#E09F70',
    '#8d5524': '#C68252',
    '#3b1d0e': '#8E5434',
    '#542b16': '#9E5C34',
    '#6e3b1e': '#AD6840',
    '#864b28': '#B87348',
  };
  if (legacyMap[clean]) return legacyMap[clean];

  const col = new THREE.Color(rawHex || '#FFE7D6');
  const hsl = { h: 0, s: 0, l: 0 };
  col.getHSL(hsl);
  if (hsl.l < 0.36 && clean !== '#f0f4ff' && clean !== '#b8f2e6') {
    col.setHSL(
      THREE.MathUtils.clamp(hsl.h, 0.04, 0.09),
      THREE.MathUtils.clamp(hsl.s, 0.42, 0.62),
      THREE.MathUtils.lerp(hsl.l, 0.48, 0.55)
    );
    return `#${col.getHexString()}`;
  }
  return rawHex || '#FFE7D6';
}

function createSoftBlushTexture(): THREE.CanvasTexture {
  if (cachedBlushTexture) return cachedBlushTexture;
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(64, 64, 4, 64, 64, 58);
  grad.addColorStop(0, 'rgba(255, 105, 135, 0.55)');
  grad.addColorStop(0.5, 'rgba(255, 120, 150, 0.26)');
  grad.addColorStop(1, 'rgba(255, 120, 150, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);

  // Cute tiny white anime blush highlight slash
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(46, 68);
  ctx.lineTo(54, 56);
  ctx.moveTo(64, 70);
  ctx.lineTo(72, 58);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  cachedBlushTexture = tex;
  return tex;
}

function createIrisTexture(hexColor: string, rimColor: string): THREE.CanvasTexture {
  const key = `${hexColor}_${rimColor}_kawaii_v4`;
  const existing = irisTextureCache.get(key);
  if (existing) return existing;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  const cx = 256;
  const cy = 256;

  ctx.clearRect(0, 0, 512, 512);

  // 1. Soft dark outer kawaii limbal ring
  ctx.beginPath();
  ctx.arc(cx, cy, 240, 0, Math.PI * 2);
  ctx.fillStyle = '#18121E';
  ctx.fill();

  // 2. Rich deep upper-to-lower anime iris gradient
  const baseCol = new THREE.Color(hexColor);
  const brightCol = baseCol.clone().lerp(new THREE.Color('#FFFFFF'), 0.38);
  const deepCol = new THREE.Color(rimColor).lerp(new THREE.Color('#09050D'), 0.35);

  const irisGrad = ctx.createLinearGradient(cx, cy - 220, cx, cy + 220);
  irisGrad.addColorStop(0, `#${deepCol.getHexString()}`);
  irisGrad.addColorStop(0.45, hexColor);
  irisGrad.addColorStop(1, `#${brightCol.getHexString()}`);
  ctx.beginPath();
  ctx.arc(cx, cy, 218, 0, Math.PI * 2);
  ctx.fillStyle = irisGrad;
  ctx.fill();

  // 3. Luminous lower crescent glow (signature kawaii sparkle)
  const glowGrad = ctx.createRadialGradient(cx, cy + 95, 16, cx, cy + 80, 165);
  glowGrad.addColorStop(0, 'rgba(255, 255, 255, 0.62)');
  glowGrad.addColorStop(0.45, `#${brightCol.getHexString()}88`);
  glowGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = glowGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, 214, 0, Math.PI * 2);
  ctx.fill();

  // 4. Big, friendly kawaii velvet pupil
  ctx.beginPath();
  ctx.arc(cx, cy + 6, 118, 0, Math.PI * 2);
  ctx.fillStyle = '#120C18';
  ctx.fill();

  // Subtle warm pupil center halo
  const pupilHalo = ctx.createRadialGradient(cx, cy + 6, 85, cx, cy + 6, 128);
  pupilHalo.addColorStop(0, 'rgba(18, 12, 24, 1)');
  pupilHalo.addColorStop(1, 'rgba(18, 12, 24, 0)');
  ctx.fillStyle = pupilHalo;
  ctx.beginPath();
  ctx.arc(cx, cy + 6, 128, 0, Math.PI * 2);
  ctx.fill();

  // 5. Primary large glossy top-left catchlight sparkle
  ctx.save();
  ctx.translate(cx - 72, cy - 74);
  ctx.rotate(-0.25);
  ctx.beginPath();
  ctx.ellipse(0, 0, 58, 46, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.restore();

  // 6. Secondary bottom-right bubble catchlight
  ctx.beginPath();
  ctx.arc(cx + 76, cy + 72, 28, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
  ctx.fill();

  // 7. Tiny top-right star/pinpoint highlight
  ctx.beginPath();
  ctx.arc(cx + 82, cy - 58, 14, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
  ctx.fill();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  irisTextureCache.set(key, tex);
  return tex;
}

function getDaisyPatternTexture(baseHex: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, 512, 512);

  const positions = [
    [90, 90], [260, 70], [420, 100],
    [60, 230], [190, 210], [340, 240], [460, 220],
    [110, 380], [270, 360], [410, 400],
    [160, 470], [350, 480],
  ];

  positions.forEach(([x, y], idx) => {
    const r = idx % 2 === 0 ? 15 : 11;
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    for (let p = 0; p < 8; p++) {
      ctx.save();
      ctx.rotate((p * Math.PI) / 4);
      ctx.beginPath();
      ctx.ellipse(0, -r * 0.95, r * 0.38, r * 0.68, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.42, 0, Math.PI * 2);
    ctx.fillStyle = '#FACC15';
    ctx.fill();
    ctx.restore();
  });

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.needsUpdate = true;
  cachedDaisyTexture = tex;
  return tex;
}

function createSculptedRealisticHeadGeometry(
  faceShape: string,
  _jawDefine: number,
  chubbiness: number,
  segments = 44
): THREE.BufferGeometry {
  // Smooth, plush chibi head with adorable soft lower cheeks and gentle rounded chin
  const geo = new THREE.SphereGeometry(0.35, segments, segments);
  const pos = geo.attributes.position;

  let cheekBoost = 1.08 * THREE.MathUtils.clamp(chubbiness, 0.92, 1.15);
  let verticalScale = 0.97;
  let jawSoftness = 1.02;

  if (faceShape === 'round_youth' || faceShape === 'heart') {
    cheekBoost *= 1.06;
    verticalScale = 0.95;
  } else if (faceShape === 'oblong_noble') {
    verticalScale = 1.01;
  } else if (faceShape === 'sculpted_v' || faceShape === 'pixie_taper') {
    jawSoftness = 0.96;
  }

  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);

    const ny = y / 0.35;
    y *= verticalScale;
    z *= 0.94;
    x *= 1.03;

    // Adorable plush baby-cheek fullness on the lower face
    if (ny > -0.68 && ny < 0.12) {
      const cheekCurve = Math.cos(((ny + 0.26) / 0.42) * Math.PI * 0.5);
      if (cheekCurve > 0) {
        const c = Math.pow(cheekCurve, 1.2);
        x *= 1.0 + 0.085 * cheekBoost * c;
        if (z > 0) {
          z += 0.022 * cheekBoost * c;
        }
      }
    }

    // Soft, rounded chibi chin contour (never pointy or sunken)
    if (ny < -0.15) {
      const t = Math.min(1, (-ny - 0.15) / 0.85);
      const smoothTaper = THREE.MathUtils.lerp(1.0, 0.88 * jawSoftness, t * t);
      x *= smoothTaper;
    }

    // Flatter front facial plane so large kawaii eyes and glasses sit flush
    if (z > 0.15 && Math.abs(ny) < 0.45) {
      z = THREE.MathUtils.lerp(z, 0.318, 0.22);
    }

    pos.setXYZ(i, x, y, z);
  }

  geo.computeVertexNormals();
  return geo;
}

function createHairLock(
  points: [number, number, number][],
  radiusBase: number,
  mat: THREE.Material,
  tubularSegments = 16
): THREE.Mesh {
  const vectors = points.map((p) => new THREE.Vector3(p[0], p[1], p[2]));
  const curve = new THREE.CatmullRomCurve3(vectors);
  const geo = new THREE.TubeGeometry(curve, tubularSegments, radiusBase * 1.18, 12, false);
  const pos = geo.attributes.position;
  const ringVerts = 13;
  const rings = tubularSegments + 1;

  for (let r = 0; r < rings; r++) {
    const t = r / tubularSegments;
    // Soft plush anime hair strand profile: wide at root & middle, gently tapered at tip
    const scale =
      t < 0.15
        ? 0.85 + (t / 0.15) * 0.20
        : Math.max(0.22, Math.cos(((t - 0.15) / 0.85) * Math.PI * 0.46));
    const center = curve.getPointAt(t);
    const radialDir = new THREE.Vector3(center.x, 0, center.z).normalize();

    for (let v = 0; v < ringVerts; v++) {
      const idx = r * ringVerts + v;
      if (idx < pos.count) {
        const vx = pos.getX(idx) - center.x;
        const vy = pos.getY(idx) - center.y;
        const vz = pos.getZ(idx) - center.z;
        // Flatten radial protrusion so hair hugs the head like sculpted anime petals instead of round tubes
        const dotRadial = vx * radialDir.x + vz * radialDir.z;
        const flatVx = vx - radialDir.x * dotRadial * 0.42;
        const flatVz = vz - radialDir.z * dotRadial * 0.42;

        pos.setXYZ(
          idx,
          center.x + flatVx * scale * 1.25,
          center.y + vy * scale,
          center.z + flatVz * scale * 1.25
        );
      }
    }
  }
  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  return mesh;
}

function build3DDaisyFlower(scale = 1.0): THREE.Group {
  const flower = new THREE.Group();
  const petalMat = new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.35 });
  const centerMat = new THREE.MeshStandardMaterial({ color: '#FACC15', roughness: 0.4 });

  const center = new THREE.Mesh(new THREE.SphereGeometry(0.022 * scale, 12, 12), centerMat);
  center.scale.set(1, 0.55, 1);
  flower.add(center);

  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const petal = new THREE.Mesh(new THREE.SphereGeometry(0.018 * scale, 10, 10), petalMat);
    petal.scale.set(0.65, 0.3, 1.35);
    petal.position.set(Math.cos(angle) * 0.03 * scale, 0, Math.sin(angle) * 0.03 * scale);
    petal.rotation.y = -angle;
    flower.add(petal);
  }
  return flower;
}

// ==========================================
// 4. MASTER 3D CHARACTER BUILDER
// ==========================================

export function buildRealisticCharacter3D(
  rawOpts: Partial<RealisticCharacterOptions> = {},
  quality: 'high' | 'campus' = 'high'
): BuiltRealisticCharacter {
  const opts = normalizeCharacterOptions(rawOpts);
  const seg = quality === 'high' ? 32 : 20;

  const root = new THREE.Group();
  const hipsGroup = new THREE.Group();
  hipsGroup.position.set(0, 0.98, 0);
  root.add(hipsGroup);

  const bodyScale = THREE.MathUtils.clamp(opts.bodyScale, 0.85, 1.15);
  const chub = THREE.MathUtils.clamp(opts.chubbiness, 0.88, 1.15);
  hipsGroup.scale.set(bodyScale * chub, bodyScale, bodyScale * chub);

  // Soft, Warm Velvety Chibi Skin Material (Zero harsh plastic specular glare)
  const cuteSkinHex = harmonizeCuteSkinTone(opts.skinTone);
  const cuteSkinCol = new THREE.Color(cuteSkinHex);
  const skinMat = new THREE.MeshStandardMaterial({
    color: cuteSkinCol,
    roughness: 0.78,
    metalness: 0.0,
    emissive: cuteSkinCol.clone().multiplyScalar(0.14),
    emissiveIntensity: 0.38,
  });

  // Soft Matte-Satin Plush Hair Material (Zero plastic tube glare)
  const hairCol = new THREE.Color(opts.hairColor);
  const hairMat = new THREE.MeshStandardMaterial({
    color: hairCol,
    roughness: 0.64,
    metalness: 0.02,
    emissive: hairCol.clone().multiplyScalar(0.08),
    emissiveIntensity: 0.25,
  });

  const topMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(opts.topColor),
    roughness: 0.65,
    metalness: 0.02,
  });

  const topSecMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(opts.topSecondary),
    roughness: 0.58,
    metalness: 0.02,
  });

  const jacketMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(opts.jacketPrimary),
    roughness: 0.58,
    metalness: 0.04,
  });

  const jacketSecMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(opts.jacketSecondary),
    roughness: 0.52,
    metalness: 0.04,
  });

  const bottomMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(opts.bottomColor),
    roughness: 0.68,
    metalness: 0.02,
  });

  const shoeMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(opts.shoeColor),
    roughness: 0.42,
    metalness: 0.05,
  });

  const whiteRubberMat = new THREE.MeshStandardMaterial({
    color: '#F8FAFC',
    roughness: 0.48,
    metalness: 0.02,
  });

  // ------------------------------------------
  // A. TORSO, NECK & LAYERED TOPS/JACKETS
  // ------------------------------------------
  const torsoGroup = new THREE.Group();
  hipsGroup.add(torsoGroup);

  const isFemale = opts.gender === 'female';
  const chestPoints = [
    new THREE.Vector2(0.01, -0.02),
    new THREE.Vector2(isFemale ? 0.185 : 0.198, 0.03),
    new THREE.Vector2(isFemale ? 0.168 : 0.195, 0.20),
    new THREE.Vector2(isFemale ? 0.205 : 0.228, 0.42),
    new THREE.Vector2(isFemale ? 0.208 : 0.225, 0.51),
    new THREE.Vector2(0.155, 0.565),
    new THREE.Vector2(0.078, 0.59),
  ];

  const baseTopMat =
    opts.topStyle === 'qipao_daisy'
      ? new THREE.MeshStandardMaterial({
          map: getDaisyPatternTexture(opts.topColor),
          roughness: 0.52,
        })
      : topMat;

  const torsoGeo = new THREE.LatheGeometry(chestPoints, seg);
  torsoGeo.scale(1.0, 1.0, 0.70);
  const torsoMesh = new THREE.Mesh(torsoGeo, baseTopMat);
  torsoMesh.castShadow = true;
  torsoMesh.receiveShadow = true;
  torsoGroup.add(torsoMesh);

  // Hem ring at the bottom of the shirt for crisp tailoring
  const shirtHem = new THREE.Mesh(
    new THREE.TorusGeometry(isFemale ? 0.184 : 0.196, 0.014, 10, 28),
    baseTopMat
  );
  shirtHem.rotation.x = Math.PI / 2;
  shirtHem.scale.set(1.0, 0.70, 1.0);
  shirtHem.position.set(0, 0.02, 0);
  torsoGroup.add(shirtHem);

  // Graceful Neck
  const neckMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.078, 0.15, 20), skinMat);
  neckMesh.position.set(0, 0.61, -0.005);
  neckMesh.castShadow = true;
  torsoGroup.add(neckMesh);

  const collarHollow = new THREE.Mesh(new THREE.SphereGeometry(0.042, 12, 12), skinMat);
  collarHollow.scale.set(1.7, 0.65, 0.8);
  collarHollow.position.set(0, 0.565, 0.095);
  torsoGroup.add(collarHollow);

  // Top Details (Positioned cleanly outside chest surface with zero clipping)
  if (opts.topStyle === 'era_uniform' || opts.topStyle === 'oxford_shirt') {
    const collarRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.088, 0.018, 12, 24),
      topSecMat
    );
    collarRing.rotation.x = Math.PI / 2 + 0.12;
    collarRing.position.set(0, 0.578, 0.008);
    torsoGroup.add(collarRing);

    [-1, 1].forEach((side) => {
      const collarPoint = new THREE.Mesh(new THREE.BoxGeometry(0.068, 0.036, 0.018), topSecMat);
      collarPoint.position.set(side * 0.046, 0.548, 0.132);
      collarPoint.rotation.set(-0.28, side * 0.22, -side * 0.34);
      torsoGroup.add(collarPoint);
    });

    const placket = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.18, 0.016), topSecMat);
    placket.position.set(0, 0.46, 0.148);
    placket.rotation.x = -0.06;
    torsoGroup.add(placket);

    // Signature Era emblem badge on chest
    const eraBadge = new THREE.Mesh(
      new THREE.CylinderGeometry(0.032, 0.032, 0.012, 20),
      new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.4 })
    );
    eraBadge.rotation.x = Math.PI / 2;
    eraBadge.position.set(-0.082, 0.42, 0.150);
    torsoGroup.add(eraBadge);

    const eraBadgeInner = new THREE.Mesh(
      new THREE.CylinderGeometry(0.020, 0.020, 0.014, 16),
      new THREE.MeshStandardMaterial({ color: '#F97316', roughness: 0.4 })
    );
    eraBadgeInner.rotation.x = Math.PI / 2;
    eraBadgeInner.position.set(-0.082, 0.42, 0.151);
    torsoGroup.add(eraBadgeInner);
  } else if (opts.topStyle === 'casual_tee' || opts.topStyle === 'sport_jersey' || opts.topStyle === 'knit_sweater') {
    const neckRib = new THREE.Mesh(new THREE.TorusGeometry(0.086, 0.016, 12, 24), topSecMat);
    neckRib.rotation.x = Math.PI / 2 + 0.14;
    neckRib.position.set(0, 0.575, 0.01);
    torsoGroup.add(neckRib);

    const badgeGroup = new THREE.Group();
    badgeGroup.position.set(-0.082, 0.41, 0.150);
    const badgeCircle = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.034, 0.012, 20), topSecMat);
    badgeCircle.rotation.x = Math.PI / 2;
    badgeGroup.add(badgeCircle);
    torsoGroup.add(badgeGroup);
  } else if (opts.topStyle === 'qipao_daisy') {
    const mandarinCollar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.082, 0.088, 0.044, 24, 1, true),
      new THREE.MeshStandardMaterial({ color: opts.topColor, side: THREE.DoubleSide })
    );
    mandarinCollar.position.set(0, 0.585, 0.0);
    torsoGroup.add(mandarinCollar);

    const pipingCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.0, 0.56, 0.132),
      new THREE.Vector3(-0.075, 0.49, 0.152),
      new THREE.Vector3(-0.145, 0.37, 0.142),
    ]);
    const pipingMesh = new THREE.Mesh(new THREE.TubeGeometry(pipingCurve, 12, 0.0075, 8, false), topSecMat);
    torsoGroup.add(pipingMesh);

    [0.53, 0.46].forEach((by, idx) => {
      const frog = new THREE.Mesh(new THREE.SphereGeometry(0.013, 10, 10), topSecMat);
      frog.scale.set(1.6, 0.7, 0.7);
      frog.position.set(-0.03 - idx * 0.055, by, 0.152);
      torsoGroup.add(frog);
    });
  } else if (opts.topStyle === 'sailor_blouse') {
    // Clean, non-clipping cute sailor collar ring & front satin bow
    const sailorCollarRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.105, 0.022, 12, 28),
      topSecMat
    );
    sailorCollarRing.rotation.x = Math.PI / 2 + 0.18;
    sailorCollarRing.scale.set(1.15, 0.92, 1.0);
    sailorCollarRing.position.set(0, 0.565, 0.008);
    torsoGroup.add(sailorCollarRing);

    const bowGroup = new THREE.Group();
    bowGroup.position.set(0, 0.48, 0.156);
    const bowMat = new THREE.MeshStandardMaterial({ color: '#FB7185', roughness: 0.45 });
    const knot = new THREE.Mesh(new THREE.SphereGeometry(0.022, 12, 12), bowMat);
    bowGroup.add(knot);
    [-1, 1].forEach((side) => {
      const loop = new THREE.Mesh(new THREE.SphereGeometry(0.028, 12, 12), bowMat);
      loop.scale.set(1.35, 0.85, 0.55);
      loop.position.set(side * 0.032, 0.004, 0);
      loop.rotation.z = side * 0.22;
      bowGroup.add(loop);

      const ribbon = new THREE.Mesh(new THREE.CapsuleGeometry(0.009, 0.045, 6, 8), bowMat);
      ribbon.position.set(side * 0.018, -0.035, 0.002);
      ribbon.rotation.z = -side * 0.25;
      bowGroup.add(ribbon);
    });
    torsoGroup.add(bowGroup);
  }

  // Outer Jacket / Vest Layer
  if (opts.jacketStyle !== 'none') {
    const vestPoints = [
      new THREE.Vector2(0.01, 0.01),
      new THREE.Vector2(0.212, 0.03),
      new THREE.Vector2(0.218, 0.23),
      new THREE.Vector2(0.242, 0.45),
      new THREE.Vector2(0.188, 0.55),
      new THREE.Vector2(0.095, 0.585),
    ];
    const vestGeo = new THREE.LatheGeometry(vestPoints, 28, -Math.PI * 0.38, Math.PI * 1.76);
    vestGeo.scale(1.0, 1.0, 0.74);
    const vestMesh = new THREE.Mesh(vestGeo, jacketMat);
    vestMesh.rotation.y = Math.PI * 0.5;
    vestMesh.castShadow = true;
    torsoGroup.add(vestMesh);

    const zipL = new THREE.Mesh(new THREE.BoxGeometry(0.024, 0.53, 0.028), jacketSecMat);
    zipL.position.set(0.04, 0.29, 0.154);
    torsoGroup.add(zipL);
    const zipR = new THREE.Mesh(new THREE.BoxGeometry(0.024, 0.53, 0.028), jacketSecMat);
    zipR.position.set(-0.04, 0.29, 0.154);
    torsoGroup.add(zipR);

    [-1, 1].forEach((side) => {
      const pkt = new THREE.Mesh(new THREE.BoxGeometry(0.088, 0.10, 0.032), jacketSecMat);
      pkt.position.set(side * 0.108, 0.16, 0.142);
      pkt.rotation.y = side * 0.25;
      torsoGroup.add(pkt);
    });

    if (opts.jacketStyle === 'hoodie_vest') {
      const hoodRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.128, 0.044, 14, 24, Math.PI * 1.35),
        jacketMat
      );
      hoodRing.rotation.set(Math.PI * 0.55, 0, Math.PI * 0.82);
      hoodRing.position.set(0, 0.575, -0.03);
      torsoGroup.add(hoodRing);
    }
  }

  // Waist Belt
  if (opts.beltStyle && opts.beltStyle !== 'none' && opts.beltStyle !== 'None') {
    const beltColorHex =
      opts.beltStyle === 'Belt_Brown'
        ? '#5C3A21'
        : opts.beltStyle === 'Belt_Black'
        ? '#18181B'
        : opts.beltStyle === 'Belt_White'
        ? '#F8FAFC'
        : '#3B2314';
    const buckleColorHex =
      opts.beltStyle === 'Belt_Black' || opts.beltStyle === 'Belt_White' ? '#E2E8F0' : '#FACC15';

    const beltStrap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.20, 0.20, 0.046, 28),
      new THREE.MeshStandardMaterial({ color: beltColorHex, roughness: 0.4, metalness: 0.15 })
    );
    beltStrap.scale.set(1.0, 1.0, 0.72);
    beltStrap.position.set(0, 0.035, 0);
    torsoGroup.add(beltStrap);

    const buckle = new THREE.Mesh(
      new THREE.BoxGeometry(0.07, 0.056, 0.028),
      new THREE.MeshStandardMaterial({ color: buckleColorHex, roughness: 0.2, metalness: 0.85 })
    );
    buckle.position.set(0, 0.035, 0.146);
    torsoGroup.add(buckle);
  }

  // ------------------------------------------
  // B. SEAMLESS SHOULDERS, ARMS & CUTE CHIBI MITTEN HANDS
  // ------------------------------------------
  const leftArmGroup = new THREE.Group();
  leftArmGroup.position.set(0.202, 0.495, 0);
  torsoGroup.add(leftArmGroup);

  const rightArmGroup = new THREE.Group();
  rightArmGroup.position.set(-0.202, 0.495, 0);
  torsoGroup.add(rightArmGroup);

  const hasJacketSleeves =
    opts.jacketStyle === 'varsity_jacket' ||
    opts.jacketStyle === 'school_blazer' ||
    opts.jacketStyle === 'denim_jacket' ||
    opts.jacketStyle === 'cardigan_open' ||
    opts.jacketStyle === 'cyber_jacket';
  const hasLongTopSleeves =
    opts.topStyle === 'knit_sweater' || opts.topStyle === 'oxford_shirt' || hasJacketSleeves;

  [
    { group: leftArmGroup, side: 1 },
    { group: rightArmGroup, side: -1 },
  ].forEach(({ group, side }) => {
    const sleeveMat = hasJacketSleeves
      ? opts.jacketStyle === 'varsity_jacket'
        ? jacketSecMat
        : jacketMat
      : baseTopMat;

    // Smoothly integrated shoulder cap
    const shoulderCap = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.064, 0.05, 10, 16),
      sleeveMat
    );
    shoulderCap.position.set(side * 0.008, -0.015, 0);
    shoulderCap.rotation.z = side * 0.18;
    shoulderCap.castShadow = true;
    group.add(shoulderCap);

    const sleeveLen = hasLongTopSleeves ? 0.34 : 0.165;
    const upperSleeve = new THREE.Mesh(
      new THREE.CylinderGeometry(0.064, hasLongTopSleeves ? 0.054 : 0.060, sleeveLen, 18),
      sleeveMat
    );
    upperSleeve.position.set(side * 0.018, -sleeveLen * 0.5 - 0.01, 0);
    upperSleeve.rotation.z = side * 0.05;
    upperSleeve.castShadow = true;
    group.add(upperSleeve);

    if (!hasLongTopSleeves) {
      const cuffRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.060, 0.010, 10, 20),
        opts.topStyle === 'era_uniform' || opts.topStyle === 'sailor_blouse' ? topSecMat : sleeveMat
      );
      cuffRing.rotation.x = Math.PI / 2;
      cuffRing.position.set(side * 0.022, -0.172, 0);
      group.add(cuffRing);

      const forearm = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.048, 0.18, 12, 18),
        skinMat
      );
      forearm.position.set(side * 0.028, -0.252, 0.012);
      forearm.rotation.z = side * 0.03;
      forearm.rotation.x = -0.06;
      forearm.castShadow = true;
      group.add(forearm);
    } else {
      const wristCuff = new THREE.Mesh(
        new THREE.TorusGeometry(0.054, 0.010, 10, 20),
        topSecMat
      );
      wristCuff.rotation.x = Math.PI / 2;
      wristCuff.position.set(side * 0.028, -0.35, 0.008);
      group.add(wristCuff);
    }

    // Adorable Plump Chibi Mitten Hand (Smooth rounded paw + cute little thumb, no creepy spider fingers)
    const handGroup = new THREE.Group();
    handGroup.position.set(side * 0.034, -0.388, 0.022);
    group.add(handGroup);

    const palm = new THREE.Mesh(new THREE.SphereGeometry(0.050, 18, 18), skinMat);
    palm.scale.set(0.88, 1.12, 0.74);
    palm.castShadow = true;
    handGroup.add(palm);

    const thumb = new THREE.Mesh(new THREE.CapsuleGeometry(0.016, 0.022, 8, 10), skinMat);
    thumb.position.set(-side * 0.034, 0.004, 0.022);
    thumb.rotation.set(0.32, 0, side * 0.55);
    handGroup.add(thumb);

    // Blue Smartwatch on Left Wrist
    if (side === 1 && opts.accessories.includes('smart_watch')) {
      const watchGroup = new THREE.Group();
      watchGroup.position.set(0.03, -0.33, 0.014);
      const strap = new THREE.Mesh(
        new THREE.TorusGeometry(0.048, 0.012, 10, 20),
        new THREE.MeshStandardMaterial({ color: '#0284C7', roughness: 0.4 })
      );
      strap.rotation.x = Math.PI / 2;
      watchGroup.add(strap);

      const watchCase = new THREE.Mesh(
        new THREE.BoxGeometry(0.042, 0.048, 0.02),
        new THREE.MeshStandardMaterial({ color: '#0F172A', metalness: 0.7, roughness: 0.2 })
      );
      watchCase.position.set(0.044, 0, 0.01);
      watchCase.rotation.y = 0.35;
      watchGroup.add(watchCase);

      const watchScreen = new THREE.Mesh(
        new THREE.PlaneGeometry(0.032, 0.036),
        new THREE.MeshBasicMaterial({ color: '#38BDF8' })
      );
      watchScreen.position.set(0.055, 0, 0.015);
      watchScreen.rotation.y = Math.PI / 2;
      watchGroup.add(watchScreen);
      group.add(watchGroup);
    }
  });

  // ------------------------------------------
  // C. CONTOURED PELVIS, BOTTOMS, LEGS & 3D SNEAKERS
  // ------------------------------------------
  const isSkirt = opts.bottomStyle === 'pleated_skirt' || opts.bottomStyle === 'plaid_skirt';
  const isShorts = opts.bottomStyle === 'cargo_shorts' || opts.bottomStyle === 'denim_shorts';

  if (isSkirt) {
    const skirtGroup = new THREE.Group();
    skirtGroup.position.set(0, 0.03, 0);
    hipsGroup.add(skirtGroup);

    const waistband = new THREE.Mesh(
      new THREE.CylinderGeometry(0.188, 0.195, 0.05, 28),
      bottomMat
    );
    waistband.scale.set(1.0, 1.0, 0.72);
    waistband.position.y = -0.01;
    skirtGroup.add(waistband);

    const skirtCone = new THREE.Mesh(
      new THREE.CylinderGeometry(0.19, 0.285, 0.32, 28),
      bottomMat
    );
    skirtCone.scale.set(1.0, 1.0, 0.76);
    skirtCone.position.y = -0.16;
    skirtCone.castShadow = true;
    skirtGroup.add(skirtCone);

    const pleatCount = 18;
    for (let p = 0; p < pleatCount; p++) {
      const a = (p / pleatCount) * Math.PI * 2;
      const pleat = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.30, 0.022), bottomMat);
      pleat.position.set(Math.cos(a) * 0.225, -0.16, Math.sin(a) * 0.175);
      pleat.rotation.y = -a;
      pleat.rotation.x = 0.2;
      skirtGroup.add(pleat);
    }
  } else {
    // Contoured hip block that tapers smoothly into the thighs without overhanging edges
    const pelvis = new THREE.Mesh(
      new THREE.CylinderGeometry(0.192, 0.182, 0.14, 24),
      bottomMat
    );
    pelvis.scale.set(1.0, 1.0, 0.70);
    pelvis.position.set(0, -0.04, 0);
    pelvis.castShadow = true;
    hipsGroup.add(pelvis);

    const hipBridge = new THREE.Mesh(
      new THREE.SphereGeometry(0.182, 20, 16),
      bottomMat
    );
    hipBridge.scale.set(1.0, 0.45, 0.68);
    hipBridge.position.set(0, -0.095, 0);
    hipsGroup.add(hipBridge);
  }

  const leftLegGroup = new THREE.Group();
  leftLegGroup.position.set(0.096, -0.08, 0);
  hipsGroup.add(leftLegGroup);

  const rightLegGroup = new THREE.Group();
  rightLegGroup.position.set(-0.096, -0.08, 0);
  hipsGroup.add(rightLegGroup);

  [
    { group: leftLegGroup, side: 1 },
    { group: rightLegGroup, side: -1 },
  ].forEach(({ group, side }) => {
    if (isSkirt) {
      const legMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.074, 0.052, 0.68, 18),
        skinMat
      );
      legMesh.position.y = -0.38;
      legMesh.castShadow = true;
      group.add(legMesh);

      const sock = new THREE.Mesh(
        new THREE.CylinderGeometry(0.056, 0.054, 0.22, 18),
        whiteRubberMat
      );
      sock.position.y = -0.68;
      group.add(sock);

      const sockCuff = new THREE.Mesh(
        new THREE.TorusGeometry(0.057, 0.010, 10, 20),
        whiteRubberMat
      );
      sockCuff.rotation.x = Math.PI / 2;
      sockCuff.position.y = -0.57;
      group.add(sockCuff);
    } else if (isShorts) {
      const shortLeg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.090, 0.084, 0.32, 18),
        bottomMat
      );
      shortLeg.position.y = -0.17;
      shortLeg.castShadow = true;
      group.add(shortLeg);

      const stripe = new THREE.Mesh(
        new THREE.BoxGeometry(0.016, 0.31, 0.026),
        whiteRubberMat
      );
      stripe.position.set(side * 0.084, -0.17, 0);
      group.add(stripe);

      const calf = new THREE.Mesh(
        new THREE.CylinderGeometry(0.066, 0.050, 0.44, 18),
        skinMat
      );
      calf.position.y = -0.52;
      calf.castShadow = true;
      group.add(calf);

      const sock = new THREE.Mesh(
        new THREE.CylinderGeometry(0.055, 0.054, 0.16, 16),
        whiteRubberMat
      );
      sock.position.y = -0.71;
      group.add(sock);
    } else {
      // Tapered trousers ending neatly at the ankle (-0.68) so the full 3D sneaker is clearly visible
      const pantLeg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.090, 0.072, 0.64, 20),
        bottomMat
      );
      pantLeg.position.y = -0.35;
      pantLeg.castShadow = true;
      group.add(pantLeg);

      if (opts.bottomStyle === 'cuffed_jeans') {
        const cuff = new THREE.Mesh(
          new THREE.CylinderGeometry(0.078, 0.078, 0.055, 20),
          whiteRubberMat
        );
        cuff.position.y = -0.665;
        group.add(cuff);
      }

      const ankleSock = new THREE.Mesh(
        new THREE.CylinderGeometry(0.055, 0.054, 0.14, 16),
        whiteRubberMat
      );
      ankleSock.position.y = -0.73;
      group.add(ankleSock);
    }

    // Full 3D Sculpted Footwear (Grounded cleanly at Y = -0.90 in leg space -> Y = 0.00 in world space)
    const shoeGroup = new THREE.Group();
    shoeGroup.position.set(0, -0.82, 0.032);
    group.add(shoeGroup);

    if (opts.shoeStyle === 'mary_janes') {
      const sole = new THREE.Mesh(new THREE.BoxGeometry(0.125, 0.036, 0.24), whiteRubberMat);
      sole.position.set(0, -0.058, 0.01);
      sole.castShadow = true;
      shoeGroup.add(sole);

      const body = new THREE.Mesh(new THREE.SphereGeometry(0.072, 18, 16), shoeMat);
      body.scale.set(0.92, 0.72, 1.68);
      body.position.set(0, -0.018, 0.01);
      body.castShadow = true;
      shoeGroup.add(body);

      const strap = new THREE.Mesh(new THREE.TorusGeometry(0.056, 0.010, 8, 16, Math.PI), shoeMat);
      strap.rotation.z = Math.PI / 2;
      strap.position.set(0, 0.02, -0.005);
      shoeGroup.add(strap);
    } else {
      // Chunky 3D Sneaker with white midsole, colored upper, tongue, toe box, and laces
      const midsole = new THREE.Mesh(new THREE.CapsuleGeometry(0.064, 0.13, 10, 18), whiteRubberMat);
      midsole.rotation.x = Math.PI / 2;
      midsole.scale.set(1.04, 1.0, 0.52);
      midsole.position.set(0, -0.052, 0.015);
      midsole.castShadow = true;
      shoeGroup.add(midsole);

      const upper = new THREE.Mesh(new THREE.SphereGeometry(0.072, 18, 16), shoeMat);
      upper.scale.set(0.95, 0.88, 1.65);
      upper.position.set(0, -0.005, 0.008);
      upper.castShadow = true;
      shoeGroup.add(upper);

      const collarCuff = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.066, 0.045, 16), shoeMat);
      collarCuff.position.set(0, 0.032, -0.028);
      shoeGroup.add(collarCuff);

      const tongue = new THREE.Mesh(new THREE.BoxGeometry(0.058, 0.055, 0.022), shoeMat);
      tongue.position.set(0, 0.042, 0.022);
      tongue.rotation.x = -0.35;
      shoeGroup.add(tongue);

      const toeCap = new THREE.Mesh(new THREE.SphereGeometry(0.064, 16, 14), whiteRubberMat);
      toeCap.scale.set(0.96, 0.68, 0.92);
      toeCap.position.set(0, -0.016, 0.078);
      shoeGroup.add(toeCap);

      for (let l = 0; l < 3; l++) {
        const lace = new THREE.Mesh(new THREE.BoxGeometry(0.064, 0.011, 0.015), whiteRubberMat);
        lace.position.set(0, 0.038 - l * 0.010, 0.008 + l * 0.024);
        lace.rotation.x = 0.42;
        shoeGroup.add(lace);
      }
    }
  });

  // ------------------------------------------
  // D. SCULPTED CHIBI HEAD, BIG KAWAII EYES & CUTE FACIAL FEATURES
  // ------------------------------------------
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.90, 0);
  const hs = THREE.MathUtils.clamp(opts.headScale * 1.05, 0.96, 1.22);
  headGroup.scale.set(hs, hs, hs);
  torsoGroup.add(headGroup);

  const headGeo = createSculptedRealisticHeadGeometry(
    opts.faceShape,
    opts.jawDefine,
    opts.chubbiness,
    seg
  );
  const headMesh = new THREE.Mesh(headGeo, skinMat);
  headMesh.castShadow = true;
  headMesh.receiveShadow = true;
  headGroup.add(headMesh);

  // Cute Rounded Ears & Earrings
  const innerEarMat = new THREE.MeshStandardMaterial({
    color: '#F4A298',
    roughness: 0.75,
  });
  [-1, 1].forEach((side) => {
    const earGroup = new THREE.Group();
    earGroup.position.set(side * 0.34, -0.025, -0.015);
    headGroup.add(earGroup);

    const earScale =
      opts.earStyle === 'small' ? 0.85 : opts.earStyle === 'prominent' ? 1.18 : 1.0;

    if (opts.earStyle === 'elf') {
      const elfEar = new THREE.Mesh(new THREE.ConeGeometry(0.052, 0.16, 14), skinMat);
      elfEar.rotation.set(-0.18, 0, -side * 0.92);
      elfEar.position.set(side * 0.038, 0.025, -0.01);
      earGroup.add(elfEar);
    } else {
      const outerEar = new THREE.Mesh(new THREE.SphereGeometry(0.068 * earScale, 16, 16), skinMat);
      outerEar.scale.set(0.52, 1.06, 0.72);
      outerEar.rotation.y = side * 0.25;
      earGroup.add(outerEar);

      const innerEar = new THREE.Mesh(new THREE.SphereGeometry(0.038 * earScale, 12, 12), innerEarMat);
      innerEar.scale.set(0.45, 0.95, 0.55);
      innerEar.position.set(side * 0.008, 0, 0.018);
      earGroup.add(innerEar);
    }

    if (opts.earStyle === 'pierced_gold') {
      const hoop = new THREE.Mesh(
        new THREE.TorusGeometry(0.022, 0.005, 8, 16),
        new THREE.MeshStandardMaterial({ color: '#FACC15', metalness: 0.85, roughness: 0.2 })
      );
      hoop.position.set(side * 0.015, -0.062, 0.01);
      hoop.rotation.y = Math.PI / 2;
      earGroup.add(hoop);
    } else if (opts.earStyle === 'pierced_pearl') {
      const pearl = new THREE.Mesh(
        new THREE.SphereGeometry(0.016, 12, 12),
        new THREE.MeshStandardMaterial({ color: '#FFFBEB', roughness: 0.2, metalness: 0.1 })
      );
      pearl.position.set(side * 0.02, -0.052, 0.015);
      earGroup.add(pearl);
    }
  });

  // Big Sparkling Kawaii Chibi Eyes (Flush Sclera + Large Glossy Iris + Cute Upper Lash)
  const eyeColorData = EYE_COLORS.find((c) => c.id === opts.eyeColor) || EYE_COLORS[0];
  const irisTex = createIrisTexture(eyeColorData.hex, eyeColorData.rim);
  const scleraMat = new THREE.MeshBasicMaterial({
    color: '#FFFFFF',
  });
  const irisDiscMat = new THREE.MeshBasicMaterial({
    map: irisTex,
    transparent: true,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -2,
  });
  const lashMat = new THREE.MeshStandardMaterial({ color: '#1E1620', roughness: 0.5 });
  const eyelids: THREE.Mesh[] = [];

  [-1, 1].forEach((side) => {
    const eyeSocketGroup = new THREE.Group();
    // Positioned slightly lower on the head for adorable baby-schema chibi proportions
    eyeSocketGroup.position.set(side * 0.116, -0.004, 0.298);
    eyeSocketGroup.rotation.y = side * 0.18;

    const es = THREE.MathUtils.clamp(opts.eyeScale * 1.06, 0.92, 1.24);
    let sy = 1.02;
    let rotZ = 0;
    if (opts.eyeShape === 'almond') sy = 0.94;
    else if (opts.eyeShape === 'round_bright') sy = 1.08;
    else if (opts.eyeShape === 'upturned') {
      sy = 0.96;
      rotZ = side * 0.09;
    } else if (opts.eyeShape === 'hooded') sy = 0.90;
    else if (opts.eyeShape === 'gentle_droop') rotZ = -side * 0.08;
    else if (opts.eyeShape === 'sharp_anime') {
      sy = 0.92;
      rotZ = side * 0.11;
    }

    eyeSocketGroup.scale.set(es, es * sy, es);
    eyeSocketGroup.rotation.z = rotZ;
    headGroup.add(eyeSocketGroup);

    // 1. Smooth Flush White Sclera Oval (Zero creepy bug-eye bulging)
    const sclera = new THREE.Mesh(new THREE.CircleGeometry(0.064, 28), scleraMat);
    sclera.scale.set(1.06, 0.98, 1.0);
    sclera.position.set(0, 0, 0.016);
    eyeSocketGroup.add(sclera);

    // 2. Large Sparkling Kawaii Iris & Pupil Disc (~82% of eye area for maximum cuteness!)
    const irisDisc = new THREE.Mesh(new THREE.CircleGeometry(0.056, 32), irisDiscMat);
    irisDisc.scale.set(0.98, 1.04, 1.0);
    irisDisc.position.set(-side * 0.004, -0.001, 0.019);
    eyeSocketGroup.add(irisDisc);

    // 3. Cute Thick Upper Eyelash Arch
    const upperLash = new THREE.Mesh(
      new THREE.TorusGeometry(0.064, 0.0095, 10, 26, Math.PI * 0.92),
      lashMat
    );
    upperLash.scale.set(1.05, 0.98, 0.65);
    upperLash.position.set(0, 0.004, 0.020);
    upperLash.rotation.z = Math.PI * 0.04;
    eyeSocketGroup.add(upperLash);

    // Cute outer eyelash flick
    const lashFlick = new THREE.Mesh(new THREE.ConeGeometry(0.008, 0.024, 8), lashMat);
    lashFlick.position.set(side * 0.066, 0.018, 0.018);
    lashFlick.rotation.z = -side * 1.15;
    eyeSocketGroup.add(lashFlick);

    // 4. Blinking Eyelid Cap (Tucked at top & hidden when open so it NEVER slices across the eye!)
    const eyelid = new THREE.Mesh(
      new THREE.CircleGeometry(0.068, 24),
      skinMat
    );
    eyelid.scale.set(1.08, 0.05, 1.0);
    eyelid.position.set(0, 0.004, 0.023);
    eyelid.visible = false;
    eyeSocketGroup.add(eyelid);
    eyelids.push(eyelid);
  });

  // Soft Expressive Eyebrows
  const browMat = new THREE.MeshStandardMaterial({ color: opts.hairColor, roughness: 0.65 });
  [-1, 1].forEach((side) => {
    let archY = 0.098;
    let tipY = 0.086;
    let innerY = 0.090;
    let thickness = 0.0105;

    if (opts.eyebrowStyle === 'straight_korean') {
      archY = 0.094;
      tipY = 0.090;
      innerY = 0.092;
    } else if (opts.eyebrowStyle === 'bold_defined') {
      thickness = 0.0135;
      archY = 0.102;
    } else if (opts.eyebrowStyle === 'high_glam') {
      archY = 0.108;
      tipY = 0.086;
    } else if (opts.eyebrowStyle === 'gentle_worried') {
      innerY = 0.102;
      archY = 0.094;
      tipY = 0.080;
    } else if (opts.eyebrowStyle === 'fierce_angled') {
      innerY = 0.082;
      archY = 0.104;
      tipY = 0.096;
    }

    const browCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * 0.058, innerY, 0.312),
      new THREE.Vector3(side * 0.116, archY, 0.304),
      new THREE.Vector3(side * 0.172, tipY, 0.280),
    ]);
    const browMesh = new THREE.Mesh(new THREE.TubeGeometry(browCurve, 12, thickness, 8, false), browMat);
    headGroup.add(browMesh);
  });

  // Cute Tiny Chibi Button Nose (No harsh long bridge)
  const noseGroup = new THREE.Group();
  noseGroup.position.set(0, -0.042, 0.326);
  headGroup.add(noseGroup);

  const noseTip = new THREE.Mesh(new THREE.SphereGeometry(0.020, 16, 16), skinMat);
  noseTip.scale.set(1.18, 0.82, 0.76);
  noseGroup.add(noseTip);

  // Sweet Chibi Mouth & Happy Smile
  const mouthGroup = new THREE.Group();
  mouthGroup.position.set(0, -0.108, 0.314);
  headGroup.add(mouthGroup);

  const lipMat = new THREE.MeshStandardMaterial({
    color: '#FB7185',
    roughness: 0.45,
    metalness: 0.0,
    emissive: new THREE.Color('#E11D48'),
    emissiveIntensity: 0.18,
  });

  if (opts.mouthStyle === 'happy_grin') {
    // Adorable open D-shaped chibi laugh with rosy pink tongue
    const cavity = new THREE.Mesh(
      new THREE.CircleGeometry(0.038, 20, Math.PI, Math.PI),
      new THREE.MeshBasicMaterial({ color: '#9F1239' })
    );
    cavity.scale.set(1.25, 0.95, 1.0);
    cavity.position.set(0, 0.008, 0.006);
    mouthGroup.add(cavity);

    const tongue = new THREE.Mesh(
      new THREE.CircleGeometry(0.022, 16, Math.PI, Math.PI),
      new THREE.MeshBasicMaterial({ color: '#FDA4AF' })
    );
    tongue.scale.set(1.2, 0.75, 1.0);
    tongue.position.set(0, -0.006, 0.008);
    mouthGroup.add(tongue);
  } else if (opts.mouthStyle === 'surprised_o') {
    const oRing = new THREE.Mesh(new THREE.TorusGeometry(0.020, 0.007, 10, 20), lipMat);
    oRing.position.set(0, 0, 0.006);
    mouthGroup.add(oRing);
  } else if (opts.mouthStyle === 'cat_cute') {
    [-1, 1].forEach((side) => {
      const catCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0.002, 0.008),
        new THREE.Vector3(side * 0.022, -0.010, 0.006),
        new THREE.Vector3(side * 0.044, 0.008, 0.002),
      ]);
      mouthGroup.add(new THREE.Mesh(new THREE.TubeGeometry(catCurve, 10, 0.0065, 8, false), lipMat));
    });
  } else {
    const isSmirk = opts.mouthStyle === 'confident_smirk';
    const isNeutral = opts.mouthStyle === 'serene_neutral';
    const smileCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.046, isNeutral ? 0.002 : 0.014, 0.002),
      new THREE.Vector3(0, isNeutral ? -0.003 : -0.010, 0.010),
      new THREE.Vector3(0.046, isSmirk ? 0.022 : isNeutral ? 0.002 : 0.014, 0.002),
    ]);
    const smileMesh = new THREE.Mesh(
      new THREE.TubeGeometry(smileCurve, 16, 0.0075, 8, false),
      lipMat
    );
    mouthGroup.add(smileMesh);
  }

  // Soft Rosy Cheek Blush (Always enabled on cute chibi faces unless explicitly disabled)
  if (opts.blush !== false) {
    const blushMat = new THREE.MeshBasicMaterial({
      map: createSoftBlushTexture(),
      transparent: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -3,
    });
    [-1, 1].forEach((side) => {
      const blush = new THREE.Mesh(new THREE.PlaneGeometry(0.105, 0.068), blushMat);
      blush.position.set(side * 0.175, -0.056, 0.296);
      blush.rotation.y = side * 0.42;
      blush.rotation.x = 0.06;
      headGroup.add(blush);
    });
  }

  if (opts.skinDetail === 'freckles') {
    const freckleMat = new THREE.MeshBasicMaterial({
      color: '#9A5B32',
      transparent: true,
      opacity: 0.55,
    });
    const coords = [
      [-0.135, -0.038, 0.304], [-0.165, -0.050, 0.292], [-0.115, -0.054, 0.312],
      [0.135, -0.038, 0.304], [0.165, -0.050, 0.292], [0.115, -0.054, 0.312],
    ];
    coords.forEach(([fx, fy, fz]) => {
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.0045, 6, 6), freckleMat);
      dot.position.set(fx, fy, fz);
      headGroup.add(dot);
    });
  } else if (opts.skinDetail === 'beauty_left') {
    const mole = new THREE.Mesh(
      new THREE.SphereGeometry(0.006, 8, 8),
      new THREE.MeshBasicMaterial({ color: '#27170E' })
    );
    mole.position.set(0.15, -0.08, 0.292);
    headGroup.add(mole);
  } else if (opts.skinDetail === 'beauty_eye') {
    const mole = new THREE.Mesh(
      new THREE.SphereGeometry(0.0055, 8, 8),
      new THREE.MeshBasicMaterial({ color: '#27170E' })
    );
    mole.position.set(-0.14, -0.04, 0.306);
    headGroup.add(mole);
  } else if (opts.skinDetail === 'bandaid') {
    const bandaid = new THREE.Mesh(
      new THREE.BoxGeometry(0.082, 0.022, 0.012),
      new THREE.MeshStandardMaterial({ color: '#FDE68A', roughness: 0.7 })
    );
    bandaid.position.set(0, -0.028, 0.338);
    bandaid.rotation.z = 0.08;
    headGroup.add(bandaid);
  }

  // ------------------------------------------
  // E. PLUSH VOLUMETRIC CHIBI HAIRSTYLES (ZERO GAPS, SOFT SCULPTED BANGS)
  // ------------------------------------------
  const hairGroup = new THREE.Group();
  headGroup.add(hairGroup);

  // 1. Full Plush Crown Dome: wraps seamlessly over the top, sides, and upper forehead
  const hairCap = new THREE.Mesh(
    new THREE.SphereGeometry(0.368, 32, 26, 0, Math.PI * 2, 0, Math.PI * 0.54),
    hairMat
  );
  hairCap.scale.set(1.04, 1.02, 0.99);
  hairCap.position.set(0, 0.028, -0.008);
  hairCap.rotation.x = -0.08;
  hairCap.castShadow = true;
  hairGroup.add(hairCap);

  // 2. Back Cranium & Nape Cushion: full rounded back volume
  const backHair = new THREE.Mesh(
    new THREE.SphereGeometry(0.366, 28, 24, 0, Math.PI * 2, 0, Math.PI * 0.56),
    hairMat
  );
  backHair.scale.set(1.04, 1.0, 0.98);
  backHair.position.set(0, 0.005, -0.024);
  backHair.rotation.x = -Math.PI * 0.42;
  backHair.castShadow = true;
  hairGroup.add(backHair);

  // 3. Soft Sculpted Forehead Bangs Base (Eliminates any bald forehead gap between locks!)
  const frontBangsShield = new THREE.Mesh(
    new THREE.SphereGeometry(0.362, 28, 20, Math.PI * 0.18, Math.PI * 0.64, Math.PI * 0.16, Math.PI * 0.28),
    hairMat
  );
  frontBangsShield.scale.set(1.04, 1.0, 0.97);
  frontBangsShield.position.set(0, 0.02, 0.008);
  frontBangsShield.rotation.y = 0;
  frontBangsShield.castShadow = true;
  hairGroup.add(frontBangsShield);

  // 4. Plush Sideburn & Temple Locks framing the cheeks
  [-1, 1].forEach((side) => {
    const sideLock = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.14, 10, 14), hairMat);
    sideLock.scale.set(0.65, 1.0, 1.15);
    sideLock.position.set(side * 0.325, 0.10, 0.11);
    sideLock.rotation.set(0.22, side * 0.35, side * 0.18);
    sideLock.castShadow = true;
    hairGroup.add(sideLock);
  });

  // Helper to add soft sculpted chibi fringe petals across the forehead
  const addCuteBangsRow = (partStyle: 'full' | 'curtain' | 'swept' = 'full') => {
    const bangConfigs =
      partStyle === 'curtain'
        ? [
            { x: -0.15, y: 0.21, z: 0.28, rx: -0.22, ry: -0.28, rz: 0.32, sx: 1.25, sy: 1.1 },
            { x: -0.07, y: 0.23, z: 0.30, rx: -0.24, ry: -0.12, rz: 0.18, sx: 1.15, sy: 1.0 },
            { x: 0.07, y: 0.23, z: 0.30, rx: -0.24, ry: 0.12, rz: -0.18, sx: 1.15, sy: 1.0 },
            { x: 0.15, y: 0.21, z: 0.28, rx: -0.22, ry: 0.28, rz: -0.32, sx: 1.25, sy: 1.1 },
          ]
        : partStyle === 'swept'
        ? [
            { x: -0.14, y: 0.21, z: 0.28, rx: -0.24, ry: -0.22, rz: 0.20, sx: 1.25, sy: 1.05 },
            { x: -0.04, y: 0.21, z: 0.31, rx: -0.26, ry: -0.05, rz: 0.14, sx: 1.35, sy: 1.08 },
            { x: 0.06, y: 0.21, z: 0.31, rx: -0.26, ry: 0.10, rz: 0.10, sx: 1.35, sy: 1.08 },
            { x: 0.15, y: 0.21, z: 0.28, rx: -0.24, ry: 0.25, rz: -0.15, sx: 1.25, sy: 1.05 },
          ]
        : [
            { x: -0.15, y: 0.20, z: 0.27, rx: -0.24, ry: -0.26, rz: 0.22, sx: 1.2, sy: 1.05 },
            { x: -0.075, y: 0.20, z: 0.305, rx: -0.26, ry: -0.12, rz: 0.08, sx: 1.25, sy: 1.08 },
            { x: 0.0, y: 0.20, z: 0.315, rx: -0.28, ry: 0.0, rz: 0.0, sx: 1.3, sy: 1.08 },
            { x: 0.075, y: 0.20, z: 0.305, rx: -0.26, ry: 0.12, rz: -0.08, sx: 1.25, sy: 1.08 },
            { x: 0.15, y: 0.20, z: 0.27, rx: -0.24, ry: 0.26, rz: -0.22, sx: 1.2, sy: 1.05 },
          ];

    bangConfigs.forEach((b) => {
      const petal = new THREE.Mesh(new THREE.SphereGeometry(0.078, 16, 14), hairMat);
      petal.scale.set(b.sx, b.sy * 1.25, 0.52);
      petal.position.set(b.x, b.y, b.z);
      petal.rotation.set(b.rx, b.ry, b.rz);
      petal.castShadow = true;
      hairGroup.add(petal);
    });
  };

  const hsId = opts.hairStyle;

  if (hsId === 'fluffy_swept' || hsId === 'textured_crop' || hsId === 'kpop_curtain' || hsId === 'Pompadour') {
    addCuteBangsRow(hsId === 'kpop_curtain' ? 'curtain' : 'swept');
    // Cute top ahoge / fluffy crown puff
    const topPuff = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 14), hairMat);
    topPuff.scale.set(1.4, 0.65, 1.15);
    topPuff.position.set(0, 0.34, 0.04);
    hairGroup.add(topPuff);
  } else if (hsId === 'twin_buns') {
    addCuteBangsRow('full');
    [-1, 1].forEach((side) => {
      const bun = new THREE.Mesh(new THREE.SphereGeometry(0.165, 22, 20), hairMat);
      bun.position.set(side * 0.29, 0.32, -0.04);
      bun.castShadow = true;
      hairGroup.add(bun);

      const bunRibbon = new THREE.Mesh(
        new THREE.TorusGeometry(0.11, 0.022, 10, 20),
        new THREE.MeshStandardMaterial({ color: '#FB7185', roughness: 0.4 })
      );
      bunRibbon.position.set(side * 0.24, 0.27, -0.03);
      bunRibbon.rotation.set(0.4, side * 0.5, side * 0.6);
      hairGroup.add(bunRibbon);
    });
  } else if (hsId === 'long_wavy' || hsId === 'wolf_cut') {
    addCuteBangsRow('curtain');
    const waveLocks: [number, number, number][][] = [
      [[-0.28, 0.18, 0.04], [-0.35, -0.06, 0.05], [-0.32, -0.34, 0.07]],
      [[0.28, 0.18, 0.04], [0.35, -0.06, 0.05], [0.32, -0.34, 0.07]],
      [[-0.24, 0.14, -0.18], [-0.28, -0.15, -0.22], [-0.25, -0.42, -0.18]],
      [[0.24, 0.14, -0.18], [0.28, -0.15, -0.22], [0.25, -0.42, -0.18]],
      [[0.0, 0.14, -0.24], [0.0, -0.18, -0.28], [0.0, -0.44, -0.22]],
    ];
    waveLocks.forEach((pts) => hairGroup.add(createHairLock(pts, 0.088, hairMat, 16)));
  } else if (hsId === 'french_bob') {
    addCuteBangsRow('full');
    [-1, 1].forEach((side) => {
      const bobSide = new THREE.Mesh(new THREE.SphereGeometry(0.16, 18, 16), hairMat);
      bobSide.scale.set(0.62, 1.35, 1.15);
      bobSide.position.set(side * 0.29, -0.02, 0.02);
      bobSide.rotation.z = -side * 0.18;
      bobSide.castShadow = true;
      hairGroup.add(bobSide);
    });
  } else if (hsId === 'high_ponytail') {
    addCuteBangsRow('swept');
    const scrunchie = new THREE.Mesh(
      new THREE.TorusGeometry(0.075, 0.024, 10, 20),
      new THREE.MeshStandardMaterial({ color: '#F97316', roughness: 0.4 })
    );
    scrunchie.position.set(0, 0.28, -0.32);
    scrunchie.rotation.x = 0.55;
    hairGroup.add(scrunchie);

    const ponyCurve: [number, number, number][] = [
      [0.0, 0.28, -0.30],
      [0.0, 0.34, -0.45],
      [0.0, 0.10, -0.52],
      [0.0, -0.20, -0.42],
    ];
    hairGroup.add(createHairLock(ponyCurve, 0.12, hairMat, 18));
  } else if (hsId === 'twin_tails' || hsId === 'braided_crown') {
    addCuteBangsRow('full');
    [-1, 1].forEach((side) => {
      const tailCurve: [number, number, number][] = [
        [side * 0.30, 0.16, -0.04],
        [side * 0.38, -0.05, 0.01],
        [side * 0.34, -0.32, 0.05],
      ];
      hairGroup.add(createHairLock(tailCurve, 0.092, hairMat, 16));
    });
  } else if (hsId === 'afro_curls') {
    addCuteBangsRow('full');
    for (let i = 0; i < 24; i++) {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / 24) * 0.55;
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const r = 0.36;
      const px = r * Math.sin(phi) * Math.cos(theta);
      const py = r * Math.cos(phi) + 0.08;
      const pz = r * Math.sin(phi) * Math.sin(theta) - 0.05;
      if (pz > 0.15 && py < 0.23) continue;
      const puff = new THREE.Mesh(new THREE.SphereGeometry(0.115, 12, 12), hairMat);
      puff.position.set(px, py, pz);
      hairGroup.add(puff);
    }
  } else {
    addCuteBangsRow('full');
  }

  // ------------------------------------------
  // F. HEADGEAR & HAIR CLIPS
  // ------------------------------------------
  if (opts.hatStyle === 'sprout_clip') {
    const sproutGroup = new THREE.Group();
    sproutGroup.position.set(0.02, 0.40, 0.04);
    const stemMat = new THREE.MeshStandardMaterial({ color: '#22C55E', roughness: 0.4 });
    const stemCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.01, 0.07, 0.01),
      new THREE.Vector3(0.02, 0.13, 0),
    ]);
    sproutGroup.add(new THREE.Mesh(new THREE.TubeGeometry(stemCurve, 10, 0.010, 8, false), stemMat));

    [-1, 1].forEach((side) => {
      const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.038, 12, 12), stemMat);
      leaf.scale.set(1.3, 0.3, 0.7);
      leaf.position.set(0.02 + side * 0.038, 0.135, 0);
      leaf.rotation.z = -side * 0.35;
      sproutGroup.add(leaf);
    });
    headGroup.add(sproutGroup);
  } else if (opts.hatStyle === 'daisy_clips') {
    const d1 = build3DDaisyFlower(1.2);
    d1.position.set(-0.22, 0.24, 0.22);
    d1.rotation.set(0.8, 0.4, 0.3);
    headGroup.add(d1);

    const d2 = build3DDaisyFlower(0.95);
    d2.position.set(-0.28, 0.15, 0.18);
    d2.rotation.set(0.8, 0.5, 0.2);
    headGroup.add(d2);
  } else if (opts.hatStyle === 'baseball_cap') {
    const capMat = new THREE.MeshStandardMaterial({ color: opts.topColor, roughness: 0.5 });
    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(0.368, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.48),
      capMat
    );
    dome.position.set(0, 0.07, 0);
    headGroup.add(dome);

    const visor = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.025, 24, 1, false, -0.7, 1.4), capMat);
    visor.position.set(0, 0.10, 0.14);
    visor.rotation.x = 0.22;
    headGroup.add(visor);
  } else if (opts.hatStyle === 'grad_cap') {
    const capMat = new THREE.MeshStandardMaterial({ color: '#0F172A', roughness: 0.4 });
    const board = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.03, 0.66), capMat);
    board.position.set(0, 0.41, 0);
    board.rotation.y = Math.PI / 4;
    headGroup.add(board);

    const tassel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.024, 0.24, 10),
      new THREE.MeshStandardMaterial({ color: '#FACC15', metalness: 0.6 })
    );
    tassel.position.set(0.25, 0.29, 0.18);
    headGroup.add(tassel);
  } else if (opts.hatStyle === 'gold_crown') {
    const crownMat = new THREE.MeshStandardMaterial({ color: '#FACC15', metalness: 0.88, roughness: 0.18 });
    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.21, 0.11, 24, 1, true), crownMat);
    band.position.set(0, 0.40, 0);
    headGroup.add(band);
  } else if (opts.hatStyle === 'angel_halo') {
    const halo = new THREE.Mesh(
      new THREE.TorusGeometry(0.23, 0.020, 12, 32),
      new THREE.MeshBasicMaterial({ color: '#FDE047' })
    );
    halo.rotation.x = Math.PI / 2;
    halo.position.set(0, 0.52, 0);
    headGroup.add(halo);
  } else if (opts.hatStyle === 'cat_headphones') {
    const hpMat = new THREE.MeshStandardMaterial({ color: '#1E293B', metalness: 0.5, roughness: 0.3 });
    const neonMat = new THREE.MeshBasicMaterial({ color: '#F472B6' });
    const arch = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.024, 12, 28, Math.PI), hpMat);
    arch.position.set(0, 0.02, 0);
    headGroup.add(arch);

    [-1, 1].forEach((side) => {
      const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.055, 20), hpMat);
      cup.rotation.z = Math.PI / 2;
      cup.position.set(side * 0.37, 0.0, 0);
      headGroup.add(cup);

      const ear = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.10, 4), neonMat);
      ear.position.set(side * 0.23, 0.37, 0);
      ear.rotation.z = -side * 0.45;
      headGroup.add(ear);
    });
  } else if (opts.hatStyle === 'straw_hat') {
    const strawMat = new THREE.MeshStandardMaterial({ color: '#FDE68A', roughness: 0.8 });
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.56, 0.02, 28), strawMat);
    brim.position.set(0, 0.31, 0);
    headGroup.add(brim);
    const dome = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.31, 0.15, 24), strawMat);
    dome.position.set(0, 0.38, 0);
    headGroup.add(dome);
  } else if (opts.hatStyle === 'beret') {
    const beretMat = new THREE.MeshStandardMaterial({ color: '#E11D48', roughness: 0.7 });
    const beret = new THREE.Mesh(new THREE.SphereGeometry(0.35, 20, 16), beretMat);
    beret.scale.set(1.08, 0.42, 1.05);
    beret.position.set(0.05, 0.34, -0.02);
    beret.rotation.z = -0.18;
    headGroup.add(beret);
  } else if (opts.hatStyle === 'bike_helmet') {
    const helmMat = new THREE.MeshPhysicalMaterial({ color: opts.bikeColor, roughness: 0.2, clearcoat: 0.8 });
    const helm = new THREE.Mesh(
      new THREE.SphereGeometry(0.38, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.5),
      helmMat
    );
    helm.scale.set(1.0, 0.95, 1.15);
    helm.position.set(0, 0.07, -0.02);
    headGroup.add(helm);
  }

  // ------------------------------------------
  // G. EYEWEAR, BACKPACK, TIE & WINGS
  // ------------------------------------------
  const accList = opts.accessories;
  if (accList.includes('round_glasses') || accList.includes('aviator_sun')) {
    const isRound = accList.includes('round_glasses');
    const isSun = !isRound && accList.includes('aviator_sun');
    const frameMat = new THREE.MeshStandardMaterial({
      color: isRound ? '#F59E0B' : '#334155',
      metalness: 0.75,
      roughness: 0.25,
    });
    const lensMat = new THREE.MeshBasicMaterial({
      color: isSun ? '#1E293B' : '#FFFFFF',
      transparent: true,
      opacity: isSun ? 0.34 : 0.05,
      depthWrite: false,
    });
    const shineMat = new THREE.MeshBasicMaterial({
      color: '#FFFFFF',
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    });

    [-1, 1].forEach((side) => {
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.080, 0.0065, 12, 32), frameMat);
      rim.position.set(side * 0.116, -0.002, 0.336);
      rim.rotation.y = side * 0.14;
      headGroup.add(rim);

      const lens = new THREE.Mesh(new THREE.CircleGeometry(0.076, 28), lensMat);
      lens.position.set(side * 0.116, -0.002, 0.337);
      lens.rotation.y = side * 0.14;
      headGroup.add(lens);

      // Cute anime glasses lens highlight slash
      const shine = new THREE.Mesh(new THREE.PlaneGeometry(0.014, 0.052), shineMat);
      shine.position.set(side * 0.116 - 0.022, 0.008, 0.339);
      shine.rotation.y = side * 0.14;
      shine.rotation.z = -0.52;
      headGroup.add(shine);
    });

    const bridge = new THREE.Mesh(new THREE.CylinderGeometry(0.0055, 0.0055, 0.074, 8), frameMat);
    bridge.rotation.z = Math.PI / 2;
    bridge.position.set(0, 0.010, 0.342);
    headGroup.add(bridge);
  } else if (accList.includes('cyber_visor')) {
    const visor = new THREE.Mesh(
      new THREE.CylinderGeometry(0.358, 0.358, 0.095, 24, 1, true, -0.95, 1.9),
      new THREE.MeshPhysicalMaterial({
        color: '#22D3EE',
        emissive: '#0891B2',
        emissiveIntensity: 0.45,
        transparent: true,
        opacity: 0.55,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    );
    visor.position.set(0, -0.002, 0.02);
    headGroup.add(visor);
  }

  if (accList.includes('school_backpack')) {
    const bpMat = new THREE.MeshStandardMaterial({ color: '#1E293B', roughness: 0.6 });
    const bag = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.38, 0.16), bpMat);
    bag.position.set(0, 0.34, -0.20);
    bag.castShadow = true;
    torsoGroup.add(bag);
  }

  if (accList.includes('silk_tie')) {
    const tieMat = new THREE.MeshStandardMaterial({ color: '#E11D48', roughness: 0.4 });
    const tie = new THREE.Mesh(new THREE.BoxGeometry(0.044, 0.26, 0.018), tieMat);
    tie.position.set(0, 0.40, 0.158);
    torsoGroup.add(tie);
  }

  if (accList.includes('gold_medal')) {
    const ribbonL = new THREE.Mesh(
      new THREE.BoxGeometry(0.018, 0.14, 0.012),
      new THREE.MeshStandardMaterial({ color: '#2563EB', roughness: 0.5 })
    );
    ribbonL.position.set(-0.028, 0.45, 0.154);
    ribbonL.rotation.z = -0.35;
    torsoGroup.add(ribbonL);

    const ribbonR = new THREE.Mesh(
      new THREE.BoxGeometry(0.018, 0.14, 0.012),
      new THREE.MeshStandardMaterial({ color: '#2563EB', roughness: 0.5 })
    );
    ribbonR.position.set(0.028, 0.45, 0.154);
    ribbonR.rotation.z = 0.35;
    torsoGroup.add(ribbonR);

    const medal = new THREE.Mesh(
      new THREE.CylinderGeometry(0.042, 0.042, 0.014, 24),
      new THREE.MeshStandardMaterial({ color: '#FACC15', metalness: 0.85, roughness: 0.18 })
    );
    medal.rotation.x = Math.PI / 2;
    medal.position.set(0, 0.37, 0.162);
    torsoGroup.add(medal);
  }

  if (accList.includes('angel_wings')) {
    const wingMat = new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.35 });
    [-1, 1].forEach((side) => {
      const wingGroup = new THREE.Group();
      wingGroup.position.set(side * 0.12, 0.42, -0.14);
      wingGroup.rotation.y = -side * 0.35;
      for (let f = 0; f < 4; f++) {
        const feather = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, 0.32 - f * 0.05, 8, 12), wingMat);
        feather.position.set(side * (0.16 + f * 0.06), 0.12 - f * 0.08, 0);
        feather.rotation.z = -side * (0.85 + f * 0.18);
        wingGroup.add(feather);
      }
      torsoGroup.add(wingGroup);
    });
  }

  // ------------------------------------------
  // H. 3D VEHICLES & RIDES
  // ------------------------------------------
  const vehicleGroup = new THREE.Group();
  root.add(vehicleGroup);
  const wheelMeshes: THREE.Object3D[] = [];

  if (opts.rideStyle === 'skateboard') {
    const deck = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.14, 0.56, 10, 18),
      new THREE.MeshStandardMaterial({ color: opts.bikeColor, roughness: 0.4 })
    );
    deck.rotation.x = Math.PI / 2;
    deck.scale.set(1.0, 1.0, 0.18);
    deck.position.set(0, 0.16, 0);
    vehicleGroup.add(deck);

    const wheelMat = new THREE.MeshStandardMaterial({ color: '#F97316', roughness: 0.3 });
    [
      [-0.12, 0.22], [0.12, 0.22],
      [-0.12, -0.22], [0.12, -0.22],
    ].forEach(([wx, wz]) => {
      const w = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.042, 0.04, 16), wheelMat);
      w.rotation.z = Math.PI / 2;
      w.position.set(wx, 0.12, wz);
      vehicleGroup.add(w);
      wheelMeshes.push(w);
    });
    hipsGroup.position.y = 1.12;
  } else if (opts.rideStyle === 'scooter') {
    const frameMat = new THREE.MeshStandardMaterial({ color: '#1E293B', metalness: 0.6, roughness: 0.3 });
    const accentMat = new THREE.MeshStandardMaterial({ color: opts.bikeColor, metalness: 0.4, roughness: 0.3 });

    const deck = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.035, 0.68), frameMat);
    deck.position.set(0, 0.18, 0);
    vehicleGroup.add(deck);

    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.026, 0.92, 14), accentMat);
    stem.position.set(0, 0.62, 0.30);
    stem.rotation.x = -0.12;
    vehicleGroup.add(stem);

    const handleBar = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.46, 12), frameMat);
    handleBar.rotation.z = Math.PI / 2;
    handleBar.position.set(0, 1.06, 0.25);
    vehicleGroup.add(handleBar);

    [-0.32, 0.32].forEach((wz) => {
      const w = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.028, 12, 24), frameMat);
      w.rotation.y = Math.PI / 2;
      w.position.set(0, 0.19, wz);
      vehicleGroup.add(w);
      wheelMeshes.push(w);
    });
    hipsGroup.position.y = 1.14;
  } else if (opts.rideStyle === 'study_desk') {
    const woodMat = new THREE.MeshStandardMaterial({ color: '#B45309', roughness: 0.55 });
    const metalMat = new THREE.MeshStandardMaterial({ color: '#334155', metalness: 0.6 });
    const topBoard = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.045, 0.52), woodMat);
    topBoard.position.set(0, 0.78, 0.42);
    topBoard.castShadow = true;
    vehicleGroup.add(topBoard);

    [
      [-0.40, 0.22], [0.40, 0.22],
      [-0.40, 0.60], [0.40, 0.60],
    ].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.78, 12), metalMat);
      leg.position.set(lx, 0.39, lz);
      vehicleGroup.add(leg);
    });

    const book = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.03, 0.24),
      new THREE.MeshStandardMaterial({ color: '#FFFFFF' })
    );
    book.position.set(0, 0.815, 0.38);
    vehicleGroup.add(book);
  } else if (opts.rideStyle === 'cruiser_bike' || opts.rideStyle === 'gold_bike') {
    const isGold = opts.rideStyle === 'gold_bike';
    const frameMat = new THREE.MeshStandardMaterial({
      color: isGold ? '#FACC15' : opts.bikeColor,
      metalness: isGold ? 0.85 : 0.45,
      roughness: isGold ? 0.20 : 0.32,
    });
    const chromeMat = new THREE.MeshStandardMaterial({ color: '#F8FAFC', metalness: 0.8, roughness: 0.2 });
    const tireMat = new THREE.MeshStandardMaterial({ color: '#1E293B', roughness: 0.75 });

    // Wheels elevated so full circular tires sit cleanly above raised campus sidewalks
    [-0.48, 0.48].forEach((wz) => {
      const wheelGroup = new THREE.Group();
      wheelGroup.position.set(0, 0.39, wz);
      const tire = new THREE.Mesh(new THREE.TorusGeometry(0.21, 0.034, 14, 32), tireMat);
      tire.rotation.y = Math.PI / 2;
      wheelGroup.add(tire);
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.015, 10, 28), chromeMat);
      rim.rotation.y = Math.PI / 2;
      wheelGroup.add(rim);
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.05, 12), frameMat);
      hub.rotation.z = Math.PI / 2;
      wheelGroup.add(hub);
      vehicleGroup.add(wheelGroup);
      wheelMeshes.push(wheelGroup);
    });

    // Step-through cruiser frame that sits cleanly beneath the waist without impaling the legs
    const tubes: [THREE.Vector3, THREE.Vector3][] = [
      [new THREE.Vector3(0, 0.39, -0.48), new THREE.Vector3(0, 0.41, -0.06)],
      [new THREE.Vector3(0, 0.41, -0.06), new THREE.Vector3(0, 0.84, -0.14)],
      [new THREE.Vector3(0, 0.39, -0.48), new THREE.Vector3(0, 0.78, -0.14)],
      [new THREE.Vector3(0, 0.41, -0.06), new THREE.Vector3(0, 0.78, 0.38)],
      [new THREE.Vector3(0, 0.64, -0.10), new THREE.Vector3(0, 0.80, 0.37)],
      [new THREE.Vector3(0, 0.39, 0.48), new THREE.Vector3(0, 1.06, 0.38)],
    ];
    tubes.forEach(([a, b]) => {
      const curve = new THREE.LineCurve3(a, b);
      vehicleGroup.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 6, 0.022, 10, false), frameMat));
    });

    const saddle = new THREE.Mesh(new THREE.SphereGeometry(0.09, 14, 12), tireMat);
    saddle.scale.set(0.95, 0.45, 1.55);
    saddle.position.set(0, 0.87, -0.15);
    vehicleGroup.add(saddle);

    const handleBar = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.50, 12), chromeMat);
    handleBar.rotation.z = Math.PI / 2;
    handleBar.position.set(0, 1.06, 0.38);
    vehicleGroup.add(handleBar);

    [-1, 1].forEach((side) => {
      const grip = new THREE.Mesh(new THREE.CapsuleGeometry(0.022, 0.08, 8, 10), whiteRubberMat);
      grip.rotation.z = Math.PI / 2;
      grip.position.set(side * 0.22, 1.06, 0.38);
      vehicleGroup.add(grip);
    });

    // Natural straddling stance so legs clear the bicycle frame cleanly
    hipsGroup.position.y = 1.06;
    leftLegGroup.position.x = 0.118;
    leftLegGroup.rotation.z = 0.08;
    rightLegGroup.position.x = -0.118;
    rightLegGroup.rotation.z = -0.08;
  }

  const dispose = () => {
    root.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      if (mesh.material) {
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m) => m.dispose());
        } else {
          mesh.material.dispose();
        }
      }
    });
  };

  return {
    root,
    hipsGroup,
    bodyGroup: torsoGroup,
    torsoGroup,
    headGroup,
    leftArmGroup,
    rightArmGroup,
    leftLegGroup,
    rightLegGroup,
    eyelids,
    mouthGroup,
    vehicleGroup,
    wheelMeshes,
    dispose,
  };
}
