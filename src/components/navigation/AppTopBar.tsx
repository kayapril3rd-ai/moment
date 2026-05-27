// AppTopBar renders the mobile status/brand area for the Today surface.
// Structure stays the same; logo/icon assets use the unified Che brand system.
import { BellIcon, CheLogoSmall, LeafIcon } from '../icons';

interface AppTopBarProps {
  greeting?: string;
  subtitle?: string;
  description?: string;
  title?: string;
}

export function AppTopBar({ greeting, subtitle, description, title = '此刻' }: AppTopBarProps) {
  return (
    <header className="app-top-bar">
      <div className="phone-status-bar" aria-hidden="true">
        <span>9:41</span>
        <span className="phone-status-icons" />
      </div>

      <div className="brand-row">
        <span className="brand-lockup">
          <CheLogoSmall size={40} aria-hidden="true" />
          <strong>{title}</strong>
        </span>
        <button className="notification-button" type="button" aria-label="轻提醒">
          <BellIcon size={26} aria-hidden="true" />
        </button>
      </div>

      {greeting || subtitle || description ? (
        <div className="top-greeting">
          <span className="greeting-sprout" aria-hidden="true">
            <LeafIcon size={128} />
          </span>
          {greeting ? (
            <p>
              {greeting}
              <LeafIcon className="inline-sprout" size={24} aria-hidden="true" />
            </p>
          ) : null}
          {subtitle ? <h1>{subtitle}</h1> : null}
          {description ? <span className="top-greeting-description">{description}</span> : null}
        </div>
      ) : null}
    </header>
  );
}
