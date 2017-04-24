(function($) {
  $.Redactor.prototype.imagemanager = function() {
    return {
      init: function() {
        if (!this.opts.imageManagerJson) return;
        this.imagemanager.page = 1;
        this.modal.addCallback('image', this.imagemanager.load);
        var that = this;
        $(document).on('click', '#image-paginator span', function(e){
          e.preventDefault();
          var link = $(this).find('a');
          if (link.length == 0) return;
          that.imagemanager.page = that.imagemanager.get_page($(link));
          if (!that.imagemanager.page) that.imagemanager.page = 1;
          that.imagemanager.draw_image_grid(that.imagemanager.page);
        });
        $(document).off('click', '#image-paginator a');
      },
      load: function() {
        var $modal = this.modal.getModal();
        this.modal.createTabber($modal);
        this.modal.addTab(1, this.lang.get('upload'), 'active');
        this.modal.addTab(2, this.lang.get('choose'));
        $('#redactor-modal-image-droparea').addClass('redactor-tab redactor-tab1');
        var $box = $('<div id="redactor-image-manager-box" style="height: 300px;" class="redactor-tab redactor-tab2">').hide();
        $modal.append($box);
        $('#redactor-image-manager-box').prepend("<div id='image-paginator'>");
        $('#redactor-image-manager-box').append("<div class='image-grid' style='overflow: auto;'>");
        this.imagemanager.draw_image_grid(this.imagemanager.page);
      },
      insert: function(e) {
        var img_str = '',
              original = $(e.target).attr('data-origin');

        if (original && REDACTOR.lightbox) {
          img_str += '<a href="' + $(e.target).attr('data-origin') + '" target="_blank">';
        }

        img_str += '<img src="' + $(e.target).attr('rel') + '" alt="' + $(e.target).attr('title') + '">';

        if (original && REDACTOR.lightbox) {
          img_str += '</a>';
        }

        this.nimage.insert(img_str);
      },
      draw_image_grid: function(page) {
        $('#redactor-image-manager-box .image-grid').html(this.imagemanager.loading_animation);
        $.ajax({
          dataType: 'json',
          cache: false,
          url: this.opts.imageManagerJson + '&page=' + page
        })
        .done($.proxy(function(json) {
            var data = json.data,
            pagination = json.pagination;
            $('#redactor-image-manager-box .image-grid').html('');
            this.imagemanager.draw_pagination(pagination);
            $.each(data, $.proxy(function(key, val) {
              var thumbtitle = '';
              if (typeof val.title !== 'undefined') thumbtitle = val.title;
              var img = $('<img />');
              img.attr('src', val.thumb)
              .attr('rel', val.image)
              .attr('title', thumbtitle)
              .attr('style', 'width: 100px; height: 75px; cursor: pointer;');
              if (val.lightbox) {
                img.attr('data-origin', val.origin);
              }

              $('#redactor-image-manager-box .image-grid').append(img);
              $(img).click($.proxy(this.imagemanager.insert, this));
            }, this));
          }, this))
        .fail($.proxy(function() {
          var error_ele = $("<span class='error'>");
          error_ele.text(this.lang.get('get_image_error'));
          $('#redactor-image-manager-box .image-grid').html(error_ele);
        }, this))
      },
      draw_pagination: function(pagination) {
        var pagination_ele = "#image-paginator";
        $(pagination_ele).html(pagination);
      },
      get_page: function(ele) {
        var ele_url = ele.attr('href');
        var url_variables = ele_url.split('&');
        for (var i = 0; i < url_variables.length; i++){
          var param_names = url_variables[i].split('=');
          if (param_names[0] == 'page') {
            return param_names[1];
          }
        }
      },
      loading_animation: function() {
        return '<div class="spinner"><div class="cube1"></div><div class="cube2"></div></div>';
      }
    };
  };
})(jQuery);
