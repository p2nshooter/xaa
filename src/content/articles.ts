import type { Article, Category } from './types';

/**
 * xaa.es editorial library — original, independent, plain-English guides to
 * insurance, saving, borrowing and building wealth. Rules that keep this
 * AdSense-healthy: 100% original writing, educational only (no "get rich",
 * no product tips), every money article under a site-wide disclaimer.
 */

export const CATEGORIES: Category[] = [
  { slug: 'insurance', name: 'Insurance', tagline: 'Life, health, home and car cover without the jargon', icon: '🛡️' },
  { slug: 'saving', name: 'Saving & Banking', tagline: 'Emergency funds, accounts and everyday money', icon: '🏦' },
  { slug: 'investing', name: 'Investing', tagline: 'Index funds, compounding and the long game', icon: '📈' },
  { slug: 'borrowing', name: 'Credit & Loans', tagline: 'Mortgages, credit scores and borrowing wisely', icon: '💳' },
  { slug: 'retirement', name: 'Retirement', tagline: 'Pensions, drawdown and planning for later', icon: '🌅' },
];

export const ARTICLES: Article[] = [
  {
    slug: 'term-vs-whole-life-insurance',
    category: 'insurance',
    title: 'Term vs Whole Life Insurance: Which One Actually Protects Your Family?',
    excerpt:
      'Two products sold under one name, with wildly different costs. A clear breakdown of when term life is the honest choice and the narrow cases where whole life earns its keep.',
    date: '2026-07-02',
    minutes: 9,
    author: 'The Xaa Desk',
    sections: [
      {
        h: '',
        p: [
          'Life insurance exists to answer one brutal question: if your income stopped tomorrow, would the people who depend on it be all right? Everything else — the product names, the riders, the sales scripts — is detail on top of that question. And yet the industry has built two very different products around it, term and whole life, whose costs can differ by a factor of ten for the same amount of protection.',
          'Understanding the difference is the single highest-value hour a family earner can spend on their finances. Get it right and a household is protected for the price of a streaming subscription. Get it wrong and you either leave your family exposed or pour money into a policy that quietly underperforms almost every alternative.',
        ],
      },
      {
        h: 'What term life actually is',
        p: [
          'Term life is pure protection with an expiry date. You pay a modest premium; if you die during the term — say 20 or 30 years — your beneficiaries receive a fixed, tax-free lump sum. If you outlive the term, the policy ends and nobody gets a payout. That "nothing back" ending is not a flaw; it is precisely why term is cheap. The insurer is only ever on the hook for the risk itself, not an investment account.',
          'Because there is no savings component, a healthy person in their thirties can often buy a large amount of cover for a strikingly small monthly premium. The job of term insurance is to bridge the years when other people depend on your income — while the mortgage is large and the children are young — and to disappear once those responsibilities are behind you and your own assets have grown.',
        ],
      },
      {
        h: 'What whole life adds — and charges for',
        p: [
          'Whole life (and its cousins, universal and endowment policies) never expires and bundles a savings or investment account, the "cash value", alongside the death benefit. That permanence and the built-in account are why the premiums are many times higher than term for the same cover. Salespeople emphasise that the cash value grows and can be borrowed against; what they emphasise less is how much of your early premiums are consumed by fees and commission before the account meaningfully grows.',
          'For the vast majority of families, the honest verdict is "buy term and invest the difference": take the large premium gap between whole and term, and direct it into a low-cost investment account you control. The narrow cases where whole life genuinely fits are specific — certain estate-planning needs, a lifelong dependent with a disability, or business-succession arrangements — and they are the exception, not the default.',
        ],
      },
      {
        h: 'How much cover, for how long',
        p: [
          'A common rule of thumb is 10 to 15 times your annual income, plus any large debts (especially the mortgage) and major future costs such as children\'s education. The point is to replace the income your family loses and clear the obligations that would otherwise crush them. Set the term to cover the years of dependence — often until the mortgage is gone and the youngest child is financially independent.',
          'Whatever you choose, answer every medical question on the application truthfully. Concealed information is the leading reason claims are rejected, and a rejected claim at the worst possible moment defeats the entire purpose of insurance. The cheapest policy is worthless if it does not pay out.',
        ],
      },
    ],
  },
  {
    slug: 'health-insurance-deductible-explained',
    category: 'insurance',
    title: 'Deductibles, Premiums and Out-of-Pocket Maximums: Health Insurance in Plain English',
    excerpt:
      'The three numbers that decide what a health plan really costs you — and why the cheapest monthly premium is often the most expensive plan of all.',
    date: '2026-07-04',
    minutes: 8,
    author: 'The Xaa Desk',
    sections: [
      {
        h: '',
        p: [
          'Health insurance is priced to look simple and behave complicated. Most people choose a plan by comparing one number — the monthly premium — and discover the rest of the machinery only when they are already sick and reading a bill. The trick to choosing well is understanding that a plan is a trade-off between four numbers, not one.',
          'Those numbers are the premium, the deductible, the co-insurance or co-pay, and the out-of-pocket maximum. Once you can read all four together, the plans stop being a wall of jargon and become what they really are: different bets about how much healthcare you will use.',
        ],
      },
      {
        h: 'The four numbers, and how they interact',
        p: [
          'The premium is what you pay every month simply to be covered, whether or not you see a doctor. The deductible is what you must pay yourself each year before the insurer starts contributing. Co-insurance is the percentage you keep paying after the deductible is met (say 20%), or a co-pay is a flat fee per visit. The out-of-pocket maximum is the ceiling — once your own spending hits it, the insurer covers 100% of covered costs for the rest of the year.',
          'The crucial insight is the seesaw between premium and deductible. A low monthly premium almost always hides a high deductible, meaning you pay far more before cover kicks in. A high premium usually buys a low deductible. Neither is "better" in the abstract — the right choice depends entirely on how much care you expect to need.',
        ],
      },
      {
        h: 'Matching the plan to your life',
        p: [
          'If you are young, healthy and rarely see a doctor, a high-deductible plan with a low premium can be the rational bet — you save on premiums all year and accept that a rare big bill would cost you more. If you have a chronic condition, take regular medication, or are planning a family, the maths usually flips: a higher premium with a low deductible and modest co-pays will cost less across a year of frequent care.',
          'Whatever you pick, always check that your preferred doctors and hospitals are "in network" and that your regular medications are on the plan\'s covered list. An out-of-network bill can dwarf any premium saving, and a plan that does not cover your prescription is quietly more expensive than a plan that does.',
        ],
      },
      {
        h: 'The out-of-pocket maximum is the real safety net',
        p: [
          'People obsess over deductibles and forget the number that matters most in a genuine catastrophe: the out-of-pocket maximum. That figure is the most you can lose in a covered year no matter what happens — the difference between a serious illness being expensive and being ruinous. When comparing plans, read that number as carefully as the premium.',
          'Health insurance is not a purchase you optimise for the average year; it is protection you buy for the worst year. Choose the plan whose worst-case cost you could actually survive, and treat the monthly premium as the price of that certainty.',
        ],
      },
    ],
  },
  {
    slug: 'emergency-fund-how-much',
    category: 'saving',
    title: 'The Emergency Fund: How Much You Really Need Before Investing a Penny',
    excerpt:
      'The unglamorous account that decides whether a bad month is an inconvenience or a disaster — how big it should be, where to keep it, and how to build it.',
    date: '2026-07-06',
    minutes: 7,
    author: 'The Xaa Desk',
    sections: [
      {
        h: '',
        p: [
          'Before the investing, before the pension optimising, before any clever money move, sits the least exciting account you will ever open: the emergency fund. It earns modest interest, it does nothing dramatic, and it is the single thing standing between an unexpected bill and a spiral of expensive debt.',
          'The emergency fund exists so that a broken boiler, a lost job, or a medical surprise becomes a manageable inconvenience rather than the moment your whole financial plan unravels. Without it, every setback gets paid for with a credit card or a loan — and the interest on that borrowing quietly undoes years of careful saving.',
        ],
      },
      {
        h: 'How much is enough',
        p: [
          'The standard target is three to six months of essential expenses — not income, expenses. Add up the things you genuinely could not stop paying: housing, food, utilities, insurance, minimum debt payments, transport. Multiply by three at the low end, six at the higher end. If your income is stable and secure, three months may do; if you are self-employed, on commission, or the sole earner in your household, aim for the upper end or beyond.',
          'The number can look intimidating, so remember it is built in instalments, not in a day, and that a half-built fund is enormously better than none. Even one month of expenses in reserve changes how you weather a bad week.',
        ],
      },
      {
        h: 'Where to keep it',
        p: [
          'An emergency fund has three requirements: it must be safe, instantly accessible, and slightly out of sight so it is not spent on things that only feel like emergencies. A high-yield savings account or an easy-access account at a separate bank from your current account hits all three. The small friction of transferring from another bank is a feature — it gives you a moment to think before spending.',
          'What an emergency fund must not be: invested in the stock market (it will be down on exactly the day you need it), locked in a fixed-term account, or blended into your everyday current account where it evaporates into normal spending. Its job is to be boring, safe and there.',
        ],
      },
      {
        h: 'Building it without willpower',
        p: [
          'The reliable way to build any savings is automation, not resolve. Set a standing transfer for the day after payday so a fixed amount moves to the emergency account before you can spend it — pay yourself first, then live on the rest. Direct any windfalls, tax refunds and bonuses straight into it until the target is met.',
          'Once it is full, stop and let it sit; there is no prize for overfunding it. Then, and only then, does it make sense to turn to investing, knowing that the next emergency will be met by cash in the bank rather than debt at 20% interest.',
        ],
      },
    ],
  },
  {
    slug: 'index-funds-explained',
    category: 'investing',
    title: 'Index Funds Explained: Why Boring Beats Brilliant Over 30 Years',
    excerpt:
      'The single most evidence-backed idea in personal investing, explained from scratch: what an index fund is, why costs decide outcomes, and the discipline that makes it work.',
    date: '2026-07-08',
    minutes: 9,
    author: 'The Xaa Desk',
    sections: [
      {
        h: '',
        p: [
          'If personal investing has one genuinely settled conclusion — one idea that decades of data support with unusual consistency — it is this: for most people, most of the time, a low-cost, broadly diversified index fund held for the long term beats trying to pick winners. It is not exciting, it will never be a great story at a dinner party, and it works.',
          'The reason it works is not cleverness but the removal of two silent wealth-killers: high fees and human emotion. Understanding how an index fund neutralises both is the whole of the argument.',
        ],
      },
      {
        h: 'What an index fund is',
        p: [
          'A stock market index, such as one tracking the largest companies in a country or the world, is simply a list. An index fund is a fund that mechanically buys everything on that list in proportion, so that owning one share of the fund makes you a fractional owner of hundreds or thousands of companies at once. There is no star manager trying to outguess the market; the fund just tracks it.',
          'That mechanical simplicity is why index funds are cheap to run, and cost is the whole game over decades. A fund charging 1% a year versus one charging 0.1% does not sound like much, but compounded across 30 years the difference can quietly consume a large slice of your final balance. Every fraction of a percent you do not pay in fees is return you keep.',
        ],
      },
      {
        h: 'Why it beats "brilliant"',
        p: [
          'Actively managed funds employ talented people to pick winners and avoid losers, and charge more for the effort. The uncomfortable, repeatedly documented finding is that after those higher fees, the large majority of active funds underperform the simple index over long periods — and the few that beat it in one decade are rarely the same ones that beat it in the next. You cannot reliably identify tomorrow\'s winners in advance, so paying extra to try is a losing bet on average.',
          'The index fund sidesteps the entire contest. Instead of trying to be smarter than the market, it accepts the market\'s return minus a tiny cost — and that turns out to be a return most professionals fail to beat.',
        ],
      },
      {
        h: 'The discipline that makes it work',
        p: [
          'The mathematics only pays off if you supply the behaviour: invest regularly, automatically, and then leave it alone through the inevitable crashes. The index will fall — sometimes sharply — and the instinct to sell in a downturn is the single most expensive mistake a small investor makes, because it locks in losses and misses the recovery. The investors who do best are often the ones who simply never interfere.',
          'None of this is advice to buy any particular fund, and every investment carries risk of loss. It is the shape of an approach: keep costs low, diversify broadly, invest for years not months, and let compounding and discipline do the work that stock-picking cannot.',
        ],
      },
    ],
  },
  {
    slug: 'compound-interest-explained',
    category: 'investing',
    title: 'Compound Interest: The Eighth Wonder, Shown With Real Numbers',
    excerpt:
      'Why starting ten years earlier can beat saving twice as much later — the maths of compounding, made concrete, and the one habit that unlocks it.',
    date: '2026-07-10',
    minutes: 7,
    author: 'The Xaa Desk',
    sections: [
      {
        h: '',
        p: [
          'Compound interest is the quiet engine underneath every long-term financial plan, and almost everyone underestimates it, because human intuition is built for straight lines and compounding is a curve. Money grows; then the growth itself grows; then that growth grows — and over decades the curve bends upward in a way that feels almost unfair to anyone who started late.',
          'The single most valuable thing you can do with an understanding of compounding is act on its central implication: time in the market matters more than the amount, so the best day to start was years ago, and the second best is today.',
        ],
      },
      {
        h: 'Why time beats amount',
        p: [
          'Consider two savers. One invests a modest amount each month from age 25 to 35 and then stops, never adding another penny. The other does nothing until 35, then invests the same amount every month all the way to 65. In many realistic scenarios the first saver — who contributed for only ten years — ends up with as much or more, purely because their early money had an extra decade to compound. That result surprises almost everyone, and it is the whole argument for starting early.',
          'The lesson is not that the late starter is doomed; it is that every year of delay is expensive in a way that is invisible at the time. "I\'ll start when I earn more" is the most costly sentence in personal finance, because it trades the most powerful years of compounding for a slightly larger contribution later.',
        ],
      },
      {
        h: 'The rule of 72, and realistic expectations',
        p: [
          'A handy shortcut: divide 72 by your annual return to estimate how many years it takes money to double. At a 7% return, money doubles roughly every ten years; at 3%, roughly every 24. That single ratio explains why the gap between a low-cost and a high-cost investment, or between starting at 25 and 35, becomes enormous over a working life.',
          'Temper the maths with honesty: real returns are not smooth, markets fall as well as rise, and past performance guarantees nothing. Compounding is a tailwind you harness over decades, not a promise of any particular year\'s result.',
        ],
      },
      {
        h: 'The one habit that unlocks it',
        p: [
          'Compounding rewards consistency far more than timing or brilliance, so the habit that matters is the automatic, boring, monthly contribution that continues through good years and bad. Set it up once, increase it a little whenever your income rises, and resist the urge to pause it when markets fall — falling markets are when your regular contribution buys the most.',
          'The person who invests a steady amount every month for thirty years and never interferes will, more often than not, quietly outperform the clever one who starts late, chops and changes, and tries to time it. The engine only works if you leave it running.',
        ],
      },
    ],
  },
  {
    slug: 'improve-credit-score',
    category: 'borrowing',
    title: 'How to Improve a Credit Score: The Number That Prices Every Loan You Take',
    excerpt:
      'Your credit score does not just decide whether you get a loan — it decides how much that loan costs. What builds the score, what damages it, and the moves that actually work.',
    date: '2026-07-12',
    minutes: 8,
    author: 'The Xaa Desk',
    sections: [
      {
        h: '',
        p: [
          'A credit score is a number that quietly follows you through adult life, deciding not only whether a lender says yes but how expensive that yes will be. A strong score unlocks lower mortgage rates, better credit cards and easy approvals; a weak one means higher interest on everything, which can cost tens of thousands over a lifetime of borrowing.',
          'The encouraging truth is that a credit score is not a fixed verdict on your character — it is a record of specific behaviours, and when the behaviours change, the score follows within months. Knowing what it measures turns it from a mystery into something you can steer.',
        ],
      },
      {
        h: 'What the score is made of',
        p: [
          'The largest factor by far is payment history: whether you pay bills and loan instalments on time. A single missed payment can dent a good score and lingers on your file for years, which is why setting up automatic minimum payments is the highest-value habit in credit. The second big factor is how much of your available credit you use — your "utilisation". Keeping balances well below your limits, ideally under 30%, signals that you are not stretched.',
          'Smaller factors include the length of your credit history (older accounts help, so closing your oldest card can backfire), the mix of credit types, and how many new applications you have made recently. Several loan applications in a short window look like desperation to a lender and temporarily suppress the score.',
        ],
      },
      {
        h: 'The moves that actually work',
        p: [
          'Automate every bill and loan payment so a late payment can never happen through forgetfulness. Pay cards down before the statement date, not just before the due date, so a lower balance is what gets reported. Do not close your oldest account even if you rarely use it, because it is quietly lengthening your history. And check your own credit report at least once a year for errors — a paid-off loan wrongly marked as active is a common mistake, and disputing it is your right and costs nothing.',
          'If your history is thin or damaged, a secured card or a small credit-builder arrangement used lightly and repaid in full each month rebuilds a record over time. Patience is unavoidable: a score is a staircase, not a switch.',
        ],
      },
      {
        h: 'What does not move the score',
        p: [
          'Clear up two persistent myths. Checking your own score is a "soft" enquiry and never lowers it, so you can look as often as you like. And your salary, savings balance and everyday debit-card spending are not directly part of the score at all — lenders may ask about income separately, but the score itself is about how you handle credit.',
          'The purpose of a good score is not to look impressive; it is to make borrowing cheap when you genuinely need it. Treat it as the by-product of steady, boring financial habits, and it tends to take care of itself.',
        ],
      },
    ],
  },
  {
    slug: 'fixed-vs-variable-mortgage',
    category: 'borrowing',
    title: 'Fixed vs Variable Mortgage: How to Choose Without a Crystal Ball',
    excerpt:
      'The biggest debt most people ever take, and a choice that hinges on the one thing nobody can predict. A framework for deciding based on your life, not on forecasts.',
    date: '2026-07-14',
    minutes: 8,
    author: 'The Xaa Desk',
    sections: [
      {
        h: '',
        p: [
          'A mortgage is the largest and longest financial commitment most households ever make, and near the start of it sits a decision that feels like it requires predicting the future: fixed or variable rate. The honest starting point is that nobody — not you, not the bank, not the commentators — reliably knows where interest rates go next. So the right way to choose is not to forecast rates but to understand what each option does to your life.',
          'A fixed rate locks your interest for a set period, so your payment is the same every month regardless of what happens in the wider economy. A variable rate moves with the market, so your payment can fall if rates drop and rise if they climb. The choice is really about certainty versus flexibility, and about how much room your budget has to absorb a surprise.',
        ],
      },
      {
        h: 'What you are really buying',
        p: [
          'When you fix, you are buying certainty and paying a small premium for it — fixed rates are often slightly higher than the equivalent variable rate at the moment you sign, because the lender is taking on the risk of future rises. In return you get a payment you can plan a household budget around for years, which is worth a great deal to anyone whose finances are tight or whose peace of mind matters.',
          'When you choose variable, you are accepting uncertainty in exchange for the chance of lower payments if rates fall, and usually more flexibility to overpay or leave without heavy penalties. It suits borrowers with enough financial cushion to absorb a rise without stress, and those who value the ability to overpay aggressively.',
        ],
      },
      {
        h: 'A framework instead of a forecast',
        p: [
          'Ask three questions about your own situation, not about the economy. First, could your budget survive your payment rising by a meaningful amount — if not, the certainty of a fix is worth its premium. Second, how long do you expect to keep this mortgage — a long fix gives lasting stability, while a short horizon changes the maths. Third, how much do you value predictability against the possibility of saving if rates fall.',
          'Notice that none of these questions asks you to predict rates. They ask what a given outcome would do to you. That is the difference between a decision you can defend and a bet you are hoping comes off.',
        ],
      },
      {
        h: 'Read the fine print before the headline rate',
        p: [
          'The headline rate is only part of the cost. Check the arrangement fees, the size of any early-repayment charges, what the rate reverts to when a fixed period ends, and whether you can overpay. A slightly higher rate with no exit penalty and free overpayments can beat a lower rate that traps you. And whatever you choose, borrow an amount whose payment you could still meet if your circumstances tightened — the safest mortgage is one sized for a bad year, not just a good one.',
          'This is a general framework, not advice on any specific mortgage; the right product depends on your full circumstances, and a qualified broker or adviser can help you compare real offers.',
        ],
      },
    ],
  },
  {
    slug: 'pension-basics-explained',
    category: 'retirement',
    title: 'Pension Basics: The Three Things That Decide How You Retire',
    excerpt:
      'Retirement planning sounds complicated, but it comes down to three levers you actually control. A jargon-free guide to starting early, contributing enough, and keeping costs low.',
    date: '2026-07-16',
    minutes: 8,
    author: 'The Xaa Desk',
    sections: [
      {
        h: '',
        p: [
          'Retirement planning has a reputation for being impossibly complex, wrapped in acronyms and tax rules that seem designed to make people give up and hope for the best. Strip away the jargon, though, and the outcome of a retirement plan is driven overwhelmingly by just three things you can actually control: when you start, how much you put in, and how much you lose to fees.',
          'Everything else — the fund choices, the tax wrappers, the projections — is refinement on top of those three levers. Pull them in the right direction and the details matter far less than the industry\'s complexity suggests.',
        ],
      },
      {
        h: 'Start early, because you cannot buy back time',
        p: [
          'Retirement saving is the purest example of compounding, and compounding rewards time above all. A contribution made in your twenties has forty years to grow; the same contribution made in your fifties has ten. That is why a modest, consistent pension contribution begun early can end up worth more than a much larger one begun late — the early money simply has more decades to multiply.',
          'The practical implication is uncomfortable but freeing: the most powerful move in retirement planning is not a clever fund or a tax trick, it is starting now with whatever you can, and increasing it over time. You cannot buy back the years you delay.',
        ],
      },
      {
        h: 'Contribute enough — and grab free money first',
        p: [
          'If your employer offers to match pension contributions up to some percentage, that match is the closest thing to free money in all of finance, and not taking it in full is leaving a guaranteed return on the table. Always contribute at least enough to capture the entire match before directing money anywhere else. Beyond that, aim to raise your contribution rate a little every time your income rises, so your lifestyle grows slower than your savings.',
          'A frequent guideline is to save something in the region of 15% of income across your career, including any employer match, but the right figure depends on when you start and when you hope to retire — start later and you need to save more, which loops back to why starting early is so valuable.',
        ],
      },
      {
        h: 'Keep costs low across decades',
        p: [
          'Over a forty-year horizon, the fees you pay on a pension are not a footnote — they are one of the biggest determinants of your final balance. A pension quietly charging high annual fees can hand a large share of your lifetime returns to the provider without you ever seeing a bill. Favour low-cost, broadly diversified funds, and check what you are being charged; a fraction of a percent saved every year compounds into a meaningful difference by retirement.',
          'This is general education, not personalised advice, and pension rules and tax treatment vary by country and change over time. The enduring principles, though, travel well: start early, contribute enough to grab any match, keep costs low, and let time do the heavy lifting.',
        ],
      },
    ],
  },
  {
    slug: 'car-insurance-lower-premium',
    category: 'insurance',
    title: 'Car Insurance: How Premiums Are Set and the Legitimate Ways to Lower Yours',
    excerpt:
      'Why two drivers pay wildly different prices for the same car, and the honest levers — excess, mileage, security and loyalty traps — that actually change the number.',
    date: '2026-07-18',
    minutes: 7,
    author: 'The Xaa Desk',
    sections: [
      {
        h: '',
        p: [
          'Car insurance can feel arbitrary: the same car, the same road, and yet two drivers are quoted prices that differ by hundreds. It is not arbitrary, though — it is a probability calculation, and once you understand what the insurer is actually pricing, you can see which levers legitimately lower the premium and which "tricks" are myths.',
          'An insurer is estimating the odds and likely cost of a claim, then adding a margin. Everything they ask — your age, your address, your car, your history — feeds that estimate. Lowering your premium honestly means changing the inputs that genuinely reduce risk, not gaming the system.',
        ],
      },
      {
        h: 'What drives the price',
        p: [
          'The biggest factors are usually your claims and driving history, your age and experience, the car itself (its value, power and how expensive it is to repair), where it is kept overnight, and how far you drive each year. A powerful car parked on a busy street and driven 20,000 miles a year is simply more likely to generate a costly claim than a modest car garaged and driven 5,000 — and the price reflects that.',
          'Some of these you cannot change, but several you can. Choosing a car in a lower insurance group, reducing your annual mileage if you genuinely drive less, and improving where the car is kept overnight all feed real risk reductions back into the quote.',
        ],
      },
      {
        h: 'The legitimate levers',
        p: [
          'The most direct lever is the voluntary excess — the amount you agree to pay yourself towards any claim. Raising it lowers the premium, because you are taking on more of the small-claim risk, but only raise it to a level you could actually afford after an accident. Adding a security device, building a no-claims record over years, and paying annually rather than monthly (monthly instalments often carry interest) all reduce the price honestly.',
          'One overlooked lever is accuracy: estimate your mileage and describe your usage truthfully. Under-stating mileage to shave the premium can void a claim, turning a small saving into a total loss. The goal is a lower price on a policy that will actually pay out, not a cheaper price on one that won\'t.',
        ],
      },
      {
        h: 'Beware the loyalty penalty',
        p: [
          'The single most common way drivers overpay is by letting a policy auto-renew year after year. Insurers frequently reserve their best prices for new customers, so the loyal renewer quietly drifts to a higher price than a newcomer would be offered for the identical cover. Shopping around at renewal — comparing several quotes, and being willing to switch or to ask your insurer to match a better offer — is the highest-return hour in the whole exercise.',
          'Treat every renewal as a decision, not a default. The premium is not a fixed fact about your car; it is a price, and prices are there to be compared.',
        ],
      },
    ],
  },
  {
    slug: 'budgeting-50-30-20',
    category: 'saving',
    title: 'The 50/30/20 Budget: The Simplest System That Actually Sticks',
    excerpt:
      'No spreadsheets, no tracking every coffee — just three buckets that tell your money where to go. How the rule works and how to bend it to a real life.',
    date: '2026-07-20',
    minutes: 6,
    author: 'The Xaa Desk',
    sections: [
      {
        h: '',
        p: [
          'Most budgets fail for the same reason most diets fail: they demand constant, tedious tracking that nobody sustains past the second week. The 50/30/20 rule survives because it does the opposite — it starts by dividing your income into three simple buckets and lets you stop counting individual purchases altogether.',
          'The rule: of your after-tax income, roughly 50% goes to needs, 30% to wants, and 20% to saving and paying down debt. That is the entire system. Its power is in being simple enough to actually follow for years.',
        ],
      },
      {
        h: 'What goes in each bucket',
        p: [
          'Needs are the things you genuinely could not stop paying: housing, utilities, groceries, insurance, minimum debt payments, transport to work. Wants are everything that makes life enjoyable but could be paused in a crisis: eating out, subscriptions, travel, the upgraded phone. The 20% bucket is your future self\'s salary — the emergency fund first, then debt beyond the minimums, then investing and retirement.',
          'The discipline is in honestly sorting needs from wants. A basic phone plan is a need; the premium tier is a want. Rent is a need; the nicer flat you stretched for is part need, part want. The sorting itself teaches you where your money actually goes.',
        ],
      },
      {
        h: 'Bending the rule to a real life',
        p: [
          'The percentages are a starting frame, not a law. In an expensive city, housing alone can swallow the whole needs bucket, so you might run 60/20/20 for a season — the rule still helps by keeping the savings bucket from hitting zero. If your home is paid off and your needs are low, do the opposite and push savings well above 20%; that is the legitimate shortcut to financial freedom.',
          'The point is not the exact numbers. It is having three clear buckets so that the household money conversation shifts from "how much did you spend" to "what should the ratios be" — a far calmer and more productive debate.',
        ],
      },
      {
        h: 'Make it run on autopilot',
        p: [
          'Do not rely on willpower to hit the ratios each month — automate them. On payday, have the 20% move automatically to savings and investments before you can spend it, route the needs money to the account your bills draw from, and keep the wants money somewhere separate. When the wants account runs low before month-end, you stop, guilt-free, because that is the system working exactly as designed.',
          'A budget\'s real purpose is not to account for the past but to free you from worrying about it. Three buckets, filled automatically, do that better than any app that pings you about coffee.',
        ],
      },
    ],
  },
  {
    slug: 'home-insurance-what-it-covers',
    category: 'insurance',
    title: 'Home Insurance: What It Actually Covers, and the Gaps That Catch People Out',
    excerpt:
      'Buildings versus contents, "new for old" versus depreciated value, and the exclusions that turn a claim into a nasty surprise. A plain guide to reading your own policy.',
    date: '2026-07-22',
    minutes: 7,
    author: 'The Xaa Desk',
    sections: [
      {
        h: '',
        p: [
          'Home insurance is one of those products people buy once, file away, and never read again until the day they need it — which is the worst possible day to discover what it does not cover. A little understanding up front turns the policy from a mysterious annual bill into a tool you know you can rely on.',
          'The starting point is that "home insurance" is usually two distinct covers bundled together: buildings and contents. Knowing which is which, and how each is valued, prevents most of the unpleasant surprises at claim time.',
        ],
      },
      {
        h: 'Buildings versus contents',
        p: [
          'Buildings cover protects the structure itself — the walls, roof, floors, and permanent fixtures like the kitchen and bathroom — against events such as fire, storm and flood. If you own your home, this is essential, and the sum insured should reflect the cost to rebuild the property, which is not the same as its market price. Insuring for the market value can leave you badly under-covered when rebuild costs are higher.',
          'Contents cover protects the things you would take with you if you moved: furniture, electronics, clothing, valuables. Renters typically need only contents cover, since the building is the landlord\'s responsibility. The common mistake here is underestimating the total value of your possessions — walk through each room and the number is usually higher than you\'d guess.',
        ],
      },
      {
        h: 'The valuation trap: new-for-old versus depreciated',
        p: [
          'How a policy values your contents matters enormously. "New for old" (replacement cost) pays what it costs to buy a new equivalent today, while "indemnity" cover pays the depreciated value of your old item — often a fraction of the replacement cost. A five-year-old television might be worth very little on an indemnity basis but cost real money to replace. Knowing which basis your policy uses tells you what a claim will actually feel like.',
          'Similarly, most policies cap individual high-value items unless you list them specifically. Jewellery, bicycles, laptops and cameras above a certain value often need to be named on the policy, or a claim for them will be limited or refused.',
        ],
      },
      {
        h: 'The exclusions that catch people out',
        p: [
          'Read the exclusions as carefully as the cover. Common gaps include gradual damage (wear and tear, slow leaks, damp) as opposed to sudden events, damage while the home is left unoccupied for extended periods, certain types of flooding, and accidental damage unless you have added that option. None of these are the insurer being unfair — they are the boundaries of what you actually bought, and reading them is how you avoid assuming cover you don\'t have.',
          'The habit worth building is an annual five-minute review: is the rebuild figure still realistic, have you acquired valuables that need listing, and does the cover still match how you live. A policy that matched your life three years ago may quietly no longer fit.',
        ],
      },
    ],
  },
  {
    slug: 'good-debt-vs-bad-debt',
    category: 'borrowing',
    title: 'Good Debt vs Bad Debt: A Practical Test for Every Loan',
    excerpt:
      'Not all borrowing is equal. A simple framework for telling the debt that builds a future from the debt that quietly dismantles one.',
    date: '2026-07-24',
    minutes: 6,
    author: 'The Xaa Desk',
    sections: [
      {
        h: '',
        p: [
          'Debt has a bad reputation it only half deserves. Used carelessly, borrowing is one of the fastest ways to dismantle a financial life; used deliberately, it is how most people buy a home, gain an education, or start a business they could never have funded from savings alone. The skill is not avoiding all debt — it is telling the two kinds apart before you sign.',
          'A useful mental model divides borrowing into debt that is likely to make you wealthier or more capable over time, and debt that simply pulls tomorrow\'s spending into today at a price. Neither category is absolute, but the test for sorting them is refreshingly simple.',
        ],
      },
      {
        h: 'The test: does it buy an appreciating asset or ability?',
        p: [
          'Ask what the borrowed money is buying. If it funds something that should grow in value or earning power over time — a home in a stable market, education that raises your income, tools or capital for a viable business — it can be "good" debt, provided the terms are sane. The borrowing is a lever that lets an asset work for you before you could otherwise afford it.',
          'If, instead, the money buys something that loses value the moment you own it and leaves nothing behind — a holiday on a credit card carried for months, a depreciating gadget financed at high interest, everyday spending you cannot cover from income — it is "bad" debt. It borrows from your future to inflate your present, and the interest is the price of that trade.',
        ],
      },
      {
        h: 'The interest rate changes everything',
        p: [
          'Even "good" purposes become bad debt at a bad rate. A mortgage at a reasonable rate is a tool; borrowing for the same home at a punishing rate can sink you. High-interest revolving debt — the kind where you carry a balance month to month — is the most corrosive form, because the interest compounds against you exactly as investing compounds for you, only faster.',
          'A practical rule: if the interest rate on a debt is higher than the return you could reliably earn by investing, paying that debt down is itself one of the best "investments" available — a guaranteed, risk-free return equal to the interest you stop paying.',
        ],
      },
      {
        h: 'A borrowing checklist',
        p: [
          'Before taking on any debt, run four checks. Does it buy something that lasts or grows? Could I meet the repayment even if my income tightened? Is the interest rate reasonable relative to alternatives? And have I read the fees and penalties, not just the headline rate? Debt that passes all four can be a genuine tool; debt that fails one or more deserves a hard second look.',
          'The goal is not a debt-free life at all costs — it is borrowing on purpose, for things worth borrowing for, on terms you understand. That single discipline separates debt that builds a future from debt that quietly consumes one.',
        ],
      },
    ],
  },
];

export function getArticle(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}
export function getArticlesByCategory(cat: string): Article[] {
  return ARTICLES.filter((a) => a.category === cat).sort((a, b) => (a.date < b.date ? 1 : -1));
}
