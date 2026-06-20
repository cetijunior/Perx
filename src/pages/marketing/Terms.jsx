import LegalLayout from './Legal'

const SECTIONS = [
  {
    id: 'acceptance',
    heading: 'Acceptance of terms',
    body: [
      'By accessing or using PERX, you agree to these Terms of Service. If you are using PERX on behalf of a company, you confirm you have authority to bind that company to these terms.',
      'PERX is a demonstration product built for JunctionX Tirana 2026. A production deployment would adapt these terms to the relevant jurisdiction and contracts.',
    ],
  },
  {
    id: 'the-service',
    heading: 'The service',
    body: [
      'PERX is a two-sided marketplace that lets companies fund employee benefit budgets, lets employees spend them across a curated catalog of local partners, and provides an AI concierge and analytics.',
      'We may improve, change or discontinue features over time. We aim to give reasonable notice of significant changes.',
    ],
  },
  {
    id: 'accounts',
    heading: 'Accounts & eligibility',
    body: [
      'You are responsible for the accuracy of your account information and for keeping your credentials secure. You must notify us of any unauthorised use of your account.',
      'Accounts are provisioned through your employer’s program. Demo accounts are provided for evaluation only.',
    ],
  },
  {
    id: 'acceptable-use',
    heading: 'Acceptable use',
    body: [
      'To keep PERX safe and fair for everyone, you agree not to:',
      [
        'Misuse budgets, attempt to defraud partners, or abuse rewards and games.',
        'Reverse-engineer, scrape, or disrupt the service or its security.',
        'Upload unlawful content or infringe the rights of others.',
        'Use the service to harass other users, partners or staff.',
      ],
    ],
  },
  {
    id: 'budgets',
    heading: 'Budgets, benefits & payments',
    body: [
      'Benefit budgets are funded and governed by your employer. Available balance, approval rules and category policies are set by your company’s administrators.',
      'Benefits are delivered by independent local partners. While we curate partners carefully, the experience itself is provided by them, subject to their own terms.',
      'Rewards earned through streaks and games have no cash value and may expire or change at our discretion.',
    ],
  },
  {
    id: 'ip',
    heading: 'Intellectual property',
    body: [
      'PERX, its design, brand and software are owned by us and protected by applicable law. These terms grant you a limited, non-exclusive, non-transferable right to use the service — nothing more.',
      'Partner names and logos belong to their respective owners and are used to identify their offerings.',
    ],
  },
  {
    id: 'disclaimers',
    heading: 'Disclaimers & liability',
    body: [
      'The service is provided “as is”. To the maximum extent permitted by law we disclaim implied warranties and are not liable for indirect or consequential losses arising from your use of the service.',
      'Nothing in these terms limits liability that cannot be limited by law.',
    ],
  },
  {
    id: 'termination',
    heading: 'Termination',
    body: [
      'You may stop using PERX at any time. We may suspend or terminate access if these terms are breached or if required to protect the service or other users.',
      'On termination, your right to use the service ends; provisions that by nature should survive (such as IP and liability) will continue.',
    ],
  },
  {
    id: 'governing-law',
    heading: 'Governing law & contact',
    body: [
      'These terms are governed by the laws of the Republic of Albania, without regard to conflict-of-law rules. Disputes will be handled by the competent courts of Tirana.',
      'Questions about these terms? Email legal@perx.al.',
    ],
  },
]

export default function Terms() {
  return (
    <LegalLayout
      eyebrow="Legal"
      title="Terms of"
      accent="Service."
      updated="June 2026"
      intro="The agreement between you and PERX. Clear, fair, and written to be read — not buried."
      sections={SECTIONS}
    />
  )
}
