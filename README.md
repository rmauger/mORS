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

  ### Version 1.21 - 11/11/2021
   * Bug fixes (option menu updates correctly)
   * Reorganized css files & css selection

  ### Version 1.20 - 11/11/2021
   * Added toggle button to show/hide source notes & repealed/renumbered sections

  ### Version 1.18 - 11/08/2021
   * Minor bug fix (identifying start of table of contents)

  ### Version 1.15 - 11/05/2021
   * Minor bug fix (collapse all fixed)
   * Converted promise resolutions to async/await syntex

  ### Version 1.10 - 11/04/2021
  * Migrated to updated Chrome Manifest version 3
 
  ### Version 1.00 - 10/28/2021
  * Separates table of contents; sections; forms and notes into separetly styled divisions
  * Collapsable sections
  * Links to internal and external ORS sections
  * Links to source notes / session laws in Oregon Laws at HeinOnline (for state employees) or from Oregon legislature.
  * Identifies & tabs different subdivision units for subsections, paragraphs, subparagraphs, etc.
  * Links to preface
  * Dark and light modes
  
## Known bugs:
  * Not identifying roman numerals if appearing with a paragraph & subparagraph (e.g. "(d)(A)(i)" or "(C)(i)(I)")
  * Heights of sections may not be correct if resizing window horizontally (can fix with "collapse all")
  * Stylesheets don't update/stay right on non-active page when changing Oregon Law source (can fix by refreshing page or "remove stylesheet" + "add stylesheet")
  * Formatting of division heights doesn't work when stylesheet is removed
  
## Planned features:
  * TODO: #11 Redo how collapse works to avoid resizing issues.
  * TODO: #15 reorganize code in background & popup.js
  * TODO: #14 run promises in background.js from popup.js (or use messages to simplify)

  
