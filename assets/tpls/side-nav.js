this["tpls"] = this["tpls"] || {};

this["tpls"]["side-nav"] = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (location, items) {
var currentPath = location.pathname
jade_mixins["side-nav"] = function(item, level){
var block = (this && this.block), attributes = (this && this.attributes) || {};
item.href = item.href || '#';
level++;
var liClass = (item.href == currentPath ? 'active' : '');
if ( item.name)
{
buf.push("<li" + (jade.cls([liClass], [true])) + "><a" + (jade.attr("href", item.href, true, false)) + ">");
if ( item.icon)
{
buf.push("<i" + (jade.cls(["fa " + item.icon], [true])) + "></i>");
}
buf.push("<span>" + (jade.escape(null == (jade_interp = item.name) ? "" : jade_interp)) + "</span>");
if ( item.children)
{
buf.push("<i class=\"fa arrow\"></i>");
}
buf.push("</a>");
if ( item.children)
{
buf.push("<ul" + (jade.attr("data-level", level, true, false)) + ">");
// iterate item.children
;(function(){
  var $$obj = item.children;
  if ('number' == typeof $$obj.length) {

    for (var index = 0, $$l = $$obj.length; index < $$l; index++) {
      var child = $$obj[index];

jade_mixins["side-nav"](child, level);
    }

  } else {
    var $$l = 0;
    for (var index in $$obj) {
      $$l++;      var child = $$obj[index];

jade_mixins["side-nav"](child, level);
    }

  }
}).call(this);

buf.push("</ul>");
}
buf.push("</li>");
}
};
buf.push("<!-- display menu toggle first--><li class=\"side-nav-header\"><a href=\"#\" id=\"side-nav-toggle\"><i class=\"fa fa-exchange\"></i></a><h4>Navigation</h4></li><!-- now loop over the items and call the mixin for each-->");
// iterate items
;(function(){
  var $$obj = items;
  if ('number' == typeof $$obj.length) {

    for (var index = 0, $$l = $$obj.length; index < $$l; index++) {
      var item = $$obj[index];

jade_mixins["side-nav"](item, 0);
    }

  } else {
    var $$l = 0;
    for (var index in $$obj) {
      $$l++;      var item = $$obj[index];

jade_mixins["side-nav"](item, 0);
    }

  }
}).call(this);
}.call(this,"location" in locals_for_with?locals_for_with.location:typeof location!=="undefined"?location:undefined,"items" in locals_for_with?locals_for_with.items:typeof items!=="undefined"?items:undefined));;return buf.join("");
};