$.Redactor.prototype.nimage = function() {
  return {
    init: function() {
      var button = this.button.addAfter('html', 'image', this.lang.get('image'));
      this.button.addCallback(button, this.nimage.show);
    },
    show: function() {
      this.modal.load('image', this.lang.get('image'), 700);

      if (this.utils.browser('msie') && this.utils.isLessIe10()) {
        this.nupload.init('#redactor-modal-image-droparea', this.opts.imageUpload, this.nimage.insertMultiImage, 'image');
      } else {
        this.upload.init('#redactor-modal-image-droparea', this.opts.imageUpload, this.nimage.insertMultiImage);
      }

      this.selection.save();
      this.modal.show();
    },
    showEdit: function($image) {
      var $link = $image.closest('a', this.$editor[0]);

      this.modal.load('imageEdit', this.lang.get('edit'), 705);

      this.modal.createCancelButton();
      this.nimage.buttonDelete = this.modal.createDeleteButton(this.lang.get('_delete'));
      this.nimage.buttonSave = this.modal.createActionButton(this.lang.get('save'));

      this.nimage.buttonDelete.on('click', $.proxy(function() {
        this.nimage.remove($image);
      }, this));

      this.nimage.buttonSave.on('click', $.proxy(function() {
        this.nimage.update($image);
      }, this));

      // hide link's tooltip
      $('.redactor-link-tooltip').remove();

      $('#redactor-image-title').val($image.attr('alt'));

      if (!this.opts.imageLink) {
        $('.redactor-image-link-option').hide();
      } else {
        var $redactorImageLink = $('#redactor-image-link');
        $redactorImageLink.attr('href', $image.attr('src'));
        if ($link.length !== 0) {
          $redactorImageLink.val($link.attr('href'));
          if ($link.attr('target') == '_blank') {
            $('#redactor-image-link-blank').prop('checked', true);
          }
        }
      }

      if (!this.opts.imagePosition) {
        $('.redactor-image-position-option').hide();
      } else {
        var floatValue = ($image.css('display') == 'block' && $image.css('float') == 'none') ? 'center' : $image.css('float');
        $('#redactor-image-align').val(floatValue);
      }

      this.modal.show();
      $('#redactor-image-title').focus();
    },
    setFloating: function($image) {
      var floating = $('#redactor-image-align').val();

      var imageFloat = '';
      var imageDisplay = '';
      var imageMargin = '';

      switch (floating) {
        case 'left':
          imageFloat = 'left';
          imageMargin = '0 ' + this.opts.imageFloatMargin + ' ' + this.opts.imageFloatMargin + ' 0';
          break;
        case 'right':
          imageFloat = 'right';
          imageMargin = '0 0 ' + this.opts.imageFloatMargin + ' ' + this.opts.imageFloatMargin;
          break;
        case 'center':
          imageDisplay = 'block';
          imageMargin = 'auto';
          break;
      }

      $image.css({
        float: imageFloat,
        display: imageDisplay,
        margin: imageMargin
      });
      $image.attr('rel', $image.attr('style'));
    },
    update: function($image) {
      this.nimage.hideResize();
      this.buffer.set();

      var $link = $image.closest('a', this.$editor[0]);

      var title = $('#redactor-image-title').val().replace(/(<([^>]+)>)/ig, '');
      $image.attr('alt', title);

      this.nimage.setFloating($image);

      // as link
      var link = $.trim($('#redactor-image-link').val());
      var link = link.replace(/(<([^>]+)>)/ig, '');
      if (link !== '') {
        // test url (add protocol)
        var pattern = '((xn--)?[a-z0-9]+(-[a-z0-9]+)*\\.)+[a-z]{2,}';
        var re = new RegExp('^(http|ftp|https)://' + pattern, 'i');
        var re2 = new RegExp('^' + pattern, 'i');

        if (link.search(re) == -1 && link.search(re2) === 0 && this.opts.linkProtocol) {
          link = this.opts.linkProtocol + '://' + link;
        }

        var target = ($('#redactor-image-link-blank').prop('checked')) ? true : false;

        if ($link.length === 0) {
          var a = $('<a href="' + link + '">' + this.utils.getOuterHtml($image) + '</a>');
          if (target) {
            a.attr('target', '_blank');
          }

          $image.replaceWith(a);
        } else {
          $link.attr('href', link);
          if (target) {
            $link.attr('target', '_blank');
          } else {
            $link.removeAttr('target');
          }
        }
      } else if ($link.length !== 0) {
        $link.replaceWith(this.utils.getOuterHtml($image));
      }

      this.modal.close();
      this.observe.images();
      this.code.sync();
    },
    setEditable: function($image) {
      if (this.opts.imageEditable) {
        $image.on('dragstart', $.proxy(this.nimage.onDrag, this));
      }

      var handler = $.proxy(function(e) {
        this.observe.image = $image;
        this.nimage.resizer = this.nimage.loadEditableControls($image);
        $(document).on('mousedown.redactor-image-resize-hide.' + this.uuid, $.proxy(this.nimage.hideResize, this));
        // resize
        if (!this.opts.imageResizable) {
          return;
        }
        this.nimage.resizer.on('mousedown.redactor touchstart.redactor', $.proxy(function(e) {
          this.nimage.setResizable(e, $image);
        }, this));
      }, this);

      $image.off('mousedown.redactor').on('mousedown.redactor', $.proxy(this.nimage.hideResize, this));
      $image.off('click.redactor touchstart.redactor').on('click.redactor touchstart.redactor', handler);
    },
    setResizable: function(e, $image) {
      e.preventDefault();
      this.nimage.resizeHandle = {
        x: e.pageX,
        y: e.pageY,
        el: $image,
        ratio: $image.width() / $image.height(),
        h: $image.height()
      };

      e = e.originalEvent || e;

      if (e.targetTouches) {
        this.nimage.resizeHandle.x = e.targetTouches[0].pageX;
        this.nimage.resizeHandle.y = e.targetTouches[0].pageY;
      }

      this.nimage.startResize();
    },
    startResize: function() {
      $(document).on('mousemove.redactor-image-resize touchmove.redactor-image-resize', $.proxy(this.nimage.moveResize, this));
      $(document).on('mouseup.redactor-image-resize touchend.redactor-image-resize', $.proxy(this.nimage.stopResize, this));
    },
    moveResize: function(e) {
      e.preventDefault();

      e = e.originalEvent || e;

      var height = this.nimage.resizeHandle.h;

      if (e.targetTouches) {
        height += (e.targetTouches[0].pageY - this.nimage.resizeHandle.y);
      } else {
        height += (e.pageY - this.nimage.resizeHandle.y);
      }

      var width = Math.round(height * this.nimage.resizeHandle.ratio);

      if (height < 50 || width < 100) {
        return;
      }

      var height = Math.round(this.nimage.resizeHandle.el.width() / this.nimage.resizeHandle.ratio);

      this.nimage.resizeHandle.el.attr({
        width: width,
        height: height
      });
      this.nimage.resizeHandle.el.width(width);
      this.nimage.resizeHandle.el.height(height);

      this.code.sync();
    },
    stopResize: function() {
      this.handle = false;
      $(document).off('.redactor-image-resize');

      this.nimage.hideResize();
    },
    onDrag: function(e) {
      if (this.$editor.find('#redactor-image-box').length !== 0) {
        e.preventDefault();
        return false;
      }

      this.$editor.on('drop.redactor-image-inside-drop', $.proxy(function() {
        setTimeout($.proxy(this.nimage.onDrop, this), 1);
      }, this));
    },
    onDrop: function() {
      this.nimage.fixImageSourceAfterDrop();
      this.observe.images();
      this.$editor.off('drop.redactor-image-inside-drop');
      this.clean.clearUnverified();
      this.code.sync();
    },
    fixImageSourceAfterDrop: function() {
      this.$editor.find('img[data-save-url]').each(function() {
        var $el = $(this);
        $el.attr('src', $el.attr('data-save-url'));
        $el.removeAttr('data-save-url');
      });
    },
    hideResize: function(e) {
      if (e && $(e.target).closest('#redactor-image-box', this.$editor[0]).length !== 0) {
        return;
      }
      if (e && e.target.tagName == 'IMG') {
        var $image = $(e.target);
        $image.attr('data-save-url', $image.attr('src'));
      }

      var imageBox = this.$editor.find('#redactor-image-box');
      if (imageBox.length === 0) {
        return;
      }

      $('#redactor-image-editter').remove();
      $('#redactor-image-resizer').remove();

      imageBox.find('img').css({
        marginTop: imageBox[0].style.marginTop,
        marginBottom: imageBox[0].style.marginBottom,
        marginLeft: imageBox[0].style.marginLeft,
        marginRight: imageBox[0].style.marginRight
      });

      imageBox.css('margin', '');
      imageBox.find('img').css('opacity', '');
      imageBox.replaceWith(function() {
        return $(this).contents();
      });

      $(document).off('mousedown.redactor-image-resize-hide.' + this.uuid);

      if (typeof this.nimage.resizeHandle !== 'undefined') {
        this.nimage.resizeHandle.el.attr('rel', this.nimage.resizeHandle.el.attr('style'));
      }

      this.code.sync();
    },
    loadResizableControls: function($image, imageBox) {
      if (this.opts.imageResizable && !this.utils.isMobile()) {
        var imageResizer = $('<span id="redactor-image-resizer" data-redactor="verified"></span>');

        if (!this.utils.isDesktop()) {
          imageResizer.css({
            width: '15px',
            height: '15px'
          });
        }

        imageResizer.attr('contenteditable', false);
        imageBox.append(imageResizer);
        imageBox.append($image);

        return imageResizer;
      } else {
        imageBox.append($image);
        return false;
      }
    },
    loadEditableControls: function($image) {
      var imageBox = $('<span id="redactor-image-box" data-redactor="verified">');
      imageBox.css('float', $image.css('float')).attr('contenteditable', false);

      if ($image[0].style.margin != 'auto') {
        imageBox.css({
          marginTop: $image[0].style.marginTop,
          marginBottom: $image[0].style.marginBottom,
          marginLeft: $image[0].style.marginLeft,
          marginRight: $image[0].style.marginRight
        });

        $image.css('margin', '');
      } else {
        imageBox.css({
          display: 'block',
          margin: 'auto'
        });
      }

      $image.after(imageBox.css('opacity', '.5'));

      if (this.opts.imageEditable) {
        // editter
        this.nimage.editter = $('<span id="redactor-image-editter" data-redactor="verified">' + this.lang.get('edit') + '</span>');
        this.nimage.editter.attr('contenteditable', false);
        this.nimage.editter.on('click', $.proxy(function() {
          this.nimage.showEdit($image);
        }, this));

        imageBox.append(this.nimage.editter);

        // position correction
        var editerWidth = this.nimage.editter.innerWidth();
        this.nimage.editter.css('margin-left', '-' + editerWidth / 2 + 'px');
      }

      return this.nimage.loadResizableControls($image, imageBox);

    },
    remove: function(image) {
      var $image = $(image);
      var $link = $image.closest('a', this.$editor[0]);
      var $figure = $image.closest('figure', this.$editor[0]);
      var $parent = $image.parent();
      if ($('#redactor-image-box').length !== 0) {
        $parent = $('#redactor-image-box').parent();
      }

      var $next;
      if ($figure.length !== 0) {
        $next = $figure.next();
        $figure.remove();
      } else if ($link.length !== 0) {
        $parent = $link.parent();
        $link.remove();
      } else {
        $image.remove();
      }

      $('#redactor-image-box').remove();

      if ($figure.length !== 0) {
        this.caret.setStart($next);
      } else {
        this.caret.setStart($parent);
      }

      // delete callback
      this.core.setCallback('imageDelete', $image[0].src, $image);

      this.modal.close();
      this.code.sync();
    },
    insert: function(json, direct, e) {
      // error callback
      if (typeof json.error != 'undefined') {
        this.modal.close();
        this.selection.restore();
        this.core.setCallback('imageUploadError', json);
        return;
      }

      var $img;
      if (typeof json == 'string') {
        $img = $(json).attr('data-redactor-inserted-image', 'true');
      } else {
        $img = $('<img>');
        $img.attr('src', json.filelink).attr('data-redactor-inserted-image', 'true').attr('alt', json.filename);

        if (REDACTOR.lightbox && json.lightbox) {
          $imgWrapper = $('<a>');
          $imgWrapper.attr('href', json.original).attr('title', json.filename).addClass('image-lightbox');
          $img = $imgWrapper.append($img);
        }
      }

      var node = $img;
      var isP = this.utils.isCurrentOrParent('P');

      if (direct) {
        this.selection.removeMarkers();
        var marker = this.selection.getMarker();
        this.insert.nodeToCaretPositionFromPoint(e, marker);
      } else {
        this.modal.close();
      }

      this.selection.restore();
      this.buffer.set();

      this.insert.html(this.utils.getOuterHtml(node), false);

      var $image = this.$editor.find('img[data-redactor-inserted-image=true]').removeAttr('data-redactor-inserted-image');

      if (this.opts.linebreaks) {
        if (!this.utils.isEmpty(this.code.get())) {
          $image.before('<br>');
        }
        $image.after('<br>');
      }

      if (typeof json == 'string') {
        return;
      }
      this.core.setCallback('imageUpload', $image, json);
    },
    insertMultiImage: function(json, direct, e) {
      // error callback
      if (typeof json.error != 'undefined') {
        this.modal.close();
        this.selection.restore();
        this.core.setCallback('imageUploadError', json);
        return;
      }

      var $img;
      if (typeof json == 'string') {
        $img = $(json).attr('data-redactor-inserted-image', 'true');
      } else {
        $.each( json, $.proxy(function( key, value ) {
          var $img_el;
          $img_el = $('<img>');
          $img_el.attr('src', value.filelink).attr('data-redactor-inserted-image', 'true').attr('alt', value.filename);

          if (REDACTOR.lightbox && value.lightbox) {
            $imgWrapper = $('<a>');
            $imgWrapper.attr('href', value.original).attr('title', value.filename).addClass('image-lightbox');
            $img_el = $imgWrapper.append($img_el);
            if ($img)
            {
              $img = $img.add($('<br>'));
              $img = $img.add($img_el);
            }
            else
            {
              $img = $img_el
            }
          }
        }, this));
      }

      var node = $img;
      var isP = this.utils.isCurrentOrParent('P');

      if (direct) {
        this.selection.removeMarkers();
        var marker = this.selection.getMarker();
        this.insert.nodeToCaretPositionFromPoint(e, marker);
      } else {
        this.modal.close();
      }

      this.selection.restore();
      this.buffer.set();

      var $html = $('<div>');
      for (var i = 0; i < node.length; i++) {
        $html.append(node.eq(i).eq(0).clone());
      }
      this.insert.html($html.html(), false);

      var $image = this.$editor.find('img[data-redactor-inserted-image=true]').removeAttr('data-redactor-inserted-image');

      if (this.opts.linebreaks) {
        if (!this.utils.isEmpty(this.code.get())) {
          $image.before('<br>');
        }
        $image.after('<br>');
      }

      if (typeof json == 'string') {
        return;
      }
      this.core.setCallback('imageUpload', $image, json);
    }
  };
};
