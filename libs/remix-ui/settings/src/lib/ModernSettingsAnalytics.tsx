import React from 'react';

export interface ModernSettingsAnalyticsProps {
  toggles: any;
  onToggle: (key: string) => void;
}

export const ModernSettingsAnalytics: React.FC<ModernSettingsAnalyticsProps> = ({ toggles, onToggle }) => (
  <div>
    <h4 className="text-white mb-4">Analytics</h4>
    <div className="card bg-dark text-light mb-4">
      <div className="card-body">
        <h5 className="card-title">AI Copilot</h5>
        <div className="custom-control custom-switch mb-3">
          <input type="checkbox" className="custom-control-input" id="aiCopilot" checked={toggles.aiCopilot} onChange={() => onToggle('aiCopilot')} />
          <label className="custom-control-label" htmlFor="aiCopilot">AI Copilot assists with code suggestions and improvements.</label>
        </div>
        <a href="#" className="text-info small">Learn more about AI Copilot</a>
      </div>
    </div>
    <div className="card bg-dark text-light mb-4">
      <div className="card-body">
        <h5 className="card-title">Matomo Analytics (no cookies)</h5>
        <div className="custom-control custom-switch mb-3">
          <input type="checkbox" className="custom-control-input" id="matomoNoCookies" checked={toggles.matomoNoCookies} onChange={() => onToggle('matomoNoCookies')} />
          <label className="custom-control-label" htmlFor="matomoNoCookies">Help improve Remix with anonymous usage data.</label>
        </div>
        <a href="#" className="text-info small">Learn more about analytics</a>
      </div>
    </div>
    <div className="card bg-dark text-light mb-4">
      <div className="card-body">
        <h5 className="card-title">Matomo Analytics (with cookies)</h5>
        <div className="custom-control custom-switch mb-3">
          <input type="checkbox" className="custom-control-input" id="matomoWithCookies" checked={toggles.matomoWithCookies} onChange={() => onToggle('matomoWithCookies')} />
          <label className="custom-control-label" htmlFor="matomoWithCookies">Enable tracking with cookies for more detailed insights.</label>
        </div>
        <a href="#" className="text-info small">Manage Cookie Preferences</a>
      </div>
    </div>
  </div>
); 