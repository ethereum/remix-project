import React from 'react';

const sections = [
  { key: 'general', label: 'General Settings' },
  { key: 'analytics', label: 'Analytics' },
  { key: 'ai', label: 'Remix AI Assistant' },
  { key: 'services', label: 'Connected Services' },
];

export interface ModernSettingsSidebarProps {
  selected: string;
  onSelect: (key: string) => void;
}

export const ModernSettingsSidebar: React.FC<ModernSettingsSidebarProps> = ({ selected, onSelect }) => (
  <nav className="bg-transparent sidebar pr-0" style={{ borderRight: '1px solid #35364a', minHeight: '100vh' }}>
    <div className="sidebar-sticky pt-5">
      <h3 className="text-white pl-3">Settings</h3>
      <ul className="nav flex-column mt-4">
        {sections.map((s) => (
          <li className="nav-item" key={s.key}>
            <a
              className={`nav-link ${selected === s.key ? 'active font-weight-bold text-white' : 'text-secondary'}`}
              style={{ cursor: 'pointer', fontSize: '1.1rem' }}
              onClick={() => onSelect(s.key)}
            >
              {s.label}
            </a>
          </li>
        ))}
      </ul>
      {selected === 'general' && (
        <div className="mt-5 pl-3 text-secondary small">Manage code editor settings, UI theme, language and analytics permissions.</div>
      )}
      {selected === 'analytics' && (
        <div className="mt-5 pl-3 text-secondary small">Control how Remix uses AI and analytics to improve your experience.</div>
      )}
      {selected === 'ai' && (
        <div className="mt-5 pl-3 text-secondary small">The Remix AI Assistant enhances your coding experience with smart suggestions and automated insights. Manage how AI interacts with your code and data.</div>
      )}
      {selected === 'services' && (
        <div className="mt-5 pl-3 text-secondary small">Configure the settings for connected services, including Github, IPFS, Swarm, Sidri and Etherscan.</div>
      )}
    </div>
  </nav>
); 