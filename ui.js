/**
 * @author Hector Menendez <h@cun.mx>
 * @licence http://etor.mx/licence.txt
 *
 * @bug     2011/SEP/09 04:34   Chrome doesn't allow loading local scripts
 *                              in offline mode.
 *
 * @updated 2011/SEP/10 17:30   Complete Rewrite.
 * @created 2011/AUG/31 04:10
 */
(function($,undefined){

if (!$ instanceof jQuery) throw "ui: jQuery is required.";

//  Benchmark
var BMK = new Date();
    BMK = BMK.getTime();

/**
 * Constructor
 * @author Hector Menendez <h@cun.mx>
 * @licence http://etor.mx/licence.txt
 * @created 2011/SEP/01 09:02
 */
var ui = function(){

	var self = this;

	if (ui.core.enabled) return ui;
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
	ui.core.$document = $(document);
	ui.core.$body     = $('body');
	ui.core.$overlay  = $('<div class="ui-overlay">').prependTo(ui.core.$body).show();
	ui.core.$loader   = $('<div class="ui-loader">').prependTo(ui.core.$body).show();
	ui.core.$tooltip  = $('<div class="ui-tooltip">').prependTo(ui.core.$body);
	// obtain overlay base opacity
	ui.core.$overlay.opacity = ui.core.$overlay.css('opacity');
	// load base components
	if (!self.isplugin('base')) self.error('Base missing.');
	self.load('base');
	self.log('Loaded.', 'base');
	var f;
	// instantiate methods ment to be on core scope.
	for (f in core){
		core[f].prototype.core = ui.core;
		ui.core[f] = new core[f]();
	}
	// add element handlers to prototype.
	for (f in fn) ui.core.fn[f] = fn[f];
	// mark core as enabled.
	ui.core.enabled = true;
	self.loader.hide();
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
	 * @licence http://etor.mx/licence.txt
	 * @created 2011/SEP/10 17:50
	 */
	benchmark:function(){
		var ms = new Date();
		return ms.getTime() - BMK;
	},

	em:null,         // 1em in pixels.
	cm:null,		 // 1cm in pixels.
	inch:null,		 // 1inch in pixels.

	scrollbar:null,  // scrollbar width in pixels.

	/**
	 * Error shorthand.
	 * @author Hector Menendez <h@cun.mx>
	 * @licence http://etor.mx/licence.txt
	 * @created 2011/AUG/31 04:11
	 */
	error:function(msg, caller){
		if (!this.defaults.debug || typeof console == 'undefined') return false;
		caller = typeof caller != 'string'? '' : '-' + caller;
		if (typeof msg != 'string') msg = 'Error.';
		throw 'ui' + caller + ': ' + msg;
	},

	/**
	 * Log Shorthand.
	 * @author Hector Menendez <h@cun.mx>
	 * @licence http://etor.mx/licence.txt
	 * @updated 2011/SEP/12 08:33   it now shows XXXs XXXms
	 * @created 2011/SEP/09 03:57
	 */
	log:function(msg, caller){
		if (!this.defaults.debug || typeof console === 'undefined') return false;
		// pad zeroes when needed.
		var pad = function(num, length){
			num = parseInt(num,10).toString();
			while(num.length < length) num = '0' + num;
			return num;
		};
		var bmk = this.benchmark();
		bmk = (bmk/1000).toString().split('.').map(function(a){ return parseInt(a,10); });
		bmk = pad(bmk[0],3) + 's ' + pad(bmk[1],3) + "ms  ";
		console.log(bmk + 'ui' + (caller!==undefined?'-'+caller:'') + ": " + msg);
	},

	/**
	 * Load plugin script.
	 * @author Hector Menendez <h@cun.mx>
	 * @licence http://etor.mx/licence.txt
	 * @created 2011/SEP/09 04:14
	 */
	load:function(name, callback){
		var url = this.baseurl + 'js/ui.' + name + '.js';
		//$(document).ajaxError();
		$.ajax({
			type    : 'GET',
			'url'   : url,
			cache   : this.defaults.debug? false : true,
			async   : false,
			data    : null,
			dataType: 'script',
			// get around a firefox 3 bug
			beforeSend: function(data){ if (data.overrideMimeType) data.overrideMimeType('text/plain'); },
			// when using async, throwing errors doesn't seem to work, hence the alert.
			error: function(e, jqxhr, settings, exception){
				msg = 'ui-load-'+name +': ' + exception;
				// throw this error after execution, otherwise, it won't be shown.
				// at least not in synchronic mode.
				setTimeout(function(){ throw msg; },10);
			}
		});
	},

	/**
	 * checks if given name is a plugin.
	 * @author Hector Menendez <h@cun.mx>
	 * @licence http://etor.mx/licence.txt
	 * @created 2011/SEP/09 05:55
	 */
	isplugin:function(name){
		var http = new XMLHttpRequest();
		try {
			http.open('HEAD', this.baseurl + 'js/ui.' + name + '.js', false);
			http.send();
		} catch (e) { }
		http = http.status == 200;
		this.log('Plugin "'+ name + '" ' + (http? 'exists.' : 'does not exist.'));
		return http;
	},

	/**
	 * Returns wether an object  is an object containing an jQuery element.
	 * @author Hector Menendez <h@cun.mx>
	 * @licence http://etor.mx/licence.txt
	 * @created 2011/SEP/12 15:56
	 */
	iselement:function(jQ){
		return (
			typeof jQ == 'object'     &&
			jQ instanceof jQuery      &&
			jQ.selector !== undefined &&
			jQ.length
		);
	},

	/**
	 * Traverses jQuery selector and adds ui-* classes to allowed elements.
	 * @author Hector Menendez <h@cun.mx>
	 * @licence http://etor.mx/licence.txt
	 * @created 2011/SEP/09 06:42
	 */
	uify:function(jQ){
		if (!this.iselement(jQ)) return this.error('Expecting valid jQuery element.');
		allow = ' button fieldset input label legend select textarea ';
		return jQ.each(function(){
			var node = this.nodeName.toLowerCase();
			if (allow.indexOf(' ' + node +' ') === -1) return;
			$(this).addClass('ui-'+node);
		});
	},

	/**
	 * Finds the first background-color up in the chain.
	 * @author Hector Menendez <h@cun.mx>
	 * @licence http://etor.mx/licence.txt
	 * @updated 2011/SEP/12 15:35    Moved from ui.inset.js
	 * @created 2011/SEP/11 04:49
	 */
	findbg:function(jQ){
		if (!this.iselement(jQ)) return this.error('Expecting valid jQuery element.');
		var i, tmp, bg = false;
		do {
			tmp = jQ.css('background-color');
			if (tmp == 'transparent' || tmp == 'rgba(0, 0, 0, 0)') continue;
			bg = tmp.match(/\d+/g); // extract rgb[a], values.
			break;
		} while ((jQ = jQ.parent()) && jQ.get(0).tagName.toLowerCase() != 'html');
		if (!bg) this.error('Background color unavailable.');
		return bg;
	},

	/**
	 * if float given, limits the number of decimals to two by rounding correctly.
	 * @author Hector Menendez <h@cun.mx>
	 * @licence http://etor.mx/licence.txt
	 * @created 2011/SEP/05 13:11
	 */
	twodec:function(dec){
		return Math.round(dec*100+((dec*1000)%10>4?1:0))/100;
	},

	/**
	 * Enables plugin for jquery element.
	 * @author Hector Menendez <h@cun.mx>
	 * @licence http://etor.mx/licence.txt
	 *
	 * @param req string         name    Name of the plugin.
	 * @param req jQuery      element    Target jQuery Element.
	 * @param opt object     settings    Default overrides.
	 * @param opt function   callback    Run this after a succesful construction
	 *
	 * @updated 2011/SEP/12 01:45        This was originally part of UI
	 *                                   constructor, I know, stupid.
	 * @created 2011/SEP/09 08:34
	 */
	enable:function(name, element, settings, callback){

		var self = this;

		// element instancing;
		var run  = function(fn){
			// make sure a valid element is being sent.
			if (!self.iselement(element)) self.error('Invalid Element.', name);
			var dom = element.get(0);
			// make sure an element is constructed only once
			var tagname = dom.tagName.toLowerCase();
			if (element.hasClass('ui_' + name + '_enabled')){
				// if existent, call the update method for plugin.
				if (typeof dom.ui[name].update == 'function')
					dom.ui[name].update();
				self.log('Element "'+tagname+'" already constructed, returning cached instance.', name);
				return dom.ui[name];
			}
			// make sure element has ui-tag
			// after all, $.ui.enable does not require the element to have it.
			if (!element.hasClass('ui-'+ name)) element.addClass('ui-'+name);
			// merge user-sent settings with defaults;
			settings = $.extend(true, {}, fn.prototype.defaults, settings);
			// pass on, core prototype.
			var instance = fn;
			instance.prototype.core = ui.core;
			instance.prototype.settings = settings;
			instance.prototype.element  = element;
			instance = new instance(element, settings);
			// Identify this element in the future as already enabled.
			element.addClass('ui_' + name + '_enabled');
			if (typeof dom.ui != 'object') dom.ui = {};
			dom.ui[name] = instance;
			// enable callback, preserving scope.
			if (typeof callback == 'function') {
				callback.call(instance);
				self.log('Calledback.', name);
			}
			return instance;
		};
		if (typeof name != 'string') this.error('Invalid Name.');
		// no need to reload if plugin is already loaded.
		if (self.fn[name] !== undefined) return run(self.fn[name]);
		// is it even a valid plugin?
		if (!self.isplugin(name)) return;
		// start loading plugin.
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
		self.log('Loaded.', name);
		self.loader.hide();
		return run(fn[name]);
	}
};

$.ui = ui;
/**
 * @created 2011/SEP/12 02:08
 */
$(document).ready(function(){

	$.ui = new $.ui();

	// obtain measurument units in pixels;
	var $measure = $('<div id="ui-measure">H</div>').appendTo('body');
	ui.core.em   = parseInt($measure.css('font-size'),10);
	ui.core.inch = parseInt($measure.width(),10);
	ui.core.cm   = ui.core.twodec(ui.core.inch / 2.54);
	$measure.remove();

	// obtain the scrollbar width in pixels
	ui.core.scrollbar = (function(self){
		var ovflow = self.$body.css('overflow');
		var hidden = self.$body.css('overflow','hidden').width();
		var scroll = self.$body.css('overflow','scroll').width();
		// Watch out for IE.
		var width  = (hidden==scroll)? scroll - self.$body.get(0).clientWidth : hidden-scroll;
		self.$body.css('overflow', ovflow); // restore
		return width;
	})($.ui);

	/**
	 * Element initializer.
	 * If a string is given as first parameter this method will work as shorthand
	 * of $.ui.element(), if is not a string, it will traverse class names looking
	 * for a ui-class and then construct that element.
	 *
	 * @author Hector Menendez <h@cun.mx>
	 * @licence http://etor.mx/licence.txt
	 *
	 * @param opt mixed    settings_or_name       string or object
	 * @param opt mixed    callback_or_settings   param1 == string? object   : function
	 * @param opt function          or_callback   param1 == string? function : undefined
	 *
	 * @updated 2011/SEP/14 17:37     If a string is sent as first parameter
	 *                                this function will be only a shorthand of
	 *                                $.ui.element();
	 * @updated 2011/SEP/12 01:42     Instead of instancing UI directly,
	 *                                it now uses instanced ui via the "element" method.
	 * @updated 2011/SEP/10 17:18     Complete Rewrite, splitted into two local
	 *                                functions declared on the constructor.
	 * @created 2011/AUG/31 04:15
	 */
	$.fn.ui = function(settings_or_name, callback_or_settings, or_callback){
		var name, settings, callback, clase;
		return this.each(function(i){
			var $this = $(this);
			// if no name given, extract names from current element's class.
			if (typeof settings_or_name != 'string'){
				settings = settings_or_name;
				callback = callback_or_settings;
				clase = $this.attr('class');
				if (!clase || clase.indexOf('ui-') === -1)
					return ui.core.error('No UI element found.');
				// generate instance for each ui-class found.
				name = clase.match(/ui-\S+/g);
				for (var j in name){
					ui.core.log('Detected "' + name + '" element, enabling it...');
					$.ui.enable(name[j].substr(3), $this, settings, callback);
				}
				return;
			}
			// a name was given, run that plugin on current element.
			name     = settings_or_name;
			settings = callback_or_settings;
			callback = or_callback;
			ui.core.log('Using shorthand for "'+ name +'".');
			$.ui.enable(name, $this, settings, callback);
		});
	};

});

})(jQuery);
