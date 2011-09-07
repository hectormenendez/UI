/**
 * Modal Dialog.
 * @note REMEMBER: this is scoped to "ui".
 * @created 2011/AUG/31 13:44
 **/
var uiSource = {

	 core:null, // core UI object.
	$this:null, // current jQuery element.

	settings:{
		auto  : false,
		speed : 0      // 0=instant, int=miliseconds 'slow','fast','normal'
	},

	/**
	 * Construct modal.
	 */
	__construct:function($this, core, callback){
		// make element visible to all methods.
		this.$this = $this;
		this.core  = core;
		// @NOTE I'm assuming this.$overlay exists, since is set by core.
		// put contents inside a section
		var html     = $this.html();
		var $section = $this.html('').append('<section>'+html+'</section');
		// add ui-classes to children.
		core.children($section);
		//  Generate adecuate padding for inputs and textareas.
		core.textinput();
		// obtain title. {TODO} what happens if it doesn't exist?
		var title = $this.attr('title');
		// save submit or reset elements and move'em to the footer.
		var $button = $this.find('input[type="submit"],input[type="reset"]').remove();
		// Create footer and header
		$this.$header  = $('<header></header>').prependTo($this).append('<h2>'+title+'<h2>');
		$this.$footer  = $('<footer></footer>').appendTo($this).append($button);
		$this.$section = $this.find('section'); // won't have buttons.
		// if there was a form, and we moved the submit and/or reset buttons, they won't work
		// so we mimic their original behaviour.
		$this.$submit = $button.filter('[type="submit"]');//.bind('click', this.submit);
		$this.$reset  = $button.filter('[type="reset"]');//.bind('click', this.reset);
		if (core.settings.modal.auto) this.show();
		if (core.settings.debug) console.info('modal: constructed succesfully.', core.modal);
		// all set, callback?
		if (typeof callback == 'function') callback.call(this, $this); // preseve scope.
	},

	submit:function(){
		$(this).parentsUntil('.ui-modal').parent().find('form').submit();
	},

	/**
	 * @author Hector Menendez <h@cun.mx>
	 * @created 2011/SEP/01 14:48
	 */
	hide:function(){
		this.core.$overlay.hide();
		this.$$this.hide();
		// don't break jQuery's chain.
		return this.$$this;
	},

	/**
	 * @author Hector Menendez <h@cun.mx>
	 * @created 2011/SEP/01 14:49
	 */
	show:function(){
		var $o = this.core.$overlay;
		var $e = this.$this;
		// get opacity for overlay from css.
		var o = $o.css('opacity');
		$e.css('opacity',0).show().animate({opacity:1},this.core.settings.modal.speed);
		$o.css('opacity',0).show().animate({opacity:o},this.core.settings.modal.speed);
		// center on screen
		$e.css({
			marginLeft : -1*($e.width() /2),
			marginTop  : -1*($e.height()/2)
		});
		return $e;
	}

};
