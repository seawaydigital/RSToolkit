import { useState } from 'react';
import {
  Shield, KeyRound, HardDrive, Wifi, AlertTriangle, Database, Bell,
} from 'lucide-react';
import { TabList, TabPanel } from '../../components/ui/Tabs';
import { cybersecurityData } from '../../data/cybersecurityData';

const ICON_MAP = { Shield, KeyRound, HardDrive, Wifi, AlertTriangle, Database, Bell };

const TABS = [
  { id: 'quick-start', label: 'Quick Start' },
  { id: 'encryption', label: 'Encryption' },
  { id: 'passwords', label: 'Passwords & 2FA' },
  { id: 'ai-data', label: 'AI & Sensitive Data' },
];

export default function CybersecurityGuide({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('quick-start');
  const [encPlatform, setEncPlatform] = useState('windows');

  return (
    <div className="tool-page">
      <div className="tool-page-header">
        <h1>Cybersecurity Best Practices for Researchers</h1>
        <p>Day-to-day security hygiene for protecting research data, devices, and accounts</p>
        <div className="tool-page-meta">
          <span>Last updated: {cybersecurityData.lastUpdated}</span>
          <a href={cybersecurityData.sourceUrl} target="_blank" rel="noopener noreferrer">
            {cybersecurityData.sourceLabel}
          </a>
        </div>
      </div>

      {/* ── Main tabs ── */}
      <TabList
        tabs={TABS}
        activeId={activeTab}
        onChange={setActiveTab}
        prefix="csec"
        label="Cybersecurity guide sections"
      />

      {/* ── Tab: Quick Start ── */}
      {activeTab === 'quick-start' && (
        <TabPanel id="quick-start" prefix="csec">
          <p className="csec-intro-text">
            These seven actions provide a strong security baseline for any researcher. If you do nothing else, do these.
          </p>
          <ol className="csec-actions-list">
            {cybersecurityData.essentialActions.map(action => {
              const Icon = ICON_MAP[action.icon];
              return (
                <li key={action.id} className="csec-action-item">
                  <div className="csec-action-number">{action.number}</div>
                  <div className="csec-action-icon">
                    {Icon && <Icon size={20} />}
                  </div>
                  <div className="csec-action-body">
                    <div className="csec-action-title">{action.title}</div>
                    <p className="csec-action-desc">{action.body}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </TabPanel>
      )}

      {/* ── Tab: Encryption ── */}
      {activeTab === 'encryption' && (
        <TabPanel id="encryption" prefix="csec">

          {/* File Encryption */}
          <h2 className="csec-section-title">Encrypting Files Before Uploading to Cloud Storage</h2>
          <p className="csec-section-intro">{cybersecurityData.fileEncryption.intro}</p>

          {/* Platform sub-tabs */}
          <TabList
            tabs={cybersecurityData.fileEncryption.platforms.map(p => ({ id: p.id, label: p.label }))}
            activeId={encPlatform}
            onChange={setEncPlatform}
            prefix="csec-os"
            label="Operating system"
          />

          {cybersecurityData.fileEncryption.platforms.map(platform => {
            if (platform.id !== encPlatform) return null;
            return (
              <TabPanel key={platform.id} id={platform.id} prefix="csec-os" className="csec-platform-content">
                {platform.bestFor && (
                  <div className="csec-best-for">
                    <strong>Best for:</strong> {platform.bestFor}
                  </div>
                )}
                <ol className="csec-steps">
                  {platform.steps.map((step, i) => (
                    <li key={i} className="csec-step">
                      {step.text}{' '}
                      {step.linkUrl && (
                        <a href={step.linkUrl} target="_blank" rel="noopener noreferrer">
                          {step.linkLabel}
                        </a>
                      )}
                      {step.suffix && <span className="csec-step-suffix"> {step.suffix}</span>}
                      {step.code && (
                        <code className="csec-code">{step.code}</code>
                      )}
                    </li>
                  ))}
                </ol>
                {platform.tip && (
                  <div className="csec-tip">
                    <strong>Tip:</strong> {platform.tip}
                  </div>
                )}
              </TabPanel>
            );
          })}

          {/* Device Encryption */}
          <h2 className="csec-section-title" style={{ marginTop: 32 }}>Device Encryption</h2>
          <div className="csec-device-list">
            {cybersecurityData.deviceEncryption.map(device => (
              <div key={device.id} className="csec-device-item">
                <div className="csec-device-label">{device.label}</div>
                <p className="csec-device-body">
                  {device.body}{' '}
                  {device.linkUrl && (
                    <a href={device.linkUrl} target="_blank" rel="noopener noreferrer">
                      {device.linkLabel}
                    </a>
                  )}
                </p>
              </div>
            ))}
          </div>
        </TabPanel>
      )}

      {/* ── Tab: Passwords & 2FA ── */}
      {activeTab === 'passwords' && (
        <TabPanel id="passwords" prefix="csec">

          {/* Strong Passphrases */}
          <div className="csec-subsection">
            <h2 className="csec-section-title">{cybersecurityData.passwordsAnd2FA.passphrases.title}</h2>
            <p className="csec-section-intro">{cybersecurityData.passwordsAnd2FA.passphrases.body}</p>
            <div className="csec-resource-links">
              {cybersecurityData.passwordsAnd2FA.passphrases.resources.map(r => (
                <a
                  key={r.url}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="csec-resource-link"
                >
                  {r.label} →
                </a>
              ))}
            </div>
          </div>

          {/* Password Managers */}
          <div className="csec-subsection">
            <h2 className="csec-section-title">Password Managers</h2>
            <p className="csec-section-intro">
              Use a password manager to generate and store unique passwords for every account. Never reuse passwords, especially for research systems, institutional accounts, or anything connected to grant data.
            </p>
            <div className="csec-manager-grid">
              {cybersecurityData.passwordsAnd2FA.managers.map(m => (
                <a
                  key={m.id}
                  href={m.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="csec-manager-card"
                >
                  <div className="csec-manager-name">
                    {m.name}
                    {m.free && <span className="csec-free-badge">Free</span>}
                  </div>
                  <p className="csec-manager-desc">{m.description}</p>
                </a>
              ))}
            </div>
          </div>

          {/* 2FA */}
          <div className="csec-subsection">
            <h2 className="csec-section-title">{cybersecurityData.passwordsAnd2FA.twoFactor.title}</h2>
            <p className="csec-section-intro">{cybersecurityData.passwordsAnd2FA.twoFactor.body}</p>
          </div>

          {/* 3-2-1 Backup Rule */}
          <div className="csec-backup-card">
            <div className="csec-backup-title">{cybersecurityData.passwordsAnd2FA.backupRule.title}</div>
            <div className="csec-backup-items">
              {cybersecurityData.passwordsAnd2FA.backupRule.items.map(item => (
                <div key={item.number} className="csec-backup-item">
                  <span className="csec-backup-number">{item.number}</span>
                  <span className="csec-backup-label">{item.label}</span>
                </div>
              ))}
            </div>
            <p className="csec-backup-note">{cybersecurityData.passwordsAnd2FA.backupRule.note}</p>
          </div>
        </TabPanel>
      )}

      {/* ── Tab: AI & Sensitive Data ── */}
      {activeTab === 'ai-data' && (
        <TabPanel id="ai-data" prefix="csec">

          {/* AI Warning */}
          <div className="csec-warning">
            <div className="csec-warning-title">
              <AlertTriangle size={20} />
              {cybersecurityData.aiWarning.title}
            </div>
            <p className="csec-warning-intro">{cybersecurityData.aiWarning.intro}</p>
            <ul className="csec-warning-list">
              {cybersecurityData.aiWarning.neverPaste.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <p className="csec-warning-cta">{cybersecurityData.aiWarning.callToAction}</p>
          </div>

          {/* Sensitive Data Storage */}
          <h2 className="csec-section-title" style={{ marginTop: 32 }}>
            Special Requirements for Controlled &amp; Sensitive Research Data
          </h2>
          <p className="csec-section-intro">{cybersecurityData.sensitiveData.intro}</p>

          <div className="csec-data-categories">
            {cybersecurityData.sensitiveData.categories.map(cat => (
              <div key={cat.id} className="csec-data-category">
                <div className="csec-data-category-text">
                  <div className="csec-data-category-label">{cat.label}</div>
                  {cat.detail && (
                    <div className="csec-data-category-detail">{cat.detail}</div>
                  )}
                </div>
                {cat.relatedTool && (
                  <button
                    className="csec-related-tool-btn"
                    onClick={() => onNavigate?.(cat.relatedTool)}
                  >
                    {cat.relatedToolLabel} →
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="csec-consult-note">
            {cybersecurityData.sensitiveData.callToAction}
          </div>
        </TabPanel>
      )}
    </div>
  );
}
