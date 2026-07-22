import type { Article, Category } from './types';
import { ARTICLES_BATCH2 } from './articles-batch2';
import { ARTICLES_BATCH3 } from './articles-batch3';

/**
 * xaa.es — World Cup 2026 football magazine. Original, independent editorial:
 * the tournament format, teams, players, tactics, history and fan culture.
 * Evergreen and preview writing — we do not fabricate match results.
 */
export const CATEGORIES: Category[] = [
  { slug: 'world-cup-2026', name: 'World Cup 2026', tagline: 'The 48-team tournament across the USA, Canada and Mexico', icon: '🏆' },
  { slug: 'teams', name: 'Teams', tagline: 'Contenders, dark horses and what separates them', icon: '🌍' },
  { slug: 'players', name: 'Players', tagline: 'Roles, stars and the making of a tournament icon', icon: '⭐' },
  { slug: 'tactics', name: 'Tactics', tagline: 'The press, the build-up, set pieces and shape', icon: '⚽' },
  { slug: 'history', name: 'History', tagline: 'Finals, goals and runs that defined the World Cup', icon: '📖' },
  { slug: 'culture', name: 'Fan Culture', tagline: 'Host cities and the game that unites the planet', icon: '🎉' },
];

export const ARTICLES: Article[] = [
  {
    slug: 'the-48-team-world-cup-explained',
    category: 'world-cup-2026',
    title: 'The 48-Team World Cup, Explained: Everything New About 2026',
    excerpt:
      'For the first time the World Cup grows to 48 teams and 104 matches. How the new group stage, the round of 32 and the best-third-place rule actually work.',
    date: '2026-06-08',
    minutes: 8,
    author: 'The Xaa Desk',
    sections: [
      { h: '', p: [
        'The 2026 World Cup is the biggest in the tournament’s history and the first genuinely new format in nearly three decades. The field expands from 32 nations to 48, the match count jumps from 64 to 104, and the whole thing is spread across three countries — the United States, Canada and Mexico. If the last World Cup you followed closely was a neat 32-team, eight-group affair, several things have changed, and it is worth understanding them before a ball is kicked.',
        'None of it is complicated once you see the shape. The expansion does two things at once: it gives more nations a place at football’s biggest table, and it lengthens the road to the final. Here is how the new machine is built.'] },
      { h: 'Twelve groups of four, not eight', p: [
        'The 48 teams are drawn into twelve groups of four, labelled A to L. Every team plays the other three in its group once, so the group stage is three matches per side, exactly as before. The difference is arithmetic: twelve groups instead of eight means more teams, more matches, and a qualification maths problem the old format never had.',
        'From each group, the top two advance automatically — that is 24 teams. But a knockout bracket needs a power of two, and 24 is awkward. So the format reaches back for a rule familiar from the European Championship: the eight best third-placed teams across all twelve groups also go through, bringing the total to a clean 32.'] },
      { h: 'The new round of 32', p: [
        'Those 32 survivors enter a brand-new knockout round that did not exist in the 32-team era: the round of 32. From there the tournament follows the classic path everyone knows — round of 16, quarter-finals, semi-finals, and the final — every tie a single match decided on the day, extra time and penalties if level.',
        'The practical effect is a longer tournament. A team that reaches the final now plays up to eight matches rather than seven, and the whole event runs from mid-June to mid-July. For the best sides that means an extra knockout hurdle; for a smaller nation it means a realistic route to the last 32 that simply did not exist before.'] },
      { h: 'What the change really means', p: [
        'Expansion is not just more football — it changes incentives. With eight third-placed teams advancing, the group stage becomes a subtler calculation: a single point, or even goal difference against a stronger opponent, can be the margin between going home and reaching the knockouts. Teams can no longer treat a third match as dead.',
        'Critics worry the extra places dilute quality; supporters point out that every previous expansion — from 16 to 24, then 24 to 32 — drew the same complaint and produced some of the tournament’s best underdog stories. Either way, 2026 is the format we have, and understanding its maths is the first step to enjoying it.'] },
    ],
  },
  {
    slug: 'first-three-country-world-cup',
    category: 'world-cup-2026',
    title: 'Why 2026 Is the First Three-Country World Cup',
    excerpt:
      'The United States, Canada and Mexico are co-hosting across sixteen cities and three time zones. What a shared tournament means for teams, travel and atmosphere.',
    date: '2026-06-05',
    minutes: 7,
    author: 'The Xaa Desk',
    sections: [
      { h: '', p: [
        'World Cups have been co-hosted before — Japan and South Korea shared 2002 — but 2026 is the first hosted by three nations at once. The United States takes the lion’s share of matches, with Canada and Mexico hosting their own clusters. It is a tournament stretched across a continent, and that scale shapes everything from scheduling to the feel of the group stage.',
        'A shared World Cup is partly a logistical story and partly a cultural one. Understanding both helps explain why 2026 looks different from any tournament before it.'] },
      { h: 'Sixteen cities, three nations', p: [
        'The matches are spread across sixteen host cities: a large group in the United States, three in Mexico, and two in Canada. Mexico becomes the first country to host World Cup matches in three different tournaments, and its iconic Mexico City stadium is among the most storied grounds in the sport. Canada hosts men’s World Cup matches for the first time.',
        'The distances are real. A tournament that spans from the Pacific to the Atlantic and from Canada to central Mexico involves flights, not coach trips, between many venues. Organisers have grouped early matches to limit travel, but the geography is unavoidable — and part of the point.'] },
      { h: 'What it means for the teams', p: [
        'Travel and climate become tactical variables. A team based in one region for the group stage enjoys rhythm and rest; a run to the final can mean criss-crossing the map. Altitude in Mexico City, humidity in the American south, and cooler northern venues all ask different things of players’ conditioning. Squads with depth and smart scheduling gain an edge that has nothing to do with talent.',
        'Home advantage, meanwhile, is split three ways. Each host nation qualifies automatically and plays in front of its own crowds, but none has the singular home-tournament backing that, say, a lone host enjoys. The advantage is diluted — shared, like the hosting itself.'] },
      { h: 'A continental festival', p: [
        'The upside of all that scale is reach. Three nations with huge, football-loving communities means almost every competing country will find pockets of passionate support in the stands. Group matches can feel like home games for visiting teams whose fans live nearby. That is a genuinely new kind of World Cup atmosphere.',
        'For neutrals, the three-country format is an invitation to sample the sport’s global sweep in one summer: the roar of Mexico City, the modern arenas of the United States, the fresh enthusiasm of Canadian hosts. It is, by design, the most sprawling and inclusive World Cup ever staged.'] },
    ],
  },
  {
    slug: 'how-teams-qualified-2026',
    category: 'world-cup-2026',
    title: 'How Nations Qualified for World Cup 2026',
    excerpt:
      'With 48 places up for grabs, every confederation got more slots — and a new intercontinental play-off decides the last tickets. A clear guide to who got in and how.',
    date: '2026-06-03',
    minutes: 7,
    author: 'The Xaa Desk',
    sections: [
      { h: '', p: [
        'Expanding to 48 teams meant redistributing places across the world’s six football confederations, and the reshuffle changed qualification for everyone. More slots meant more nations dreaming realistically, longer qualifying campaigns, and a dramatic new play-off to settle the final berths. Here is the shape of how the field was filled.'] },
      { h: 'More slots for everyone', p: [
        'Every confederation received a bigger allocation than in the 32-team era. Europe, always the largest bloc, sends the most teams; Africa and Asia both gained several places, widening the door for nations that had spent decades on the edge of qualification. South America, a small confederation with strong sides, saw most of its members qualify directly. The three host nations — the USA, Canada and Mexico — took automatic places, as hosts always do.',
        'The headline effect is representation: continents that historically sent a handful of teams now send noticeably more, and a first-ever World Cup appearance became a live possibility for several federations. Part of the expansion’s stated purpose was exactly this — to make the tournament genuinely global.'] },
      { h: 'The intercontinental play-off', p: [
        'The last places were not handed out by region. A new-look intercontinental play-off gathered teams from different confederations into a mini-tournament, staged shortly before the finals, with a couple of World Cup tickets on the line. It is a high-stakes, winner-takes-all format: months of qualifying condensed into a single decisive window, often on neutral ground.',
        'For the nations involved it is cruelly thin margins — a whole campaign resting on one or two matches against opponents they rarely face. For neutrals it is compelling theatre, and it guarantees that the final few qualifiers arrive having already survived a knockout gauntlet.'] },
      { h: 'Why longer campaigns matter', p: [
        'Bigger allocations also meant longer, denser qualifying campaigns, especially in the largest confederations. That is more than a scheduling note. Long campaigns reward squad depth and consistency over one-off brilliance; they expose teams that rely on a single star and reward those that can grind out results across many matches and many months.',
        'By the time the finals begin, in other words, the 48 teams have each earned their place through a marathon, not a sprint. The expansion did not lower the bar so much as widen the gate — and every nation that walked through it has a qualifying story worth knowing.'] },
    ],
  },
  {
    slug: 'best-third-place-teams-rule',
    category: 'world-cup-2026',
    title: 'The Best-Third-Place Rule: Football’s Most Underrated Drama',
    excerpt:
      'Eight third-placed teams reach the knockouts in 2026, and the race to be among them is a tournament within the tournament. How the maths creates late-night tension.',
    date: '2026-06-10',
    minutes: 6,
    author: 'The Xaa Desk',
    sections: [
      { h: '', p: [
        'Most fans focus on winning the group. But in a 48-team World Cup, some of the sharpest drama lives one place lower — in the scramble to be one of the eight best third-placed teams who sneak into the round of 32. It is a quirk of the format that turns otherwise dead matches into knife-edge affairs, and it deserves more attention than it gets.'] },
      { h: 'How the comparison works', p: [
        'Twelve groups each produce a third-placed team, but only eight of them advance. To rank those twelve against each other, football uses a tie-break ladder: points first, then goal difference, then goals scored, and further tie-breakers beyond. Because the third-placed teams come from different groups and never played each other, they are compared purely on their records.',
        'That comparison is why a single goal, scored or conceded in a match a team has technically already lost, can decide its tournament. A heavy defeat that ruins goal difference can send a team home even on the same points as a rival who lost narrowly. Nothing in the group stage is truly meaningless.'] },
      { h: 'The strategy it forces', p: [
        'The rule reshapes how coaches think. A team out of contention for the top two cannot simply defend for a draw; goal difference may demand it chase a goal, or protect the one it has, right to the final whistle. Managers watch other groups’ scores in real time, adjusting substitutions to the shifting maths of who is currently eighth-best.',
        'For neutrals, the final round of group matches becomes a giant simultaneous puzzle: results in one stadium reorder the qualification picture in another. It is the closest football gets to a live spreadsheet — and it produces some of the tournament’s most unbearable final minutes.'] },
    ],
  },
  {
    slug: 'how-to-follow-world-cup-2026',
    category: 'world-cup-2026',
    title: 'How to Follow World Cup 2026 Without Missing a Thing',
    excerpt:
      'One hundred and four matches across three time zones is a lot of football. A practical guide to pacing yourself, picking a second team, and enjoying the whole tournament.',
    date: '2026-06-11',
    minutes: 6,
    author: 'The Xaa Desk',
    sections: [
      { h: '', p: [
        'A 48-team World Cup is a marathon for viewers as well as players. With 104 matches packed into roughly five weeks, trying to watch everything is a fast route to burnout. The fans who enjoy the tournament most are not the ones who see every minute — they are the ones who follow it wisely.'] },
      { h: 'Pace the group stage', p: [
        'The opening fortnight is a firehose: several matches a day across three time zones. You do not need to drink from all of it. Pick the games that matter to you — your own nation, a couple of favourites, the marquee fixtures — and let the rest wash past as highlights. The group stage rewards a light touch; save your full attention for the knockouts, when every match is win-or-go-home.',
        'A simple habit helps: skim the morning’s results, watch one full match a day properly, and check the group tables to keep the story straight. That is enough to stay fluent in the tournament without living inside it.'] },
      { h: 'Adopt a second team', p: [
        'The single best way to make a World Cup come alive is to adopt a team beyond your own. Pick one before it becomes obvious — a smaller nation with a compelling style, a debutant, a side whose story catches you. Suddenly the group tables have stakes, and a match you would have ignored becomes appointment viewing.',
        'The best adopted teams are often the underdogs, precisely because their runs are finite and thrilling. When they eventually go out — and most do — you will have lived a whole tournament arc in miniature, which is the point.'] },
      { h: 'Know when it gets serious', p: [
        'The tournament changes gear at the knockouts. From the round of 32 onward there are no second chances, no goal-difference calculations, no dead rubbers — just single matches, extra time and penalties. That is when to clear your schedule. The group stage is the World Cup’s wide-angle establishing shot; the knockouts are the close-up.',
        'Above all, confirm kick-off times against official sources before you plan an evening around a game. Across three host countries and many time zones, the fixture that looks like an afternoon match may land in the middle of your night — and there is no worse way to follow a World Cup than by missing the match you meant to watch.'] },
    ],
  },
  {
    slug: 'what-separates-contenders',
    category: 'teams',
    title: 'What Actually Separates a Contender From the Rest',
    excerpt:
      'Every World Cup has a dozen teams who believe they can win it and only a handful who really can. The unglamorous traits that decide which is which.',
    date: '2026-06-12',
    minutes: 7,
    author: 'The Xaa Desk',
    sections: [
      { h: '', p: [
        'Talent gets a team to the World Cup. Something else wins it. Look back across tournaments and the champions rarely have the single best player or even, on paper, the deepest talent — they have a cluster of less glamorous qualities that hold up over seven or eight high-pressure matches in five weeks. Those qualities are what separate genuine contenders from the many good teams who flatter and fade.'] },
      { h: 'Depth over a starting eleven', p: [
        'A World Cup is not won by eleven players; it is won by a squad. Injuries, suspensions, fatigue and the sheer number of matches mean every champion leans on its bench. The teams that go deep can change a game with substitutes as good as the starters, and can lose a key player without losing their shape. A side built around a brilliant first eleven and little behind it is one hamstring away from collapse.',
        'This is why tournament favourites are so often the nations with strength in every position rather than a couple of superstars. Depth is boring to talk about and decisive to have.'] },
      { h: 'A clear, repeatable identity', p: [
        'Contenders know who they are. They have a way of playing they can fall back on when a match tightens and nerves rise — a defensive structure, a pressing trigger, a set-piece routine — that does not depend on inspiration. Teams without that identity look wonderful when things flow and lost when they do not.',
        'Tournaments are won in the difficult games, not the easy ones. The champion is usually the team that can win ugly: grind out a 1–0, survive a bad night, and advance without playing well. That resilience comes from structure, not flair.'] },
      { h: 'Nerve when it matters', p: [
        'Finally, there is temperament. Knockout football is decided by fine margins under extreme pressure — a penalty, a defensive lapse, a moment of composure in the box. The teams that win are the ones whose best players stay calm when the stakes peak, and whose weaker links do not crack. It is the least measurable quality and often the most decisive.',
        'None of this makes for exciting preview copy. But if you want to pick a champion rather than a crowd-pleaser, look past the highlight reels to the depth, the structure and the nerve. That is where World Cups are actually won.'] },
    ],
  },
  {
    slug: 'anatomy-of-a-dark-horse',
    category: 'teams',
    title: 'The Anatomy of a World Cup Dark Horse',
    excerpt:
      'Every tournament throws up a team nobody expected to go far. The shared ingredients behind the great surprise runs — and why they almost always end.',
    date: '2026-06-14',
    minutes: 7,
    author: 'The Xaa Desk',
    sections: [
      { h: '', p: [
        'The dark horse is the World Cup’s favourite character: the unfancied side that catches fire, knocks out a giant, and carries a continent’s neutral affection into the later rounds. These runs feel like magic, but they are not random. Look across the great surprise campaigns and the same ingredients recur.'] },
      { h: 'A settled, fearless group', p: [
        'Dark horses are almost never assembled from scattered superstars; they are tight, settled squads who have played together for years, often under one coach with a clear plan. They arrive with nothing expected of them, which is its own weapon — no weight of favouritism, no national pressure to win, just freedom to play. That looseness lets them attack teams that are busy managing expectation.',
        'The best surprise teams also tend to have one or two players enjoying the tournament of their lives, and a goalkeeper in inspired form. A hot goalkeeper, in particular, is the quiet engine of almost every deep underdog run.'] },
      { h: 'A style that travels', p: [
        'Surprise runs favour teams with a defined, low-risk identity: organised defence, discipline, and a clear route to goals — often the counter-attack or set pieces. Against stronger opponents who must come forward, a compact, well-drilled side has a plausible plan: absorb, frustrate, and strike. Flair-heavy teams without structure rarely spring the surprise; disciplined ones do.',
        'The knockout format helps. In a single match, the better team does not always win — one goal, one save, one penalty can decide it. Over a group, quality tells; over ninety minutes, anything can happen, and dark horses live in that gap.'] },
      { h: 'Why it almost always ends', p: [
        'The romance of the dark horse is bound up with its fragility. Depth eventually tells: the settled eleven tires, a key player is injured or suspended, and there is less behind them than behind the giants. The magic that carried them — the hot goalkeeper, the striker in the form of his life — is by nature temporary. Most runs end a round or two short of the ultimate prize.',
        'But that is exactly why we love them. The dark horse offers a complete story inside a single tournament: the rise, the belief, the giant slain, and the eventual, honourable fall. Adopt one early and you will get the most human experience the World Cup has to offer.'] },
    ],
  },
  {
    slug: 'weight-of-defending-champions',
    category: 'teams',
    title: 'The Weight of the Crown: Why Defending Champions Struggle',
    excerpt:
      'Reigning World Cup winners have a long history of early exits. The psychology, the squad cycles and the target-on-your-back effect behind the champions’ curse.',
    date: '2026-06-16',
    minutes: 6,
    author: 'The Xaa Desk',
    sections: [
      { h: '', p: [
        'There is a strange, well-documented pattern in World Cup history: the reigning champions often struggle badly at the next tournament, several crashing out in the group stage. It has happened enough times to earn a nickname — the champions’ curse — and while there is no actual hex, the reasons behind it are real and instructive.'] },
      { h: 'Squads age together', p: [
        'A World Cup-winning squad is usually a group of players at their collective peak. Four years later, that same core is four years older, and peaks do not last. Legs slow, injuries accumulate, and the balance between experience and energy tips the wrong way. Rebuilding a champion mid-cycle is hard, because success buys loyalty to players who may be past their best.',
        'The nations that avoid the curse are the ones brave enough to refresh a winning team — to move on from heroes before sentiment says they should. It is one of the hardest decisions in football, and few managers get it exactly right.'] },
      { h: 'The target on your back', p: [
        'Champions also lose the element of surprise. Every opponent studies them, prepares specifically for them, and raises its game to face the holders — a match against the world champions is the game of a smaller nation’s life. The champions get every rival’s best shot while carrying the heaviest expectations, a punishing combination.',
        'There is a psychological weight, too. Having climbed the mountain, the hunger that drove the first triumph can quietly fade, replaced by the burden of protecting a status rather than the freedom of chasing one. Motivation is invisible and decisive.'] },
      { h: 'Breaking the pattern', p: [
        'None of this is destiny. Champions have successfully defended the trophy, and plenty have at least gone deep. The ones who do tend to share the contenders’ traits — depth, a refreshed core, a clear identity — plus the humility to treat every match as if they had won nothing. The crown is heavy, but it is not a sentence. It is a test of whether a team can stay hungry after getting everything it wanted.'] },
    ],
  },
  {
    slug: 'does-home-advantage-still-matter',
    category: 'teams',
    title: 'Does Home Advantage Still Matter at a World Cup?',
    excerpt:
      'Host nations have a proud World Cup record, but 2026’s shared hosting tests the idea. What home advantage really is, and why part of it is fading.',
    date: '2026-06-18',
    minutes: 6,
    author: 'The Xaa Desk',
    sections: [
      { h: '', p: [
        'Host nations have historically over-performed at World Cups, and several have won on home soil. But home advantage is not one thing — it is a bundle of effects, some powerful and some overstated. With 2026 shared across three countries, it is a good moment to ask what home advantage actually buys, and how much of it survives the modern game.'] },
      { h: 'The real ingredients', p: [
        'The genuine advantages are concrete. A host nation qualifies automatically, sparing it a gruelling campaign and letting it prepare in peace. It plays in familiar conditions — climate, altitude, pitches — and sleeps in its own beds while opponents travel. And it plays before enormous, partisan crowds whose energy is real: home support demonstrably lifts players and, subtly, influences the fine judgements of officials.',
        'These are not myths. Across sports, home teams win more often than away teams, and a World Cup concentrates the effect in front of the largest, most emotional audiences a player will ever face.'] },
      { h: 'What is fading', p: [
        'Some of the classic edge has eroded, though. Modern players are globally travelled professionals for whom foreign stadiums and long flights are routine; the away side is far less rattled than it once was. Video analysis means no host enjoys the mystery it might have decades ago. And in 2026 the advantage is literally divided three ways — none of the hosts has the singular, whole-country backing a lone host enjoys.',
        'A shared World Cup dilutes the psychological monopoly of being “the host nation.” The crowds will still be loud and largely friendly, but the sense of an entire country holding its breath for one team is spread thinner than usual.'] },
      { h: 'The verdict', p: [
        'Home advantage in 2026 is real but reduced. The hosts gain the practical benefits — automatic qualification, familiarity, friendly crowds — without the concentrated national fervour of a solo host. History says do not dismiss a host nation; logic says do not overrate one, either. As ever, home comfort is a tailwind, not a guarantee, and the football still has to be played.'] },
    ],
  },
  {
    slug: 'what-group-of-death-means',
    category: 'teams',
    title: 'What “Group of Death” Really Means',
    excerpt:
      'Every draw produces one, and pundits love the phrase. What actually makes a group of death — and why the 2026 format changes the calculation.',
    date: '2026-06-13',
    minutes: 5,
    author: 'The Xaa Desk',
    sections: [
      { h: '', p: [
        'Minutes after every World Cup draw, the same phrase fills the airwaves: the group of death. It is one of football’s favourite clichés, and like most clichés it points at something real while being used far too loosely. So what actually earns a group the grim title?'] },
      { h: 'Strength, not just names', p: [
        'A true group of death is not simply a group with famous teams — it is a group where too many genuinely strong sides are packed together, so that a good team is likely to go home. The essence is a mismatch between quality and places: four teams capable of the knockouts fighting for two automatic spots. The more evenly matched and the deeper the quality, the deadlier the group.',
        'Groups with one giant and three weaker sides are not groups of death, however glamorous the giant — the outcome is rarely in doubt. Death requires competition: several teams who could all plausibly progress, and at least one very good one who will not.'] },
      { h: 'How 2026 changes it', p: [
        'The expanded format softens the concept. With the top two plus the best third-placed teams advancing, a strong side that finishes third in a brutal group can still survive — the guillotine is less absolute than in the 32-team era, when third meant elimination. A group of death in 2026 threatens a good team, but no longer guarantees its execution.',
        'That is a quiet but meaningful shift. The phrase will survive because it is irresistible, but the maths behind it has grown gentler. In the new World Cup, even the group of death gives you a chance of a reprieve.'] },
    ],
  },
  {
    slug: 'what-scouts-watch-in-a-player',
    category: 'players',
    title: 'What Scouts Actually Watch When You’re Watching the Ball',
    excerpt:
      'Great scouting is about the moments away from the ball. The habits, movements and decisions that separate a good player from a tournament-defining one.',
    date: '2026-06-20',
    minutes: 7,
    author: 'The Xaa Desk',
    sections: [
      { h: '', p: [
        'When most of us watch football, our eyes follow the ball. When scouts watch, they often do the opposite — they watch the players without it. That single shift in attention is the difference between seeing highlights and seeing a footballer, and it explains why the players who decide World Cups are not always the ones who fill the highlight reels.'] },
      { h: 'Movement off the ball', p: [
        'A striker’s most important work happens before the pass arrives: the run that drags a defender out of position, the checked shoulder that creates a yard, the timing that turns an offside trap into a clean through-ball. Scouts watch a forward’s movement in the seconds when he is not involved, because that is where goals are truly made. The finish is the easy part; the space was the achievement.',
        'The same is true across the pitch. A midfielder’s scanning — how often he looks over his shoulder to map the game before the ball reaches him — predicts how quickly and well he will play once it does. Good players know what they will do before they have to do it.'] },
      { h: 'Decisions under pressure', p: [
        'Technique impresses in training; decisions win matches. Scouts prize the player who consistently chooses the right option at speed under pressure — the simple pass when it is on, the ambitious one only when it is worth the risk. Flashy players who force the spectacular are often less valuable than unglamorous ones who almost never waste possession. Tournaments punish poor decisions ruthlessly.',
        'Consistency matters as much as peak. A player who does the right thing eight times out of ten, every match, is worth more than one capable of genius once a game and chaos the rest.'] },
      { h: 'The unseen work', p: [
        'Finally, scouts watch the effort nobody applauds: the defensive run a winger makes to cover his full-back, the pressing that starts from the front, the willingness to do the ugly work when a match is tight. Tournament football is decided in these margins, and coaches trust players who do them. A squad full of talent but short on graft tends to look wonderful in the group stage and vulnerable in the knockouts.',
        'The next time you watch a match, try it once: pick a player and follow him for ten minutes without the ball. You will start to see the game the way the people who build teams do — and you will understand why some of the tournament’s most important players are the ones you barely noticed.'] },
    ],
  },
  {
    slug: 'goalkeeper-became-a-playmaker',
    category: 'players',
    title: 'How the Goalkeeper Became a Playmaker',
    excerpt:
      'The modern keeper is expected to start attacks with his feet, not just stop shots. How the role transformed, and why it can win or lose a World Cup match.',
    date: '2026-06-22',
    minutes: 6,
    author: 'The Xaa Desk',
    sections: [
      { h: '', p: [
        'For most of football history the goalkeeper had one job: keep the ball out. Today he is asked to be the first attacker as well as the last defender — to receive passes under pressure, to build play with his feet, and to make decisions that used to belong to midfielders. It is one of the most complete transformations of any position in the sport, and at a World Cup it is decisive.'] },
      { h: 'From shot-stopper to first passer', p: [
        'The change was driven by the rise of playing out from the back. When a team wants to build attacks patiently from its own goal, the goalkeeper becomes a spare passer who lets his side outnumber the opponent’s press. That demands composure and range of passing that keepers of previous eras were never taught. A modern top keeper is, in effect, an outfield player who also happens to be brilliant with his hands.',
        'The reward is control; the risk is catastrophe. A misplaced pass from the goalkeeper is not a turnover in midfield — it is very often a goal. The position now carries a kind of pressure it never used to.'] },
      { h: 'Still the last line', p: [
        'None of this has replaced the old arts. A keeper still wins matches with reflex saves, with command of his box on crosses, and with the one-on-one bravery that decides tight games. In tournament knockouts the shot-stopping fundamentals return to centre stage, and a keeper in inspired form is, as we have said elsewhere, the quiet engine of many an underdog run.',
        'And then there are penalties. In a shootout the goalkeeper becomes the single most important player on the pitch — the one figure who can be a hero at no risk, since he is not expected to save. A World Cup can turn on a keeper’s guess in a shootout, which is as much theatre as sport.'] },
      { h: 'Judging a modern keeper', p: [
        'To assess a goalkeeper now, watch more than his saves. Watch how calm he is with the ball at his feet under a press, how well he commands his defence, how he reads danger before it arrives. The best in the world combine all of it: the passing of a midfielder, the presence of a leader, and the reflexes that still, in the end, define the job. In 2026, as ever, do not be surprised if a tournament is decided by the player in gloves.'] },
    ],
  },
  {
    slug: 'changing-job-of-the-number-nine',
    category: 'players',
    title: 'The Changing Job of the Number 9',
    excerpt:
      'From poachers to false nines to complete forwards, the centre-forward role keeps reinventing itself. What a modern striker is actually asked to do.',
    date: '2026-06-24',
    minutes: 6,
    author: 'The Xaa Desk',
    sections: [
      { h: '', p: [
        'The number 9 — the central striker — is football’s glamour role, the position of goals and glory. It is also one of the most restlessly reinvented. What a centre-forward is expected to do has changed several times over, and understanding those shifts helps explain why some prolific scorers thrive at a World Cup and others vanish.'] },
      { h: 'The poacher and the target man', p: [
        'The classic archetypes are the poacher and the target man. The poacher lives in the penalty area, a specialist in movement and finishing whose genius is being in the right place — he may touch the ball only a handful of times and score twice. The target man is the opposite: big, strong, a reference point who holds the ball up, wins headers, and brings others into play. Both are still valuable, and both still win matches.',
        'For decades most teams built around one or the other. The striker’s job was, essentially, to finish what the team created.'] },
      { h: 'The false nine and the complete forward', p: [
        'Then came the false nine — a forward who drops deep into midfield, abandoning the penalty area to drag central defenders out of position and create space for others to run into. It turned the striker from a finisher into a creator, and confounded defences trained to mark a fixed target. It is a tactic more than a player type, and used well it can unlock the most organised defence.',
        'The modern ideal, though, is the complete forward: a striker who can do all of it — finish like a poacher, hold up play like a target man, drop in like a false nine, press from the front, and carry the ball in transition. Few players truly manage the whole list, which is why the ones who do are the most coveted in the sport.'] },
      { h: 'Why it matters at a World Cup', p: [
        'Tournament football tests strikers unusually hard. Chances are scarce against deep, disciplined defences, so ruthless finishing matters more than in a free-flowing league season. But the striker who cannot contribute beyond goals becomes a passenger in the matches where the goals do not come — and at a World Cup, some of those matches are unavoidable. The forwards who define tournaments tend to be the ones who help the team even on the nights they do not score. Watch for that, not just the goal tally.'] },
    ],
  },
  {
    slug: 'why-tournaments-launch-young-stars',
    category: 'players',
    title: 'Why the World Cup Launches Young Stars',
    excerpt:
      'Nearly every tournament crowns a breakout teenager or twenty-something. The reasons the biggest stage so often belongs to its youngest players.',
    date: '2026-06-26',
    minutes: 6,
    author: 'The Xaa Desk',
    sections: [
      { h: '', p: [
        'There is a reliable World Cup ritual: a young player the wider world barely knew arrives at the tournament and leaves it a global name. It happens almost every four years, and it is one of the event’s great romances — youth seizing the biggest stage. But it is not luck. Several forces make the World Cup unusually kind to its youngest players.'] },
      { h: 'Fearlessness as a weapon', p: [
        'Young players carry less weight. They have not yet learned to fear the occasion, have no history of tournament disappointment to haunt them, and often no established reputation to protect. That freedom shows: they take on defenders, try the ambitious pass, shoot from distance, and play with the joy of someone who cannot quite believe they are there. Against experienced opponents managing pressure, fearlessness is a genuine edge.',
        'The physical peak of a footballer — explosive pace, tireless running — also arrives young. A twenty-year-old in full flight is a problem no amount of experience fully solves.'] },
      { h: 'The surprise factor', p: [
        'Tournaments compress the world’s football into a few weeks, and opponents cannot prepare deeply for a player they have barely seen. An emerging talent enjoys a window of anonymity that a global superstar never has: defenders do not yet know his tricks, his preferred foot, his favourite run. By the time they adjust, the tournament may be half over and the young star already made.',
        'This is why breakout tournaments are so often a player’s first. The second time around, everyone is ready for him.'] },
      { h: 'The making of a legend', p: [
        'A great World Cup at a young age can define a career, but it also sets a burden. The teenager who lights up one tournament spends the next four years carrying the expectation it created. Some kick on to become the defining players of their generation; others never quite recapture that first, unencumbered brilliance. Either way, the breakout is one of football’s purest pleasures — the moment a nation, and often the world, discovers someone new. Keep an eye on the youngest names in 2026; one of them is about to become famous.'] },
    ],
  },
  {
    slug: 'what-a-captain-really-does',
    category: 'players',
    title: 'What a Captain Really Does',
    excerpt:
      'The armband is more than a formality. The real, mostly invisible work of leading a national team through the pressure of a World Cup.',
    date: '2026-06-28',
    minutes: 5,
    author: 'The Xaa Desk',
    sections: [
      { h: '', p: [
        'The captain wears an armband, shakes hands at the coin toss, and lifts the trophy if his team wins. To the casual eye the role looks ceremonial. In reality, leading a national team through a World Cup is a demanding job whose most important parts happen where cameras rarely look.'] },
      { h: 'On the pitch', p: [
        'A captain’s on-field work is about steadiness under stress. When a match is slipping, it is often the captain who slows the tempo, gathers teammates, and resets the team’s composure — a calming presence that keeps eleven anxious players organised. He is the reference point others look to when confidence wobbles, and the one who takes responsibility in the moments nobody else wants: the vital tackle, the penalty, the difficult decision.',
        'Not every captain is the loudest player. Some lead by relentless example, doing the hard, unglamorous work so consistently that others cannot help but follow. Leadership takes many forms; noise is only one of them.'] },
      { h: 'Off the pitch', p: [
        'The larger part of captaincy is invisible. A World Cup squad is dozens of players living together for weeks under intense pressure, far from home, with only a handful able to play each match. Managing that group — keeping the unused players engaged, defusing tension, carrying the mood of the camp — is quiet, constant work, and it falls heavily on the captain. Tournaments are won and lost in the harmony of the dressing room as much as on the grass.',
        'The best captains are a bridge between the manager and the squad, translating the coach’s demands and voicing the players’ concerns. Get that relationship right and a talented group becomes a team; get it wrong and the talent fractures. It is the least visible and most important thing an armband represents.'] },
    ],
  },
  {
    slug: 'offside-law-finally-made-simple',
    category: 'tactics',
    title: 'The Offside Law, Finally Made Simple',
    excerpt:
      'The most misunderstood rule in football is simpler than it looks — and more subtle. A clear guide to what offside is, what it isn’t, and how VAR changed it.',
    date: '2026-06-15',
    minutes: 6,
    author: 'The Xaa Desk',
    sections: [
      { h: '', p: [
        'No rule in football causes more confusion, or more arguments, than offside. Yet at its core it is straightforward, and understanding it properly will change how you watch every match of the World Cup. Let us clear it up once and for all.'] },
      { h: 'The basic rule', p: [
        'A player is in an offside position if, at the moment a teammate plays the ball, he is in the opponent’s half and nearer to the opponent’s goal line than both the ball and the second-to-last defender (usually the last outfield defender, with the goalkeeper being the last). Being in that position is not itself an offence — the player is only penalised if he then becomes involved in the play: receiving the ball, interfering with an opponent, or gaining an advantage from that position.',
        'Two details trip people up. First, the position is judged at the instant the ball is played by the teammate, not when it is received — a player can be onside when the pass is made and yards beyond the defence when he collects it, and still be legal. Second, you cannot be offside from your own half, nor directly from a corner, throw-in or goal kick.'] },
      { h: 'What it is not', p: [
        'Offside is not about where the player is when he touches the ball; it is about where he was when the ball was played to him. It is not an offence to stand in an offside position all day if you never get involved. And a player level with the last defender is onside — the benefit of the doubt, in the letter of the law, goes to the attacker.',
        'Most crowd fury at offside decisions comes from watching the wrong moment: fans see a player clean through and cry foul, forgetting that the relevant instant was the pass, seconds earlier, when he may well have been level.'] },
      { h: 'How VAR changed the feel', p: [
        'Video review made offside forensic. Officials can now freeze the exact frame the ball is played and draw lines to the millimetre, catching offsides invisible to the naked eye — and disallowing goals for a shoulder or a toe. That precision is fairer in theory and colder in practice: the marginal, drawn-line offside has become one of the tournament’s most divisive sights, and the debate over how tight is too tight will follow the game into 2026 and beyond. But the underlying law has not changed. Watch the moment of the pass, and you will rarely be fooled again.'] },
    ],
  },
  {
    slug: 'the-high-press-explained',
    category: 'tactics',
    title: 'The High Press, Explained',
    excerpt:
      'Winning the ball high up the pitch has become the defining tactic of modern football. How pressing works, why it’s so effective, and what it costs.',
    date: '2026-06-17',
    minutes: 6,
    author: 'The Xaa Desk',
    sections: [
      { h: '', p: [
        'If one idea defines modern football, it is the high press: the choice to hunt for the ball high up the pitch rather than sit back and defend one’s own goal. It has reshaped how the best teams play, and it will be everywhere at the World Cup. Here is what it actually means and why it works.'] },
      { h: 'The idea', p: [
        'Pressing means chasing the ball as a coordinated unit to force a turnover, and a high press does it near the opponent’s goal rather than your own. The logic is simple and ruthless: the ball won thirty yards from the opponent’s goal is far more dangerous than the ball won near your own, because the defence is unset and the distance to score is short. Many of the most spectacular goals in modern football begin not with a brilliant pass but with a brilliant tackle high up the field.',
        'A good press is not random chasing. It is triggered — the whole team surges at a specific cue, such as a heavy touch or a pass to a weak passer — and it is coordinated, cutting off passing lanes so the player on the ball has nowhere safe to go. Done well, it turns the opponent’s attempt to build play into a trap.'] },
      { h: 'Why it works', p: [
        'Pressing attacks the modern habit of playing out from the back. Teams that want to build patiently from their own goalkeeper are, by definition, keeping the ball in the most dangerous area to lose it. A press punishes exactly that ambition, forcing mistakes where they hurt most. It also seizes the initiative: a pressing team dictates where the game is played and denies opponents time to think.',
        'There is a psychological cost to the pressed team, too. Being hounded for ninety minutes is exhausting and demoralising; players start to hide from the ball, and the quality of their decisions collapses.'] },
      { h: 'What it costs', p: [
        'The press is not free. It demands extraordinary fitness — pressing hard for a full match, several times in a tournament, in summer heat, is punishing — and it leaves space behind. A team that commits players high up the pitch is vulnerable to one accurate pass that beats the press and springs a counter-attack into the vacated space. The best pressing teams accept that trade and manage it; weaker imitations get caught out.',
        'At a World Cup, where matches come thick and fast and the climate can be brutal, pressing intensity becomes a resource to spend wisely. Watch which teams press relentlessly and which pick their moments — it tells you a great deal about their fitness, their bravery, and their plan.'] },
    ],
  },
  {
    slug: 'playing-out-from-the-back',
    category: 'tactics',
    title: 'Playing Out From the Back: Bravery or Madness?',
    excerpt:
      'Building attacks patiently from your own goalkeeper is now standard at the top level — and occasionally disastrous. Why teams do it and when it goes wrong.',
    date: '2026-06-19',
    minutes: 6,
    author: 'The Xaa Desk',
    sections: [
      { h: '', p: [
        'Once upon a time a goalkeeper with the ball simply hammered it upfield and hoped. Today, at the highest level, you will see keepers and defenders passing the ball among themselves a few yards from their own goal, calmly inviting the opponent to come and press them. To many fans it looks like madness. To modern coaches it is the foundation of control. Both are sometimes right.'] },
      { h: 'The logic', p: [
        'Playing out from the back is about beating the press to gain control. If a team can pass its way through the opponent’s initial pressure, it emerges into open midfield with the ball, numbers forward, and the opposition out of shape and out of position. In effect, it uses the goalkeeper as an extra passer to create an overload — one more player than the pressers — right where the game is hardest to defend.',
        'The reward is the most valuable thing in football: possession with the opponent stretched. Teams that master it dominate matches not with one long pass but with a hundred short ones that slowly pull a defence apart.'] },
      { h: 'When it goes wrong', p: [
        'The risk is obvious and severe. A misplaced pass in your own penalty area is not a normal turnover — it is very often a goal, gifted to an opponent who did nothing to earn it. Every season produces highlight reels of teams punished for over-elaborating in front of their own net, and there is no more demoralising way to concede. Against a fierce, well-drilled press, the margin for error shrinks to almost nothing.',
        'This is why the tactic divides opinion. Its defenders say the rewards over ninety minutes outweigh the occasional catastrophe; its critics say no advantage is worth handing opponents free goals in the one area you cannot afford to. Both have a point, and good coaches know when to abandon the principle — when the press is too strong, sometimes the brave thing is to go long.'] },
      { h: 'Watching for it in 2026', p: [
        'At the World Cup, playing out from the back becomes a test of nerve under the most intense pressure in the sport. Watch how each team behaves when pressed near its own goal: does the goalkeeper stay calm and find the free man, or does panic set in? The teams that keep their composure in that split-second, match after match, tend to be the ones built to go deep. The ones that crack tend to go home explaining a goal they will replay for years.'] },
    ],
  },
  {
    slug: 'why-set-pieces-decide-tournaments',
    category: 'tactics',
    title: 'Why Set Pieces Decide Tournaments',
    excerpt:
      'A huge share of World Cup goals come from corners, free kicks and throw-ins. Why the “dead ball” is football’s most underrated weapon in tight knockout games.',
    date: '2026-06-21',
    minutes: 6,
    author: 'The Xaa Desk',
    sections: [
      { h: '', p: [
        'Fans dream of flowing team goals, but tournaments are frequently decided by something less romantic: the set piece. Corners, free kicks and even long throw-ins produce a remarkable share of World Cup goals, and in the tight, cautious matches of the knockout rounds they are often the likeliest way to score at all. The dead ball is football’s most underrated weapon.'] },
      { h: 'Why they matter more in tournaments', p: [
        'Knockout football is tense and careful. Teams that cannot afford to lose defend deeply and take fewer risks, which strangles open play and starves both sides of clear chances. In that environment, the set piece becomes precious: a rare moment when a team can commit big players into the box against a static defence, on its own terms, with a rehearsed plan. When open play is locked, the dead ball is the key.',
        'The maths is compelling. Across World Cups, a substantial fraction of goals arrive from set-piece situations, and in the closest matches that fraction rises. A team with no attacking set-piece threat is voluntarily ignoring one of the biggest sources of goals in the sport.'] },
      { h: 'The hidden craft', p: [
        'Good set pieces are not hopeful crosses; they are choreography. Coaches script movement to create a free header — blockers to occupy markers, dummy runs to drag defenders away, timed runs to attack a specific zone. The best teams have a playbook of routines and a specialist deliverer whose accuracy turns a rehearsed run into a goal. Defending them is its own discipline, a choice between marking men and marking zones, each with weaknesses a clever attack will probe.',
        'The long throw-in, long dismissed as crude, has quietly returned as a weapon for teams with a specialist who can launch it into the box like a corner — a free set piece from open play that many defences are poorly prepared for.'] },
      { h: 'Watch the dead ball', p: [
        'It is easy to switch off when the ball goes out for a corner. Do the opposite. In the knockout rounds especially, that is often the moment a tight game is about to swing. Watch the runs, the blocks, the deliverer’s target — and you will see the hidden, decisive craft that pundits call route-one and champions call points on the board.'] },
    ],
  },
  {
    slug: 'plain-guide-to-football-formations',
    category: 'tactics',
    title: 'A Plain Guide to Football Formations',
    excerpt:
      'The numbers pundits reel off — 4-3-3, 3-5-2, 4-2-3-1 — are simpler than they sound. What formations actually tell you, and what they hide.',
    date: '2026-06-23',
    minutes: 6,
    author: 'The Xaa Desk',
    sections: [
      { h: '', p: [
        'Pundits love their numbers: 4-3-3, 3-5-2, 4-2-3-1. To newcomers it can sound like a code. In truth a formation is a simple idea — the starting shape of a team, read from defence to attack — and understanding a handful of them will make every tactical discussion of the World Cup clearer. But formations also hide as much as they reveal, and knowing their limits matters just as much.'] },
      { h: 'Reading the numbers', p: [
        'A formation is written from the back: the first number is defenders, the last is forwards, and the numbers between are midfield lines. So 4-3-3 means four defenders, three midfielders, three forwards. 4-2-3-1 means four defenders, two holding midfielders, three attacking midfielders and a lone striker. 3-5-2 means three central defenders, five midfielders (usually including two wide players who run the length of the flanks), and two strikers. That is genuinely all the code is.',
        'Each shape is a set of trade-offs. More defenders means more security and less attacking width; more forwards means more threat and more exposure. A back three offers extra cover centrally but leans on hard-working wing-backs; a back four is more balanced but can be stretched. There is no perfect formation, only choices suited to particular players and opponents.'] },
      { h: 'What formations hide', p: [
        'Here is the crucial caveat: a formation is only the starting position. The moment the match begins, the shape shifts constantly. A team lined up as 4-3-3 in defence might become something entirely different in attack, with full-backs pushing high and a midfielder dropping between the centre-backs. Modern teams have one shape without the ball and another with it, and the interesting football lives in the movement between them, not the static diagram.',
        'This is why obsessing over the formation printed before kick-off can mislead. Two teams nominally playing the same shape can play utterly different football, and a manager may change shape three times in one match. The numbers are a useful starting vocabulary, not the whole language.'] },
      { h: 'Using it well', p: [
        'So learn the common shapes — they are worth knowing — but treat them as a first impression, not a verdict. When you watch a World Cup match, note the starting formation, then watch how it morphs: where the full-backs go when the team attacks, which midfielder drops deep, how the front line rearranges to press. That movement, far more than the opening diagram, is where a team’s real tactical identity lives.'] },
    ],
  },
  {
    slug: 'art-of-the-counter-attack',
    category: 'tactics',
    title: 'The Art of the Counter-Attack',
    excerpt:
      'Some of the World Cup’s greatest goals come from soaking up pressure and striking in seconds. Why the counter-attack is a plan, not an accident.',
    date: '2026-06-25',
    minutes: 5,
    author: 'The Xaa Desk',
    sections: [
      { h: '', p: [
        'There is a particular thrill to the counter-attack: a team defends desperately, wins the ball, and in a handful of seconds the play is transformed into a goal at the other end. It looks like a smash-and-grab, a moment of fortune. In reality, the great counter-attacking teams plan for it meticulously. It is one of football’s most sophisticated strategies dressed up as chaos.'] },
      { h: 'Why it works', p: [
        'The counter exploits a simple truth: a team is most vulnerable in the moment it loses the ball while attacking. Its players are committed forward, its defence is high and stretched, and the space behind is vast. A team that wins the ball in that instant and moves it forward quickly, before the opponent can recover its shape, attacks a defence that is not yet a defence. Pace and directness turn a turnover into a clear run at goal.',
        'This is why counter-attacking suits the underdog. A team content to defend deep, absorb pressure and strike on the break can beat a superior side that dominates possession — it concedes the ball and the territory but keeps the thing that matters, the chances. Many a giant has been slain this way.'] },
      { h: 'The craft behind it', p: [
        'A good counter is rehearsed. Players know their roles the instant possession turns: who carries the ball, who sprints beyond, who provides the option, how many players commit and how many stay to guard against a second wave. The first pass after winning the ball is the most important in the sequence — played forward and accurately, it launches the break; played sideways or backwards, it lets the opponent recover. Great counter-attacking teams drill that first pass obsessively.',
        'It also requires the right players: pace to punish the space, a passer who can find the runner in an instant, and the composure to finish when the chance finally arrives after all that sprinting. Speed without composure wastes the opportunity the plan created.'] },
    ],
  },
  {
    slug: 'psychology-of-the-penalty-shootout',
    category: 'tactics',
    title: 'The Psychology of the Penalty Shootout',
    excerpt:
      'The cruellest way to decide a World Cup match is less about technique than nerve. What actually happens in a shootout, and why it is not simply luck.',
    date: '2026-06-27',
    minutes: 6,
    author: 'The Xaa Desk',
    sections: [
      { h: '', p: [
        'No moment in sport is quite like the World Cup penalty shootout: a tournament, sometimes a nation’s summer, reduced to a duel of one player against one goalkeeper from twelve yards, repeated until someone blinks. It is often dismissed as a lottery. It is not. A shootout is a test of nerve and preparation, and while chance plays a part, the outcome is far from random.'] },
      { h: 'Not a lottery', p: [
        'Calling shootouts luck is comforting to the losers and wrong. Taking a penalty is a simple technical act that professional players execute easily in training thousands of times; what changes in a shootout is the pressure. The challenge is not the kick — it is taking the kick with a continent watching, exhausted after two hours of football, knowing a miss may end everything. The players who succeed are the ones who can perform a familiar skill under unfamiliar pressure, and that is a trainable, selectable trait, not a coin toss.',
        'Teams that treat shootouts seriously — practising them, choosing takers by temperament as much as technique, preparing their goalkeeper with research on opponents — win more of them than teams that shrug and hope. Over time, the pattern is too consistent to be chance.'] },
      { h: 'The mental game', p: [
        'The psychology is intricate. A taker who decides where he will place the kick and commits, ignoring the goalkeeper, tends to outperform one who waits and reacts. Goalkeepers, meanwhile, play mind games — delaying, moving, making themselves large — to plant a seed of doubt, because a taker who hesitates is a taker who misses. The walk from the halfway line to the spot is one of the loneliest in sport, and how a player manages those thirty seconds often decides the kick before he strikes it.',
        'Order matters too. The pressure escalates with each kick, and the players who take the crucial later penalties, when a miss means defeat, carry the heaviest load. Choosing who takes the fifth kick is a decision about character, not just finishing.'] },
      { h: 'Cruel, but not unfair', p: [
        'The shootout will always feel brutal — a fine team can lose a match it did not lose in open play, and careers are marked forever by a single miss. But it is not the arbitrary cruelty it is often painted as. It rewards the teams that prepared, the players who kept their nerve, and the goalkeepers who did their homework. At the 2026 World Cup, some of the tournament’s defining images will come from the spot — and the teams that go furthest will, more often than not, be the ones who took the twelve yards seriously long before they got there.'] },
    ],
  },
  {
    slug: 'greatest-world-cup-finals',
    category: 'history',
    title: 'The Greatest World Cup Finals Ever Played',
    excerpt:
      'The final is football’s biggest single match, and a handful have transcended the sport. What made the most unforgettable World Cup finals so great.',
    date: '2026-06-30',
    minutes: 7,
    author: 'The Xaa Desk',
    sections: [
      { h: '', p: [
        'The World Cup final is the single most-watched sporting event on earth, and across nearly a century it has produced matches that outgrew football entirely. Not every final is a classic — the weight of the occasion can smother the spectacle — but the greatest have combined drama, quality and story into something that lingers for generations. What do the finest finals share?'] },
      { h: 'Drama that swings', p: [
        'The unforgettable finals are the ones that refuse to settle. A team leads, is pegged back, edges ahead again; a match tilts one way and then the other until the very last minutes, or into extra time, or all the way to penalties. The finals remembered as classics almost never feature a comfortable winner — they feature two teams trading blows with a continent’s hopes riding on each one. Comebacks, late equalisers, and shootouts are the raw material of legend.',
        'The stakes magnify everything. A late goal in a group game is exciting; a late goal in a World Cup final, to win or save the biggest prize in the sport, is the kind of moment people remember exactly where they were for. Context turns good football into history.'] },
      { h: 'Individual genius on the biggest stage', p: [
        'Great finals are often defined by a single player rising to the occasion — the superstar who, when everything is on the line and the pressure is unbearable, produces the defining performance of a career. The World Cup final is the ultimate test of whether the best players can be their best when it matters most, and the ones who pass that test earn a kind of immortality no league can offer.',
        'There is something clarifying about the final. There is no next match, no second leg, nowhere to hide. Players are revealed, for better or worse, and the ones revealed as great in that moment become the faces of the sport’s history.'] },
      { h: 'Story and meaning', p: [
        'The finals that transcend football usually carry a story larger than the score: a nation’s first triumph, a redemption after past heartbreak, a generational team fulfilling its promise or a fading great’s last chance at the one prize that eluded him. The football is the vehicle; the meaning is what makes it unforgettable. That is why, decades later, these matches are still replayed and retold — not because of the goals alone, but because of what they meant. The 2026 final will join that lineage, and somewhere a player is about to write himself into it.'] },
    ],
  },
  {
    slug: 'goals-that-defined-the-world-cup',
    category: 'history',
    title: 'Goals That Defined the World Cup',
    excerpt:
      'Some goals are remembered for their beauty, others for their weight, a few for their controversy. What makes a World Cup goal live forever.',
    date: '2026-07-01',
    minutes: 6,
    author: 'The Xaa Desk',
    sections: [
      { h: '', p: [
        'Thousands of goals have been scored at World Cups, and the vast majority are forgotten within a week. A precious few are remembered for a lifetime, replayed across generations, and known by a single phrase. What lifts a goal from a moment into history? It is rarely just technique. The immortal World Cup goals tend to combine several rare things at once.'] },
      { h: 'Beauty', p: [
        'Some goals earn immortality on pure aesthetics — a strike of such technical perfection or audacity that it stops the breath. A volley struck sweetly from distance, a mazy solo run through half a team, an impossible angle finished with impossible calm: these are the goals shown to children as examples of what the sport can be. Beauty alone can secure a goal’s place, because football at its highest is also an art, and the World Cup is its largest gallery.',
        'But beauty is not enough on its own. A gorgeous goal in a meaningless match fades; a gorgeous goal at a decisive moment endures. Context does much of the remembering.'] },
      { h: 'Weight', p: [
        'The heaviest goals are often not the prettiest. A scrappy finish that wins a World Cup final, a last-minute strike that dumps out a giant, a penalty converted under unbearable pressure — these live forever because of what they achieved, not how they looked. The weight of the moment transforms an ordinary goal into an unforgettable one. Ask any fan about the goals that made them cry, and few will be the most technically dazzling; they will be the ones that meant everything.',
        'This is why the World Cup, more than any club competition, is the great manufacturer of iconic goals. The stakes are the highest in the sport, so its goals carry the most meaning, and meaning is what memory clings to.'] },
      { h: 'Controversy and story', p: [
        'A third category lives on through argument. Goals wrapped in controversy — a handball missed by officials, a fiercely disputed decision, a moment of infamy — burn themselves into memory precisely because they were never settled. Debate is a form of remembering. And some goals endure because of the story around them: the outsider who scored against the odds, the player returning from adversity, the symbol a goal became for a nation. A World Cup goal at its most powerful is never just a ball crossing a line — it is a moment a whole planet witnessed together, and agreed, or furiously disagreed, to never forget.'] },
    ],
  },
  {
    slug: 'great-world-cup-underdog-runs',
    category: 'history',
    title: 'The Great Underdog Runs',
    excerpt:
      'The World Cup’s most beloved stories belong to teams nobody expected. A look at what the great underdog runs had in common — and why they matter.',
    date: '2026-07-03',
    minutes: 6,
    author: 'The Xaa Desk',
    sections: [
      { h: '', p: [
        'Ask football fans to name their favourite World Cup memories and a striking number will choose a team that did not win — an unfancied nation whose improbable run captured the imagination of the entire tournament. The underdog run is the World Cup’s most cherished genre, and across the decades the great ones share a recognisable shape.'] },
      { h: 'The pattern of the run', p: [
        'It usually begins quietly: a team expected to make up the numbers wins its opening match, then survives its group, gathering belief and neutral affection as it goes. Then comes the signature moment — the giant slain, a tournament favourite eliminated by a side ranked far below it, often against the run of play and on the back of a heroic defensive performance and an inspired goalkeeper. That single result transforms the run from a curiosity into a story the whole world starts to follow.',
        'From there the momentum builds its own weight. The players, with nothing expected of them, play free and fearless; the pressure sits entirely on their opponents. Each round survived makes the next giant more nervous about being the one to lose to them. Underdog runs feed on the anxiety they create.'] },
      { h: 'Why they end', p: [
        'Almost all of them stop short of the ultimate prize, and the reasons are the ones we have met before: the settled but thin squad tires, the inspired individuals cool, and the quality gap that momentum papered over finally tells in a match too far. The end is often poignant — a narrow defeat, a shootout, a single moment — but rarely shameful. The team goes home having given its nation a summer it will never forget.',
        'And that is the point. The underdog run is proof that the World Cup is not only a contest the biggest nations win, but a stage where anyone can, for a few glorious weeks, belong among the best. It is the tournament’s democratic heart, and it is why we fall in love with teams we had barely heard of a month before. In 2026, with 48 teams and more debutants than ever, the conditions for a new legend are riper than they have ever been.'] },
    ],
  },
  {
    slug: 'how-the-world-cup-began',
    category: 'history',
    title: 'How the World Cup Began',
    excerpt:
      'Football’s global tournament started as an improbable idea in the 1920s. The short history of how the World Cup came to be, and how it conquered the planet.',
    date: '2026-07-05',
    minutes: 6,
    author: 'The Xaa Desk',
    sections: [
      { h: '', p: [
        'Today the World Cup is the largest single-sport event on earth, watched by billions. It began, less than a century ago, as a risky idea that many doubted would work: a tournament to crown the world champions of football, open to every nation willing to travel. Its origins are worth knowing, because they explain much about what the tournament still means.'] },
      { h: 'An idea before its time', p: [
        'Football spread across the world rapidly in the early twentieth century, but there was no single competition to determine the best nation. The Olympic football tournament offered a glimpse, yet it excluded professionals and could not claim to be a true world championship. A handful of football administrators pushed, against scepticism, for a stand-alone global tournament — an audacious proposal in an age when international travel meant weeks at sea.',
        'The first tournament, held in South America, drew a modest field: many European nations declined the long, expensive voyage, and only a handful made the trip. It was a fragile beginning. Had it failed, the idea might have died. It did not.'] },
      { h: 'From voyage to phenomenon', p: [
        'What saved and grew the World Cup was the sheer appetite for it. Each edition drew more nations, more spectators and more meaning, interrupted only by the Second World War. As air travel shrank the world and television carried matches into homes across continents, the tournament stopped being a gathering of the few willing to travel and became the event the whole world stopped to watch. The trophy, the ritual, the four-year rhythm — all of it accreted into a global institution.',
        'The expansion never stopped: from a dozen-odd teams to sixteen, to twenty-four, to thirty-two, and now, in 2026, to forty-eight. Each growth spurt drew the same complaint about dilution and the same eventual verdict that the tournament was richer for including more of the world.'] },
      { h: 'Why the origin still matters', p: [
        'The World Cup’s founding idea — that football belongs to the whole world, not a privileged few — is still its animating spirit. That is why a debutant nation’s first appearance is celebrated as much as a champion’s triumph, and why the tournament works so hard to include every continent. The 2026 World Cup, hosted across three countries and open to more nations than ever, is in a sense the fullest expression yet of that original, improbable ambition: to bring the entire planet together around a single game.'] },
    ],
  },
  {
    slug: 'story-of-the-world-cup-trophy',
    category: 'history',
    title: 'The Story of the Trophy Itself',
    excerpt:
      'The gold trophy lifted by the champions has a history as dramatic as the tournament — including a theft, a retirement and a design meant to capture triumph.',
    date: '2026-07-07',
    minutes: 5,
    author: 'The Xaa Desk',
    sections: [
      { h: '', p: [
        'At the end of the World Cup, one captain lifts a small golden trophy, and it becomes the most coveted object in the sport. The prize itself has a surprisingly turbulent history — theft, retirement, and a deliberate redesign — and knowing it adds a little weight to the moment it is next raised.'] },
      { h: 'Two trophies, one dream', p: [
        'There have, in effect, been two World Cup trophies. The original was awarded for decades, until a rule allowed a nation that won the tournament a set number of times to keep it permanently — which one eventually did, retiring the first trophy into that country’s possession. A new trophy was then commissioned for all the World Cups that followed, and it is this second design that champions lift today.',
        'The original trophy’s story took a dramatic turn beyond the pitch: it was famously stolen at least once, sparking frantic searches, and its ultimate fate became the stuff of football folklore. Few sporting prizes have led such an eventful life away from the field.'] },
      { h: 'A design of triumph', p: [
        'The current trophy was designed to capture the very idea of victory: figures rising in celebration, holding up the world, cast in gold. Unlike its predecessor, it is not given away permanently — the winning nation holds it, then returns it before the next tournament, receiving a replica to keep. The trophy itself is passed from champion to champion, a single object that has been touched by the greatest teams in the sport’s modern history.',
        'That continuity is the point. When a captain lifts it, he is holding the same prize that generations of champions before him held — a physical thread running through the whole history of the tournament.'] },
    ],
  },
  {
    slug: 'how-technology-changed-the-world-cup',
    category: 'history',
    title: 'How Technology Changed the World Cup',
    excerpt:
      'From goal-line technology to VAR and semi-automated offsides, machines have quietly reshaped how the World Cup is officiated. The gains, the costs and the debate.',
    date: '2026-07-09',
    minutes: 6,
    author: 'The Xaa Desk',
    sections: [
      { h: '', p: [
        'For most of its history the World Cup was officiated by human eyes alone, and human eyes made mistakes — some of them famous, some of them tournament-defining. Over the last few editions, technology has moved into the heart of officiating, and it has changed the experience of watching in ways both celebrated and resented. It is worth understanding what the machines actually do.'] },
      { h: 'From goal-line to VAR', p: [
        'The first widely accepted intervention was goal-line technology, which settles a single, factual question instantly: did the ball fully cross the line? Almost nobody objects to it, because it answers a yes-or-no fact with certainty and removes one of football’s oldest injustices. It was the easy case.',
        'The Video Assistant Referee — VAR — is more ambitious and more contentious. It allows officials to review key decisions on a screen: goals, penalties, red cards and mistaken identity. In principle it corrects the clear, game-changing errors that once went uncorrected. In practice it introduced new arguments about interpretation, delay and the feel of the game.'] },
      { h: 'The gains and the costs', p: [
        'The gains are real. Blatant injustices — a clear handball in the build-up to a goal, a violent foul the referee missed, an offside invisible in real time — are now often caught and corrected. Fewer World Cup matches are decided by an error everyone in the stadium could see except the one person who mattered. For fairness, that is progress.',
        'The costs are real too. Reviews interrupt the flow and delay celebrations, so that a fan no longer knows whether to cheer a goal until a distant screen confirms it. Decisions that hinge on interpretation — a marginal handball, a soft penalty — remain arguments, only now with a video pause attached. And the drawn-line offside, catching a striker by a toe, has made some fans nostalgic for the benefit of the doubt.'] },
      { h: 'The ongoing debate', p: [
        'Newer tools, like semi-automated offside systems that speed up the tightest calls, aim to keep the accuracy while reducing the delay — an admission that the first generation of technology solved one problem and created another. The direction of travel is clear: the World Cup will keep using machines to chase fairness. The open question is how to do so without draining the spontaneous joy that made people love the game in the first place. That balance, more than any single decision, is the real debate technology has brought to the tournament.'] },
    ],
  },
  {
    slug: 'fans-guide-to-2026-host-cities',
    category: 'culture',
    title: 'A Fan’s Guide to the 2026 Host Cities',
    excerpt:
      'Sixteen cities across three countries will host the World Cup. What makes the host regions distinct, and how the geography shapes a fan’s tournament.',
    date: '2026-06-06',
    minutes: 7,
    author: 'The Xaa Desk',
    sections: [
      { h: '', p: [
        'A World Cup is not only a football tournament; it is a tour of the places that host it. In 2026 that tour spans sixteen cities across the United States, Canada and Mexico — a vast, varied stretch of a continent. For travelling fans and armchair viewers alike, the host cities are part of the story, and their differences shape everything from the atmosphere to the football itself.'] },
      { h: 'Three countries, three flavours', p: [
        'The United States hosts the bulk of the matches across a wide spread of cities, from the coasts to the interior, in modern stadiums built for huge crowds. Its host cities offer the full range of American life — sprawling metropolises, distinct regional cultures, and enormous, diverse populations who will fill the stands for teams from every continent.',
        'Mexico brings history and fervour. A footballing nation to its core, its host cities carry a passion for the game few places on earth can match, and one of its stadiums is among the most iconic in the sport, having staged defining moments of past tournaments. Canada, hosting men’s World Cup matches for the first time, brings fresh enthusiasm and cosmopolitan cities eager to make their mark on football’s biggest stage.'] },
      { h: 'Why the geography matters', p: [
        'The distances between host cities are continental, and that shapes the tournament in practical ways we have touched on: travel, climate and altitude all become factors for teams and fans. A supporter following one team may cover thousands of miles; a neutral picking matches can effectively choose a region and a climate. The variety is part of the appeal, but it rewards planning — this is not a tournament to follow on a whim across venues.',
        'For the atmosphere, the geography is a gift. Each host country has deep, football-loving communities with roots all over the world, so visiting nations will find passionate support close to many venues. A group match in one city can feel like a home game for a team from another continent entirely.'] },
      { h: 'Making the most of it', p: [
        'Whether you travel or watch from home, treat the host cities as part of the experience. Notice the settings — the skylines, the crowds, the local colour that television carries between matches — because a World Cup is also a portrait of the places that stage it. And if you are lucky enough to attend, confirm every fixture, venue and travel plan against official sources well in advance; across three countries and sixteen cities, logistics are the difference between a dream trip and a missed match.'] },
    ],
  },
  {
    slug: 'why-the-world-cup-unites-the-planet',
    category: 'culture',
    title: 'Why the World Cup Unites the Planet',
    excerpt:
      'No other event stops the entire world at once. What it is about the World Cup that turns a football tournament into a shared human experience.',
    date: '2026-07-11',
    minutes: 6,
    author: 'The Xaa Desk',
    sections: [
      { h: '', p: [
        'For a few weeks every four years, something happens that nothing else in modern life quite manages: the entire planet pays attention to the same thing at the same time. Billions of people, across every country, language and culture, watch the same matches and share the same drama. The World Cup is the closest the world comes to a common experience — and it is worth asking why a football tournament, of all things, achieves it.'] },
      { h: 'A game everyone understands', p: [
        'Part of the answer is football’s glorious simplicity. It needs no equipment but a ball, no wealth, no special conditions — it is played in every kind of place by every kind of person, and its rules can be grasped by a child in minutes. That universality means the World Cup excludes almost no one. A viewer anywhere on earth can follow a match instantly, with no barrier of knowledge or means. It is the world’s game because anyone, anywhere, can play and understand it.',
        'Onto that simple game the World Cup layers the highest possible stakes and the widest possible net — every nation invited, the best of the whole world in one place. The result is a spectacle with both mass accessibility and maximum meaning, a rare combination.'] },
      { h: 'A stage for identity', p: [
        'The World Cup also lets people belong to something larger than themselves in a way little else permits. Supporting your nation, or an adopted one, is a form of shared identity that crosses every other division — for ninety minutes, strangers become a single crowd bound by hope. In a fragmented world, the tournament offers a rare licence for collective joy and collective heartbreak, felt together, in public, without embarrassment.',
        'And it welcomes newcomers. Every tournament, people who never watch football find themselves swept up, learning the teams, adopting a side, feeling the drama. The World Cup is football’s open door, the moment the sport reaches beyond its regular audience to the whole of humanity.'] },
      { h: 'The shared summer', p: [
        'When the 2026 World Cup kicks off across three countries, it will do what it always does: pull billions of separate lives into a single, shared story for a month, complete with heroes, villains, heartbreak and joy. You do not have to be a lifelong fan to feel it. That is the quiet magic of the tournament — for a few weeks, it belongs to everyone, and everyone, briefly, belongs to it. Enjoy the whole of it.'] },
    ],
  },
];

export function getArticle(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}
export function getArticlesByCategory(cat: string): Article[] {
  return ARTICLES.filter((a) => a.category === cat).sort((a, b) => (a.date < b.date ? 1 : -1));
}

// Batch 2 joins the same library (one ARTICLES array keeps every consumer —
// home, category pages, sitemap, related articles — automatically complete).
ARTICLES.push(...ARTICLES_BATCH2);
ARTICLES.push(...ARTICLES_BATCH3);
