define(['jade'], function(jade) { if(jade && jade['runtime'] !== undefined) { jade = jade.runtime; }

return function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (items, location, undefined) {
var currentPath = location.pathname
jade_mixins["sidebar-item"] = function(item, top_index, level){
var block = (this && this.block), attributes = (this && this.attributes) || {};
item.href = item.href || 'javascript:;';
level++;
var liClass = (item.href == currentPath ? 'active' : '');
liClass = (top_index == 0 ? liClass + ' start' : liClass)
buf.push("<li" + (jade.cls([liClass], [true])) + "><a" + (jade.attr("href", item.href, true, false)) + (jade.cls([(item.icon ? '' : 'no-icon')], [true])) + ">");
if ( item.icon)
{
buf.push("<i" + (jade.cls([item.icon], [true])) + "></i>");
}
if ( item.children)
{
buf.push("<span class=\"title\">" + (jade.escape(null == (jade_interp = item.name) ? "" : jade_interp)) + "</span><span class=\"arrow\"></span>");
}
else
{
buf.push("<span class=\"title\">" + (jade.escape(null == (jade_interp = item.name) ? "" : jade_interp)) + "</span>");
}
buf.push("</a>");
if ( item.children)
{
buf.push("<ul" + (jade.attr("data-level", level, true, false)) + " class=\"sub-menu\">");
// iterate item.children
;(function(){
  var $$obj = item.children;
  if ('number' == typeof $$obj.length) {

    for (var index = 0, $$l = $$obj.length; index < $$l; index++) {
      var child = $$obj[index];

jade_mixins["sidebar-item"](child, level);
    }

  } else {
    var $$l = 0;
    for (var index in $$obj) {
      $$l++;      var child = $$obj[index];

jade_mixins["sidebar-item"](child, level);
    }

  }
}).call(this);

buf.push("</ul>");
}
buf.push("</li>");
};
buf.push("<!-- display menu toggle first--><li class=\"sidebar-toggler-wrapper hide\"><div class=\"sidebar-toggler\"></div></li><!-- now loop over the items and call the mixin for each-->");
// iterate items
;(function(){
  var $$obj = items;
  if ('number' == typeof $$obj.length) {

    for (var index = 0, $$l = $$obj.length; index < $$l; index++) {
      var item = $$obj[index];

jade_mixins["sidebar-item"](item, index, 0);
    }

  } else {
    var $$l = 0;
    for (var index in $$obj) {
      $$l++;      var item = $$obj[index];

jade_mixins["sidebar-item"](item, index, 0);
    }

  }
}).call(this);
}.call(this,"items" in locals_for_with?locals_for_with.items:typeof items!=="undefined"?items:undefined,"location" in locals_for_with?locals_for_with.location:typeof location!=="undefined"?location:undefined,"undefined" in locals_for_with?locals_for_with.undefined:typeof undefined!=="undefined"?undefined:undefined));;return buf.join("");
}

});