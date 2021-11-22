(function($R)
{
    $R.add('plugin', 'templates', {
        modals: {
            'templates': ''
        },
        init: function(app)
        {
            this.app = app;
            this.opts = app.opts;
            this.lang = app.lang;
            this.toolbar = app.toolbar;
            this.insertion = app.insertion;
        },
        // messages
        onmodal: {
            templates: {
                open: function($modal)
                {
                    this._build($modal);
                }
            }
        },

        // public
        start: function()
        {
            if (!this.opts.templates) return;

            var data = {
                title: this.lang.get('templates'),
                api: 'plugin.templates.open'
            };

            var $button = this.toolbar.addButton('templates', data);
            $button.setIcon('<i class="re-icon-clips"></i>');
        },
        open: function(type)
        {
            var options = {
                title: this.lang.get('templates'),
                width: '600px',
                name: 'templates'
            };

            this.app.api('module.modal.build', options);
        },

        // private
        _build: function($modal)
        {
            var $body = $modal.getBody();
            var $section = this._buildSetTemplateBlock();

            $body.html('');
            $body.append($section);

            if (this.opts.auto_template)
            {
                var $auto_header = this._buildAutoSetTemplateHeader();
                var $auto_section = this._buildAutoSetTemplateBlock();
                $body.append($auto_header);
                $body.append($auto_section);
            }
        },
        _buildSetTemplateBlock: function()
        {
            var $section = $R.dom('<section>');
            var $label = this._buildLabel();
            var $list = this._buildList();

            this._buildItems($list);

            $section.attr('id', 'set_template_block');
            $section.append($label);
            $section.append($list);

            return $section;
        },
        _buildLabel: function()
        {
            var $label = $R.dom('<label>');
            $label.addClass('checkbox');
            $label.html("<input id='replace_content' type='checkbox'>" + this.lang.get('templates-replace-content') + "</label>");

            return $label;
        },
        _buildList: function()
        {
            var $list = $R.dom('<ul>');
            $list.attr('id', 'redactor-modal-list');

            return $list;
        },
        _buildItems: function($list)
        {
            var items = this.opts.templates;
            for (var i = 0; i < items.length; i++)
            {
                var $li = $R.dom('<li>');
                var $item = $R.dom('<a>');
                var $input = $R.dom('<input>');

                $item.attr('data-index', i);
                $item.html(items[i][0]);
                $item.on('click', this._insert.bind(this));

                $input.attr('type', 'hidden');
                $input.attr('name', 'template_id_' + items[i][2]);
                $input.val(items[i][2]);

                $li.append($item);
                $li.append($input);
                $list.append($li);
            }
        },
        _buildAutoSetTemplateBlock: function()
        {
            var $section = $R.dom('<section>');
            var $label = this._buildAutoSetTemplateLabel();
            var $list = this._buildList();

            this._buildItems($list);

            $section.attr('id', 'auto_set_template_block');
            $section.append($label);
            $section.append($list);

            return $section
        },
        _buildAutoSetTemplateHeader: function()
        {
            var $header = $R.dom('<header>');
            $header.attr('id', 'summary_auto_set_template');
            $header.html(this.lang.get('templates-auto-set-header'));

            return $header;
        },
        _buildAutoSetTemplateLabel: function()
        {
            var $label = $R.dom('<label>');
            var $input = $R.dom('<input>');

            $input.attr('type', 'checkbox');
            $input.attr('name', 'auto_set_template');

            $label.addClass('checkbox');
            $label.append($input);
            $label.append(this.lang.get('templates-auto-set'))

            return $label;
        },
        _insert: function(e)
        {
            var $item = $R.dom(e.target);
            var index = $item.attr('data-index');
            var html = this.opts.templates[index][1];

            this.app.api('module.modal.close');
            if ($R.dom("#replace_content:checked").length) {
                this.insertion.set(html);
            }
            else {
                this.insertion.insertHtml(html);
            }

        }
    });
})(Redactor);
