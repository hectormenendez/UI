/**
 * @author Hector Menendez <h@cun.mx>
 *
 * @bug     2011/SEP/09 04:34   Chrome doesn't allow loading local scripts
 *                              in offline mode.
 *
 * @updated 2011/SEP/10 17:30   Complete Rewrite.
 * @created 2011/AUG/31 04:10
 */
(function($,undefined){

//  Benchmark
var BMK = new Date();
    BMK = BMK.getTime();

/**
 * Constructor
 * @author Hector Menendez <h@cun.mx>
 * @created 2011/SEP/01 09:02
 */
var ui = function(name, element, settings, callback){

	var self = this;

	/**
	 * Actual instacing, merging an calling.
	 * This is called last.
	 * @author Hector Menendez <h@cun.mx>
	 * @created 2011/SEP/09 08:34
	 */
	var run  = function(fn){
		// merge user-sent settings with defaults;
		settings = $.extend(true, {}, fn.prototype.defaults, settings);
		// pass on, core prototype.
		var instance = fn;
		instance.prototype.core = ui.core;
		instance.prototype.settings = settings;
		instance.prototype.element  = element;
		instance = new instance(element, settings);
		self.log('Constructed.',name);
		// enable callback, preserving scope.
		if (typeof callback == 'function') {
			callback.call(instance);
			self.log('Calledback.', name);
		}
	};

	/**
	 * Load plugin if not yet available.
	 * This is called second.
	 * @author Hector Menendez <h@cun.mx>
	 * @created 2011/SEP/09 08:34
	 */
	var init = function(){
		// no need to reload if plugin is already loaded.
		if (self.fn[name] !== undefined) return run(self.fn[name]);
		// is it even a valid plugin?
		if (!self.isplugin(name)) return;
		self.loader.show();
		self.load(name);
		if (
			typeof fn            != 'object'   ||
			typeof fn[name]      != 'function' ||
			(
				typeof fn[name].settings != 'undefined' &&
				typeof fn[name].settings != 'object'
			)
		) self.error('Bad plugin declaration.', name);
		// merge to core.
		ui.core.fn[name] = fn[name];
		self.log('Loaded.',name);
		self.loader.hide();
		run(fn[name]);
	};

	/**
	 * Base Construction
	 */
	if (ui.core.enabled) return init();
	// these cannot be set by the user.
	$('.ui-overlay, .ui-hider, .ui-tooltip').remove();
	// obtain the base url where this file is located
	$('script').each(function(){
		var pos;
		if ((pos = this.src.indexOf('/ui.js')) === -1) return;
		ui.core.baseurl = this.src.substr(0, pos+1);
		self.log('Setting '+ ui.core.baseurl + ' as baseurl.');
	});
	// Cache Common jQuery elements (and show the loader).
	ui.core.$body    = $('body');
	ui.core.$overlay = $('<div class="ui-overlay">').prependTo(ui.core.$body).show();
	ui.core.$loader  = $('<div class="ui-loader">').prependTo(ui.core.$body).show();
	ui.core.$tooltip = $('<div class="ui-tooltip">').prependTo(ui.core.$body);
	// obtain overlay base opacity
	ui.core.$overlay.opacity = ui.core.$overlay.css('opacity');
	// load base components
	if (!self.isplugin('base')) self.error('Base missing.');
	self.load('base');
	// instantiate'em
	for (var f in fn){
		fn[f].prototype.core = ui.core;
		ui.core[f] = new fn[f]();
	}
	ui.core.enabled = true;
	self.loader.hide();
	self.log('Loaded.', 'base');
	init();
};
// shorthand.
ui.core = ui.prototype = {
	constructor:ui,

	fn:{},

	defaults:{
		debug : false
	},

	enabled:false,

	/**
	 * @author Hector Menendez <h@cun.mx>
	 * @created 2011/SEP/10 17:50
	 */
	benchmark:function(){
		var ms = new Date();
		return ms.getTime() - BMK;
	},

	fontsize:(function(){return parseInt(
		$('<div class="ui-fontsize">H</div>').appendTo('body').css('font-size'),10
	);})(),

	/**
	 * Error shorthand.
	 * @author Hector Menendez <h@cun.mx>
	 * @created 2011/AUG/31 04:11
	 */
	error:function(msg, caller){
		if (!this.defaults.debug || console === undefined) return false;
		caller = typeof caller != 'string'? '' : '-' + caller;
		if (typeof msg != 'string') msg = 'Error.';
		throw 'ui' + caller + ': ' + msg;
	},

	/**
	 * Log Shorthand.
	 * @author Hector Menendez <h@cun.mx>
	 * @created 2011/SEP/09 03:57
	 */
	log:function(msg, caller){
		if (!this.defaults.debug || console === undefined) return false;
		var ms = this.benchmark();
		console.log(ms +"ms\t" + 'ui' + (caller!==undefined?'-'+caller:'') + ": " + msg);
	},

	/**
	 * Load plugin script.
	 * @author Hector Menendez <h@cun.mx>
	 * @created 2011/SEP/09 04:14
	 */
	load:function(name, callback){
		var url = this.baseurl + 'js/ui.' + name + '.js';
		$(document).ajaxError(function(e, jqxhr, settings, exception){
			// errors are not being thrown while in syncronich mode.
			msg = 'ui-'+name +': ' + exception;
			alert(msg);
			throw msg; // halt execution
		});

		$.ajax({
			type       : 'GET',
			'url'      : url,
			cache      : this.defaults.debug? false : true,
			async      : false,
			data       : null,
			dataType   : 'script',
			// get around a firefox 3 bug
			beforeSend : function(data){ if (data.overrideMimeType) data.overrideMimeType('text/plain'); }
			// when using async, throwing errors doesn't seem to work, hence the alert.
			/*
			error      : function(data){
				alert('[ui] Script load failed : ' + data.statusText);
				throw data.statusText;
			}
			*/
		});
	},

	/**
	 * checks if given name is a plugin.
	 * @author Hector Menendez <h@cun.mx>
	 * @created 2011/SEP/09 05:55
	 */
	isplugin:function(name){
		var http = new XMLHttpRequest();
		http.open('HEAD', this.baseurl + 'js/ui.' + name + '.js', false);
		http.send();
		http = http.status == 200;
		this.log('Plugin "'+ name + '" ' + (http? 'exists.' : 'does not exist.'));
		return http;
	},


	/**
	 * Traverses jQuery selector and adds ui-* classes to allowed elements.
	 * @author Hector Menendez <h@cun.mx>
	 * @created 2011/SEP/09 06:42
	 */
	uify:function(jQ){
		if (!jQ instanceof jQuery)
			this.error('You must provide a valid jQuery instance');
		allow = ' button fieldset input label legend select textarea ';
		return jQ.each(function(){
			var node = this.nodeName.toLowerCase();
			if (allow.indexOf(' ' + node +' ') === -1) return;
			$(this).addClass('ui-'+node);
		});
	}

};

/**
 * @author Hector Menendez <h@cun.mx>
 *
 * @param opt object   settings   widget-specific settings.
 * @param opt function callback   what to do after plugin constructed.
 *
 * @updated 2011/SEP/10 17:18     Complete Rewrite, splitted into two local
 *                                functions declared on the constructor.
 * @created 2011/AUG/31 04:15
 */
$.fn.ui = function(settings, callback){
	this.each(function(i){
		var $this = $(this);
		// extract ui-elements
		var cls =  $this.attr('class');
		if (!cls || cls.indexOf('ui-') === -1) return ui.core.error('No UI element found in selector.');
		// an instance for each ui class encountered.
		names = cls.match(/ui-\S+/g);
		for (var j in names) new ui(names[j].substr(3), $(this), settings, callback);
	});
};

})(jQuery);
