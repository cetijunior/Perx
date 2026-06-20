import * as Lucide from 'lucide-react'

// Render a lucide icon by string name (used for category/data-driven icons).
export default function Icon({ name, ...props }) {
  const Cmp = Lucide[name] || Lucide.Circle
  return <Cmp {...props} />
}
