const TEMPLATES = {

  race_result_good: (rider, position, points) => ({
    from: rider.name,
    fromId: `rider_${rider.id}`,
    type: 'rider',
    priority: 'normal',
    subject: `P${position} — Feeling great!`,
    preview: `That was a strong race. I'm really happy with the result.`,
    body: `Manager,\n\nP${position} and ${points} points — I'm really pleased with how that went. The bike felt good and the strategy was spot on.\n\nLet's keep this momentum going!\n\n— ${rider.name}`,
    actions: [],
  }),

  race_result_bad: (rider, position) => ({
    from: rider.name,
    fromId: `rider_${rider.id}`,
    type: 'rider',
    priority: 'high',
    subject: `Disappointed with P${position}`,
    preview: `We need to talk about what went wrong today.`,
    body: `Manager,\n\nI won't sugarcoat it — P${position} is not where we should be. The bike didn't feel right all weekend and I struggled to find my rhythm.\n\nI think we need to seriously look at the setup before the next race. Can we meet?\n\n— ${rider.name}`,
    actions: [{ type: 'boost_morale', label: 'Send support message', riderId: null }],
  }),

  race_result_dnf: (rider) => ({
    from: rider.name,
    fromId: `rider_${rider.id}`,
    type: 'rider',
    priority: 'high',
    subject: 'DNF — Really frustrated',
    preview: 'That retirement hurt. We need reliability improvements.',
    body: `Manager,\n\nI'm gutted about the DNF. I was running well before the issue hit.\n\nWe're losing valuable championship points and I really need assurance that reliability will improve. Can we look at what happened?\n\n— ${rider.name}`,
    actions: [{ type: 'investigate_dnf', label: 'Investigate reliability' }],
  }),

  chief_engineer_race: (staff, rider, position) => ({
    from: staff.name,
    fromId: 'staff_chiefEngineer',
    type: 'staff',
    priority: 'normal',
    subject: `Race analysis — Round complete`,
    preview: `Here's my post-race breakdown for ${rider.name}.`,
    body: `Manager,\n\nPost-race analysis for ${rider.name} (P${position}):\n\n• Tyre degradation was ${position <= 5 ? 'well managed' : 'higher than expected'}\n• Lap time consistency: ${position <= 8 ? 'Good' : 'Needs improvement'}\n• Setup changes for next race: Recommend adjusting suspension stiffness\n• Key area to improve: ${position > 10 ? 'Corner exit speed' : 'Qualifying pace'}\n\nFull data report available on request.\n\n— ${staff.name}`,
    actions: [{ type: 'view_data', label: 'Request full report' }],
  }),

  media_after_podium: (rider, position) => ({
    from: 'MotoGP Media',
    fromId: 'media_motogp',
    type: 'media',
    priority: 'normal',
    subject: `Interview request — ${position === 1 ? 'Race winner' : `Podium finisher`}`,
    preview: `Congratulations on the result! We'd love an interview.`,
    body: `Dear Team Manager,\n\nFollowing ${rider.name}'s fantastic P${position} finish, we would love to arrange a post-race interview.\n\nThis would be great exposure for your team and sponsors. Please confirm at your earliest convenience.\n\n— MotoGP Media`,
    actions: [
      { type: 'accept_interview', label: 'Accept — +reputation' },
      { type: 'decline_interview', label: 'Decline' },
    ],
  }),

  media_after_bad_race: (teamName) => ({
    from: 'MotoGP Media',
    fromId: 'media_motogp',
    type: 'media',
    priority: 'normal',
    subject: 'Comment requested on poor performance',
    preview: 'Media is asking for a statement after today\'s race.',
    body: `Dear Manager,\n\nFollowing today's difficult race for ${teamName}, several outlets are requesting a comment from the team.\n\nHow would you like to respond?\n\n— MotoGP Press Office`,
    actions: [
      { type: 'positive_statement', label: '"We\'re working hard to improve"' },
      { type: 'no_comment', label: 'No comment' },
    ],
  }),

  sponsor_happy: (sponsorName, points) => ({
    from: sponsorName,
    fromId: 'sponsor_main',
    type: 'sponsor',
    priority: 'normal',
    subject: 'Great result — bonus incoming!',
    preview: `Impressed with the team's performance this round.`,
    body: `Dear Team Manager,\n\nWe're thrilled with the team's performance! ${points} points scored this round is exactly the kind of result we signed up for.\n\nAs per our performance agreement, a bonus of €0.5M will be added to your budget.\n\nKeep it up!\n\n— ${sponsorName} Partnership Team`,
    actions: [{ type: 'sponsor_bonus', label: 'Claim €0.5M bonus', amount: 0.5 }],
  }),

  sponsor_unhappy: (sponsorName) => ({
    from: sponsorName,
    fromId: 'sponsor_main',
    type: 'sponsor',
    priority: 'high',
    subject: 'Concerned about recent results',
    preview: 'We need to discuss the team\'s performance.',
    body: `Dear Manager,\n\nWe want to be transparent — we're concerned about the team's recent results.\n\nOur sponsorship agreement is based on competitive performance, and we'd like to schedule a call to discuss expectations going forward.\n\nPlease respond at your earliest convenience.\n\n— ${sponsorName} Partnership Team`,
    actions: [{ type: 'sponsor_meeting', label: 'Schedule meeting' }],
  }),

  contract_expiring: (rider) => ({
    from: rider.name,
    fromId: `rider_${rider.id}`,
    type: 'rider',
    priority: 'high',
    subject: 'My contract — let\'s talk',
    preview: 'I\'d like to discuss my future with the team.',
    body: `Manager,\n\nAs you know, my contract expires at the end of this season. I want to be upfront — I'm interested in staying, but I've also had conversations with other teams.\n\nI'd appreciate knowing your intentions soon so I can plan accordingly.\n\n— ${rider.name}`,
    actions: [{ type: 'open_negotiation', label: 'Start contract negotiation', riderId: null }],
  }),

  rival_team_interest: (rider, rivalTeam) => ({
    from: 'Agent — ' + rider.name,
    fromId: `agent_${rider.id}`,
    type: 'rider',
    priority: 'high',
    subject: `${rider.name} — Interest from ${rivalTeam}`,
    preview: `We've received an offer from another team.`,
    body: `Dear Manager,\n\nI'm writing on behalf of ${rider.name} to inform you that we've received a formal offer from ${rivalTeam}.\n\nWe haven't made any decisions yet, but we wanted to give you the opportunity to match or improve your current offer before we proceed.\n\nPlease respond within 2 race rounds.\n\n— ${rider.name}'s Management`,
    actions: [{ type: 'open_negotiation', label: 'Negotiate contract', riderId: null }],
  }),

  setup_specialist_tip: (staff, circuit) => ({
    from: staff.name,
    fromId: 'staff_setupSpecialist',
    type: 'staff',
    priority: 'normal',
    subject: `Setup tip for ${circuit}`,
    preview: `I have some recommendations for the upcoming race.`,
    body: `Manager,\n\nLooking ahead to ${circuit}, I have some setup recommendations:\n\n• Stiffer rear suspension will help with the long straight\n• Lower ride height for better aero efficiency\n• Brake bias shifted slightly forward\n\nIf we implement these changes I'm confident we can gain 2-3 tenths per lap.\n\nLet me know if you approve.\n\n— ${staff.name}`,
    actions: [
      { type: 'approve_setup', label: 'Approve changes' },
      { type: 'reject_setup', label: 'Keep current setup' },
    ],
  }),

  data_analyst_insight: (staff, rider) => ({
    from: staff.name,
    fromId: 'staff_dataAnalyst',
    type: 'staff',
    priority: 'normal',
    subject: `Data insight — ${rider.name}`,
    preview: 'I found something interesting in the telemetry.',
    body: `Manager,\n\nAfter reviewing ${rider.name}'s telemetry from the last race, I found a consistent issue in Sector 2.\n\nHe's losing approximately 0.2s per lap under braking for the tight hairpin. With a small adjustment to braking technique and bike balance, we could recover this time.\n\nI'd recommend a targeted session in practice to work on this.\n\n— ${staff.name}`,
    actions: [{ type: 'schedule_training', label: 'Schedule practice session' }],
  }),

  new_sponsor_offer: () => ({
    from: 'SportsBrand International',
    fromId: 'sponsor_new',
    type: 'sponsor',
    priority: 'normal',
    subject: 'Sponsorship proposal',
    preview: 'We\'d like to discuss a partnership opportunity.',
    body: `Dear Team Manager,\n\nWe've been following your team's progress and we're impressed with what we're seeing.\n\nWe'd like to propose a sponsorship package worth €1.5M for the remainder of the season, with an option to extend for the full following season.\n\nIn return, we'd require prominent placement on the bike and rider suits, plus social media mentions.\n\nPlease let us know if you're interested.\n\n— SportsBrand International`,
    actions: [
      { type: 'accept_sponsor', label: 'Accept — +€1.5M', amount: 1.5 },
      { type: 'negotiate_sponsor', label: 'Negotiate terms' },
      { type: 'decline_sponsor', label: 'Decline' },
    ],
  }),

  physical_trainer_report: (staff, rider) => ({
    from: staff.name,
    fromId: 'staff_physicalTrainer',
    type: 'staff',
    priority: 'normal',
    subject: `Fitness report — ${rider.name}`,
    preview: `Monthly fitness update for ${rider.name}.`,
    body: `Manager,\n\nMonthly fitness report for ${rider.name}:\n\n• Physical condition: ${rider.fitness >= 15 ? 'Excellent' : rider.fitness >= 12 ? 'Good' : 'Needs attention'}\n• Recovery from last race: Complete\n• Training load this week: High intensity\n• Recommendation: ${rider.fitness < 14 ? 'Increase recovery time between sessions' : 'Current program is working well'}\n\nFull report attached.\n\n— ${staff.name}`,
    actions: [],
  }),
}


export function generatePostRaceMessages(raceResults, gameState) {
  const { riders, staff, team, round } = gameState
  const messages = []
  const rivals = ['Ducati Factory', 'Aprilia Racing', 'Repsol Honda', 'Monster Yamaha']

  riders.forEach(rider => {
    const result = raceResults.find(r => r.isPlayer && r.name === rider.name)
    if (!result) return

    const pos = result.position
    const pts = result.points
    const dnf = result.retired

    if (dnf) {
      messages.push(TEMPLATES.race_result_dnf(rider))
    } else if (pos <= 5) {
      messages.push(TEMPLATES.race_result_good(rider, pos, pts))
    } else if (pos >= 12) {
      const msg = TEMPLATES.race_result_bad(rider, pos)
      msg.actions[0].riderId = rider.id
      messages.push(msg)
    }

    if (rider.contractYears <= 1 && round >= 10) {
      messages.push(TEMPLATES.contract_expiring(rider))
    }

    if (rider.overall >= 15 && rider.contractYears <= 1 && Math.random() < 0.4) {
      const rival = rivals[Math.floor(Math.random() * rivals.length)]
      const msg = TEMPLATES.rival_team_interest(rider, rival)
      msg.actions[0].riderId = rider.id
      messages.push(msg)
    }

    if (round % 4 === 0) {
      messages.push(TEMPLATES.physical_trainer_report(staff.physicalTrainer, rider))
    }
  })

  const bestResult = raceResults
    .filter(r => r.isPlayer)
    .sort((a, b) => a.position - b.position)[0]

  if (bestResult && staff.chiefEngineer) {
    messages.push(TEMPLATES.chief_engineer_race(
      staff.chiefEngineer, 
      { name: bestResult.name }, 
      bestResult.position
    ))
  }

  if (round % 2 === 0 && staff.setupSpecialist) {
    const circuits = ['Jerez', 'Le Mans', 'Mugello', 'Catalunya', 'Assen', 'Silverstone']
    const nextCircuit = circuits[round % circuits.length]
    messages.push(TEMPLATES.setup_specialist_tip(staff.setupSpecialist, nextCircuit))
  }

  if (round % 3 === 0 && staff.dataAnalyst && riders[0]) {
    messages.push(TEMPLATES.data_analyst_insight(staff.dataAnalyst, riders[0]))
  }

  if (bestResult) {
    if (bestResult.position <= 3) {
      messages.push(TEMPLATES.media_after_podium({ name: bestResult.name }, bestResult.position))
    } else if (bestResult.position >= 15) {
      messages.push(TEMPLATES.media_after_bad_race(team.name))
    }
  }

  const totalPoints = raceResults
    .filter(r => r.isPlayer)
    .reduce((sum, r) => sum + r.points, 0)

  const sponsors = ['RedLine Energy', 'TechMotion Corp', 'GlobalRace Partners']
  const sponsor = sponsors[round % sponsors.length]

  if (totalPoints >= 13) {
    messages.push(TEMPLATES.sponsor_happy(sponsor, totalPoints))
  } else if (totalPoints === 0 && round > 3) {
    messages.push(TEMPLATES.sponsor_unhappy(sponsor))
  }

  if (Math.random() < 0.25) {
    messages.push(TEMPLATES.new_sponsor_offer())
  }

  return messages
}

export function generateSeasonStartMessages(gameState) {
  const { riders, staff, round } = gameState
  const messages = []

  riders.forEach(rider => {
    messages.push({
      from: rider.name,
      fromId: `rider_${rider.id}`,
      type: 'rider',
      priority: 'normal',
      subject: 'Ready for the season!',
      preview: 'Looking forward to working with you this season.',
      body: `Hi Manager,\n\nI'm really excited to start this season. I've been working hard during the off-season and I feel ready to fight.\n\nMy main goal is to be consistently in the points and hopefully grab a podium or two. I'm counting on the team's support!\n\n— ${rider.name}`,
      actions: [],
    })
  })

  messages.push({
    from: staff.chiefEngineer?.name || 'Chief Engineer',
    fromId: 'staff_chiefEngineer',
    type: 'staff',
    priority: 'normal',
    subject: 'Season preparation complete',
    preview: 'The bike is ready. Here\'s my pre-season assessment.',
    body: `Manager,\n\nPre-season preparation is complete. Here's a quick summary:\n\n• Bike setup: Baseline established from winter testing\n• Tyres: We have a good understanding of the compounds\n• Areas to watch: Electronics and aero development will be key\n\nI'm confident we can have a competitive season if we make the right calls.\n\n— ${staff.chiefEngineer?.name}`,
    actions: [],
  })

  messages.push({
    from: 'MotoGP Organisation',
    fromId: 'media_motogp',
    type: 'media',
    priority: 'normal',
    subject: 'Welcome to the 2025 Season',
    preview: 'Season briefing and schedule attached.',
    body: `Dear Team Manager,\n\nWelcome to the 2025 MotoGP World Championship.\n\nThis season features 20 rounds across the globe. Please ensure all team documentation is submitted before Round 1.\n\nWe look forward to a competitive and safe season.\n\n— MotoGP Organisation`,
    actions: [],
  })

  messages.push({
    from: 'RedLine Energy',
    fromId: 'sponsor_main',
    type: 'sponsor',
    priority: 'normal',
    subject: 'Season kickoff — partnership update',
    preview: 'Excited to support you this season.',
    body: `Dear Team Manager,\n\nWe're thrilled to be continuing our partnership for another season.\n\nOur performance bonus structure remains the same — €0.5M for every top-5 finish, €1M for a race win.\n\nLet's make it a great season!\n\n— RedLine Energy`,
    actions: [],
  })

  return messages
}