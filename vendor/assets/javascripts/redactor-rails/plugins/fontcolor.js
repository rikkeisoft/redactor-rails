(function($)
{
	$.Redactor.prototype.fontcolor = function()
	{
		return {
			init: function()
			{
				var colors = [
					'#800000', '#808000', '#008000', '#008080', '#000080', '#800080', '#7F7F7F', '#808080',
                    '#804000', '#408000', '#008040', '#004080', '#400080', '#800040', '#666666', '#999999',
                    '#FF0000', '#FFFF00', '#00FF00', '#00FFFF', '#0000FF', '#FF00FF', '#4C4C4C', '#B3B3B3',
                    '#FF8000', '#80FF00', '#00FF80', '#0080FF', '#8000FF', '#FF0080', '#333333', '#CCCCCC',
                    '#FF6666', '#FFFF66', '#66FF66', '#66FFFF', '#6666FF', '#FF66FF', '#191919', '#E6E6E6',
                    '#FFCC66', '#CCFF66', '#66FFCC', '#66CCFF', '#CC66FF', '#FF6FCF', '#FFFFFF', '#000000'
				];

				var name = 'fontcolor';

				var button = this.button.addAfter('deleted', name, this.lang.get(name));
				var $dropdown = this.button.addDropdown(button);

				$dropdown.width(176);
				this.fontcolor.buildPicker($dropdown, name, colors);

			},
			buildPicker: function($dropdown, name, colors)
			{
				var rule = (name == 'backcolor') ? 'background-color' : 'color';

				var len = colors.length;
				var self = this;
				var func = function(e)
				{
					e.preventDefault();
					self.fontcolor.set($(this).data('rule'), $(this).attr('rel'));
				};

				for (var z = 0; z < len; z++)
				{
					var color = colors[z];

					var $swatch = $('<a rel="' + color + '" data-rule="' + rule +'" href="#" style="float: left; font-size: 0; border: 2px solid #fff; padding: 0; margin: 0; width: 22px; height: 22px;"></a>');
					$swatch.css('background-color', color);
					$swatch.on('click', func);

					$dropdown.append($swatch);
				}

				var $elNone = $('<a href="#" style="display: block; clear: both; padding: 5px; font-size: 12px; line-height: 1;"></a>').html(this.lang.get('none'));
				$elNone.on('click', $.proxy(function(e)
				{
					e.preventDefault();
					this.fontcolor.remove(rule);

				}, this));

				$dropdown.append($elNone);
			},
			set: function(rule, type)
			{
				this.inline.format('span', 'style', rule + ': ' + type + ';');
			},
			remove: function(rule)
			{
				this.inline.removeStyleRule(rule);
			}
		};
	};
})(jQuery);
