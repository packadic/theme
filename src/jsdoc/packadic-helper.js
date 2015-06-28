var path = require('path');
var util = require('util');
var helper = require('jsdoc/util/templateHelper');

var hasOwnProp = Object.prototype.hasOwnProperty;

var _ = require('lodash'),
    jade_data = require('../../lib/jade-data'),
    jadeData = jade_data.getJadeData(),
    jade = require('jade');


var log = function () {
        _.toArray(arguments).forEach(function (vl) {
            process.stdout.write(util.inspect(vl, {hidden: true, depth: 5, colors: true}) + "\n")
        })
    },
    dd  = function () {
        log.apply(log, _.toArray(arguments));
        process.exit()
    };
var target = 'dev';
jadeData.target = jade_data.getyml('config.yml').target[target];


// Expand a config value recursively. Used for post-processing raw values
// already retrieved from the config.
var processData = function(raw) {
    return require('grunt').util.recurse(raw, function(value) {
        // If the value is not a string, return it.
        if (typeof value !== 'string') { return value; }
        return value.toString().replace(/<%=\starget\.nav\.pre\s%>/g, '').replace(/<%=\starget\.nav\.ext\s%>/g, '.html');
    });
};
jadeData.site.data.navigation = processData(jadeData.site.data.navigation);

var packadic = module.exports = {};

packadic.view = {};
packadic.opts = {};
packadic.members = {};
packadic.data = {};

function buildMemberNav(items, itemHeading, itemsSeen, linktoFn, nav){
    if(items.length){

        var children = [];
        items.forEach(function(item) {
            var methods = helper.find(packadic.data, {kind:'function', memberof: item.longname});
            var members = helper.find(packadic.data, {kind:'member', memberof: item.longname});
            var current = {
                name: item.name,
                href: ''
            };
            if ( !hasOwnProp.call(item, 'longname') ) {


            } else if ( !hasOwnProp.call(itemsSeen, item.longname) ) {
                current.href = helper.createLink(item);

                //itemsNav += '<li>' + linktoFn(item.longname, item.name.replace(/^module:/, ''));
                /*if (methods.length) {
                    methods.forEach(function (method) {
                        current.children.push({
                            name: method.name,
                            href: helper.createLink(method)
                        });
                    });
                }*/
                itemsSeen[item.longname] = true;
            }

            children.push(current);
        });
        nav.children.push({
            name: itemHeading,
            href: 'javascript:;',
            children: children
        });
    }

}

packadic.buildNav = function(members, linkto){
    var nav = {
        name: 'JS Api',
        children: [],
        href: 'javascript:;'
    };


    var seen = {};
    var seenTutorials = {};

    buildMemberNav(members.classes, 'Classes', seen, linkto, nav);
    buildMemberNav(members.modules, 'Modules', {}, linkto, nav);
    //nav += buildMemberNav(members.externals, 'Externals', seen, linktoExternal);
    //nav += buildMemberNav(members.events, 'Events', seen, linkto);
    buildMemberNav(members.namespaces, 'Namespaces', seen, linkto, nav);
    //nav += buildMemberNav(members.mixins, 'Mixins', seen, linkto);
    //nav += buildMemberNav(members.tutorials, 'Tutorials', seenTutorials, linktoTutorial);
    //nav += buildMemberNav(members.interfaces, 'Interfaces', seen, linkto);


    _.each(jadeData.site.data.navigation.sidebar, function(data, i){
        if(data.name === 'Documentation'){

            jadeData.site.data.navigation.sidebar[i].children.push(nav);
        }
    });

    jadeData.site_json = JSON.stringify(jadeData.site)
};

packadic.viewPath = path.join(__dirname, 'views');
packadic.template = function(fileName, data){
    data = data || {};
    var fn = jade.compileFile(path.join(packadic.viewPath, fileName), {
        pretty: true
    });
    var html = fn(_.merge(jadeData, {
        assetPath: '/assets'
    }, data));
    return html;
};
