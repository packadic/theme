var validator = require('is-my-json-valid'),
    fse = require('fs-extra'),
    fs = require('fs'),
    _ = require('lodash'),
    path = require('path');

function getSchemas(builders){
    builders = builders || [];
    var schemas = {};
    builders.forEach(function(builder){
        if( _.isString(builder.path)){
            schemas[builder.name] = fse.readJSONFileSync(path.resolve(builder.path, 'config-schema.json'));
        } else {
            schemas[builder.name] = fse.readJSONFileSync(path.resolve(__dirname, builder.name, 'config-schema.json'));
        }

    });
    return schemas;
}

module.exports = function(builders){
    var validate;
    var schemas = getSchemas(builders);
    var schema = require('./schema')(schemas);
    return validate = validator(schema);
};
