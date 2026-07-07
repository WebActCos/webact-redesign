const fs = require("fs");
const vm = require("vm");

const dataPath = "assets/js/portfolio-data-all.js";

const updatedList = `
2go Coconut — Ecommerce
360 Sales Advantage — Professional Services
A Breed Apart Papillons — Pet Services
A CALIFORNIA Driving School — Driving School
A Dog's Day Out — Pet Services
A Pup's Valley — Pet Services
Abdul Electric — Electrical
Absolute Home Care — Home Care
Absolute Pest Control Services — Pest Control
Ace Pet Services — Pet Services
Aces Driving School — Driving School
Advanced Business Systems — IT Services
Aid The Children — Nonprofit
Air Techs HVAC — HVAC
All Concrete Works & Landscaping — Landscaping
All Go Transportation — Transportation
All-Star Pizza — Restaurant
Alta Partners — Investors
American Sewer — Plumbing
Andree Hudson Art — Artist
Apex Denver Locksmith — Locksmith
Ariana Waterfall — Wedding
Aspire Counseling — Counseling
Aspire Hope For Kids — Non Profit
Atlee Care — Healthcare
Axel Medical Transportation — Healthcare
AY Home Health Care — Healthcare
Barbarians Cave Surf — Travel
Barner Moving — Moving
Bayou Solar — Energy
Beltway Home Inspections — Home Services
Benefits Matter — Professional Services
Benton Dental — Dentist
BlackBridge Defense — Security
Board Game Republic — eCommerce
Brick House Salon — Salon & Beauty
Bruno Jambor — Business
Budget Control Services — Professional Services
Building Better Breath — Retail
Building Better Transit — Professional Services
By The Beach — Travel
Callahan Hayes — Professional Services
Cancer With Courage — Non Profit
Carie's Posing Suits — Ecommerce
Carlock Plumbing — Plumbing
Carwash Coupons — Automotive
Cass And Company Salon — Salon & Beauty
Castle Rock Tattoo — Tattoo Shop
Cell Block — Phone Repair
Century Tire Inc. — Automotive
Christy Root Designs — Construction
Chutney Indian Cuisine — Restaurant
Coastal Homes — Interior Design
College Planning Coach — Education
Colorado Creditor Bar Association — Legal
CoWest Durango — Professional Services
CoWest Insurance Group — Professional Services
Cowest Insurance Service — Professional Services
Crest Pest Control — Pest Control
CT Gasket — Automotive
Curved Glass Creations — Glass Repair
D And D Machinery Movers — Moving
Dads of Parker — Non Profit
Deaf Vacation Cruise — Travel
Deannas Papillons — Pet Services
Dental Arts — Dental
Dental Sleep Medicine — Dental
Dental Sleep Medicine & Cranio Facial Pain — Dental
Denver Issa — Non Profit
Denver Sign Factory — Printing & Graphics
Denver Towing — Towing
Denver's Best Heating — HVAC
Desert Empire — Fair
Dig For Energy — Energy
Dominion Craftsman Services — Construction
Driving Instructor Classes — Driving School
DSS By Kat — Pet Services
DWW — Energy
E-Sports Foundation — Nonprofit
Ebony Equines — Pet Services
Ed Prevost — Investigation
Edmotnton Heritage Festival — Fair
Einstein Plumbing — Plumbing
Emergency Locksmith Denver — Locksmith
Empathy Care — Healthcare
Energy Performance Service — Energy
Epic ivy — Business
Epleyer — Technology
Esports Epleyer — Technology
Evans Legal Group — Legal
Express Shipping Room Supply — Ecommerce
Extreme Autoworks — Automotive
Finding The Fantastic — Artist
Fine Arts Movement — Artist
Firm Group — Legal
Fit Republic — Fitness
Fr Bumper Solutions — Automotive
Frameless Shower Door — Glass Repair
Front Range Dentures — Dental
Future Grasp — Business
G & G Driving School — Driving School
Gangle Law Firm — Legal
Genius Coaching — Education
Ghost Town Fitness — Fitness
Glass Act — Glass Repair
Good Water — Water Treatment
Granite State Labradoodles — Pet Services
Great Escape — Counseling
Great West Real Estate — Real Estate
Great West Restoration Colorado — Home Services
Great West Restoration Colorado Agent — Home Services
Grin & Barrett Charity Ride — Non Profit
Has Tag Lab — Ecommerce
Haveli Indian Cuisine — Restaurant
Hebert Investigations — Investigation
Heritage Roofing — Roofing
Hi Dessert Egg — Retail
Home Pro Chesapeake — Home Inspection
Homeland Driving School — Driving School
HouseSketch — Design
Houston Energy Systems — Energy
Humbold Couty Fair — Fair
Hydro Dynamics — Water Treatment
I 5 Driving School — Driving School
IDT — Technology
Implant Excellence — Dental
Inland Valley Driving School — Driving School
Inquiz Inspections — Home Inspection
Insightifi — Technology
Integration Design — Design
Ironside Capital — Investors
Island Cool Creams — Retail
Island Slider Guy — Glass Repair
Jack Lewis — Portfolio
JK Hatcher Homes — Construction
Karma Tour Hawaii — Travel
Kasco HVAC — HVAC
Kenyon Homecare Consulting — Consulting
Kinetico Denver — Water Treatment
Kramarz Law — Legal
Lake Elsinore Driving School — Driving School
Liberty Lake Smile Source — Dental
Light Of Mine — Business
Linda Wang — Business
Little Caesars Pueblo — Restaurant
Lower Lake Ranch — Travel
M Communications — Technology
Manor House Apartments — Real Estate
Marcoa — Professional Services
Master Craft — Roofing
MDT Transit — Transportation
Meadow Hills — Golf
Meditouch — Ecommerce
Mehak Denver — Restaurant
Mehak India's Aroma — Restaurant
Menifee Driving School — Driving School
Midwest Appliance and HVAC — HVAC
Mile High Books — Bookkeeping
Mindful Minds Psychiatry — Healthcare
Mississippi Valley Fair — Fair
Miyazaki Dental — Dental
Molly Mulligan — Professional Services
Mountain Peak Law Group LLC — Legal
Mountain West Law Group — Legal
Mrad — Health Care
Murrieta Driving School — Driving School
Net 2 Phone — Technology
New Era Dental — Dentist
Niagra Designs — Printing & Graphics
Nirvana Indian Cuisine — Restaurant
NOLA Water — Water Treatment
Obairagency — Professional Services
Okunade — Legal
Onestop Home Health Care — Healthcare
Optimal Homecare — Healthcare
Optimal Hospice — Healthcare
Palm Bay Power Equipment — Ecommerce
Pantera Homes — Construction
Parking Payment — Business
ParkingBoxx — Business
Partner Forces — Business
Paw Power Agility Equipment — Pet Services
Peace Of Mind Pest Services — Pest Control
Peakview Dental — Dental
Perthes — Non Profit
Pest Magic — Pest Control
Phase Contracting — Home Services
Photophobic Society of America — Non Profit
Platinum Registration — Consulting
Pompano Glass — Glass Repair
Pork Chop's Truck and Auto — Automotive
Pride & Swagger — Business
Prime Life Benefits — Professional Services
Prosthoodontic Dentures — Dental
Redline Construction — Construction
Roof Ready — Roofing
Roots & Brew — Restaurant
Rostron Dental — Dental
Sage Restaurant — Restaurant
Salinas Valley Fair — Fair
Signal Driving & Traffic Schools — Driving School
Simply Cupcakes Pasadena — Restaurant
Six Corners — Health Care
Skin Care Essentials — Professional Services
Smart Cell Phone Parts — Technology
Smart Wireless Parts — Technology
Sniper Security — Security
Southhall Investments — Investors
Speak Clear Communications — Professional Services
Spector Law — Legal
Spring Fresh — Business
Stanleyview Home Care — Healthcare
Stephanie Ascari — Photography
Style Savy Designs — Design
Sukoon — Restaurant
Summit Graphics — Printing & Graphics
Sunday Driving School — Driving School
Superior Showers — Glass Repair
Sushi & Co — Restaurant
Tadka Indian Cuisine — Restaurant
Tala Wellness — Healthcare
Temecula Driving School — Driving School
The Chambers Of Tucson Mall — Retail
The Executive Center — Real Estate
The Point — Construction
The Smilist — Dentist
Thompson Water Media — Water Treatment
Tipping Hat — Plumbing
Total Wellness Group — Healthcare
Treasure Valley Driving School — Driving School
Trevey — Real Estate
Tropical Remodel Solutions — Construction
Turf Magic — Landscaping
US Green — Energy
Vacation Rentals — Travel
Vi'TalDerm MD — Salon & Beauty
Vip Driving Schools — Driving School
Wake Heating and Air — HVAC
Washington Dental — Dental
Way Cool Gaming — Technology
Winston C Throgmorton — Legal
Your College Planning Coach — Education
Yuma Airshow — Fair
Z-XG — Ecommerce
Zaika Broomfield — Restaurant
Zaika Castle Rock — Restaurant
Zaika Colorado Springs — Restaurant
Zaika Express — Restaurant
Zaika Indian Cuisine — Restaurant
Zaika Littleton — Restaurant
`;

function norm(v){
  return String(v || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const ctx = { window:{}, console };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(dataPath, "utf8"), ctx);

const rows = ctx.window.webactPortfolioRows;
if (!Array.isArray(rows)) throw new Error("Could not load webactPortfolioRows");

const map = new Map();

updatedList.trim().split(/\r?\n/).forEach(line => {
  const parts = line.split("—");
  if (parts.length < 2) return;
  const name = parts[0].trim();
  const industry = parts.slice(1).join("—").trim();
  map.set(norm(name), { name, industry });
});

let updated = 0;
let missing = [];

for (const [key, value] of map.entries()) {
  let row = rows.find(r => norm(r[0]) === key);

  if (!row && key === norm("Parking Payment")) {
    row = rows.find(r => norm(r[0]).startsWith(norm("Parking Payment")));
  }

  if (!row) {
    missing.push(value.name);
    continue;
  }

  row[1] = value.industry;
  updated++;
}

fs.writeFileSync(
  dataPath,
  "window.webactPortfolioRows = " + JSON.stringify(rows, null, 2) + ";\n",
  "utf8"
);

fs.writeFileSync(
  "portfolio-update-report.txt",
  "Updated: " + updated + "\nMissing:\n" + missing.join("\n"),
  "utf8"
);

console.log("Updated:", updated);
console.log("Missing:", missing.length);
