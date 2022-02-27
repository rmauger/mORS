# Test Checklist

1. Uninstall existing version
1. Load Extension.
1. Inspect service worker:
    * Nine files successfully loaded
1. Open popup
    * Version (should match manifest & \README.md)
    * Display mode: Dark
    * Sess lookup: Ore. Leg.
    * Checkboxes: true, true, false, true
1. Inspect service worker:
    * No errors
    * Six calls returned from background
    * Sucessful webresources call
1. Chapter/section input `90` -> `Launch`
    * Popup in upper right
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
    * (followed by) close div & rsecs for 458.005 through 458.065
    * (followed by) new div COMMUNITY-BASED HOUSING DEVELOPMENT
    * Close window
1. (Back in ORS 90) Check Main Body:
    * From TOC, click `90.425`
    * Hover, collapse & expand via heading button
    * Check ORS 90.425 (10) indentation levels
    * Check source note in text & click source note for `2001 c.44`; confirm navigation in new window
    * In Popup, turn on rsec; confirm 90.426 exists & formattting
    * Scroll to 90.453 (3)
    * Confirm form - top, bottom & headings & lack of subheadings for parens
    * Click `90.100` in form
    * Scroll down to ***Italic `(Temporary provisions following ORS 90.100)`***
    * Confirm 5 separate, nonoverlapping note secions
    * In first note section, click `chapter 13, Oregon Laws 2020 (first special session)` confirm navigation in separate window
    * Click note for 2020 s.s.3 c.3, confirm navigation in separate window
        * Close window
    * Scroll to ORS 90.394, confirm note section follows & ends before ORS 90.396
    * Click on link to 105.105 confirm navigation & scroll to section in separate window
        * Close window
    * Confirm indentation for 90.510 (1)(L) (L is paragraph) and 90.643 (3)(b)(L) (L is subparagraph)
    * Check mend line at end
1. (Detour) Navigate to ORS 403.415 and 458.380.
    * Check display of delayed repeal note
    * Close
1. Go back to popup:
    * Turn source note off confirm they disappear from  page
    * Turn rsec off & back on & confirm that it works on page
    * Turn on collapse all - confirm note
    * Turn off menu - confirm disappeared and sections are collapsed
    * Expand and collapse a section
    * Resize window to 1/2 width, confirm that leadline boxes resize
    * Under Session Law Lookup, select HeinOnline; confirm link works for:
        * Ordinary source note link
        * Special session source note link
        * Chapter xx, Oregon Laws YYYY link
    * Under Color scheme test "Custom", "Dark Grey" & "Light"
    * Select non-custom option and select `Set Custom Colors`
    * Select a few colors and save.
1. Repeat steps above in Firefox; then Edge.
