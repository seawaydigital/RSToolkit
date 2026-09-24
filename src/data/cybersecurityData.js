export const cybersecurityData = {
  id: 'cybersecurity-guide',
  lastUpdated: '2026-09-18',
  sourceUrl: 'https://www.lakeheadu.ca/research-and-innovation/research-services/resources/safeguarding-research-resources/cybersecurity',
  sourceLabel: 'Lakehead University Research Cyber Security',

  essentialActions: [
    {
      id: 'two-factor',
      number: 1,
      icon: 'Shield',
      title: 'Enable 2FA in both places separately',
      body: 'At most institutions, 2FA protects two different systems: Duo Security (for internal portals, LMS) and Google 2-Step Verification (for institutional Google accounts). They are independent — setting up one does not cover the other. Enable both.',
    },
    {
      id: 'password-manager',
      number: 2,
      icon: 'KeyRound',
      title: 'Use a password manager',
      body: 'Bitwarden is free and open-source. 1Password is included with many institutional accounts. These tools generate and store unique passwords so you never reuse credentials across research systems.',
    },
    {
      id: 'encrypt-laptop',
      number: 3,
      icon: 'HardDrive',
      title: 'Encrypt your laptop',
      body: 'BitLocker on Windows, FileVault on Mac. If your laptop is stolen without device encryption, anyone can read every file on it regardless of your login password. Device encryption is your last line of defence.',
    },
    {
      id: 'vpn',
      number: 4,
      icon: 'Wifi',
      title: 'Use VPN on public networks',
      body: 'Especially critical when travelling internationally or presenting at conferences. Use your institution\'s VPN whenever connecting to university systems on untrusted Wi-Fi.',
    },
    {
      id: 'ai-tools',
      number: 5,
      icon: 'AlertTriangle',
      title: 'Never enter sensitive research data into AI tools',
      body: 'ChatGPT, Microsoft Copilot, Google Gemini, and similar services may store and use your inputs for training. Never paste participant data, unpublished findings, confidential partner information, grant text, or anything covered by an ethics protocol into these tools.',
    },
    {
      id: 'backup',
      number: 6,
      icon: 'Database',
      title: 'Follow the 3-2-1 backup rule',
      body: 'Keep 3 copies of important research data, on 2 different types of media (e.g., laptop + external drive), with 1 copy offsite (e.g., institutional Google Drive or OneDrive). Retention periods are set by your funding agreement, institutional records policy, ethics approval and any data-sharing agreement — check those before deleting anything.',
    },
    {
      id: 'report-incident',
      number: 7,
      icon: 'Bell',
      title: 'Know how to report a security incident',
      body: 'If something feels wrong — unexpected login, phishing email clicked, lost device — contact your institution\'s IT/TSC immediately. Early reporting significantly reduces damage.',
    },
  ],

  fileEncryption: {
    intro: 'Even when using institutionally-approved services like Google Drive or OneDrive, you should encrypt files that contain personal information, unpublished findings, industry partner materials, grant proposals, or anything covered by an NDA. Encrypt the file first, then upload the encrypted version.',
    platforms: [
      {
        id: 'windows',
        label: 'Windows — 7-Zip',
        steps: [
          { text: 'Download 7-Zip from', linkUrl: 'https://www.7-zip.org', linkLabel: '7-zip.org', suffix: '(free, open-source)' },
          { text: 'Right-click your file or folder → 7-Zip → Add to archive' },
          { text: 'Set format to 7z' },
          { text: 'Set encryption method to AES-256' },
          { text: 'Enter a strong passphrase (12+ characters)' },
          { text: 'Upload the resulting .7z file to cloud storage' },
        ],
        tip: 'Share the password separately from the file — never in the same email.',
      },
      {
        id: 'mac',
        label: 'Mac — Disk Utility',
        bestFor: 'Encrypting a folder for cloud storage or for another Mac user. Uses AES-256; no extra software.',
        steps: [
          { text: 'Open Disk Utility (Applications → Utilities)' },
          { text: 'Choose File → New Image → Image from Folder…, then select the folder' },
          { text: 'Set Encryption to 256-bit AES and enter a strong passphrase (12+ characters)' },
          { text: 'Leave "Remember password in my keychain" unticked if you will share the image, then Save' },
          { text: 'Upload the resulting .dmg file to cloud storage' },
          { text: 'Apple\'s instructions:', linkUrl: 'https://support.apple.com/guide/disk-utility/create-a-disk-image-dskutl11888/mac', linkLabel: 'Create a disk image using Disk Utility' },
        ],
        tip: 'Do not use the Terminal command zip -e / zip -er: it applies ZipCrypto, which is weak and not an AES alternative. A .dmg opens only on a Mac — for a Windows recipient use 7-Zip or VeraCrypt.',
      },
      {
        id: 'veracrypt',
        label: 'VeraCrypt — Cross-Platform',
        bestFor: 'Encrypted containers or full drives that need to be accessed on both Windows and Mac.',
        steps: [
          { text: 'Download from', linkUrl: 'https://www.veracrypt.fr', linkLabel: 'veracrypt.fr', suffix: '(free, open-source, audited)' },
          { text: 'Create an encrypted volume (a file that acts as a secure container)' },
          { text: 'Mount the volume, drag your files in, then dismount' },
          { text: 'Share the container file — recipient needs VeraCrypt and the passphrase to open it' },
        ],
      },
    ],
  },

  deviceEncryption: [
    {
      id: 'bitlocker',
      label: 'Windows — BitLocker',
      body: 'Go to Settings → Privacy & Security → Device Encryption and turn it on. Save your recovery key to your institutional Microsoft account, not just locally. If you lose the key and the device has issues, you lose access to everything on it.',
    },
    {
      id: 'filevault',
      label: 'Mac — FileVault',
      body: 'Go to System Settings → Privacy & Security → FileVault and turn it on. Choose to store the recovery key in your iCloud account, or write it down and keep it somewhere physically secure — not on the same laptop.',
    },
    {
      id: 'usb',
      label: 'USB Drives & External Storage',
      body: 'Never store research data on an unencrypted USB drive. Use BitLocker To Go (Windows) or the built-in Encrypt option in Finder (Mac, right-click the drive). For drives that need to work on both platforms, use VeraCrypt.',
      linkUrl: 'https://www.veracrypt.fr',
      linkLabel: 'veracrypt.fr',
    },
  ],

  passwordsAnd2FA: {
    passphrases: {
      title: 'Strong Passphrases',
      body: 'Use four or more random words — "Closet lamp Bathroom Mug" is stronger than "P@ssw0rd!" because length beats complexity. The Canadian Centre for Cyber Security recommends at least 12 characters.',
      resources: [
        { label: 'Canadian Centre for Cyber Security', url: 'https://www.cyber.gc.ca' },
        { label: 'Check if your email appeared in a data breach', url: 'https://haveibeenpwned.com' },
      ],
    },
    managers: [
      {
        id: 'bitwarden',
        name: 'Bitwarden',
        description: 'Free, open-source, cross-platform. Generate and store unique passwords for every account.',
        url: 'https://bitwarden.com',
        free: true,
      },
      {
        id: '1password',
        name: '1Password',
        description: 'Included with many institutional accounts. Check if your institution provides access.',
        url: 'https://1password.com',
        free: false,
      },
    ],
    twoFactor: {
      title: 'Two-Factor Authentication',
      body: 'Enable 2FA on every account that supports it: institutional email, cloud storage, data repositories (Borealis, OSF, Zenodo), collaboration tools, and any system containing research data. Authenticator apps (Google Authenticator, Duo, Microsoft Authenticator) are more secure than SMS codes.',
    },
    backupRule: {
      title: 'The 3-2-1 Backup Rule',
      items: [
        { number: '3', label: 'copies of important data' },
        { number: '2', label: 'different types of media (e.g., laptop SSD + external drive)' },
        { number: '1', label: 'copy offsite (institutional cloud storage, or a physically separate location)' },
      ],
      note: 'There is no single national retention period: the Tri-Agency Framework: Responsible Conduct of Research requires complete and accurate records kept in accordance with your funding agreement, institutional policies, applicable laws and disciplinary standards. Find out which applies to your project. Backups are not optional.',
    },
  },

  aiWarning: {
    title: 'Do not input sensitive research data into AI tools.',
    intro: 'ChatGPT, Microsoft Copilot, Google Gemini, and similar services may store and use your inputs for training. Never paste:',
    neverPaste: [
      'Participant or patient data',
      'Unpublished research findings',
      'Confidential industry partner information',
      'Grant proposal text',
      'Anything covered by an ethics protocol, NDA, or data sharing agreement',
    ],
    callToAction: 'If you need AI assistance with sensitive research, contact your institution\'s Research Security or RDM office to discuss approved, privacy-preserving alternatives. Some institutions have enterprise agreements with data processing terms that differ from the consumer products.',
  },

  sensitiveData: {
    intro: 'Some categories of research data carry storage-location, custody or governance obligations that can rule out a given cloud service. Before storing sensitive data on any cloud service — including Google Drive, Dropbox, or OneDrive — confirm the specific obligation that applies if your project involves:',
    categories: [
      {
        id: 'defence',
        label: 'Defence contracts or Controlled Goods Program materials',
        detail: null,
      },
      {
        id: 'health',
        label: 'Provincial health datasets',
        detail: 'Ontario\'s PHIPA and any data-sharing agreement set the terms — confirm with the data custodian and your REB',
      },
      {
        id: 'ethics',
        label: 'Projects with specific ethics approval conditions',
        detail: null,
      },
      {
        id: 'indigenous',
        label: 'Indigenous research data',
        detail: 'Governance is set by the community or Nation. The First Nations principles of OCAP® (Ownership, Control, Access, Possession) apply to First Nations data; Inuit and Métis communities have their own frameworks. Agree storage and access terms with the community before collecting',
      },
      {
        id: 'strac',
        label: 'Collaborations with foreign partners on sensitive technology research areas',
        detail: 'STRAC-listed fields',
        relatedTool: 'stra-lookup',
        relatedToolLabel: 'Check STRA',
      },
    ],
    callToAction: 'For any of these, consult your institution\'s Research Security or Research Data Management office before choosing a storage solution.',
  },
};
