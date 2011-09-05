/**
 * @author Hector Menendez <h@cun.mx>
 * @created 2011/SEP/04 20:08
 */
var uiSource = {

	core:null,
	$this:null,

	settings:{
		high: 1.5,
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
		$this.css({
			'color'       : 'transparent',
			'text-shadow' :
				color.base + ' 1px 1px 0,' +
				color.low  + ' 0px 0px 0,' +
				color.high + ' 2px 2px 0'
		});
		// don't break the chain,
		return $this;
	}
};
