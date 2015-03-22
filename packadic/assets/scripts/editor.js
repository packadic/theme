
//show-hint.css
require([ 'jquery', 'config', 'code-mirror!php|htmlmixed:twilight',
       //   'cm/edit/matchbrackets',
         // 'cm/edit/closebrackets',
         // 'cm/edit/matchtags',
          //'cm/hint/anyword-hint', 'cm/hint/css-hint', 'cm/hint/html-hint', 'cm/hint/javascript-hint',
          //'cm/hint/show-hint', 'cm/hint/sql-hint', 'cm/hint/xml-hint',
        //  'cm/fold/indent-fold',
          //'cm/scroll/simplescrollbars'
], function( $, config, CodeMirror ){

    var editors = window.packadic.editors = {};
    var log = console.log;
    editors.create = function( selector ){
        var $el = $(selector);
        var id = $el.attr('id');
        logDebug('EDITOR');
    };

    editors.get = function( id ){

    };

    editors.checkForNew = function( selector ){
        selector = selector || '.code-editor';
        var $el = $(selector);
        //editors $el.attr('id')
    };

    editors.create('.code-editor');
    var editor = CodeMirror.fromTextArea(document.getElementById("code"), {
        lineNumbers   : true,
        mode          : "htmlmixed",
        theme         : "twilight",
        indentUnit    : 4,
        tabSize       : 4,
        indentWithTabs: true,
    });
    editor.setValue($('#top').html());
    editor.setSize('100%', $(window).height() - 300)
    window.editor = editor;
    return editors;
})
