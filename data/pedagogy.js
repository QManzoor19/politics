// Pedagogical scaffolding per lesson.
// Each entry can include: hook, objectives, prerequisites, transfer, bloomsLadder, tags.
// The app's lesson renderer reads this automatically and inserts the scaffolding around the lesson body.

const pedagogy = {

  "Politics, Power, and the State": {
    hook: "Almost every minute of your day is shaped by political decisions — the speed limit on your street, the tax in your coffee, the law that says you can read this. So why does \"politics\" usually mean the few minutes a year you spend voting? What's the rest?",
    objectives: [
      "Define politics in three contrasting ways (Lasswell, Aristotle, Schmitt) and explain what each definition captures",
      "Distinguish the three faces of power: decision-making, agenda-setting, and preference-shaping",
      "State Weber's definition of the state and identify its four core features",
      "Distinguish a state from a nation and explain why most states are not true nation-states",
      "Compare the Hobbesian, Lockean, and Marxist accounts of why the state exists"
    ],
    prerequisites: [],
    transfer: "Pick any institution you belong to — a school, a workplace, a sports team, a group chat. Identify one example of each face of power inside it (a decision, an agenda kept off the table, a preference that was shaped). Whose interests does each one serve?",
    bloomsLadder: {
      remember: "List the four components of a state in Weber's definition.",
      understand: "Explain in your own words why agenda-setting is sometimes more powerful than decision-making.",
      apply: "A company quietly fires its DEI committee while announcing record profits. Identify which face of power is operating and why.",
      analyse: "Compare how Hobbes, Locke, and Marx would each interpret a government using force to break up a protest.",
      evaluate: "Assess the claim 'social media platforms are now sovereign states.' Use Weber's four features to argue for or against.",
      create: "Draft a 200-word definition of politics that you'd defend in an argument — and list one objection it has to answer."
    },
    tags: ["Foundation", "Power & Authority", "Career: Any Field"]
  },

};

// ═══════════════════════════════════════════════════════
// Bloom's level metadata — used by the lesson renderer
// to color and label the thinking-ladder steps.
// ═══════════════════════════════════════════════════════
const bloomsLevels = [
  { id: 'remember',   label: 'Remember',   color: '#e05a5a', icon: '📝', desc: 'Recall facts and basic concepts' },
  { id: 'understand', label: 'Understand', color: '#e8893c', icon: '💡', desc: 'Explain ideas and concepts' },
  { id: 'apply',      label: 'Apply',      color: '#f5c842', icon: '🔧', desc: 'Use information in new situations' },
  { id: 'analyse',    label: 'Analyse',    color: '#4ade80', icon: '🔍', desc: 'Draw connections among ideas' },
  { id: 'evaluate',   label: 'Evaluate',   color: '#5ac8c8', icon: '⚖️', desc: 'Justify a position or decision' },
  { id: 'create',     label: 'Create',     color: '#c07de0', icon: '🎨', desc: 'Produce new or original work' }
];
