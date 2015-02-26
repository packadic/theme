define(['jade'], function(jade) { if(jade && jade['runtime'] !== undefined) { jade = jade.runtime; }

return function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (Error, Math) {
function _getRandomId(length){
var text = ""
var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
for( var i=0; i < 15; i++ ) text += possible.charAt(Math.floor(Math.random() * possible.length));
return text;
}
function xinspect(o,i){
if(typeof i == 'undefined')i='';
if(i.length > 50)return '[MAX ITERATIONS]';
var r=[];
for(var p in o){
var t=typeof o[p];
r.push(i+'"'+p+'" ('+t+') => '+(t== 'object' ? 'object:' + xinspect(o[ p ], i + '  ') : o[ p ] + ''));
}
return r.join(i+'\n');
}
function capitalizeFirst(str) {
return str.substr(0, 1).toUpperCase() + str.substr(1);
}
buf.push("");
function _descriptionMeta(attributes) {
_addClassAttribute('horizontal', 'dl-horizontal', attributes)
}
function _headingMeta(attributes) {
_addClassAttribute('text-hide', 'text-hide', attributes)
}
function _itemMeta(attributes) {
_addClassAttribute('active', 'active', attributes)
}
function _listMeta(attributes) {
_addClassAttribute('inline', 'list-inline', attributes)
_addClassAttribute('unstyled', 'list-unstyled', attributes)
}
function _textAlignment(attributes) {
if (attributes.left) {
_addClassAttribute('left', 'text-left', attributes)
} else if (attributes.center) {
_addClassAttribute('center', 'text-center', attributes)
} else if (attributes.right) {
_addClassAttribute('right', 'text-right', attributes)
}
if (attributes.left || attributes.center || attributes.right) {
throw new Error('You can only choose one text alignment at a time.')
}
}
function _textCaret(attributes) {
_addClassAttribute('caret', 'caret', attributes)
}
function _textEmphasis(attributes) {
if (attributes.muted) {
_addClassAttribute('muted', 'text-muted', attributes)
} else if (attributes.primary) {
_addClassAttribute('primary', 'text-primary', attributes)
} else if (attributes.success) {
_addClassAttribute('success', 'text-success', attributes)
} else if (attributes.info) {
_addClassAttribute('info', 'text-info', attributes)
} else if (attributes.warning) {
_addClassAttribute('warning', 'text-warning', attributes)
} else if (attributes.danger) {
_addClassAttribute('danger', 'text-danger', attributes)
}
if (attributes.muted || attributes.primary || attributes.success || attributes.info || attributes.warning || attributes.danger) {
throw new Error('You can only choose one emphasis at a time.')
}
}
function _textPull(attributes) {
if (attributes['pull-left']) {
_addClassAttribute('pull-left', 'pull-left', attributes)
} else if (attributes['pull-right']) {
_addClassAttribute('pull-right', 'pull-right', attributes)
}
if (attributes['pull-left'] || attributes['pull-right']) {
throw new Error('You can only pull in one direction at a time.')
}
}
function _textScreenReaderOnly(attributes) {
_addClassAttribute('sr-only', 'sr-only', attributes)
}
function _textMeta(attributes) {
_textAlignment(attributes)
_textCaret(attributes)
_textEmphasis(attributes)
_textPull(attributes)
_textScreenReaderOnly(attributes)
_addClassAttribute('lead', 'lead', attributes)
}
jade_mixins["a"] = function(){
var block = (this && this.block), attributes = (this && this.attributes) || {};
_textMeta(attributes)
attributes.href = attributes.href || '#'
buf.push("<a" + (jade.attrs(jade.merge([attributes]), false)) + ">");
block && block();
buf.push("</a>");
};



























































































































































jade_mixins["p"] = function(){
var block = (this && this.block), attributes = (this && this.attributes) || {};
_textMeta(attributes)
buf.push("<p" + (jade.attrs(jade.merge([attributes]), false)) + ">");
block && block();
buf.push("</p>");
};




























buf.push("");











function _addClass(classes, attributes) {
attributes.class = (attributes.class === undefined) ? classes : attributes.class + ' ' + classes
}
function _addClassAttribute(name, classes, attributes) {
if (attributes[name]) {
_addClass(classes, attributes)
attributes[name] = null
}
}
function _unlessClassAttribute(name, classes, attributes) {
if (attributes[name]) {
attributes[name] = null
} else {
_addClass(classes, attributes)
}
}




















































jade_mixins["lia"] = function(){
var block = (this && this.block), attributes = (this && this.attributes) || {};
buf.push("<li>");
jade_mixins["a"].call({
block: function(){
block && block();
},
attributes: jade.merge([attributes])
});
buf.push("</li>");
};












































































































jade_mixins["box-body"] = function(scrollerHeight){
var block = (this && this.block), attributes = (this && this.attributes) || {};
scrollerHeight = scrollerHeight || false;
if ( scrollerHeight)
{
var style = 'max-height: ' + scrollerHeight + 'px;'
buf.push("<section" + (jade.attrs(jade.merge([{"data-mcs-axis": "y","style": jade.escape(jade.style(style)),"class": "scrollable"},attributes]), false)) + ">");
block && block();
buf.push("</section>");
}
else
{
buf.push("<section" + (jade.attrs(jade.merge([attributes]), false)) + ">");
block && block();
buf.push("</section>");
}
};

























































buf.push("<div id=\"debug-contextmenu\"><ul role=\"menu\" class=\"dropdown-menu\"><li><span class=\"title\">Debug</span></li>");
jade_mixins["lia"].call({
block: function(){
buf.push("Action");
},
attributes: {"tabindex": "-1","href": "javascript:;","data-debug-action": "action1"}
});
jade_mixins["lia"].call({
block: function(){
buf.push("Disable");
},
attributes: {"tabindex": "-1","href": "javascript:;","data-debug-action": "disable"}
});
buf.push("<li class=\"submenu\"><a tabindex=\"-1\" href=\"javascript:;\">Submenu</a><ul class=\"dropdown-menu\">");
jade_mixins["lia"].call({
block: function(){
buf.push("Hai");
}
});
jade_mixins["lia"].call({
block: function(){
buf.push("Bai");
}
});
buf.push("</ul></li></ul></div>");}.call(this,"Error" in locals_for_with?locals_for_with.Error:typeof Error!=="undefined"?Error:undefined,"Math" in locals_for_with?locals_for_with.Math:typeof Math!=="undefined"?Math:undefined));;return buf.join("");
}

});