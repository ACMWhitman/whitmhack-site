import { useContent } from '../context/ContentContext'

export function FooterSection() {
  const footerSection = useContent('footerSection')

  return (
    <footer
      id="register"
      aria-label="Site footer"
      className="border-t border-white/10 px-6 py-16"
    >
      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-10 text-center sm:grid-cols-3 sm:text-left">
        <div>
          <h3 className="font-subhead text-sm font-bold uppercase tracking-widest text-electric-wheat">
            Organizers
          </h3>
          <p className="mt-3 text-sm text-white/70">{footerSection.organizers}</p>
        </div>

        <nav aria-label={footerSection.resourcesHeading}>
          <h3 className="font-subhead text-sm font-bold uppercase tracking-widest text-electric-wheat">
            {footerSection.resourcesHeading}
          </h3>
          <ul className="mt-3 space-y-2">
            {footerSection.resources.map((link) => (
              <li key={link.id}>
                <a
                  href={link.href}
                  className="text-sm text-white/70 underline-offset-4 hover:text-electric-wheat hover:underline"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label={footerSection.socialHeading}>
          <h3 className="font-subhead text-sm font-bold uppercase tracking-widest text-electric-wheat">
            {footerSection.socialHeading}
          </h3>
          <ul className="mt-3 space-y-2">
            {footerSection.social.map((link) => (
              <li key={link.id}>
                <a
                  href={link.href}
                  className="text-sm text-white/70 underline-offset-4 hover:text-electric-wheat hover:underline"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <p className="mt-16 text-center font-body text-xs text-walla-mist/70">
        &copy; {new Date().getFullYear()} WhitHack &middot; Whitman College
      </p>
    </footer>
  )
}
