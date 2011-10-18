var fn = {};
var me = 'editable';

/**
 * As soon as a replacement is made, contenteditable will lose its focus, 
 * so, onkeydown, bind a listener to grab it again and put cursor at the end.
 * Also, add a space that will force current tag to exit.
 * we'll select it on innerfocus so it gets deleted on next stroke.
 *
 * @author Hector Menendez <h@cun.mx>
 * @licence http://etor.mx/licence.txt
 * @created 2011/SEP/28 10:09
 */
fn.editable = function(){

	this.element
		.bind('focus',   $.proxy(this.focus.outer, this))
		.bind('click',   $.proxy(this.focus.outer, this))
		.bind('blur',    $.proxy(this.blur.outer , this))
		.bind('keydown', $.proxy(this.key.down   , this))
		.bind('keyup',   $.proxy(this.key.up     , this));
	this.element.each(function(){
		var $this = $(this);
		if (!$this.find('p').length)
			$this.html('<p>'+  $this.html() +'</p>');
	});
	this.core.log('Constructed.', me);
};

fn.editable.prototype = {
	constructor:fn.editable,

	defaults:{
		replace : {},
		// callbacks
		focus   : null,
		blur    : null,
		keyup   : null,
		keydown : null
	},

	focus:{
		/**
		 * @created 2011/SEP/28 10:53
		 */
		inner:function(e){
			var $this   = $(e.currentTarget);
			var lastext = $this.contents().last().get(0);
			var keycode = $.data($this.get(0), 'keycode');
			var range;
			// Modern
			if(document.createRange){
				range = document.createRange();
				range.selectNodeContents(lastext);
				// user pressed space, collapse to end; a space by itself 
				// would continue last tag's formatting.
				if (keycode==32) range.collapse(false);
				var sel = window.getSelection();
				sel.removeAllRanges();
				sel.addRange(range);
			}
			// Arcaic [IE lte 8]
			else if(document.selection){ 
				range = document.body.createTextRange();
				range.moveToElementText(lastext);
				if (keycode == 32) range.collapse(false);
				range.select();
			}
		},

		/**
		 * Enables content editable and selects text.
		 * @created 2011/SEP/28 10:21
		 */
		outer:function(e){
			var $this = $(e.currentTarget);
			$this.attr('contentEditable',true);
			dom = $this.get(0);
			var range;
			// select text.
			if (typeof window.getSelection != 'undefined' ){
				var sel = window.getSelection();
				range = document.createRange();
				range.selectNodeContents(dom);
				sel.removeAllRanges();
				sel.addRange(range);
			} else { // IE lte 8
				range = document.body.createTextRange();
				range.moveToElementText(dom);
				range.select();
			}
			// callback
			if (typeof this.settings.focus == 'function')
				this.settings.focus.call(this);
		}
	},

	blur:{
		inner:function(){},

		/**
		 * Disables Content editable.
		 * @created 2011/SEP/28 10:21
		 */
		outer:function(e){
			$(e.currentTarget).removeAttr('contentEditable');
		}
	},

	key:{

		/**
		 * @created 2011/SEP/28 10:09
		 */
		down:function(e){
			var $this = $(e.currentTarget);
			var html = $this.html();
			$this.unbind ('focus', this.focus.outer);
			$this.unbind ('blur',   this.blur.outer);
			$this.bind   ('focus', $.proxy(this.focus.inner, this));
			$this.bind   ('blur',  $.proxy(this.blur.inner,  this));
			var regex = this.settings.replace;
			// traverse each replacement rule.
			for (var i in regex){
				if (html.match(regex[i][0])){
					$.data($this.get(0),'keycode',e.keyCode);
					$this.html(html.replace(regex[i][0], regex[i][1]+'&nbsp;')).focus();
				}
			}
		},

		/**
		 * Restores normal focus/blur events.
		 * @created 2011/SEP/28 10:24
		 */
		up:function(e){
			var $this = $(e.currentTarget);
			$this.unbind ('focus', this.focus.inner);
			$this.unbind ('blur',   this.blur.inner);
			$this.bind   ('focus', $.proxy(this.focus.outer, this));
			$this.bind   ('blur',  $.proxy(this.blur.outer,  this));
		}
	}
};