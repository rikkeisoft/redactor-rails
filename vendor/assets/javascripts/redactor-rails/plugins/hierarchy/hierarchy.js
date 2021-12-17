(function($R)
{
   $R.add('plugin', 'hierarchy', {
        init: function(app)
        {
            this.app = app;
            this.toolbar = app.toolbar;
            this.lang = app.lang;
            this.selection = app.selection;
            this.inspector = app.inspector;
        },
        start: function()
        {
            $button = this.toolbar.addButtonAfter('alignment', 'h_outdent', {
                title: this.lang.get('outdent'),
                api: 'plugin.hierarchy.outdent'
            });
            $button.setIcon('<i class="re-icon-outdent"></i>');

            $button = this.toolbar.addButtonAfter('h_outdent', 'h_indent', {
                title: this.lang.get('indent'),
                api: 'plugin.hierarchy.indent'
            });
            $button.setIcon('<i class="re-icon-indent"></i>');
        },
        indent: function()
        {
            this._move('indent');
        },
        outdent: function()
        {
            this._move('outdent');
        },
        _move: function(type)
        {
            var current = this.selection.getCurrent();
            var data = this.inspector.parse(current);
            var $wrapper

            if (data.isList())
            {
                this.app.api('module.list.' + type);
                return;
            }
            else if (data.isComponent())
            {
                var $figure = $R.dom(current);
                if (data.isComponentType('image'))
                {
                    $wrapper = $figure.find('a');
                }
                else
                {
                    $wrapper = $figure.find('iframe');
                }
            }
            else
            {
                var $text = $R.dom(current);
                $wrapper = $text.closest('p');
            }

            var oldMargin = $wrapper.css('margin-left').replace( /\D+/g, '');
            var newMargin
            if (type == 'indent')
            {
                newMargin = parseInt(oldMargin) + 20 + "px";
            }
            else
            {
                if (oldMargin == '0') return;
                newMargin = parseInt(oldMargin) - 20 + "px";
            }
            $wrapper.css('margin-left', newMargin);
        }
    });
})(Redactor);
