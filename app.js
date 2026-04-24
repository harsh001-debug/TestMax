const STORAGE_KEYS = {
  token: "polytechnic-auth-token",
  historyPrefix: "polytechnic-test-history",
  theme: "polytechnic-theme"
};

const API_BASE_URL = "/api";

const SUBJECTS = [
  {
    id: "physics",
    name: "Physics",
    icon: "Ph",
    color: "#d8e8ff",
    description: "Chapter-wise concept practice and previous year question sets for physics."
  },
  {
    id: "mathematics",
    name: "Maths",
    icon: "Ma",
    color: "#d9f4ee",
    description: "Formula-based practice with algebra, trigonometry, and mensuration tests."
  },
  {
    id: "chemistry",
    name: "Chemistry",
    icon: "Ch",
    color: "#ffe6d6",
    description: "Important chemistry chapters for objective preparation and quick revision."
  }
];

const PYQ_YEARS = ["2025", "2024", "2023"];

const SUBJECT_CHAPTERS = {
  physics: [
    "Laws of Motion & Kinematics",
    "Force and Laws of Motion",
    "Heat and Thermodynamics"
  ],
  mathematics: ["Algebra - Linear & Quadratic Equations", "Trigonometry", "Mensuration"],
  chemistry: [
    "Atomic Structure",
    "Chemical Reactions and Equations",
    "Acids, Bases and Salts"
  ]
};

const CHAPTER_DETAILS = {
  physics: {
    "Laws of Motion & Kinematics": {
      source: "PDF mock set",
      focus: "Equations of motion, graph slope, Newton's laws, circular motion",
      difficulty: "9 Easy / 7 Medium / 4 Hard"
    }
  },
  mathematics: {
    "Algebra - Linear & Quadratic Equations": {
      source: "PDF mock set",
      focus: "Linear equations, roots, discriminant, Vieta formulas",
      difficulty: "9 Easy / 7 Medium / 4 Hard"
    }
  },
  chemistry: {
    "Atomic Structure": {
      source: "PDF mock set",
      focus: "Subatomic particles, isotopes, isobars, shells, valency",
      difficulty: "9 Easy / 7 Medium / 4 Hard"
    }
  }
};

const app = document.getElementById("app");
const authModal = document.getElementById("authModal");
const authForm = document.getElementById("authForm");
const authTitle = document.getElementById("authTitle");
const authSubtitle = document.getElementById("authSubtitle");
const headerAuthButtons = document.getElementById("headerAuthButtons");
const studentChip = document.getElementById("studentChip");
const loaderOverlay = document.getElementById("loaderOverlay");
const loaderTitle = document.getElementById("loaderTitle");
const loaderMessage = document.getElementById("loaderMessage");

const state = {
  screen: "dashboard",
  flow: null,
  selectedSubject: null,
  selectedYear: null,
  currentTest: null,
  currentQuestionIndex: 0,
  answers: {},
  reviewFlags: {},
  seenQuestions: {},
  timeLeft: 0,
  timerId: null,
  lastResult: null,
  authMode: "login",
  authStep: "credentials",
  authStatus: null,
  authContext: "manual",
  pendingFlow: null,
  isBootstrapping: true,
  isAuthenticating: false,
  busyTitle: "Loading platform...",
  busyMessage: "Preparing your dashboard.",
  authPendingEmail: "",
  authPendingExpiresAt: "",
  authDraft: {
    name: "",
    email: "",
    goal: "",
    password: "",
    otp: ""
  },
  token: window.localStorage.getItem(STORAGE_KEYS.token),
  theme: window.localStorage.getItem(STORAGE_KEYS.theme) || "day",
  profile: null,
  history: loadJSON(getHistoryStorageKey("guest"), [])
};

function q(question, options, answer, explanation, meta = {}) {
  return { question, options, answer, explanation, ...meta };
}

const CHAPTER_BANK = {
  physics: {
    "Motion and Measurement": [
      q("Which physical quantity tells how fast an object changes its position?", ["Mass", "Speed", "Density", "Pressure"], 1, "Speed tells the rate of change of distance with time."),
      q("The SI unit of distance is:", ["Kilometre", "Centimetre", "Metre", "Millimetre"], 2, "The base SI unit for length is metre."),
      q("A body travels 120 m in 10 s. Its speed is:", ["12 m/s", "10 m/s", "14 m/s", "8 m/s"], 0, "Speed = distance/time = 120/10 = 12 m/s."),
      q("Uniform motion means the object covers:", ["Equal distances in unequal times", "Unequal distances in equal times", "Equal distances in equal times", "No distance"], 2, "Uniform motion is defined by equal distances in equal time intervals."),
      q("The slope of a distance-time graph gives:", ["Acceleration", "Velocity", "Speed", "Momentum"], 2, "For a distance-time graph, slope represents speed."),
      q("An object at rest has velocity:", ["1 m/s", "Infinite", "Zero", "Negative"], 2, "Rest means no change in position, so velocity is zero."),
      q("1 kilometre is equal to:", ["100 m", "1000 m", "10,000 m", "10 m"], 1, "1 km = 1000 metres."),
      q("A car moves with constant speed of 36 km/h. In m/s it is:", ["5", "10", "12", "15"], 1, "36 km/h = 36 x 5/18 = 10 m/s."),
      q("Acceleration is the rate of change of:", ["Mass", "Velocity", "Area", "Work"], 1, "Acceleration measures how velocity changes with time."),
      q("If speed increases every second, the object has:", ["Retardation", "No motion", "Acceleration", "Balanced force"], 2, "Increasing speed means positive acceleration."),
      q("An odometer in a vehicle measures:", ["Time", "Distance travelled", "Fuel", "Pressure"], 1, "An odometer records total distance covered."),
      q("Which graph can directly show rest?", ["Horizontal line on distance-time graph", "Vertical line on distance-time graph", "Curved line on distance-time graph", "Zig-zag line"], 0, "A horizontal line means distance remains unchanged with time."),
      q("The SI unit of acceleration is:", ["m/s", "m/s^2", "kg m/s", "N"], 1, "Acceleration is measured in metre per second squared."),
      q("If a body covers 60 m in 5 s and then 60 m in next 5 s, motion is:", ["Uniform", "Circular", "Random", "Retarded"], 0, "Equal distances in equal intervals show uniform motion."),
      q("Which one is a scalar quantity?", ["Velocity", "Displacement", "Speed", "Force"], 2, "Speed has magnitude only, so it is scalar."),
      q("Speedometer of a bike measures:", ["Average speed", "Instantaneous speed", "Acceleration", "Distance"], 1, "A speedometer shows speed at a particular instant."),
      q("Displacement can be zero when:", ["Distance is zero", "Object returns to starting point", "Speed is constant", "Motion is uniform"], 1, "If final and initial positions match, displacement is zero."),
      q("The graph of uniform motion on distance-time plot is:", ["A straight line", "A circle", "A parabola", "No line"], 0, "Uniform motion gives a constant slope, hence a straight line."),
      q("A runner covers 200 m in 20 s. Average speed is:", ["20 m/s", "10 m/s", "5 m/s", "15 m/s"], 1, "Average speed = 200/20 = 10 m/s."),
      q("The motion of the hands of a clock is:", ["Rectilinear", "Circular", "Random", "Oscillatory"], 1, "Clock hands move in a circular path.")
    ],
    "Force and Laws of Motion": [
      q("Force is a push or a:", ["Friction", "Pull", "Torque", "Flow"], 1, "Force is commonly defined as a push or pull."),
      q("The SI unit of force is:", ["Joule", "Pascal", "Newton", "Watt"], 2, "Force is measured in newtons."),
      q("Newton's first law is also known as the law of:", ["Acceleration", "Action", "Inertia", "Energy"], 2, "The first law explains inertia."),
      q("Inertia is the tendency of a body to:", ["Change color", "Resist change in state", "Move faster", "Produce energy"], 1, "Inertia resists changes in rest or motion."),
      q("Newton's second law links force with:", ["Pressure and area", "Mass and acceleration", "Velocity and distance", "Work and power"], 1, "F = ma."),
      q("If mass is doubled for same acceleration, force becomes:", ["Half", "Double", "Same", "Zero"], 1, "Force is directly proportional to mass."),
      q("Action and reaction forces act on:", ["Same body", "Different bodies", "No body", "One surface only"], 1, "By Newton's third law, they act on different bodies."),
      q("The product of mass and velocity is:", ["Power", "Energy", "Momentum", "Pressure"], 2, "Momentum = mass x velocity."),
      q("A change in momentum is caused by:", ["Balanced force", "Unbalanced force", "Density", "Temperature"], 1, "Only unbalanced force changes motion state."),
      q("Seat belts in cars are related to:", ["Inertia", "Buoyancy", "Reflection", "Dispersion"], 0, "Seat belts protect due to inertia during sudden stopping."),
      q("When a book rests on a table, the net force on it is:", ["Maximum", "Zero", "Equal to mass", "Infinite"], 1, "Weight and normal reaction balance each other."),
      q("A football moves when kicked because the kick applies:", ["Work only", "Mass", "Force", "Energy only"], 2, "The applied force changes its state of rest."),
      q("The recoil of a gun is explained by:", ["First law", "Second law", "Third law", "Gravitation"], 2, "Backward recoil is the reaction to forward bullet motion."),
      q("Friction generally acts:", ["In direction of motion", "Opposite to motion", "Downward only", "Upward only"], 1, "Friction opposes relative motion."),
      q("Balanced forces can:", ["Change direction only", "Stop all motion", "Produce no change in state", "Always accelerate"], 2, "Equal opposite forces result in zero net force."),
      q("If a 2 kg body accelerates at 3 m/s^2, the force is:", ["5 N", "6 N", "8 N", "1.5 N"], 1, "F = ma = 2 x 3 = 6 N."),
      q("Momentum has SI unit:", ["kg m/s", "N/m", "J/s", "m/s^2"], 0, "Momentum = mass x velocity, unit kg m/s."),
      q("Dust leaves a carpet when beaten due to:", ["Momentum", "Inertia of rest", "Gravitation", "Elasticity"], 1, "Dust resists motion initially and separates."),
      q("A stronger force causes a greater:", ["Density", "Acceleration", "Volume", "Heat"], 1, "Greater force produces greater acceleration for same mass."),
      q("A rocket moves upward because gases are pushed:", ["Upward", "Downward", "Inside", "Sideways"], 1, "The downward action of gases produces upward reaction.")
    ],
    "Heat and Thermodynamics": [
      q("Heat is a form of:", ["Mass", "Energy", "Length", "Current"], 1, "Heat is energy transferred due to temperature difference."),
      q("The SI unit of heat is:", ["Newton", "Watt", "Joule", "Kelvin"], 2, "Heat is measured in joules."),
      q("Temperature is measured by:", ["Thermometer", "Barometer", "Hydrometer", "Ammeter"], 0, "A thermometer measures temperature."),
      q("The normal human body temperature is about:", ["27 C", "37 C", "47 C", "17 C"], 1, "Normal human body temperature is around 37 C."),
      q("Transfer of heat in solids mainly occurs by:", ["Radiation", "Conduction", "Convection", "Reflection"], 1, "In solids, conduction is dominant."),
      q("Sea breeze is caused by:", ["Radiation", "Conduction", "Convection", "Evaporation"], 2, "Convection currents form because land heats faster than sea."),
      q("The transfer of heat without medium is:", ["Conduction", "Convection", "Radiation", "Condensation"], 2, "Radiation can occur in vacuum."),
      q("Metals are generally good conductors of:", ["Sound only", "Heat", "Light only", "Magnetism"], 1, "Metals conduct heat effectively."),
      q("Black surfaces are good:", ["Reflectors", "Absorbers and radiators", "Insulators", "Transmitters"], 1, "Black surfaces absorb and emit heat well."),
      q("Boiling point of water at normal pressure is:", ["50 C", "90 C", "100 C", "120 C"], 2, "Pure water boils at 100 C at one atmosphere."),
      q("Melting point of ice is:", ["0 C", "10 C", "32 C", "100 C"], 0, "Ice melts at 0 C under normal conditions."),
      q("The device used to keep liquids hot or cold for long is:", ["Pyrometer", "Vacuum flask", "Barometer", "Calorimeter"], 1, "A vacuum flask reduces heat transfer."),
      q("During a change of state, supplied heat is used for:", ["Raising temperature only", "Changing state", "Increasing mass", "Changing color"], 1, "Latent heat changes the state without temperature rise."),
      q("Unit of temperature in SI system is:", ["Celsius", "Kelvin", "Fahrenheit", "Joule"], 1, "Kelvin is the SI base unit for temperature."),
      q("When water vapour changes to water, the process is:", ["Evaporation", "Condensation", "Sublimation", "Fusion"], 1, "Gas turning into liquid is condensation."),
      q("Woollen clothes keep us warm in winter because they:", ["Produce heat", "Trap air", "Increase temperature", "Reflect sunlight"], 1, "Trapped air acts as an insulator."),
      q("Land heats up faster than water because:", ["Water is denser", "Land has lower specific heat", "Land is colder", "Water has no heat"], 1, "Water requires more heat for the same temperature rise."),
      q("The process of heat transfer in liquids is mainly:", ["Conduction", "Convection", "Radiation", "Fusion"], 1, "Liquid particles circulate during convection."),
      q("A calorie is commonly used to measure:", ["Length", "Heat", "Pressure", "Current"], 1, "Calorie is a non-SI unit of heat."),
      q("The tendency of heat to flow is from:", ["Cold body to hot body", "Hot body to cold body", "Solid to liquid", "Lower mass to higher mass"], 1, "Heat naturally flows from higher to lower temperature.")
    ]
  },
  mathematics: {
    Algebra: [
      q("The value of x in 2x + 5 = 15 is:", ["10", "5", "6", "4"], 1, "2x = 10, so x = 5."),
      q("The identity (a + b)^2 equals:", ["a^2 + b^2", "a^2 + 2ab + b^2", "a^2 - 2ab + b^2", "2a + 2b"], 1, "Standard algebraic identity."),
      q("If x - 7 = 12, then x is:", ["5", "19", "12", "7"], 1, "Add 7 on both sides."),
      q("Factor of x^2 - 9 is:", ["(x - 9)(x + 1)", "(x - 3)(x + 3)", "(x - 1)(x + 9)", "(x - 3)^2"], 1, "Difference of squares: x^2 - 3^2."),
      q("The coefficient of x in 7x + 3 is:", ["3", "7", "10", "x"], 1, "The numerical coefficient of x is 7."),
      q("If 3x = 21, x equals:", ["9", "8", "7", "6"], 2, "x = 21/3 = 7."),
      q("The sum of 2a and 5a is:", ["7", "7a", "10a^2", "3a"], 1, "Like terms add to 7a."),
      q("The quadratic equation has highest power:", ["1", "2", "3", "4"], 1, "Quadratic means degree 2."),
      q("The expression 4x - 9 is a:", ["Monomial", "Binomial", "Trinomial", "Polynomial of four terms"], 1, "It has two unlike terms."),
      q("Value of 5^0 is:", ["0", "1", "5", "Undefined"], 1, "Any non-zero number raised to zero is 1."),
      q("If a/b = 3/4 and b = 8, a is:", ["4", "6", "8", "12"], 1, "a = 3/4 x 8 = 6."),
      q("The product of (x + 2)(x + 3) is:", ["x^2 + 5x + 6", "x^2 + 6", "x^2 + x + 5", "x^2 + 5"], 0, "Multiply term by term."),
      q("A linear equation in one variable has highest power:", ["1", "2", "0", "3"], 0, "Linear equations are degree 1."),
      q("If 2a = 18, then a =", ["16", "9", "8", "6"], 1, "a = 18/2 = 9."),
      q("Which is a polynomial?", ["1/x", "x^2 + 3x + 1", "sqrt(x)", "x^-1 + 2"], 1, "Polynomial powers are non-negative integers."),
      q("The additive identity is:", ["1", "-1", "0", "x"], 2, "Adding 0 leaves a number unchanged."),
      q("The value of 2^3 x 2^2 is:", ["2^5", "2^6", "4^5", "2^1"], 0, "When bases are same, add exponents."),
      q("If x + y = 10 and x = 4, y =", ["14", "6", "4", "2"], 1, "y = 10 - 4 = 6."),
      q("The expression x^2 + 2x + 1 is equal to:", ["(x + 1)^2", "(x - 1)^2", "x(x + 1)", "(x + 2)^2"], 0, "Perfect square identity."),
      q("The HCF of x^2y and xy^2 is:", ["xy", "x^2y^2", "x^2", "y^2"], 0, "Take the minimum power of common factors.")
    ],
    Trigonometry: [
      q("The value of sin 90 degree is:", ["0", "1", "1/2", "sqrt(3)/2"], 1, "sin 90 degree = 1."),
      q("The value of cos 0 degree is:", ["0", "1", "1/2", "sqrt(3)/2"], 1, "cos 0 degree = 1."),
      q("tan theta is equal to:", ["sin theta / cos theta", "cos theta / sin theta", "1 / sin theta", "1 / cos theta"], 0, "tan theta = sin theta divided by cos theta."),
      q("The value of tan 45 degree is:", ["0", "1", "sqrt(3)", "1/sqrt(3)"], 1, "tan 45 degree = 1."),
      q("sin^2 theta + cos^2 theta =", ["0", "1", "2", "sin theta"], 1, "Fundamental identity."),
      q("The value of cos 60 degree is:", ["1", "1/2", "sqrt(3)/2", "0"], 1, "cos 60 degree = 1/2."),
      q("The value of sin 30 degree is:", ["1", "1/2", "sqrt(3)/2", "0"], 1, "sin 30 degree = 1/2."),
      q("cot theta is reciprocal of:", ["sin theta", "cos theta", "tan theta", "sec theta"], 2, "cot theta = 1/tan theta."),
      q("sec theta is reciprocal of:", ["sin theta", "cos theta", "tan theta", "cot theta"], 1, "sec theta = 1/cos theta."),
      q("The value of tan 30 degree is:", ["1/sqrt(3)", "sqrt(3)", "1", "0"], 0, "tan 30 degree = 1/sqrt(3)."),
      q("The value of sin 60 degree is:", ["1/2", "sqrt(3)/2", "1", "0"], 1, "sin 60 degree = sqrt(3)/2."),
      q("The value of cos 90 degree is:", ["1", "0", "1/2", "sqrt(3)/2"], 1, "cos 90 degree = 0."),
      q("If tan theta = 1, theta can be:", ["30 degree", "45 degree", "60 degree", "90 degree"], 1, "tan 45 degree = 1."),
      q("cosec theta is reciprocal of:", ["cos theta", "sin theta", "tan theta", "sec theta"], 1, "cosec theta = 1/sin theta."),
      q("The side opposite to the right angle is called:", ["Base", "Perpendicular", "Hypotenuse", "Radius"], 2, "In a right triangle, the longest side is hypotenuse."),
      q("If sin theta = 3/5, then cosec theta =", ["3/5", "5/3", "4/5", "5/4"], 1, "cosec is reciprocal of sin."),
      q("The value of cot 45 degree is:", ["0", "1", "sqrt(3)", "1/sqrt(3)"], 1, "cot 45 degree = 1."),
      q("For angle A, cos A = adjacent /", ["Opposite", "Hypotenuse", "Base only", "Perpendicular only"], 1, "cos is adjacent divided by hypotenuse."),
      q("The value of sec 60 degree is:", ["1", "2", "1/2", "sqrt(3)"], 1, "sec 60 degree = 1 / (1/2) = 2."),
      q("The trigonometric ratio involving opposite/hypotenuse is:", ["sin theta", "cos theta", "tan theta", "sec theta"], 0, "sin theta = opposite/hypotenuse.")
    ],
    Mensuration: [
      q("Area of a rectangle is:", ["l + b", "2(l + b)", "l x b", "l/b"], 2, "Multiply length and breadth."),
      q("Perimeter of a square of side a is:", ["a^2", "2a", "4a", "8a"], 2, "A square has four equal sides."),
      q("Area of a circle is:", ["2pr", "pr^2", "pd", "r^2/2"], 1, "Area = pi r squared."),
      q("Circumference of a circle is:", ["2pr", "pr^2", "4r", "r^2"], 0, "Circumference = 2 pi r."),
      q("Volume of a cube of side a is:", ["6a^2", "a^3", "4a", "3a"], 1, "Volume = side cubed."),
      q("Curved surface area of a cylinder is:", ["2prh", "pr^2h", "2pr(r + h)", "4pr^2"], 0, "CSA of cylinder = 2 pi r h."),
      q("Area of a triangle is:", ["base x height", "1/2 x base x height", "side x side", "2 x base x height"], 1, "Triangle area is half of base times height."),
      q("Volume of a cuboid is:", ["l + b + h", "2(lb + bh + hl)", "l x b x h", "lb/h"], 2, "Volume = length x breadth x height."),
      q("Total surface area of a cube is:", ["4a^2", "6a^2", "a^3", "12a"], 1, "A cube has six equal square faces."),
      q("If radius of a circle doubles, area becomes:", ["Double", "Four times", "Half", "Three times"], 1, "Area depends on r^2."),
      q("The area of a square of side 9 cm is:", ["18 cm^2", "36 cm^2", "81 cm^2", "72 cm^2"], 2, "Area = 9 x 9 = 81 cm^2."),
      q("Perimeter of a rectangle with length 8 and breadth 5 is:", ["13", "26", "40", "30"], 1, "2(l + b) = 2(8 + 5) = 26."),
      q("Volume of a cylinder is:", ["pr^2h", "2prh", "4/3 pr^3", "prl"], 0, "Cylinder volume = pi r squared h."),
      q("Area of an equilateral triangle is:", ["sqrt(3)/4 x a^2", "a^2", "2a^2", "a^2/2"], 0, "Standard formula."),
      q("1 hectare is equal to:", ["100 m^2", "1000 m^2", "10,000 m^2", "1,00,000 m^2"], 2, "1 hectare = 10,000 square metres."),
      q("The volume of a sphere is:", ["4pr^2", "4/3 pr^3", "pr^2h", "2pr"], 1, "Volume of sphere = 4/3 pi r cubed."),
      q("Area of four walls of a room is:", ["Floor area", "Lateral surface area", "Volume", "Roof area"], 1, "It refers to the lateral surface area."),
      q("The diagonal of a square can be found using:", ["Pythagoras theorem", "Mensuration only", "Simple interest", "Probability"], 0, "The diagonal forms a right triangle."),
      q("If the side of a cube is 4 cm, its volume is:", ["16 cm^3", "48 cm^3", "64 cm^3", "32 cm^3"], 2, "Volume = 4^3 = 64 cm^3."),
      q("Area of a semicircle is:", ["pr^2", "1/2 pr^2", "2pr", "pr"], 1, "A semicircle is half a circle.")
    ]
  },
  chemistry: {
    "Matter and Atomic Structure": [
      q("Matter is anything that has:", ["Shape only", "Mass and occupies space", "Color only", "Smell only"], 1, "Matter has mass and volume."),
      q("The smallest particle of an element is:", ["Molecule", "Atom", "Ion", "Cell"], 1, "An atom is the smallest unit of an element."),
      q("Who proposed the atomic theory in early modern chemistry?", ["Newton", "Dalton", "Einstein", "Faraday"], 1, "John Dalton proposed atomic theory."),
      q("Electron carries:", ["Positive charge", "Negative charge", "No charge", "Double charge"], 1, "Electrons are negatively charged."),
      q("The nucleus of an atom contains:", ["Electrons only", "Protons and neutrons", "Neutrons only", "Electrons and protons"], 1, "Nucleus contains protons and neutrons."),
      q("Atomic number is the number of:", ["Neutrons", "Electrons + neutrons", "Protons", "Shells"], 2, "Atomic number equals proton count."),
      q("Mass number is the sum of:", ["Protons and electrons", "Protons and neutrons", "Neutrons and electrons", "Only protons"], 1, "Mass number = protons + neutrons."),
      q("A positively charged atom is called:", ["Molecule", "Anion", "Cation", "Isotope"], 2, "Loss of electrons forms a cation."),
      q("The particle with no charge is:", ["Electron", "Proton", "Neutron", "Ion"], 2, "Neutrons are electrically neutral."),
      q("The center of the atom is called:", ["Orbit", "Nucleus", "Shell", "Valency"], 1, "The dense central region is the nucleus."),
      q("Isotopes have same:", ["Mass number", "Number of neutrons", "Atomic number", "Physical state"], 2, "Isotopes share the same atomic number."),
      q("The outermost shell electrons are called:", ["Core electrons", "Valence electrons", "Free electrons", "Bond electrons"], 1, "Valence electrons take part in bonding."),
      q("The SI unit of amount of substance is:", ["Gram", "Mole", "Litre", "Newton"], 1, "The mole is the SI base unit."),
      q("Matter exists commonly in how many basic states?", ["Two", "Three", "Four", "Five"], 2, "Solid, liquid and gas are the three basic states."),
      q("Diffusion is fastest in:", ["Solids", "Liquids", "Gases", "All equally"], 2, "Gas particles move most freely."),
      q("The subatomic particle responsible for atomic identity is:", ["Electron", "Neutron", "Proton", "Photon"], 2, "Proton number defines the element."),
      q("The atomic mass of carbon-12 is approximately:", ["6 u", "12 u", "14 u", "16 u"], 1, "Carbon-12 is the reference with mass 12 u."),
      q("A neutral atom has equal numbers of:", ["Protons and neutrons", "Electrons and neutrons", "Protons and electrons", "Shells and electrons"], 2, "Neutrality requires equal positive and negative charges."),
      q("The scientist who discovered the nucleus through gold foil experiment was:", ["Bohr", "Rutherford", "Thomson", "Dalton"], 1, "Rutherford proposed nuclear model."),
      q("The arrangement of electrons in shells is called:", ["Valency", "Electronic configuration", "Atomization", "Diffusion"], 1, "Distribution of electrons across shells is electronic configuration.")
    ],
    "Chemical Reactions and Equations": [
      q("A chemical equation is balanced to satisfy the law of conservation of:", ["Motion", "Mass", "Heat", "Time"], 1, "Mass must remain constant during a reaction."),
      q("When magnesium burns in oxygen, it forms:", ["Magnesium chloride", "Magnesium oxide", "Magnesium sulphate", "Magnesium carbonate"], 1, "Burning magnesium forms MgO."),
      q("A combination reaction forms:", ["Two products", "One product from two or more reactants", "Only gases", "Only acids"], 1, "Combination means reactants combine into one product."),
      q("Breaking a compound into simpler substances is called:", ["Combination", "Decomposition", "Displacement", "Neutralization"], 1, "Decomposition splits a compound."),
      q("Rusting of iron requires oxygen and:", ["Nitrogen", "Hydrogen", "Moisture", "Helium"], 2, "Iron rusts in the presence of air and water."),
      q("Zn + CuSO4 -> ZnSO4 + Cu is a:", ["Combination reaction", "Displacement reaction", "Neutralization", "Photolysis"], 1, "Zinc displaces copper from copper sulphate."),
      q("A reaction that releases heat is called:", ["Endothermic", "Exothermic", "Reversible", "Slow"], 1, "Exothermic reactions give out heat."),
      q("Photosynthesis is generally:", ["Exothermic", "Endothermic", "Neutral", "Decomposition by heat"], 1, "It absorbs sunlight energy."),
      q("The reaction between acid and base produces salt and:", ["Metal", "Gas only", "Water", "Oxygen"], 2, "Neutralization gives salt and water."),
      q("A white precipitate is formed when silver nitrate reacts with sodium chloride because:", ["A gas is released", "A solid insoluble product forms", "Heat stops", "Salt dissolves"], 1, "Silver chloride is insoluble and forms precipitate."),
      q("The symbol (g) in an equation indicates:", ["Liquid", "Solid", "Gas", "Aqueous"], 2, "State symbol (g) represents gas."),
      q("Electrolysis of water gives:", ["Only oxygen", "Only hydrogen", "Hydrogen and oxygen", "Steam"], 2, "Water decomposes into hydrogen and oxygen."),
      q("The reaction 2H2 + O2 -> 2H2O is:", ["Decomposition", "Combination", "Double displacement", "Oxidation only"], 1, "Hydrogen and oxygen combine to form water."),
      q("Gain of oxygen is called:", ["Reduction", "Oxidation", "Neutralization", "Sublimation"], 1, "Oxidation is addition of oxygen."),
      q("Loss of oxygen is called:", ["Oxidation", "Reduction", "Displacement", "Corrosion"], 1, "Reduction is removal of oxygen."),
      q("Corrosion of silver results in:", ["Rust", "Green coating", "Black coating", "White powder"], 2, "Silver tarnishes to a black coating."),
      q("A catalyst:", ["Changes product", "Increases reaction rate", "Stops reaction permanently", "Adds mass"], 1, "Catalysts speed up reactions without being consumed."),
      q("Decomposition caused by heat is called:", ["Electrolysis", "Photolysis", "Thermal decomposition", "Hydrolysis"], 2, "Heating breaks the compound."),
      q("An aqueous solution is denoted by:", ["(s)", "(l)", "(g)", "(aq)"], 3, "aq means dissolved in water."),
      q("The reaction between baking soda and acid usually releases:", ["Oxygen", "Carbon dioxide", "Nitrogen", "Hydrogen"], 1, "Acid with sodium bicarbonate releases CO2.")
    ],
    "Acids, Bases and Salts": [
      q("Blue litmus turns red in:", ["Base", "Acid", "Salt", "Water"], 1, "Acids turn blue litmus red."),
      q("Red litmus turns blue in:", ["Acid", "Base", "Salt", "Distilled water"], 1, "Bases turn red litmus blue."),
      q("A substance with pH less than 7 is:", ["Neutral", "Acidic", "Basic", "Salt"], 1, "pH below 7 indicates acidity."),
      q("A substance with pH more than 7 is:", ["Acidic", "Neutral", "Basic", "Always salt"], 2, "pH above 7 indicates basic nature."),
      q("Common salt is chemically called:", ["Sodium carbonate", "Sodium chloride", "Calcium chloride", "Potassium nitrate"], 1, "Table salt is NaCl."),
      q("The formula of hydrochloric acid is:", ["H2SO4", "HNO3", "HCl", "NaOH"], 2, "Hydrochloric acid is HCl."),
      q("The formula of sodium hydroxide is:", ["NaOH", "KOH", "Ca(OH)2", "NaCl"], 0, "NaOH is sodium hydroxide."),
      q("Phenolphthalein indicator becomes pink in:", ["Acid", "Base", "Salt solution", "Water"], 1, "Phenolphthalein is pink in basic medium."),
      q("Turmeric indicator in base changes to:", ["Red-brown", "Blue", "Green", "Colorless"], 0, "Turmeric turns red-brown in bases."),
      q("Neutralization is the reaction between:", ["Acid and metal", "Acid and base", "Base and salt", "Salt and water"], 1, "Acid + base gives salt + water."),
      q("Tooth decay starts when mouth pH falls below:", ["8.5", "7.5", "5.5", "6.8"], 2, "Below 5.5 enamel starts getting damaged."),
      q("Baking soda is:", ["Na2CO3", "NaHCO3", "CaCO3", "NH4Cl"], 1, "Baking soda is sodium hydrogen carbonate."),
      q("Washing soda is:", ["Na2CO3.10H2O", "NaCl", "NaOH", "CaCO3"], 0, "Washing soda is sodium carbonate decahydrate."),
      q("Plaster of Paris is prepared from:", ["Gypsum", "Lime water", "Baking powder", "Bleaching powder"], 0, "Heating gypsum gives plaster of Paris."),
      q("The pH of a neutral solution is:", ["0", "14", "7", "5"], 2, "Neutral substances have pH 7."),
      q("Acids in water release:", ["OH- ions", "H+ ions", "Na+ ions", "Cl- ions"], 1, "Acids furnish hydrogen ions in aqueous solution."),
      q("Bases in water release:", ["H+ ions", "OH- ions", "O2 ions", "N2 ions"], 1, "Bases produce hydroxide ions."),
      q("Bleaching powder is used for:", ["Sweetening food", "Disinfecting water", "Making glass", "Producing petrol"], 1, "It is widely used as a disinfectant."),
      q("An antacid is used to neutralize:", ["Basic soil", "Acidity in stomach", "Salt water", "Metal corrosion"], 1, "Antacids reduce excess stomach acid."),
      q("China rose indicator in base becomes:", ["Dark pink", "Green", "Yellow", "Red only"], 1, "China rose indicator turns green in basic solutions.")
    ]
  }
};

Object.assign(CHAPTER_BANK.physics, {
  "Laws of Motion & Kinematics": [
    q("A body starts from rest and moves with uniform acceleration of 4 m/s^2. What will be its velocity after 5 seconds?", ["10 m/s", "15 m/s", "20 m/s", "25 m/s"], 2, "Using v = u + at: v = 0 + 4 x 5 = 20 m/s.", { difficulty: "Easy", source: "PDF mock set" }),
    q("A car travels 60 km in 2 hours. What is its average speed?", ["20 km/h", "25 km/h", "30 km/h", "40 km/h"], 2, "Average speed = total distance / total time = 60 / 2 = 30 km/h.", { difficulty: "Easy", source: "PDF mock set" }),
    q("A stone is dropped from rest from a height of 45 m. Taking g = 10 m/s^2, the time taken to reach the ground is approximately:", ["2 s", "3 s", "4 s", "5 s"], 1, "Using s = 1/2 gt^2: 45 = 5t^2, so t^2 = 9 and t = 3 s.", { difficulty: "Easy", source: "PDF mock set" }),
    q("Which physical quantity is represented by the slope of a distance-time graph?", ["Acceleration", "Velocity", "Displacement", "Force"], 1, "Slope of a distance-time graph is change in distance divided by change in time, which gives speed or velocity.", { difficulty: "Easy", source: "PDF mock set" }),
    q("The SI unit of acceleration is:", ["m/s", "m/s^2", "m^2/s", "N"], 1, "Acceleration is change of velocity per unit time, so its unit is metre per second squared.", { difficulty: "Easy", source: "PDF mock set" }),
    q("A body moving with uniform velocity has:", ["Zero acceleration", "Constant acceleration", "Increasing acceleration", "Decreasing acceleration"], 0, "When velocity does not change with time, acceleration is zero.", { difficulty: "Easy", source: "PDF mock set" }),
    q("Which of the following is a vector quantity?", ["Speed", "Distance", "Displacement", "Time"], 2, "Displacement has both magnitude and direction, so it is a vector quantity.", { difficulty: "Easy", source: "PDF mock set" }),
    q("A body of mass 2 kg is at rest. A net force of 6 N acts on it. Its acceleration will be:", ["1 m/s^2", "2 m/s^2", "3 m/s^2", "4 m/s^2"], 2, "By Newton's second law, a = F/m = 6/2 = 3 m/s^2.", { difficulty: "Easy", source: "PDF mock set" }),
    q("An object moves in a circle at constant speed. Which quantity changes continuously?", ["Speed", "Kinetic energy", "Velocity", "Mass"], 2, "The direction of motion keeps changing, so velocity changes even when speed remains constant.", { difficulty: "Easy", source: "PDF mock set" }),
    q("A bus reduces its speed from 25 m/s to 15 m/s in 5 s. What is its acceleration?", ["-1 m/s^2", "-2 m/s^2", "-3 m/s^2", "-4 m/s^2"], 1, "Acceleration = (v - u) / t = (15 - 25) / 5 = -2 m/s^2.", { difficulty: "Medium", source: "PDF mock set" }),
    q("A car starts from rest and attains a speed of 36 km/h in 10 s. Find its acceleration in m/s^2.", ["0.5 m/s^2", "1 m/s^2", "1.5 m/s^2", "2 m/s^2"], 1, "36 km/h = 10 m/s. Acceleration = 10 / 10 = 1 m/s^2.", { difficulty: "Medium", source: "PDF mock set" }),
    q("A body moves with velocity 5 m/s for 4 s and then with 15 m/s for the next 4 s. What is the average velocity for 8 s?", ["7.5 m/s", "10 m/s", "12.5 m/s", "15 m/s"], 1, "Total distance = 5 x 4 + 15 x 4 = 80 m. Average velocity = 80/8 = 10 m/s.", { difficulty: "Medium", source: "PDF mock set" }),
    q("A body starting from rest covers 80 m in 4 s under uniform acceleration. Find the acceleration.", ["5 m/s^2", "8 m/s^2", "10 m/s^2", "20 m/s^2"], 2, "Using s = 1/2 at^2: 80 = 1/2 x a x 16, so a = 10 m/s^2.", { difficulty: "Medium", source: "PDF mock set" }),
    q("Which of the following is NOT an example of Newton's first law?", ["A book lying on a table", "A passenger jerks forward when a bus stops suddenly", "A ball moving with constant velocity on a smooth surface", "A car accelerating on a straight road"], 3, "Newton's first law explains rest or uniform motion; acceleration is explained by Newton's second law.", { difficulty: "Medium", source: "PDF mock set" }),
    q("A body of mass 10 kg is moving with uniform velocity 5 m/s. The net force acting on it is:", ["0 N", "2 N", "10 N", "50 N"], 0, "For uniform velocity, acceleration is zero, so net force is zero.", { difficulty: "Medium", source: "PDF mock set" }),
    q("A 20 kg block is pulled with a horizontal force of 40 N on a smooth surface. What is its acceleration?", ["1 m/s^2", "2 m/s^2", "4 m/s^2", "5 m/s^2"], 1, "Acceleration = F/m = 40/20 = 2 m/s^2.", { difficulty: "Medium", source: "PDF mock set" }),
    q("A train of length 100 m is moving with 20 m/s. How much time will it take to completely pass a pole?", ["2 s", "3 s", "4 s", "5 s"], 3, "To pass a pole, the train covers its own length. Time = 100/20 = 5 s.", { difficulty: "Hard", source: "PDF mock set" }),
    q("A car moving with 72 km/h is brought to rest in 10 s by applying brakes. Find the retardation.", ["1.5 m/s^2", "2 m/s^2", "2.5 m/s^2", "3 m/s^2"], 1, "72 km/h = 20 m/s. Retardation magnitude = 20/10 = 2 m/s^2.", { difficulty: "Hard", source: "PDF mock set" }),
    q("A stone is projected vertically upward with velocity 25 m/s. After how much time will it return to the point of projection? Take g = 10 m/s^2.", ["2.5 s", "3 s", "4 s", "5 s"], 3, "Time to reach the top is u/g = 25/10 = 2.5 s. Total time of flight = 2 x 2.5 = 5 s.", { difficulty: "Hard", source: "PDF mock set" }),
    q("A body's velocity-time graph is a straight line passing through the origin with slope 2. What is the acceleration of the body?", ["0 m/s^2", "1 m/s^2", "2 m/s^2", "4 m/s^2"], 2, "The slope of a velocity-time graph represents acceleration; here it is 2 m/s^2.", { difficulty: "Hard", source: "PDF mock set" })
  ]
});

Object.assign(CHAPTER_BANK.chemistry, {
  "Atomic Structure": [
    q("Which particle has a negative charge?", ["Proton", "Neutron", "Electron", "Nucleus"], 2, "An electron carries one unit negative charge.", { difficulty: "Easy", source: "PDF mock set" }),
    q("The atomic number of an element is equal to:", ["Number of neutrons", "Number of protons", "Number of electrons + neutrons", "Mass number"], 1, "Atomic number is defined as the number of protons in the nucleus.", { difficulty: "Easy", source: "PDF mock set" }),
    q("Mass number of an atom is:", ["Protons - neutrons", "Protons + neutrons", "Electrons + neutrons", "Only neutrons"], 1, "Mass number is the total number of nucleons: protons plus neutrons.", { difficulty: "Easy", source: "PDF mock set" }),
    q("Which of the following is an isotope of carbon-12?", ["Nitrogen-14", "Carbon-13", "Oxygen-16", "Sodium-23"], 1, "Isotopes have the same atomic number but different mass numbers; carbon-12 and carbon-13 both have Z = 6.", { difficulty: "Easy", source: "PDF mock set" }),
    q("Which scientist proposed fixed orbits for electrons around the nucleus?", ["Dalton", "J. J. Thomson", "Rutherford", "Niels Bohr"], 3, "Bohr proposed that electrons revolve around the nucleus in fixed energy levels.", { difficulty: "Easy", source: "PDF mock set" }),
    q("The maximum number of electrons in the K-shell (n = 1) is:", ["2", "4", "6", "8"], 0, "Maximum electrons in a shell = 2n^2. For n = 1, it is 2.", { difficulty: "Easy", source: "PDF mock set" }),
    q("The electronic configuration of sodium (Z = 11) is:", ["2, 8, 1", "2, 7, 2", "2, 6, 3", "2, 8, 2"], 0, "Sodium has 11 electrons distributed as 2, 8, 1.", { difficulty: "Easy", source: "PDF mock set" }),
    q("Which pair represents isobars?", ["Carbon-14 and Nitrogen-14", "Carbon-12 and Carbon-13", "Hydrogen-1 and Hydrogen-3", "Oxygen-16 and Oxygen-18"], 0, "Isobars have the same mass number but different atomic numbers.", { difficulty: "Easy", source: "PDF mock set" }),
    q("Tritium is an isotope of:", ["Hydrogen", "Helium", "Oxygen", "Nitrogen"], 0, "Tritium is a radioactive isotope of hydrogen.", { difficulty: "Easy", source: "PDF mock set" }),
    q("An element X has atomic number 8 and mass number 16. How many protons, neutrons and electrons does it have?", ["8 p, 8 n, 8 e", "8 p, 16 n, 8 e", "16 p, 8 n, 16 e", "8 p, 8 n, 16 e"], 0, "Z = 8 gives 8 protons and 8 electrons; neutrons = 16 - 8 = 8.", { difficulty: "Medium", source: "PDF mock set" }),
    q("The valency of magnesium (Z = 12) is:", ["1", "2", "3", "4"], 1, "Magnesium has configuration 2, 8, 2 and loses two electrons, so its valency is 2.", { difficulty: "Medium", source: "PDF mock set" }),
    q("Which of the following statements is correct?", ["Isotopes have different chemical properties", "Isobars have the same atomic number", "Isotopes have the same chemical properties", "All isotopes are radioactive"], 2, "Isotopes have the same atomic number and electronic configuration, so their chemical properties are similar.", { difficulty: "Medium", source: "PDF mock set" }),
    q("Find the number of neutrons in aluminium-27, whose atomic number is 13.", ["13", "14", "27", "40"], 1, "Neutrons = mass number - atomic number = 27 - 13 = 14.", { difficulty: "Medium", source: "PDF mock set" }),
    q("Which of the following is used as fuel in nuclear reactors?", ["Carbon-14", "Uranium-235", "Sodium-23", "Chlorine-35"], 1, "Uranium-235 is a fissile isotope widely used as nuclear fuel.", { difficulty: "Medium", source: "PDF mock set" }),
    q("An atom has 2 electrons in K-shell and 8 electrons in L-shell. The element belongs to which period of the periodic table?", ["1st period", "2nd period", "3rd period", "4th period"], 1, "The period number equals the number of occupied shells; here two shells are occupied.", { difficulty: "Medium", source: "PDF mock set" }),
    q("For sodium-23 with atomic number 11, which statement is correct?", ["11 protons, 12 neutrons, 12 electrons", "11 protons, 11 neutrons, 11 electrons", "11 protons, 12 neutrons, 11 electrons", "12 protons, 11 neutrons, 11 electrons"], 2, "Z = 11 gives 11 protons and 11 electrons; neutrons = 23 - 11 = 12.", { difficulty: "Medium", source: "PDF mock set" }),
    q("The average atomic mass of chlorine is 35.5. It has isotopes chlorine-35 and chlorine-37. This shows that:", ["Both isotopes are equally abundant", "Chlorine-35 is more abundant", "Chlorine-37 is more abundant", "Both isotopes are radioactive"], 1, "The average mass is closer to 35 than 37, so chlorine-35 is more abundant.", { difficulty: "Hard", source: "PDF mock set" }),
    q("The maximum number of electrons that can be accommodated in the M-shell (n = 3) is:", ["8", "18", "32", "2"], 1, "Using 2n^2: 2 x 3^2 = 18 electrons.", { difficulty: "Hard", source: "PDF mock set" }),
    q("Which of the following applications uses an isotope?", ["Table salt preparation", "Checking leakage in pipelines", "Making alloys", "Preparing common glass"], 1, "Radioactive isotopes are used as tracers to detect leaks and study flow paths.", { difficulty: "Hard", source: "PDF mock set" }),
    q("The nucleus of an atom is positively charged because it contains:", ["Only neutrons", "Only protons", "Protons and neutrons", "Protons and electrons"], 2, "The nucleus contains positively charged protons and neutral neutrons, so its net charge is positive.", { difficulty: "Hard", source: "PDF mock set" })
  ]
});

Object.assign(CHAPTER_BANK.mathematics, {
  "Algebra - Linear & Quadratic Equations": [
    q("Solve: 3x + 9 = 0.", ["x = -1", "x = -2", "x = -3", "x = 3"], 2, "3x = -9, so x = -3.", { difficulty: "Easy", source: "PDF mock set" }),
    q("The standard form of a quadratic equation is:", ["ax + b = 0", "ax^2 + bx + c = 0", "ax^3 + bx + c = 0", "ax^2 + b = 0"], 1, "A quadratic equation is written as ax^2 + bx + c = 0, where a is not zero.", { difficulty: "Easy", source: "PDF mock set" }),
    q("If x^2 - 7x + 12 = 0, the roots are:", ["2, 6", "3, 4", "1, 12", "2, 5"], 1, "x^2 - 7x + 12 = (x - 3)(x - 4), so x = 3, 4.", { difficulty: "Easy", source: "PDF mock set" }),
    q("For ax^2 + bx + c = 0, the sum of roots is:", ["-b/a", "b/a", "c/a", "-c/a"], 0, "By Vieta's formula, sum of roots = -b/a.", { difficulty: "Easy", source: "PDF mock set" }),
    q("For x^2 - 5x + 6 = 0, the product of roots is:", ["1", "2", "5", "6"], 3, "Product of roots = c/a = 6/1 = 6.", { difficulty: "Easy", source: "PDF mock set" }),
    q("The discriminant of ax^2 + bx + c = 0 is:", ["b^2 - 4ac", "b^2 + 4ac", "4ac - b^2", "2ac"], 0, "The discriminant is D = b^2 - 4ac.", { difficulty: "Easy", source: "PDF mock set" }),
    q("If D > 0, the quadratic equation has:", ["Equal and real roots", "Imaginary roots", "Real and unequal roots", "No roots"], 2, "When D > 0, a quadratic equation has two distinct real roots.", { difficulty: "Easy", source: "PDF mock set" }),
    q("Solve: x/2 + 3 = 5.", ["x = 2", "x = 3", "x = 4", "x = 6"], 2, "x/2 = 2, so x = 4.", { difficulty: "Easy", source: "PDF mock set" }),
    q("If 5x - 10 = 0, then x equals:", ["1", "2", "3", "4"], 1, "5x = 10, so x = 2.", { difficulty: "Easy", source: "PDF mock set" }),
    q("Roots of x^2 - 3x - 10 = 0 are:", ["-5, 2", "5, -2", "-5, -2", "5, 2"], 1, "x^2 - 3x - 10 = (x - 5)(x + 2), so roots are 5 and -2.", { difficulty: "Medium", source: "PDF mock set" }),
    q("For 2x^2 - 4x - 6 = 0, sum and product of roots are:", ["Sum = 2, Product = -3", "Sum = -2, Product = -3", "Sum = 2, Product = 3", "Sum = -2, Product = 3"], 0, "Sum = -b/a = -(-4)/2 = 2; product = c/a = -6/2 = -3.", { difficulty: "Medium", source: "PDF mock set" }),
    q("If one root of x^2 - kx + 8 = 0 is 2, find k.", ["2", "4", "6", "8"], 2, "Substitute x = 2: 4 - 2k + 8 = 0, so k = 6.", { difficulty: "Medium", source: "PDF mock set" }),
    q("For which value of k does x^2 + 4x + k = 0 have equal roots?", ["2", "3", "4", "5"], 2, "Equal roots require D = 0: 4^2 - 4k = 0, so k = 4.", { difficulty: "Medium", source: "PDF mock set" }),
    q("A number is 3 more than twice another number. If the smaller number is x, form the equation.", ["y = 2x - 3", "y = 2x + 3", "y = x + 3", "y = 3x + 2"], 1, "Three more than twice x is written as y = 2x + 3.", { difficulty: "Medium", source: "PDF mock set" }),
    q("The roots of x^2 + x - 2 = 0 are:", ["1, -2", "-1, 2", "2, -1", "Both (B) and (C)"], 0, "x^2 + x - 2 = (x + 2)(x - 1), so the roots are 1 and -2.", { difficulty: "Medium", source: "PDF mock set" }),
    q("A quadratic equation has roots 2 and -3. Form the equation.", ["x^2 + x - 6 = 0", "x^2 - x - 6 = 0", "x^2 + 5x + 6 = 0", "x^2 + x + 6 = 0"], 0, "The equation is (x - 2)(x + 3) = x^2 + x - 6 = 0.", { difficulty: "Medium", source: "PDF mock set" }),
    q("Solve 2x^2 - 5x + 3 = 0 by quadratic formula.", ["x = 1, 3/2", "x = 1/2, 3", "x = 1, 3", "x = 1/2, 3/2"], 0, "Here a = 2, b = -5, c = 3. D = 1, so roots are 1 and 3/2.", { difficulty: "Hard", source: "PDF mock set" }),
    q("The product of two consecutive natural numbers is 132. Find the numbers.", ["10, 11", "11, 12", "12, 13", "13, 14"], 1, "Let the numbers be n and n + 1. n(n + 1) = 132 gives n = 11, so the numbers are 11 and 12.", { difficulty: "Hard", source: "PDF mock set" }),
    q("A train covers 180 km at (x + 10) km/h and returns at (x - 10) km/h. Total time is 8 hours. Find x.", ["40 km/h", "50 km/h", "60 km/h", "70 km/h"], 1, "180/(x + 10) + 180/(x - 10) = 8. Solving gives x = 50 km/h.", { difficulty: "Hard", source: "PDF mock set" }),
    q("A quadratic equation has one root 3 and sum of roots 7. Find the equation.", ["x^2 - 7x + 12 = 0", "x^2 - 7x + 10 = 0", "x^2 - 10x + 21 = 0", "x^2 - 4x + 3 = 0"], 0, "The other root is 4. Product = 12, so the equation is x^2 - 7x + 12 = 0.", { difficulty: "Hard", source: "PDF mock set" })
  ]
});

const SUBJECT_DURATION = {
  pyq: 25 * 60,
  mock: 20 * 60
};

document.addEventListener("click", handleClick);
document.addEventListener("change", handleChange);
document.addEventListener("submit", handleSubmit);
document.addEventListener("input", handleInput);

applyTheme();
void bootstrap();

function render() {
  applyTheme();
  updateStudentChip();
  renderHeaderAuthButtons();
  renderAuthModal();
  renderLoader();

  if (state.screen === "dashboard") {
    app.innerHTML = renderDashboard();
    return;
  }

  if (state.screen === "subject-list") {
    app.innerHTML = renderSubjectList();
    return;
  }

  if (state.screen === "catalog-detail") {
    app.innerHTML = renderCatalogDetail();
    return;
  }

  if (state.screen === "test") {
    app.innerHTML = renderTestScreen();
    return;
  }

  if (state.screen === "result") {
    app.innerHTML = renderResultScreen();
  }
}

function renderDashboard() {
  const recentHistory = state.history.slice(0, 4);
  const studentName = state.profile?.name || "Aspirant";

  return `
    <section class="screen">
      <section class="hero">
        <article class="hero-panel">
          <p class="eyebrow">Start Practice</p>
          <h2>Practice. Submit. Improve.</h2>
          <p>Choose PYQ or mock tests and track your score.</p>
          <div class="hero-actions">
            <button class="primary-btn" data-action="open-flow" data-flow="pyq">PYQ</button>
            <button class="ghost-btn" data-action="open-flow" data-flow="mock">Mock Test</button>
          </div>
          <div class="hero-metrics">
            <div class="hero-metric">
              <span>Modes</span>
              <strong>2</strong>
            </div>
            <div class="hero-metric">
              <span>Subjects</span>
              <strong>${SUBJECTS.length}</strong>
            </div>
            <div class="hero-metric">
              <span>Status</span>
              <strong>${state.profile ? "Active" : "Guest"}</strong>
            </div>
          </div>
        </article>

        <aside class="stats-panel">
          <div class="panel-label">Quick Stats</div>
          <div class="stat-card">
            <p>Subjects</p>
            <strong>3</strong>
            <span>Physics, Maths, Chemistry</span>
          </div>
          <div class="stat-card">
            <p>Mocks</p>
            <strong>9</strong>
            <span>Chapter wise</span>
          </div>
          <div class="stat-card">
            <p>Questions</p>
            <strong>20</strong>
            <span>Per test</span>
          </div>
        </aside>
      </section>

      <section class="trust-strip">
        <article class="trust-card">
          <p class="eyebrow">Student</p>
          <h3>${studentName}</h3>
          <p>${state.profile ? `${state.profile.goal} • ${state.profile.email}` : "Sign in to save your practice history and continue across sessions."}</p>
        </article>
        <article class="trust-card">
          <p class="eyebrow">Tests</p>
          <h3>Timed</h3>
          <p>Answer, mark, submit.</p>
        </article>
        <article class="trust-card">
          <p class="eyebrow">Theme</p>
          <h3>${state.theme === "night" ? "Night" : "Day"}</h3>
          <p>Switch anytime.</p>
        </article>
      </section>

      <section class="dashboard-grid">
        <article class="card">
          <div class="section-head">
            <div>
              <p class="eyebrow">Practice</p>
              <h3>Choose Mode</h3>
            </div>
          </div>

          <div class="catalog-grid">
            <article class="subject-card">
              <div class="subject-icon" style="background:${SUBJECTS[0].color};">PYQ</div>
              <div>
                <h3>Polytechnic PYQ</h3>
                <p>Previous year style sets.</p>
              </div>
              <footer>
                <span class="tag">PYQ</span>
                <button class="primary-btn" data-action="open-flow" data-flow="pyq">Open</button>
              </footer>
            </article>

            <article class="subject-card">
              <div class="subject-icon" style="background:${SUBJECTS[1].color};">MT</div>
              <div>
                <h3>Mock Test</h3>
                <p>Chapter wise practice.</p>
              </div>
              <footer>
                <span class="tag">Mock</span>
                <button class="primary-btn" data-action="open-flow" data-flow="mock">Open</button>
              </footer>
            </article>
          </div>
        </article>

        <aside class="sidebar-card">
          <div>
            <p class="eyebrow">Account</p>
            <h3>Simple Tools</h3>
          </div>
          <div class="feature-list">
            <div class="feature-row"><span></span>Timer</div>
            <div class="feature-row"><span></span>Score history</div>
            <div class="feature-row"><span></span>Answer review</div>
            <div class="feature-row"><span></span>OTP login</div>
          </div>
          ${state.profile ? `
            <div class="login-reminder">
              <h3>${state.profile.name}</h3>
              <p>${state.profile.email} • ${state.profile.goal}</p>
              <button class="ghost-btn" data-action="logout">Logout</button>
            </div>
          ` : `
            <div class="login-reminder">
              <h3>Login</h3>
              <p>Save your scores.</p>
              <button class="primary-btn" data-action="open-auth" data-mode="signup">Sign Up</button>
            </div>
          `}
        </aside>
      </section>

      <section class="card">
        <div class="section-head">
          <div>
            <p class="eyebrow">Scores</p>
            <h3>Recent Tests</h3>
          </div>
          ${recentHistory.length ? `<button class="ghost-btn" data-action="print-scorecard">Print</button>` : ""}
        </div>
        ${
          recentHistory.length
            ? `<div class="history-list">${recentHistory.map(renderHistoryItem).join("")}</div>`
            : `<div class="empty-state"><h3>No scores yet</h3><p>Start a test.</p></div>`
        }
      </section>
    </section>
  `;
}

function renderSubjectList() {
  const isPyq = state.flow === "pyq";
  const title = "Choose Subject";
  const subtitle = isPyq
    ? "Pick a subject for PYQ."
    : "Pick a subject for mock tests.";

  return `
    <section class="screen">
      <div class="screen-topline">
        <div>
          <p class="eyebrow">${isPyq ? "PYQ" : "Mock"}</p>
          <h2>${title}</h2>
          <p class="status-line">${subtitle}</p>
        </div>
        <button class="ghost-btn" data-action="go-home">Back</button>
      </div>

      <section class="subject-list">
        ${SUBJECTS.map((subject) => `
          <article class="subject-card">
            <div class="subject-icon" style="background:${subject.color};">${subject.icon}</div>
            <div>
              <h3>${subject.name}</h3>
              <p>${isPyq ? "Year wise sets." : `${SUBJECT_CHAPTERS[subject.id].length} chapters.`}</p>
            </div>
            <footer>
              <span class="tag">${isPyq ? "PYQ" : "Mock"}</span>
              <button class="primary-btn" data-action="choose-subject" data-subject="${subject.id}">Open</button>
            </footer>
          </article>
        `).join("")}
      </section>
    </section>
  `;
}

function getChapterDescription(subjectId, chapter) {
  return "20 questions.";
}

function renderChapterMeta(subjectId, chapter) {
  const details = CHAPTER_DETAILS[subjectId]?.[chapter];
  if (!details) {
    return "";
  }

  return `
    <div class="chapter-meta">
      <span>${details.source}</span>
      <span>${details.difficulty}</span>
    </div>
  `;
}

function renderQuestionMeta(question) {
  if (!question.difficulty && !question.source) {
    return "";
  }

  return `
    <div class="question-meta-row">
      ${question.difficulty ? `<span class="difficulty-pill ${question.difficulty.toLowerCase()}">${question.difficulty}</span>` : ""}
      ${question.source ? `<span class="source-pill">${question.source}</span>` : ""}
    </div>
  `;
}

function renderCatalogDetail() {
  const subject = getSubject(state.selectedSubject);
  const chapters = SUBJECT_CHAPTERS[state.selectedSubject];
  const isPyq = state.flow === "pyq";

  return `
    <section class="screen">
      <div class="screen-topline">
        <div>
          <p class="eyebrow">${isPyq ? "PYQ" : "Mock"}</p>
          <h2>${subject.name}</h2>
          <p class="status-line">${isPyq ? "Choose a year." : "Choose a chapter."}</p>
        </div>
        <div class="nav-stack">
          <button class="ghost-btn" data-action="go-back-subjects">Subjects</button>
          <button class="ghost-btn" data-action="go-home">Dashboard</button>
        </div>
      </div>

      <section class="card">
        <div class="subject-summary">
          <div>
            <p class="eyebrow">${isPyq ? "Years" : "Chapters"}</p>
            <h3>${isPyq ? "PYQ Sets" : "Tests"}</h3>
          </div>
          <span class="mini-badge">${subject.name}</span>
        </div>

        ${
          isPyq
            ? `<div class="years-grid">
                ${PYQ_YEARS.map((year) => `
                  <article class="chapter-card">
                    <div class="subject-icon" style="background:${subject.color};">${year.slice(-2)}</div>
                    <div>
                      <h3>${subject.name} PYQ ${year}</h3>
                      <p>20 questions.</p>
                    </div>
                    <footer>
                      <span class="tag">25 min</span>
                      <button class="primary-btn" data-action="start-pyq" data-year="${year}">Start</button>
                    </footer>
                  </article>
                `).join("")}
              </div>`
            : `<div class="chapter-grid">
                ${chapters.map((chapter, index) => `
                  <article class="chapter-card">
                    <div class="subject-icon" style="background:${subject.color};">${index + 1}</div>
                    <div>
                      <h3>${chapter}</h3>
                      <p>${getChapterDescription(state.selectedSubject, chapter)}</p>
                      ${renderChapterMeta(state.selectedSubject, chapter)}
                    </div>
                    <footer>
                      <span class="tag">20 Qs</span>
                      <button class="primary-btn" data-action="start-chapter-test" data-chapter="${chapter}">Start</button>
                    </footer>
                  </article>
                `).join("")}
              </div>`
        }
      </section>
    </section>
  `;
}

function renderTestScreen() {
  const question = state.currentTest.questions[state.currentQuestionIndex];
  const selectedAnswer = state.answers[state.currentQuestionIndex];
  const attempted = Object.keys(state.answers).length;
  const reviewCount = Object.values(state.reviewFlags).filter(Boolean).length;
  const remaining = state.currentTest.questions.length - attempted;

  return `
    <section class="screen">
      <div class="screen-topline">
        <div>
          <p class="eyebrow">Test</p>
          <h2>${state.currentTest.title}</h2>
          <p class="status-line">
            ${state.currentTest.subjectName} • ${state.currentTest.modeLabel} • ${state.currentTest.questions.length} questions
          </p>
        </div>
        <div class="nav-stack">
          <span class="mini-badge">Time: ${formatTime(state.timeLeft)}</span>
          <button class="ghost-btn" data-action="go-home">Exit</button>
        </div>
      </div>

      <section class="test-layout">
        <article class="question-card">
          <div class="question-header">
            <div class="test-meta">
              <span class="question-count">Q${state.currentQuestionIndex + 1}/${state.currentTest.questions.length}</span>
              <span class="tag">${state.currentTest.chapterOrYear}</span>
            </div>
            ${renderQuestionMeta(question)}
            <h3>${question.question}</h3>
          </div>

          <div class="option-list">
            ${question.options.map((option, index) => `
              <button
                class="option-btn ${selectedAnswer === index ? "selected" : ""}"
                data-action="select-option"
                data-option="${index}"
              >
                ${String.fromCharCode(65 + index)}. ${option}
              </button>
            `).join("")}
          </div>

          <div class="question-actions">
            <div class="nav-stack">
              <button class="nav-btn" data-action="prev-question">Prev</button>
              <button class="nav-btn" data-action="next-question">Next</button>
              <button class="nav-btn" data-action="clear-answer">Clear</button>
              <button class="nav-btn" data-action="toggle-review">${state.reviewFlags[state.currentQuestionIndex] ? "Unmark" : "Mark"}</button>
            </div>
            <button class="nav-btn warn" data-action="submit-test">Submit Test</button>
          </div>
        </article>

        <aside class="sidebar-card">
          <div>
            <p class="eyebrow">Progress</p>
            <h3>Questions</h3>
          </div>

          <div class="quick-stats">
            <div class="stat-pill">
              Attempted
              <strong>${attempted}</strong>
            </div>
            <div class="stat-pill">
              Remaining
              <strong>${remaining}</strong>
            </div>
            <div class="stat-pill">
              Review
              <strong>${reviewCount}</strong>
            </div>
            <div class="stat-pill">
              Accuracy Goal
              <strong>80%</strong>
            </div>
          </div>

          <div>
            <p class="eyebrow">Jump</p>
            <div class="palette-grid">
              ${state.currentTest.questions.map((_, index) => `
                <button
                  class="palette-btn ${getPaletteClass(index)}"
                  data-action="jump-question"
                  data-index="${index}"
                >
                  ${index + 1}
                </button>
              `).join("")}
            </div>
          </div>

          <p class="status-line">Tap a number to jump.</p>
        </aside>
      </section>
    </section>
  `;
}

function renderResultScreen() {
  const result = state.lastResult;

  return `
    <section class="screen">
      <div class="result-topline">
        <div>
          <p class="eyebrow">Score</p>
          <h2>${result.title}</h2>
          <p class="status-line">${result.studentName} • ${result.subjectName} • Submitted on ${result.submittedAt}</p>
        </div>
        <div class="nav-stack">
          <button class="ghost-btn" data-action="retry-test">Retry</button>
          <button class="ghost-btn" data-action="print-scorecard">Print</button>
          <button class="primary-btn" data-action="go-home">Dashboard</button>
        </div>
      </div>

      <section class="result-layout">
        <article class="result-card">
          <div>
            <p class="eyebrow">Summary</p>
            <h3>${result.score} / ${result.total}</h3>
            <p class="status-line">
              ${result.message}
            </p>
          </div>

          <div class="score-grid">
            <div class="score-box">
              Percentage
              <strong>${result.percentage}%</strong>
            </div>
            <div class="score-box">
              Accuracy
              <strong>${result.accuracy}%</strong>
            </div>
            <div class="score-box">
              Correct
              <strong>${result.correct}</strong>
            </div>
            <div class="score-box">
              Incorrect
              <strong>${result.incorrect}</strong>
            </div>
            <div class="score-box">
              Unattempted
              <strong>${result.unattempted}</strong>
            </div>
            <div class="score-box">
              Time Used
              <strong>${result.timeSpent}</strong>
            </div>
          </div>
        </article>

        <aside class="result-card">
          <p class="eyebrow">Tip</p>
          <h3>Next Step</h3>
          <p>${result.tip}</p>
          <div class="history-list">
            <div class="history-item">
              <div>
                <strong>Type</strong>
                <span>${result.modeLabel}</span>
              </div>
              <span class="tag">${result.chapterOrYear}</span>
            </div>
            <div class="history-item">
              <div>
                <strong>Marked</strong>
                <span>${result.reviewCount} questions</span>
              </div>
              <span class="tag">${result.subjectName}</span>
            </div>
          </div>
        </aside>
      </section>

      <section class="result-card">
        <div class="section-head">
          <div>
            <p class="eyebrow">Review</p>
            <h3>Answers</h3>
          </div>
        </div>
        <div class="review-grid">
          ${result.review.map((item, index) => `
            <article class="review-item ${item.isCorrect ? "correct" : "incorrect"}">
              <strong>Q${index + 1}. ${item.question}</strong>
              <p>Your: <span class="accent-text">${item.userAnswer}</span></p>
              <p>Correct: <span class="accent-text">${item.correctAnswer}</span></p>
            </article>
          `).join("")}
        </div>
      </section>
    </section>
  `;
}

function renderHistoryItem(item) {
  return `
    <article class="history-item">
      <div>
        <strong>${item.title}</strong>
        <span>${item.subjectName} • ${item.modeLabel}</span>
      </div>
      <span class="tag">${item.score}/${item.total} • ${item.percentage}%</span>
    </article>
  `;
}

function handleClick(event) {
  if (event.target === authModal) {
    authModal.classList.add("hidden");
    return;
  }

  const button = event.target.closest("[data-action]");
  if (!button) {
    return;
  }

  const { action } = button.dataset;

  if (action === "open-auth") {
    openAuthModal(button.dataset.mode || "login", "manual");
    render();
    return;
  }

  if (action === "close-auth") {
    authModal.classList.add("hidden");
    return;
  }

  if (action === "switch-auth-mode") {
    openAuthModal(button.dataset.mode || "login", state.authContext);
    render();
    return;
  }

  if (action === "resend-auth-otp") {
    void resendAuthOtp();
    return;
  }

  if (action === "logout") {
    clearAuthSession();
    render();
    return;
  }

  if (action === "toggle-theme") {
    state.theme = state.theme === "night" ? "day" : "night";
    window.localStorage.setItem(STORAGE_KEYS.theme, state.theme);
    render();
    return;
  }

  if (action === "open-flow") {
    if (!state.profile) {
      state.pendingFlow = button.dataset.flow;
      openAuthModal("login", "start-tests");
      state.authStatus = {
        type: "error",
        text: "Login is required before you can start a mock test or PYQ set."
      };
      render();
      return;
    }

    state.flow = button.dataset.flow;
    state.selectedSubject = null;
    state.screen = "subject-list";
    render();
    return;
  }

  if (action === "choose-subject") {
    state.selectedSubject = button.dataset.subject;
    state.screen = "catalog-detail";
    render();
    return;
  }

  if (action === "go-home") {
    if (state.screen === "test") {
      const wantsToExit = window.confirm("Exit the live test now? Your current answers will not be saved.");
      if (!wantsToExit) {
        return;
      }
    }

    stopTimer();
    state.screen = "dashboard";
    render();
    return;
  }

  if (action === "go-back-subjects") {
    state.screen = "subject-list";
    render();
    return;
  }

  if (action === "start-pyq") {
    startTest(buildPyqTest(state.selectedSubject, button.dataset.year));
    return;
  }

  if (action === "start-chapter-test") {
    startTest(buildChapterTest(state.selectedSubject, button.dataset.chapter));
    return;
  }

  if (action === "select-option") {
    const optionIndex = Number(button.dataset.option);
    state.answers[state.currentQuestionIndex] = optionIndex;
    state.seenQuestions[state.currentQuestionIndex] = true;
    render();
    return;
  }

  if (action === "prev-question") {
    state.currentQuestionIndex = Math.max(0, state.currentQuestionIndex - 1);
    state.seenQuestions[state.currentQuestionIndex] = true;
    render();
    return;
  }

  if (action === "next-question") {
    state.currentQuestionIndex = Math.min(state.currentTest.questions.length - 1, state.currentQuestionIndex + 1);
    state.seenQuestions[state.currentQuestionIndex] = true;
    render();
    return;
  }

  if (action === "clear-answer") {
    delete state.answers[state.currentQuestionIndex];
    render();
    return;
  }

  if (action === "toggle-review") {
    state.reviewFlags[state.currentQuestionIndex] = !state.reviewFlags[state.currentQuestionIndex];
    render();
    return;
  }

  if (action === "jump-question") {
    state.currentQuestionIndex = Number(button.dataset.index);
    state.seenQuestions[state.currentQuestionIndex] = true;
    render();
    return;
  }

  if (action === "submit-test") {
    const wantsToSubmit = window.confirm("Submit the test and generate the scorecard?");
    if (!wantsToSubmit) {
      return;
    }

    submitCurrentTest();
    return;
  }

  if (action === "retry-test") {
    if (state.currentTest) {
      startTest({
        ...state.currentTest,
        questions: state.currentTest.questions.map((item) => ({ ...item }))
      });
    }
    return;
  }

  if (action === "print-scorecard") {
    window.print();
  }
}

function handleChange(event) {
  if (event.target.id === "authModal") {
    authModal.classList.add("hidden");
  }
}

function startTest(testConfig) {
  stopTimer();

  state.currentTest = testConfig;
  state.currentQuestionIndex = 0;
  state.answers = {};
  state.reviewFlags = {};
  state.seenQuestions = { 0: true };
  state.timeLeft = testConfig.duration;
  state.lastResult = null;
  state.screen = "test";

  state.timerId = window.setInterval(() => {
    state.timeLeft -= 1;
    if (state.timeLeft <= 0) {
      submitCurrentTest();
      return;
    }

    const timeBadge = document.querySelector(".mini-badge");
    if (timeBadge && state.screen === "test") {
      timeBadge.textContent = `Time: ${formatTime(state.timeLeft)}`;
    }
  }, 1000);

  render();
}

function buildChapterTest(subjectId, chapterName) {
  const subject = getSubject(subjectId);
  return {
    id: `${subjectId}-${chapterName}`,
    mode: "mock",
    modeLabel: "Mock",
    subjectId,
    subjectName: subject.name,
    chapterOrYear: chapterName,
    title: `${subject.name} • ${chapterName}`,
    duration: SUBJECT_DURATION.mock,
    questions: CHAPTER_BANK[subjectId][chapterName].map((item) => ({ ...item }))
  };
}

function buildPyqTest(subjectId, year) {
  const subject = getSubject(subjectId);
  const pool = SUBJECT_CHAPTERS[subjectId].flatMap((chapter) => CHAPTER_BANK[subjectId][chapter]);
  const questions = shuffle(pool).slice(0, 20).map((item) => ({ ...item }));

  return {
    id: `${subjectId}-pyq-${year}`,
    mode: "pyq",
    modeLabel: "PYQ",
    subjectId,
    subjectName: subject.name,
    chapterOrYear: `PYQ ${year}`,
    title: `${subject.name} PYQ ${year}`,
    duration: SUBJECT_DURATION.pyq,
    questions
  };
}

function submitCurrentTest() {
  if (!state.currentTest) {
    return;
  }

  stopTimer();

  const review = state.currentTest.questions.map((question, index) => {
    const userAnswerIndex = state.answers[index];
    const isAnswered = Number.isInteger(userAnswerIndex);
    const isCorrect = isAnswered && userAnswerIndex === question.answer;

    return {
      question: question.question,
      userAnswer: isAnswered ? `${String.fromCharCode(65 + userAnswerIndex)}. ${question.options[userAnswerIndex]}` : "Not Answered",
      correctAnswer: `${String.fromCharCode(65 + question.answer)}. ${question.options[question.answer]}`,
      explanation: question.explanation,
      isCorrect
    };
  });

  const correct = review.filter((item) => item.isCorrect).length;
  const attempted = Object.keys(state.answers).length;
  const incorrect = attempted - correct;
  const unattempted = state.currentTest.questions.length - attempted;
  const score = correct;
  const total = state.currentTest.questions.length;
  const percentage = Math.round((score / total) * 100);
  const accuracy = attempted ? Math.round((correct / attempted) * 100) : 0;
  const timeSpentSeconds = state.currentTest.duration - state.timeLeft;
  const reviewCount = Object.values(state.reviewFlags).filter(Boolean).length;
  const studentName = state.profile?.name || "Student";

  const result = {
    id: `${state.currentTest.id}-${Date.now()}`,
    studentName,
    title: state.currentTest.title,
    subjectName: state.currentTest.subjectName,
    chapterOrYear: state.currentTest.chapterOrYear,
    modeLabel: state.currentTest.modeLabel,
    score,
    total,
    correct,
    incorrect,
    unattempted,
    percentage,
    accuracy,
    timeSpent: formatTime(timeSpentSeconds),
    reviewCount,
    review,
    submittedAt: new Date().toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }),
    message: getPerformanceMessage(percentage),
    tip: getPerformanceTip(percentage),
    mode: state.currentTest.mode
  };

  state.lastResult = result;
  state.history = [result, ...state.history].slice(0, 12);
  saveJSON(getHistoryStorageKey(state.profile?.email || "guest"), state.history);
  state.screen = "result";
  render();
}

function getPerformanceMessage(percentage) {
  if (percentage >= 80) {
    return "Great score.";
  }

  if (percentage >= 60) {
    return "Good progress.";
  }

  return "Keep practicing.";
}

function getPerformanceTip(percentage) {
  if (percentage >= 80) {
    return "Try another subject.";
  }

  if (percentage >= 60) {
    return "Review wrong answers.";
  }

  return "Revise and retry.";
}

function getPaletteClass(index) {
  if (index === state.currentQuestionIndex) {
    return "current";
  }

  if (state.reviewFlags[index]) {
    return "review";
  }

  if (Number.isInteger(state.answers[index])) {
    return "answered";
  }

  if (state.seenQuestions[index]) {
    return "skipped";
  }

  return "unseen";
}

function updateStudentChip() {
  if (state.profile?.name) {
    studentChip.textContent = `${state.profile.name} • ${state.profile.goal}`;
    return;
  }

  studentChip.textContent = "";
}

function renderHeaderAuthButtons() {
  if (state.profile) {
    headerAuthButtons.innerHTML = `
      <button class="ghost-btn theme-toggle" data-action="toggle-theme">${state.theme === "night" ? "Day" : "Night"}</button>
      <button class="ghost-btn" data-action="logout">Logout</button>
    `;
    return;
  }

  headerAuthButtons.innerHTML = `
    <button class="ghost-btn theme-toggle" data-action="toggle-theme">${state.theme === "night" ? "Day" : "Night"}</button>
    <button class="ghost-btn" data-action="open-auth" data-mode="login">Login</button>
    <button class="primary-btn" data-action="open-auth" data-mode="signup">Sign Up</button>
  `;
}

function renderAuthModal() {
  const isSignup = state.authMode === "signup";
  const isOtpStep = state.authStep === "otp";

  authTitle.textContent = isOtpStep
    ? "Enter OTP"
    : isSignup
      ? "Sign Up"
      : "Login";

  authSubtitle.textContent = isOtpStep
    ? `Sent to ${state.authPendingEmail}.`
    : isSignup
      ? "Create your account."
      : "Use email and password.";

  authForm.innerHTML = renderAuthFormMarkup();
}

function renderLoader() {
  const isBusy = state.isBootstrapping || state.isAuthenticating;
  loaderOverlay.classList.toggle("hidden", !isBusy);
  loaderTitle.textContent = state.busyTitle;
  loaderMessage.textContent = state.busyMessage;
}

function renderAuthFormMarkup() {
  const isSignup = state.authMode === "signup";
  const isOtpStep = state.authStep === "otp";
  const submitLabel = state.isAuthenticating
    ? isOtpStep
      ? "Checking..."
      : "Sending OTP..."
    : isOtpStep
      ? "Verify OTP"
      : isSignup
        ? "Send OTP"
        : "Send OTP";

  const feedback = state.authStatus
    ? `<div class="auth-feedback ${state.authStatus.type}">${state.authStatus.text}</div>`
    : "";

  if (isOtpStep) {
    return `
      ${feedback}
      <div class="auth-otp-display">
        <strong>${state.authPendingEmail}</strong>
      </div>
      <label>
        Enter OTP
        <input type="text" id="authOtp" inputmode="numeric" maxlength="6" placeholder="6-digit OTP" value="${escapeHtml(state.authDraft.otp)}" required />
      </label>
      <p class="auth-note">The OTP must match the same mail ID used for this ${isSignup ? "signup" : "login"} request.</p>
      <div class="auth-actions">
        <button type="submit" class="primary-btn full-width">${submitLabel}</button>
        <button type="button" class="ghost-btn full-width" data-action="resend-auth-otp">Resend OTP</button>
      </div>
      <p class="auth-swap">
        Need to change details?
        <button type="button" data-action="switch-auth-mode" data-mode="${state.authMode}">Go Back</button>
      </p>
    `;
  }

  return `
    ${feedback}
    ${isSignup ? `
      <label>
        Name
        <input type="text" id="authName" placeholder="Your name" value="${escapeHtml(state.authDraft.name)}" required />
      </label>
      <label>
        Goal
        <input type="text" id="authGoal" placeholder="Example: Polytechnic 2026" value="${escapeHtml(state.authDraft.goal)}" required />
      </label>
    ` : ""}
    <label>
      Email
      <input type="email" id="authEmail" placeholder="Enter your email" value="${escapeHtml(state.authDraft.email)}" required />
    </label>
    <label>
      Password
      <input type="password" id="authPassword" placeholder="Minimum 8 characters" value="${escapeHtml(state.authDraft.password)}" required />
    </label>
    <div class="auth-actions">
      <button type="submit" class="primary-btn full-width">${submitLabel}</button>
    </div>
    <p class="auth-swap">
      ${isSignup ? "Have an account?" : "New?"}
      <button type="button" data-action="switch-auth-mode" data-mode="${isSignup ? "login" : "signup"}">
        ${isSignup ? "Login" : "Sign Up"}
      </button>
    </p>
  `;
}

function getSubject(subjectId) {
  return SUBJECTS.find((subject) => subject.id === subjectId);
}

async function handleSubmit(event) {
  if (event.target.id !== "authForm") {
    return;
  }

  event.preventDefault();

  if (state.isAuthenticating) {
    return;
  }

  if (state.authStep === "otp") {
    if (state.authMode === "signup") {
      await verifySignupOtp();
      return;
    }

    await verifyLoginOtp();
    return;
  }

  if (state.authMode === "signup") {
    await requestSignupOtp();
    return;
  }

  await requestLoginOtp();
}

function handleInput(event) {
  const { id, value } = event.target;

  if (id === "authName") {
    state.authDraft.name = value;
  }

  if (id === "authGoal") {
    state.authDraft.goal = value;
  }

  if (id === "authEmail") {
    state.authDraft.email = value;
  }

  if (id === "authPassword") {
    state.authDraft.password = value;
  }

  if (id === "authOtp") {
    state.authDraft.otp = value.replace(/\D/g, "").slice(0, 6);
    event.target.value = state.authDraft.otp;
  }
}

async function bootstrap() {
  state.isBootstrapping = true;
  state.busyTitle = "Launching dashboard...";
  state.busyMessage = "Checking your saved session and loading your student workspace.";
  render();
  if (state.token) {
    try {
      const response = await apiRequest("/auth/me", {
        method: "GET",
        token: state.token
      });
      state.profile = response.user;
      state.history = loadJSON(getHistoryStorageKey(state.profile.email), []);
    } catch (error) {
      clearAuthSession();
    }
  }

  state.isBootstrapping = false;
  state.busyTitle = "Loading platform...";
  state.busyMessage = "Preparing your dashboard.";
  render();
}

function openAuthModal(mode, context = "manual") {
  state.authMode = mode;
  state.authStep = "credentials";
  state.authContext = context;
  state.authPendingEmail = "";
  state.authPendingExpiresAt = "";
  state.authDraft.otp = "";
  state.authStatus = null;
  authModal.classList.remove("hidden");
}

function closeAuthModal() {
  authModal.classList.add("hidden");
  state.authStatus = null;
  state.authStep = "credentials";
  state.authPendingEmail = "";
  state.authPendingExpiresAt = "";
  state.authDraft.otp = "";
}

function clearAuthSession() {
  state.token = null;
  state.profile = null;
  state.history = loadJSON(getHistoryStorageKey("guest"), []);
  state.pendingFlow = null;
  window.localStorage.removeItem(STORAGE_KEYS.token);
}

function applyTheme() {
  document.documentElement.dataset.theme = state.theme;
}

async function requestSignupOtp() {
  const payload = {
    name: state.authDraft.name.trim(),
    email: state.authDraft.email.trim().toLowerCase(),
    goal: state.authDraft.goal.trim(),
    password: state.authDraft.password
  };

  if (!payload.name || !payload.email || !payload.goal || !payload.password) {
    state.authStatus = { type: "error", text: "Fill in all signup fields before requesting OTP." };
    render();
    return;
  }

  await runAuthRequest(async () => {
    const response = await apiRequest("/auth/signup/request-otp", {
      method: "POST",
      body: payload
    });

    state.authStep = "otp";
    state.authPendingEmail = payload.email;
    state.authPendingExpiresAt = response.expiresAt;
    state.authDraft.email = payload.email;
    state.authDraft.otp = "";
    state.authStatus = {
      type: "success",
      text: buildOtpStatusMessage("Signup OTP sent successfully.", payload.email, response.previewOtp)
    };
  });
}

async function requestLoginOtp() {
  const payload = {
    email: state.authDraft.email.trim().toLowerCase(),
    password: state.authDraft.password
  };

  if (!payload.email || !payload.password) {
    state.authStatus = { type: "error", text: "Enter your email and password before requesting OTP." };
    render();
    return;
  }

  await runAuthRequest(async () => {
    const response = await apiRequest("/auth/login/request-otp", {
      method: "POST",
      body: payload
    });

    state.authStep = "otp";
    state.authPendingEmail = payload.email;
    state.authPendingExpiresAt = response.expiresAt;
    state.authDraft.email = payload.email;
    state.authDraft.otp = "";
    state.authStatus = {
      type: "success",
      text: buildOtpStatusMessage("Login OTP sent successfully.", payload.email, response.previewOtp)
    };
  });
}

async function verifySignupOtp() {
  const payload = {
    email: state.authPendingEmail,
    otp: state.authDraft.otp.trim()
  };

  if (payload.otp.length !== 6) {
    state.authStatus = { type: "error", text: "Enter the full 6-digit OTP." };
    render();
    return;
  }

  await runAuthRequest(async () => {
    const response = await apiRequest("/auth/signup/verify", {
      method: "POST",
      body: payload
    });
    finishAuth(response);
  });
}

async function verifyLoginOtp() {
  const payload = {
    email: state.authPendingEmail,
    otp: state.authDraft.otp.trim()
  };

  if (payload.otp.length !== 6) {
    state.authStatus = { type: "error", text: "Enter the full 6-digit OTP." };
    render();
    return;
  }

  await runAuthRequest(async () => {
    const response = await apiRequest("/auth/login/verify", {
      method: "POST",
      body: payload
    });
    finishAuth(response);
  });
}

async function resendAuthOtp() {
  if (state.authMode === "signup") {
    await requestSignupOtp();
    return;
  }

  await requestLoginOtp();
}

async function runAuthRequest(task) {
  state.isAuthenticating = true;
  state.busyTitle = state.authStep === "otp" ? "Verifying OTP..." : "Processing request...";
  state.busyMessage = state.authMode === "signup"
    ? "Connecting your account setup with the OTP system."
    : "Securing your login and preparing the next step.";
  render();
  try {
    await task();
  } catch (error) {
    state.authStatus = {
      type: "error",
      text: error instanceof Error ? error.message : "Authentication request failed."
    };
  } finally {
    state.isAuthenticating = false;
    state.busyTitle = "Loading platform...";
    state.busyMessage = "Preparing your dashboard.";
    render();
  }
}

function finishAuth(response) {
  state.token = response.token;
  state.profile = response.user;
  state.history = loadJSON(getHistoryStorageKey(state.profile.email), []);
  window.localStorage.setItem(STORAGE_KEYS.token, response.token);
  closeAuthModal();

  if (state.pendingFlow) {
    state.flow = state.pendingFlow;
    state.selectedSubject = null;
    state.screen = "subject-list";
    state.pendingFlow = null;
  } else {
    state.screen = "dashboard";
  }
}

function buildOtpStatusMessage(prefix, email, previewOtp) {
  const previewText = previewOtp ? ` Dev OTP: ${previewOtp}.` : "";
  return `${prefix} Check ${email}.${previewText}`;
}

async function apiRequest(path, options = {}) {
  let response;

  try {
    response = await window.fetch(`${API_BASE_URL}${path}`, {
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {})
      },
      body: options.body ? JSON.stringify(options.body) : undefined
    });
  } catch (error) {
    throw new Error("Unable to connect to the local backend. Make sure the server is running.");
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Request failed.");
  }

  return data;
}

function getHistoryStorageKey(email) {
  return `${STORAGE_KEYS.historyPrefix}:${String(email || "guest").toLowerCase()}`;
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function loadJSON(key, fallbackValue) {
  try {
    const rawValue = window.localStorage.getItem(key);
    return rawValue ? JSON.parse(rawValue) : fallbackValue;
  } catch (error) {
    return fallbackValue;
  }
}

function saveJSON(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

function formatTime(totalSeconds) {
  const safeSeconds = Math.max(0, totalSeconds);
  const minutes = String(Math.floor(safeSeconds / 60)).padStart(2, "0");
  const seconds = String(safeSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function stopTimer() {
  if (state.timerId) {
    window.clearInterval(state.timerId);
    state.timerId = null;
  }
}

function shuffle(items) {
  const clone = [...items];
  for (let index = clone.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [clone[index], clone[swapIndex]] = [clone[swapIndex], clone[index]];
  }
  return clone;
}
