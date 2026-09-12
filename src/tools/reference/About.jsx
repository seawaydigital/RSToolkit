import { policySources, CONTENT_VERSION } from '../../data/policySources';
import { releaseStatus } from '../../data/releaseStatus';
import SupportLinks from '../../components/ui/SupportLinks';
import { corrections } from '../../data/corrections';

export default function About() {
  return <div className="tool-page">
    <header className="tool-page-header"><h1>About, Privacy and Sources</h1><p>What this release covers, how it handles information and where its guidance comes from.</p></header>
    <section className="review-card"><h2>Scope and status</h2>
      <p>{releaseStatus.stage} {releaseStatus.version} · content {CONTENT_VERSION}.</p>
      <p>This is an independently operated preparation and reference resource. It has not been endorsed by Lakehead University, a granting agency or a government. Institutional links identify published resources and support routes.</p>
      <p>The interface is English. It covers selected federal and Ontario requirements and links to Lakehead resources. Other provincial, contractual, ethics and institutional requirements can apply. Use the Français link on official government pages for their French versions.</p>
      <p>Policy paths rely on your answers and have explicit limits. NRO results concern names, not verified relationships. The STRA explorer helps find categories; it does not classify research. Worksheets do not replace official forms.</p>
      <p>Operator: {releaseStatus.operator || 'awaiting owner confirmation before publication'}.</p>
    </section>
    <section className="review-card"><h2>Privacy and device storage</h2>
      <p>Organization and technology searches run locally against bundled records. This release contains no map, geocoding service, analytics, advertising or remote fonts. Ordinary use loads the site’s own files; the hosting provider can receive connection information and retain access logs.</p>
      <p>Assessment answers stay in memory by default. Closing or reloading the page loses temporary work. Choosing “Remember this worksheet on this device” stores an unencrypted, versioned worksheet in this browser and replaces any earlier saved worksheet. Resuming is explicit. Guided paths and STRA exploration are never saved to device storage.</p>
      <p>Use “Clear saved data” in the worksheet to remove this release’s saved worksheet and the legacy checklist. If browser storage is blocked, a visible message explains the failure. Your browser’s site-data controls are an alternative.</p>
      <p>Do not enter confidential narratives or researcher identities. Printing creates a separate document under your control; clearing browser data cannot remove it. External official links open another website with its own privacy practices. Search terms and answers are not added to those links.</p>
    </section>
    <section className="review-card"><h2>Corrections and urgent concerns</h2>
      {releaseStatus.reportingEmail ? <p><a href={'mailto:' + releaseStatus.reportingEmail}>Private toolkit report</a>. Describe the affected tool and a synthetic example. Do not include confidential research or allegations.</p> : <p>A private toolkit reporting address must be confirmed by the owner before publication. Do not submit sensitive cases or vulnerability details in public repository issues.</p>}
      <p>For an urgent research or cybersecurity incident, follow your institution’s reporting process. The toolkit is not an emergency response service.</p>
    </section>
    <section className="review-card"><h2>Verification and limitations</h2>
      <p>The release process checks policy scenarios, data integrity, browser journeys, automated accessibility findings and printed output. It has not received an independent security audit or formal accessibility certification. Actual results and remaining checks are recorded in the repository’s launch closure record.</p>
      <p><a href="./THIRD_PARTY_NOTICES.txt">Third-party software and font notices</a> · <a href="./LICENSE.txt">Software license</a>. Linked policies and third-party marks retain their own terms.</p>
      <p>Guidance may change after a check. Verification dates are toolkit review dates, not a guarantee that a source remains current. Overdue policy paths stop providing definitive results and retain official links. Material corrections require a new release; previously printed copies cannot update themselves.</p>
    </section>
    <section className="review-card"><h2>Correction record</h2>{corrections.map(c => <article key={c.title}><h3>{c.title}</h3><p>{c.date} · {c.version}</p><p>{c.text}</p></article>)}</section>
    <section><h2>Source register</h2><p>Source dates and toolkit verification are recorded separately. Use the version applicable to your application or award.</p>
      {Object.entries(policySources).map(([id, s]) => <article className="review-card" key={id}><h3><a href={s.url} target="_blank" rel="noopener noreferrer">{s.title}</a></h3><p>{s.section}</p><p>Source version: {s.version || 'not asserted'} · Toolkit verified: {s.verifiedOn} · Review due: {s.reviewDue}</p></article>)}
    </section><SupportLinks />
  </div>;
}
