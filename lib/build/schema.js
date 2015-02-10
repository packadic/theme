var schemaGlobalConfig = {
    type      : 'object', required: true,
    properties: {
        minify: {
            type      : 'object', required: true,
            properties: {
                html  : {type: 'boolean', required: true},
                js    : {type: 'boolean', required: true},
                css   : {type: 'boolean', required: true},
                images: {type: 'boolean', required: true}
            }
        },
        url   : {type: 'string', required: true},
        host  : {
            type      : 'object', required: true,
            properties: {
                name    : {type: 'string', required: true},
                port    : {type: 'number', required: true},
                protocol: {type: 'string', required: true}
            }
        }
    }

};

module.exports = function( schemas ){
    schemas.global = schemas.global || schemaGlobalConfig;
    return {
        "$schema": "http://json-schema.org/draft-04/schema#",
        definitions: schemas,
        type      : 'object', required: true,
        properties: {
            jsbuild : {
                required  : true, type: 'object',
                properties: {
                    jquery   : {type: "array", items: "string", uniqueItems: true},
                    jqueryui : {},
                    bootstrap: {}
                }
            },
            builders: {
                type             : 'object', required: true,
                patternProperties: {
                    minProperties: 1,
                    '^(\w*)$': {
                        properties: {
                            builder: {
                                type: 'string', required: true, "enum": [
                                    'dev', 'jekyll', 'github-pages-user', 'github-pages-project'
                                ]
                            },
                            dest   : {type: 'string', required: true},
                            config : {
                                type      : 'object', required: true,
                                properties: {
                                    builder: schemas.builder,
                                    global : { "$ref": "#/definitions/global"}
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};
