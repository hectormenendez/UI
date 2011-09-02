/**
 * Merge two objects.
 * @created 2011/AUG/31 10:52
 */

(function($,undefined){
var ui = {};

ui.settings = {
	debug:true
};

ui.isset    = null;
ui.$body    = null;
ui.$overlay = null;
ui.$loader  = null;

/**
 * @author Hector Menendez <h@cun.mx>
 * @created 2011/SEP/01 09:02
 */
 ui.__construct = function(){
	// cache body element.
	ui.$body = $('body');
	// these cannot be set by the user.
	$('.ui-overlay,.ui-hider').remove();
	// overlay and hider must alway be the only direct siblings of body.
	ui.$body.prepend('<div class="ui-overlay"></div><div class="ui-loader"></div>');
	ui.$overlay = ui.$body.find('.ui-overlay');
	ui.$loader  = ui.$body.find('.ui-loader');
	// set baseurl
	$('script').each(function(){
		if (this.src.substr(-5)!='ui.js') return;
		var url = this.src.substr(0, this.src.length-5);
		//	Removed because location.origin is not defined in FF-
		//	TODO: use location href to detect cross domain.
		//	#	if (url.indexOf(location.origin) !== 0)
		//	#	ui.error('Cross-domain script loading is not supported');
		ui.settings.baseurl = url;
	});
	ui.isset = true;
};

/**
 * @author Hector Menendez <h@cun.mx>
 * @created 2011/SEP/01 08:33
 */
ui.loader      = {};
ui.loader.show = function(){
	ui.$overlay.show();
	ui.$loader.show();
};

/**
 * @author Hector Menendez <h@cun.mx>
 * @created 2011/SEP/01 13:55
 */
ui.loader.hide = function(){
	ui.$overlay.hide();
	ui.$loader.hide();
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
ui.init = function(settings, callback){
	// if ui has not been set, do so.
	if (!ui.isset) ui.__construct();
	// start loader
	ui.loader.show();
	// obtain ui-class name
	var $this = this;
	var cname = $this.attr('class');
	var pos;
	// extract valid ui-classname from class string.
	if ((pos = cname.indexOf('ui-')) == -1) return ui.error('Invalid ui-element');
	cname = cname.substring(pos+3);
	cname = cname.substring(0, cname.search(/\s|$/gm));
	// load script from remote file.
	$.ajax({
		type:'GET',
		url: ui.settings.baseurl+'js/ui.'+cname+'.js',
		cache:ui.settings.debug? false : true,  // you won't see your changes if caching's enabled.
		async:ui.settings.debug? true  : false, // errors won't be catched in syncronic mode.
		data: null,
		dataType:'script',
		beforeSend:function(x){
			// get around firefox 3 bug.
			if (x.overrideMimeType) x.overrideMimeType('text/plain');
		},
		success:function(response, status, data){
			if (ui.settings.debug) console.info(cname+': '+status,data);
			ui.loader.hide();
			// imported script succesfully
			// merge default settings with user's
			settings = $.extend({}, uiSource.settings, settings);
			// now  merge them with global settings-
			var sets = {};
			sets[cname] = settings;
			ui.extend(sets);
			// delete local settings, we must always use global's.
			delete uiSource.settings;
			// append/replace element to ui
			ui[cname] = uiSource;
			// construct element, with this scope.
			ui[cname].__construct($this, ui, callback);
			// public local methods to the jQuery element.
			$this[cname] = ui[cname];
			// delete constructor from public scope-
			delete $this[cname].__construct;
		},
		error:function(data){
			ui.loader.hide();
			ui.error('Script did not load correctly. ['+data.statusText+']');
		}
	});
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
			if (ui.settings[i] === undefined) ui.settings[i] = {};
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
	});
};

/**
 * Allow user to pass global settings.
 * @author Hector Menendez <h@cun.mx>
 * @created 2011/SEP/01 03:48
 */
ui.globalsettings = function(settings){
	if (typeof settings == 'object')
		for (var i in settings)
			if (settings.hasOwnProperty(i)) ui.settings[i] = settings[i];
	else if (settings !== undefined) return  ui.error('Settings are required.');
};

$.ui    = ui.globalsettings;
$.fn.ui = ui.init;

})(jQuery);

