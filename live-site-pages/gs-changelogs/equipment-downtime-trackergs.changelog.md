# Equipment Downtime Tracker — GAS Changelog

## v01.00g
- Initial release. Web app to log and monitor equipment downtime occurrences.
- `logDowntime`, `getDowntimes`, `updateDowntime` server functions backed by a Google Sheet.
- Email notification on each new downtime logged (`NOTIFY_EMAIL_TO`).
- Self-update via `doPost(action=deploy)` + `pullAndDeployFromGitHub`.

## v01.01g
- Match column headers exactly to the supplied sheet (Equipment/Item, "...Occurrence", etc.).
- Remove the separate Resolved column; resolution is now derived from the
  "Replaced and In Use (Issue Resolved)" date being filled in. Form and update
  modal updated accordingly (no resolved checkbox).
