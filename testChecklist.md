# Test Checklist

1. Uninstall existing version
1. Load Extension.
1. Inspect service worker:
    * Nine files successfully loaded
1. Open popup
    * Version (should match manifest & \README.md)
    * Display mode: Dark
    * Session lookup: Ore. Leg.
    * Checkboxes: true, true, false, false, true
1. Inspect service worker:
    * No errors
    * Six calls returned from background
    * Successful webResources call
1. Chapter/section input `90` -> `Launch`
    * Popup in lower right
    * Dark theme
1. Inspect service worker:
    * No errors (other than warnings on failed searches)
1. (On ORS 90 page) Check Top Heading:
    * In rectangular box, width set to max line:
    * Title: `Property Rights and Transactions`
    * Chapter: `Chapter 90: Residential Landlord and Tenant`
    * Edition: `Oregon Revised Statutes (2021 Edition)`
1. Check Table of Contents:
    * Two/three columns
    * (Begins) 12pt `GENERAL PROVISIONS`
    * (followed by) 11pt `90.100 Definitions`
    * (followed by) 11pt ***italic `(Temporary provisions relating to COVID-19...)`***
    * (later) 12pt `MANUFACTURED DWELLING PARKS AND MARINAS`
    * (followed by:) 11pt not italic `(General Provisions)`
    * (TOC ends with) `90.875 Remedy for failure to give notice`
    * (followed by) End of div box; new div box starting `GENERAL PROVISIONS`
1. (Detour) Navigate to ORS chapter 458
    * (TOC ends with)  `458.740 Project Facilitation`
    * (followed by) close div & rsec for 458.005 through 458.065
    * (followed by) new div COMMUNITY-BASED HOUSING DEVELOPMENT
    * Close tab
1. (Back in ORS 90) Check Main Body:
    * From TOC, click `90.425`
    * Top Heading `LANDLORD REMEDIES`
    * Hover, collapse & expand via heading button
    * Toggle full width/reading mode from hovered button
    * Check ORS 90.425 (10) indentation levels
    * Check source note in text & click source note for `2001 c.44`
        * Confirm navigation in new tab
        * Close tab
    * Scroll to 90.453 (3) form
        * Confirm form Div top & bottom (no form ending mend line)
        * Confirm form headings are formatted bold & heading color
        * Confirm text in parenthesis (Signature of party...) is normal/unformatted
        * Click `90.100` in form
1. Detour (navigate to `ors 105.124, 105.464` in omnibox)
    * Scroll down to ***Italic `(Temporary provisions relating to COVID-19...)`***
    * Confirm 5 separate, non-overlapping note sections
    * In first note section, click button
        * Confirm collapse
        * Click again and confirm expands
    * Click `chapter 13, Oregon Laws 2020 (first special session)` link in button
        * Confirm navigation in separate tab
        * Close tab
    * Click source note for `2020 s.s.3 c.3`
        * Confirm navigation in separate tab
        * Close tab
    * Scroll to ORS `90.394`
        * Confirm note div follows
        * Confirm div contains note and note section & ends before ORS 90.396
    * Click on link to `105.105`
        * Confirm navigation & auto scroll to section in separate tab
        * Close tab
    * Scroll to `90.510` and confirm proper indentation for `90.510 (1)(L)` (L is paragraph)
    * Scroll to `90.643` and confirm proper indentation for `90.643 (3)(b)(L)` (L is subparagraph)
    * Check mend line at end (followed by close of both heading & subheading divs)
1. In omnibox enter `mors 403.415`
    * Confirm navigation and auto scroll
    * Confirm display of delayed repeal note
    * Collapse and expand rsec for ORS `403.415`
    * Scroll down to check ORS `403.435` as well (doesn't have period after section number)
    * Close
1. Go back to popup:
    * Turn source note off confirm they disappear from  page
    * Turn rsec off & back on & confirm that it works on page
    * Turn on collapse all - confirm note
    * Turn off menu - confirm auto-reload with menu gone and sections all collapsed
    * Expand and re-collapse a section manually
    * Navigate to section from TOC; confirm automatically expands upon scroll
    * Under Session Law Lookup, select HeinOnline; confirm link works for:
        * Ordinary source note link (except 2021 not up as of 3/2/2022)
        * Special session source note link
        * Chapter xx, Oregon Laws YYYY link
    * Under Color scheme test "Custom", "Dark Grey" & "Light"
    * Select non-custom option and select `Set Custom Colors`
    * Select a few colors and save.
1. Repeat steps above in Firefox; then Edge.
