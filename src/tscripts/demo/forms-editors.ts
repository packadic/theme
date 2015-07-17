///<reference path="../types.d.ts"/>
/// <amd-dependency path="plugins/bs-wysiwyg">
/// <amd-dependency path="plugins/bs-markdown-editor">
/// <amd-dependency path="plugins/summernote-codemirror">
/// <amd-dependency path="ace-build/ace">
/// <amd-dependency path="code-mirror!htmlmixed:monokai">

import $ = require('jquery');
import packadic = require('packadic');
import {defined,def,cre} from 'app/util';

import marked = require('plugins/marked');
import HJS = require('plugins/highlightjs');
import MediumEditor = require('plugins/medium-editor');

class FormsEditorsDemo {
    private app:packadic.App;

    constructor(app:packadic.App) {
        this.app = app;
    }

    public init() {
        $(function () {
            this.initWysiwygEditor();
            this.initMarkdownEditor();
            this.initSummernote();
            this.initMediumEditor();
        }.bind(this));
    }

    protected initMediumEditor(){
        var editor:any = new MediumEditor('#demo-medium-editor');
    }

    protected initWysiwygEditor() {
        $('#editor_1').wysiwyg();
    }

    protected initSummernote() {
        var isSupportAmd:any = $.summernote.core.agent.isSupportAmd;
        $.summernote.core.agent.isSupportAmd = false;

        $.summernote.core.agent.hasCodeMirror = true;
        $('#demo-summernote').summernote({
            height: 200,
            fontNamesIgnoreCheck: $.summernote.options.fontNames
        });
        $.summernote.core.agent.isSupportAmd = isSupportAmd;

    }

    protected initMarkdownEditor() {
        var $editor:JQuery = $('#demo-bs-md-editor');
        $editor.text(this.getMarkdownText());
        $editor.markdownEditor({
            // enable preview, use marked to convert the markdown to HTML,
            // then find <code class="lang-*"> tags and use highlightJS to syntax highlight it
            preview: true,
            onPreview: function (content:string, callback:Function) {
                var markdownContent = marked(content);
                var jqHTMLContent = $(markdownContent)
                jqHTMLContent.find('code').each(function () {
                    var that:HTMLElement = this;
                    var $el:JQuery = $(this);

                    // check if tagged with language, uses class lang-*
                    // @todo: use jquery selector for this job or check multiline and highlightAuto ?
                    var classes:DOMTokenList = $el[0].classList;
                    var lang:string = null;
                    $.each(classes, function (i, className) {
                        if (className.indexOf("lang-") !== -1) {
                            lang = className.replace('lang-', '');
                        }
                    });
                    if (lang === null) return; // @todo: fix

                    var highlighted:string = null;
                    if (lang !== null && HJS.listLanguages().indexOf(lang) !== -1) {
                        highlighted = HJS.highlight(lang, that.textContent).value;
                    } else {
                        highlighted = HJS.highlightAuto(that.textContent).value;
                    }
                    $el.html(highlighted);
                });

                callback($('<div>').append(jqHTMLContent).html());
            }
        });


        // get the ace editor, to apply some other settings that arent configurable with the markdownEditor jq plugin
        var aceEdit = ace.edit($editor.find('.md-editor').get(0));
        aceEdit.setOptions({
            fontFamily: "Source Code Pro",
            fontSize: '12px'
        });
    }


    protected getMarkdownText() {
        return [
            '# Header Level 1',
            '**Pellentesque habitant morbi tristique** senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. _Aenean ultricies mi vitae est_. Mauris placerat eleifend leo. Quisque sit amet est et sapien ullamcorper pharetra. Vestibulum erat wisi, condimentum sed, `commodo vitae`, ornare sit amet, wisi. Aenean fermentum, elit eget tincidunt condimentum, eros ipsum  rutrum orci, sagittis tempus lacus enim ac dui. [Donec non enim](#) in turpis pulvinar facilisis. Ut felis.',
            '',
            '## Header Level 2',
            '1. Lorem ipsum dolor sit amet, consectetuer adipiscing elit.',
            '2. Aliquam tincidunt mauris eu risus.',
            '> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus magna. Cras in mi at felis aliquet congue. Ut a est eget ligula molestie gravida. Curabitur  massa. Donec eleifend, libero at sagittis mollis, tellus est malesuada tellus, at luctus turpis elit sit amet quam. Vivamus pretium ornare est.',
            '',
            '### Header Level 3',
            '* Lorem ipsum dolor sit amet, consectetuer adipiscing elit.',
            '* Aliquam tincidunt mauris eu risus.',
            '',
            '```',
            '#header h1 a {',
            '   display: block;',
            '   width: 300px;',
            '   height: 80px;',
            '}',
            '```',
            '',
            'And some PHP aswell:',
            '```php',
            'public function addNamespace($id, $dirName) {',
            '   $location = $this->getPath("namespaces").',
            '   "/".$dirName;',
            '   $this->app->view->addLocation($location);',
            '   $this->app->view->addNamespace($id, $location);',
            '}',
            'public function getPath($type) {',
            '   return $this->paths[$type];',
            '}',
            '```'
        ].join('\n');
    }
}
export = FormsEditorsDemo;
