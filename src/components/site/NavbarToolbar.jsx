import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight } from 'lucide-react'
import Button from '@/components/ui/Button'
import ThemeToggle from '@/components/ui/ThemeToggle'
import LanguageToggle from '@/components/ui/LanguageToggle'
import { navToolbarGroupClass } from '@/components/ui/navToolbar'
import { logout, useCurrentUser } from '@/lib/store'

function AuthButtons({ t, user, onNavigate, onSignOut }) {
  if (user) {
    return (
      <>
        <Button
          as={Link}
          to={user.role === 'admin' ? '/admin' : '/employee'}
          size="sm"
          variant="secondary"
          onClick={onNavigate}
        >
          {t('nav.dashboard')}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onSignOut}>
          {t('nav.logout')}
        </Button>
      </>
    )
  }

  return (
    <>
      <Button as={Link} to="/login" size="sm" variant="secondary" onClick={onNavigate}>
        {t('nav.login')}
      </Button>
      <Button as={Link} to="/login" size="sm" onClick={onNavigate} className="hidden lg:inline-flex">
        {t('nav.getStarted')} <ArrowRight className="h-4 w-4" />
      </Button>
    </>
  )
}

export function NavbarToolbar({ className, showAuth = true, onNavigate }) {
  const { t } = useTranslation()
  const user = useCurrentUser()

  async function handleSignOut() {
    onNavigate?.()
    logout()
  }

  return (
    <div className={navToolbarGroupClass(className)}>
      <ThemeToggle variant="nav" />
      <LanguageToggle variant="nav" />
      {showAuth && (
        <AuthButtons t={t} user={user} onNavigate={onNavigate} onSignOut={handleSignOut} />
      )}
    </div>
  )
}
