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
ui.$tooltip = null;


/**
 * GENERAL Preparations.
 * @author Hector Menendez <h@cun.mx>
 * @created 2011/SEP/01 09:02
 */
 ui.__construct = function(){
	// cache body element.
	ui.$body = $('body');
	// these cannot be set by the user.
	$('.ui-overlay, .ui-hider, .ui-tooltip').remove();
	// overlay and hider must alway be the only direct siblings of body.
	ui.$loader  = $('<div class="ui-loader">').prependTo(ui.$body);
	ui.$overlay = $('<div class="ui-overlay">').prependTo(ui.$body);
	ui.$tooltip = $('<div class="ui-tooltip">').prependTo(ui.$body);
	// generate adecuate padding for inputs and textareas.
	ui.textinput();
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
	return ui;
};

ui.loader  = {};

/**
 * @author Hector Menendez <h@cun.mx>
 * @created 2011/SEP/01 08:33
 */
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
 * @author Hector Menendez <h@cun.mx>
 * @created 2011/SEP/07 18:08
 */
ui.tooltip = function(context, message){
	// if no contexts is sent trigger error.
	if (!context instanceof jQuery) return ui.error('A context is expected.');
	if (!message || !message.length) return ui.error('A message is expected.');
	// if there is two or more whitespaces after a dot, transform'em to newline.
	message = message.replace(/(?:([\.\:\;\>])|\s+\-)\s{2,}/g,"$1\n");

	var show = function(e){
		var o = $(this);
		console.dir(o);
		show.to = window.setTimeout(function(){
			ui.$tooltip
				.css('opacity',0)
				.show()
				.html(message)
				.css({
					top:e.clientY  + (o.height()/2),
					left:e.clientX + (o.width()/2)
				})
				.animate({opacity:1},'fast');
		},333);

	};

	var hide = function(){
		window.clearTimeout(show.to);
		delete show.to;
		ui.$tooltip.hide().html('');
	}

	context.mouseover(show);
	context.mouseout(hide);

	return;
	//$('<div class="ui-tooltip">'+title+'</div>');

};

/**
 * Generates adecuate padding for inputs and textareas.
 *
 * @author Hector Menendez <h@cun.mx>
 * @created 2011/SEP/07 00:23
 */
ui.textinput = function(context){
	// if no context is provided use body
	if (context === undefined) context = ui.$body;
	var obj = context.find(
		'.ui-textarea,'+
		'.ui-input[type="text"],'+
		'.ui-input[type="password"]'
	).each(function(){
		var self = $(this);
		self.width('100%');
		// get rough estimate of what .25em equals in percentage.
		var pad = ((parseInt(ui.$body.css('font-size'),10)/4)*100)/self.width();
		// we only need two decimal digits, get rid of everything else.
		pad = Math.round(pad*100+((pad*1000)%10>4?1:0))/100;
		// set css padding and width.
		self.css({
			'text-indent'   : '0 !important',
			'width'         : 100-(pad*2) + '% !important',
			'padding-left'  :        pad  + '% !important',
			'padding-right' :        pad  + '% !important'
		});
		// does this element has a label?
		var label = self.siblings('.ui-label').last();
		if (!label.length) return;
		// a label should only contain a text element, make sure that's the case.
		var cont = label.contents()
			.filter(function(){ return this.nodeType == 3; })
			.first().get(0).nodeValue;
		label.html('<span>'+cont+'</span>');
		// if a title element is present, enable tooltip.
		var title = null;
		var help  = null;
		if ((title = label.attr('title'))){
			label.removeAttr('title');
			help  = $('<span class="ui-label-help">?</span>').appendTo(label);
			ui.tooltip(help, title);
		}
		// sete  character limitier, if existent.
		var regex = null;
		if ((regex = label.attr('data-limit'))) regex = new RegExp('['+regex+']','g');
		// if the element has a character maxcount, generate it and set its event.
		var maxch;
		if ((maxch = parseInt(label.attr('data-count'),10))){
			$('<span class="ui-label-count">'+maxch+'</span>').appendTo(label);
		}
		// set event only if necessary
		if (regex || maxch){
			var count = label.find('.ui-label-count').last();
			self.keypress(function(e){
				// allow non printable keys
				if (e.charCode === 0) return true;
				var key = String.fromCharCode(e.charCode);
				// if a regex exists, limit keys.
				if (regex && !key.match(regex)) return false;
				// continue only if a maxch isset.
				if (!maxch) return true;
				var len = maxch-this.value.length-1;
				if (len > -1) {
					if (len > 0) count.attr('class','ui-label-count');
					count.html(len);
					if (len < parseInt(maxch/3,10)){
						if (len < 10) count.addClass('ui-label-count-halt');
						else          count.addClass('ui-label-count-warn');
					}
				} else return false;
			});

		}
	});
	if (ui.settings.debug) console.info('textinput: succes.', [obj]);
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
	// don't trigger errors when empty selections are sent.
	if (this.length === 0) return this;
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
 * Allow user to pass global settings and get access to UI core.
 * @author Hector Menendez <h@cun.mx>
 * @created 2011/SEP/01 03:48
 */
ui.globalsettings = function(settings){
	if (typeof settings == 'object')
		for (var i in settings)
			if (settings.hasOwnProperty(i)) ui.settings[i] = settings[i];
	else if (settings !== undefined) return  ui.error('Settings are required.');
	return ui.__construct();
};

$.ui    = ui.globalsettings;
$.fn.ui = ui.init;


})(jQuery);

