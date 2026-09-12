# Accessibility testing scope

The engineering target is WCAG 2.2 AA. This is not a conformance certification or a claim of comprehensive assistive-technology coverage.

The candidate uses named native controls, a modal search dialog with focus containment, keyboard path controls, radios with programmatic selected state, source and result messages, a skip link, route titles and explicit error recovery. Restored flowcharts use native step buttons over decorative SVG arrows, pan/zoom controls and a complete Text View. Map markers support keyboard focus and popups; an equivalent source list supplies all details and large controls without panning.

Map pins can overlap because they preserve geographic positions. For WCAG 2.5.8, the implementation relies on equivalent source-list controls with at least 44px height. Tests retain every other axe rule on markers and test target size for the rest of the page, including the expanded source list. Diagrams/maps require two-dimensional layouts; surrounding controls and text alternatives reflow at 320px. This is a documented scope decision, not a blanket accessibility exclusion for maps.

Automated browser checks exercise Chromium, Firefox and WebKit on Windows, axe rules for WCAG A/AA through 2.2, and 320 CSS-pixel reflow. Automated checks cannot establish all success criteria or screen-reader comprehension. WebKit on Windows is not a test of Safari on a physical Mac or iPhone. A 320-pixel viewport checks the reflow geometry associated with 400% zoom on a 1280-pixel viewport; it is not a complete physical zoom/device test.

Print checks cover complete filtered/closed guides and worksheet response states. The web version remains the primary accessible version. Browser-generated PDF tagging and reading order vary by browser; no PDF/UA claim is made.

The actual passing/failing evidence is recorded in [the closure record](docs/launch-closure-record.md). Andrew's keyboard/screen-reader and comprehension walkthrough remains a release acceptance step. No outside reviewer is required by this plan.

Report barriers or request help at security.research@lakeheadu.ca. Use a synthetic example and describe the page, browser and interaction. Avoid confidential research, personal allegations or unnecessary medical information.
