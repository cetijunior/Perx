import LegalLayout from './Legal'

const SECTIONS = [
  {
    id: 'overview',
    heading: 'Overview',
    body: [
      'PERX (“we”, “us”) operates a two-sided employee benefits marketplace. This policy explains what data we collect, why we collect it, and the choices you have. We keep it plain — no dark patterns, no surprises.',
      'This is a demonstration product built for JunctionX Tirana 2026. In a production deployment, this policy would be reviewed by counsel and adapted to your jurisdiction.',
    ],
  },
  {
    id: 'data-we-collect',
    heading: 'Data we collect',
    body: [
      'We collect only what we need to run your benefits program:',
      [
        'Account details — name, work email, company and department.',
        'Benefit activity — budget, requests, approvals and the partners you choose.',
        'Preferences — categories you care about and dietary or lifestyle settings you set.',
        'Product usage — basic, aggregated interaction data to improve the experience.',
      ],
    ],
  },
  {
    id: 'how-we-use',
    heading: 'How we use it',
    body: [
      'Your data powers the product and nothing more:',
      [
        'To run the marketplace, process approvals and track budgets.',
        'To let Perky, our AI concierge, recommend benefits that fit your life and remaining budget.',
        'To give your HR team aggregated insight into what teams love — never individual surveillance.',
        'To keep the service secure and to comply with legal obligations.',
      ],
      'We do not sell your personal data. Ever.',
    ],
  },
  {
    id: 'sharing',
    heading: 'Sharing & partners',
    body: [
      'Your employer can see aggregated program data and the approval requests you submit to them — that is how approvals work. Local partners receive only what is needed to deliver a benefit you chose.',
      'We use a small number of trusted infrastructure providers (hosting, analytics) bound by data-processing terms. They act on our instructions only.',
    ],
  },
  {
    id: 'your-rights',
    heading: 'Your rights',
    body: [
      'You are in control of your data. Subject to applicable law you can:',
      [
        'Access the personal data we hold about you.',
        'Correct anything inaccurate from your preferences and profile.',
        'Request deletion of your account and associated data.',
        'Object to or restrict certain processing, and export your data.',
      ],
      'To exercise any of these, contact us at privacy@perx.al.',
    ],
  },
  {
    id: 'security',
    heading: 'Security & retention',
    body: [
      'We protect data with encryption in transit, access controls and the principle of least privilege. No system is perfectly secure, but we treat your data as we would our own.',
      'We retain data for as long as your account is active or as needed to provide the service and meet legal requirements. When you delete your account, we remove or anonymise your personal data within a reasonable period.',
    ],
  },
  {
    id: 'cookies',
    heading: 'Cookies',
    body: [
      'We use essential cookies to keep you signed in and remember your language and preferences. We do not use advertising trackers. You can clear cookies at any time in your browser settings.',
    ],
  },
  {
    id: 'changes',
    heading: 'Changes & contact',
    body: [
      'We may update this policy as the product evolves. Material changes will be highlighted in-app. Continued use after an update means you accept the revised policy.',
      'Questions or requests? Email privacy@perx.al and a human will respond.',
    ],
  },
]

export default function Privacy() {
  return (
    <LegalLayout
      eyebrow="Legal"
      title="Privacy"
      accent="Policy."
      updated="June 2026"
      intro="Your data is yours. Here’s exactly what we collect, why, and the control you have over it — in plain language."
      sections={SECTIONS}
    />
  )
}
