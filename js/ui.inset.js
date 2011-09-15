var fn = {};

/**
 * @author Hector Menendez <h@cun.mx>
 * @licence http://etor.mx/licence.txt
 * @created 2011/SEP/11 04:39
 */
fn.inset = function(){

	var self = this;

	// go up, until a background color is available.
	var i, tmp;
	var bg = this.core.findbg(this.element);
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
	var tag = this.element.get(0).nodeName.toLowerCase();
	this.core.log((this.constructed? 'Updated' : 'Constructed') + ' "'+ tag + '".', 'inset');
	if (!this.constructed) this.constructed = true;
};

fn.inset.prototype = {
	constructor:fn.inset,
	constructed:false,

	defaults:{
		high : 1.15, // highlights
		base : 0.90, // base color
		low  : 0.65  // shadows
	},

	update:fn.inset  // this will be automatically called when the plugin
	                 // targets an element that's already been constructed.
};
