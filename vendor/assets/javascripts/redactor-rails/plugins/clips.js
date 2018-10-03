(function($) {
  $.Redactor.prototype.clips = function() {
    return {
      init: function() {
        var items = [],
              templates = undefined;
        if (this.opts.template_type == 'summary' && REDACTOR.params.clips.summary) {
          templates = REDACTOR.params.clips.summary;
        } else if (this.opts.template_type == 'summary_in_modal' && REDACTOR.params.clips.summary_in_modal) {
          templates = REDACTOR.params.clips.summary_in_modal;
        } else if (this.opts.template_type == 'article_in_modal' && REDACTOR.params.clips.article_in_modal) {
          templates = REDACTOR.params.clips.article_in_modal;
        } else if (this.opts.template_type == 'detail' && REDACTOR.params.clips.detail) {
          templates = REDACTOR.params.clips.detail;
        } else if (this.opts.template_type == 'article' && REDACTOR.params.clips.article) {
          templates = REDACTOR.params.clips.article;
        }
        if (templates !== undefined && templates.length > 0) {
          items = templates;
        }

        this.clips.template = $('<ul id="redactor-modal-list">');
        this.clips.template_extend = undefined;
        var modal_body_extend = undefined;

        if (items.length > 0) {
          modal_body_extend = "<label><input type='checkbox' name='auto_set_template'>" + this.lang.get('auto_set_template') + "</label>";
          this.clips.template_extend = $('<ul>');
          for (var i = 0; i < items.length; i++) {
            var li = $('<li>');
            var li2 = $('<li>');
            var a = $('<a href="#" class="redactor-clip-link">').text(items[i][0]);
            var div = $('<div class="redactor-clip">').hide().html(items[i][1]);
            var a2 = $('<a href="#">').text(items[i][0]);
            var input = $('<input type="hidden"/>').attr('name',"template_id_"+items[i][2]);
              input.val(items[i][2]);
            li.append(a);
            li.append(div);
            li2.append(a2);
            li2.append(input);
            this.clips.template.append(li);
            this.clips.template_extend.append(li2);
          }
        } else {
          var li = $('<li>'),
                span = $('<span>');
          span.text(this.lang.get('clip_no_template'));
          li.append(span)
          this.clips.template.append(li);
        }
        modal_body = this.utils.getOuterHtml(this.clips.template);

        if (items.length > 0) {
          modal_body = "<label><input type='checkbox' class='remove_all' style='margin-top: 10px'>" + this.lang.get('remove_all') + "</label>" + modal_body;
        }
        var template = "<section id='set_template_block'>" + modal_body + "</section>";
        if (modal_body_extend !== undefined && this.clips.template_extend !== undefined && (this.opts.template_type == 'summary' || this.opts.template_type == 'article' || this.opts.template_type == 'summary_in_modal' || this.opts.template_type == 'article_in_modal')) {
          modal_body_extend += this.utils.getOuterHtml(this.clips.template_extend);
          if (this.opts.template_type == 'summary' || this.opts.template_type == 'summary_in_modal') {
            template += "<header id='summary_auto_set_template'>" + this.lang.get('header_auto_set') + "</header>";
          } else {
            template += "<header id='article_auto_set_template'>" + this.lang.get('header_auto_set') + "</header>";
          }
          template += "<section id='auto_set_template_block'>" + modal_body_extend + "</section>";
        }
        this.modal.addTemplate('clips', template);

        var button = this.button.addBefore('fullscreen', 'clips', this.lang.get('clip_label'));
        this.button.addCallback(button, this.clips.show);

      },
      show: function() {
        this.modal.load('clips', this.lang.get('clip_insert'), 400);

        this.modal.createCancelButton();

        $('#redactor-modal-list').find('.redactor-clip-link').each($.proxy(this.clips.load, this));

        this.selection.save();
        this.modal.show();
      },
      load: function(i,s) {
        $(s).on('click', $.proxy(function(e) {
          e.preventDefault();
          this.clips.insert($(s).next().html());

        }, this));
      },
      insert: function(html) {
        var remove_all = $("#redactor-modal-body .remove_all").is(':checked');
        this.selection.restore();
        this.opts.isInsertTemplate = true;
        if (remove_all) {
          this.insert.set(html);
        } else {
          this.insert.html(html);
        }
        this.modal.close();
        this.opts.isInsertTemplate = false;
        this.observe.load();
      }
    };
  };
})(jQuery);

