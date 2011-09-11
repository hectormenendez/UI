var fn = {};

/**
 * @author Hector Menendez <h@cun.mx>
 * @created 2011/SEP/11 04:39
 */
fn.inset = function(){

	var self = this;

	// go up, until a background color is available.
	var i, tmp, bg = false;
	var parent = this.element;
	do {
		tmp = parent.css('background-color');
		if (tmp == 'transparent' || tmp == 'rgba(0, 0, 0, 0)') continue;
		bg = tmp.match(/\d+/g); // extract rgba, values.
		break;
	} while (
		(parent = parent.parent()) &&
		parent.get(0).tagName.toLowerCase() != 'html'
	);
	// throw error if a background-color was not available
	if (!bg) this.core.error('Background Color unavailable', 'inset');
	// generate colors based upon color found.
	var color = {
		base : bg.map(function(a){ return      parseInt(a*self.settings.base,10); }),
		high : bg.map(function(a){ return (a = parseInt(a*self.settings.high,10))>255? 255 : a; }),
		low  : bg.map(function(a){ return      parseInt(a*self.settings.low, 10); })
	};
	// convert each color array to its string counterpart.
	for (i  in color) color[i] = 'rgb(' + color[i].join(',') + ')';
	// apply css to each element.
	this.element.each(function(){
		var css;
		var $this = $(this);
		// fieldsets have different needs, they're "special".
		if (this.tagName.toLowerCase() == 'fieldset'){
			css = {
				'border-top'   : '1px solid ' + color.high,
				'border-left'  : '1px solid ' + color.high,
				'border-bottom': '1px solid ' + color.low,
				'border-right' : '1px solid ' + color.low,
				'box-shadow'   : color.low  + ' -1px -1px 0,' +
								 color.high + '  1px  1px 0 '
			};
			// apply colors to fieldsets if existent.
			// we have to darken text 5% more, for readibility.
			var dk = bg.map(function(a){
				return parseInt(a*self.settings.low - (a*0.05),10);
			});
			$this.find('> legend').css({
				'color'            : 'rgb(' + dk.join(',') + ')',
				'background-color' : 'rgb(' + bg.join(',') + ')',
				'text-shadow'      : '1px 1px ' + color.high
			});
		} else css = {
			'color'       : 'transparent',
			'text-shadow' :	color.base + ' 1px 1px 0,' +
							color.low  + ' 0px 0px 0,' +
							color.high + ' 2px 2px 0'
		};
		$this.css(css);
	});
	this.core.log('Enabled for "'+ this.element.text() + '".', 'inset');
};

fn.inset.prototype = {
	constructor:fn.inset,

	defaults:{
		high : 1.25, // highlights
		base : 0.90, // base color
		low  : 0.50  // shadows
	}
};
