/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, brackets, $ */

define(function (require, exports, module) {
    'use strict';
    
    var AppInit = brackets.getModule('utils/AppInit'),
        PreferencesManager = brackets.getModule('preferences/PreferencesManager'),
        FileSystem = brackets.getModule('filesystem/FileSystem'),
        ExtensionUtils = brackets.getModule('utils/ExtensionUtils'),
        ProjectManager = brackets.getModule('project/ProjectManager'),
        CodeInspection = brackets.getModule('language/CodeInspection'),
        NodeDomain     = brackets.getModule("utils/NodeDomain");
    

    var tslintDomain = new NodeDomain('tslint', ExtensionUtils.getModulePath(module, 'node/tslintDomain')),
        tslintPreferences = PreferencesManager.getExtensionPrefs('tslint');

    tslintPreferences.definePreference('enabled', 'boolean', true);
    tslintPreferences.definePreference('config', 'string', null);
    tslintPreferences.definePreference('rulesDirectory', 'string', null);

    function getConfigFile() {
        var configFile = tslintPreferences.get('config') || 'tslint.json',
            projectRootEntry = ProjectManager.getProjectRoot(),
            deferred = $.Deferred();



        FileSystem.getFileForPath(projectRootEntry.fullPath +  configFile)
            .read({}, function (err, content)  {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(content);
                }
            });

        return deferred.promise();
    }


    var TSLintErrorReporter =  {
        name: 'TSLint',
        scanFileAsync: function (content, path) {
            var deferred = $.Deferred(),
                projectRootEntry = ProjectManager.getProjectRoot(),
                rulesDirectory = tslintPreferences.get('rulesDirectory');
            
            rulesDirectory = rulesDirectory ? projectRootEntry.fullPath + rulesDirectory: null;
            

            function handleFailure(e) {
                if (e) {
                    console.error('Error during tslint linting: ' + e);
                }
                deferred.resolve({
                    aborted: !!e,
                    errors: []
                });
            }
            if (tslintPreferences.get('enabled') === false) {
                handleFailure();
            }
            else {
                getConfigFile().then(function (config) {

                    tslintDomain.exec("scanFile", path, content, config, rulesDirectory).done(function (result) {
                        var failures;
                        try {
                            result = JSON.parse(result);
                            failures = JSON.parse(result.output);
                        } catch(e) {
                            handleFailure(e);
                            return;
                        }

                        failures = failures ? failures.slice(0, 50) : [];
                        deferred.resolve({
                            aborted: result.failureCount > 50,
                            errors : failures.map(function (failure) {
                                return {
                                    message: failure.failure,
                                    type : CodeInspection.Type.ERROR,
                                    pos: {
                                        line: failure.startPosition.line,
                                        ch: failure.startPosition.character
                                    },
                                    endPos: {
                                        line: failure.endPosition.line,
                                        ch: failure.endPosition.character
                                    }
                                };
                            })
                        });
                    }).fail(handleFailure);
                }).fail(function () {
                    deferred.reject('Could not find tslint configuration file');
                });
            }

            return deferred.promise();
        }
    };

    CodeInspection.register('typescript', TSLintErrorReporter);
});