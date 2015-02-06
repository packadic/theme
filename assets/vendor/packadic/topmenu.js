(function (factory) {
    factory(jQuery, _, window);
}(function ($, _, window) {
    'use strict';

    function defined(obj){
        return typeof obj !== 'undefined';
    }


    $.widget('packadic.topMenu', {
        version: '1.0.0',
        options: {

        },

        _create: function () {
            var $el = this.element;
        },
        _destroy: function () {
            this.element.off("." + this.widgetName);
            this.element.removeData(this.widgetName);
        },
        show: function () {
            this.element.show();
        },

        hide: function () {
            this.element.hide();
        },

        createFromJSON: function (json) {
            function createEl(tag) {
                return $(document.createElement(tag));
            }

            function loopItems(items, $parentUl, level) {
                $parentUl.attr('data-level', level);
                $.each(items, function (key, item) {
                    /*
                     <li class="active"><a href="index.html">Vertical Menu</a></li>
                     <li><a href="metisFolder.html">Folder View</a></li>
                     <li><a href="hover.html">Hover Option For Desktop</a></li>
                     <li><a href="zurb.html">Foundation | Zurb</a></li>
                     */
                    // LI
                    var $li = createEl('li');
                    if(defined(item.default) && item.default){
                        $li.addClass('active');
                    }


                    // A
                    var $a = createEl('a')
                        .attr('href', defined(item.href) ? item.href : '#')
                        .text(item.name);

                    $li.append($a);
                    $parentUl.append($li);

                    if(defined(item.children)){
                        var $ul = createEl('ul');
                        $li.append($ul);
                        loopItems(item.children, $ul, level + 1);
                    }
                });
            }
            this._destroy();
            this.element.html('');
            loopItems(json, this.element, 0);
            this._create();
        }
    });

}));
