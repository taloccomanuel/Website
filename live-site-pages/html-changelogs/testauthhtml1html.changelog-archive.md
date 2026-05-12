# Changelog Archive — testauthhtml1title

Older version sections rotated from [testauthhtml1html.changelog.md](testauthhtml1html.changelog.md). Full granularity preserved — entries are moved here verbatim when the main changelog exceeds 50 version sections.

## Rotation Logic

Same rotation logic as the repository changelog archive — see [CHANGELOG-archive.md](../../repository-information/CHANGELOG-archive.md) for the full procedure. In brief: count version sections, skip if ≤50, never rotate today's sections, rotate the oldest full date group together.

---

*(No archived sections yet)*

## [v01.18w] — 2026-04-09 05:49:13 PM EST — v10.51r — [SHA unavailable]

### Added
- Camera now auto-starts when permission is already granted — no need to tap "START CAMERA" each time
- Stop camera button (✖) to turn off the camera without leaving the page

## [v01.17w] — 2026-04-09 05:41:32 PM EST — v10.50r — [SHA unavailable]

### Added
- New "➕ Entry" button for adding items without scanning — opens the same entry form with all fields editable

## [v01.16w] — 2026-04-09 05:24:29 PM EST — v10.49r — [SHA unavailable]

### Changed
- Scanned item confirmation and add-row bar now auto-fill "Last Updated" with the current time and "Last User" with your email

## [v01.15w] — 2026-04-09 04:54:57 PM EST — v10.46r — [SHA unavailable]

### Fixed
- Scan confirmation dialog now appears correctly after scanning a barcode

## [v01.14w] — 2026-04-09 04:44:43 PM EST — v10.45r — [SHA unavailable]

### Changed
- Scanning now shows a confirmation screen before adding — review and edit item details, then confirm or cancel

## [v01.13w] — 2026-04-09 04:34:01 PM EST — v10.44r — [SHA unavailable]

### Removed
- Reverted scan dialog — scanning directly adds to the barcode input and clicks Add Row

## [v01.12w] — 2026-04-09 04:26:39 PM EST — v10.43r — [SHA unavailable]

### Changed
- Scanning a new barcode now prompts for item name and quantity before adding to the table
- Scanning an existing barcode shows current quantity and lets you add or remove stock
- Timestamp, last updated, and last user are automatically filled on all scan actions

## [v01.11w] — 2026-04-09 03:03:37 PM EST — v10.42r — [SHA unavailable]

### Fixed
- Clearer messaging when QR scanning is not available on the current device

## [v01.10w] — 2026-04-09 02:55:42 PM EST — v10.41r — [SHA unavailable]

### Added
- QR code and barcode camera scanner at the top of the data view — scanned codes automatically add rows
- Visual feedback on scan: flash effect and haptic vibration
- Torch/flashlight toggle for low-light scanning
- Graceful fallback message for unsupported browsers

## [v01.09w] — 2026-04-09 02:19:59 PM EST — v10.39r — [SHA unavailable]

### Changed
- Add row bar now shows 6 input fields matching the data columns

## [v01.08w] — 2026-04-09 01:58:03 PM EST — v10.38r — [SHA unavailable]

### Fixed
- Data now loads immediately after signing in instead of waiting 15 seconds

## [v01.07w] — 2026-04-09 01:38:06 PM EST — v10.37r — [SHA unavailable]

### Added
- GAS version indicator restored — shows current backend version with auto-refresh
- GAS changelog popup restored — tap the GAS version pill to view changes

## [v01.06w] — 2026-04-09 01:29:29 PM EST — v10.36r — [SHA unavailable]

### Fixed
- HTML layer toggle now hides and shows the live data table and dashboard

## [v01.05w] — 2026-04-09 01:13:55 PM EST — v10.35r — [SHA unavailable]

### Fixed
- Data now loads from the server — live table and dashboard populate correctly

## [v01.04w] — 2026-04-09 01:09:33 PM EST — v10.34r — [SHA unavailable]

### Fixed
- Data now loads correctly after signing in

## [v01.03w] — 2026-04-09 01:04:10 PM EST — v10.33r — [SHA unavailable]

### Fixed
- Application content now appears immediately after signing in

## [v01.02w] — 2026-04-09 12:50:45 PM EST — v10.32r — [SHA unavailable]

### Changed
- All application content now renders directly in the page instead of in a separate frame
- Data table and dashboard views load faster with direct rendering

### Removed
- Separate application frame overlay removed — the app runs natively in the page

## [v01.01w] — 2026-04-09 11:30:10 AM EST — v10.31r — [SHA unavailable]

### Changed
- Updated connection to use dedicated backend service

Developed by: ShadowAISolutions
