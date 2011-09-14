var fn = {};
var me = 'progressbar';
/**
 * @author Hector Menendez <h@cun.mx>
 * @licence http://etor.mx/licence.txt
 * @created 2011/SEP/12 15:39
 */
fn.progressbar = function(){
	var value = parseInt(this.settings.value,10);
	// if element is not ui-progress, create a child and make current element.
	if (!this.element.hasClass('ui-progressbar'))
		this.element = $('<div class="ui-progressbar">').appendTo(this.element);
	// get background color and generate shadows and highlights to give the box
	// an inset look. (I think this should be handled by inset... duh.)
	var bg = this.core.findbg(this.element);
	var color = {
		base:'rgb('+bg.map(function(a){ return parseInt(a*0.90,10); }).join(',')+')',
		high:'rgb('+bg.map(function(a){ return parseInt(a*1.15,10); }).join(',')+')',
		low :'rgb('+bg.map(function(a){ return parseInt(a*0.70,10); }).join(',')+')',
		mid :'rgb('+bg.map(function(a){ return parseInt(a*1.03,10); }).join(',')+')'
	};
	this.element.css({
		'background-color'   : color.base,
		'border-top-color'   : color.low,
		'border-left-color'  : color.low,
		'border-bottom-color': color.high,
		'border-right-color' : color.high
	});
	// add the bar
	this.$bar = $('<div class="ui_progress_bar">').appendTo(this.element).css({
		backgroundColor:color.mid,
		width: value + '%'
	});
	//if (!value) this.$bar.hide();
	this.$val = $('<div class="ui_progress_val">').appendTo(this.element).css({
		'line-height' : this.element.height() + 'px'
	});
	this.$val.html(value + ' %');

	this.core.log('Constructed for "' + this.element.get(0).tagName.toLowerCase() +'".', me);
};

fn.progressbar.prototype = {
	constructor: fn.progressbar,

	defaults:{
		value: 0
	},

	update:function(value){
		value = parseInt(value,10);

		this.$bar.css('width',value +'% !important');
		this.$val.html(value + ' %');
	}
};
