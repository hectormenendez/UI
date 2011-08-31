/**
 * Merge two objects.
 * @created 2011/AUG/31 10:52
 */

(function($,undefined){

var ui = {};

ui.settings = {
	debug:false
};

/**
 * Redirect all calls to widget counterparts according to classname.
 *
 * @param opt object settings   widget-specific settings.
 * @param opt object     core   global settings.
 *
 * @working 2011/AUG/31 04:57
 * @created 2011/AUG/31 04:15
 */
ui.init = function(settings, core){
	// if core settings are sent, merge'em.
	if (typeof core == 'object')
		for (var i in core) if (core.hasOwnProperty(i)) ui.settings[i] = core[i];
	var c, pos;
	// obtain ui-class first.
	c = this.attr('class');
	if ((pos=c.indexOf('ui-')) == -1)
		return ui.error('Provide valid ui-object');
	c = c.substring(pos+3);
	c = c.substring(0,c.search(/\s|$/gm));
	// extend settings with class-specific [if available]
	var sets = new Object;
	sets[c] = settings;
	if (!ui.extend(sets)) return this;
	// update settings.
	ui[c].settings = ui.settings[c];
	// construct, instance and return.
	ui[c].__construct(this);
	var $this  = this;
	$this[c] = ui[c];
	delete $this[c].__construct;
	return $this;
};

/**
 * Allow the user to  define class-specific settings.
 * @created 2011/AUG/31 04:25
 */
ui.extend = function(settings){
	for (var i in settings) {
		if (settings[i] !== undefined && typeof settings[i] != 'object')
			return ui.error('Settings object is expected.');
		// if nothing set, don't trigger errors.
		else if (settings[i] === undefined) return true;
		// extend core settings
		for (var j in settings[i]){
			if (ui.settings[i] === undefined) ui.settings[i] = new Object;
			ui.settings[i][j] = settings[i][j];
		}
		return ui.settings[i];
	}
};

/**
 * Throws error to console, depending on ui.settings.debug
 * @working 2011/AUG/31 04:20
 * @created 2011/AUG/31 04:11
 */
ui.error = function(msg){
	if (!ui.settings.debug || console === undefined) return false;
	console.error('ui: '+msg);
};

ui.children = function(parent){
	allow = ' button fieldset input label legend select textarea ';
	parent.find('*').each(function(){
		var node = this.nodeName.toLowerCase();
		if (allow.indexOf(' '+node+' ') == -1) return;
		$(this).addClass('ui-'+node);
	})
}

/**
 * Modal Dialog.
 *
 * Requirements: .ui-overlay as direct child of body.
 **/
 
ui.modal = {

	// set defaults.
	settings:ui.extend({modal:{
		auto  : false,
		speed : 0,  // 0=instant, int=miliseconds 'slow','fast','normal'
	}}),

	$overlay:null,
	$element:null,

	/**
	 * Construct modal.
	 */
	__construct:function(element){
		ui.modal.$element = element;
		if (!ui.modal.$overlay) ui.modal.$overlay = $('.ui-overlay');
		if (!ui.modal.$overlay.length) return ui.error('An .ui-overlay element is required.');
		if (!ui.modal.$overlay.length>1) return ui.error('Only one .ui-overlay element is needed');
		ui.modal.hide();
		// begin processing.
		// contens should be inside a section elememt
		var html = element.html();
		var $s = element.html('').append('<section>'+html+'</section');
		// add ui-classes to children.
		ui.children($s);
		// obtain title. {TODO} what happens if it doesn't exist?
		var t = element.attr('title');
		// filter out subnmit or reset buttons, if existent they will replace ours.
		var $b = element.find('input[type="submit"],input[type="reset"]').remove();
		// Create footer and header
		var $h = $('<header></header>').prependTo(element).append('<h2>'+t+'<h2>');
		var $f = $('<footer></footer>').appendTo(element).append($b);
		if (ui.settings.modal.auto) ui.modal.show();
	},

	hide:function(){
		this.$overlay.hide();
		this.$element.hide();
		return this.$element
	},

	/**
	 * Show Modal.
	 */
	show:function(){
		var $o = this.$overlay;
		var $e = this.$element;
		// get opacity for overlay from css.
		var o = $o.css('opacity');
		$e.css('opacity',0).show().animate({opacity:1},this.settings.speed);
		$o.css('opacity',0).show().animate({opacity:o},this.settings.speed);
		// center on screen
		$e.css({
			marginLeft : -1*($e.width() /2),
			marginTop  : -1*($e.height()/2)
		});
		return $e;
	}
};

$.fn.ui = ui.init;

})(jQuery)

