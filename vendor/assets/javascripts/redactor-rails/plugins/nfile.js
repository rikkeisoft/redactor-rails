$.Redactor.prototype.nfile = function() {
  return {
    init: function() {
      var button = this.button.addAfter('image', 'file', this.lang.get('file'));
      this.button.addCallback(button, this.nfile.show);
    },
    show: function() {
      this.modal.load('file', this.lang.get('file'), 700);

      if (this.utils.browser('msie') && this.utils.isLessIe10()) {
        this.nupload.init('#redactor-modal-file-upload', this.opts.fileUpload, this.nfile.insert, 'file');
      } else {
        this.upload.init('#redactor-modal-file-upload', this.opts.fileUpload, this.nfile.insert);
      }
      this.selection.save();
      this.selection.get();
      var text = this.sel.toString();
      $('#redactor-filename').val(text);
      this.modal.show();
    },
    insert: function(json, direct, e) {
      // error callback
      if (typeof json.error != 'undefined') {
        this.modal.close();
        this.selection.restore();
        this.core.setCallback('fileUploadError', json);
        return;
      }

      var link;
      if (typeof json == 'string') {
        link = json;
      } else {
        var text = $('#redactor-filename').val();
        if (typeof text == 'undefined' || text === '') {
          text = json.filename;
        }
        if (json.is_pdf == true) {
          link = '<a href="#" id="ndsn_pdf_veiwer_' + json.id + '" >' + text + '</a>'
        } else if (json.use_ms_viewer == true) {
          link = '<a href="' + json.filelink + '" id="filelink-marker" target="_blank">' + text + '</a>';
          var url = json.content_url;
          var preview = '<div id="upload_file_preview_box">' +
            '<iframe src="https://view.officeapps.live.com/op/embed.aspx?' +
            'src='+ url +'" ' +
            'width="180px" height="180px" id="preview_'+ json.id +'">' +
            '</iframe>' +
            '</div>';
          var content = this.$editor.get(0).parentNode.parentNode;
          if ($(content).next().prop('id') == 'upload_file_preview_box') {
            $(content).next().replaceWith($(preview))
          } else {
            $(preview).insertAfter(content);
          }
        } else {
          link = '<a href="' + json.filelink + '" id="filelink-marker" target="_blank">' + text + '</a>';
        }
      }

      if (direct) {
        this.selection.removeMarkers();
        var marker = this.selection.getMarker();
        this.insert.nodeToCaretPositionFromPoint(e, marker);
      } else {
        this.modal.close();
      }

      this.selection.restore();
      this.buffer.set();
      this.insert.htmlWithoutClean(link);

      if (typeof json == 'string') {
        return;
      }

      var linkmarker = $(this.$editor.find('a#filelink-marker'));
      if (linkmarker.length !== 0) {
        linkmarker.removeAttr('id').removeAttr('style');
      } else {
        linkmarker = false;
      }
      this.core.setCallback('fileUpload', linkmarker, json);
    }
  };
};
