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
* Chrome Manifest version 2.0
* [MIT License](https://github.com/rmauger/mORS/blob/master/LICENSE). Provided "AS IS".
* The official text of the Oregon Revised Statutes is the [printed published copy](https://apps.oregon.gov/ecommerce/lcc?AspxAutoDetectCookieSupport=1). 
See further disclaimers on [ORS website](https://www.oregonlegislature.gov/bills_laws/Pages/ORS.aspx)

## Updates:
  ### Version 1.0
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
  * Stylesheets don't update/sty right on non-active page when changing Oregon Law source (can fix by refreshing page or "remove stylesheet" + "add stylesheet")
  
## Planned features:
  * 
