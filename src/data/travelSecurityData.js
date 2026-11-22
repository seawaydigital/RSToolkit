import { INSTITUTION_RS_CONTACT as RS } from '../siteConfig';

export const travelSecurityData = {
  id: 'travel-security',
  // Verified 2026-11-21. All 26 items were re-read against the Travel Security
  // Guide for University Researchers and Staff on the federal Safeguarding
  // Your Research portal (sections 1 to 3 and Appendix A; page dateModified
  // 2020-09-13, unchanged). The emergency block was checked against
  // travel.gc.ca's emergency assistance page (dateModified 2026-09-03), the
  // Research Security Centre's own page and Public Safety's Safeguarding
  // Science page (both dateModified 2026-10-09), and Lakehead's Safeguarding
  // Research page for the contact in siteConfig.js.
  //
  // The guide was written by the U15 and Universities Canada with the
  // Government of Canada-Universities Working Group. Its reuse note asks that
  // they be named as the source, and that a reproduction not be presented as
  // an official version or as endorsed by them: keep them in sourceLabel and
  // the intro, and keep saying the checklist "follows" the guide.
  // The "Why this matters" notes are this site's own explanations unless they
  // say the guide lists something.
  lastUpdated: '2026-11-21',
  sourceUrl:
    'https://science.gc.ca/site/science/en/safeguarding-your-research/guidelines-and-tools-implement-research-security/mitigating-your-research-security-risks/how-can-you-protect-your-research-during-travel',
  sourceLabel:
    'Travel security guide for university researchers and staff — U15 and Universities Canada, published by the Government of Canada',

  intro:
    'International travel is one of the highest-exposure moments in a research career. Conferences, site visits, and field work put you, your devices, and your unpublished work in environments you do not control. This checklist follows the three phases of the travel security guide that the U15 and Universities Canada wrote with the Government of Canada–Universities Working Group, published on the federal Safeguarding Your Research portal.',

  // Phases mirror the federal guidance structure: before / during / after.
  phases: [
    {
      id: 'before',
      label: 'Before You Go',
      intro:
        'Most travel risk is decided before you leave. The goal is to reduce what you carry and what can be learned about you.',
      groups: [
        {
          id: 'assess',
          title: 'Assess the trip',
          items: [
            {
              id: 'b-advisory',
              text: 'Check the Government of Canada travel advisory for your destination and register your trip.',
              detail:
                'Registration of Canadians Abroad is a free service that lets the Government of Canada notify you of an emergency at your destination or a personal emergency at home.',
              link: { url: 'https://travel.gc.ca/travelling/advisories', label: 'Travel advisories' },
            },
            {
              id: 'b-threat',
              text: 'Consider whether your research focus makes you a target of interest.',
              detail:
                'The guide lists what raises interest: research on security practices, commercial activity or intellectual property, STEM and emerging technology, health or other personal data, or politically sensitive topics; your access to partners, industry, government or US institutions; where you are going; and who you travel with.',
              crossLink: { tool: 'stra-lookup', label: 'Check the STRA list' },
            },
            {
              id: 'b-notify',
              text: 'Share your itinerary with your department and your institution’s research security or travel contact.',
              detail:
                'Someone at home should know where you are expected to be and when. This is also what makes an incident report credible after the fact.',
            },
            {
              id: 'b-insurance',
              text: 'Confirm travel insurance and that your institution knows you are travelling on university business.',
            },
          ],
        },
        {
          id: 'devices',
          title: 'Prepare devices and data',
          items: [
            {
              id: 'b-it',
              text: 'Talk to IT about loaner devices and VPN arrangements before you book.',
              detail:
                'Many institutions offer clean laptops and phones for international travel. Ask — this is the single most effective control available and it is usually free.',
            },
            {
              id: 'b-minimum',
              text: 'Bring the minimum: the least data and the fewest devices that still let you do the work.',
              detail:
                'Every additional device and file is additional exposure. A conference talk does not require your full research archive; take the talk.',
            },
            {
              id: 'b-patch',
              text: 'Update everything — operating system, applications, anti-virus, firewall, and full-disk encryption.',
              crossLink: { tool: 'cybersecurity-guide', label: 'Encryption and device setup' },
            },
            {
              id: 'b-external',
              text: 'Encrypt anything you must carry, put it on a separate external drive, and keep that drive on your person.',
              detail:
                'Keep the passphrase separate from the media — never written on or stored with the drive itself.',
            },
            {
              id: 'b-backup',
              text: 'Leave a verified backup at home so a lost or seized device is an inconvenience rather than a loss.',
            },
          ],
        },
        {
          id: 'profile',
          title: 'Manage your profile',
          items: [
            {
              id: 'b-social',
              text: 'Review what your public profiles reveal about your work, funders, and collaborators.',
              detail:
                'Lab pages, ORCID, LinkedIn, and conference bios are the normal starting point for anyone building a profile of you before you arrive.',
            },
            {
              id: 'b-visa',
              text: 'On visa and travel applications, provide only the information that is actually required.',
              detail:
                'Application forms sometimes request research detail well beyond what the visa category needs. Answer what is asked.',
            },
          ],
        },
      ],
    },

    {
      id: 'during',
      label: 'While Away',
      intro: 'Assume the environment is not private — networks, rooms, and conversations included.',
      groups: [
        {
          id: 'people',
          title: 'People',
          items: [
            {
              id: 'd-discuss',
              text: 'Do not discuss unpublished or sensitive work in public places, or with contacts you have just met.',
              detail: 'Restaurants, taxis, hotel lobbies, and conference floors are all public.',
            },
            {
              id: 'd-relationships',
              text: 'Be alert to new relationships that develop unusually quickly around your research.',
              detail:
                'Flattery, sudden funding offers, unsolicited invitations, and persistent interest in your unpublished work are recognised approach patterns.',
              crossLink: { tool: 'dual-use', label: 'Vetting collaborators' },
            },
            {
              id: 'd-local-law',
              text: 'Know the local law, including laws on consent and sexual orientation, and what could be used as leverage.',
              detail:
                'Compromise is often personal rather than technical. Some jurisdictions criminalise conduct that is lawful in Canada.',
            },
          ],
        },
        {
          id: 'physical',
          title: 'Physical security',
          items: [
            {
              id: 'd-room',
              text: 'Do not share your accommodation or room number, and keep your key rather than leaving it at the desk.',
            },
            {
              id: 'd-devices-sight',
              text: 'Keep devices with you. Do not surrender a laptop or phone at a conference, and do not leave one in a hotel room or safe.',
              detail:
                'If a device leaves your sight — including during a customs or security inspection — treat it as compromised from that moment on.',
            },
            {
              id: 'd-public-computers',
              text: 'Do not use hotel or conference computers, public phones, or shared printers for anything work-related.',
            },
          ],
        },
        {
          id: 'cyber',
          title: 'Cyber',
          items: [
            {
              id: 'd-usb',
              text: 'Never plug in a USB stick, cable, camera, or gift device you were given.',
              detail:
                'Promotional USB drives and gifted electronics are a routine delivery method for malware. Decline, or accept and never connect it.',
            },
            {
              id: 'd-wifi',
              text: 'Treat all local networks as hostile. Use your institution’s VPN for anything work-related.',
            },
            {
              id: 'd-cloud',
              text: 'Avoid cloud storage while travelling if you can. If you must use it, do so only from your own secured device.',
            },
            {
              id: 'd-report-loss',
              text: 'Report a lost or stolen device to IT immediately — not when you get home.',
              detail: 'Remote wipe and credential revocation only help if they happen quickly.',
            },
          ],
        },
      ],
    },

    {
      id: 'after',
      label: 'When You Return',
      intro:
        'The trip is not over when you land. Anything that travelled with you is now an untrusted device on your institution’s network.',
      groups: [
        {
          id: 'remediate',
          title: 'Remediate',
          items: [
            {
              id: 'a-scan',
              text: 'Have IT scan or re-image any device that travelled, especially if it left your sight.',
              detail:
                'If you used a loaner, return it for wiping rather than reconnecting it to your normal accounts.',
            },
            {
              id: 'a-gifts',
              text: 'Scan every external device, gift, and conference giveaway before connecting it to anything.',
            },
            {
              id: 'a-credentials',
              text: 'Change passwords used while travelling, and check for unexpected sign-ins.',
              crossLink: { tool: 'cybersecurity-guide', label: 'Passwords and 2FA' },
            },
          ],
        },
        {
          id: 'report-back',
          title: 'Report',
          items: [
            {
              id: 'a-report',
              text: 'Report anything unusual to your research security contact, even if nothing was obviously taken.',
              detail:
                'Unusual attention, an approach about your research, a device inspected out of sight, or a room that appeared searched are all worth reporting. Patterns are only visible once individual reports accumulate.',
            },
            {
              id: 'a-obligations',
              text: 'If you agreed to any collaboration, data sharing, or affiliation while away, disclose it.',
              detail:
                'A new affiliation with a Named Research Organization, or funding or in-kind support from one, affects eligibility under the STRAC Policy for any grant that aims to advance a Sensitive Technology Research Area. A new private-sector partner can change what the NSGRP requires of a partnership grant.',
              crossLink: { tool: 'strac-flowchart', label: 'STRAC decision flow' },
            },
          ],
        },
      ],
    },
  ],

  // Shown on every phase — help is time-sensitive and should never be a tab away.
  emergency: {
    title: 'If something goes wrong abroad',
    body:
      'Contact the nearest Canadian embassy or consulate, and report to your institution as soon as it is safe to do so.',
    contacts: [
      {
        id: 'gac-ewrc',
        label: 'Global Affairs Canada — Emergency Watch and Response Centre',
        detail: '24/7 consular assistance for Canadian citizens outside Canada. Call collect where available.',
        phone: '+1-613-996-8885',
        email: 'sos@international.gc.ca',
      },
      {
        id: 'institution-rso',
        label: `${RS.institution} — Research Security`,
        detail: `${RS.name}, ${RS.title}. Report device searches, seizures or approaches here once you are safe.`,
        email: RS.email,
      },
      {
        id: 'rsc',
        label: 'Public Safety Canada — Research Security Centre',
        detail:
          'Gives researchers and institutions advice and guidance on research security. For advice after the fact, usually through your institution; not an emergency line.',
        email: 'researchsecurity-securiteenrecherche@ps-sp.gc.ca',
      },
    ],
  },

  training: {
    label: 'Safeguarding Science — Module 6: Travelling Safely',
    body:
      'Public Safety Canada’s Research Security Centre offers a virtual training module on protecting research while travelling abroad. It covers the threat environment, the techniques foreign governments use to acquire research, and best practices before, during and after travel.',
    url: 'https://www.publicsafety.gc.ca/cnt/ntnl-scrt/cntr-trrrsm/cntr-prlfrtn/sfgrdng-scnc/sfgrdng-scnc-wrkshp-en.aspx',
  },
};
