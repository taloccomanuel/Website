# Changelog Archive — GAS Project Creator Page

Older version sections rotated from [gas-project-creatorhtml.changelog.md](gas-project-creatorhtml.changelog.md). Full granularity preserved — entries are moved here verbatim when the main changelog exceeds 50 version sections.

## [v01.69w] — 2026-04-07 05:02:49 PM EST — v09.67r — [SHA unavailable]

### Added
- Portal Icon and Portal Description fields in the project creator form

## [v01.68w] — 2026-04-07 11:22:39 AM EST — v09.63r — [SHA unavailable]

### Changed
- Master ACL, ACL Sheet Name, and ACL Column Name hidden when auth is disabled

## [v01.67w] — 2026-04-07 11:16:28 AM EST — v09.62r — [SHA unavailable]

### Fixed
- Master ACL Spreadsheet ID field now properly editable — typing no longer gets overwritten

## [v01.66w] — 2026-04-07 11:13:35 AM EST — v09.61r — [SHA unavailable]

### Fixed
- Master ACL Spreadsheet ID field now accepts input when toggle is unchecked

## [v01.65w] — 2026-04-07 11:08:00 AM EST — v09.60r — [SHA unavailable]

### Fixed
- ACL fields now enable when Master ACL Spreadsheet ID is set (manually or via toggle)

## [v01.64w] — 2026-04-07 11:03:22 AM EST — v09.59r — [SHA unavailable]

### Fixed
- Copy buttons no longer incorrectly show "needs: Environment Name" when Environment Name is filled

## [v01.63w] — 2026-04-07 11:01:26 AM EST — v09.58r — [SHA unavailable]

### Fixed
- ACL fields no longer show misleading "Enter Deployment ID first" message

## [v01.62w] — 2026-04-07 10:56:55 AM EST — v09.57r — [SHA unavailable]

### Fixed
- ACL fields now require Master ACL Spreadsheet ID before they can be edited
- Disabled ACL Column Name no longer misleadingly shows default value hint

## [v01.61w] — 2026-04-07 10:51:44 AM EST — v09.56r — [SHA unavailable]

### Fixed
- ACL and Master ACL fields now correctly reference Spreadsheet ID as their dependency

## [v01.60w] — 2026-04-07 10:45:04 AM EST — v09.55r — [SHA unavailable]

### Fixed
- Clear button no longer appears on fields that are auto-filled from another source

## [v01.59w] — 2026-04-07 10:40:56 AM EST — v09.54r — [SHA unavailable]

### Fixed
- Master ACL Spreadsheet ID field now editable when toggle is unchecked
- Disabled state shows hint about how to enable it

## [v01.58w] — 2026-04-07 10:35:23 AM EST — v09.53r — [SHA unavailable]

### Changed
- Master ACL Spreadsheet ID field disables with auto-fill instead of hiding when toggle is checked

## [v01.57w] — 2026-04-07 10:28:36 AM EST — v09.52r — [SHA unavailable]

### Changed
- Master ACL toggle moved under Spreadsheet ID with external ACL ID field for non-self ACL projects
- ACL Sheet Name and Column Name always visible

## [v01.56w] — 2026-04-07 10:12:59 AM EST — v09.51r — [SHA unavailable]

### Changed
- Master ACL toggle moved above Spreadsheet ID

## [v01.55w] — 2026-04-07 10:01:45 AM EST — v09.50r — [SHA unavailable]

### Changed
- Allowed Domains now prefills with "All" meaning any Google account can sign in

## [v01.54w] — 2026-04-07 09:55:58 AM EST — v09.49r — [SHA unavailable]

### Changed
- Master ACL toggle moved next to Spreadsheet ID — no separate ACL spreadsheet ID field
- ACL details appear inline when toggle is checked

## [v01.53w] — 2026-04-07 09:47:23 AM EST — v09.48r — [SHA unavailable]

### Changed
- Auth Preset and Allowed Domains moved under OAuth Client ID in the Authentication Settings section

## [v01.52w] — 2026-04-07 09:43:11 AM EST — v09.47r — [SHA unavailable]

### Changed
- OAuth Client ID now appears before Deployment ID and is required to enable it (when auth is checked)
- Master ACL section moved under Spreadsheet ID for logical grouping
- Auth settings box simplified to just Auth Preset and Allowed Domains

## [v01.51w] — 2026-04-07 08:47:47 AM EST — v09.46r — [SHA unavailable]

### Fixed
- Fields no longer stay disabled when a parent field is cleared and re-filled

## [v01.50w] — 2026-04-07 08:41:28 AM EST — v09.45r — [SHA unavailable]

### Changed
- Splash Logo URL now prefills with the default logo instead of being blank
- All three logo fields are now described as independent of each other

## [v01.49w] — 2026-04-07 08:34:10 AM EST — v09.44r — [SHA unavailable]

### Changed
- Environment Name field now requires Deployment ID to be filled before it can be edited

## [v01.48w] — 2026-04-07 08:26:38 AM EST — v09.43r — [SHA unavailable]

### Changed
- Logo configuration now has 3 separate fields: Developer Logo, Org Logo, and Splash Logo
- Splash Logo defaults to Developer Logo when left blank

## [v01.47w] — 2026-04-07 07:57:43 AM EST — v09.42r — [SHA unavailable]

### Removed
- Removed Sound File ID form field (was unused by any live feature)

## [v01.46w] — 2026-04-06 11:16:59 PM EST — v09.41r — [SHA unavailable]

### Changed
- Action buttons now show which fields are needed before they can be used
- Disabled buttons use the same red tint as other disabled elements

## [v01.45w] — 2026-04-06 11:11:14 PM EST — v09.40r — [SHA unavailable]

### Fixed
- Disabled dropdown and test button now match the red disabled tint of other fields

## [v01.44w] — 2026-04-06 11:06:44 PM EST — v09.39r — [SHA unavailable]

### Fixed
- Clearing a field now correctly shows the empty-field background tint

## [v01.43w] — 2026-04-06 11:03:59 PM EST — v09.38r — [SHA unavailable]

### Changed
- ACL Column Name label now indicates it defaults to Environment Name
- Clear buttons hidden on empty or disabled fields

## [v01.42w] — 2026-04-06 10:56:44 PM EST — v09.37r — [SHA unavailable]

### Fixed
- ACL Column Name now correctly shows the environment name as its default when enabled
- Empty ACL fields now show the correct background tint

## [v01.41w] — 2026-04-06 10:50:41 PM EST — v09.36r — [SHA unavailable]

### Changed
- Step 15 updated to generic trigger instructions
- Field background tints adjusted for better visibility

## [v01.40w] — 2026-04-06 10:46:49 PM EST — v09.35r — [SHA unavailable]

### Changed
- Adjusted background tint colors for better visibility and subtlety
- Disabled field placeholder text now visually indented with dashes

## [v01.39w] — 2026-04-06 10:41:18 PM EST — v09.34r — [SHA unavailable]

### Changed
- Disabled fields now show what prerequisite is needed instead of showing prefilled values
- Background tints lightened for better visibility

## [v01.38w] — 2026-04-06 10:36:51 PM EST — v09.33r — [SHA unavailable]

### Changed
- Empty fields now have a very subtle green background tint to indicate they're available
- Disabled fields now have a very subtle red background tint to indicate they're unavailable

## [v01.37w] — 2026-04-06 10:30:21 PM EST — v09.32r — [SHA unavailable]

### Fixed
- Master ACL toggle no longer leaves the project spreadsheet ID in the field after unchecking

## [v01.36w] — 2026-04-06 10:25:37 PM EST — v09.31r — [SHA unavailable]

### Changed
- Optional fields now describe their default behavior in the label
- Form fields disabled until their prerequisite required fields are filled

## [v01.35w] — 2026-04-06 10:16:16 PM EST — v09.30r — [SHA unavailable]

### Changed
- Form fields now show as disabled when their prerequisites are not met, rather than being hidden
- Sheet name field pre-filled with default value
- ACL fields become required when Master ACL is configured

## [v01.34w] — 2026-04-06 10:02:14 PM EST — v09.29r — [SHA unavailable]

### Changed
- ACL configuration fields now appear only when relevant
- Default security preset changed to HIPAA
- Default ACL sheet name updated to match existing projects
- Clearer labeling for page identification in ACL settings

## [v01.33w] — 2026-04-06 07:41:52 PM EST — v09.28r — [SHA unavailable]

### Added
- New option to copy the embedding page HTML with your project settings pre-filled
- GitHub Branch configuration field

### Changed
- Minor internal improvements

## [v01.32w] — 2026-04-06 07:14:03 PM EST — v09.27r — [SHA unavailable]

### Changed
- Minor internal improvements

## [v01.31w] — 2026-04-06 05:03:52 PM EST — v09.26r — [SHA unavailable]

### Changed
- Simplified project creation workflow

## [v01.30w] — 2026-04-05 06:17:39 PM EST — v08.91r — [SHA unavailable]

### Changed
- Minor internal improvements

## [v01.29w] — 2026-04-05 03:20:35 PM EST — v08.85r — [SHA unavailable]

### Changed
- Version indicator no longer overlaps with the browser scrollbar

## [v01.28w] — 2026-03-25 05:01:08 PM EST — v06.57r — [bc91241](https://github.com/PFCAssociates/pfcassociates/commit/bc91241c)

### Changed
- Setup instructions now include the permission needed for installable edit triggers

## [v01.27w] — 2026-03-25 12:04:52 PM EST — v06.49r — [109a380](https://github.com/PFCAssociates/pfcassociates/commit/109a380c)

### Fixed
- Copy Code.gs now includes spreadsheet ID for all project types, not just authenticated ones
- Copy Config now always includes spreadsheet ID in the generated setup command

## [v01.26w] — 2026-03-21 06:15:12 PM EST — v05.77r — [eefc841](https://github.com/PFCAssociates/pfcassociates/commit/eefc8413)

### Fixed
- GAS changelog popup title no longer shows pipe characters

## [v01.25w] — 2026-03-21 06:07:27 PM EST — v05.76r — [fea9002](https://github.com/PFCAssociates/pfcassociates/commit/fea90027)

### Changed
- GAS version polling now parses pipe-delimited format from gs.version.txt

## [v01.24w] — 2026-03-20 11:21:18 PM EST — v05.58r — [1a5cc35](https://github.com/PFCAssociates/pfcassociates/commit/1a5cc35a)

### Changed
- Auto-generation note now lists all three auto-managed properties when authentication is enabled

## [v01.23w] — 2026-03-20 11:17:21 PM EST — v05.57r — [24bd516](https://github.com/PFCAssociates/pfcassociates/commit/24bd5167)

### Changed
- Simplified setup steps — only the GitHub token needs manual entry now; other properties auto-generate on first deploy

## [v01.22w] — 2026-03-20 11:02:26 PM EST — v05.56r — [e56d019](https://github.com/PFCAssociates/pfcassociates/commit/e56d0197)

### Changed
- Removed manual secret generation tool — security keys now auto-generate on first deploy
- Updated property descriptions to indicate auto-generation

## [v01.21w] — 2026-03-20 10:34:16 AM EST — v05.23r — [da3dcbb](https://github.com/PFCAssociates/pfcassociates/commit/da3dcbb6)

### Changed
- "Include test/diagnostic features" checkbox moved to just above the Copy Code.gs button, after all configuration fields and auth settings

## [v01.20w] — 2026-03-20 10:28:46 AM EST — v05.22r — [02206a4](https://github.com/PFCAssociates/pfcassociates/commit/02206a49)

### Changed
- "Include Google Authentication" checkbox moved to the very top of the Setup & Configuration section, above all steps, since it affects which steps are visible

## [v01.19w] — 2026-03-20 10:22:10 AM EST — v05.21r — [028aae8](https://github.com/PFCAssociates/pfcassociates/commit/028aae8e)

### Changed
- "Include Google Authentication" checkbox moved to the top of the GAS Project Settings section for earlier visibility

## [v01.18w] — 2026-03-20 10:10:59 AM EST — v05.20r — [3289e08](https://github.com/PFCAssociates/pfcassociates/commit/3289e08f)

### Changed
- HMAC Secret generator moved up to the Script Properties setup step for easier access when setting properties
- HMAC_SECRET property hint updated to reference the generator directly below instead of Auth Settings

## [v01.17w] — 2026-03-20 10:03:45 AM EST — v05.19r — [df08918](https://github.com/PFCAssociates/pfcassociates/commit/df089185)

### Changed
- Each script property name now has its own individual copy button for one-click copying
- HMAC Secret field now includes a Copy button to easily copy the generated value

## [v01.16w] — 2026-03-20 09:55:14 AM EST — v05.18r — [b58f204](https://github.com/PFCAssociates/pfcassociates/commit/b58f2048)

### Added
- HMAC Secret field with one-click Generate button for creating random session integrity secrets
- Copy Property Names button in the Script Properties setup step for quick access to all required property names
- HMAC_SECRET listed in the Script Properties reference when authentication is enabled

## [v01.15w] — 2026-03-20 09:08:46 AM EST — v05.17r — [694bf05](https://github.com/PFCAssociates/pfcassociates/commit/694bf056)

### Added
- Master ACL selection option — new checkbox to designate this project's spreadsheet as the centralized access control sheet for all projects
- Master ACL Spreadsheet ID auto-fills from Spreadsheet ID when the option is checked
- Config output now includes the master ACL selection for automated project setup

## [v01.14w] — 2026-03-19 08:28:19 PM EST — v05.16r — [16d5313](https://github.com/PFCAssociates/pfcassociates/commit/16d53136)

### Added
- Content Security Policy — page now enforces strict resource loading rules for better protection
- Changelog content sanitization — changelog popups now strip potentially dangerous content before display

### Changed
- Audio initialization deferred until first interaction — eliminates browser autoplay warning on page load

## [v01.13w] — 2026-03-18 11:06:43 AM EST — v04.73r — [727b019](https://github.com/PFCAssociates/pfcassociates/commit/727b0193)

### Fixed
- Removed global GAS URL exposure — srcdoc trampoline replaced with direct iframe navigation
- Minor internal improvements

## [v01.12w] — 2026-03-14 08:59:29 PM EST — v03.54r — [aaa6be3](https://github.com/PFCAssociates/pfcassociates/commit/aaa6be3e)

### Changed
- Minor internal improvements

## [v01.11w] — 2026-03-14 08:53:11 PM EST — v03.53r — [f65899b](https://github.com/PFCAssociates/pfcassociates/commit/f65899bf)

### Added
- Added placeholder favicon — no more missing icon in browser tab

## [v01.10w] — 2026-03-13 08:14:29 PM EST — v02.92r — [6b7849a](https://github.com/PFCAssociates/pfcassociates/commit/6b7849ab)

### Fixed
- Version headers now appear in the GAS changelog popup with timestamps

## [v01.09w] — 2026-03-12 09:18:49 PM EST — v02.61r — [6b22248](https://github.com/PFCAssociates/pfcassociates/commit/6b222480)

### Added
- Master ACL Spreadsheet configuration fields in Authentication Settings — set a centralized spreadsheet ID, sheet name, and page identifier for access control

## [v01.08w] — 2026-03-12 11:21:23 AM EST — v02.31r — [adb47d6](https://github.com/PFCAssociates/pfcassociates/commit/adb47d68)

### Fixed
- Domain settings now correctly apply to all authentication presets
- Spreadsheet ID field no longer included in configuration when authentication is disabled

## [v01.07w] — 2026-03-12 10:25:57 AM EST — v02.30r — [6bd50e3](https://github.com/PFCAssociates/pfcassociates/commit/6bd50e38)

### Changed
- Added authentication configuration section with OAuth Client ID, preset selector, and domain restriction fields
- Auth-specific setup steps (consent screen, client ID creation) now appear when Google Authentication checkbox is enabled
- Copy Code.gs now injects auth preset and domain restriction settings into auth template code
- Copy Config for Claude now includes auth settings in the JSON output

## [v01.06w] — 2026-03-11 09:03:31 PM EST — v02.22r — [8a1139d](https://github.com/PFCAssociates/pfcassociates/commit/8a1139d8)

### Changed
- Template loading now uses all 4 GAS template variants based on both test and auth checkbox selections
- Config output includes test and auth settings for automated project setup

## [v01.05w] — 2026-03-11 08:06:00 PM EST — v02.21r — [e2c9e93](https://github.com/PFCAssociates/pfcassociates/commit/e2c9e933)

### Added
- New checkbox option for Google Authentication (placeholder for future integration)

## [v01.04w] — 2026-03-11 07:46:13 PM EST — v02.20r — [4b6d149](https://github.com/PFCAssociates/pfcassociates/commit/4b6d149f)

### Changed
- Template selection checkbox label updated to clarify test/diagnostic purpose

## [v01.03w] — 2026-03-11 07:38:27 PM EST — v02.19r — [6cb5e25](https://github.com/PFCAssociates/pfcassociates/commit/6cb5e258)

### Added
- Template selection checkbox — choose between minimal (version + auto-update only) or full-featured (sound, quotas, sheet embed, buttons) GAS template when copying Code.gs

## [v01.02w] — 2026-03-09 03:12:42 PM EST — v01.55r — [f4f86a9](https://github.com/PFCAssociates/pfcassociates/commit/f4f86a9b)

### Changed
- "Website Ready" splash screen changed to green, "Code Ready" splash changed to blue

## [v01.01w] — 2026-03-08 05:07:22 PM EST — v01.20r — [0dc4491](https://github.com/PFCAssociates/pfcassociates/commit/0dc44913)

### Changed
- Minor internal improvements

## Rotation Logic

Same rotation logic as the repository changelog archive — see [CHANGELOG-archive.md](../../repository-information/CHANGELOG-archive.md) for the full procedure. In brief: count version sections, skip if ≤50, never rotate today's sections, rotate the oldest full date group together.

---

Developed by: ShadowAISolutions
