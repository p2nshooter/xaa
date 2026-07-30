import type { Article } from './types';

/**
 * Additive content expansions — every entry only appends new sections to an
 * existing article (or overrides title/excerpt for disambiguation). Nothing
 * here removes or rewrites existing prose; it exists purely to deepen
 * articles that started too thin.
 */
export interface Expansion {
  slug: string;
  title?: string;
  excerpt?: string;
  sections: Article['sections'];
}

export const EXPANSIONS: Expansion[] = [
  {
    slug: 'the-48-team-world-cup-explained',
    sections: [
      {
        h: 'A pattern this tournament has seen before',
        p: [
          "Expansion is not new to the World Cup, even if 48 teams is the biggest jump yet. The tournament grew from 16 to 24 teams in 1982, then from 24 to 32 in 1998, and both changes were greeted with almost identical warnings: too many mediocre teams, watered-down quality, meaningless group games. Both times, the expanded tournament went on to produce some of the competition's most memorable moments, including debutant nations announcing themselves on the biggest stage.",
          "History does not settle the argument for 2026 automatically, but it does offer a useful piece of context: every previous expansion looked risky in the abstract and was absorbed within a tournament or two, becoming simply how the World Cup was. The 48-team format may follow the same arc, or it may be the expansion that finally goes too far — but the pattern of alarm followed by adaptation is worth remembering before drawing hard conclusions from a single tournament.",
        ],
      },
      {
        h: 'The toll of an extra match',
        p: [
          "The jump from a maximum of seven matches to a maximum of eight is easy to state as a single number and easy to underestimate as a physical fact. An extra knockout match, layered onto a schedule already packed into five weeks, means less recovery time between games for the teams going furthest — precisely the teams whose best players are already carrying the heaviest workloads from a full club season just finished.",
          "Sports science staff have had to recalibrate recovery protocols accordingly, and the extra round has renewed a long-running debate about player welfare in an international calendar already criticised as overstuffed. For the players themselves, an extra match is also an extra chance at the kind of moment that defines a career — the trade-off between wear and opportunity is not obviously in either direction, which is part of why the debate has not settled.",
        ],
      },
      {
        h: 'What broadcasters and fans actually experience',
        p: [
          "One practical consequence of 104 matches rather than 64 rarely makes the tactical previews: the sheer scheduling logistics for anyone trying to watch. More groups running in parallel means more simultaneous kick-offs, denser broadcast schedules, and a genuine planning challenge for fans trying to follow more than their own team. Broadcasters have had to expand channel capacity and streaming options simply to carry the volume of live football the new format produces.",
          "For host broadcasters and advertisers, the expanded tournament is also a larger commercial proposition — more matches means more inventory, which is part of why the finances of the expansion made sense to the governing body regardless of the on-pitch debate. Whether that commercial logic and the football logic point the same direction is exactly the tension underlying most criticism of the format.",
        ],
      },
    ],
  },
  {
    slug: 'first-three-country-world-cup',
    sections: [
      {
        h: 'Getting fans across three countries',
        p: [
          "A shared tournament creates a genuinely new headache for travelling supporters: crossing international borders mid-tournament, each with its own visa rules, currency, and entry requirements. A fan planning to follow their team from a group match in one country through to a potential knockout match in another needs to think about international travel logistics that a single-host World Cup never demanded — border crossings, different mobile carriers, different emergency numbers, different everything.",
          "Organisers have worked with all three governments on streamlined transit arrangements for ticket-holders specifically, recognising that the tournament's appeal depends partly on making that cross-border experience manageable rather than a bureaucratic ordeal. Even so, fans planning to follow a team deep into the tournament are advised to treat the logistics with the seriousness of planning three separate trips, not one.",
        ],
      },
      {
        h: 'One tournament, three footballing cultures',
        p: [
          "Beyond logistics, the three-country format means blending three genuinely distinct football cultures into one event. Mexican football culture, built around a fervent domestic league and decades of World Cup hosting experience, differs sharply from the still-maturing but rapidly growing football culture in the United States, and both differ again from Canada's smaller but increasingly serious footballing identity, boosted by its own domestic league's growth in recent years.",
          "That blend shows up in matchday atmosphere itself: a group match in Mexico City carries the noise and ritual of a country that treats football as a birthright, while a match in a purpose-built American stadium may feel closer to the polished, produced atmosphere of the country's other major sports. Neither is a lesser experience — they are simply different flavours of the same tournament, which is part of what makes 2026 unlike any World Cup before it.",
        ],
      },
      {
        h: 'Learning from 2002',
        p: [
          "The closest precedent, Japan and South Korea's shared 2002 World Cup, offers a useful comparison even though the scale was smaller. That tournament also split hosting duties, also worried about diluted home advantage, and also produced genuine cultural friction over which country's identity the tournament would foreground. It resolved reasonably well, remembered fondly by both host nations, and demonstrated that a shared World Cup does not have to feel like a compromise for either host.",
          "The 2026 organisers have studied that precedent directly, and many of the coordination structures — shared branding, alternating ceremonial roles, careful balance of matches and media attention across hosts — trace back to lessons learned from 2002. A three-way split is a bigger coordination challenge than a two-way one, but it is not solving an unprecedented problem, just a larger version of one the sport has managed successfully before.",
        ],
      },
    ],
  },
  {
    slug: 'how-teams-qualified-2026',
    sections: [
      {
        h: 'The exact shape of the new allocation',
        p: [
          "To put real numbers on the redistribution: Europe's confederation sends by far the largest bloc, reflecting both its historical strength and its sheer number of member federations. Africa and Asia each received a meaningfully larger allocation than in the 32-team era, correcting a long-standing complaint that continents with enormous playing populations were under-represented relative to their size. South America, uniquely, saw the large majority of its ten members qualify directly, since the confederation is small enough that its enlarged allocation covers most of its membership outright.",
          "Oceania, historically the confederation with the fewest guaranteed places, gained a direct automatic qualifying spot for the first time in the tournament's history rather than relying solely on a play-off route — a change specifically cited by the governing body as addressing decades of the region's relative exclusion from a guaranteed place at the finals.",
        ],
      },
      {
        h: 'A near-miss that defined a campaign',
        p: [
          "Every qualifying cycle produces at least one story of a strong footballing nation missing out by the narrowest possible margin, and 2026's campaign was no exception — a result on the final matchday, a goal difference calculation, or a play-off defeat by a single goal has, in past cycles, ended a country's hopes after two years of qualifying campaign compressed into one heartbreaking evening. These stories rarely make the international headlines the finals themselves attract, but within the affected football federation they can define a managerial reign or trigger a wholesale rebuilding process.",
          "It is worth remembering, watching the finals unfold, that every one of the 48 teams present survived exactly this kind of pressure at some point in their own campaign, and every team that features in this article's later group-stage previews has its own near-miss story from a rival that did not make it — the tournament you watch is the visible tip of a much larger, largely unseen qualifying drama played out over two years.",
        ],
      },
      {
        h: 'Why the intercontinental play-off is uniquely brutal',
        p: [
          "The intercontinental play-off deserves a closer look precisely because of how differently it treats its participants compared to normal qualifying. Teams arrive from entirely different confederations, often having never played each other, based purely on finishing in a specific play-off qualifying position within their own region — meaning a team can arrive having played a completely different calibre of opposition throughout its campaign than the team it now has to beat in a single match to reach the finals.",
          "This asymmetry is part of what makes the format so tense to watch: nobody, including the participating federations' own analysts, has a confident read on the balance of power between confederations at this specific margin, since so few competitive matches exist between them to judge by. It is genuinely one of the few fixtures left in international football where the form guide offers almost no help at all.",
        ],
      },
    ],
  },
  {
    slug: 'best-third-place-teams-rule',
    sections: [
      {
        h: 'Where the rule actually came from',
        p: [
          "The best-third-place mechanism did not originate with the World Cup at all — it is borrowed directly from the European Championship, which adopted it when it expanded to 24 teams and needed the same solution to the same arithmetic problem: too many groups, and a bracket that needs a power of two. FIFA's adoption of an already road-tested format for the World Cup's own 48-team expansion was a deliberate choice to reuse a mechanism that had already survived several tournaments' worth of scrutiny and refinement at continental level.",
          "That inherited history matters for one practical reason: the tie-break ladder used to rank third-placed teams against each other — points, then goal difference, then goals scored, then a lengthening list of further criteria — had already been tested and adjusted through real edge cases at the Euros before the World Cup ever used it, meaning 2026's version arrives considerably more battle-tested than a genuinely new rule invented from scratch would be.",
        ],
      },
      {
        h: 'The scenario every fan should watch for',
        p: [
          "The single most dramatic scenario the rule produces is a team that wins its own match comfortably, celebrates a job well done, and then spends the following hours anxiously watching results from groups it has no direct stake in, because its qualification depends entirely on how those other groups' third-placed teams perform. A team can go from believing it has qualified to being eliminated purely by a stranger's late goal in a stadium hundreds of miles away — with no ability to influence the outcome at all once its own match has finished.",
          "This dynamic, sometimes called 'the wait,' has become one of the format's genuine spectator pleasures precisely because of its cruelty: broadcasters now dedicate entire post-match segments to walking through live permutations across every group, turning an otherwise administrative tie-break calculation into appointment television for fans whose own team's fate now depends on results elsewhere.",
        ],
      },
      {
        h: 'When it still comes down to a coin toss',
        p: [
          "Even with an extensive tie-break ladder — points, goal difference, goals scored, disciplinary record, and further criteria beyond that — it remains mathematically possible, if rare, for two teams to finish tied on every single criterion the rulebook provides for. In that genuinely exceptional case, FIFA's regulations specify a drawing of lots as the final, literal tie-breaker: a tournament spot decided not by anything either team did on the pitch, but by a formal draw.",
          "It has happened rarely enough at the highest level to feel almost theoretical, but the rule exists precisely because a competition organiser cannot leave any scenario, however unlikely, without a defined resolution. For the two teams involved, it would be simultaneously among the most anticlimactic and most nerve-shredding moments the format could produce — a World Cup place decided by chance after weeks of earning an identical record on the pitch.",
        ],
      },
    ],
  },
  {
    slug: 'how-to-follow-world-cup-2026',
    sections: [
      {
        h: 'The tools that actually make this manageable',
        p: [
          "Beyond willpower and good habits, a handful of practical tools make following 104 matches genuinely feasible rather than an act of endurance. Official tournament apps typically offer customisable notifications tied to specific teams or groups, letting you get pinged only for the matches you actually chose to follow rather than every kick-off and full-time whistle across the whole event. Calendar syncing, where available, is worth setting up in the first few days rather than trying to remember kick-off times from memory across three time zones.",
          "A second, less technical tool matters just as much: a single trusted source for the group tables, checked once a day rather than compulsively, which keeps you fluent in the tournament's state without requiring constant attention. The fans who enjoy a long tournament most are usually the ones who built a light, sustainable system in the first week rather than the ones trying to watch everything and burning out by the second.",
        ],
      },
      {
        h: 'Following it without watching every match live',
        p: [
          "Live viewing is not the only, or even necessarily the best, way to stay genuinely engaged with a tournament this size. A well-produced highlights package, watched the same day, preserves nearly all the emotional and tactical substance of a match in a fraction of the time, and is a perfectly legitimate way to follow the group stage for anyone juggling work, time zones, or simply competing demands on their evenings.",
          "Radio and podcast coverage, often overlooked in a heavily visual sport, offers a genuinely different and often richer way to follow matches during a commute or while doing something else entirely — commentary built for an audience that cannot see the pitch tends to describe far more of what is actually happening, which some fans find they prefer even when a screen is available.",
        ],
      },
      {
        h: 'Watching alone versus watching with others',
        p: [
          "How you watch changes what the tournament feels like as much as what you watch. A World Cup followed entirely alone, quietly, on a laptop is a legitimate way to enjoy the football — but it is a fundamentally different experience from watching in a bar, a fan zone, or a friend's living room during a match that matters to the room, where the shared reaction to a goal is arguably as much the point as the goal itself.",
          "If your schedule and circumstances allow it, deliberately choosing at least a handful of matches — ideally the ones involving your adopted team, or the marquee knockout fixtures — to watch communally rather than solo tends to be what people remember years later, long after the specific score lines have faded from memory.",
        ],
      },
    ],
  },
  {
    slug: 'what-separates-contenders',
    sections: [
      {
        h: 'The manager question nobody wants to talk about',
        p: [
          "Behind every genuine contender sits a coaching setup that has had real time to build the identity the team relies on — continuity that is far rarer in international football than in club football, where a manager sees their squad daily. International managers typically see their full group for only a handful of camps a year, which makes the teams who have kept the same coach and staff across a multi-year cycle a meaningfully different proposition from those who changed manager eighteen months before the tournament and are still building cohesion in real time.",
          "This is part of why federations that panic and change managers reactively after a poor qualifying run so often arrive at the finals undercooked, regardless of individual talent, while federations with the patience to stick with a difficult but coherent long-term plan tend to arrive with the settled identity that contenders need. Coaching continuity rarely makes for exciting transfer-window headlines, but it correlates with tournament success about as strongly as anything on this list.",
        ],
      },
      {
        h: 'The federation support that never appears on camera',
        p: [
          "What separates a genuine contender from a talented but underprepared squad often has nothing to do with anything visible during the tournament itself: the quality of sports science and medical staff a federation invests in year-round, the sophistication of opposition analysis prepared before each match, and even logistics as mundane as flight schedules and hotel quality during the tournament itself, all quietly shape how fresh and well-prepared a squad is heading into a decisive knockout match.",
          "Wealthier, more professionally run federations have a structural advantage here that has nothing to do with the talent pool available to them, and it is one reason smaller nations with excellent individual players sometimes underperform relative to their talent — the gap is not always footballing, it is organisational, and it shows up exactly in the accumulated fatigue and preparedness differences that decide close knockout matches.",
        ],
      },
    ],
  },
  {
    slug: 'anatomy-of-a-dark-horse',
    sections: [
      {
        h: 'The media narrative that builds around a run',
        p: [
          "Once a surprise team wins its second unlikely match, a self-reinforcing media narrative tends to take over that has real effects on the tournament itself. Neutral fans worldwide start actively wanting the underdog to continue, broadcasters shift camera time and pre-match features toward the story, and even opposition managers sometimes underestimate a team that has, by that point, genuinely earned its results rather than been fortunate into them — the 'plucky underdog' framing can outlast the point where it is still an accurate description of the team's actual quality.",
          "This narrative momentum is not nothing on the pitch either: players who sense a whole neutral audience willing them forward often describe it as a genuine source of belief and energy, distinct from home advantage but psychologically related to it — a team can, in effect, borrow a form of collective backing from neutrals that a first-time surprise run generates almost automatically.",
        ],
      },
      {
        h: 'What a deep run does for football back home',
        p: [
          "The effects of a genuine dark-horse run extend well past the tournament itself. A small football nation reaching a quarter-final or further typically sees a measurable surge in domestic participation, youth academy investment, and broadcast rights value for its league in the following years — a single tournament run can shift a country's football development trajectory in ways that a decade of steady, unspectacular progress often cannot match.",
          "This is part of why the emotional stakes of a dark-horse run feel larger than a single knockout match: for the players, it is a career-defining tournament; for the football federation and the next generation of players in that country, it can be the moment that changes what feels possible, the same way a small nation's first World Cup appearance often becomes a permanent reference point in its footballing history regardless of how the run itself ends.",
        ],
      },
    ],
  },
  {
    slug: 'weight-of-defending-champions',
    sections: [
      {
        h: 'The specific pattern across recent champions',
        p: [
          "Looking at recent tournament cycles specifically sharpens the pattern beyond a vague folk memory: multiple reigning champions in the twenty-first century have failed to escape the group stage at the following World Cup, a genuinely startling rate of collapse for teams that, four years earlier, had been the best in the world. The pattern is consistent enough across different countries, different footballing cultures, and different eras that it resists being explained away as one or two unlucky campaigns — something structural is happening, not just bad fortune repeating by coincidence.",
          "What makes the pattern especially striking is that it holds even for champions who won playing an attractive, high-possession style widely praised as sustainable — suggesting the curse is less about a specific tactical approach going stale and more about the combination of squad ageing, lost surprise, and psychological hunger described elsewhere in this piece, which appears to apply regardless of how a given champion actually won the trophy.",
        ],
      },
      {
        h: 'What doing it right actually looks like',
        p: [
          "The rare nations that have defended a World Cup, or at least gone deep in the defence, share a specific and instructive pattern: they began refreshing the squad almost immediately after winning, rather than waiting until qualifying for the next tournament forced the issue, and they explicitly, publicly reset the team's ambitions rather than talking about the previous triumph in interviews leading into the new campaign.",
          "That deliberate act of psychological reset — treating the new tournament as its own separate challenge rather than a victory lap or a validation of the last one — turns out to matter as much as any tactical or squad-management decision. Champions who talk about the previous trophy in the build-up to the next tournament are, in a sense, already signalling that they are looking backward at the exact moment their opponents are looking forward.",
        ],
      },
    ],
  },
  {
    slug: 'does-home-advantage-still-matter',
    sections: [
      {
        h: 'What the research actually shows about referees',
        p: [
          "Beyond fan energy affecting players, a genuinely uncomfortable but well-studied finding in sports science is that partisan crowd noise measurably influences the fine judgement calls of match officials, even at the highest professional level — decisions on marginal fouls, penalty appeals, and added time have all shown statistically detectable bias toward the home side across large samples of matches in multiple sports, not because officials are consciously biased but because crowd noise appears to genuinely shape split-second perception under pressure.",
          "The introduction of video review technology has narrowed, though not eliminated, this specific effect for the clearest decisions, since a video replay removes some of the ambiguity that crowd pressure previously operated within. For the many decisions too marginal or too fast for video review to meaningfully change, the crowd effect on officiating remains one of home advantage's most real, if least discussed, components — arguably more consequential than atmosphere's effect on the players themselves.",
        ],
      },
      {
        h: 'The specific burden 2026 places on opponents',
        p: [
          "For visiting teams specifically, 2026's geography adds concrete physical burdens beyond ordinary travel: Mexico City's altitude affects opposing players' conditioning in ways well documented since it first hosted the tournament decades ago, requiring visiting squads to arrive early and acclimatise rather than fly in at the last moment as they might for a sea-level venue. Humid, high-heat conditions in some American host cities carry a similar, if less extreme, acclimatisation demand.",
          "None of these conditions burden the host nations' own teams in the same way, since they train and play in familiar climates and altitudes year-round — a subtle but real home advantage layered on top of the crowd and travel effects already discussed, and one that specifically punishes visiting teams who under-prepare for the physical conditions rather than just the footballing opposition.",
        ],
      },
    ],
  },
  {
    slug: 'what-group-of-death-means',
    sections: [
      {
        h: 'A famous example, played out',
        p: [
          "Perhaps the most cited group of death in the tournament's history paired multiple past champions and semi-finalists together in a single group, producing a situation where a team with a genuinely excellent World Cup pedigree still went home after the group stage, beaten not by a bad performance but by the sheer misfortune of facing three capable opponents in three matches with only two places available. Commentators and historians still reference that specific group as the textbook case whenever the phrase resurfaces at a new draw.",
          "What made it a true group of death rather than just a group with recognisable names was the closeness of the eventual points totals — every side in the group finished within a match's worth of qualifying, meaning the team eliminated was genuinely unlucky rather than simply weaker, which is exactly the quality that separates the phrase's real usage from its lazier, more common one.",
        ],
      },
      {
        h: 'Trying to measure it with a number',
        p: [
          "Because the phrase gets thrown around so loosely, some analysts have tried to put a number on it: averaging the world ranking of all four teams in a group produces a rough, objective measure of collective strength, and comparing that average across all twelve groups at a given draw gives a defensible, if imperfect, answer to which group actually deserves the label rather than which one simply contains the most famous names.",
          "This kind of ranking-based measure is not perfect — form, injuries and tactical matchups all matter in ways a single ranking number cannot capture — but it is a useful corrective to a media cycle that often crowns a group of death based on name recognition alone. The mathematically deadliest group and the most-discussed group are not always the same group, and that gap is worth noticing the next time the phrase gets attached to a draw.",
        ],
      },
      {
        h: 'Why fans secretly love it anyway',
        p: [
          "For all the doom in the phrase, a genuine group of death is usually among the most purely entertaining viewing of the entire group stage, precisely because every match carries real stakes for both sides rather than the foregone-conclusion feel of a mismatched group. Fans who might otherwise skim past group games save these fixtures specifically, because there is no safe assumption to make about the outcome — which is, after all, exactly what makes any sport worth watching in the first place.",
          "There is also a bittersweet appeal in knowing, going in, that a genuinely good team is about to be eliminated by another genuinely good team through no real fault of its own — tournament football rarely offers such a clean, sympathetic tragedy, and the group of death delivers one nearly every time the label is honestly earned.",
        ],
      },
    ],
  },
  {
    slug: 'the-48-team-world-cup-explained',
    sections: [
      {
        h: 'The economics behind the decision',
        p: [
          "The expansion was never purely a footballing decision, and understanding its financial logic explains why it happened when it did. More matches mean more broadcast windows to sell, more host-city revenue from ticketing and tourism, and a larger pool of qualifying nations whose federations pay to participate in the wider commercial ecosystem around the tournament. For the governing body, whose primary income depends heavily on this one event every four years, a 50 percent increase in matches represents a substantial, predictable revenue increase that was difficult to turn down regardless of purely sporting arguments either way.",
          "Critics of the expansion have pointed to this financial motive as evidence that commercial interests outweighed competitive integrity in the decision, while defenders note that the extra revenue also funds development programmes in smaller footballing nations, some of which directly benefited from the qualifying expansion discussed elsewhere in this article. Both readings are defensible, and the truth is probably that the decision satisfied several motives simultaneously rather than being driven by any single one.",
        ],
      },
      {
        h: 'How the draw itself got more complicated',
        p: [
          "Twelve groups instead of eight also transformed the draw ceremony into a considerably more intricate logistical exercise. Seeding pots had to be recalculated to spread the strongest nations as evenly as possible across twelve groups rather than eight, and the geographic and political considerations that already complicated previous draws — keeping certain rival nations apart, balancing travel demands across three host countries — multiplied in complexity with more groups to balance them across.",
          "The draw procedure itself now runs considerably longer and involves more contingency rules than in previous tournaments, specifically to prevent an unbalanced or logistically unworkable group configuration from emerging by chance. Viewers watching the draw live may not notice the extra complexity, but the officials running it have a meaningfully harder combinatorial problem to solve than in any previous edition.",
        ],
      },
      {
        h: 'What players themselves have said',
        p: [
          "Player reaction to the expanded format has been more mixed than official statements from federations tend to suggest. Several prominent players, speaking through their domestic players' unions, have echoed the workload concerns raised earlier in this piece, pointing to an international calendar that already leaves little recovery time even before an extra World Cup match is added to the heaviest-travelling players' seasons.",
          "At the same time, players from smaller footballing nations have been notably more positive about the change, since expansion is precisely what gave their countries a realistic qualifying path in the first place — for a player whose nation has never reached a World Cup, the extra matches and physical toll are a trade most would take without hesitation. The expansion's costs and benefits, in other words, are not felt equally across the sport, which is part of why no single verdict on the format satisfies everyone.",
        ],
      },
    ],
  },
  {
    slug: 'first-three-country-world-cup',
    sections: [
      {
        h: 'The security coordination behind the scenes',
        p: [
          "A tournament spread across three sovereign nations requires security coordination on a scale no single-host World Cup has ever needed. Three separate national security services, law enforcement agencies and immigration authorities had to build shared protocols years in advance — covering everything from stadium security standards to how a security incident in one country would be communicated to authorities in the other two, given how many fans and teams move between the three during the tournament.",
          "This coordination has occasionally surfaced in public reporting as a point of friction, since the three countries' normal security and policing cultures differ meaningfully, and reconciling them into one consistent standard for ticket-holders took considerably longer than security planning for a single-host tournament typically requires. By the time the tournament kicks off, however, most of this friction is invisible to ordinary fans — which is itself a sign the coordination worked.",
        ],
      },
      {
        h: 'Currency, language and the small frictions of a shared trip',
        p: [
          "Beyond the headline logistics, a three-country World Cup layers a series of small, cumulative frictions onto any fan trying to follow their team across all three hosts: three different currencies to manage, English and Spanish as the two dominant languages with French present in parts of Canada, and three different mobile network landscapes to navigate for basic things like data roaming and emergency contact.",
          "None of these frictions are severe individually, but together they mean a fan planning to follow a team through the whole tournament needs meaningfully more preparation than following a single-host World Cup ever required — pre-arranged currency, an international phone plan, and a working knowledge of at least basic Spanish phrases if travelling through Mexico, on top of the tickets and travel booking that any World Cup trip demands.",
        ],
      },
    ],
  },
  {
    slug: 'how-teams-qualified-2026',
    sections: [
      {
        h: 'A federation that changed its entire approach',
        p: [
          "The redrawn confederation allocations did more than change who qualified for a single tournament — for several federations, a larger guaranteed allocation changed how they approached development entirely, shifting long-term investment from a narrow focus on a handful of already-strong regional programmes toward a broader base, on the logic that a bigger allocation meaningfully raises the odds that investment in a wider pool of talent pays off in an actual qualification.",
          "This kind of structural shift takes years to show results and rarely gets attributed publicly to a qualifying format change, but football administrators in several confederations have said directly that the expanded allocation altered their federation's long-term planning horizon, treating World Cup qualification as newly realistic for programmes that previously treated it as a distant aspiration rather than an achievable near-term goal.",
        ],
      },
      {
        h: 'Why qualifying draws are their own minor drama',
        p: [
          "Long before a ball is kicked in a qualifying campaign, the qualifying draw itself carries real stakes, since the group a team is drawn into can make an already difficult campaign considerably harder or, with a fortunate draw, meaningfully easier. Federations invest real analytical effort in the seeding process itself, since the pot a team is placed in — determined by historical ranking performance — shapes the realistic difficulty of the entire campaign to come.",
          "For fans of a mid-table footballing nation, the qualifying draw can feel almost as tense as a finals draw, precisely because so much more genuinely hangs on it: a fortunate group can be the difference between a nation's first-ever finals appearance and another four years of near-misses, in a way that a finals group draw, for teams already through, simply cannot replicate.",
        ],
      },
    ],
  },
  {
    slug: 'best-third-place-teams-rule',
    sections: [
      {
        h: 'How commentators actually explain it live',
        p: [
          "Explaining the tie-break ladder clearly, in real time, to a television audience that may include many casual viewers unfamiliar with the mechanism is itself a specific broadcasting skill that has developed rapidly since the rule's adoption. The best commentary teams now prepare visual graphics well in advance showing exactly where every third-placed team currently sits in the qualification picture, updated live as results come in from other simultaneous matches, precisely because verbal explanation alone struggles to convey a twelve-way ranking clearly under the pressure of live commentary.",
          "This has, in a subtle way, changed how the format is experienced by viewers: what could easily be a confusing administrative footnote instead becomes one of the group stage's most engaging shared experiences, precisely because broadcasters have invested in making the maths legible in real time rather than leaving viewers to work it out themselves from a table of numbers.",
        ],
      },
      {
        h: 'The players who have to perform under this exact pressure',
        p: [
          "For the players themselves, understanding their own qualification scenario while a match is still being played introduces a genuinely unusual form of in-game decision-making: substitutes warming up may be told a specific scenario has changed based on a score elsewhere, coaching staff relay updates from the touchline about results in parallel matches, and players have described adjusting their own risk-taking — pushing for one more goal, or conversely playing more conservatively to protect a scoreline — based on information about a match happening in a completely different stadium.",
          "This is a genuinely unusual demand to place on athletes mid-contest, and it has occasionally produced visibly strange in-game moments: a team celebrating what looks like a modest, ordinary goal with wild, disproportionate relief, because that specific goal was known in real time to have just secured a qualification spot that had nothing to do with the match being played.",
        ],
      },
    ],
  },
  {
    slug: 'how-to-follow-world-cup-2026',
    sections: [
      {
        h: 'Following the tournament from a demanding work schedule',
        p: [
          "For anyone whose job does not allow flexible viewing during a weekday afternoon kick-off, following a tournament spread across multiple time zones requires some genuine advance planning rather than good intentions alone. Reviewing the full schedule in the first days of the tournament and deliberately flagging the handful of matches worth requesting time off or rearranging a day around, rather than trying to make that decision match by match as the tournament unfolds, tends to produce a far less stressful five weeks.",
          "It is also worth accepting, deliberately and in advance, that some matches simply will not be watchable live given a normal working schedule, and that this is fine — a highlights package watched that same evening loses remarkably little of a group-stage match's substance, and treating the inevitable trade-off as settled ahead of time removes a recurring daily source of minor stress that many fans otherwise carry through the whole tournament.",
        ],
      },
      {
        h: 'Avoiding spoilers when you cannot watch live',
        p: [
          "The single most common way a well-intentioned following plan collapses is an accidental spoiler — a notification, a headline, a friend's comment — reaching you before you have had the chance to watch a match you deliberately saved for later. Muting specific keywords on social media platforms during the tournament, and being disciplined about avoiding sports news homepages until you have actually watched your saved matches, protects the experience far more reliably than simply hoping to avoid spoilers by luck.",
          "Friends and family who already know a result are also a common, well-meaning spoiler source, so it is worth being explicit and a little insistent with the people around you about which matches you have not yet seen — most people are happy to stay quiet about a score if actually asked directly, but very few think to ask first before mentioning a result they assume everyone has already seen.",
        ],
      },
    ],
  },
  {
    slug: 'what-separates-contenders',
    sections: [
      {
        h: 'The financial gap that shapes everything else',
        p: [
          "Underneath depth, identity and nerve sits a less romantic but genuinely foundational factor: financial resources. Wealthier football federations can afford larger backroom staffs, more extensive opposition scouting, better training facilities during the tournament itself, and crucially, a deeper pool of professional players competing at a high level in strong leagues week to week, all of which compound into the depth and preparation that genuine contenders display.",
          "This does not mean money guarantees success — plenty of well-funded federations have underperformed relative to their resources, and this article's other qualities still have to be present regardless of budget — but it does mean that financial capacity sets a kind of ceiling on how much depth and preparation a federation can realistically build, which is worth acknowledging honestly rather than attributing tournament success purely to footballing virtue.",
        ],
      },
      {
        h: 'A trait that rarely gets mentioned: adaptability mid-tournament',
        p: [
          "One further, less discussed quality distinguishes genuine contenders from teams that arrive well-prepared but fade: the ability to adapt tactically between matches based on what has actually happened, rather than rigidly executing the same gameplan regardless of opposition or circumstance. A coaching staff that can diagnose what went wrong in a underwhelming opening match and make a genuine tactical adjustment, rather than simply demanding more effort from the same approach, is solving a different and harder problem than simply having a good plan on paper before the tournament begins.",
          "This adaptability is difficult to scout for in advance and only really becomes visible once a tournament is under way, which is part of why pre-tournament predictions about genuine title contenders are notoriously unreliable — the quality that most separates a team that goes all the way from one that exits in the same round every time often only reveals itself under the specific pressure of a tournament actually going somewhat wrong.",
        ],
      },
    ],
  },
  {
    slug: 'anatomy-of-a-dark-horse',
    sections: [
      {
        h: 'The betting markets rarely see it coming',
        p: [
          "Betting markets, which aggregate a huge amount of public and professional opinion into a single price, are a useful proxy for how genuinely surprising a dark-horse run actually is — and historically, the nations that go on to produce the tournament's most memorable underdog stories are consistently priced at the longest odds in the field before the tournament begins, reflecting just how little the football world collectively anticipates these runs even with modern scouting and analytics.",
          "This is not a failure of the markets so much as a reflection of how genuinely difficult the dark horse phenomenon is to predict in advance: the specific combination of a hot goalkeeper, a settled group peaking at exactly the right moment, and a favourable run of opposition is close to impossible to forecast with any confidence before a ball is kicked, which is exactly why these runs retain their surprise value tournament after tournament rather than becoming a predictable, priced-in pattern.",
        ],
      },
      {
        h: 'The coach who often goes uncelebrated',
        p: [
          "Behind nearly every dark-horse run sits a manager who made a specific, sometimes unpopular decision before the tournament — a settled starting eleven picked for chemistry over individual quality, a defensive setup that drew criticism from a demanding domestic press, a refusal to change a winning approach even after a difficult group-stage result — and stuck to it under pressure that would have broken a less secure appointment.",
          "These managers rarely receive the same acclaim as the star player who scores the decisive goal, but the surprise runs this article describes are, almost without exception, as much a triumph of a specific coaching philosophy holding its nerve as they are a triumph of individual talent — the dark horse's real author is often standing on the touchline rather than on the scoresheet.",
        ],
      },
    ],
  },
  {
    slug: 'weight-of-defending-champions',
    sections: [
      {
        h: 'The hunger question, examined honestly',
        p: [
          "It is worth being specific about what 'lost hunger' actually means in practice, since it can sound like a vague psychological cliché rather than a real phenomenon. Players who have already won the sport's biggest prize report, in interviews years later, a genuinely different relationship to the next tournament — the specific, all-consuming ambition of winning something they had never won is simply not available to repeat in the same way, replaced by a more complicated mix of wanting to defend a legacy and, for some players, a quieter satisfaction that can shade into complacency without the player necessarily noticing it happening.",
          "This is not true of every champion or every player within a winning squad — some players are driven by different, renewable motivations, like personal records or simply loving the competition itself — but enough players in enough winning squads have described this shift candidly that it is treated as a real, if uneven, contributor to the pattern rather than dismissed as sports-media mythology.",
        ],
      },
      {
        h: 'The federation pressure that compounds the problem',
        p: [
          "Winning also changes a federation's own behaviour in ways that can quietly undermine the next campaign: sponsors and broadcasters expect continuity of star names for commercial reasons, fan and media pressure to retain the winning squad's heroes intensifies rather than easing, and a manager proposing to drop a World Cup-winning veteran faces a different, harder kind of public scrutiny than one making the same call about a squad that has won nothing.",
          "This commercial and reputational pressure is rarely acknowledged as a footballing factor, but it measurably shapes real selection decisions, and federations that manage to insulate their football department from exactly this kind of external pressure tend to be the ones brave enough to make the difficult early refresh described earlier in this article — while those that cannot resist it are often the ones whose golden generation is kept together a cycle too long.",
        ],
      },
    ],
  },
  {
    slug: 'does-home-advantage-still-matter',
    sections: [
      {
        h: 'What ticket allocation quietly does for the hosts',
        p: [
          "A less-discussed structural advantage compounds the crowd effect already covered: host nations typically enjoy considerably more favourable ticket allocation for their own matches than a visiting nation's federation receives for its supporters, simply by virtue of geography and the practicalities of ticket distribution. A host nation's fans can attend in far greater numbers relative to the away support a visiting team's federation is realistically able to organise and transport, especially for opponents from distant confederations.",
          "The practical effect compounds the psychological and refereeing effects already discussed: a host nation's matches are, in a very literal numerical sense, more one-sided crowds than almost any other fixture in the tournament, which is part of why the raw crowd-noise advantage a host enjoys tends to be larger in practice than the advantage any single non-host nation, however popular, can realistically generate.",
        ],
      },
      {
        h: 'A counter-argument worth taking seriously',
        p: [
          "It is worth engaging honestly with the strongest counter-argument to home advantage's importance: modern squads are increasingly assembled from players who play their club football abroad, often in the very countries or confederations they are visiting, meaning the 'foreign' conditions a visiting team faces are frequently conditions several of its individual players already live and compete in week to week, blunting the unfamiliarity that home advantage partly depends on.",
          "This genuinely weakens one component of the traditional home-advantage argument, though it does not eliminate the crowd, refereeing and travel-logistics effects discussed elsewhere, which do not depend on individual player unfamiliarity in the same way. The honest conclusion is that home advantage today is a narrower, more specific set of effects than the broad, almost mystical version often invoked in punditry — real, but considerably more surgical than the folk version of the idea suggests.",
        ],
      },
    ],
  },
  {
    slug: 'what-group-of-death-means',
    sections: [
      {
        h: 'How the twelve-group format changed the odds of one forming',
        p: [
          "With twelve groups instead of eight, the pure statistical odds of any single group randomly containing an unusually dense cluster of strong teams shift in an interesting way: more groups drawn means more chances for at least one of them to be a genuine group of death purely by chance, even though seeding is specifically designed to spread the strongest teams apart from each other as evenly as possible.",
          "Seeding reduces but cannot eliminate this possibility, since seeding pots are based on rankings taken at a fixed point before the draw, and rankings can be a step or two behind a team's actual current form — a team seeded lower than its true current strength can land in a group with two seeded teams of similar real quality, manufacturing exactly the dense, competitive group that earns the label, entirely within the seeding rules rather than despite them.",
        ],
      },
      {
        h: 'The flip side: a group of life',
        p: [
          "Less discussed but just as real is the mirror image of a group of death: a group where the seeding and the draw combine to produce a genuinely weak collection of teams, sometimes nicknamed a 'group of life' by pundits looking for the counterpart phrase. These groups produce far less compelling neutral viewing, since the outcome of who advances is rarely in serious doubt by the second matchday, but they matter enormously to the team lucky enough to land in one — a favourable draw is one of the least talked-about but most concretely useful advantages a team can receive before a ball is even kicked.",
          "Fans of a team drawn into a comfortable group rarely complain publicly about the lack of drama, and fans of a team facing a group of death rarely accept the label gracefully in the moment — but neutrals, whose enjoyment depends on competitive uncertainty rather than any one team's fortunes, consistently rate groups of death as the more memorable viewing of the two.",
        ],
      },
    ],
  },
  {
    slug: 'the-48-team-world-cup-explained',
    sections: [
      {
        h: 'What smaller federations did with the extra lead time',
        p: [
          "Knowing the expansion was coming years in advance gave smaller footballing nations a genuinely useful planning window that previous expansions, decided with less lead time, did not offer in the same way. Several federations used the announcement period to specifically restructure youth development pathways around the more realistic prospect of qualification, treating the 2026 cycle as a target to build toward rather than reacting to qualification only after it became mathematically likely.",
          "Whether that extra planning window actually translates into better-prepared debutant nations at the tournament itself remains to be properly judged only once the finals are played and results are in, but the intention behind it — using a known future opportunity to justify present investment — represents a genuinely different, more deliberate kind of federation planning than reacting to a qualification chance only after it has already arrived.",
        ],
      },
    ],
  },
  {
    slug: 'first-three-country-world-cup',
    sections: [
      {
        h: 'A shared trophy, three separate victory parades',
        p: [
          "One detail that rarely gets discussed until it actually happens: whichever nation eventually wins the tournament will hold its victory celebrations at home, but the world champion's flight home may still require passing through the airspace or transiting the territory of the other two co-hosts, an oddity unique to a shared World Cup that previous single-host tournaments never had to consider logistically.",
          "It is a minor, almost trivial detail set against the scale of everything else this tournament format involves, but it captures something true about the whole three-country experiment: even the most triumphant, singular moment a World Cup produces — a champion lifting the trophy — happens this year inside a genuinely shared, three-nation logistical framework that the tournament's organisers had to think through in advance, down to details this granular.",
        ],
      },
    ],
  },
  {
    slug: 'how-teams-qualified-2026',
    sections: [
      {
        h: 'The confederations that pushed hardest for change',
        p: [
          "The redistribution of slots was not handed down without negotiation — it followed years of lobbying from confederations that felt structurally under-represented relative to the size and growth of football within their regions, particularly Africa and Asia, both home to some of the sport's fastest-growing playing populations but historically allocated a strikingly small share of finals places relative to that scale.",
          "The final allocation reflects a genuine, if incomplete, response to that lobbying rather than a purely technical calculation, and understanding qualification for 2026 means understanding it partly as the result of a political negotiation between confederations as much as a footballing one — the number of teams from each region at the finals is a compromise, not a formula derived from performance data alone.",
        ],
      },
    ],
  },
  {
    slug: 'best-third-place-teams-rule',
    sections: [
      {
        h: 'A rule that rewards a specific kind of team',
        p: [
          "Looking across which teams have historically benefited most from a best-third-place mechanism at continental tournaments, a pattern emerges: it tends to reward solid, defensively organised sides that lose narrowly to strong opponents rather than collapsing, since a tight loss preserves the goal difference that the tie-break ladder ultimately depends on. A team that can lose 1-0 to a group's best side while still beating the group's weakest team comfortably is, under this rule, in a stronger position than a team that wins once but loses another match heavily.",
          "This subtly rewards defensive discipline over attacking flair in exactly the scenario — a probable defeat to a stronger group rival — that the rule is most often decisive in, which is part of why well-organised, disciplined underdog nations have tended to benefit disproportionately from the mechanism compared to talented but defensively loose teams with the same overall record.",
        ],
      },
    ],
  },
  {
    slug: 'how-to-follow-world-cup-2026',
    sections: [
      {
        h: 'Building a simple personal ritual around the tournament',
        p: [
          "Beyond logistics and scheduling, fans who report enjoying a long tournament most tend to describe having built some small, repeatable personal ritual around it — a particular snack for match days, a specific person they always watch the big games with, a habit of predicting scorelines with a friend group before kickoff. None of this affects the football itself, but it is frequently what people actually remember fondly years later, more than any single result.",
          "If this is your first time deliberately trying to follow a World Cup properly from start to finish rather than dipping in occasionally, it is worth choosing at least one small ritual early and sticking with it through the tournament — it costs nothing, and it is one of the more reliable ways to turn a five-week football tournament into a five-week personal memory.",
        ],
      },
    ],
  },
  {
    slug: 'what-separates-contenders',
    sections: [
      {
        h: 'Why this list rarely predicts the champion perfectly',
        p: [
          "It is worth being honest that even a team possessing every quality on this list — depth, identity, nerve, coaching continuity, financial backing, and tactical adaptability — is not guaranteed to win, because knockout football retains an irreducible element of chance that no amount of preparation fully removes: a refereeing decision, a deflection, a goalkeeper's save on the night. These traits shift the odds meaningfully in a contender's favour across a whole tournament; they do not eliminate the variance of any single match.",
          "That gap between 'most likely to win' and 'guaranteed to win' is precisely what makes tournament football compelling rather than a foregone academic exercise — the best-prepared team loses often enough, and a plainly less-equipped team wins often enough, that pre-tournament analysis remains a genuine aid to understanding rather than a substitute for actually watching the games.",
        ],
      },
    ],
  },
  {
    slug: 'anatomy-of-a-dark-horse',
    sections: [
      {
        h: 'The specific moment every dark-horse run shares',
        p: [
          "Across otherwise very different surprise campaigns, one specific moment recurs with striking consistency: a single match, usually against a considerably more fancied opponent, in which the underdog team collectively realises, mid-game, that it can actually win — not just compete respectably, but win outright. Players and coaches from past dark-horse runs describe this moment almost identically across different tournaments and different decades: a shift from hoping not to be embarrassed to genuinely believing, which changes the team's whole approach for the rest of the match and often the rest of the tournament.",
          "That psychological turning point is difficult to manufacture deliberately and impossible to predict from outside, which is part of why dark-horse runs remain so unpredictable even to experienced football analysts — the difference between a spirited defeat and the start of a famous run often comes down to exactly this one internal shift, invisible to anyone not inside the dressing room when it happens.",
        ],
      },
    ],
  },
  {
    slug: 'weight-of-defending-champions',
    sections: [
      {
        h: 'The exception that tests the rule',
        p: [
          "Any pattern this consistent invites the obvious question of whether it is destiny or simply a description of what has usually happened so far, and the honest answer sits in between: the champions who have gone on to perform respectably at the following tournament, even without winning it again, generally share the specific trait of having begun the difficult work of squad renewal immediately rather than waiting, exactly as described earlier — meaning the pattern is a real tendency shaped by identifiable behaviour, not an unavoidable curse.",
          "That distinction matters for how the pattern should actually be read: it is not a supernatural weight attached to the trophy itself, but a predictable consequence of specific, avoidable decisions — delayed squad renewal, unmanaged internal complacency, external pressure to keep heroes past their peak — that happen to recur often enough across different champions to look, from a distance, like an inescapable rule rather than a pattern of choices.",
        ],
      },
      {
        h: 'What this means for whichever nation wins in 2026',
        p: [
          "Whichever nation lifts the trophy in 2026 would do well to treat the pattern documented across this article not as superstition but as a genuine planning problem to solve deliberately, starting the moment the celebrations end rather than waiting until the following qualifying campaign forces the issue. The federations that have historically defended a title well began exactly this work in the immediate afterglow of victory, when it is hardest to justify moving on from the players who just delivered the sport's biggest prize.",
          "There is a kind of discipline required here that has little to do with football itself and everything to do with organisational courage: resisting sentiment, resisting commercial pressure to keep marketable veteran stars in place, and beginning a rebuild while the team is still, technically, the best in the world and feels no urgent need to change anything. History suggests that discomfort, taken on early, is precisely what separates the rare champion that defends its title from the much longer list that does not.",
        ],
      },
    ],
  },
  {
    slug: 'does-home-advantage-still-matter',
    sections: [
      {
        h: 'The travel burden the hosts never carry',
        p: [
          "One further home-advantage component deserves its own explicit mention because it is easy to underweight: a host nation never has to travel for its own group matches, sleeping in familiar beds and training on home soil throughout, while every visiting nation, regardless of how wealthy or well-organised its federation, must manage jet lag, unfamiliar hotels, and travel fatigue layered on top of everything else a tournament demands. Over a run of three or more group matches, this cumulative rest and routine advantage compounds in ways that are easy to state simply but genuinely significant in practice.",
          "Sports scientists who work with international squads rate disrupted sleep and unfamiliar training environments as a measurable performance factor, not a marginal one, and a host nation is structurally exempt from this entire category of disadvantage for its own matches — an advantage that has nothing to do with crowd noise, refereeing, or climate, and simply reflects the practical reality of not having to travel to compete.",
        ],
      },
      {
        h: 'Why 2026 offers an unusually clean natural experiment',
        p: [
          "Because 2026 has three hosts rather than one, this tournament offers researchers and analysts an unusually clean opportunity to actually test how much home advantage still matters, by comparing how the United States, Canada and Mexico each perform in their own portion of the tournament against how similarly-ranked non-host nations perform elsewhere in the same competition. A single-host tournament only ever provides one data point per cycle; three simultaneous, differently-sized hosts in one tournament is close to a natural experiment football rarely gets to run.",
          "Analysts and academics who study the phenomenon have already flagged 2026 as a uniquely valuable dataset for exactly this reason, and whatever the three hosts' actual results turn out to be, the comparison between them — three nations experiencing a diluted, shared version of home advantage simultaneously, under otherwise identical tournament conditions — will likely shape how the concept of World Cup home advantage is discussed for tournaments to come.",
        ],
      },
    ],
  },
  {
    slug: 'the-48-team-world-cup-explained',
    sections: [
      {
        h: 'The format debate is not actually settled',
        p: [
          "It is worth resisting the temptation to treat this article's explanation of the mechanics as also settling the value judgement attached to them, because the debate over whether 48 teams genuinely improves the World Cup remains open among people who follow the sport closely, and will likely not be resolved by a single tournament's worth of evidence either way. A dull group stage in 2026 will be cited by critics as proof the expansion diluted quality; a thrilling one will be cited by supporters as proof the doubters were wrong — and both readings will be somewhat unfair generalisations from a small sample.",
          "The honest position, at least until several cycles of the 48-team format have been played and studied, is that the format's real costs and benefits are still being discovered in real time, by the very players, coaches and fans experiencing it for the first time in 2026 — which is, in its own way, part of what makes this particular tournament historically significant regardless of which individual nation ends up lifting the trophy.",
        ],
      },
    ],
  },
  {
    slug: 'first-three-country-world-cup',
    sections: [
      {
        h: 'What neutrals get out of the spread that fans following one team do not',
        p: [
          "There is a specific vantage point available only to neutral viewers not fixed on a single team's fate: the chance to genuinely experience three different footballing cultures and three different atmospheres inside one tournament, rather than the single, consistent host-nation flavour that every previous World Cup, shared or not, has ultimately offered. A neutral fan who watches matches across all three hosts over the tournament's five weeks is, in effect, getting three smaller travel experiences compressed into one event, entirely through television.",
          "This is arguably the format's most genuinely novel gift to the ordinary viewer rather than to any team's competitive fortunes — previous World Cups let you experience one host nation deeply; 2026 lets you experience three host nations more broadly, and which of those two experiences a given fan prefers says as much about what they want from a World Cup as it does about the format itself.",
        ],
      },
    ],
  },
  {
    slug: 'how-teams-qualified-2026',
    sections: [
      {
        h: 'The debutant nations worth knowing before the finals begin',
        p: [
          "Every expanded qualifying cycle produces at least a small handful of nations reaching the World Cup finals for the very first time in their history, and 2026's larger allocation has produced more of these debutant stories than the 32-team era typically did. For each of these nations, simply being present at the finals — regardless of how the group stage results actually go — represents the single biggest achievement in that country's footballing history, a fact worth remembering when a debutant nation's group-stage exit is reported as unremarkable news elsewhere.",
          "Following at least one debutant nation's story through the tournament, beyond whichever teams you already support, is one of the more rewarding ways to engage with the expanded format specifically, since these are the nations for whom the qualifying campaign described throughout this article was not a formality on the way to an expected finals place, but the culmination of what was, for their football federation, genuinely uncharted territory.",
        ],
      },
    ],
  },
  {
    slug: 'best-third-place-teams-rule',
    sections: [
      {
        h: 'A rule that will keep evolving',
        p: [
          "Given that this is the format's first real large-scale use at a World Cup rather than merely at a continental championship, it would not be surprising if the exact tie-break criteria or the number of qualifying third-placed teams gets adjusted in future cycles, based on whatever quirks and edge cases 2026 actually surfaces in practice — sporting regulations of this kind are rarely finished products on their first real-world outing, and governing bodies have a track record of refining exactly this sort of mechanism after seeing how it plays out with real teams and real stakes attached.",
          "For now, though, the rule as it stands is what every one of the twelve groups will be playing under, and understanding it properly — not just the headline idea of 'eight best thirds advance' but the actual tie-break ladder underneath it — is the difference between merely watching the group stage and actually understanding the stakes behind every pass in a tight, ostensibly dead rubber late in the group.",
        ],
      },
    ],
  },
  {
    slug: 'how-to-follow-world-cup-2026',
    sections: [
      {
        h: 'The one mistake almost everyone makes in week one',
        p: [
          "Nearly every fan who has followed a large expanded tournament before reports making the same mistake in the opening days: trying to watch everything, running on adrenaline and the novelty of a fresh tournament, and burning out by roughly the second week, right as the group stage tightens and the stakes actually rise. The lesson from that common experience is to deliberately under-commit in the first few days rather than over-commit, since it is far easier to add more matches to your viewing once you have a sustainable rhythm than to recover enthusiasm you have already spent too early.",
          "Treat the first week as a calibration period specifically: notice which matches you are drawn to regardless of any plan, notice what times of day actually work for your schedule, and adjust your approach for the remaining month based on that real information rather than a plan made before the tournament even started. The version of the tournament you end up enjoying most is rarely the one you predicted for yourself in advance.",
        ],
      },
    ],
  },
  {
    slug: 'what-separates-contenders',
    sections: [
      {
        h: 'How to actually apply this list watching the 2026 draw',
        p: [
          "With the format and traits described throughout this article in mind, the practical use of all of it is watching the group stage with a sharper eye than simply following the score: notice which teams are rotating their squad meaningfully rather than relying on the same eleven every match, notice which sides look calm rather than rattled when a match tightens late, and notice which coaching staffs make a visible tactical adjustment at half-time rather than simply demanding more from an approach that clearly is not working.",
          "None of these observations require expert analysis to make — they are visible to any attentive viewer willing to look slightly past the ball — and doing so across the group stage gives a far better private prediction of who will actually go deep in the knockouts than reading a single pre-tournament ranking or headline-driven favourites list ever could.",
        ],
      },
    ],
  },
  {
    slug: 'anatomy-of-a-dark-horse',
    sections: [
      {
        h: 'Picking your own dark horse before 2026 begins',
        p: [
          "Armed with the traits described throughout this article — a settled, long-serving squad, a defined defensive identity, a goalkeeper capable of an inspired run of form, and a schedule that allows a favourable set of opponents to align — it is genuinely possible to make an informed guess at which of the 48 competing nations is best positioned to be 2026's surprise story, rather than simply waiting to recognise one in hindsight once it has already happened.",
          "This is precisely the kind of prediction that adds genuine stakes to watching a nation you otherwise have no connection to, and it is worth making explicitly, even just to yourself, before the group stage begins — half the pleasure of a dark-horse run, for a neutral fan, is watching a hunch you made in week one slowly, improbably, come true over the following month.",
        ],
      },
      {
        h: 'How the 48-team format changes the dark-horse calculation',
        p: [
          "The expanded format discussed elsewhere in this collection genuinely reshapes what a dark-horse run even looks like, since the best-third-place mechanism means a small nation no longer needs to win its group, or even necessarily finish second, to survive into the knockouts — a modest, unglamorous group-stage campaign that would have ended a smaller nation's tournament outright under the old 32-team rules can now be enough to sneak through, giving a settled underdog squad an extra life it would not previously have had.",
          "This subtly changes the shape of the classic dark-horse story for 2026 specifically: rather than needing one single, spectacular group-stage upset to be noticed at all, a well-organised smaller nation can now afford a quieter, more pragmatic group phase — narrow losses, a single win, careful goal-difference management — and still arrive in the round of 32 with its dark-horse credentials completely intact, simply by having played the format's arithmetic as shrewdly as it played the actual football.",
        ],
      },
    ],
  },
  {
    slug: 'the-48-team-world-cup-explained',
    sections: [
      {
        h: 'The one number worth remembering above all others',
        p: [
          "If every other detail in this explainer blurs together, the single number worth retaining is eight: eight best third-placed teams, out of twelve, advance alongside the twenty-four group winners and runners-up. Everything else about the format — the twelve groups, the new round of 32, the longer road to the final — follows logically once that one number is understood, and it is the number that most reliably distinguishes a fan who genuinely understands 2026's format from one still thinking in the older, simpler 32-team shape.",
        ],
      },
    ],
  },
  {
    slug: 'first-three-country-world-cup',
    sections: [
      {
        h: 'The legacy question already being asked',
        p: [
          "Even before a ball has been kicked, host-city planners and football administrators in all three nations are already discussing what happens to the infrastructure, the fan interest, and the institutional knowledge built for this tournament once it ends — whether the surge in youth participation a host country typically experiences proves durable, and whether the specific three-nation coordination model built for 2026 becomes a template other regions borrow for future joint bids.",
          "That legacy conversation, usually reserved for after a tournament concludes, has started unusually early for 2026 specifically because the format itself is being watched so closely as a potential model — if the three-country experiment is judged a success, shared hosting bids involving multiple neighbouring nations may become considerably more common at future World Cups, making 2026 something of a test case for how the tournament might be organised for decades to come.",
        ],
      },
    ],
  },
  {
    slug: 'how-teams-qualified-2026',
    sections: [
      {
        h: 'Reading a qualifying campaign the way a scout does',
        p: [
          "Beyond simply noting which nations qualified, a genuinely informed fan going into the finals benefits from knowing something about how each team actually got there — a nation that qualified by grinding out narrow, disciplined wins across a long campaign is telling you something different about its likely tournament identity than one that qualified by scoring heavily against a weak regional group but rarely faced sustained pressure.",
          "This kind of context, easily found in qualifying summaries published by football media in the months before the finals, turns the opening group matches from a blank slate into something you can genuinely anticipate — you already know, in broad strokes, whether a given debutant nation is likely to sit deep and disrupt or attempt to play expansively, because its qualifying campaign already showed you which version of itself that team actually is under pressure.",
        ],
      },
    ],
  },
  {
    slug: 'best-third-place-teams-rule',
    sections: [
      {
        h: 'A mechanism that rewards paying attention to the whole competition',
        p: [
          "Perhaps the rule's most underrated effect is behavioural rather than mathematical: it actively rewards fans who follow the tournament broadly rather than narrowly, since understanding your own team's realistic third-place prospects requires tracking results across groups you might otherwise have no reason to watch at all. In a strange way, the rule quietly incentivises the exact kind of broad, whole-tournament engagement that makes following a World Cup more rewarding in the first place, turning self-interest in one team's fate into a reason to actually care about matches you would otherwise ignore.",
        ],
      },
    ],
  },
  {
    slug: 'how-to-follow-world-cup-2026',
    sections: [
      {
        h: 'What to do when your team is eliminated early',
        p: [
          "For any fan whose own nation exits in the group stage, the tournament does not have to end there, even though the temptation to disengage is real and understandable. This is precisely the moment the earlier advice about adopting a second team pays off — a fan with an already-chosen underdog or a favourite style of play to follow has somewhere to redirect their attention immediately, rather than losing interest in the remaining four weeks of the tournament altogether.",
          "Fans who plan for this possibility before it happens — rather than being caught by surprise by their own team's elimination — consistently report enjoying the rest of the tournament considerably more than those who treated their own team's run as the entire point of watching. A World Cup rewards attachment to the tournament itself, not only to any single team's fortunes within it.",
        ],
      },
    ],
  },
  {
    slug: 'what-separates-contenders',
    sections: [
      {
        h: 'The trap of confusing star power with contender status',
        p: [
          "One of the most common mistakes casual observers make before a tournament begins is equating a squad's collection of famous individual names with genuine contender status, when the traits covered in this article — depth, coaching continuity, tactical adaptability, squad temperament — correlate far more reliably with deep tournament runs than star wattage alone ever has. Some of the most star-studded squads in the tournament's history have exited early, undone by exactly the unglamorous weaknesses this article describes, while less celebrated squads with every unglamorous trait intact have gone all the way.",
          "Learning to see past name recognition to the structural traits underneath is, in a real sense, the entire skill of predicting a World Cup well — and it is a skill available to any attentive viewer, not just professional pundits with inside access to a squad's training ground.",
        ],
      },
    ],
  },
  {
    slug: 'weight-of-defending-champions',
    sections: [
      {
        h: 'Whether 2026\'s reigning champion can break the pattern',
        p: [
          "Whichever nation arrives at 2026 as the reigning champion enters the tournament carrying every burden this article has described, and how that specific federation has handled the four years since its triumph — whether it began renewing its squad early, whether it managed sentiment and external pressure around its winning heroes, whether it has kept the coaching continuity that built the identity in the first place — will likely be visible in its group-stage form well before the knockouts even begin.",
          "Watching the defending champion's opening matches with this specific lens, rather than simply expecting continued dominance because of the badge on the shirt, is one of the more genuinely informative ways to follow the tournament's early rounds — the champions' curse, if it is coming, tends to announce itself early, in a squad that looks a step slower or a core that looks a year overdue for refreshing, well before an actual group-stage elimination confirms it.",
        ],
      },
    ],
  },
  {
    slug: 'does-home-advantage-still-matter',
    sections: [
      {
        h: 'The honest final answer',
        p: [
          "Pulling every thread of this article together, the honest answer to the question in its title is neither a simple yes nor a simple no: home advantage still matters, measurably, through crowd effects on players and officials, through the removal of travel fatigue, and through favourable ticket allocation — but it matters less than the sport's folklore has traditionally suggested, and considerably less than it would for a single, undivided host nation rather than one of three.",
          "The right way to carry this into watching the 2026 tournament itself is to treat host-nation form as genuinely boosted, worth factoring into any prediction, but never as a guarantee — plenty of host nations across World Cup history have still exited early despite every advantage covered in this piece, which is itself the clearest possible evidence that home advantage tilts the odds without ever deciding them outright.",
        ],
      },
    ],
  },
  {
    slug: 'what-group-of-death-means',
    sections: [
      {
        h: 'How pundits actually identify one before the tournament starts',
        p: [
          "Professional football pundits and analysts have their own informal but fairly consistent method for flagging a likely group of death the moment the draw is made: rather than looking only at world rankings, they weigh recent tournament pedigree, the quality of each team's individual players in their club competitions, and specifically whether a group contains more than one nation with a recent history of reaching a World Cup's later knockout rounds. Rankings alone can understate a team temporarily out of form but stacked with proven tournament performers, which is exactly the kind of nuance a purely numerical measure like average ranking misses.",
          "This more holistic, experience-based method of identifying a group of death is less rigorous than a pure statistical measure but often more accurate in practice, because it captures a dimension — a team's specific history of performing under the unique pressure of knockout tournament football — that a season's club form or a ranking snapshot cannot fully reflect. The pundits who are most trusted for these predictions tend to be the ones who have covered enough previous tournaments to have a genuine feel for which kind of quality actually survives the pressure of a World Cup group, rather than just which teams look good on paper.",
        ],
      },
      {
        h: 'The group of death that never quite lived up to its name',
        p: [
          "For every group correctly identified as a true group of death, the tournament also regularly produces a group hyped in exactly the same way beforehand that then fails to deliver the expected carnage — one of the supposedly elite teams badly underperforms, another catches an unexpected wave of form, and the group that pundits confidently marked as brutal turns out, in hindsight, to have been fairly straightforward after all. This is a useful, humbling reminder that the phrase describes a prediction made before the football is actually played, not a guaranteed outcome, and predictions about a sport this unpredictable are wrong often enough to deserve a healthy dose of humility before the group stage kicks off.",
        ],
      },
      {
        h: 'The single best way to enjoy one as a viewer',
        p: [
          "Once the draw identifies a genuine candidate, the most rewarding way to actually watch a group of death unfold is to resist picking a side at all, and instead watch purely for the accumulating maths across all three matchdays — treating the group as a single, slow-building story rather than three isolated results. Viewed that way, a group of death rewards patience: the first matchday rarely tells you much, the second sharpens the picture considerably, and the third is often among the most tense ninety minutes the entire group stage produces, precisely because every permutation the tie-break ladder allows for is still, in principle, alive.",
          "Fans who make a point of following a confirmed group of death this way, rather than only checking in for their own team's matches within it, tend to describe it as some of the most purely dramatic football the tournament offers outside the knockout rounds themselves — which is, in the end, the entire reason the phrase has stayed part of football's vocabulary for as long as it has.",
        ],
      },
    ],
  },
  {
    slug: 'first-three-country-world-cup',
    sections: [
      {
        h: 'A quiet diplomatic subtext worth noticing',
        p: [
          "Beyond football, a joint World Cup between three neighbouring nations inevitably carries a layer of quiet diplomatic symbolism that observers outside the sport have not been shy about noting: three countries whose broader relationship has, at various points, involved real political friction are cooperating closely on one of the largest shared logistical undertakings any of them will attempt this decade. Sport has often served this kind of quiet bridging function between neighbouring nations, and a jointly hosted World Cup is among the more visible examples of it in recent memory.",
          "None of this changes the football itself, and most fans will experience the tournament simply as a great sporting event rather than a diplomatic gesture. But it is worth knowing, as context, that the three-country hosting model being tested in 2026 carries meaning well beyond the pitch for the governments and populations of the three nations involved, in ways that a single-host tournament never quite does.",
        ],
      },
    ],
  },
  {
    slug: 'how-teams-qualified-2026',
    sections: [
      {
        h: 'What happens to the federations that fell just short',
        p: [
          "For every nation that qualified through the dramatic intercontinental play-off described earlier, another nation experienced the mirror-image disappointment — arriving at the same high-stakes fixture with a real chance, and leaving with nothing to show for an otherwise successful qualifying campaign. These near-miss federations rarely disappear quietly; the sporting and financial disappointment of missing a World Cup by one match typically triggers its own wave of consequences back home, from managerial departures to renewed federation investment aimed specifically at not repeating the near-miss next cycle.",
          "Tracking what a near-miss federation does in the four years that follow is, in its own way, as interesting a story as any of the qualifying campaigns that actually succeeded — some rebuild effectively and arrive at the following World Cup considerably stronger for the disappointment, while others spiral through managerial instability that compounds rather than resolves the underlying problem. The nations you see at the 2026 finals are only half the story; the ones who so narrowly are not there have their own equally compelling account of what went wrong.",
        ],
      },
    ],
  },
  {
    slug: 'best-third-place-teams-rule',
    sections: [
      {
        h: 'A rule most casual fans only learn about by accident',
        p: [
          "Unlike the offside law or the basic structure of a group stage, the best-third-place mechanism is genuinely obscure to a large share of casual World Cup viewers until the exact moment it becomes relevant to a match they are watching — a commentator suddenly explaining a live permutation is, for many fans, the first time they properly understand the rule exists at all, despite having potentially watched entire previous tournaments without ever needing to know it.",
          "This makes the rule almost uniquely well-suited to word-of-mouth explanation during the tournament itself: it rewards exactly the kind of viewer who asks a knowledgeable friend 'wait, how does this work?' mid-match, and a good, clear answer in that moment often converts a casual viewer into someone actively tracking the qualification permutations across groups for the rest of the tournament, precisely because the mechanism turns out to be far more interesting once genuinely understood than its dry, technical description on a rules page ever suggests.",
        ],
      },
    ],
  },
  {
    slug: 'how-to-follow-world-cup-2026',
    sections: [
      {
        h: 'A final piece of advice worth taking seriously',
        p: [
          "If none of the specific tactics in this guide stick, the one habit worth adopting above all others is simply giving yourself permission to miss things. A 104-match tournament spread across five weeks and three time zones was never designed to be consumed in full by anyone with a job, a family, or a life outside football, and treating incomplete coverage as a personal failure is the single fastest route to a burnt-out, joyless relationship with what should be one of sport's great pleasures.",
        ],
      },
    ],
  },
  {
    slug: 'what-separates-contenders',
    sections: [
      {
        h: 'A final test worth applying to any team you fancy',
        p: [
          "Before backing any particular nation as a genuine title contender, it is worth running through a short, honest checklist built from everything covered in this article: does this squad have credible depth beyond its best eleven, has its manager had genuine time to build a settled identity, has it shown the ability to grind out a result when not playing well, and does its key players' history under pressure suggest calm rather than fragility? A team that clears all four hurdles is a legitimate contender regardless of how it is being talked about in the media; a team that fails two or more, however fashionable its reputation, usually is not.",
          "This is not a foolproof formula — nothing in football is — but it is a considerably more reliable filter than reputation, betting odds, or star power alone, and applying it honestly before the tournament begins is likely to produce a shortlist of genuine contenders that looks meaningfully different from, and more accurate than, the list generated by pre-tournament hype alone.",
        ],
      },
    ],
  },
  {
    slug: 'anatomy-of-a-dark-horse',
    sections: [
      {
        h: 'Why neutrals remember the dark horse longer than the champion',
        p: [
          "Ask football fans years later to name a recent World Cup winner and many will need a moment to recall it correctly; ask the same fans to name a great underdog run from the same tournament and the answer usually comes immediately and with visible affection. This asymmetry says something real about what actually sticks in a neutral viewer's memory: a champion winning as expected, or even as a mild surprise, satisfies a prediction, while a genuine dark-horse run defies one — and defied expectations are, for most people, simply more memorable than confirmed ones.",
          "This is worth knowing as encouragement for adopting an underdog early in 2026 rather than waiting to see how the tournament unfolds before committing emotionally to any one story: the dark horse you follow from its unremarkable opening match through to its eventual, inevitable elimination is very likely to be the single story from this entire World Cup that you still remember clearly a decade from now, long after the actual champion's name has needed a quick mental search to recall.",
        ],
      },
    ],
  },
  {
    slug: 'weight-of-defending-champions',
    sections: [
      {
        h: 'A pattern that extends beyond football itself',
        p: [
          "The champions' curse is not unique to World Cup football — sports scientists and organisational psychologists have documented strikingly similar patterns in other elite team sports and even in some non-sporting competitive fields, wherever a group achieves a defining, singular success and then has to sustain motivation and hunger for a repeat performance against fresh, hungrier challengers with nothing to lose. The specific mechanisms differ by context, but the underlying psychological shape — achieved ambition proving harder to sustain than pursued ambition — recurs often enough across entirely different competitive domains to suggest it reflects something genuinely true about human motivation rather than a quirk specific to football.",
        ],
      },
    ],
  },
  {
    slug: 'does-home-advantage-still-matter',
    sections: [
      {
        h: 'What this means for betting markets and predictions',
        p: [
          "Betting markets, which aggregate enormous amounts of information into a single price, consistently build in some premium for host nations at major tournaments — evidence that professional odds-setters, whose livelihood depends on being right rather than being romantic about the sport, still treat home advantage as a real, quantifiable factor worth pricing in rather than a sentimental myth. The size of that premium has shrunk over recent tournament cycles, tracking the erosion described earlier in this piece, but it has never shrunk to zero.",
          "That market behaviour is, in its own way, the most objective evidence available for this whole article's argument: professionals whose job is to price risk accurately still believe home advantage matters, just less than it once did — precisely the nuanced, neither-yes-nor-no conclusion this piece has been building toward throughout.",
        ],
      },
      {
        h: 'A closing thought for the neutral fan',
        p: [
          "For a neutral without a personal stake in any of the three hosts, the practical upshot of everything in this article is simply an extra layer of context worth carrying into the group stage: when a host nation is playing well, some meaningful share of that performance is the tournament's structure working in its favour, not just the team itself — a distinction worth keeping in mind before crowning any host's form as proof of genuine title-winning quality on the evidence of the group stage alone.",
        ],
      },
    ],
  },
  {
    slug: 'first-three-country-world-cup',
    sections: [
      {
        h: 'The single sentence that captures 2026',
        p: [
          "If this whole article reduces to one idea, it is this: 2026 is not simply a World Cup that happens to be held in three countries, it is a genuinely different kind of tournament shaped at every level — travel, atmosphere, home advantage, diplomacy — by the fact of three hosts rather than one, and understanding that shapes how the whole tournament should be watched and judged.",
        ],
      },
    ],
  },
  {
    slug: 'how-teams-qualified-2026',
    sections: [
      {
        h: 'One final reminder before the finals begin',
        p: [
          "Every single team walking out for its opening match in 2026 survived a real, often gruelling process to be there, whether that process was a comfortable regional campaign or the knife-edge intercontinental play-off described earlier — a fact worth remembering the next time a team is dismissed as making up the numbers before it has kicked a ball.",
        ],
      },
    ],
  },
  {
    slug: 'best-third-place-teams-rule',
    sections: [
      {
        h: 'The drama this rule guarantees, tournament after tournament',
        p: [
          "Format changes come and go, but as long as some version of a best-third-place mechanism survives at the World Cup, it will keep manufacturing the exact kind of unplanned, simultaneous, cross-group tension this article has described — genuine drama that no scriptwriter could plan for, produced purely by the accumulated arithmetic of twelve separate groups colliding in real time on the tournament's final group matchday.",
        ],
      },
      {
        h: 'Why this rule rewards knowing the whole competition, not just your team',
        p: [
          "Fans who only track their own nation's group miss the format's best feature entirely: the interlocking nature of the third-place calculation means genuinely following the rule rewards a kind of broad, whole-tournament literacy that a narrower, single-team focus simply cannot deliver, turning this technical, easily overlooked mechanism into one of the more quietly rewarding reasons to watch the group stage in full rather than in fragments.",
        ],
      },
    ],
  },
  {
    slug: 'how-to-follow-world-cup-2026',
    sections: [
      {
        h: 'What "enjoying" a World Cup actually means',
        p: [
          "Ultimately, no single method of following this tournament is more legitimate than another — watching every match live, catching only highlights, or following just one adopted underdog's journey are all genuine ways to enjoy a World Cup, and the only real mistake is adopting an approach that leaves you exhausted rather than engaged by the time the final whistle blows on the tournament itself.",
        ],
      },
    ],
  },
  {
    slug: 'what-separates-contenders',
    sections: [
      {
        h: 'The trait that ties every other trait together',
        p: [
          "If depth, identity, coaching continuity, financial backing, adaptability and nerve all sound like separate qualities, they actually share a single underlying thread: each one is really a form of preparation absorbing pressure so that a team's best players can perform closer to their peak under tournament conditions than their under-prepared rivals — which is, in the end, a fairly simple explanation for a phenomenon that pre-tournament punditry usually makes sound far more mysterious than it actually is.",
        ],
      },
    ],
  },
  {
    slug: 'anatomy-of-a-dark-horse',
    sections: [
      {
        h: 'The invitation this article is really extending',
        p: [
          "Everything described here amounts to a simple, practical invitation before the 2026 group stage begins: look past the favourites everyone already expects to see deep in the tournament, find the settled, disciplined smaller nation with a goalkeeper in form and a plan it believes in, and adopt it now, before anyone else has noticed — because by the time the whole neutral footballing world has caught on to a dark horse, most of the pleasure of having spotted it early has already passed.",
        ],
      },
    ],
  },
  {
    slug: 'weight-of-defending-champions',
    sections: [
      {
        h: 'What to watch for in the very first match',
        p: [
          "The clearest early tell of whether the reigning champion has escaped its own curse this cycle rarely appears in the scoreline of its opening match at all — it appears in body language: does the squad look hungry and slightly nervous the way a team chasing something looks, or does it look comfortable and settled the way a team merely defending something looks? Experienced observers say that difference is visible within the first twenty minutes, long before the final result confirms whether the champions' curse struck again.",
        ],
      },
      {
        h: 'The one sentence worth carrying into the group stage',
        p: [
          "If a single idea from this whole piece is worth remembering while watching the reigning champion's opening matches in 2026, it is that winning the World Cup solves nothing about winning the next one — every advantage the previous triumph bought has already been spent, and the champion begins this new tournament facing exactly the same blank slate as the 47 nations who never lifted the trophy at all.",
        ],
      },
    ],
  },
  {
    slug: 'how-to-follow-world-cup-2026',
    sections: [
      {
        h: 'The measure of success worth actually using',
        p: [
          "At the end of the five weeks, the fans who report the most satisfaction rarely measure success by matches watched at all — they measure it by whether they still felt genuine excitement in the final week rather than relief that the tournament was ending, which is really just another way of saying the advice throughout this piece points at one underlying goal: pace yourself so the enthusiasm you feel kicking off in June is still available for the final in July.",
        ],
      },
    ],
  },
  {
    slug: 'what-separates-contenders',
    sections: [
      {
        h: 'Why this list is worth revisiting after the tournament ends',
        p: [
          "Once 2026 has concluded, it is worth returning to this exact list of traits and checking them against whichever nation actually won, since the surest way to sharpen your own judgement for the next tournament is comparing a prediction framework against a real result honestly, rather than only ever applying it in the uncertain, unresolved moment before a ball has been kicked.",
        ],
      },
    ],
  },
  {
    slug: 'anatomy-of-a-dark-horse',
    sections: [
      {
        h: 'One name worth writing down before kickoff',
        p: [
          "Whatever your existing loyalties, it is worth the small ritual of actually writing down one specific nation's name before the tournament begins as your personal dark-horse pick for 2026, based on the traits this article has described — not simply thinking it, but writing it, since a written prediction carries a small but real accountability that makes the eventual outcome, whichever way it goes, considerably more satisfying to look back on.",
        ],
      },
    ],
  },
  {
    slug: 'does-home-advantage-still-matter',
    sections: [
      {
        h: 'The question this article leaves for the tournament itself',
        p: [
          "Every argument in this piece is, in the end, a prediction about how much a diluted, three-way home advantage will actually show up in the results — and 2026 itself, once played, will be the real answer, in a way no amount of prior analysis can substitute for. Whichever way it turns out, it will meaningfully update how the football world talks about home advantage at every World Cup that follows.",
        ],
      },
    ],
  },
  {
    slug: 'what-group-of-death-means',
    sections: [
      {
        h: 'Why the phrase has such staying power',
        p: [
          "For a piece of football jargon this loosely and inconsistently applied, it is worth asking why 'group of death' has survived in the sport's vocabulary for decades without being replaced by a more precise term, and the likely answer is simply that its vagueness is part of its appeal — a phrase this vivid and dramatic does real communicative work in a single sentence of commentary that a more accurate but clinical description of relative group strength never could, which is exactly why broadcasters keep reaching for it every single tournament regardless of how loosely it actually applies.",
          "Language built for drama rarely survives by being precise, and the group of death is a good example of a phrase whose imprecision is functionally part of its usefulness — it tells a viewer, in three words, that something dramatic is likely coming, and that promise, honoured often enough across enough tournaments, is why the phrase has outlasted every attempt by more careful analysts to replace it with something more exact.",
        ],
      },
      {
        h: 'What to watch for on the 2026 draw night',
        p: [
          "When the 2026 draw is made, the fastest way to spot a genuine candidate live is to watch not the reactions of pundits in the studio but the reactions of the players and coaches actually pulled into that group during the ceremony itself — a forced smile, a rueful laugh, or a visibly tighter handshake between rival coaches often gives away which group the people who actually have to play it already recognise as the hard one, well before any analyst has finished running the numbers.",
        ],
      },
    ],
  },
  {
    slug: 'weight-of-defending-champions',
    sections: [
      {
        h: 'A weight that only a champion ever has to carry',
        p: [
          "It is worth ending on the fact that this entire article describes a problem only one team at any given World Cup actually has, which is itself a strange kind of privilege: every other nation would gladly trade places with the reigning champion, curse and all, for the chance to have already won the trophy once, whatever difficulty defending it brings.",
        ],
      },
    ],
  },
  {
    slug: 'does-home-advantage-still-matter',
    sections: [
      {
        h: 'A short answer for anyone in a hurry',
        p: [
          "For readers who want the entire argument in one line: yes, home advantage still matters, but 2026's three-way split means it matters roughly a third as much, structurally, as it would for a single undivided host — real, present, and worth watching for, but no longer decisive on its own, and worth remembering the next time a host nation's form gets overstated in the build-up to a knockout match.",
        ],
      },
    ],
  },
];

export function applyExpansions(all: Article[]): void {
  const bySlug = new Map(all.map((a) => [a.slug, a]));
  for (const exp of EXPANSIONS) {
    const article = bySlug.get(exp.slug);
    if (!article) continue;
    article.sections.push(...exp.sections);
    if (exp.title) article.title = exp.title;
    if (exp.excerpt) article.excerpt = exp.excerpt;
  }
}
