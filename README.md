## manifest-generator
`manifest.json` generator/updater for Caali's tera-proxy auto-update feature. Updates sha256 hash for all files in directory and all subdirectories.
### Instructions
Edit `manifest-generator.js` to: 
* Force unix line endings (default: true)
* Remove old/unfound manifest defs (default: true)
* Only add highest/newest found version of def to manifest (default: false)
* Add `"disableAutoUpdate": false` to module.json (default: true)
* and more

Use one of the following methods to create/update your module's `manifest.json`.
#### Drag-n'-Drop Method
Highlight and drag your module's folder (or folders for updating multiple modules) onto `manifest-generator.bat` to "Open with `manifest-generator.bat`"
#### Copy-Paste Method
Copy-paste `manifest-generator.js` into your module's folder and run it to create/update `manifest.json` file hashes.

For this method, `manifest-generator.bat` is an optional launcher in case you cannot set manifest-generator.js to "Open with node.exe"
### Requirements
[Node](https://nodejs.org) v8 or newer
