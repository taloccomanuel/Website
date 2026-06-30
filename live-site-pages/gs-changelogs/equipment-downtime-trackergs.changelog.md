# Equipment Downtime Tracker — GAS Changelog

## v01.00g
- Initial release. Web app to log and monitor equipment downtime occurrences.
- `logDowntime`, `getDowntimes`, `updateDowntime` server functions backed by a Google Sheet.
- Email notification on each new downtime logged (`NOTIFY_EMAIL_TO`).
- Self-update via `doPost(action=deploy)` + `pullAndDeployFromGitHub`.
