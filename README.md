# mORS

Extension (Google Chrome/Firefox) that alters appearance of Oregon Revised Statutes on Oregon State Legisature website and allows for easier retrieval of Oregon session law. The Oregon Revised Statutes are the codified laws of the State of Oregon.

## Installation instructions (Chrome):
  * Navigate to https://github.com/rmauger/mORS
  * From green "Code" button > "Download Zip"
  * Unzip to a folder
  * Navigate to chrome://extensions/ (or ... > More Tools > Extensions)
  * "Load Unpacked"
  * Select folder

## Installation instructions (Firefox):
  * Navigate to https://github.com/rmauger/mORS
  * From green "Code" button > "Download Zip"
  * Unzip to a folder
  * Copy 2 files from /firefox/ to main folder & overwrite (manifest.json, backgroud.js)
  * Temporary installation (single session; removed when Firefox restarts):
    * Enter "about:debugging" in the URL bar
    * Click "This Firefox"
    * Click "Load Temporary Add-on"
    * Select any file in folder

## To use:
  * Navigate to [ORS website](https://www.oregonlegislature.gov/bills_laws/Pages/ORS.aspx) and select a chapter;
  * Enter chapter into extension popup; or
  * Type 'mors' in the Chrome Omnibox (search bar) then type:
    * An ORS chapter (e.g., '659A')
    * An ORS section ('174.020')
    * An Oregon Session Law ('2015 c.614')
  * Options window is available to customize colors (right click extension popup in Chrome) 

## Disclaimers:
* Chrome Manifest version 3
* [MIT License](https://github.com/rmauger/mORS/blob/master/LICENSE). Provided "AS IS".
* The official text of the Oregon Revised Statutes is the [printed published copy](https://apps.oregon.gov/ecommerce/lcc?AspxAutoDetectCookieSupport=1). 
See further disclaimers on [ORS website](https://www.oregonlegislature.gov/bills_laws/Pages/ORS.aspx)

## Updates:
  ### Version 1.4.11 - 1/4/2022
   * Coordinated differences between firefox & chrome versions to maximize overlap
   * Updated error & info logging
   * Debugged various issues
   
  ### Version 1.4.10 - 12/12/2021
   * Merged back Firefox branch so extension can work on Firefox or Chrome

  ### Version 1.4.9 - 12/01/2021
   * Custom css options page functional and stable, if not entirely complete

  ### Version 1.4.8 - 12/01/2021
   * Moved data into separate files
   * Built data reader
   * Custom css progress
     * Example ORS chapter drafted
     * Manipulating stylesheets not back to fully stable yet.

  ### Version 1.4.7 - 11/29/2021
   * Reorganized content scripts
   * removed css from background & css file injection to fix persistance issue
   * fixed roman numeral bug

  ### Version 1.4.6 - 11/26/2021
   * Bugfix - buttons are working again
   * use of css sheets reorganized to clean code

  ### Vesion 1.4.5 - 11/20/2021
   * Height of collapsed sections automatically resizes

  ### Version 1.4.4 - 11/19/2021
   * Page menu can be removed from options popup

  ### Versions 1.4.1 to 3:
   * Bugfixes & tweaks

  ### Version 1.4.0 - 11/17/2021
   * Omnibox works with 'mors'
   * Created simple data validation for form
   * Redid version numbering

  ### Version 1.3 - 11/15/2021
   * Updates to menu defaults:
      * hiding repealed sections
      * hide source notes
      * set default collapse all
   
  ### Version 1.2 - 11/11/2021
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

## Planned features/fixes:
  * TODO: #42 Version for MS Edge (should be easier than Firefox was)?
  * TODO: #40 Resolve handling of additional styles not yet on custom sheet.