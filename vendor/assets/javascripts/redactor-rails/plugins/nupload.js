$.Redactor.prototype.nupload = function() {
  return {
    init: function(id, url, callback, attachmentType) {
      this.nupload.type = attachmentType;
      this.nupload.url = (this.nupload.type == 'image') ? this.opts.imageUpload : this.opts.fileUpload;
      this.nupload.direct = false;
      this.nupload.callback = callback;
      this.nupload.url = url;
      this.nupload.$el = $(id);
      this.nupload.$droparea = $('<div id="redactor-droparea" />');
      this.nupload.$placeholdler = $('<div id="redactor-droparea-placeholder" />').text(this.lang.get('upload_label'));

      // Add form for submit
      this.nupload.$form = $('<form/>');
      this.nupload.$form.attr('action', this.nupload.url)
        .attr('target', 'upload_iframe')
        .attr('method', 'POST')
        .attr('enctype', 'multipart/form-data')
        .attr('id', 'hform')
        .css({
          display: 'inline'
        });

      // Add other inputs
      this.nupload.$input = $('<input type="file" name="file" />');
      this.nupload.$editorInput = $('<input type="hidden" name="editor"/>').attr('value', 'redactor');
      this.nupload.$typeInput = $('<input type="hidden" name="attachment_type" />').attr('value', this.nupload.type);
      this.nupload.$typeInput = $('<input type="hidden" name="from" />').attr('value', 'iframe');
      this.nupload.$iframe = $('<iframe id="upload_iframe" name="upload_iframe" src="" style="display: none"></iframe>');

      // Append inputs to form
      this.nupload.$form.append(this.nupload.$input);
      this.nupload.$form.append(this.nupload.$typeInput);
      this.nupload.$form.append(this.nupload.$editorInput);
      this.nupload.$form.append(this.nupload.$iframe);

      this.nupload.$placeholdler.append(this.nupload.$form);
      this.nupload.$droparea.append(this.nupload.$placeholdler);
      this.nupload.$el.append(this.nupload.$droparea);

      this.nupload.$input.off('redactor.upload');

      // change
      this.nupload.$input.on('change.redactor.upload', $.proxy(function(e) {
        this.progress.show();
        if ($('#hform input[type="file"]').val().length == 0) {
          return;
        }
        $('#hform').submit();
        var parseJson = this.nupload.parseJson,
          processHide = this.progress.hide,
          callbackInsert = this.nupload.callback,
          direct = this.nupload.direct;
        $('#upload_iframe').on('load', function() {
          var response = frames['upload_iframe'].document.getElementsByTagName('body')[0].innerHTML,
            regex = new RegExp('{.*?}', 'gm'),
            data = response.match(regex);
          if (data.length > 0) {
            var json = parseJson(data[0].replace(/\\/g, ''));
            if (json == false) {
              json = {
                error: true
              };
            }
            callbackInsert(json, direct, e);
            processHide();
          }
        });
      }, this));
    },
    parseJson: function(jsonString) {
      try {
        var o = JSON.parse(jsonString);
        if (o && typeof o === 'object' && o !== null) {
          return o;
        }
      } catch (e) {}
      return false;
    }
  };
};
