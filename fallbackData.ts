
import { Strain } from "./types";

export interface StrainWithEffects extends Strain {
  associatedEffects: string[];
}

export const FALLBACK_STRAINS: StrainWithEffects[] = [
  {
    name: "Blue Dream",
    brand: "Blossom Classic",
    thc: "18%",
    cbd: "0.1%",
    terpenes: ["Myrcene", "Pinene", "Limonene"],
    description: "A legendary hybrid that balances full-body relaxation with gentle cerebral invigoration.",
    associatedEffects: ["relaxed", "happy", "creative"]
  },
  {
    name: "OG Kush",
    brand: "Heritage Collection",
    thc: "22%",
    cbd: "0.2%",
    terpenes: ["Myrcene", "Limonene", "Caryophyllene"],
    description: "The backbone of West Coast cannabis, offering a heavy-hitting, euphoric stress-crusher experience.",
    associatedEffects: ["relaxed", "happy", "social", "pain-relief"]
  },
  {
    name: "Sour Diesel",
    brand: "Energy Line",
    thc: "20%",
    cbd: "0.1%",
    terpenes: ["Caryophyllene", "Myrcene", "Limonene"],
    description: "Fast-acting and energizing, this strain delivers a dreamy cerebral effect that's perfect for daytime.",
    associatedEffects: ["energetic", "creative", "happy", "focused"]
  },
  {
    name: "Girl Scout Cookies",
    brand: "Premium Tier",
    thc: "24%",
    cbd: "1%",
    terpenes: ["Caryophyllene", "Limonene", "Humulene"],
    description: "Famous for sending users to the moon with high-powered euphoria and full-body relaxation.",
    associatedEffects: ["happy", "relaxed", "pain-relief"]
  },
  {
    name: "Granddaddy Purple",
    brand: "Nightfall",
    thc: "19%",
    cbd: "0.1%",
    terpenes: ["Myrcene", "Caryophyllene", "Pinene"],
    description: "A classic indica known for its deep purple hues and powerful ability to induce a restful slumber.",
    associatedEffects: ["sleepy", "relaxed", "pain-relief"]
  },
  {
    name: "Jack Herer",
    brand: "Artisan Select",
    thc: "17%",
    cbd: "0.1%",
    terpenes: ["Terpinolene", "Caryophyllene", "Pinene"],
    description: "A spicy, pine-scented sativa that promotes bliss, clear-headedness, and creative focus.",
    associatedEffects: ["focused", "creative", "happy", "energetic"]
  },
  {
    name: "Bubba Kush",
    brand: "Roots",
    thc: "16%",
    cbd: "0.1%",
    terpenes: ["Caryophyllene", "Limonene", "Myrcene"],
    description: "An indica strain that has gained notoriety for its heavy tranquilizing effects and sweet hashish flavor.",
    associatedEffects: ["sleepy", "relaxed"]
  },
  {
    name: "Durban Poison",
    brand: "Pure Sativa",
    thc: "20%",
    cbd: "0.1%",
    terpenes: ["Terpinolene", "Myrcene", "Ocimene"],
    description: "The perfect daytime companion, known for its sweet smell and energetic, uplifted mood.",
    associatedEffects: ["energetic", "social", "focused"]
  },
  {
    name: "Gelato",
    brand: "Dessert Series",
    thc: "21%",
    cbd: "0.1%",
    terpenes: ["Caryophyllene", "Limonene", "Humulene"],
    description: "A powerhouse hybrid that provides a heavy physical relaxation with a clear-headed mental state.",
    associatedEffects: ["relaxed", "happy", "creative", "social"]
  },
  {
    name: "Northern Lights",
    brand: "Legacy",
    thc: "18%",
    cbd: "0.5%",
    terpenes: ["Myrcene", "Caryophyllene", "Limonene"],
    description: "One of the most famous strains of all time, pure indica cherished for its resinous buds and fast-acting sedation.",
    associatedEffects: ["sleepy", "relaxed", "pain-relief"]
  },
  {
    name: "Blue Dream",
    brand: "Blossom Classic",
    thc: "18%",
    cbd: "0.1%",
    terpenes: ["Myrcene", "Pinene", "Limonene"],
    description: "A legendary hybrid that balances full-body relaxation with gentle cerebral invigoration.",
    associatedEffects: ["relaxed", "happy", "creative"]
  },
  {
    name: "OG Kush",
    brand: "Heritage Collection",
    thc: "22%",
    cbd: "0.2%",
    terpenes: ["Myrcene", "Limonene", "Caryophyllene"],
    description: "The backbone of West Coast cannabis, offering a heavy-hitting, euphoric stress-crusher experience.",
    associatedEffects: ["relaxed", "happy", "social", "pain-relief"]
  },
  {
    name: "Sour Diesel",
    brand: "Energy Line",
    thc: "20%",
    cbd: "0.1%",
    terpenes: ["Caryophyllene", "Myrcene", "Limonene"],
    description: "Fast-acting and energizing, this strain delivers a dreamy cerebral effect that's perfect for daytime.",
    associatedEffects: ["energetic", "creative", "happy", "focused"]
  },
  {
    name: "Girl Scout Cookies",
    brand: "Premium Tier",
    thc: "24%",
    cbd: "1%",
    terpenes: ["Caryophyllene", "Limonene", "Humulene"],
    description: "Famous for sending users to the moon with high-powered euphoria and full-body relaxation.",
    associatedEffects: ["happy", "relaxed", "pain-relief"]
  },
  {
    name: "Granddaddy Purple",
    brand: "Nightfall",
    thc: "19%",
    cbd: "0.1%",
    terpenes: ["Myrcene", "Caryophyllene", "Pinene"],
    description: "A classic indica known for its deep purple hues and powerful ability to induce a restful slumber.",
    associatedEffects: ["sleepy", "relaxed", "pain-relief"]
  },
  {
    name: "Jack Herer",
    brand: "Artisan Select",
    thc: "17%",
    cbd: "0.1%",
    terpenes: ["Terpinolene", "Caryophyllene", "Pinene"],
    description: "A spicy, pine-scented sativa that promotes bliss, clear-headedness, and creative focus.",
    associatedEffects: ["focused", "creative", "happy", "energetic"]
  },
  {
    name: "Bubba Kush",
    brand: "Roots",
    thc: "16%",
    cbd: "0.1%",
    terpenes: ["Caryophyllene", "Limonene", "Myrcene"],
    description: "An indica strain that has gained notoriety for its heavy tranquilizing effects and sweet hashish flavor.",
    associatedEffects: ["sleepy", "relaxed"]
  },
  {
    name: "Durban Poison",
    brand: "Pure Sativa",
    thc: "20%",
    cbd: "0.1%",
    terpenes: ["Terpinolene", "Myrcene", "Ocimene"],
    description: "The perfect daytime companion, known for its sweet smell and energetic, uplifted mood.",
    associatedEffects: ["energetic", "social", "focused"]
  },
  {
    name: "Gelato",
    brand: "Dessert Series",
    thc: "21%",
    cbd: "0.1%",
    terpenes: ["Caryophyllene", "Limonene", "Humulene"],
    description: "A powerhouse hybrid that provides a heavy physical relaxation with a clear-headed mental state.",
    associatedEffects: ["relaxed", "happy", "creative", "social"]
  },
  {
    name: "Northern Lights",
    brand: "Legacy",
    thc: "18%",
    cbd: "0.5%",
    terpenes: ["Myrcene", "Caryophyllene", "Limonene"],
    description: "One of the most famous strains of all time, pure indica cherished for its resinous buds and fast-acting sedation.",
    associatedEffects: ["sleepy", "relaxed", "pain-relief"]
  },
  {
    name: "Wedding Cake",
    brand: "Dessert Series",
    thc: "25%",
    cbd: "0.1%",
    terpenes: ["Limonene", "Caryophyllene", "Myrcene"],
    description: "A sweet and earthy hybrid that delivers powerful relaxation while keeping the mind clear and happy.",
    associatedEffects: ["relaxed", "happy", "creative"]
  },
  {
    name: "White Widow",
    brand: "Classic Collection",
    thc: "19%",
    cbd: "0.2%",
    terpenes: ["Myrcene", "Pinene", "Caryophyllene"],
    description: "A balanced hybrid famous for its crystal-covered buds and energetic, talkative effects.",
    associatedEffects: ["energetic", "creative", "focused", "social"]
  },
  {
    name: "Pineapple Express",
    brand: "Tropical Line",
    thc: "17%",
    cbd: "0.1%",
    terpenes: ["Terpinolene", "Pinene", "Myrcene"],
    description: "A tropical sativa-dominant hybrid that provides energetic, focused effects perfect for daytime activities.",
    associatedEffects: ["energetic", "focused", "creative", "happy"]
  },
  {
    name: "ACDC",
    brand: "Wellness Line",
    thc: "1%",
    cbd: "20%",
    terpenes: ["Myrcene", "Pinene", "Terpinolene"],
    description: "A high-CBD strain perfect for medical users seeking relief without intense psychoactive effects.",
    associatedEffects: ["focused", "relaxed", "pain-relief"]
  },
  {
    name: "Super Lemon Haze",
    brand: "Citrus Series",
    thc: "22%",
    cbd: "0.1%",
    terpenes: ["Limonene", "Caryophyllene", "Myrcene"],
    description: "A sativa-dominant strain with zesty citrus flavors and uplifting, creative effects.",
    associatedEffects: ["energetic", "creative", "happy", "focused"]
  },
  {
    name: "Purple Punch",
    brand: "Dessert Series",
    thc: "20%",
    cbd: "0.1%",
    terpenes: ["Myrcene", "Caryophyllene", "Limonene"],
    description: "A delicious indica that tastes like grape candy and delivers heavy relaxation and euphoria.",
    associatedEffects: ["relaxed", "happy", "sleepy"]
  },
  {
    name: "Green Crack",
    brand: "Energy Line",
    thc: "21%",
    cbd: "0.1%",
    terpenes: ["Myrcene", "Pinene", "Caryophyllene"],
    description: "An energetic sativa that provides intense focus and productivity with a mango-like flavor.",
    associatedEffects: ["energetic", "focused", "creative", "happy"]
  },
  {
    name: "Chemdawg",
    brand: "Diesel Line",
    thc: "23%",
    cbd: "0.1%",
    terpenes: ["Caryophyllene", "Myrcene", "Pinene"],
    description: "A pungent hybrid known for its diesel aroma and powerful, long-lasting cerebral effects.",
    associatedEffects: ["creative", "happy", "energetic", "focused"]
  },
  {
    name: "Amnesia Haze",
    brand: "Haze Collection",
    thc: "22%",
    cbd: "0.1%",
    terpenes: ["Terpinolene", "Myrcene", "Pinene"],
    description: "A classic sativa with soaring cerebral effects that spark creativity and sociability.",
    associatedEffects: ["energetic", "creative", "happy", "social"]
  },
  {
    name: "Death Star",
    brand: "Galaxy Line",
    thc: "24%",
    cbd: "0.1%",
    terpenes: ["Myrcene", "Caryophyllene", "Limonene"],
    description: "A powerful indica-dominant strain that delivers heavy sedation and full-body relaxation.",
    associatedEffects: ["sleepy", "relaxed", "pain-relief"]
  },
  {
    name: "Strawberry Cough",
    brand: "Fruit Series",
    thc: "18%",
    cbd: "0.2%",
    terpenes: ["Caryophyllene", "Myrcene", "Pinene"],
    description: "A sweet sativa with smooth smoke that lifts mood and promotes social interaction.",
    associatedEffects: ["happy", "social", "creative", "energetic"]
  },
  {
    name: "Bruce Banner",
    brand: "Premium Tier",
    thc: "28%",
    cbd: "0.1%",
    terpenes: ["Myrcene", "Pinene", "Caryophyllene"],
    description: "An extremely potent hybrid that provides powerful euphoria and creative energy.",
    associatedEffects: ["energetic", "happy", "creative", "focused"]
  },
  {
    name: "Charlotte's Web",
    brand: "Wellness Line",
    thc: "0.3%",
    cbd: "17%",
    terpenes: ["Myrcene", "Pinene", "Caryophyllene"],
    description: "A famous high-CBD strain developed for medicinal use with minimal psychoactive effects.",
    associatedEffects: ["focused", "relaxed", "pain-relief"]
  },
  {
    name: "Maui Wowie",
    brand: "Tropical Line",
    thc: "19%",
    cbd: "0.1%",
    terpenes: ["Terpinolene", "Myrcene", "Pinene"],
    description: "A tropical sativa with sweet pineapple flavors and uplifting, energizing effects.",
    associatedEffects: ["happy", "energetic", "creative", "social"]
  },
  {
    name: "Ghost Train Haze",
    brand: "Haze Collection",
    thc: "27%",
    cbd: "0.1%",
    terpenes: ["Terpinolene", "Myrcene", "Pinene"],
    description: "An extremely potent sativa that delivers intense cerebral effects and creative inspiration.",
    associatedEffects: ["energetic", "creative", "focused", "happy"]
  },
  {
    name: "Trainwreck",
    brand: "Railroad Collection",
    thc: "18%",
    cbd: "0.1%",
    terpenes: ["Pinene", "Myrcene", "Caryophyllene"],
    description: "A potent sativa-dominant strain that hits fast and hard, delivering energetic and creative effects.",
    associatedEffects: ["energetic", "creative", "happy", "focused"]
  },
  {
    name: "Skywalker OG",
    brand: "Galaxy Line",
    thc: "23%",
    cbd: "0.2%",
    terpenes: ["Myrcene", "Limonene", "Caryophyllene"],
    description: "A powerful indica that combines force with relaxation, perfect for evening use.",
    associatedEffects: ["sleepy", "relaxed", "happy", "pain-relief"]
  },
  {
    name: "Zkittlez",
    brand: "Candy Series",
    thc: "19%",
    cbd: "0.1%",
    terpenes: ["Caryophyllene", "Humulene", "Limonene"],
    description: "A sweet, fruity strain that delivers relaxing effects without heavy sedation.",
    associatedEffects: ["relaxed", "happy", "creative", "social"]
  },
  {
    name: "Forbidden Fruit",
    brand: "Exotic Collection",
    thc: "17%",
    cbd: "0.1%",
    terpenes: ["Limonene", "Myrcene", "Caryophyllene"],
    description: "A tropical-tasting strain with balanced effects that promote relaxation and happiness.",
    associatedEffects: ["relaxed", "happy", "creative", "social"]
  },
  {
    name: "MAC (Miracle Alien Cookies)",
    brand: "Artisan Select",
    thc: "22%",
    cbd: "0.1%",
    terpenes: ["Limonene", "Caryophyllene", "Myrcene"],
    description: "A balanced hybrid with frosty buds and effects that uplift while relaxing the body.",
    associatedEffects: ["happy", "creative", "relaxed", "focused"]
  },
  {
    name: "Runtz",
    brand: "Candy Series",
    thc: "24%",
    cbd: "0.1%",
    terpenes: ["Limonene", "Caryophyllene", "Myrcene"],
    description: "A candy-flavored strain that balances full-body relaxation with a happy cerebral buzz.",
    associatedEffects: ["happy", "relaxed", "creative", "social"]
  },
  {
    name: "Gorilla Glue #4",
    brand: "Adhesive Line",
    thc: "26%",
    cbd: "0.1%",
    terpenes: ["Caryophyllene", "Myrcene", "Limonene"],
    description: "An extremely potent strain that sticks you to the couch with heavy relaxation and euphoria.",
    associatedEffects: ["relaxed", "happy", "sleepy", "pain-relief"]
  },
  {
    name: "Dosidos",
    brand: "Cookie Collection",
    thc: "25%",
    cbd: "0.2%",
    terpenes: ["Caryophyllene", "Limonene", "Myrcene"],
    description: "A potent indica-leaning strain with relaxing, euphoric effects and a sweet cookie flavor.",
    associatedEffects: ["relaxed", "happy", "sleepy", "pain-relief"]
  },
  {
    name: "Mimosa",
    brand: "Brunch Series",
    thc: "21%",
    cbd: "0.1%",
    terpenes: ["Limonene", "Myrcene", "Caryophyllene"],
    description: "A citrusy sativa-dominant strain perfect for daytime with uplifting, social effects.",
    associatedEffects: ["energetic", "social", "creative", "happy"]
  },
  {
    name: "GMO Cookies",
    brand: "Savory Series",
    thc: "27%",
    cbd: "0.1%",
    terpenes: ["Caryophyllene", "Limonene", "Myrcene"],
    description: "A pungent strain with garlic and mushroom notes that delivers heavy relaxation.",
    associatedEffects: ["relaxed", "sleepy", "pain-relief", "happy"]
  },
  {
    name: "Tropicana Cookies",
    brand: "Tropical Cookies",
    thc: "19%",
    cbd: "0.1%",
    terpenes: ["Limonene", "Caryophyllene", "Myrcene"],
    description: "A sweet, fruity strain with purple hues that promotes relaxation and creativity.",
    associatedEffects: ["relaxed", "creative", "happy", "social"]
  },
  {
    name: "Sherbert",
    brand: "Dessert Series",
    thc: "20%",
    cbd: "0.1%",
    terpenes: ["Limonene", "Caryophyllene", "Humulene"],
    description: "A sweet dessert strain that provides a balanced mix of relaxation and mental stimulation.",
    associatedEffects: ["happy", "relaxed", "creative", "social"]
  },
  {
    name: "Cereal Milk",
    brand: "Breakfast Series",
    thc: "23%",
    cbd: "0.1%",
    terpenes: ["Limonene", "Caryophyllene", "Myrcene"],
    description: "A creamy, sweet strain that delivers a happy, uplifted experience with creative energy.",
    associatedEffects: ["happy", "creative", "energetic", "social"]
  },
  {
    name: "Papaya",
    brand: "Tropical Line",
    thc: "18%",
    cbd: "0.2%",
    terpenes: ["Myrcene", "Pinene", "Caryophyllene"],
    description: "A tropical-tasting strain with relaxing effects that don't lead to sedation.",
    associatedEffects: ["relaxed", "happy", "creative", "social"]
  },
  {
    name: "Tangie",
    brand: "Citrus Series",
    thc: "19%",
    cbd: "0.1%",
    terpenes: ["Limonene", "Myrcene", "Pinene"],
    description: "A tangerine-flavored sativa that provides an energetic, focused, and creative boost.",
    associatedEffects: ["energetic", "focused", "creative", "happy"]
  },
  {
    name: "Clementine",
    brand: "Citrus Series",
    thc: "17%",
    cbd: "0.1%",
    terpenes: ["Limonene", "Pinene", "Myrcene"],
    description: "A bright citrus sativa that delivers clear-headed energy and focus.",
    associatedEffects: ["energetic", "focused", "happy", "creative"]
  },
  {
    name: "Cherry Pie",
    brand: "Dessert Series",
    thc: "20%",
    cbd: "0.1%",
    terpenes: ["Caryophyllene", "Limonene", "Myrcene"],
    description: "A sweet and fruity hybrid that balances relaxation with a happy, uplifted mood.",
    associatedEffects: ["happy", "relaxed", "creative", "social"]
  },
  {
    name: "Lemon Tree",
    brand: "Citrus Series",
    thc: "22%",
    cbd: "0.1%",
    terpenes: ["Limonene", "Pinene", "Caryophyllene"],
    description: "A zesty hybrid with strong lemon flavors that promotes happiness and relaxation.",
    associatedEffects: ["happy", "relaxed", "creative", "social"]
  },
  {
    name: "Ice Cream Cake",
    brand: "Dessert Series",
    thc: "24%",
    cbd: "0.1%",
    terpenes: ["Limonene", "Caryophyllene", "Myrcene"],
    description: "A sweet and creamy indica-dominant strain perfect for evening relaxation.",
    associatedEffects: ["relaxed", "sleepy", "happy", "pain-relief"]
  },
  {
    name: "Blackberry Kush",
    brand: "Berry Line",
    thc: "18%",
    cbd: "0.2%",
    terpenes: ["Myrcene", "Caryophyllene", "Pinene"],
    description: "A berry-flavored indica that delivers deep relaxation and pain relief.",
    associatedEffects: ["relaxed", "sleepy", "pain-relief"]
  },
  {
    name: "Platinum GSC",
    brand: "Premium Tier",
    thc: "26%",
    cbd: "0.1%",
    terpenes: ["Caryophyllene", "Limonene", "Humulene"],
    description: "A platinum phenotype of GSC with frosty buds and powerful euphoric effects.",
    associatedEffects: ["happy", "relaxed", "creative", "pain-relief"]
  },
  {
    name: "Fire OG",
    brand: "Heritage Collection",
    thc: "23%",
    cbd: "0.1%",
    terpenes: ["Limonene", "Caryophyllene", "Myrcene"],
    description: "A fiery OG variant with potent relaxing effects and a spicy, piney flavor.",
    associatedEffects: ["relaxed", "happy", "pain-relief", "sleepy"]
  },
  {
    name: "Golden Goat",
    brand: "Animal Line",
    thc: "20%",
    cbd: "0.1%",
    terpenes: ["Terpinolene", "Myrcene", "Pinene"],
    description: "A sativa-dominant strain with tropical flavors and uplifting, creative effects.",
    associatedEffects: ["energetic", "creative", "happy", "focused"]
  },
  {
    name: "Pink Panties",
    brand: "Exotic Collection",
    thc: "19%",
    cbd: "0.1%",
    terpenes: ["Myrcene", "Limonene", "Caryophyllene"],
    description: "A smooth, sweet strain that provides gentle relaxation and happiness.",
    associatedEffects: ["relaxed", "happy", "social", "creative"]
  },
  {
    name: "Headband",
    brand: "Diesel Line",
    thc: "21%",
    cbd: "0.2%",
    terpenes: ["Limonene", "Caryophyllene", "Myrcene"],
    description: "Named for the pressure felt around the temples, this strain provides focused relaxation.",
    associatedEffects: ["relaxed", "focused", "happy", "creative"]
  },
  {
    name: "Alien OG",
    brand: "Galaxy Line",
    thc: "22%",
    cbd: "0.1%",
    terpenes: ["Myrcene", "Limonene", "Pinene"],
    description: "An indica-dominant strain with out-of-this-world relaxation and euphoria.",
    associatedEffects: ["relaxed", "happy", "sleepy", "pain-relief"]
  },
  {
    name: "Chocolope",
    brand: "Dessert Series",
    thc: "19%",
    cbd: "0.1%",
    terpenes: ["Myrcene", "Pinene", "Caryophyllene"],
    description: "A chocolate-coffee flavored sativa that provides energetic, creative effects.",
    associatedEffects: ["energetic", "creative", "focused", "happy"]
  },
  {
    name: "Afghan Kush",
    brand: "World Collection",
    thc: "18%",
    cbd: "0.3%",
    terpenes: ["Myrcene", "Caryophyllene", "Pinene"],
    description: "A pure indica landrace strain from the Hindu Kush mountains, known for deep relaxation.",
    associatedEffects: ["sleepy", "relaxed", "pain-relief"]
  },
  {
    name: "Mango Kush",
    brand: "Tropical Line",
    thc: "19%",
    cbd: "0.2%",
    terpenes: ["Myrcene", "Pinene", "Limonene"],
    description: "A fruity indica-dominant strain with relaxing effects and a tropical mango flavor.",
    associatedEffects: ["relaxed", "happy", "sleepy", "pain-relief"]
  },
  {
    name: "Cactus",
    brand: "Desert Collection",
    thc: "21%",
    cbd: "0.1%",
    terpenes: ["Limonene", "Caryophyllene", "Myrcene"],
    description: "A rare strain with unique earthy flavors and balanced, uplifting effects.",
    associatedEffects: ["happy", "creative", "energetic", "social"]
  },
  {
    name: "Lava Cake",
    brand: "Dessert Series",
    thc: "25%",
    cbd: "0.1%",
    terpenes: ["Caryophyllene", "Limonene", "Myrcene"],
    description: "A decadent dessert strain that melts away stress with heavy relaxation.",
    associatedEffects: ["relaxed", "happy", "sleepy", "pain-relief"]
  },
  {
    name: "Sunset Sherbet",
    brand: "Dessert Series",
    thc: "20%",
    cbd: "0.1%",
    terpenes: ["Limonene", "Caryophyllene", "Humulene"],
    description: "A colorful, fruity strain that provides a happy, relaxed, and social experience.",
    associatedEffects: ["happy", "relaxed", "social", "creative"]
  },
  {
    name: "Purple Haze",
    brand: "Classic Collection",
    thc: "19%",
    cbd: "0.1%",
    terpenes: ["Caryophyllene", "Myrcene", "Pinene"],
    description: "A legendary sativa made famous by Jimi Hendrix, known for its creative and energetic effects.",
    associatedEffects: ["energetic", "creative", "happy", "social"]
  },
  {
    name: "Candyland",
    brand: "Candy Series",
    thc: "18%",
    cbd: "0.1%",
    terpenes: ["Pinene", "Caryophyllene", "Myrcene"],
    description: "A sweet sativa-dominant strain that provides focused, happy, and energetic effects.",
    associatedEffects: ["focused", "happy", "energetic", "creative"]
  },
  {
    name: "Banana OG",
    brand: "Tropical Line",
    thc: "23%",
    cbd: "0.1%",
    terpenes: ["Limonene", "Caryophyllene", "Myrcene"],
    description: "A banana-flavored indica-dominant strain with heavy relaxing effects.",
    associatedEffects: ["relaxed", "sleepy", "happy", "pain-relief"]
  },
  {
    name: "Peanut Butter Breath",
    brand: "Savory Series",
    thc: "26%",
    cbd: "0.2%",
    terpenes: ["Caryophyllene", "Limonene", "Myrcene"],
    description: "A savory, nutty strain with potent relaxing and pain-relieving effects.",
    associatedEffects: ["relaxed", "sleepy", "pain-relief", "happy"]
  },
  {
    name: "Gary Payton",
    brand: "Athlete Series",
    thc: "27%",
    cbd: "0.1%",
    terpenes: ["Limonene", "Caryophyllene", "Myrcene"],
    description: "A potent hybrid with balanced effects that promote relaxation and social engagement.",
    associatedEffects: ["happy", "relaxed", "social", "creative"]
  },
  {
    name: "Apple Fritter",
    brand: "Dessert Series",
    thc: "24%",
    cbd: "0.1%",
    terpenes: ["Limonene", "Caryophyllene", "Myrcene"],
    description: "A sweet pastry-flavored strain that delivers happy, relaxed effects.",
    associatedEffects: ["happy", "relaxed", "creative", "social"]
  },
  {
    name: "White Runtz",
    brand: "Candy Series",
    thc: "25%",
    cbd: "0.1%",
    terpenes: ["Limonene", "Caryophyllene", "Myrcene"],
    description: "A frosty white phenotype of Runtz with balanced happy and relaxed effects.",
    associatedEffects: ["happy", "relaxed", "creative", "social"]
  },
  {
    name: "Grape Ape",
    brand: "Berry Line",
    thc: "19%",
    cbd: "0.2%",
    terpenes: ["Myrcene", "Caryophyllene", "Pinene"],
    description: "A grape-flavored indica known for its deep purple color and relaxing effects.",
    associatedEffects: ["relaxed", "sleepy", "happy", "pain-relief"]
  },
  {
    name: "Lemonade",
    brand: "Citrus Series",
    thc: "20%",
    cbd: "0.1%",
    terpenes: ["Limonene", "Pinene", "Myrcene"],
    description: "A refreshing sativa-dominant strain that uplifts and energizes.",
    associatedEffects: ["energetic", "happy", "creative", "focused"]
  },
  {
    name: "Mochi",
    brand: "Dessert Series",
    thc: "23%",
    cbd: "0.1%",
    terpenes: ["Limonene", "Caryophyllene", "Myrcene"],
    description: "A sweet dessert strain with balanced effects that relax the body while keeping the mind engaged.",
    associatedEffects: ["relaxed", "happy", "creative", "social"]
  },
  {
    name: "Project 4516",
    brand: "Laboratory Series",
    thc: "28%",
    cbd: "0.1%",
    terpenes: ["Caryophyllene", "Limonene", "Myrcene"],
    description: "A laboratory-bred strain with extremely high THC and powerful relaxing effects.",
    associatedEffects: ["relaxed", "sleepy", "pain-relief", "happy"]
  },
  {
    name: "Kush Mints",
    brand: "Dessert Series",
    thc: "26%",
    cbd: "0.1%",
    terpenes: ["Caryophyllene", "Limonene", "Myrcene"],
    description: "A minty, cooling strain with potent relaxing and euphoric effects.",
    associatedEffects: ["relaxed", "happy", "pain-relief", "sleepy"]
  },
  {
    name: "Orange Cookies",
    brand: "Citrus Cookies",
    thc: "21%",
    cbd: "0.1%",
    terpenes: ["Limonene", "Caryophyllene", "Myrcene"],
    description: "A citrusy cookie strain that provides a happy, focused, and creative experience.",
    associatedEffects: ["happy", "focused", "creative", "energetic"]
  },
  {
    name: "Slurricane",
    brand: "Dessert Series",
    thc: "24%",
    cbd: "0.1%",
    terpenes: ["Caryophyllene", "Limonene", "Myrcene"],
    description: "A powerful indica-dominant strain that washes over you with heavy relaxation.",
    associatedEffects: ["relaxed", "sleepy", "pain-relief", "happy"]
  },
  {
    name: "Purple Urkle",
    brand: "Classic Collection",
    thc: "18%",
    cbd: "0.3%",
    terpenes: ["Myrcene", "Caryophyllene", "Pinene"],
    description: "A classic purple indica known for its sedating effects and grape-like flavor.",
    associatedEffects: ["sleepy", "relaxed", "pain-relief"]
  },
  {
    name: "Snowcap",
    brand: "Mountain Collection",
    thc: "22%",
    cbd: "0.1%",
    terpenes: ["Pinene", "Myrcene", "Caryophyllene"],
    description: "A sativa-dominant strain with frosty buds that provide energetic, creative effects.",
    associatedEffects: ["energetic", "creative", "happy", "focused"]
  },
  {
    name: "Blueberry",
    brand: "Berry Line",
    thc: "17%",
    cbd: "0.2%",
    terpenes: ["Myrcene", "Caryophyllene", "Pinene"],
    description: "A classic berry-flavored indica that delivers gentle relaxation and happiness.",
    associatedEffects: ["relaxed", "happy", "sleepy", "pain-relief"]
  },
  {
    name: "Hawaiian",
    brand: "Tropical Line",
    thc: "18%",
    cbd: "0.1%",
    terpenes: ["Terpinolene", "Myrcene", "Pinene"],
    description: "A tropical sativa that provides an energetic, happy, and social experience.",
    associatedEffects: ["energetic", "happy", "social", "creative"]
  },
  {
    name: "Do-Si-Dos",
    brand: "Cookie Collection",
    thc: "25%",
    cbd: "0.1%",
    terpenes: ["Caryophyllene", "Limonene", "Myrcene"],
    description: "A potent indica-leaning hybrid with relaxing, happy effects and a sweet flavor.",
    associatedEffects: ["relaxed", "happy", "sleepy", "pain-relief"]
  },
  {
    name: "King Louis XIII",
    brand: "Royal Collection",
    thc: "26%",
    cbd: "0.1%",
    terpenes: ["Myrcene", "Limonene", "Caryophyllene"],
    description: "A regal indica with powerful sedating effects and a complex flavor profile.",
    associatedEffects: ["sleepy", "relaxed", "pain-relief", "happy"]
  },
  {
    name: "Lemon Skunk",
    brand: "Citrus Series",
    thc: "20%",
    cbd: "0.1%",
    terpenes: ["Limonene", "Pinene", "Myrcene"],
    description: "A skunky citrus sativa that provides energetic, focused, and creative effects.",
    associatedEffects: ["energetic", "focused", "creative", "happy"]
  },
  {
    name: "Tahoe OG",
    brand: "Heritage Collection",
    thc: "24%",
    cbd: "0.1%",
    terpenes: ["Limonene", "Caryophyllene", "Myrcene"],
    description: "A potent OG variant from Lake Tahoe with heavy relaxing and euphoric effects.",
    associatedEffects: ["relaxed", "happy", "sleepy", "pain-relief"]
  }
];

