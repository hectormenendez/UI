var fn = {};
var me = 'fileupload';
/**
 * @author Hector Menendez <h@cun.mx>
 * @created 2011/SEP/12 02:42
 */
fn.fileupload = function(){
	if (typeof this.settings.url != 'string')
		this.core.error('Must specify an URL.',me);
	if (typeof this.settings.data != 'object')
		this.core.error('Data must be an object.',me);
	// the element must be either absolute, relative or fixed positioned.
	if (!this.element.css('position').match('/relative|absolute|fixed/i'))
		 this.element.css('position','relative');
	// make sure every fileupload instance has an unique id.
	if ($.ui.fn.fileupload.count === undefined) $.ui.fn.fileupload.count = -1;
	var id = 'ui-fileupload-' + (++$.ui.fn.fileupload.count);
	// build form elements
	this.$form = $('<form ' +
		'action  = "' + this.settings.url + '" ' +
		'target  = "' +id +'" '+
		'method  = "post" '+
		'enctype = "multipart/form-data">'
	);
	this.$file   = $('<input name="file" type="file">').appendTo(this.$form);
	this.$frame  = $('<iframe name="' + id + '"></iframe>').appendTo(this.$form);
	// user sent vars as extra inputs.
	this.$hidden = {};
	for (var i in this.settings.data) this.$hidden[name](
		$('<input type="hidden" name="' + name + '" value="' + this.settings.data[name] + '">')
		.appendTo(this.$form)
	);
	// insert the form element to DOM and catch submit events.
	this.$form.submit(function(e){ e.stopPropagation(); }).appendTo(this.element);
	// Adjust file input's dimentions.
	// forrce input to fill the void by increasing the font size. [FF]
	var size = this.element.outerHeight();
	var fixs = Math.ceil(size * 0.05);
	this.$file.css({
		'font-size'   : size + fixs,
		'line-height' : size + fixs,
		'margin-top'  : -1*fixs
	});
	if ($.browser.mozilla){
		this.$file.css({
			'height'  : size + fixs,
			// button always aligned to the right, so FF doesn't show a text cursor.
			'left'    : (-1*this.$file.outerWidth())+this.element.outerWidth()
		});

	}
	// A user can be traversing elemets using the keyboard,
	// so using focus here, would trigger in such case, hence the use of click.
	// Using jQuery's proxy, ensures we maintain our context.
	this.$file.bind('click', $.proxy(this.trigger, this));
};

fn.fileupload.prototype = {
	constructor: fn.fileupload,

	defaults:{
		url      : window.location.href,
		data     : {},
		progress : null, // if location provided, will poll it every second
		                 // untill 100 is returned.
		// callbacks
		change   : null, // file selected
		cancel   : null, // dialog clos
		complete : null, // transfer completed
		success  : null, // JSON received.
		error    : null  // any other data received.
	},

	/**
	 * @author Hector Menendez <h@cun.mx>
	 * @created 2011/SEP/12 06:27
	 */
	trigger:function(){
		this.core.log('Triggered.', me);
		this.hasfile = false;
		// blur won't trigger unless we actually have focus.
		this.$file.trigger('focus');
		if (!this.proxyblur) this.proxyblur = $.proxy(this.blur, this);
		if (!this.proxychange) this.proxychange = $.proxy(this.change, this);
		// enable listeners to catch wether the user cancels or selects a file.
		this.$file.bind('blur',   this.proxyblur);
		this.$file.bind('change', this.proxychange);
	},

	/**
	 * This will be triggered right after the user opens the dialog.
	 * @author Hector Menendez <h@cun.mx>
	 * @created 2011/SEP/12 06:56
	 */
	blur:function(){
		this.core.log('Blurred and re-binded to window.', me);
		// this listener must only run once.
		this.$file.unbind('blur', this.proxyblur);
		// add a focus listener to the window element
		// so we know when the user actually closes the dialog,
		if (!this.proxyfocus) this.proxyfocus = $.proxy(this.focus, this);
		$(window).bind('focus', this.proxyfocus);
		return false;
	},

	/**
	 * This will be triggered just after the user selects a file.
	 * @author Hector Menendez <h@cun.mx>
	 * @created 2011/SEP/12 06:56
	 */
	change:function(){
		// this listener must only run once.
		this.$file.unbind('change', this.proxychange);
		this.hasfile = true;
		// run user callback if available
		if (typeof this.settings.change == 'function'){
			var cb = this.settings.change.call(this);
			var msg = 'User\'s "change" calledback';
			if (cb !== null && cb !== undefined){
				this.core.log(msg + ', returning "' + cb + '".', me);
				return cb;
			}
			this.core.log(msg + '.', me);
		}
		// we've a file, make sure everyone knows and trigger submit.
		this.core.log('File selected, loading : ' + this.settings.url, me);
		this.$form.submit();
		// add a listener on the iFrame.
		if (!this.proxyload) this.proxyload = $.proxy(this.load, this);
		this.$frame.bind('load', this.proxyload);
		return false;
	},

	/**
	 * This will be triggered when file dialog closes and window gains focus.
	 * @author Hector Menendez <h@cun.mx>
	 * @created 2011/SEP/12 07:11
	 */
	focus:function(e){
		// this listener must only run once.
		$(window).unbind('focus', this.proxyfocus);
		if (!this.hasfile){
			// run user callback if available
			if (typeof this.settings.cancel == 'function'){
				var cb = this.settings.cancel.call(this);
				var msg = 'User\'s "cancel" calledback';
				if (cb !== null && cb !== undefined){
					this.core.log(msg + ', returning "' + cb + '".', me);
					return cb;
				}
				this.core.log(msg + '.', me);
			}
			this.core.log('Cancelled.', me);
		}
		return true;
	},

	/**
	 * This will be triggered when the server sends a response to the client.
	 * @author Hector Menendez <h@cun.mx>
	 * @created 2011/SEP/12 07:49
	 */
	load:function(){
		var cb, json, msg;
		// again, this can only run once.
		this.$frame.unbind('load', this.proxyload);
		// get data.
		var data = this.$frame.contents().find('body').html();
		// run user callback if available
		if (typeof this.settings.complete == 'function'){
			cb = this.settings.complete.call(this);
			msg = 'User\'s "complete" calledback';
			if (cb !== null && cb !== undefined){
				this.core.log(msg + ', returning "' + cb + '".', me);
				return cb;
			}
			this.core.log(msg + '.', me);
		}
		// Server must return valid JSON, if not, treat it as error.
		try{ if (!(json = $.parseJSON(data))) throw new Error(); }
		catch(e){
			// run user callback if available
			if (typeof this.settings.error == 'function'){
				cb = this.settings.error.call(this);
				msg = 'User\'s "error" calledback';
				if (cb !== null && cb !== undefined){
					this.core.log(msg + ', returning "' + cb + '".', me);
					return cb;
				}
				this.core.log(msg + '.', me);
			}
			this.core.log('Error:' + data, me);
			return false;
		}
		// run user callback if available
		if (typeof this.settings.success == 'function'){
			cb = this.settings.success.call(this);
			msg = 'User\'s "success" calledback';
			if (cb !== null && cb !== undefined){
				this.core.log(msg + ', returning "' + cb + '".', me);
				return cb;
			}
			this.core.log(msg + '.', me);
		}
		this.core.log('Success.' + json, me);
	}
};
