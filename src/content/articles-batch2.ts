import type { Article } from './types';

/**
 * xaa.es — batch 2. Twenty original evergreen features on the 2026 World Cup:
 * rules, formats, tactics, positions, history and fan culture. Same editorial
 * rules as batch 1: independent, original writing; previews and explainers
 * only — we never fabricate match results.
 */
export const ARTICLES_BATCH2: Article[] = [
  {
    slug: 'how-var-works-at-the-world-cup',
    category: 'world-cup-2026',
    title: 'How VAR Actually Works at a World Cup (And What It Cannot Do)',
    excerpt:
      'Four situations, one review room, and a referee with a screen. A plain guide to what the video assistant can overturn, what stays untouched, and why the process takes as long as it does.',
    date: '2026-07-16',
    minutes: 7,
    author: 'The Xaa Desk',
    sections: [
      { h: '', p: [
        'Few things divide a stadium like the referee drawing a rectangle in the air. Video assistant refereeing arrived at the World Cup in 2018, and by 2026 it is simply part of the furniture — yet most arguments about it still begin with a misunderstanding of what VAR is allowed to touch. The system is narrower than its critics fear and narrower than its defenders sometimes claim.',
        'VAR can intervene in exactly four situations: goals and the attacking moves that led to them, penalty decisions, straight red cards, and cases of mistaken identity. Everything else — a missed corner, a soft yellow, a foul in midfield that leads to nothing — belongs to the on-field officials alone, however loudly the replays disagree.'] },
      { h: 'Clear and obvious, or leave it alone', p: [
        'The guiding phrase is "clear and obvious error". The video assistant is not asked whether they would have given the decision themselves; they are asked whether the referee\'s call is defensibly wrong on the evidence. A fifty-fifty penalty shout that the referee waves away should survive review precisely because reasonable officials could disagree about it.',
        'This is why two nearly identical incidents can end differently in the same tournament. The first referee gave it, the second did not, and neither call was clearly wrong — so both stand. VAR was never designed to produce identical outcomes; it was designed to remove the indefensible ones.'] },
      { h: 'Why offside calls feel different', p: [
        'Offside is the exception to the "clear and obvious" logic, because it is a question of fact rather than judgement: a player either was or was not beyond the line when the ball was played. Semi-automated tracking, introduced at the 2022 tournament and refined since, uses limb-tracking cameras and a sensor in the ball to draw the line in seconds rather than minutes.',
        'The margins can be centimetres, and that offends some people\'s sense of the game — but a factual law has no comfortable middle ground. The alternative to a precise line is an imprecise one, and nobody has yet explained where a "fair" tolerance should end.'] },
      { h: 'What to watch for in 2026', p: [
        'Expanded to 104 matches, the tournament leans harder than ever on consistency between refereeing crews drawn from every confederation. Expect the familiar rhythm: a delay while play continues, the assistant\'s check, and the referee jogging to the pitch-side monitor for subjective calls. The monitor visit matters — FIFA instructs referees to see subjective incidents with their own eyes rather than take the review room\'s word.',
        'And expect the announcements introduced in recent tournaments: the referee explaining the final decision to the stadium. It does not end arguments — nothing in football ends arguments — but it has made the process visibly more honest, and at a World Cup that is worth a great deal.'] },
    ],
  },
  {
    slug: 'group-stage-tiebreakers-explained',
    category: 'world-cup-2026',
    title: 'Level on Points: How World Cup Group Tiebreakers Really Work',
    excerpt:
      'Goal difference, goals scored, head-to-head, fair play, and finally the drawing of lots — the exact order that decides who survives a tied group, with the famous cases that shaped the rules.',
    date: '2026-07-16',
    minutes: 6,
    author: 'The Xaa Desk',
    sections: [
      { h: '', p: [
        'Every World Cup produces at least one night of frantic arithmetic: two or three teams level on points, fans doing goal-difference sums in the stands, broadcasters flashing tables that change with every goal across two stadiums. The tiebreaker rules are public, precise and almost nobody knows them in order — which is a shame, because the order is the whole drama.',
        'With twelve groups and eight best-third-place qualifiers in the 2026 format, the sums matter more than ever: they decide not only who advances from each group but which third-placed teams survive across the whole tournament.'] },
      { h: 'The order inside a group', p: [
        'When teams finish level on points, the first separator is goal difference across all group matches, then goals scored. If teams are still level, the comparison narrows to the matches between the tied teams: points, then goal difference, then goals scored in those head-to-head games.',
        'Only after all of that comes the tiebreaker everyone remembers from quiz questions: fair play points, a ledger of yellow and red cards where fewer is better. And if even discipline cannot separate them, FIFA draws lots — a literal lottery for a place in the knockout rounds, which has been needed at a World Cup exactly once, in 1990, and remains the outcome every federation quietly dreads.'] },
      { h: 'Ranking the third-placed teams', p: [
        'The 2026 format adds a second table: the twelve third-placed teams are ranked against each other, and the best eight advance. The comparison runs points first, then goal difference, then goals scored, then fair play, then the drawing of lots. Because the groups are played in parallel, a team can be eliminated by a result in a group it never touched.',
        'The lesson from tournaments that used this system — the Euros since 2016, the 24-team World Cups of 1986 to 1994 — is that a third-placed team with four points is almost always safe, three points and a decent goal difference is a coin flip, and three points with a poor one is a nervous flight home half-booked.'] },
      { h: 'Why late goals in dead games matter', p: [
        'The practical consequence of the rulebook is that no goal is meaningless. A consolation strike in a lost match can lift a team above a rival three days later; a sloppy goal conceded while cruising can be the margin that sends the group winner into the harder half of the bracket. Coaches know this, which is why "dead" fixtures at a World Cup so rarely play dead.',
        'For fans, the advice is simple: learn the order — points, goal difference, goals, head-to-head, fair play, lots — and the final round of group games becomes one of the best puzzles in sport rather than a confusing blur.'] },
    ],
  },
  {
    slug: 'extra-time-and-penalties-rules',
    category: 'world-cup-2026',
    title: 'Extra Time, Penalties and the Long Night: Knockout Rules Explained',
    excerpt:
      'What actually happens when a knockout match finishes level — the thirty minutes, the shootout procedure, who may take one, and the small rules even seasoned fans get wrong.',
    date: '2026-07-17',
    minutes: 6,
    author: 'The Xaa Desk',
    sections: [
      { h: '', p: [
        'From the round of 32 onwards, every 2026 World Cup match must produce a winner on the night. Ninety minutes level means thirty more; thirty more level means penalties. Everyone knows that much. The details underneath — who may take a kick, what order, what the goalkeeper may do — are where pub arguments are won and lost.',
        'Extra time is two straight halves of fifteen minutes with a change of ends and no golden goal: the experiment that decided tournaments around the turn of the century was retired in 2004, so a team that concedes in the ninety-first minute of extra time still has time to respond.'] },
      { h: 'How the shootout is set up', p: [
        'The referee chooses the goal — usually after consulting security and pitch conditions, which is why shootouts often happen in front of one set of fans rather than the "fair" end. A coin toss decides which team kicks first, a genuine advantage worth arguing about: teams shooting first win somewhat more often, most likely because trailing in a shootout weighs on the second kicker.',
        'Only players on the pitch at the final whistle of extra time may take part, goalkeepers included. Every outfield player and the keeper must take a kick before anyone kicks twice — the full rotation through eleven takers has been needed at senior tournaments, and coaches who only plan five names have regretted it.'] },
      { h: 'What the goalkeeper may and may not do', p: [
        'The goalkeeper must have at least part of one foot on or level with the goal line when the ball is struck — the law was softened in 2022 from the stricter "both feet" reading precisely because VAR was catching keepers by centimetres. Dancing on the line, waving arms and delaying within reason are legal; touching the crossbar or the netting before the kick, or clearly jumping forward early, is not.',
        'A keeper booked during the shootout for repeated gamesmanship cannot be replaced unless the team still has a substitution available — and since extra time typically exhausts them, the yellow card is a real deterrent rather than a token.'] },
      { h: 'The myth of the lottery', p: [
        'Calling a shootout a lottery is comforting and wrong. Conversion rates are stable enough to reward preparation: teams that practise the walk from the centre circle, assign kicks in advance and study the opposing keeper\'s habits convert measurably better. Research on tournament shootouts consistently shows the same patterns — rushed run-ups miss more, designated orders beat improvised ones.',
        'The World Cup has been decided on penalties twice — 1994 and 2006 — and with eight knockout rounds now stretching across the 2026 bracket, the odds that the new format\'s story ends from twelve yards are the highest they have ever been. Somewhere, a federation is already rehearsing.'] },
    ],
  },
  {
    slug: 'squad-size-and-substitutions-2026',
    category: 'world-cup-2026',
    title: 'Twenty-Six Players, Five Changes: How Squad Rules Shape the 2026 World Cup',
    excerpt:
      'The modern World Cup squad is a rotation machine. What the 26-man list and five-substitute rule actually change about how tournaments are won — and who they quietly favour.',
    date: '2026-07-17',
    minutes: 6,
    author: 'The Xaa Desk',
    sections: [
      { h: '', p: [
        'For most of World Cup history a squad meant twenty-three names and a manager meant three changes. The pandemic-era shift to five substitutions became permanent, squads grew to twenty-six, and the arithmetic of tournament football quietly transformed. Half an outfield team can now be replaced mid-match, and nearly a third of the squad watches each game knowing their turn is a plan rather than an accident.',
        'At a 104-match tournament staged across three countries and multiple climate zones, those margins are not administrative trivia. They are the difference between a squad that arrives at the quarter-finals running and one that arrives limping.'] },
      { h: 'What five substitutions really change', p: [
        'Five changes across three windows (plus half-time) mean a coach can plan a match in phases: a pressing first hour from the starters, then fresh legs to finish. Analysts have tracked the consequence across leagues and tournaments since 2020 — late goals by substitutes are up, and the physical drop-off that used to flatten matches after the seventieth minute has softened.',
        'It also changes selection. A "finisher" — a player picked less for ninety minutes than for the last twenty-five against tired defenders — is now a genuine squad role. Tournament winners increasingly get decisive contributions from the bench, and coaches build for it deliberately rather than hoping for it.'] },
      { h: 'Who the big squads favour', p: [
        'Deep football nations benefit most: a twenty-sixth name from a top league is a luxury smaller federations cannot match. But the rule also rescues smaller squads from catastrophe — one injury no longer wrecks a campaign built around eleven players, and a group game can be rotated without surrendering it.',
        'The quiet loser is the romantic ideal of the unchanged team. The days when a World Cup could be won by the same eleven walking out six times are effectively over; the calendar is too dense and the tool for avoiding it too available. Squad harmony — keeping numbers fourteen to twenty-six genuinely engaged — has become a core coaching skill, discussed in staff rooms as seriously as set pieces.'] },
      { h: 'Reading a squad list like a scout', p: [
        'When the twenty-six-name lists drop before the tournament, look past the stars. Count the full-backs: four means the coach plans to rotate the most physically punishing position; two means a gamble. Look for the designated finisher, the third goalkeeper who doubles as a dressing-room presence, and the versatile defender who covers three positions — the glue selections that reveal how a staff actually thinks.',
        'And note the omissions. A famous name left home almost always signals a tactical decision rather than a feud: the shape the coach has chosen simply has no role for that profile. The squad list, read carefully, is the first team announcement of the tournament.'] },
    ],
  },
  {
    slug: 'how-confederation-slots-work-2026',
    category: 'teams',
    title: 'Who Gets In: How the 48 World Cup Places Are Shared Around the World',
    excerpt:
      'Sixteen places for Europe, nine and a half for Africa, a debut guarantee for Oceania — how the 2026 allocation was carved up, and what the play-off tournament decides.',
    date: '2026-07-18',
    minutes: 6,
    author: 'The Xaa Desk',
    sections: [
      { h: '', p: [
        'Before a single qualifier kicks off, the most consequential World Cup decision has already been made: how many places each continent receives. The move to 48 teams redrew that map. Europe holds sixteen slots, Africa nine, Asia eight, South America six, North and Central America six including the three hosts, and Oceania — for the first time in history — a guaranteed place of its own.',
        'Two further places are settled by an intercontinental play-off tournament, a short knockout staged in the host region in the March before the finals, gathering one team from each non-European confederation plus an extra from the hosts\' region.'] },
      { h: 'Why the map looks the way it does', p: [
        'The allocation is a compromise between merit and mission. Pure strength rankings would hand Europe and South America even more places; pure population or federation counts would hand Asia and Africa more. FIFA\'s stated logic for expansion was development — bringing the tournament within reach of football nations that had spent decades locked out by arithmetic.',
        'The effect is real. Nations that used to fall one play-off short of qualification now have a genuine path, and the knock-on reaches domestic leagues, youth systems and sponsorship money in places the World Cup had never touched. Critics predicted a diluted group stage; defenders point out that so-called minnows have supplied the tournament\'s best stories for a century.'] },
      { h: 'South America\'s changed mathematics', p: [
        'The starkest change is in South America, where ten nations chase six direct places plus a play-off berth. A confederation that once sent four or five teams through a brutal eighteen-match marathon now sends more than half its members. The marathon remains — everyone still plays everyone home and away — but the cliff edge has moved.',
        'Traditionalists grumble that the jeopardy is gone. The counterargument is that the qualifiers\' altitude trips, hostile away nights and two-year grind remain the best preparation in world football, and the extra places simply mean that preparation is wasted less often.'] },
      { h: 'What to actually watch in qualifying', p: [
        'The best drama now lives at the play-off boundaries: the seventh place in South America, the African group runners-up fighting through their play-off path, the Asian fourth-round shootouts. And the intercontinental play-off itself has become a genuine event — a mini-tournament where a Pacific island federation can stand two matches from the World Cup.',
        'For neutral fans the advice is to follow a confederation you do not know. World Cup qualifying is the sport\'s largest competition — more than two hundred nations across three years — and the 48-team format has made more of it matter than ever before.'] },
    ],
  },
  {
    slug: 'what-makes-a-golden-generation',
    category: 'teams',
    title: 'The Golden Generation Problem: Why Great Squads So Often Win Nothing',
    excerpt:
      'Every few years a country produces a once-in-a-lifetime crop of players — and most of them never lift the trophy. What actually separates the golden generations that deliver from the ones that haunt their nations.',
    date: '2026-07-18',
    minutes: 7,
    author: 'The Xaa Desk',
    sections: [
      { h: '', p: [
        'Football\'s cruellest label is "golden generation". It is pinned on a group of gifted players in their early twenties, and from that moment every tournament becomes a referendum on their failure to have won it yet. Portugal coined the phrase for the Figo generation, which won nothing. Belgium\'s ranked-first-in-the-world crop won nothing. England\'s mid-2000s midfield of a lifetime won nothing.',
        'And yet Spain\'s generation delivered three straight major titles, France\'s class of 2018 won a World Cup at a canter, and Argentina\'s veterans finally crowned the greatest player of their era. The difference between the two lists is one of the most instructive stories in international football.'] },
      { h: 'Talent is the entry fee, not the answer', p: [
        'Every golden generation has elite players; the ones that win have an elite structure around them. Spain 2008-2012 subordinated stars to an idea of play so total that selection debates became stylistic rather than political. France 2018 left brilliant individuals at home because the collective shape mattered more. The failures, almost uniformly, tried to fit every famous name onto the pitch at once.',
        'The pattern repeats so reliably it is almost a law: golden generations fail when the team is picked to honour reputations, and succeed when it is picked to serve a plan. Ten great players in the wrong shape lose to eleven good ones in the right one.'] },
      { h: 'The weight of the clock', p: [
        'Golden generations also fail because of when they are judged. A crop that peaks together also declines together, and federations habitually give the group "one more tournament" past its physical peak out of loyalty and fear. The sides that won — Spain, France — ruthlessly refreshed around a spine, blending the golden core with hungry newcomers instead of preserving it whole.',
        'There is a psychological clock too. Each near-miss adds scar tissue; quarter-finals lost on penalties compound. Sports psychologists who have worked inside these squads describe the tournament weight as cumulative — the 2026 World Cup will feature at least two squads carrying exactly this burden, and watching how they carry it is half the drama.'] },
      { h: 'How to spot the real thing in 2026', p: [
        'Ignore the talent rankings and ask structural questions. Does the coach have the authority to drop a star? Is there a settled shape that survived qualifying intact? Has the golden core accepted role players around it — the unglamorous holding midfielder, the full-back who defends first? Is the age curve blended or a single cohort marching toward thirty together?',
        'A generation that answers yes to those questions is dangerous. One that answers no is a documentary waiting to be made. The gold, it turns out, was never the problem; the setting always was.'] },
    ],
  },
  {
    slug: 'how-national-teams-build-identity',
    category: 'teams',
    title: 'Why National Teams Play the Way They Do: Football Identity, Explained',
    excerpt:
      'Brazil flows, Germany organises, Italy defends — or so the clichés say. Where national playing styles actually come from, why they persist, and how modern coaching is blurring them.',
    date: '2026-07-19',
    minutes: 7,
    author: 'The Xaa Desk',
    sections: [
      { h: '', p: [
        'Watch ten minutes of an international tournament with the sound off and you can often guess who is playing. The clichés — Brazilian flair, German efficiency, Italian defensive artistry, Dutch geometry — are older than most of the players, and like most clichés they are part truth, part museum piece. Where does a national style actually come from?',
        'The honest answer is: from the streets, the coaching manuals and the trauma. Every distinctive footballing identity is a story about how a country\'s children learn the game, what its federation decided to teach, and which historic defeat it swore never to repeat.'] },
      { h: 'Styles are infrastructure, not genetics', p: [
        'Brazil\'s close control grew from futsal courts and small-sided street games where a heavy touch means losing the ball instantly. Spain\'s positional passing was institutionalised through academy curricula that prized the pass window over the sprint. Germany\'s post-2000 reboot was a deliberate federation project: hundreds of regional coaching centres, a unified philosophy, a production line built to order.',
        'None of this is folklore. It is infrastructure — decisions about what eight-year-olds practise, repeated for a generation. When people say a nation "produces" a type of player, they are describing a curriculum, not a bloodline.'] },
      { h: 'Trauma writes the manual', p: [
        'National styles also calcify around scars. Italy\'s obsession with defensive structure hardened through decades when a single conceded goal meant elimination. England spent twenty years arguing with itself about technique versus fight after repeated exits to more technical sides. Spain\'s tiki-taka was, among other things, a rejection of the physical inferiority complex that had haunted its earlier teams.',
        'The pattern is consistent: a formative humiliation, a public inquest, a federation white paper, and ten years later a generation shaped by the correction. The 2026 contenders all carry a version of this story, and knowing it explains selections that otherwise look eccentric.'] },
      { h: 'The great blurring', p: [
        'Modern club football is dissolving the borders. A national squad now scatters across the same handful of super-leagues, trained by the same globalised coaching ideas; the pressing structures of a German club side appear in South American teams, and Brazilian full-backs learn positional discipline in European academies. Tournaments increasingly feature thirty-two variations on a shared tactical language rather than distinct footballing civilisations.',
        'And yet identity persists — in tempo, in risk appetite, in what a crowd back home will forgive. A World Cup remains the one place where you can still watch a country\'s idea of itself take the field. That, as much as the trophy, is what the group stage is for.'] },
    ],
  },
  {
    slug: 'how-players-peak-for-a-tournament',
    category: 'players',
    title: 'Arriving Fresh in June: The Science of Peaking for a World Cup',
    excerpt:
      'A World Cup begins days after the longest club season in history ends. How sports science tries to deliver players to the tournament fresh — and why some stars arrive already finished.',
    date: '2026-07-19',
    minutes: 7,
    author: 'The Xaa Desk',
    sections: [
      { h: '', p: [
        'The dirty secret of every summer tournament is that its stars arrive at the end of a marathon, not the start of one. A player at a top European club can log sixty matches before the World Cup begins; the tournament then asks for up to eight more, in summer heat, with the whole world watching. Managing that arithmetic is now a science with its own staff, budgets and vocabulary.',
        'The 2026 edition sharpens the problem: more teams, more matches, continental travel between venues and kick-off times built around global television. The medal, physiologists like to say, is won in the load management of March.'] },
      { h: 'What fatigue actually does', p: [
        'Fatigue rarely announces itself as exhaustion; it shows up as a half-yard. Sprint counts drop before top speed does, decision-making degrades before technique, and injury risk climbs steeply — hamstring and muscle injuries cluster at the end of congested seasons with grim predictability. A player can pass every fitness test and still be, in tournament terms, done.',
        'National staffs therefore track club minutes all season, negotiating with club medical departments over data that was once a trade secret. The players who shine in June are frequently the ones whose club seasons ended, by luck or design, a little early — a pattern pundits rediscover every four years.'] },
      { h: 'The taper and the base camp', p: [
        'The weeks between the club season and the first group game follow a rhythm sports scientists call the taper: reduce volume, keep intensity, protect sleep. Base camps are chosen for climate and time zones as much as facilities — acclimatising to heat takes roughly ten days, and 2026\'s venue spread makes camp location a genuine tactical decision.',
        'Inside the camp, the schedule is built backwards from the knockout dates. Starters are managed to peak twice — once for the decisive group game, once for the rounds that matter — while the squad\'s finishers absorb the friendlies. When a coach rests a star in game three of the group, that is not caution; that is the plan working.'] },
      { h: 'How to read player condition from your sofa', p: [
        'Watch the first pressing actions, not the highlights: a fresh forward sprints to close a centre-back twice in the opening minutes, a tired one jogs and points. Watch repeat sprints — the second run in ten seconds is where fatigue hides. And watch minute sixty-five, the hour mark where tournament matches structurally change as the finishers arrive.',
        'By the quarter-finals, freshness becomes a visible competitive advantage, as decisive as any tactic. The team celebrating in the final week of a World Cup is almost never the most talented eleven of the opening week; it is the one that still has legs. That story starts months earlier, and 2026 will tell it again.'] },
    ],
  },
  {
    slug: 'the-modern-full-back-explained',
    category: 'players',
    title: 'The Hardest Job on the Pitch: What Modern Full-Backs Are Actually Asked to Do',
    excerpt:
      'Once the position for the worst athlete in the team, full-back is now the most tactically overloaded role in football — defender, winger, midfielder and safety valve in the same ninety minutes.',
    date: '2026-07-20',
    minutes: 6,
    author: 'The Xaa Desk',
    sections: [
      { h: '', p: [
        'There is an old joke that full-back was where you hid the kid who could not play. Nobody has told the modern game. Today\'s full-backs cover more distance than anyone else, defend one-against-one against the opponent\'s fastest player, supply the width their winger abandoned, and — in the possession systems that dominate elite football — step into midfield to build the play.',
        'No position has changed more in twenty years, and no selection tells you more about how a national team intends to play at the 2026 World Cup.'] },
      { h: 'From touchline sprinter to inverted playmaker', p: [
        'The classic overlapping full-back — sprint outside the winger, deliver the cross, sprint back — still exists, but a second species now shares the pitch: the inverted full-back, who drifts inside into central midfield when their team has the ball, creating an extra passer and guarding against the counter-attack. Club football normalised the idea, and international sides adopted it within a single cycle.',
        'The two jobs demand opposite instincts. One asks for a winger\'s lungs and delivery; the other for a midfielder\'s brain and press resistance. When a squad list carries four full-backs of radically different profiles, the coach is keeping both tactical doors open.'] },
      { h: 'The defensive job never left', p: [
        'All of this creativity sits on top of the position\'s original task: surviving the wide duel. Tournament football concentrates its most dangerous attackers on the flanks, and the full-back meets them in open grass with no cover — lose the duel and a cutback or cross arrives in the box. Recovery speed, body positioning and the discipline not to dive in remain the difference between a good tournament and a famous roasting.',
        'This is why tournament coaches, whatever their possession ideals, still ask first: can this player defend a winger one-on-one for ninety minutes? Every World Cup produces at least one tie decided by exactly that duel.'] },
      { h: 'What to watch in 2026', p: [
        'Watch where the full-backs stand when their team settles into possession: hugging the touchline signals crosses and overlaps, stepping into midfield signals a positional passing game. Watch who covers the space they leave — a rotating winger, a shifting centre-back — because that choreography is the team\'s tactical fingerprint.',
        'And watch the fatigue. Full-back is the position five-substitute football rotates most aggressively, and the sides with four trustworthy ones tend to be the sides still sprinting in the semi-finals. The World Cup will be won, as usual, partly in the least glamorous position on the team sheet.'] },
    ],
  },
  {
    slug: 'what-a-number-ten-means-now',
    category: 'players',
    title: 'The Number Ten Is Dead. Long Live the Number Ten.',
    excerpt:
      'The classic playmaker who strolled between the lines was declared extinct by pressing football — yet every tournament, someone wearing ten decides it. What the role has become.',
    date: '2026-07-20',
    minutes: 6,
    author: 'The Xaa Desk',
    sections: [
      { h: '', p: [
        'For half a century the number ten was football\'s aristocrat: the playmaker excused from defending, drifting in the pocket behind the striker, paid in touches of genius. Then pressing football arrived and declared the aristocracy over. A player who does not defend is a player who cannot start; the flat 4-4-2s and hunting 4-3-3s of the modern game seemed to have no room for a strolling artist.',
        'And yet. Watch any recent tournament\'s decisive moments and there he is — a creator wearing ten, receiving between the lines, playing the pass nobody else saw. The role did not die; it was renovated.'] },
      { h: 'Where the ten went', p: [
        'The playmaker\'s duties were redistributed rather than abolished. Some tens moved wide, cutting inside from the flank onto their stronger foot. Some dropped deep and became eights or even six-and-a-half roles, running games from in front of the defence. Others pushed up into the false nine, the striker who is secretly a playmaker.',
        'What every variant shares is that the creative burden now comes bundled with work: pressing triggers, counter-pressing after losses, positional discipline in the build-up. The modern ten earns the freedom of the pocket by sprinting to win the ball back the moment it is lost — the tax the old aristocrats never paid.'] },
      { h: 'Why tournaments resurrect the classic', p: [
        'International football remains kinder to pure creators than club football. National teams train together for weeks, not seasons; sophisticated pressing structures are hard to install, so tournament matches feature more settled defences and slower rhythms — precisely the conditions in which a between-the-lines passer thrives. Deep tournament runs are regularly steered by a ten trusted to do less running and more deciding.',
        'Knockout football also concentrates value in single moments. Over a league season, systems beat moments; over a one-off quarter-final, one unlocking pass is the season. Coaches know it, which is why the luxury player keeps being re-signed every June.'] },
      { h: 'Spotting the real ten in 2026', p: [
        'Ignore shirt numbers and watch for the player teammates search for under pressure — the outlet whose first touch turns a panicked clearance into an attack. Watch who occupies the pocket between the opponent\'s midfield and defence, and how the striker moves to open that pocket for him. Watch, above all, the pass selection in the final third: the ten is the one who chooses the third-best-looking option that turns out to be the best one.',
        'Somewhere in the 2026 bracket, a match of suffocating tactical discipline will be settled by eight yards of vision. It always is. The number ten survives because football, at its decisive moments, still needs someone to imagine.'] },
    ],
  },
  {
    slug: 'reading-a-football-match-basics',
    category: 'tactics',
    title: 'How to Watch Football Like an Analyst: A Beginner\'s Field Guide',
    excerpt:
      'Stop following the ball. Where teams stand, where the space is, and five simple things to watch that turn ninety confusing minutes into a story you can read.',
    date: '2026-07-21',
    minutes: 7,
    author: 'The Xaa Desk',
    sections: [
      { h: '', p: [
        'Television trains us to watch the ball, and the ball is the worst guide to a football match. At any moment, twenty of the twenty-two players are somewhere else — and where they are standing is the actual game. Analysts talk about shape, lines and space not to sound clever but because those words describe what decides matches.',
        'You do not need a coaching badge to see it. You need a handful of habits, most of which take one match to learn and then cannot be unseen. The 2026 World Cup, with its hundred-plus matches, is the perfect classroom.'] },
      { h: 'See the two shapes, not the formation', p: [
        'Forget the graphic that says 4-3-3. Every team has two shapes: one with the ball, one without. A side listed as 4-3-3 may defend in a 4-4-2 block and attack in something like a 3-2-5. Watch for the moment of transformation — a full-back stepping into midfield, a winger dropping into the second line — because that choreography is the coach\'s actual plan.',
        'The quickest trick: when one goalkeeper holds the ball, pause your eyes on the OTHER team. Are they sprinting to press or retreating into a block? That single decision, repeated hundreds of times, defines the character of the entire match.'] },
      { h: 'Watch the space behind and between', p: [
        'Attacks live in two kinds of space: behind the defence, and between its lines. A high defensive line surrenders the grass behind it to fast runners; a deep one concedes the pocket in front where creators receive and turn. Neither choice is safe — every match is a negotiation about which poison the defending team prefers to drink.',
        'Once you watch for it, you will see strikers making runs nobody passes to. Those runs are not wasted: each one drags a defender, opening the pocket for someone else. The best attacking teams move defenders like furniture before the decisive pass — the run that does not receive the ball is often the one that created the goal.'] },
      { h: 'The five-minute checklist', p: [
        'In the first five minutes, answer five questions. Who presses and who blocks? Which side has more of the ball, and is that by choice? Where does each team\'s most creative player pick it up? Which full-back attacks and which stays home? Where are the mismatches — the fast winger against the slow defender the attacking team keeps hunting?',
        'Those answers are the plot of the match. Everything after is development: the trailing coach\'s substitutions around the hour, the shape change when a lead needs protecting, the space that finally opens as legs tire. Watch this way once and the sport becomes a text you can read — which is, quietly, the whole pleasure of tournament football.'] },
    ],
  },
  {
    slug: 'why-transitions-decide-modern-games',
    category: 'tactics',
    title: 'The Five Seconds That Decide Everything: Transitions in Modern Football',
    excerpt:
      'The most dangerous moment in football is not the free kick or the corner — it is the instant possession changes hands. Why elite coaches obsess over transitions, and how to spot them.',
    date: '2026-07-21',
    minutes: 6,
    author: 'The Xaa Desk',
    sections: [
      { h: '', p: [
        'Ask a modern coach when goals happen and you will hear one word more than any other: transition. The moment the ball changes hands, both teams are briefly in the wrong shape — attackers caught upfield, defenders not yet set. Analysis of tournament goals confirms it cycle after cycle: a large share arrive within a few seconds of a turnover.',
        'The logic is simple. A settled defence is nine outfield players in position, drilled for weeks. A defence in transition is whoever happens to be nearby, running backwards. Everything difficult about attacking football becomes easy for about five seconds — if you are fast enough.'] },
      { h: 'The counter-attack and the counter-press', p: [
        'Teams answer the transition moment in two opposite ways. The counter-attacking side wins the ball and sprints — two or three vertical passes, runners flooding the space the opponent\'s attack vacated. The counter-pressing side loses the ball and hunts — swarming the new owner within seconds to win it back while the opponent is still disorganised.',
        'Both strategies weaponise the same five seconds from opposite ends. And both carry a price: counter-attacking means conceding possession and territory for the match\'s duration; counter-pressing means sprinting relentlessly and leaving space behind if the press is beaten. Tournament coaches choose based on their squad\'s legs, and their choice is visible within minutes.'] },
      { h: 'Rest defence: the insurance policy', p: [
        'The counter to the counter is what analysts call rest defence — the positions a team holds WHILE attacking, as insurance against the turnover. Watch a possession side in the opponent\'s box: two centre-backs and often a holding midfielder stand deliberately short of the action, guarding the escape routes before the escape is attempted.',
        'The tell of an elite team is not how it attacks but how rarely it is countered. That is rest defence working — the unglamorous geometry that lets a side commit six players forward without dying on every loss. When a team keeps getting caught by identical counter-attacks, its rest defence has failed, and the analysts in the opposing camp found it first.'] },
      { h: 'Tournament football is transition football', p: [
        'Knockout tournaments amplify all of this. National teams lack the training time for intricate positional attacks, defences sit deeper as the stakes rise, and tired legs in the second half turn every loose ball into a foot race. The result: World Cup knockout goals lean even harder on transitions than club football does.',
        'So watch the turnovers. When possession changes, count to five before your eyes follow the ball — watch instead who sprints, who walks, and how many defenders stayed home. Inside those five seconds, more than anywhere else, is where the 2026 World Cup will be decided.'] },
    ],
  },
  {
    slug: 'defending-a-lead-art-or-crime',
    category: 'tactics',
    title: 'Parking the Bus: The Art and Agony of Defending a Lead',
    excerpt:
      'Nothing in football is mocked more, or harder to do well. What actually happens when a team decides to protect a one-goal lead — and why it goes wrong so spectacularly.',
    date: '2026-07-22',
    minutes: 6,
    author: 'The Xaa Desk',
    sections: [
      { h: '', p: [
        'Every tournament produces the same scene: a team scores, retreats, invites forty minutes of siege and either survives to be called streetwise or concedes in the ninetieth minute to be called cowards. Defending a lead is football\'s most reviled skill and one of its most difficult — a discipline with its own techniques, its own psychology and a razor-thin line between control and collapse.',
        'The sneer — "parking the bus" — hides how much craft is involved. Low blocks that hold are built, not improvised.'] },
      { h: 'What a good low block actually does', p: [
        'A drilled low block is not passive. It concedes the harmless zones — sideways passes fifty metres out — while sealing the box and the pocket in front of it. Defenders shuffle as a connected unit, closing passing lanes rather than chasing the ball; the striker still presses just enough to stop free measured deliveries. The defending team decides where the attack is allowed to go, then waits there.',
        'The masters of it treat clearances as passes: out to a target man, into a corner to chase, anywhere that buys thirty seconds of relief and forces the siege to reset. Surviving a lead is substantially the management of these small escapes.'] },
      { h: 'Why it collapses', p: [
        'The failure mode is creeping passivity. The line drops a metre every five minutes, the midfield stops stepping out, the clearing header lands straight back at an attacker\'s feet — and the block that chose its battles is now defending forty crosses. Physically, defending a siege costs more than it looks; psychologically, a team that stops imagining the counter-attack has already half-conceded.',
        'The statistical reality is brutal: expected-goals accumulate for the attacking side with every added minute of territory, and one deflection, one penalty-box scramble, one set piece is all the arithmetic needs. Coaches call the antidote "playing with the lead" — keeping possession spells and a counter threat alive — and it is the first skill to vanish in tired legs.'] },
      { h: 'How to judge it fairly', p: [
        'Before mocking a low block in 2026, check three things. Does the defending team still counter — sprinting three players forward on each recovery — or has it abandoned the halfway line entirely? Are clearances finding targets or gifting the ball back? Is the goalkeeper managing tempo or just delaying?',
        'A side doing those three things is executing a plan as deliberate as any pressing scheme, and neutrals should read it as chess rather than fear. A side doing none of them is not parking the bus; it is closing its eyes. The final scoreline usually tells you which one you watched.'] },
    ],
  },
  {
    slug: 'heat-travel-and-tactics-2026',
    category: 'tactics',
    title: 'Three Countries, Four Time Zones: How Geography Will Shape the 2026 Tactics',
    excerpt:
      'Summer heat, altitude, air-conditioned domes and continental flights — the 2026 World Cup is a logistics puzzle, and the teams that solve it will play visibly different football.',
    date: '2026-07-22',
    minutes: 6,
    author: 'The Xaa Desk',
    sections: [
      { h: '', p: [
        'The 2026 World Cup is the most geographically sprawling tournament ever staged: sixteen host cities across the United States, Canada and Mexico, spanning four time zones, sea level to high altitude, roofed arenas to open summer sun. For coaches, that map is not trivia — it is a tactical variable as real as any opponent.',
        'Previous tournaments offer the evidence. Heat slows pressing, altitude changes the flight of the ball and the cost of every sprint, and travel days steal recovery. The staffs that plan for geography consistently outlast the ones that plan only for opponents.'] },
      { h: 'What heat does to tactics', p: [
        'High temperatures suppress high pressing — the all-pitch hunts of European club football are physiologically unaffordable in an afternoon kick-off in July. Expect more mid-blocks, slower build-up, longer possession spells used partly as rest, and drinks breaks that function as mini team talks. Matches in heat structurally resemble chess more than sprinting.',
        'Kick-off times will matter enormously: the same fixture at noon and at nine in the evening is two different sports. Squads built on relentless running will quietly pray for night games; technical possession sides can survive the sun better. Watch how differently the same team plays across its scheduled slots.'] },
      { h: 'Altitude and the dome factor', p: [
        'Mexico City sits above 2,200 metres, where thinner air means a faster ball, longer shots dipping late, and aerobic costs that punish unacclimatised lungs — history shows visiting teams struggle there for identifiable physiological reasons. Meanwhile several US venues are air-conditioned domes where conditions are laboratory-perfect regardless of the season outside.',
        'A group drawn across these extremes faces genuinely different sports week to week. Federations chose their base camps with this in mind, and some will time altitude acclimatisation like a military operation. When a heavy favourite looks strangely flat at altitude, remember: the pitch is level, the oxygen is not.'] },
      { h: 'Travel as the invisible opponent', p: [
        'Between matches, teams cross distances European tournaments never ask — flights of several hours and multiple time zones, each one degrading sleep and recovery. Sports science treats every hour of time-zone shift as a day of adjustment; schedules simply do not always grant those days.',
        'The tactical consequence is rotation. Five substitutions and twenty-six-man squads exist for exactly this tournament, and the sides that trust their squad depth — resting sprinters after long travel legs, saving legs in decided games — will arrive at the knockouts with a hidden advantage no camera shows. Geography, in 2026, is a member of every coaching staff.'] },
    ],
  },
  {
    slug: 'the-third-place-match-story',
    category: 'history',
    title: 'The Match Nobody Wants and Everybody Enjoys: A History of the Third-Place Game',
    excerpt:
      'Two heartbroken teams, nothing but bronze at stake — and somehow, decade after decade, the World Cup\'s third-place match produces its most open, joyful football.',
    date: '2026-07-19',
    minutes: 6,
    author: 'The Xaa Desk',
    sections: [
      { h: '', p: [
        'It is played by two squads still grieving their semi-final, watched by fans who booked flights for a different match, and dismissed every four years as pointless. And yet the World Cup\'s third-place play-off keeps producing the same paradox: freed from terror, teams simply play — and the bronze match ends up among the tournament\'s most entertaining fixtures.',
        'The numbers back the folklore: third-place games are reliably higher-scoring than the finals they precede. Grief, it turns out, is lighter than fear.'] },
      { h: 'Where the fixture came from', p: [
        'The play-off has been part of every World Cup since 1934\'s knockout experiment gave way to a settled format, surviving repeated attempts to abolish it. Federations value it for one blunt reason — a full stadium and a global broadcast slot — while coaches quietly value it as a farewell: one last cap for the veteran, a debut for the youngster, a proper goodbye instead of a silent departure.',
        'For the players, the medal is real. Squads that stood devastated on Wednesday routinely describe Saturday\'s bronze as the moment the tournament became a memory worth keeping rather than a wound.'] },
      { h: 'The afternoons it gave us', p: [
        'The fixture\'s history is a highlight reel of liberated football: host nations given a final farewell by their crowds, veterans scoring their last international goals, back-up goalkeepers and third-choice strikers writing themselves into tournament almanacs. Some of the World Cup\'s most rewatched goals were scored with nothing but third place at stake.',
        'It has also served as a stage for reconciliation — squads playing for a coach on his way out, football federations mending rivalries in a match too light to carry animosity. The bronze game is the tournament with its shoulders finally relaxed.'] },
      { h: 'Watch it in 2026', p: [
        'The advice for the new tournament is simple: do not skip it. Expect rotated line-ups, expect goals, expect the strange sweetness of two crowds applauding both anthems without a knot in the stomach. Somewhere in the match will be a farewell worth witnessing — there always is.',
        'And spare a thought for the losers of it, fourth place being sport\'s loneliest rank: the best team to leave a World Cup with nothing. Even that has its dignity. Only four squads out of forty-eight will still be playing on the tournament\'s final weekend — and two of them will be in this game.'] },
    ],
  },
  {
    slug: 'world-cup-balls-history',
    category: 'history',
    title: 'From Leather Bricks to Flying Sensors: A History of the World Cup Ball',
    excerpt:
      'Every four years, a new ball — and a new controversy. How the World Cup\'s footballs evolved from waterlogged leather to chipped, sensor-laden spheres that referee matches.',
    date: '2026-07-20',
    minutes: 6,
    author: 'The Xaa Desk',
    sections: [
      { h: '', p: [
        'No piece of equipment in sport carries more ceremony than the World Cup ball. Unveiled months before the tournament with a name and a design story, adored by marketers and mistrusted by goalkeepers, the official ball is a four-yearly argument wrapped in polymer. Its history is, quietly, a history of the game itself.',
        'The very first final in 1930 could not even agree on one: Argentina and Uruguay each insisted on their own ball, so the match used both — one per half. The scoreline shifted with the equipment, and football\'s longest-running technical debate was born.'] },
      { h: 'The leather age', p: [
        'For decades the ball was tanned leather panels around a rubber bladder — handsome, heavy and hydrophilic. On wet days it drank water and gained weight; heading it was an act of courage, and players of the era describe laces leaving imprints on foreheads. Colour was function too: the white ball appeared for visibility under floodlights, the famous black-and-white panels arrived in 1970 so viewers on black-and-white televisions could follow the flight.',
        'That 1970 design — thirty-two stitched panels, twelve black pentagons — became the drawing every child on earth makes when asked to draw a football. Few industrial designs have ever achieved such total symbolic capture.'] },
      { h: 'The synthetic revolutions', p: [
        'Synthetic materials ended the waterlogging era in the 1980s, and from there each cycle chased physics: fewer panels, thermal bonding instead of stitches, textured surfaces to manage airflow. Not every experiment landed — one notoriously smooth edition swerved so unpredictably that goalkeepers denounced it as a beach ball, and its name remains a curse word in the profession.',
        'The controversies were not mere whining. Aerodynamicists confirmed that panel geometry changes flight behaviour at shooting speeds, meaning the sport genuinely alters its projectile every four years — an oddity no other major sport tolerates, and secretly one of the World Cup\'s recurring subplots.'] },
      { h: 'The ball becomes a referee', p: [
        'The modern ball is an instrument: an inertial sensor suspended at its centre reports its position hundreds of times per second, feeding semi-automated offside decisions and settling touch disputes — including, at the 2022 tournament, whether a striker\'s header had grazed the ball on its way to a famous goal. The sphere now testifies in its own matches.',
        'The 2026 edition will arrive with its own name, launch film and inevitable goalkeeper complaints. Enjoy the ritual for what it is: the only piece of sporting equipment with a biography, a sensor array and a seat at the tournament\'s every decisive moment.'] },
    ],
  },
  {
    slug: 'hosts-who-changed-the-world-cup',
    category: 'history',
    title: 'When the Host Writes the Story: Tournaments That Changed the World Cup',
    excerpt:
      'Host nations do more than supply stadiums — they set the tournament\'s mood, its politics and sometimes its rules. The hostings that permanently changed football\'s biggest event.',
    date: '2026-07-21',
    minutes: 7,
    author: 'The Xaa Desk',
    sections: [
      { h: '', p: [
        'Every World Cup carries its host\'s fingerprints. The heat, the time zones, the crowds, the politics — the tournament is never staged in a vacuum, and some hostings have altered the event so thoroughly that the World Cup that followed them was a different institution. As the United States, Canada and Mexico prepare the largest edition ever, the history of transformative hosts is worth revisiting.',
        'The pattern repeats: a hosting arrives with a question — can this country stage it? should it? — and leaves having rewritten some assumption about what the tournament is.'] },
      { h: 'The pioneers and the statements', p: [
        'Uruguay 1930 invented the thing: a small nation building a hundred-thousand-seat stadium in months to declare football the property of the whole world, not just Europe. Mexico 1970 gave the tournament its global television age — satellite broadcasts in colour, kick-offs timed for European audiences, and heat-and-altitude football that forced the game to slow down and think.',
        'The 1994 United States edition answered the sceptics\' favourite question — could the World Cup thrive in a country without a top league? — with attendance records that still stand. Its legacy was structural: a professional league founded as a condition of hosting, and proof that the tournament could be an engine for building football rather than a reward for already having it.'] },
      { h: 'The expansions and the firsts', p: [
        'Other hosts moved the borders. Japan and South Korea 2002 staged the first co-hosted and first Asian World Cup, normalising the idea that the tournament could live anywhere; South Africa 2010 brought it to Africa with a hosting remembered as much for its sound and celebration as its football. Qatar 2022 moved the event to winter and into the smallest host in history, proving the calendar itself was negotiable.',
        'Each first arrived wrapped in doubt and left the map permanently larger. The 2026 tri-nation format — three countries, sixteen cities, a tournament the size of a continent — is the direct heir of those precedents.'] },
      { h: 'What hosting actually leaves behind', p: [
        'The honest ledger of World Cup legacies is mixed: some hosts gained leagues, infrastructure and a generation of players; others gained stadiums with no tenants. Researchers who study mega-events find the durable legacy is rarely concrete — it is participation, visibility and the domestic game\'s place in the national imagination.',
        'That is the standard 2026\'s hosts will be measured against: not the group-stage atmosphere, but where football in North America stands a decade later. The World Cup always goes home after a month. What it leaves behind is the real final score.'] },
    ],
  },
  {
    slug: 'world-cup-watch-party-guide',
    category: 'culture',
    title: 'The Complete World Cup Watch Party Guide (Time Zones Included)',
    excerpt:
      'A month of football, a hundred matches, friends in different time zones — how to actually organise watching the 2026 World Cup, from the group-stage marathon to the final.',
    date: '2026-07-18',
    minutes: 6,
    author: 'The Xaa Desk',
    sections: [
      { h: '', p: [
        'A World Cup is not a television event; it is a month-long living arrangement. From mid-June to mid-July 2026, up to four matches a day will roll across the schedule, and everyone on earth with a screen will make the same series of decisions: what to watch live, what to sacrifice to sleep, and who to watch it with. A little planning multiplies the joy.',
        'The 2026 tournament\'s North American staging sets the clock for everyone: comfortable afternoon and evening viewing across the Americas, late nights for Europe and Africa, and heroic dawn shifts for Asia and Oceania. Plan accordingly — this is a marathon with fixtures.'] },
      { h: 'Choose your matches like a curator', p: [
        'A hundred and four matches cannot all be appointments. The group stage\'s secret is the third round: simultaneous kick-offs within each group, tables changing live, the tournament\'s best pure drama. Book those days early. Add your own team\'s matches, one wildcard fixture a week — a debutant nation, a group-of-death collision — and leave the rest to highlights without guilt.',
        'From the round of 32 the calculus flips: every match is elimination, and the best viewing strategy is surrender. The quarter-final weekend is traditionally the tournament\'s peak — four matches, two days, football\'s equivalent of a festival headline slot.'] },
      { h: 'The gathering itself', p: [
        'The best watch parties respect the match\'s rhythm: serious viewing during play, socialising at half-time, no plot-critical conversation during added time. Food that survives distraction beats food that demands attention — the entire planet\'s street-food traditions exist for exactly this occasion, and a group-stage month is a fine excuse to eat along with the fixture list, cooking a dish from one of the day\'s competing nations.',
        'Mixed-allegiance rooms need only one rule: everyone may celebrate, nobody may gloat past the ninety-minute mark. Some of the best World Cup memories are consoling a friend whose team just exited on penalties — that, too, is the tournament working as designed.'] },
      { h: 'Surviving the month', p: [
        'Pace yourself like the players: rotation and recovery. Nobody watches everything; the fixtures you skip make the ones you keep sacred. If you are hosting repeatedly, share the burden — a World Cup is long enough to ruin one household\'s sofa and grocery budget single-handedly.',
        'And watch at least one match alone, properly, phone down. Amid the parties and the noise, the tournament\'s core pleasure remains what it was in 1930: ninety minutes, twenty-two players, and the possibility of witnessing something people will still describe in fifty years. Do not miss it by looking away.'] },
    ],
  },
  {
    slug: 'football-phrases-for-new-fans',
    category: 'culture',
    title: 'Nutmegs, Howlers and the Group of Death: Football\'s Language, Translated',
    excerpt:
      'Every World Cup recruits millions of new fans into a sport with its own dialect. A friendly glossary of the phrases commentators will use in 2026 without ever explaining them.',
    date: '2026-07-22',
    minutes: 6,
    author: 'The Xaa Desk',
    sections: [
      { h: '', p: [
        'Football commentary assumes you grew up with it. Terms invented on English terraces, translated from Italian newspapers or borrowed from Spanish radio arrive mid-sentence, unexplained, while newcomers nod along. Since the World Cup is the sport\'s great recruitment drive — every edition mints millions of first-time fans — a translation guide seems only fair.',
        'What follows is the working vocabulary of a tournament month: enough to follow any broadcast, win most arguments and understand why a stadium just gasped at something that looked routine.'] },
      { h: 'The moves and the moments', p: [
        'A nutmeg is passing the ball between an opponent\'s legs — trivial in effect, devastating in psychology; crowds react to it like a dunk. A howler is a catastrophic error, usually a goalkeeper\'s. A brace is two goals by one player, a hat-trick three; a clean sheet means conceding none. An own goal needs no translation, only sympathy.',
        'A one-two (or "give-and-go") is passing to a teammate and sprinting for the instant return. A rabona is striking the ball with the kicking leg wrapped behind the standing one — pure showmanship. And "Panenka" names the softly chipped penalty down the middle, after the Czech player who dared it in a major final in 1976 and turned a technique into a legacy.'] },
      { h: 'The tactics talk', p: [
        'Parking the bus means all-out defence. The high press means hunting the ball in the opponent\'s third; a low block is its opposite, a defence camped deep. Between the lines describes the pocket of space behind midfield where creators operate. A false nine is a striker who keeps dropping into midfield instead of staying high.',
        'Route one is the direct long ball toward a tall striker. Tiki-taka names the short-passing possession style associated with Spain\'s golden era. And the group of death is the World Cup\'s most beloved coinage: the group whose draw packed too many strong teams into one place, guaranteeing a giant goes home early.'] },
      { h: 'The tribal poetry', p: [
        'Some of the language is pure inheritance. A derby is a match between local rivals; silverware means trophies; the woodwork is the frame of the goal, cruelly credited whenever it denies a shot. Magic sponge mocks the miraculous recoveries that follow a trainer\'s treatment; simulation is the law\'s polite word for diving.',
        'You will hear that a team "wants it more", which means nothing measurable and everything emotional. By the quarter-finals of 2026 you will be saying it too. Language is how a sport adopts you — and football, whatever the commentators imply, is delighted to have you.'] },
    ],
  },
  {
    slug: 'taking-kids-to-their-first-world-cup-summer',
    category: 'culture',
    title: 'A Child\'s First World Cup: Making the 2026 Tournament a Family Memory',
    excerpt:
      'Ask adults about their first World Cup and watch their faces change. How to give a child the 2026 tournament — wall charts, adopted teams and all — without a single ticket.',
    date: '2026-07-22',
    minutes: 6,
    author: 'The Xaa Desk',
    sections: [
      { h: '', p: [
        'Ask any lifelong football fan where it started and the answer is almost never a league match. It is a World Cup — a summer, a wall chart, a squad of names from a country they could not find on a map. The tournament arrives every four years precisely tuned to childhood: long holidays, bright colours, heroes and heartbreak in month-sized doses.',
        'The 2026 edition, with its family-friendly kick-off times across the Americas and its sheer volume of matches, may be the most child-accessible World Cup ever staged. No tickets required — the memory is made at home.'] },
      { h: 'The wall chart is the gateway', p: [
        'Print the fixture chart and put it somewhere central. Filling in scores by hand — every match, every day — turns the tournament into a month-long family project, teaches the format\'s beautiful arithmetic, and produces an artefact some households keep for decades. Add sticker albums or hand-drawn flags for younger children; the collecting instinct and the tournament were made for each other.',
        'Let the child own the chart. The lopsided handwriting and the tear-stained quarter-final page are the point.'] },
      { h: 'Adopt a second team together', p: [
        'The single best trick for a first World Cup: alongside the family\'s own team, let the child pick a second nation for reasons adults must not veto — the best kit, the coolest flag, a wonderful name. Learn three facts about that country together, cook its food on match days, find it on a map. When it wins, the household celebrates; when it exits, that too is part of the education.',
        'This is how the tournament quietly teaches geography, empathy and the pleasure of caring about strangers. A generation of adults still supports the random nation they adopted at seven — there are worse inheritances.'] },
      { h: 'Let them see you feel it', p: [
        'Children remember the emotion more than the football: a parent leaping off a sofa, a grandmother shouting at a referee, the whole street erupting through open windows. Do not perform calm. The World Cup is one of the few remaining events an entire family — an entire planet — experiences live, together, at the same instant, and that shared feeling is the actual gift.',
        'Keep the chart when it is over. Somewhere around 2046, someone will find it in a drawer and phone home just to talk about that summer. That is what the tournament is for; the football is only the delivery mechanism.'] },
    ],
  },
];
