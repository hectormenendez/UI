/**
 * @author Hector Menendez <h@cun.mx>
 * @created 2011/SEP/04 03:35
 */
var uiSource = {

	core:null,
	$this:null,

	settings:{

	},

	/**
	 * @author Hector Menendez <h@cun.mx>
	 * @created 2011/SEP/04 03:38
	 */
	__construct:function($this, core, callback){
		this.$this = $this;
		this.core  = core;
		core.settings.debug = true;
		// common part over, start developing.
		if ($this.get(0).tagName.toLowerCase() != "select")
			return core.error($this.selector+' is not a SELECT element.');
		// We've to convert the select box into an UL > li > a


	 }



};






