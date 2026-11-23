import type { Claim, ClaimWorkflow, Customer, InsuranceProduct, Policy } from '@insuros/domain';

/*
  Sample book: three worked examples for every kind of cover InsurOS lists
  (POLICY_LINES in country-economics.ts). Each example is a policy that was
  sold, a claim that was reported on it, and every step that claim went
  through until it was paid and its certificate of settlement was approved.

  Sample data only. It is seeded into the demo tenant (datasets.ts "sample"),
  never into a production tenant. The settlement record is what a finance team
  would have recorded; InsurOS keeps the record and never sends money.
*/

export const SAMPLE_CURRENCY = 'KES';

/** One step of a sample claim, oldest first. */
export interface SampleClaimStep {
  /** ISO date-time. */
  at: string;
  stage: 'Reported' | 'Documents' | 'Assessment' | 'Approval' | 'Discharge' | 'Payment' | 'Certificate';
  label: string;
  by: string;
}

export interface SampleSettlement {
  /** Amounts in whole Kenya shillings. */
  reserve: number;
  claimed: number;
  excess: number;
  /** Part of the claim outside the cover (0 when none). */
  notCovered: number;
  notCoveredReason?: string;
  approved: number;
  paidTo: string;
  method: string;
  paidOn: string;
  paymentReference: string;
  dischargeSignedOn: string;
  certificateNumber: string;
  certificateApprovedBy: string;
  certificateApprovedOn: string;
}

export interface SampleClaimStory {
  claimId: string;
  policyId: string;
  lineId: string;
  incidentDate: string;
  reportedVia: string;
  description: string;
  documents: { name: string; kind: string; receivedOn: string }[];
  checks: { label: string; pass: boolean }[];
  fraudScore: number;
  assessorNote: string;
  steps: SampleClaimStep[];
  settlement: SampleSettlement;
}

/** People who handle the sample claims (fictional). */
const STAFF = {
  officer: 'Grace Wanjiru, Claims Officer',
  adjuster: 'Peter Otieno, Loss Adjuster',
  manager: 'Mary Achieng, Claims Manager',
  finance: 'James Kariuki, Finance Officer'
};

interface Example {
  customer: string;
  type: 'Individual' | 'Business';
  item: string;
  sumInsured: number;
  premium: number;
  incident: string;
  claimed: number;
  excess: number;
  notCovered?: [number, string];
  paidTo?: string;
  registration?: string;
  year?: number;
}

interface LineSpec {
  lineId: string;
  product: string;
  code: string;
  category: string;
  documents: string[];
  method: string;
  examples: [Example, Example, Example];
}

const LINES: LineSpec[] = [
  {
    lineId: 'motor-private', product: 'Private Car Comprehensive', code: 'MOT-PVT', category: 'Motor',
    documents: ['Claim form', 'Police abstract', 'Repair estimate', 'Photos of the damage', 'Copy of the logbook'],
    method: 'Bank transfer to the garage',
    examples: [
      { customer: 'Amina Hassan', type: 'Individual', item: 'Toyota Axio', registration: 'KDA 214M', year: 2017, sumInsured: 1_450_000, premium: 58_000, incident: 'Rear-ended at a traffic light on Waiyaki Way. Rear bumper, boot lid and tail lamps damaged; no injuries.', claimed: 186_000, excess: 15_000, paidTo: 'Westlands Auto Body Ltd' },
      { customer: 'Brian Kiprono', type: 'Individual', item: 'Mazda Demio', registration: 'KCZ 908Q', year: 2015, sumInsured: 820_000, premium: 36_900, incident: 'Side mirror and driver door damaged by a hit-and-run in a mall car park in Eldoret.', claimed: 64_500, excess: 15_000, paidTo: 'Eldoret Panel Beaters' },
      { customer: 'Faith Njeri', type: 'Individual', item: 'Subaru Forester', registration: 'KDE 551T', year: 2019, sumInsured: 2_300_000, premium: 92_000, incident: 'Windscreen shattered by a stone thrown up by a lorry on the Thika Superhighway.', claimed: 48_000, excess: 0, paidTo: 'Glass Masters Kenya' }
    ]
  },
  {
    lineId: 'motor-commercial', product: 'Commercial Vehicle Comprehensive', code: 'MOT-COM', category: 'Motor',
    documents: ['Claim form', 'Police abstract', "Driver's licence", 'Repair estimate', 'Photos of the damage'],
    method: 'Bank transfer to the garage',
    examples: [
      { customer: 'Rongai Shuttle Sacco', type: 'Business', item: '14-seater matatu', registration: 'KCX 302B', year: 2018, sumInsured: 3_200_000, premium: 160_000, incident: 'Matatu skidded into a ditch on Magadi Road in the rain. Front axle and bodywork damaged; passengers unhurt.', claimed: 412_000, excess: 40_000, paidTo: 'Kitengela Motors' },
      { customer: 'Samuel Ouma', type: 'Individual', item: 'Boda boda (Bajaj Boxer)', registration: 'KMEZ 118K', year: 2022, sumInsured: 135_000, premium: 9_450, incident: 'Motorcycle knocked over by a reversing pickup in Kisumu town. Fork and fuel tank damaged.', claimed: 38_000, excess: 5_000, paidTo: 'Kisumu Moto Spares' },
      { customer: 'Mwangi Haulage Ltd', type: 'Business', item: 'Isuzu FRR lorry', registration: 'KDB 774H', year: 2016, sumInsured: 4_800_000, premium: 216_000, incident: 'Lorry hit a road barrier at Gilgil weighbridge. Cab and front grille damaged.', claimed: 265_000, excess: 50_000, paidTo: 'Nakuru Truck Centre' }
    ]
  },
  {
    lineId: 'medical', product: 'Family Medical Cover', code: 'MED-FAM', category: 'Medical',
    documents: ['Claim form', 'Discharge summary', 'Itemised hospital bill', 'Receipts'],
    method: 'Bank transfer to the hospital',
    examples: [
      { customer: 'Wanjiku Kamau', type: 'Individual', item: 'Family of four, inpatient KES 1M', sumInsured: 1_000_000, premium: 64_000, incident: 'Daughter admitted for 3 days with severe malaria at Aga Khan Hospital, Nairobi.', claimed: 142_300, excess: 0, paidTo: 'Aga Khan University Hospital' },
      { customer: 'Otieno Family', type: 'Individual', item: 'Couple, inpatient KES 500,000', sumInsured: 500_000, premium: 38_500, incident: 'Planned knee arthroscopy at Kisumu Specialists Hospital.', claimed: 210_000, excess: 0, notCovered: [12_000, 'Physiotherapy beyond the 5 sessions the policy allows'], paidTo: 'Kisumu Specialists Hospital' },
      { customer: 'Halima Abdi', type: 'Individual', item: 'Single, inpatient KES 300,000 with maternity', sumInsured: 300_000, premium: 41_000, incident: 'Normal delivery at Coast General Hospital, Mombasa, after the 10-month waiting period.', claimed: 68_000, excess: 0, paidTo: 'Coast General Teaching and Referral Hospital' }
    ]
  },
  {
    lineId: 'home', product: 'Home and Contents Cover', code: 'HOME', category: 'Property',
    documents: ['Claim form', 'Photos of the damage', 'Repair quotation', 'Proof of ownership of items'],
    method: 'Bank transfer to the policyholder',
    examples: [
      { customer: 'Kevin Mutua', type: 'Individual', item: 'Bungalow in Ruiru', sumInsured: 6_500_000, premium: 19_500, incident: 'Roof sheets blown off and ceiling soaked in a storm.', claimed: 230_000, excess: 10_000 },
      { customer: 'Esther Chebet', type: 'Individual', item: 'Apartment contents, Kilimani', sumInsured: 1_200_000, premium: 9_600, incident: 'Burst water pipe flooded the living room; sofa set and rug ruined.', claimed: 96_000, excess: 5_000 },
      { customer: 'Joseph Nyaga', type: 'Individual', item: 'Maisonette in Syokimau', sumInsured: 9_000_000, premium: 27_000, incident: 'Kitchen fire from a gas cylinder leak; cabinets and wall damaged.', claimed: 315_000, excess: 10_000 }
    ]
  },
  {
    lineId: 'business-property', product: 'Business Fire and Perils', code: 'FIRE', category: 'Property',
    documents: ['Claim form', 'Fire brigade report', 'Stock records', "Assessor's report"],
    method: 'Bank transfer to the business',
    examples: [
      { customer: 'Gikomba Textiles Ltd', type: 'Business', item: 'Shop and stock, Gikomba', sumInsured: 8_000_000, premium: 96_000, incident: 'Electrical fire overnight destroyed part of the stock of fabrics.', claimed: 1_240_000, excess: 50_000 },
      { customer: 'Nyeri Grain Millers', type: 'Business', item: 'Mill building and machinery', sumInsured: 25_000_000, premium: 250_000, incident: 'Lightning struck the main panel and burnt the motor control unit.', claimed: 680_000, excess: 50_000 },
      { customer: 'Bahari Hardware', type: 'Business', item: 'Warehouse, Changamwe', sumInsured: 12_000_000, premium: 132_000, incident: 'Flash flood entered the warehouse; cement and paint stock damaged.', claimed: 455_000, excess: 50_000, notCovered: [35_000, 'Stock kept on the floor against the policy condition'] }
    ]
  },
  {
    lineId: 'theft', product: 'Burglary and Theft Cover', code: 'THEFT', category: 'Property',
    documents: ['Claim form', 'Police abstract', 'Receipts for stolen items', 'Photos of forced entry'],
    method: 'Bank transfer to the policyholder',
    examples: [
      { customer: 'Mama Mboga Supermarket', type: 'Business', item: 'Shop stock and cash in safe', sumInsured: 2_000_000, premium: 30_000, incident: 'Break-in through the back door; electronics stock taken.', claimed: 184_000, excess: 10_000 },
      { customer: 'Daniel Rotich', type: 'Individual', item: 'Home electronics, Kitengela', sumInsured: 600_000, premium: 7_200, incident: 'Television and laptop stolen after the window grill was cut.', claimed: 112_000, excess: 5_000 },
      { customer: 'Lake View Pharmacy', type: 'Business', item: 'Pharmacy stock, Naivasha', sumInsured: 3_500_000, premium: 49_000, incident: 'Night burglary; medicines and a till taken.', claimed: 268_000, excess: 10_000 }
    ]
  },
  {
    lineId: 'work-injury', product: 'Work Injury Benefits (WIBA)', code: 'WIBA', category: 'Liability',
    documents: ['Claim form', 'DOSH Form 1 (accident report)', 'Medical report', 'Payroll extract'],
    method: 'Bank transfer to the injured employee',
    examples: [
      { customer: 'Tatu City Builders', type: 'Business', item: '45 site workers', sumInsured: 15_000_000, premium: 180_000, incident: 'A mason fell from scaffolding and broke his wrist.', claimed: 146_000, excess: 0, paidTo: 'Injured employee (mason)' },
      { customer: 'Kericho Tea Estates', type: 'Business', item: '120 estate workers', sumInsured: 40_000_000, premium: 420_000, incident: 'A plucker cut her hand on a pruning machine.', claimed: 58_000, excess: 0, paidTo: 'Injured employee (tea plucker)' },
      { customer: 'Swift Couriers Ltd', type: 'Business', item: '30 riders and office staff', sumInsured: 9_000_000, premium: 108_000, incident: 'A delivery rider injured his leg in a road accident while on duty.', claimed: 212_000, excess: 0, paidTo: 'Injured employee (rider)' }
    ]
  },
  {
    lineId: 'personal-accident', product: 'Personal Accident Cover', code: 'PA', category: 'Accident',
    documents: ['Claim form', 'Medical report', 'Hospital receipts', 'Police abstract'],
    method: 'M-Pesa to the policyholder',
    examples: [
      { customer: 'Lucy Wairimu', type: 'Individual', item: 'Personal accident, KES 1M', sumInsured: 1_000_000, premium: 4_500, incident: 'Slipped on a wet staircase and fractured an ankle; 4 weeks off work.', claimed: 85_000, excess: 0 },
      { customer: 'Hassan Omar', type: 'Individual', item: 'Personal accident, KES 2M', sumInsured: 2_000_000, premium: 8_000, incident: 'Injured in a bus accident on the Mombasa road; 2 nights in hospital.', claimed: 120_000, excess: 0 },
      { customer: 'Peter Gitau', type: 'Individual', item: 'Personal accident, KES 500,000', sumInsured: 500_000, premium: 2_500, incident: 'Deep cut to the hand while repairing a fence; stitches and dressing.', claimed: 18_500, excess: 0 }
    ]
  },
  {
    lineId: 'liability', product: 'Public Liability Cover', code: 'PL', category: 'Liability',
    documents: ['Claim form', "Third party's demand letter", 'Incident report', 'Medical bills of the third party'],
    method: 'Bank transfer to the third party',
    examples: [
      { customer: 'Sarit Food Court', type: 'Business', item: 'Restaurant premises', sumInsured: 5_000_000, premium: 25_000, incident: 'A customer slipped on a freshly mopped floor and broke a wrist.', claimed: 175_000, excess: 10_000, paidTo: 'Injured customer' },
      { customer: 'Prime Event Tents', type: 'Business', item: 'Event equipment hire', sumInsured: 3_000_000, premium: 18_000, incident: 'A tent pole fell in the wind and dented a guest’s car at a wedding.', claimed: 92_000, excess: 10_000, paidTo: 'Owner of the damaged car' },
      { customer: 'Dr. Ann Mwende (dental clinic)', type: 'Business', item: 'Professional indemnity, dental', sumInsured: 10_000_000, premium: 60_000, incident: 'Patient claimed for a corrective procedure after a failed crown.', claimed: 140_000, excess: 20_000, paidTo: 'Patient' }
    ]
  },
  {
    lineId: 'engineering', product: 'Contractors All Risks', code: 'CAR', category: 'Engineering',
    documents: ['Claim form', 'Site report', "Engineer's estimate", 'Photos'],
    method: 'Bank transfer to the contractor',
    examples: [
      { customer: 'Konza Civil Works', type: 'Business', item: 'Office block under construction, Konza', sumInsured: 120_000_000, premium: 480_000, incident: 'Heavy rain caused a trench collapse; formwork and pipes damaged.', claimed: 1_650_000, excess: 100_000 },
      { customer: 'Thika Road Paving Ltd', type: 'Business', item: 'Asphalt plant and roller', sumInsured: 35_000_000, premium: 210_000, incident: 'Roller hydraulic pump failed and damaged the drive motor.', claimed: 720_000, excess: 75_000 },
      { customer: 'Lamu Water Project JV', type: 'Business', item: 'Water pipeline works', sumInsured: 80_000_000, premium: 360_000, incident: 'Pipes stored on site were crushed by a falling crane load.', claimed: 940_000, excess: 100_000 }
    ]
  },
  {
    lineId: 'marine-cargo', product: 'Goods in Transit', code: 'GIT', category: 'Marine',
    documents: ['Claim form', 'Delivery note', 'Invoice', 'Survey report', 'Police abstract (for theft)'],
    method: 'Bank transfer to the owner of the goods',
    examples: [
      { customer: 'Kenya Fresh Exports', type: 'Business', item: 'Avocado consignment, Murang’a to Mombasa', sumInsured: 4_200_000, premium: 21_000, incident: 'Refrigeration failed on the truck; part of the load spoiled.', claimed: 610_000, excess: 25_000 },
      { customer: 'Mombasa Electronics Importers', type: 'Business', item: 'Container of televisions', sumInsured: 9_500_000, premium: 38_000, incident: 'Container dropped at the port; 24 sets broken.', claimed: 480_000, excess: 25_000 },
      { customer: 'Busia Cross-Border Traders', type: 'Business', item: 'Cooking oil cartons to Busia', sumInsured: 1_800_000, premium: 9_000, incident: 'Truck overturned near Bungoma; cartons burst.', claimed: 210_000, excess: 15_000 }
    ]
  },
  {
    lineId: 'marine-hull', product: 'Boat and Vessel Cover', code: 'HULL', category: 'Marine',
    documents: ['Claim form', 'Marine survey report', 'Repair quotation', 'Certificate of seaworthiness'],
    method: 'Bank transfer to the boatyard',
    examples: [
      { customer: 'Lamu Dhow Tours', type: 'Business', item: 'Tourist dhow "Safari Njema"', sumInsured: 3_500_000, premium: 87_500, incident: 'Dhow struck a submerged rock; hull planks cracked.', claimed: 340_000, excess: 35_000, paidTo: 'Shela Boatyard' },
      { customer: 'Kisumu Fishing Co-op', type: 'Business', item: 'Motorised fishing boat', sumInsured: 900_000, premium: 27_000, incident: 'Outboard engine damaged in a storm on Lake Victoria.', claimed: 160_000, excess: 15_000, paidTo: 'Dunga Marine Engineers' },
      { customer: 'Watamu Diving Centre', type: 'Business', item: 'Dive boat "Blue Reef"', sumInsured: 5_200_000, premium: 130_000, incident: 'Mooring line snapped; boat grounded and propeller bent.', claimed: 290_000, excess: 35_000, paidTo: 'Malindi Marine Services' }
    ]
  },
  {
    lineId: 'aviation', product: 'Aircraft Hull and Liability', code: 'AVN', category: 'Aviation',
    documents: ['Claim form', 'KCAA occurrence report', 'Engineering report', 'Repair invoice'],
    method: 'Bank transfer to the maintenance organisation',
    examples: [
      { customer: 'Mara Skies Charters', type: 'Business', item: 'Cessna 208 Caravan 5Y-MSC', sumInsured: 180_000_000, premium: 3_600_000, incident: 'Bird strike on landing at Keekorok; propeller and cowling damaged.', claimed: 2_850_000, excess: 500_000, paidTo: 'Wilson Aero Maintenance' },
      { customer: 'Rift Valley Flying School', type: 'Business', item: 'Cessna 172 5Y-RVF', sumInsured: 28_000_000, premium: 700_000, incident: 'Hard landing during training; nose gear damaged.', claimed: 1_100_000, excess: 250_000, paidTo: 'Nakuru Aero Services' },
      { customer: 'AgriSpray Aviation', type: 'Business', item: 'Air Tractor crop sprayer 5Y-AGS', sumInsured: 95_000_000, premium: 2_850_000, incident: 'Wing tip struck a fence post while taxiing.', claimed: 760_000, excess: 250_000, paidTo: 'Wilson Aero Maintenance' }
    ]
  },
  {
    lineId: 'travel', product: 'Travel Insurance', code: 'TRV', category: 'Travel',
    documents: ['Claim form', 'Air ticket and boarding pass', 'Medical report or airline letter', 'Receipts'],
    method: 'Bank transfer to the policyholder',
    examples: [
      { customer: 'Nancy Akinyi', type: 'Individual', item: 'Single trip to Dubai, 10 days', sumInsured: 5_000_000, premium: 6_800, incident: 'Admitted overnight in Dubai with food poisoning.', claimed: 96_000, excess: 5_000 },
      { customer: 'Michael Kariuki', type: 'Individual', item: 'Single trip to London, 21 days', sumInsured: 10_000_000, premium: 14_500, incident: 'Checked-in bag lost by the airline and never found.', claimed: 65_000, excess: 5_000, notCovered: [10_000, 'Jewellery above the KES 20,000 single-item limit'] },
      { customer: 'Zawadi Tours Group', type: 'Business', item: 'Group trip to Zanzibar, 12 travellers', sumInsured: 12_000_000, premium: 31_200, incident: 'Return flight cancelled; extra hotel night for the group.', claimed: 84_000, excess: 0 }
    ]
  },
  {
    lineId: 'crop-livestock', product: 'Crop and Livestock Cover', code: 'AGRI', category: 'Agriculture',
    documents: ['Claim form', 'Vet or agronomist report', 'Photos', 'Ear-tag or farm records'],
    method: 'M-Pesa to the farmer',
    examples: [
      { customer: 'Mary Wambui', type: 'Individual', item: '3 dairy cows, Nyandarua', sumInsured: 360_000, premium: 14_400, incident: 'One cow died of East Coast Fever despite treatment.', claimed: 120_000, excess: 0 },
      { customer: 'Kipkemoi Arap Tanui', type: 'Individual', item: '5 acres of maize, Uasin Gishu', sumInsured: 250_000, premium: 12_500, incident: 'Hailstorm flattened about 40% of the crop at tasselling.', claimed: 100_000, excess: 10_000 },
      { customer: 'Machakos Poultry Group', type: 'Business', item: '2,000 layers', sumInsured: 1_400_000, premium: 56_000, incident: 'Newcastle disease outbreak; 350 birds died.', claimed: 245_000, excess: 15_000 }
    ]
  },
  {
    lineId: 'bonds', product: 'Performance Bond', code: 'BOND', category: 'Bonds',
    documents: ['Bond document', "Beneficiary's demand", 'Contract and termination letter', "Engineer's certificate"],
    method: 'Bank transfer to the beneficiary',
    examples: [
      { customer: 'Mlimani Contractors', type: 'Business', item: 'Performance bond, county road works', sumInsured: 4_000_000, premium: 60_000, incident: 'County called the bond after the contractor abandoned the site.', claimed: 4_000_000, excess: 0, paidTo: 'Kiambu County Government' },
      { customer: 'Coastline Suppliers', type: 'Business', item: 'Bid bond, hospital tender', sumInsured: 500_000, premium: 7_500, incident: 'Bidder withdrew after the award; the hospital called the bid bond.', claimed: 500_000, excess: 0, paidTo: 'Mombasa County Referral Hospital' },
      { customer: 'Rift Solar Installers', type: 'Business', item: 'Advance payment bond, school solar', sumInsured: 1_200_000, premium: 18_000, incident: 'Supplier failed to deliver; the school called the advance payment bond.', claimed: 1_200_000, excess: 0, notCovered: [300_000, 'Part of the advance already recovered through delivered panels'], paidTo: 'Board of Management, Moi Girls Eldoret' }
    ]
  },
  {
    lineId: 'term-life', product: 'Term Life Cover', code: 'LIFE-TERM', category: 'Life',
    documents: ['Claim form', 'Death certificate', 'Burial permit', 'ID of the beneficiary'],
    method: 'Bank transfer to the beneficiary',
    examples: [
      { customer: 'Estate of John Kamau', type: 'Individual', item: '10-year term life, KES 3M', sumInsured: 3_000_000, premium: 24_000, incident: 'Life assured died of a heart attack in year 4 of the cover.', claimed: 3_000_000, excess: 0, paidTo: 'Jane Kamau (spouse, beneficiary)' },
      { customer: 'Estate of Fatuma Ali', type: 'Individual', item: '15-year term life, KES 2M', sumInsured: 2_000_000, premium: 18_000, incident: 'Life assured died in a road accident.', claimed: 2_000_000, excess: 0, paidTo: 'Ali Juma (brother, beneficiary)' },
      { customer: 'Estate of Daniel Muriuki', type: 'Individual', item: 'Mortgage term cover, KES 5M', sumInsured: 5_000_000, premium: 42_000, incident: 'Life assured died after a long illness; cover clears the home loan.', claimed: 5_000_000, excess: 0, paidTo: 'KCB Bank (mortgage lender)' }
    ]
  },
  {
    lineId: 'savings-life', product: 'Education Plan', code: 'LIFE-EDU', category: 'Life',
    documents: ['Claim form', 'Policy document', 'ID of the policyholder', 'Bank details'],
    method: 'Bank transfer to the policyholder',
    examples: [
      { customer: 'Rose Atieno', type: 'Individual', item: '12-year education plan', sumInsured: 1_500_000, premium: 120_000, incident: 'Plan matured as her son joined university.', claimed: 1_620_000, excess: 0 },
      { customer: 'Samuel Njoroge', type: 'Individual', item: '10-year education plan', sumInsured: 1_000_000, premium: 96_000, incident: 'Scheduled partial maturity for Form One school fees.', claimed: 250_000, excess: 0 },
      { customer: 'Grace Moraa', type: 'Individual', item: '15-year endowment plan', sumInsured: 2_000_000, premium: 144_000, incident: 'Plan matured at the end of the term.', claimed: 2_310_000, excess: 0 }
    ]
  },
  {
    lineId: 'group-life', product: 'Last Expense (Funeral) Cover', code: 'LIFE-FUN', category: 'Life',
    documents: ['Claim form', 'Death certificate or burial permit', 'ID of the deceased', 'ID of the claimant'],
    method: 'M-Pesa to the family',
    examples: [
      { customer: 'Umoja Chama, Kayole', type: 'Business', item: 'Last expense for 40 members, KES 100,000 each', sumInsured: 4_000_000, premium: 48_000, incident: 'A member’s mother died; funeral costs claimed.', claimed: 100_000, excess: 0, paidTo: 'Member’s family' },
      { customer: 'Kenya Bus Drivers Welfare', type: 'Business', item: 'Group life for 210 drivers', sumInsured: 105_000_000, premium: 630_000, incident: 'A driver died in a road accident; group life benefit claimed.', claimed: 500_000, excess: 0, paidTo: 'Spouse of the deceased driver' },
      { customer: 'Faulu Microfinance borrowers', type: 'Business', item: 'Credit life on member loans', sumInsured: 30_000_000, premium: 270_000, incident: 'A borrower died; the outstanding loan balance claimed.', claimed: 86_000, excess: 0, paidTo: 'Faulu Microfinance (loan account)' }
    ]
  },
  {
    lineId: 'pension', product: 'Personal Pension Plan', code: 'PEN', category: 'Pension',
    documents: ['Claim form', 'ID and KRA PIN', 'Retirement notice', 'Bank details'],
    method: 'Bank transfer to the member',
    examples: [
      { customer: 'Paul Mutiso', type: 'Individual', item: 'Personal pension, retired at 60', sumInsured: 4_200_000, premium: 120_000, incident: 'Member retired and took one third of the fund as a lump sum.', claimed: 1_400_000, excess: 0 },
      { customer: 'Agnes Nduta', type: 'Individual', item: 'Personal pension, early retirement at 55', sumInsured: 2_600_000, premium: 84_000, incident: 'Member took early retirement on health grounds.', claimed: 2_600_000, excess: 0 },
      { customer: 'Estate of Charles Odhiambo', type: 'Individual', item: 'Personal pension', sumInsured: 1_900_000, premium: 72_000, incident: 'Member died before retirement; the fund value was claimed for the dependants.', claimed: 1_900_000, excess: 0, paidTo: 'Dependants of the member' }
    ]
  },
  {
    lineId: 'annuity', product: 'Immediate Annuity', code: 'ANN', category: 'Annuity',
    documents: ['Claim form', 'Life certificate or death certificate', 'ID', 'Bank details'],
    method: 'Bank transfer to the annuitant',
    examples: [
      { customer: 'Margaret Wangari', type: 'Individual', item: 'Annuity of KES 35,000 a month', sumInsured: 4_000_000, premium: 4_000_000, incident: 'First-year life certificate received; payments for the quarter claimed.', claimed: 105_000, excess: 0 },
      { customer: 'Estate of Simon Kirui', type: 'Individual', item: 'Annuity with 10-year guarantee', sumInsured: 3_000_000, premium: 3_000_000, incident: 'Annuitant died in year 3; the rest of the guaranteed payments claimed.', claimed: 1_960_000, excess: 0, paidTo: 'Beatrice Kirui (spouse)' },
      { customer: 'Hon. Ruth Nyokabi', type: 'Individual', item: 'Joint-life annuity of KES 50,000 a month', sumInsured: 6_000_000, premium: 6_000_000, incident: 'Annual increase applied; arrears for two months claimed.', claimed: 100_000, excess: 0 }
    ]
  }
];

const CHANNELS = ['Mobile app', 'Agent visit', 'Phone call', 'Customer page', 'Email'];

const pad = (n: number, width: number) => String(n).padStart(width, '0');
const money = (n: number) => `${SAMPLE_CURRENCY} ${n.toLocaleString('en-KE')}`;
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

/** Day offsets from a fixed start, so the sample book never changes between builds. */
function day(base: string, add: number, hour = 9): string {
  const date = new Date(`${base}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + add);
  date.setUTCHours(hour);
  return date.toISOString();
}
const dateOnly = (iso: string) => iso.slice(0, 10);

interface Built {
  products: InsuranceProduct[];
  customers: Customer[];
  policies: Policy[];
  claims: Claim[];
  workflows: ClaimWorkflow[];
  stories: SampleClaimStory[];
}

function build(): Built {
  const out: Built = { products: [], customers: [], policies: [], claims: [], workflows: [], stories: [] };
  let n = 0;
  LINES.forEach((line, lineIndex) => {
    out.products.push({
      id: `product-${line.lineId}`,
      name: line.product,
      code: line.code,
      category: line.category,
      carrier: 'Sample insurer (demo)',
      status: 'Published'
    });
    line.examples.forEach((example, exampleIndex) => {
      n += 1;
      const number = pad(1000 + n, 4);
      const policyId = `POL-2026-${number}`;
      const claimId = `CLM-2026-${number}`;
      const customerId = `sample-${slug(example.customer)}`;
      // Cover starts between January and March 2026; the incident is 3–7 months in.
      const start = dateOnly(day('2026-01-05', lineIndex * 3 + exampleIndex * 17));
      const expiry = dateOnly(day(start, 364));
      const incident = day(start, 95 + exampleIndex * 30 + (lineIndex % 5) * 7, 7);
      const [notCovered, notCoveredReason] = example.notCovered ?? [0, undefined];
      const approved = Math.max(0, example.claimed - example.excess - notCovered);
      const reserve = Math.round(example.claimed * 1.1 / 1000) * 1000;
      const paidTo = example.paidTo ?? example.customer;
      const certificateNumber = `CS-2026-${number}`;
      const reportedVia = CHANNELS[(n - 1) % CHANNELS.length];

      out.customers.push({
        id: customerId,
        name: example.customer,
        type: example.type,
        email: `${slug(example.customer)}@example.com`,
        status: 'Active'
      });

      out.policies.push({
        id: policyId,
        policyNumber: policyId,
        customer: example.customer,
        customerId,
        product: line.product,
        premium: money(example.premium),
        status: 'Active',
        insuredItem: example.item,
        sumInsured: example.sumInsured,
        registration: example.registration,
        yearOfManufacture: example.year,
        startDate: start,
        expiryDate: expiry
      });

      out.claims.push({
        id: claimId,
        claimNumber: claimId,
        policyNumber: policyId,
        customer: example.customer,
        amount: money(example.claimed),
        status: 'Settled'
      });

      out.workflows.push({ claimId, stage: 'Closed', workflowStatus: 'Closed' });

      const reported = day(dateOnly(incident), 1, 10);
      const docsDone = day(dateOnly(incident), 4, 15);
      const assessed = day(dateOnly(incident), 8, 11);
      const approvedAt = day(dateOnly(incident), 11, 14);
      const discharge = day(dateOnly(incident), 13, 10);
      const paid = day(dateOnly(incident), 15, 12);
      const certified = day(dateOnly(incident), 16, 9);

      const settlement: SampleSettlement = {
        reserve,
        claimed: example.claimed,
        excess: example.excess,
        notCovered,
        notCoveredReason,
        approved,
        paidTo,
        method: line.method,
        paidOn: dateOnly(paid),
        paymentReference: `PAY-${number}`,
        dischargeSignedOn: dateOnly(discharge),
        certificateNumber,
        certificateApprovedBy: STAFF.manager,
        certificateApprovedOn: dateOnly(certified)
      };

      const deductions = [
        example.excess > 0 ? `excess ${money(example.excess)}` : '',
        notCovered > 0 ? `${money(notCovered)} not covered` : ''
      ].filter(Boolean);

      out.stories.push({
        claimId,
        policyId,
        lineId: line.lineId,
        incidentDate: dateOnly(incident),
        reportedVia,
        description: example.incident,
        documents: line.documents.map((name, i) => ({
          name,
          kind: i === 0 ? 'Claim form' : i === line.documents.length - 1 ? 'Supporting' : 'Evidence',
          receivedOn: dateOnly(day(dateOnly(incident), 1 + Math.min(i, 3)))
        })),
        checks: [
          { label: 'Policy in force on the day of the incident', pass: true },
          { label: 'Premium paid', pass: true },
          { label: 'The loss is one the policy covers', pass: true },
          { label: 'All documents received', pass: true },
          { label: 'No earlier claim for the same loss', pass: true },
          { label: 'Amount within the sum insured', pass: example.claimed <= example.sumInsured || line.lineId === 'savings-life' }
        ],
        fraudScore: 6 + ((n * 7) % 23),
        assessorNote: deductions.length
          ? `Recommend paying ${money(approved)} (claimed ${money(example.claimed)}, less ${deductions.join(' and ')}).`
          : `Recommend paying the full ${money(approved)} claimed.`,
        steps: [
          { at: reported, stage: 'Reported', label: `Claim reported by ${reportedVia.toLowerCase()}`, by: example.customer },
          { at: docsDone, stage: 'Documents', label: 'All documents received and checked', by: STAFF.officer },
          { at: assessed, stage: 'Assessment', label: `Assessed: recommend ${money(approved)}`, by: STAFF.adjuster },
          { at: approvedAt, stage: 'Approval', label: `Approved for ${money(approved)}`, by: STAFF.manager },
          { at: discharge, stage: 'Discharge', label: 'Discharge voucher signed', by: paidTo },
          { at: paid, stage: 'Payment', label: `Payment of ${money(approved)} recorded (${line.method.toLowerCase()}, ref PAY-${number})`, by: STAFF.finance },
          { at: certified, stage: 'Certificate', label: `Certificate of settlement ${certificateNumber} approved; claim settled`, by: STAFF.manager }
        ],
        settlement
      });
    });
  });
  return out;
}

const BOOK = build();

/** Product templates, one per kind of cover. */
export const sampleProducts: InsuranceProduct[] = BOOK.products;
export const sampleCustomers: Customer[] = BOOK.customers;
export const samplePolicies: Policy[] = BOOK.policies;
export const sampleClaims: Claim[] = BOOK.claims;
export const sampleClaimWorkflows: ClaimWorkflow[] = BOOK.workflows;
export const sampleClaimStories: SampleClaimStory[] = BOOK.stories;

/** The worked story behind a sample claim, if the claim is one of them. */
export function sampleClaimStory(claimId: string): SampleClaimStory | undefined {
  return sampleClaimStories.find((story) => story.claimId === claimId);
}

/** Lines of cover with sample examples, in POLICY_LINES order. */
export const SAMPLE_LINE_IDS: readonly string[] = LINES.map((line) => line.lineId);
