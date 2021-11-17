# mORS

Chrome Extension that alters appearance of Oregon Revised Statutes on Oregon State Legisature website. The Oregon Revised Statutes are the codified laws of the State of Oregon.

## Installation instructions:
* Unzip to folder
* Navigate to chrome://extensions/
* "Load Unpacked"
* Select folder

## To use:
* Navigate to [ORS website](https://www.oregonlegislature.gov/bills_laws/Pages/ORS.aspx) and select a chapter; or
* Enter chapter into extension popup

## Disclaimers:
* Chrome Manifest version 3
* [MIT License](https://github.com/rmauger/mORS/blob/master/LICENSE). Provided "AS IS".
* The official text of the Oregon Revised Statutes is the [printed published copy](https://apps.oregon.gov/ecommerce/lcc?AspxAutoDetectCookieSupport=1). 
See further disclaimers on [ORS website](https://www.oregonlegislature.gov/bills_laws/Pages/ORS.aspx)

## Updates:

  ### Version 1.4.0 - 11/17/2021
   * Omnibox works with 'mors'
   * Created simple data validation for form
   * Redid version numbering

  ### Version 1.3.0 - 11/15/2021
   * Updates to menu defaults:
      * hiding repealed sections
      * hide source notes
      * set default collapse all
   
  ### Version 1.2.3 - 11/11/2021
   * Bug fixes (runs all popup promises in background script)
   * Fixed collapsing section layout issues & remove css issues

  ### Version 1.2.1 - 11/11/2021
   * Reorganized css files & css selection

  ### Version 1.2.0 - 11/11/2021
   * Added toggle button to show/hide source notes & repealed/renumbered sections

  ### Version 1.1.2 - 11/08/2021
   * Minor bug fix (identifying start of table of contents)

  ### Version 1.1.1 - 11/05/2021
   * Minor bug fix (collapse all fixed)
   * Converted promise resolutions to async/await syntex

  ### Version 1.1.0 - 11/04/2021
  * Migrated to updated Chrome Manifest version 3
 
  ### Version 1.0.0 - 10/28/2021
  * Separates table of contents; sections; forms and notes into separetly styled divisions
  * Collapsable sections
  * Links to internal and external ORS sections
  * Links to source notes / session laws in Oregon Laws at HeinOnline (for state employees) or from Oregon legislature.
  * Identifies & tabs different subdivision units for subsections, paragraphs, subparagraphs, etc.
  * Links to preface
  * Dark and light modes
  
## Known bugs:
  * TODO: #28 Not identifying roman numerals if appearing with a paragraph & subparagraph (e.g. "(d)(A)(i)" or "(C)(i)(I)")
  * Heights of sections may not be correct if resizing window horizontally (can fix with "collapse all")
  * Stylesheets don't update/stay right on non-active page when changing Oregon Law source (can fix by refreshing page or "remove stylesheet" + "add stylesheet")

## Planned features/fixes:
  * TODO: #29 Improve speed and eliminate needless looping
  * TODO: #30 Allow removal of menu from page.