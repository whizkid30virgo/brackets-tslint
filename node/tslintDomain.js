/*jshint node:true*/
'use strict';

var Linter = require('tslint');

function scanFile(fileName, fileContent, config, customRulesFolder) {
    var result;
    try {
         var ll = new Linter(fileName, fileContent, {
            formatter: 'json',
            configuration : JSON.parse(config),
            rulesDirectory: customRulesFolder,
        });
        result = JSON.stringify(ll.lint());
    } catch(e) {
        result = '{}';
    }
    return result;
}


function init(domainManager ) {
    if (!domainManager.hasDomain('tslint')) {
        domainManager.registerDomain('tslint', {major: 0, minor: 1});
    }
    domainManager.registerCommand(
        'tslint', 
        'scanFile', 
        scanFile, 
        false, 
        'Scan a typescript files and return linting erros',
        [{
            name: 'fileName', 
            type: 'string',
            description: 'the linted file name'
        },{
            name: 'fileContent', 
            type: 'string',
            description: 'the linted file content'
        }, {
            name: 'config', 
            type: 'string',
            description: 'the config file content'
        }, {
            name: 'customRulesFolder', 
            type: 'string',
            description: 'the custom rules folder path'
        }],
        [{
            name: 'returnsValues', 
            type: 'string',
            description: 'the linting result in json form'
        }]
    );
}
    
exports.init = init;