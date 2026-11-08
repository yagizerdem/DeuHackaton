export type LandCoverGroup =
  | "artificial"
  | "agricultural"
  | "forest"
  | "natural_vegetation"
  | "sparse"
  | "wetland"
  | "water";

export const GROUP_LABELS: Record<LandCoverGroup, string> = {
  artificial: "Yapay yüzeyler",
  agricultural: "Tarım alanları",
  forest: "Orman",
  natural_vegetation: "Doğal otsu ve çalılık bitki örtüsü",
  sparse: "Açık ve seyrek bitkili alanlar",
  wetland: "Sulak alanlar",
  water: "Su yüzeyleri",
};

export interface ClcClass {
  label: string;
  group: LandCoverGroup;
  /** counts towards the vegetation cover share */
  vegetated: boolean;
}

const c = (
  label: string,
  group: LandCoverGroup,
  vegetated: boolean,
): ClcClass => ({ label, group, vegetated });

/** CORINE Land Cover nomenclature (level 3), keyed by the `Code_18` attribute. */
export const CLC_CLASSES: Record<string, ClcClass> = {
  "111": c("Sürekli yoğun yerleşim", "artificial", false),
  "112": c("Seyrek yerleşim", "artificial", false),
  "121": c("Sanayi ve ticaret birimleri", "artificial", false),
  "122": c("Karayolu ve demiryolu ağları", "artificial", false),
  "123": c("Liman alanları", "artificial", false),
  "124": c("Havalimanları", "artificial", false),
  "131": c("Maden çıkarma alanları", "artificial", false),
  "132": c("Çöp depolama alanları", "artificial", false),
  "133": c("İnşaat alanları", "artificial", false),
  "141": c("Kentsel yeşil alanlar", "artificial", true),
  "142": c("Spor ve rekreasyon alanları", "artificial", false),
  "211": c("Sulanmayan tarım arazisi", "agricultural", true),
  "212": c("Sulanan tarım arazisi", "agricultural", true),
  "213": c("Çeltik tarlaları", "agricultural", true),
  "221": c("Bağlar", "agricultural", true),
  "222": c("Meyve bahçeleri", "agricultural", true),
  "223": c("Zeytinlikler", "agricultural", true),
  "231": c("Meralar", "agricultural", true),
  "241": c("Kalıcı ürünlerle karışık yıllık ürünler", "agricultural", true),
  "242": c("Karmaşık tarım parselleri", "agricultural", true),
  "243": c("Doğal bitki örtülü tarım ağırlıklı alanlar", "agricultural", true),
  "244": c("Tarım-ormancılık alanları", "agricultural", true),
  "311": c("Geniş yapraklı orman", "forest", true),
  "312": c("İğne yapraklı orman", "forest", true),
  "313": c("Karışık orman", "forest", true),
  "321": c("Doğal çayır ve otlaklar", "natural_vegetation", true),
  "322": c("Fundalık ve bodur bitki örtüsü", "natural_vegetation", true),
  "323": c("Sert yapraklı bitki örtüsü (maki)", "natural_vegetation", true),
  "324": c("Geçiş dönemi orman ve çalılık", "natural_vegetation", true),
  "331": c("Kumsal, kum ve kum tepeleri", "sparse", false),
  "332": c("Çıplak kayalık", "sparse", false),
  "333": c("Seyrek bitkili alanlar", "sparse", false),
  "334": c("Yanmış alanlar", "sparse", false),
  "335": c("Buzul ve kalıcı kar", "sparse", false),
  "411": c("İç bataklıklar", "wetland", true),
  "412": c("Turbalıklar", "wetland", true),
  "421": c("Tuzlu bataklıklar", "wetland", true),
  "422": c("Tuzlalar", "wetland", false),
  "423": c("Gelgit düzlükleri", "wetland", false),
  "511": c("Akarsular", "water", false),
  "512": c("Su kütleleri", "water", false),
  "521": c("Kıyı lagünleri", "water", false),
  "522": c("Haliçler", "water", false),
  "523": c("Deniz ve okyanus", "water", false),
};
