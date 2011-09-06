/**
 * @author Hector Menendez <h@cun.mx>
 * @created 2011/SEP/04 20:08
 */
var uiSource = {

	core:null,
	$this:null,

	settings:{
		high: 1.25,
		base: 0.9,
		low : 0.5
	},

	/**
	 * @author Hector Menendez <h@cun.mx>
	 * @created 2011/SEP/04 20:08
	 */
	__construct:function($this, core, callback){
		this.$this = $this;
		this.core  = core;
		core.settings.debug = true;
		// findout the first background color up.
		var parent = $this;
		var bg, tmp;
		do {
			tmp = parent.css('background-color');
			if (tmp == 'transparent' || tmp == 'rgba(0, 0, 0, 0)') continue;
			bg = tmp.match(/\d+/g);
		} while(
			(parent = parent.parent()) &&
			parent.get(0).tagName.toLowerCase() != 'html'
		);
		if (!bg) core.error('Could not find a background color');
		// generate new colors.
		var color = {};
		color.base = bg.map(function(a){
			return  parseInt(a*core.settings.inset.base,10); }
		);
		color.high = bg.map(function(a){
			a = parseInt(a*core.settings.inset.high,10);
			return a>255? 255 : a;
		});
		color.low  = bg.map(function(a){
			return  parseInt(a*core.settings.inset.low,10);
		});
		for (var i in color) color[i] = 'rgb('+color[i].join(',')+')';
		// apply corresponding CSS to each element and return jQuery element.
		$this.each(function(){
			var css;
			var self = $(this);
			// fieldsets are treated differently
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
					return parseInt(a*core.settings.inset.low - (a*0.05),10);
				});
				self.find('> legend').css({
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
			$(this).css(css);
		});
		if (core.settings.debug) console.info('inset: constructed succesfully.', core.inset);
		return $this;
	}
};


/**


	border-radius:.5em;
	border-top:   1px solid rgba(255,255,255,0.75);
	border-left:  1px solid rgba(255,255,255,0.75);
	border-bottom:1px solid rgba(  0,  0,  0,0.25);
	border-right: 1px solid rgba(  0,  0,  0,0.25);
	box-shadow:
		rgba(  0,  0,  0,0.25) -1px -1px 0,
		rgba(255,255,255,0.75)  1px  1px 0
	;


**/
