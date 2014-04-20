brackets-tslint
===================

A [Brackets](http://brackets.io/) extension that adds [TSLint](https://github.com/palantir/tslint) linter for typescript files.

##Configuration: 

> this extension use the brackets préférence system, see : https://github.com/adobe/brackets/wiki/How-to-Use-Brackets#preferences

This extensions provides 3 configuration :

* **enabled** : a `boolean` allowing to enable/disabled the linter, default: `true`. (to use this option add for example a `"tslint.enabled": false` section to your user/project configuration files)

* **config** : a `string` describing the location of the tslint configuration file, default: `tslint.json`. (to use this option add for example a `"tslint.config": myfile.json` section to your user/project configuration files)

* **rulesDirectory** : a `string` describing the location of the directoring containing custom tslint rules, default: `null` (to use this option add for example a `"tslint.rulesDirectory": myRulesDir` section to your user/project configuration files)

