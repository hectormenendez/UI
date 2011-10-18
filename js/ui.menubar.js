var fn = {};
var me = 'menubar';
/**
 * @author Hector Menendez <h@cun.mx>
 * @licence http://etor.mx/licence.txt
 * @created 2011/OCT/13 13:00
 */
fn.menubar = function(){
	var self = this;
	// pseudo hovering with keyboard focus.
	this.element.find('> li > a')
		.focus(function(){
			$(this).parent().addClass('ui-menubar-hover');
		})
		.blur(function(){
			$(this).parent().removeClass('ui-menubar-hover');		
		})
		// remove pseudo hovering when user actually hovers.
		.mouseover(function(){
			self.element.find('> li').removeClass('ui-menubar-hover');
		});
}

fn.menubar.prototype = {
	constructor:fn.menubar,

	defaults:{}
}