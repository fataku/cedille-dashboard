/**
  * Sample config file, replace with own values and rename to config.js
  * the config.json file should contain the same key-value pairs if no in Dev mode.
  */

window.config = {
	"org_url": "orgs/github",
	"user": "example",
	"token": "[TOKEN]",
	"skip_empty_issues": true, // if true, will skip repos with 0 issues
	"skip_empty_repos": true, // if true, will skip repos which report size 0
	"skip_complete": true, // if true, will skip repos which have all issues closed.
}
