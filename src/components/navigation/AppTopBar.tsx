// AppTopBar renders the mobile status/brand area for the Today surface.
// Change brand copy or the light greeting text here; adjust visual rhythm in global.css.
import { AppLogoIcon, BellSoftIcon, SproutIcon } from '../icons/SoftIcons';

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
          <AppLogoIcon size={40} aria-hidden="true" />
          <strong>{title}</strong>
        </span>
        <button className="notification-button" type="button" aria-label="轻提醒">
          <BellSoftIcon size={26} aria-hidden="true" />
        </button>
      </div>

      {greeting || subtitle || description ? (
        <div className="top-greeting">
          <span className="greeting-sprout" aria-hidden="true">
            <SproutIcon size={128} />
          </span>
          {greeting ? (
            <p>
              {greeting}
              <SproutIcon className="inline-sprout" size={24} aria-hidden="true" />
            </p>
          ) : null}
          {subtitle ? <h1>{subtitle}</h1> : null}
          {description ? <span className="top-greeting-description">{description}</span> : null}
        </div>
      ) : null}
    </header>
  );
}
