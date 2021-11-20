# mORS

Google Chrome Extension that alters appearance of Oregon Revised Statutes on Oregon State Legisature website. The Oregon Revised Statutes are the codified laws of the State of Oregon.

## Installation instructions:
  * Navigate to https://github.com/rmauger/mORS
  * From green "Code" button > "Download Zip"
  * Unzip to folder
  * Navigate to chrome://extensions/ (or ... > More Tools > Extensions)
  * "Load Unpacked"
  * Select folder

## To use:
  * Navigate to [ORS website](https://www.oregonlegislature.gov/bills_laws/Pages/ORS.aspx) and select a chapter;
  * Enter chapter into extension popup (puzzle piece in upper right of browser); or
  * Type 'mors' in the Chrome Omnibox (search bar) then type:
    * An ORS chapter (e.g., '659A')
    * An ORS section ('174.020')
    * An Oregon Session Law ('2015 c.614') 

## Disclaimers:
* Chrome Manifest version 3
* [MIT License](https://github.com/rmauger/mORS/blob/master/LICENSE). Provided "AS IS".
* The official text of the Oregon Revised Statutes is the [printed published copy](https://apps.oregon.gov/ecommerce/lcc?AspxAutoDetectCookieSupport=1). 
See further disclaimers on [ORS website](https://www.oregonlegislature.gov/bills_laws/Pages/ORS.aspx)

## Updates:

  ### Vesion 1.4.5 - 11/20/2021
   * Height of collapsed sections automatically resizes

  ### Version 1.4.4 - 11/19/2021
   * Page menu can be removed from options popup

  ### Version 1.4.0 - 11/17/2021
   * Omnibox works with 'mors'
   * Created simple data validation for form
   * Redid version numbering

  ### Version 1.3.0 - 11/15/2021
   * Updates to menu defaults:
      * hiding repealed sections
      * hide source notes
      * set default collapse all
   
  ### Version 1.2.0 - 11/11/2021
   * Added toggle button to show/hide source notes & repealed/renumbered sections

  ### Version 1.1 - 11/04/2021
  * Migrated to updated Chrome Manifest version 3
 
  ### Version 1.0 - 10/28/2021
  * Separates table of contents; sections; forms and notes into separetly styled divisions
  * Collapsable sections
  * Links to internal and external ORS sections
  * Links to source notes / session laws in Oregon Laws at HeinOnline (for state employees) or from Oregon legislature.
  * Identifies & tabs different subdivision units for subsections, paragraphs, subparagraphs, etc.
  * Links to preface
  * Dark and light modes
  
## Known bugs:
  * TODO: #28 Not identifying roman numerals if appearing with a paragraph & subparagraph (e.g. "(d)(A)(i)" or "(C)(i)(I)")
  * Stylesheets don't update/stay right on non-active page when changing Oregon Law source (can fix by refreshing page or "remove stylesheet" + "add stylesheet")

## Planned features/fixes: