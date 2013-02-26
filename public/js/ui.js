// Component class

var Component = Class.extend({
	init: function(tag) {
		this.DOMElement = document.createElement(tag)
	},
	spawn: function(parent){
		parent.appendChild(this.DOMElement);
	},
	disable: function(){
		this.DOMElement.classList.add('disable');
	},
	enable: function(){
		this.DOMElement.classList.remove('disable');
	}
});

// Draggable extends Component

var Draggable = Component.extend({
	init:function(tag){this._super(tag)},
	spawn:function(parent){this._super(parent)},
	disable:function(){this._super()},
	enable:function(){this._super()},
});

// Button class extends Component

var Button = Component.extend({
	init: function (caption, action) {
		this._super('button');
		this.action = action;
		this.caption = caption;
		this.DOMElement.textContent = this.caption;
		this.DOMElement.addEventListener('click', this.action);
	},
	spawn: function(parent){this._super(parent)},
	disable: function(){this._super();
		this.DOMElement.removeEventListener('click', this.action);	
	},
	enable: function(){this._super();
		this.DOMElement.addEventListener('click', this.action);	
	}
});
