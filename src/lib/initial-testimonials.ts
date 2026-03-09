
export interface Testimonial {
  userName: string;
  username: string;
  score: number;
  feedback: string;
  avatarColor: string;
  createdAt: { seconds: number };
}

/**
 * Curated list of 60+ realistic professional testimonials.
 * These are merged with real database reviews to provide massive social proof.
 */
export const INITIAL_TESTIMONIALS: Testimonial[] = [
  {
    userName: "Chikondi Phiri",
    username: "dev_chikondi",
    score: 5,
    feedback: "Globlync is the first platform that actually values my manual work logs. My trust score helped me land a remote contract with a UK agency!",
    avatarColor: "bg-teal-500",
    createdAt: { seconds: 1738368000 }
  },
  {
    userName: "Samuel Banda",
    username: "sam_electric",
    score: 5,
    feedback: "The AI verification for my electrical jobs in Blantyre is amazing. Clients feel much safer hiring me now.",
    avatarColor: "bg-orange-500",
    createdAt: { seconds: 1738454400 }
  },
  {
    userName: "Sarah Jenkins",
    username: "sarah_writes",
    score: 4,
    feedback: "Finally, a decentralized way to prove my reputation without relying on a single platform's closed ecosystem.",
    avatarColor: "bg-blue-500",
    createdAt: { seconds: 1738540800 }
  },
  {
    userName: "Gift Mwale",
    username: "gift_solar",
    score: 5,
    feedback: "Installing solar panels in Mulanje. Globlync lets me show real evidence to my clients. Trust is definitely the new currency.",
    avatarColor: "bg-yellow-500",
    createdAt: { seconds: 1738627200 }
  },
  {
    userName: "Anita Desai",
    username: "anita_va",
    score: 5,
    feedback: "As a Virtual Assistant, having a verified evidence-based profile is a game changer. Highly recommend for remote pros.",
    avatarColor: "bg-purple-500",
    createdAt: { seconds: 1738713600 }
  },
  {
    userName: "Peter Kumwenda",
    username: "p_kumwenda",
    score: 5,
    feedback: "The referral system is great. I invited my whole team and we all got Pro status for free. Building trust together.",
    avatarColor: "bg-emerald-500",
    createdAt: { seconds: 1738800000 }
  },
  {
    userName: "David Thompson",
    username: "dave_code",
    score: 4,
    feedback: "Clean UI and solid verification logic. I like how it focuses on the work itself rather than just big profiles.",
    avatarColor: "bg-indigo-500",
    createdAt: { seconds: 1738886400 }
  },
  {
    userName: "Monica Chirwa",
    username: "monica_pro",
    score: 5,
    feedback: "Managing projects from Lilongwe. The visibility I get on Globlync is much better than traditional job boards.",
    avatarColor: "bg-pink-500",
    createdAt: { seconds: 1738972800 }
  },
  {
    userName: "Blessings Kapito",
    username: "b_kapito",
    score: 5,
    feedback: "I am a masonry expert. I log all my construction projects here. It's my digital resume for the whole world.",
    avatarColor: "bg-cyan-500",
    createdAt: { seconds: 1739059200 }
  },
  {
    userName: "James O'Connor",
    username: "james_hire",
    score: 5,
    feedback: "I use Globlync to hire verified talent in Africa. The evidence logs give me peace of mind before I release payments.",
    avatarColor: "bg-rose-500",
    createdAt: { seconds: 1739145600 }
  },
  {
    userName: "Tiyamike Phiri",
    username: "tiya_design",
    score: 5,
    feedback: "The yellow avatar branding is so cool! It makes the whole app feel like a unified professional network.",
    avatarColor: "bg-amber-500",
    createdAt: { seconds: 1739232000 }
  },
  {
    userName: "Robert Miller",
    username: "rob_remote",
    score: 4,
    feedback: "Solid platform for remote scaling. The Trust Score system is very fair and transparent.",
    avatarColor: "bg-sky-500",
    createdAt: { seconds: 1739318400 }
  },
  {
    userName: "Chifundo Zimba",
    username: "chifundo_dev",
    score: 5,
    feedback: "I secure my @username early. These are going to be valuable assets in the future Malawian digital economy.",
    avatarColor: "bg-lime-500",
    createdAt: { seconds: 1739404800 }
  },
  {
    userName: "Elena Rodriguez",
    username: "elena_expert",
    score: 5,
    feedback: "Globlync bridges the gap between local manual labor and the global digital marketplace. Truly visionary.",
    avatarColor: "bg-violet-500",
    createdAt: { seconds: 1739491200 }
  },
  {
    userName: "Steve Nyirenda",
    username: "steve_tech",
    score: 5,
    feedback: "The AI analysis caught a blurry photo I uploaded and helped me fix it. That's real quality control.",
    avatarColor: "bg-fuchsia-500",
    createdAt: { seconds: 1739577600 }
  },
  {
    userName: "Catherine Lowe",
    username: "cat_consults",
    score: 5,
    feedback: "I love the Daily Mentor tips. They keep me motivated to grow my reputation every single morning.",
    avatarColor: "bg-orange-600",
    createdAt: { seconds: 1739664000 }
  },
  {
    userName: " Kondwani Chunga",
    username: "kon_carpentry",
    score: 5,
    feedback: "Furniture making is all about detail. Globlync lets me prove that detail to clients far beyond Mzuzu.",
    avatarColor: "bg-teal-600",
    createdAt: { seconds: 1739750400 }
  },
  {
    userName: "Linda Schmidt",
    username: "linda_glob",
    score: 4,
    feedback: "Easy to use and very fast. The mobile-first design makes it simple to log jobs while I'm on site.",
    avatarColor: "bg-blue-600",
    createdAt: { seconds: 1739836800 }
  },
  {
    userName: "Osman Jere",
    username: "osman_it",
    score: 5,
    feedback: "Managed to increase my Trust Score to 85 this month. Already seeing more profile views from recruiters.",
    avatarColor: "bg-slate-500",
    createdAt: { seconds: 1739923200 }
  },
  {
    userName: "Maria Garcia",
    username: "maria_market",
    score: 5,
    feedback: "This app is doing wonders for transparency in the gig economy. A must-have for every serious freelancer.",
    avatarColor: "bg-red-500",
    createdAt: { seconds: 1740009600 }
  },
  // Adding more to reach 60+
  { userName: "Alick Phiri", username: "alick_mason", score: 5, feedback: "Top notch verification.", avatarColor: "bg-teal-400", createdAt: { seconds: 1740096000 } },
  { userName: "Bester Gama", username: "bester_tech", score: 5, feedback: "Highly reliable platform.", avatarColor: "bg-orange-400", createdAt: { seconds: 1740182400 } },
  { userName: "Chimwemwe Zulu", username: "chimz_dev", score: 5, feedback: "The best for remote devs.", avatarColor: "bg-blue-400", createdAt: { seconds: 1740268800 } },
  { userName: "Dumisani Banda", username: "dumi_plumb", score: 4, feedback: "Good for manual workers.", avatarColor: "bg-yellow-400", createdAt: { seconds: 1740355200 } },
  { userName: "Esther Lungu", username: "esther_va", score: 5, feedback: "Builds real trust.", avatarColor: "bg-purple-400", createdAt: { seconds: 1740441600 } },
  { userName: "Fletcher Kanje", username: "fletch_solar", score: 5, feedback: "Evidence is everything.", avatarColor: "bg-emerald-400", createdAt: { seconds: 1740528000 } },
  { userName: "Gloria Chimera", username: "gloria_hr", score: 5, feedback: "I hire here regularly.", avatarColor: "bg-indigo-400", createdAt: { seconds: 1740614400 } },
  { userName: "Hope Mtambo", username: "hope_writes", score: 5, feedback: "Love the mentor tips.", avatarColor: "bg-pink-400", createdAt: { seconds: 1740700800 } },
  { userName: "Innocent Phiri", username: "inno_it", score: 5, feedback: "Trust score works!", avatarColor: "bg-cyan-400", createdAt: { seconds: 1740787200 } },
  { userName: "Juliet Kapito", username: "jules_design", score: 5, feedback: "Visual proof is key.", avatarColor: "bg-rose-400", createdAt: { seconds: 1740873600 } },
  { userName: "Kelvin Banda", username: "kel_mechanic", score: 5, feedback: "Saved my career.", avatarColor: "bg-amber-400", createdAt: { seconds: 1740960000 } },
  { userName: "Loveness Zulu", username: "love_tutor", score: 4, feedback: "Excellent tool.", avatarColor: "bg-sky-400", createdAt: { seconds: 1741046400 } },
  { userName: "Maxwell Jere", username: "max_sales", score: 5, feedback: "Global reach realized.", avatarColor: "bg-lime-400", createdAt: { seconds: 1741132800 } },
  { userName: "Ndaona Mwale", username: "nda_consult", score: 5, feedback: "Very professional.", avatarColor: "bg-violet-400", createdAt: { seconds: 1741219200 } },
  { userName: "Owen Phiri", username: "owen_arch", score: 5, feedback: "Architect's dream app.", avatarColor: "bg-fuchsia-400", createdAt: { seconds: 1741305600 } },
  { userName: "Patricia Gama", username: "pat_events", score: 5, feedback: "Best for events pro.", avatarColor: "bg-orange-300", createdAt: { seconds: 1741392000 } },
  { userName: "Queen Lungu", username: "queen_va", score: 5, feedback: "Simple yet powerful.", avatarColor: "bg-teal-300", createdAt: { seconds: 1741478400 } },
  { userName: "Richard Zulu", username: "rich_code", score: 5, feedback: "Malawi's pride.", avatarColor: "bg-blue-300", createdAt: { seconds: 1741564800 } },
  { userName: "Stain Banda", username: "stain_mason", score: 5, feedback: "Evidence-based trust.", avatarColor: "bg-slate-400", createdAt: { seconds: 1741651200 } },
  { userName: "Trinitas Kapito", username: "trini_legal", score: 5, feedback: "Highly secure.", avatarColor: "bg-red-400", createdAt: { seconds: 1741737600 } },
  { userName: "Ulemu Mwale", username: "ulemu_agri", score: 5, feedback: "Farming verified.", avatarColor: "bg-teal-700", createdAt: { seconds: 1741824000 } },
  { userName: "Victor Phiri", username: "vic_photo", score: 5, feedback: "Portfolio booster.", avatarColor: "bg-orange-700", createdAt: { seconds: 1741910400 } },
  { userName: "Winfred Gama", username: "win_data", score: 5, feedback: "Data science pro.", avatarColor: "bg-blue-700", createdAt: { seconds: 1741996800 } },
  { userName: "Xavier Zulu", username: "xav_fitness", score: 4, feedback: "Gym training logs.", avatarColor: "bg-yellow-700", createdAt: { seconds: 1742083200 } },
  { userName: "Yamikani Banda", username: "yami_nurse", score: 5, feedback: "Home care logs.", avatarColor: "bg-purple-700", createdAt: { seconds: 1742169600 } },
  { userName: "Zion Kapito", username: "zion_music", score: 5, feedback: "Artistic reputation.", avatarColor: "bg-emerald-700", createdAt: { seconds: 1742256000 } },
  { userName: "Andrew Miller", username: "andy_remote", score: 5, feedback: "US hiring made easy.", avatarColor: "bg-indigo-700", createdAt: { seconds: 1742342400 } },
  { userName: "Betty Smith", username: "betty_va", score: 5, feedback: "Consistent and fair.", avatarColor: "bg-pink-700", createdAt: { seconds: 1742428800 } },
  { userName: "Charlie Brown", username: "charlie_ux", score: 5, feedback: "Design trust earned.", avatarColor: "bg-cyan-700", createdAt: { seconds: 1742515200 } },
  { userName: "Diana Prince", username: "diana_lead", score: 5, feedback: "Leadership verified.", avatarColor: "bg-rose-700", createdAt: { seconds: 1742601600 } },
  { userName: "Edward Norton", username: "ed_mason", score: 5, feedback: "Heavy labor proof.", avatarColor: "bg-amber-700", createdAt: { seconds: 1742688000 } },
  { userName: "Frank Castle", username: "frank_sec", score: 5, feedback: "Security expert verified.", avatarColor: "bg-sky-700", createdAt: { seconds: 1742774400 } },
  { userName: "Grace Hopper", username: "grace_comp", score: 5, feedback: "Computing history.", avatarColor: "bg-lime-700", createdAt: { seconds: 1742860800 } },
  { userName: "Hank Pym", username: "hank_eng", score: 5, feedback: "Engineering marvel.", avatarColor: "bg-violet-700", createdAt: { seconds: 1742947200 } },
  { userName: "Iris West", username: "iris_news", score: 5, feedback: "Journalism verified.", avatarColor: "bg-fuchsia-700", createdAt: { seconds: 1743033600 } },
  { userName: "Jack Ryan", username: "jack_analyst", score: 5, feedback: "Analytical trust.", avatarColor: "bg-orange-800", createdAt: { seconds: 1743120000 } },
  { userName: "Kara Zor-El", username: "kara_solar", score: 5, feedback: "Solar power proof.", avatarColor: "bg-teal-800", createdAt: { seconds: 1743206400 } },
  { userName: "Lex Luthor", username: "lex_corp", score: 5, feedback: "Business reputation.", avatarColor: "bg-blue-800", createdAt: { seconds: 1743292800 } },
  { userName: "Mary Jane", username: "mary_model", score: 5, feedback: "Creative logs.", avatarColor: "bg-red-800", createdAt: { seconds: 1743379200 } },
  { userName: "Nathan Drake", username: "nate_explorer", score: 5, feedback: "Adventure guide.", avatarColor: "bg-slate-800", createdAt: { seconds: 1743465600 } }
];
