// General politics curriculum — broad survey across US gov, ideologies, comparative systems, and key thinkers.
// Each unit groups related lessons; unit colors use the turquoise / cyan / deep-teal palette.

const units = [
  { label:"What Is Politics?", unitNum:1, gradient:"linear-gradient(135deg,#67e8f9,#2dd4bf)", shadow:"#053633",
    nodes:[
      {icon:"⚖️",name:"Politics, Power, and the State",sub:"What politics is, where power comes from, and why the state exists"},
      {icon:"📜",name:"Authority, Legitimacy, and Sovereignty",sub:"Why we obey: tradition, charisma, legal-rational, and consent"}
    ]},
  { label:"Political Thinkers", unitNum:2, gradient:"linear-gradient(135deg,#67e8f9,#0d9488)", shadow:"#053633",
    nodes:[
      {icon:"🐉",name:"Hobbes and the Social Contract",sub:"State of nature, the Leviathan, and security as the price of order"},
      {icon:"🌳",name:"Locke, Rousseau, and Consent",sub:"Natural rights, popular sovereignty, and the general will"},
      {icon:"🔧",name:"Marx and Critical Theory",sub:"Class, ideology, alienation, and historical materialism"},
      {icon:"⚖️",name:"Mill, Rawls, and Modern Liberalism",sub:"Liberty, harm, and justice as fairness"}
    ]},
  { label:"Ideologies", unitNum:3, gradient:"linear-gradient(135deg,#2dd4bf,#5eead4)", shadow:"#053633",
    nodes:[
      {icon:"🗽",name:"Liberalism",sub:"Individual rights, limited government, and rule of law"},
      {icon:"🏛️",name:"Conservatism",sub:"Tradition, order, gradual reform, and the limits of reason"},
      {icon:"☭",name:"Socialism and Communism",sub:"Equality, collective ownership, and the critique of capitalism"},
      {icon:"🚩",name:"Fascism and Authoritarianism",sub:"Ultranationalism, the leader principle, and total control"},
      {icon:"🌿",name:"Anarchism, Greens, and Populism",sub:"Anti-statism, ecology, and the people vs. the elite"}
    ]},
  { label:"Forms of Government", unitNum:4, gradient:"linear-gradient(135deg,#0d9488,#0a6963)", shadow:"#053633",
    nodes:[
      {icon:"🗳️",name:"Democracy: Direct and Representative",sub:"Liberal vs. illiberal democracy, majoritarian vs. consensus"},
      {icon:"👑",name:"Monarchy, Oligarchy, and Aristocracy",sub:"Rule by one, by the few, and by the well-born"},
      {icon:"🪖",name:"Authoritarian and Totalitarian Regimes",sub:"Dictatorships, single-party states, and personalist rule"},
      {icon:"🌐",name:"Hybrid Regimes and State Failure",sub:"Competitive authoritarianism, semi-democracies, and collapsed states"}
    ]},
  { label:"US Government", unitNum:5, gradient:"linear-gradient(135deg,#a5f3eb,#2dd4bf)", shadow:"#053633",
    nodes:[
      {icon:"📃",name:"The Constitution and Founding",sub:"Articles, Federalist Papers, ratification, and original design"},
      {icon:"🏛️",name:"Separation of Powers and Checks",sub:"Legislative, executive, judicial — Madison's machine"},
      {icon:"🇺🇸",name:"Federalism",sub:"Layer cake, marble cake: dividing power between nation and states"},
      {icon:"📰",name:"Civil Liberties and Civil Rights",sub:"Bill of Rights, incorporation, and the long fight for equal protection"}
    ]},
  { label:"Political Participation", unitNum:6, gradient:"linear-gradient(135deg,#67e8f9,#2dd4bf)", shadow:"#053633",
    nodes:[
      {icon:"🗳️",name:"Elections and Voting Behavior",sub:"Why people vote, how they choose, and what shapes turnout"},
      {icon:"🐘",name:"Parties and Party Systems",sub:"Two-party vs. multiparty, realignments, and party machinery"},
      {icon:"🎯",name:"Interest Groups and Lobbying",sub:"Pluralism, iron triangles, and the bias of organized voice"},
      {icon:"📡",name:"Media, Public Opinion, and Polarization",sub:"How information environments shape what publics believe"}
    ]},
  { label:"Comparative Politics", unitNum:7, gradient:"linear-gradient(135deg,#67e8f9,#0d9488)", shadow:"#053633",
    nodes:[
      {icon:"🇬🇧",name:"Parliamentary Systems: UK Case",sub:"Fusion of powers, PM, cabinet, Westminster model"},
      {icon:"🇷🇺",name:"Authoritarian Resilience: Russia and China",sub:"Hybrid regimes, party-state, and managed elections"},
      {icon:"🌎",name:"Developing Democracies: Mexico and Nigeria",sub:"Transitions, clientelism, and institutional fragility"},
      {icon:"☪️",name:"Theocracy: Iran",sub:"Religious authority, hybrid institutions, and the Supreme Leader"}
    ]},
  { label:"International Politics", unitNum:8, gradient:"linear-gradient(135deg,#2dd4bf,#0a6963)", shadow:"#053633",
    nodes:[
      {icon:"⚔️",name:"Realism and Liberalism in IR",sub:"Anarchy, balance of power, institutions, and cooperation"},
      {icon:"🤝",name:"International Organizations and Law",sub:"UN, EU, WTO, ICC — global governance and its limits"},
      {icon:"🌍",name:"Globalization, Inequality, and Migration",sub:"Trade, capital flows, and the politics of borders"},
      {icon:"💣",name:"War, Peace, and Nuclear Weapons",sub:"Deterrence, just war, terrorism, and humanitarian intervention"}
    ]},
  { label:"Current Debates", unitNum:9, gradient:"linear-gradient(135deg,#67e8f9,#0d9488,#0a6963)", shadow:"#053633",
    nodes:[
      {icon:"📊",name:"Democratic Backsliding",sub:"Why democracies die: erosion from within, not coups"},
      {icon:"🌡️",name:"Climate Politics",sub:"Collective action, the Paris regime, and intergenerational justice"},
      {icon:"🤖",name:"Technology, AI, and Power",sub:"Surveillance, platform governance, and algorithmic politics"},
      {icon:"🏳️‍🌈",name:"Identity, Recognition, and the Culture Wars",sub:"Multiculturalism, nationalism, and the politics of belonging"}
    ]},
];
