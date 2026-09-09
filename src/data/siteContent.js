/**
 * All real marketing copy for the site lives here, data-driven, instead of
 * hardcoded inside components. That keeps components testable (render from
 * an array/object, assert on it) and gives one place to swap placeholder
 * text for the real thing.
 *
 * CONTENT STATUS — most copy below is now sourced from the ACM Whitman
 * Hackathon Exec Summary, Budget Proposal, and Planning Overview docs.
 * Anything still marked "TBD" genuinely isn't decided yet in those docs —
 * confirm with Kim/Stratton/Pitigala before launch.
 */

export const hero = {
  // The conference/venue line stays as a small eyebrow above the logo; the
  // dates live in their own section under the description, above the
  // countdown (eyes read down from the logo, so the date sits lower).
  context: 'Whitman College · CCSC Northwestern Regional Conference',
  date: 'October 9–10, 2026',
  title: 'WhitHack 2026',
  subtitle:
    'A 24-hour hackathon bringing together students from across Washington, Oregon, Idaho, and Northern California to tackle real problems proposed by real companies — no theoretical exercises, just build, present, and connect.',
  ctaLabel: 'Register Now',
  // TBD: swap for the real registration form/link (Devpost for Teams,
  // Google Form, etc.) once organizers set one up.
  ctaHref: '#register',
  // Kickoff per D-Day Timeline: 2:30 PM PT, October 9, 2026.
  targetDate: '2026-10-09T14:30:00-07:00',
}

export const tracksSection = {
  eyebrow: 'Compete & win',
  title: 'Awards & Prizes',
  // Four static prizes in an About-style bento grid (spans mirror the
  // about section's card sizes): big First-Place box, wide Second-Place
  // tile, then Third Place and the participation-certificate tile.
  tracks: [
    {
      id: 'first-place',
      name: 'First Place',
      description: 'The best overall project of the weekend.',
      prize: '$500',
      span: 'lg',
    },
    {
      id: 'second-place',
      name: 'Second Place',
      description: 'The runner-up standout build.',
      prize: '$300',
      span: 'md',
    },
    {
      id: 'third-place',
      name: 'Third Place',
      description: 'The third strongest project overall.',
      prize: '$100',
      span: 'sm',
    },
    {
      id: 'participation',
      name: 'Participation',
      description: 'Every participant earns a certificate of participation.',
      prize: 'Certificate',
      span: 'sm',
    },
  ],
}

export const scheduleSection = {
  eyebrow: 'Weekend at a glance',
  title: 'Schedule',
  // Sourced from the D-Day Timeline (Oct 9-10 CCSC-NW). Times are PT.
  days: [
    {
      id: 'day-1',
      label: 'Day 1 · Friday, Oct 9',
      events: [
        {
          id: 'd1-kickoff',
          time: '2:30 PM',
          title: 'Kickoff + Problem Pitches',
          workshopDetails:
            'Company reps present their challenges (~5–7 min each) with a quick Q&A after each. Students mingle and ask clarifying questions.',
        },
        {
          id: 'd1-team-formation',
          time: '3:30 PM',
          title: 'Team Formation + Ideation',
          workshopDetails:
            'Participants choose a project, form teams of 3–5, and start brainstorming their approach.',
        },
        {
          id: 'd1-build-1',
          time: '4:15 PM',
          title: 'Initial Build Sprint',
          workshopDetails: 'Teams start building.',
        },
        {
          id: 'd1-dinner',
          time: '6:00 PM',
          title: 'Dinner Break',
          workshopDetails: 'Good time for informal networking with sponsors.',
        },
        {
          id: 'd1-build-2',
          time: '7:00 PM',
          title: 'Build Sprint',
          workshopDetails: 'Continued building.',
        },
        {
          id: 'd1-checkpoint',
          time: '10:00 PM',
          title: 'Checkpoint',
          workshopDetails: 'Updates and progress check-ins with organizers and mentors.',
        },
      ],
    },
    {
      id: 'day-2',
      label: 'Day 2 · Saturday, Oct 10',
      events: [
        {
          id: 'd2-build-3',
          time: '8:30 AM',
          title: 'Build Sprint',
          workshopDetails: 'Final stretch of building before judging.',
        },
        {
          id: 'd2-evaluation',
          time: '11:00 AM',
          title: 'Evaluation',
          workshopDetails:
            'Teams present demos and are judged on innovation, feasibility, technical quality, real-world impact, and clarity of presentation.',
        },
        {
          id: 'd2-awards',
          time: '12:00 PM',
          title: 'Awards',
          workshopDetails: 'Closing ceremony and awards.',
        },
      ],
    },
  ],
}

export const organizersSection = {
  eyebrow: 'The team',
  title: 'Organizers & Team',
  // Real photos still TBD — swap gradient/initials placeholders for
  // headshots once available (see MAINTENANCE.md).
  organizers: [
    { id: 'hayan-saab', name: 'Hayan Saab', role: 'ACM President' },
    { id: 'nick-twum', name: 'Nick Twum', role: 'ACM Vice-President' },
    { id: 'tabish-navaid', name: 'Tabish Navaid', role: 'ACM Treasurer' },
    { id: 'patrick-mulikuza', name: 'Patrick Mulikuza', role: 'Website Designer, Board Member' },
    { id: 'ali-abaka', name: 'Ali Abaka', role: 'Budgeting & Expenses Lead' },
  ],
}

export const footerSection = {
  organizers: 'Organized by the Whitman College ACM Chapter, as part of the CCSC Northwestern Regional Conference.',
  resourcesHeading: 'Whitman CS Resources',
  resources: [
    { id: 'cs-dept', label: 'CS Department', href: 'https://www.whitman.edu/academics/majors-and-programs/computer-science' },
    { id: 'advising', label: 'Academic Advising', href: 'https://www.whitman.edu/provost/academic-advising' },
    { id: 'career-center', label: 'Career Center', href: 'https://www.whitman.edu/career-prep/career-and-community-engagement-center' },
  ],
  socialHeading: 'Follow along',
  social: [
    { id: 'instagram', label: 'Instagram', href: '#' },
    { id: 'discord', label: 'Discord', href: '#' },
    { id: 'github', label: 'GitHub', href: '#' },
  ],
  registerLabel: 'Register',
  registerHref: '#register',
}
