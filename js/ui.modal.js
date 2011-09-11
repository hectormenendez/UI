var fn = {};

/**
 * @author Hector Menendez <h@cun.mx>
 *
 * @note   Each element will have these elements cached:
 *         $submit  = submit button (if existent)
 *         $reset   = reset  button (if existent)
 *         $header  = Modal Header
 *         $footer  = Modal Footer
 *         $section = Original Content.
 *
 * @updated 2011/SEP/10 00:13   Moved to new format.
 * @created 2011/SEP/09 06:29
 */
fn.modal = function(){
	// been processed already, ignore.
	if (this.element.hasClass('ui_modal-enabled')) return;
	// move element so it's a direct child of body;
	this.element.remove().prependTo(this.core.$body);
	// process html
	var html = this.element.html();
	var sect = this.element.html('').append('<section>'+html+'</section');
	// enable UI for child elems
	context = sect.find('*');
	this.core.uify(context);
	this.core.textinput.enable(context);
	// obtain title. {TODO} what happens if it doesn't exist?
	var title = this.element.attr('title');
	// save submit or reset elems and move'em to the footer.
	var $button = this.element.find('input[type="submit"],input[type="reset"]').remove();
	// Create footer and header
	this.$header  = $('<header></header>')
		.prependTo(this.element)
		.append('<h2>'+title+'<h2>');
	this.$footer  = $('<footer></footer>')
		.appendTo(this.element)
		.append($button);
	this.$section = this.element.find('section'); // won't have buttons.
	// if there was a form, and we moved the submit and/or reset buttons,
	// they won't work so we mimic their original behaviour.
	this.$submit = $button.filter('[type="submit"]');//.bind('click', this.submit);
	this.$reset  = $button.filter('[type="reset"]');//.bind('click', this.reset);
	// mark this element as enabled.
	this.element.addClass('ui_modal-enabled');
	if (this.settings.auto) this.show();
};

fn.modal.prototype = {
	constructor:fn.modal,

	defaults:{
		auto  : false,
		speed : 0 // 0=instant, int=miliseconds 'slow','fast','normal'
	},

	/**
	 * @author Hector Menendez <h@cun.mx>
	 * @updated 2011/SEP/11 04:12    Adapted to new format.
	 * @created 2011/SEP/01 14:49
	 */
	show:function(speed){
		// each modal comes from different instance.
		// so all shared properties will be set on
		// the master template.
		if (this.core.fn.modal.enabled) return this.element;
		this.core.fn.modal.enabled = true;
		if (!parseInt(speed,10)) speed = this.settings.speed;
		this.core.overlay.show(speed);
		this.element
			.css('opacity',0)
			.show()
			.animate({opacity:1}, speed)
			.css({
				marginLeft : -1*(this.element.outerWidth()/2),
				marginTop  : -1*(this.element.outerHeight()/2)
			});
		this.core.log('Shown.','modal');
		return this.element;
	},

	/**
	 * @author Hector Menendez <h@cun.mx>
	 * @updated 2011/SEP/11 04:12    Adapted to new format.
	 * @created 2011/SEP/01 14:48
	 */
	hide:function(speed){
		if (!this.core.fn.modal.enabled) return this.element;
		this.core.fn.modal.enabled = false;
		if (!parseInt(speed,10)) speed = this.settings.speed;
		this.core.overlay.hide(speed);
		this.element.animate({opacity:0}, speed, this.element.hide);
		this.core.log('Hidden.','modal');
		return this.element;
	}
};
