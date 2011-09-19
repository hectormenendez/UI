var fn = {};
var me = 'modal';
/**
 * @author Hector Menendez <h@cun.mx>
 * @licence http://etor.mx/licence.txt
 * @updated 2011/SEP/14 21:19   Moved button declaration to  modal.update()
 * @updated 2011/SEP/10 00:13   Moved to new format.
 * @created 2011/SEP/09 06:29
 */
fn.modal = function(){

	var self = this;

	// move element so it's a direct child of body;
	this.element.remove().prependTo(this.core.$body);
	// process html
	var html = this.element.html();
	var sect = this.element.html('').append('<section>'+html+'</section');
	// set main sub-elements-
	this.$header  = $('<header></header>').prependTo(this.element);
	this.$footer  = $('<footer></footer>').appendTo(this.element);
	// set closer
	this.$close   = $('<div class="ui_modal_header_item ui_modal_close">')
		.click(function(){ self.hide(); })
		.prependTo(this.$header);
	// default content
	this.$content = this.element.find('section');
	this.content = this.$content.html();
	// default title
	this.title = this.element.attr('title') || '';
	this.element.removeAttr('title');
	this.$title   = $('<h2>'+this.title+'</h2>').appendTo(this.$header);
	//  show now if settings say so.
	if (this.settings.auto === true) this.show();
};

fn.modal.prototype = {
	constructor:fn.modal,

	defaults:{
		auto   : false,
		speed  : 0, // 0=instant, int=miliseconds 'slow','fast','normal'
		footer : true,
		close  : true,
		// callbacks
		submit : null,  // user pressed submit
		cancel : null   // user pressed cancel
	},

	/**
	 * @author Hector Menendez <h@cun.mx>
	 * @licence http://etor.mx/licence.txt
	 * @updated 2011/SEP/11 04:12    Adapted to new format.
	 * @created 2011/SEP/01 14:49
	 */
	show:function(speed){
		// we don't want to show modals when other modals are opened,
		// so we check on the master prototype to know if there's one active.
		// TODO: Create a queue for these modals to show after enabled closes.
		if (this.core.fn.modal.enabled) return this;
		this.core.fn.modal.enabled = true;
		this.update();
		if (!parseInt(speed,10)) speed = this.settings.speed;
		// show it.
		this.core.overlay.show(speed);
		this.element
			.css('opacity',0)
			.show()
			.animate({opacity:1}, speed)
			.css({
				marginLeft : -1*(this.element.outerWidth()/2) + this.core.$document.scrollLeft(),
				marginTop  : -1*(this.element.outerHeight()/2) + this.core.$document.scrollTop()
			});
		this.core.log('Shown.','modal');
		return this;
	},

	/**
	 * @author Hector Menendez <h@cun.mx>
	 * @licence http://etor.mx/licence.txt
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
	},

	/**
	 * Make sure modal is up-to-date.
	 * @author Hector Menendez <h@cun.mx>
	 * @licence http://etor.mx/licence.txt
	 * @updated 2011/SEP/16 04:43  Modal was not showing footers when settings said so.
	 * @created 2011/SEP/14 20:44
	 */
	update:function(){
		var self = this;
		// reset title
		this.$title.html(this.title);
		// reset and renable content
		this.$content.html(this.content);
		var context = this.$content.find('*');
		if (context.length){
			this.core.uify(context);
			this.core.textinput.enable(context);
		}
		// show or hide the close button
		if (!this.settings.close) this.$close.hide();
		else                      this.$close.show();
		// all submit and cancel elements found in content will
		// be moved down to footer and get modal's events.
		// well, at least the first one of each.
		if (this.$cancel && this.$cancel.length) this.$cancel.remove();
		if (this.$cancel && this.$submit.length) this.$submit.remove();
		var $b = this.element.find('[type="submit"],[type="reset"]').remove();
		if (typeof this.settings.submit == 'function'){
			var  $submit = $b.filter('[type="submit"]').first();
			if (!$submit.length) $submit = $('<input class="ui-button" type="submit" value="OK">');
			this.$submit = $submit.appendTo(this.$footer).click(function(){
				self.core.log('User\'s "submit" calledback.',me);
				self.settings.submit.call(self);
			});
		}
		// enable buttons depending on settings callbacks visibility.
		if (typeof this.settings.cancel == 'function'){
			var  $cancel = $b.filter('[type="reset"]').first();
			if (!$cancel.length) $cancel = $('<input class="ui-button" type="reset" value="NO">');
			this.$cancel = $cancel.appendTo(this.$footer).click(function(){
				self.core.log('User\'s "cancel" calledback.',me);
				self.settings.cancel.call(self);
			});
		}
		// show footer only when setting is enabled and there's something to show.
		if ( this.settings.footer && (
			(this.$submit && this.$submit.length) ||  
			(this.$cancel && this.$cancel.length)
		)) {
			this.element.removeClass('ui_modal_hidden_footer');
			return;
		}
		this.element.addClass('ui_modal_hidden_footer');
	}
};
