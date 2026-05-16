// Politics lessons.
// Format: L["Lesson Name"] = `<div class="lesson-body">...</div>`;

const L = {};

function simpleContent(name, sub) {
  return `<div class="lesson-body"><h3>${name}</h3><p>This lesson will cover <strong>${name.toLowerCase()}</strong> — ${sub.toLowerCase()}.</p><div class="key-point"><span class="kp-icon">📝</span><span>Lesson content coming soon. Use the Quiz and Glossary tabs to preview the topic.</span></div></div>`;
}

// ═══════════════════════════════════════════════════════
// UNIT 1: WHAT IS POLITICS?
// ═══════════════════════════════════════════════════════

L["Politics, Power, and the State"] = `<div class="lesson-body">

<h3>What Is Politics?</h3>

<p>Most people think of politics as elections, parties, and people in suits arguing on television. That's part of it, but the word covers far more. The American political scientist Harold Lasswell famously defined politics as <em>"who gets what, when, how."</em> Aristotle called it <em>the master science</em> — the activity through which we decide collectively how to live. The German jurist Carl Schmitt insisted the political begins wherever a group draws a line between <em>friend</em> and <em>enemy</em>.</p>

<p>Each definition catches something real. Politics is at once about <strong>distribution</strong> (who gets the resources), <strong>collective choice</strong> (how we decide together), and <strong>conflict</strong> (what to do when we disagree). Wherever humans share space and resources, politics happens — in nations, yes, but also in offices, families, classrooms, and online communities.</p>

<div class="analogy-box">
<strong>🔭 Think of it like this:</strong>
Politics is to a community what economics is to a market. Economics asks: <em>how are goods produced and exchanged?</em> Politics asks: <em>how are decisions and authority produced and exchanged?</em> One studies the flow of stuff; the other studies the flow of power.
</div>

<div class="mini-quiz" data-answered="false">
  <div class="mini-quiz-header">✅ Quick Check</div>
  <div class="mini-quiz-question">Which best captures the broadest meaning of "politics"?</div>
  <div class="mini-quiz-options">
    <button class="mini-quiz-opt" data-correct="false" onclick="checkMiniQuiz(this)">The activity of elected officials</button>
    <button class="mini-quiz-opt" data-correct="true" onclick="checkMiniQuiz(this)">Any process by which a group decides who gets what</button>
    <button class="mini-quiz-opt" data-correct="false" onclick="checkMiniQuiz(this)">The study of laws and constitutions</button>
  </div>
  <div class="mini-quiz-feedback"></div>
</div>

<hr class="section-divider">

<h3>The Three Faces of Power</h3>

<p>If politics is about getting things done together, then <span class="vocab-pill">power</span> is the currency. The political theorist Steven Lukes argued that power operates on <strong>three faces</strong>, each subtler than the last.</p>

<p><strong>1. Decision-making power.</strong> The most obvious face: A makes B do something B otherwise wouldn't do. A boss tells you to stay late; you stay. A legislature passes a tax; you pay it. This is power in its open, observable form — visible in votes, orders, and outcomes.</p>

<p><strong>2. Agenda-setting power.</strong> Bachrach and Baratz pointed out that real power is sometimes about keeping issues <em>off</em> the table. A topic that's never debated, a question that's never asked, is one you can't lose. Lobbyists who quietly shape what bills get drafted exercise this face. So does a school principal who decides which complaints reach the parents' meeting.</p>

<p><strong>3. Preference-shaping power.</strong> The deepest face: making people <em>want</em> what serves your interests, so coercion isn't needed. Advertising, ideology, and education all do this. Marx called it <span class="vocab-pill">ideology</span>; Gramsci called it <span class="vocab-pill">hegemony</span>. If you can convince workers their interests align with their bosses', you don't need to suppress strikes — there won't be any.</p>

<div class="example-box">
<strong>🔗 Real-life example:</strong>
Think about why "tax cuts" almost always sound positive in political discussion, while "spending cuts on schools" sounds negative — even though they're often two sides of the same budget. The framing isn't neutral; it's a quiet exercise of preference-shaping power. Whoever defines the vocabulary defines the debate.
</div>

<div class="mini-quiz" data-answered="false">
  <div class="mini-quiz-header">✅ Quick Check</div>
  <div class="mini-quiz-question">A government quietly excludes climate change from the agenda of an energy summit. Which face of power is this?</div>
  <div class="mini-quiz-options">
    <button class="mini-quiz-opt" data-correct="false" onclick="checkMiniQuiz(this)">First face — decision-making</button>
    <button class="mini-quiz-opt" data-correct="true" onclick="checkMiniQuiz(this)">Second face — agenda-setting</button>
    <button class="mini-quiz-opt" data-correct="false" onclick="checkMiniQuiz(this)">Third face — preference-shaping</button>
  </div>
  <div class="mini-quiz-feedback"></div>
</div>

<hr class="section-divider">

<h3>What Is the State?</h3>

<p>Of all the institutions through which power flows, the most important in the modern world is the <span class="vocab-pill">state</span>. The sociologist Max Weber gave the classic definition: <em>a human community that successfully claims the monopoly of the legitimate use of physical force within a given territory.</em></p>

<p>Unpack that and you get four features every modern state has:</p>

<ul style="margin:8px 0 16px 24px">
<li><strong>Population</strong> — a community of people, however defined.</li>
<li><strong>Territory</strong> — fixed borders that mark where the state's authority runs.</li>
<li><strong>Government</strong> — the institutions that issue and enforce decisions.</li>
<li><strong>Sovereignty</strong> — the recognized right to be the final authority, internally (over its citizens) and externally (against other states).</li>
</ul>

<p>The key word in Weber's definition is <em>monopoly</em>. Private citizens can disagree, even fight — but only the state may legitimately deploy organized violence: police, courts, prisons, armies. When that monopoly breaks down, you no longer have a functioning state.</p>

<div class="warning-box">
<strong>⚠️ State is not the same as nation:</strong>
A <em>state</em> is a political-legal entity (government, borders, sovereignty). A <em>nation</em> is a cultural community that sees itself as a people (shared language, history, identity). Most states contain multiple nations (the UK contains the English, Scottish, Welsh, and Northern Irish). Some nations have no state of their own (the Kurds, divided across Turkey, Iraq, Syria, and Iran). The hyphenated phrase <em>nation-state</em> describes the ideal — rarely the reality — of one nation, one state.
</div>

<div class="mini-quiz" data-answered="false">
  <div class="mini-quiz-header">✅ Quick Check</div>
  <div class="mini-quiz-question">According to Weber, the defining feature of a state is its:</div>
  <div class="mini-quiz-options">
    <button class="mini-quiz-opt" data-correct="false" onclick="checkMiniQuiz(this)">Democratic constitution</button>
    <button class="mini-quiz-opt" data-correct="false" onclick="checkMiniQuiz(this)">Shared culture and language</button>
    <button class="mini-quiz-opt" data-correct="true" onclick="checkMiniQuiz(this)">Monopoly on the legitimate use of force in a territory</button>
    <button class="mini-quiz-opt" data-correct="false" onclick="checkMiniQuiz(this)">Membership in the United Nations</button>
  </div>
  <div class="mini-quiz-feedback"></div>
</div>

<hr class="section-divider">

<h3>Where Did the State Come From?</h3>

<p>It feels permanent, but the modern state is historically young. For most of human history, people lived in tribes, kinship networks, city-states, empires, or feudal patchworks where authority overlapped and bled into religion, family, and trade. A medieval peasant might owe duties to a lord, a bishop, a guild, and a distant king all at once — with no clear answer about who was finally in charge.</p>

<p>The state as we know it crystallized in Europe over a few centuries, with one moment usually picked out as symbolic: the <span class="vocab-pill">Peace of Westphalia</span> in 1648. To end the Thirty Years' War — a religious bloodbath that killed maybe a third of Central Europe — the great powers agreed that each ruler would decide religion within their own borders, and no outside power would intervene. That principle, <em>cuius regio, eius religio</em> ("whose realm, his religion"), became the seed of modern <span class="vocab-pill">sovereignty</span>: each state, supreme within its lines.</p>

<p>Over the following 300 years, this Westphalian model spread globally — partly by adoption, partly by colonial imposition. Today every patch of inhabited land on the planet (except Antarctica) belongs to some state. That's a remarkable thing. It wasn't always true and may not always be.</p>

<hr class="section-divider">

<h3>Why Does the State Exist?</h3>

<p>Different political traditions answer this question in incompatible ways — and the answer you pick shapes the politics you defend.</p>

<p><strong>The Hobbesian answer: to escape chaos.</strong> Thomas Hobbes argued that without a state, life would be <em>"solitary, poor, nasty, brutish, and short"</em> — a war of all against all. We accept the state's authority not because we love it but because the alternative is worse. The state is, above all, a security guarantee.</p>

<p><strong>The Lockean answer: to protect rights.</strong> John Locke replied that humans have <em>natural rights</em> — to life, liberty, and property — that exist before any state. The state's job is to enforce those rights more reliably than we could on our own. If it fails or violates them, the people may dissolve it. This is the lineage of liberal democracy.</p>

<p><strong>The Marxist answer: to maintain class power.</strong> Karl Marx saw the state more darkly: as <em>"a committee for managing the common affairs of the bourgeoisie."</em> Whatever rhetoric it wraps itself in, the state mostly protects existing property relations and the class that benefits from them. The state isn't above class conflict — it's a weapon in it.</p>

<div class="key-point">
<span class="kp-icon">💡</span>
<span><strong>The political question.</strong> Notice that all three traditions agree the state is a coercive institution — they differ on what it's coercing <em>for</em>. Order? Rights? Privilege? Most political arguments you'll hear in your lifetime are downstream of this question.</span>
</div>

<hr class="section-divider">

<h3>Why This Matters</h3>

<p>You can opt out of many things in modern life. You can't easily opt out of the state. It taxes you, conscripts you, prosecutes you, educates your children, and decides whether your marriage, your job, and your border-crossing are valid. The deepest reason to study politics is therefore simple: if power is going to be exercised over you, it's worth understanding how, by whom, and on what claim of legitimacy.</p>

<p>The political theorist Hannah Arendt wrote that the opposite of a citizen is not a rebel but a <em>spectator</em> — someone who watches power happen without grasping its grammar. Political literacy is the antidote. Every lesson that follows will build on the three ideas in this one: <strong>power has multiple faces, the state is a specific historical institution, and its existence demands a justification.</strong></p>

<div class="key-point">
<span class="kp-icon">💡</span>
<span><strong>Three takeaways:</strong>
<br>1. Politics is <em>any</em> process for collective decision-making — not just elections.
<br>2. Power flows through three faces: decisions, agendas, and preferences.
<br>3. The state is a relatively recent invention defined by its claim to a monopoly on legitimate force within a fixed territory.</span>
</div>

</div>`;

// ═══════════════════════════════════════════════════════
// Auto-stub the rest until they're written.
// ═══════════════════════════════════════════════════════

if (typeof units !== 'undefined') {
  units.forEach(u => u.nodes.forEach(n => {
    if (!L[n.name]) L[n.name] = simpleContent(n.name, n.sub);
  }));
}
