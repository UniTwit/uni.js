// ui.js

// Component class
var Component = Class.extend({
	init: function(tag) {
		this.DOMElement = document.createElement(tag);
	},

	spawn: function(parent){
		parent.appendChild(this.DOMElement);
	},

	disable: function(){
		this.DOMElement.classList.add('disable');
		this.removeEvents();
	},

	enable: function(){
		this.DOMElement.classList.remove('disable');
		this.addEvents();
	},

	addEvents: function(){},
	removeEvents: function(){}
});

// Draggable extends Component
var Draggable = Component.extend({
	init:function(tag){this._super(tag)},

	// Inherited methods
	spawn:function(parent){this._super(parent)},
	disable:function(){this._super()},
	enable:function(){this._super()}
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

	addEvents: function(){
		this.DOMElement.addEventListener('click', this.action);	
	},	

	removeEvents: function(){
		this.DOMElement.removeEventListener('click', this.action);	
	},

	// inherited methods
	spawn: function(parent){this._super(parent)},
	disable: function(){this._super();},
	enable: function(){this._super();}
});

// Form extends Component
var Form = Component.extend({
	// action: a function, type: submit|instant, caption: caption of the submit|quit button
	init: function(action, type, caption){
		this._super('form');

		this.action = action;
		this.type = type;

		this.inputs = [];
		this.submit = new Button(caption, this.onSubmit);
		console.log(this);
	},

	addInput: function(name, type, dataType){
		console.log(this);
		if(this.type == "instant")
			input = new Input(name, type, dataType, this.onChange);
		else
			input = new Input(name, type, dataType);
		console.log(this);
		this.inputs.push(input);
	},

	onSubmit: function(){
		data = {};

		this.inputs.forEach(function(input){
			data[input.getName()] = input.getValue();
		});

		this.action(data);
	},

	// Inherited methods
	spawn: function(parent){
		this._super(parent);
		this.submit.spawn(this.DOMElement);
		this.inputs.forEach(function(input){
			input.spawn(this.DOMElement);
		});
	},
	disable:function(){
		this._super();
		this.submit.disable();
		this.inputs.forEach(function(input){
			input.disable();
		});
	},

	enable:function(){
		this._super();
		this.submit.enable();
		this.inputs.forEach(function(input){
			input.enable();
		});
	}	
});

// Input extend Component
var Input = Component.extend({
	init: function(name, type, dataType, action){
		this._super('input');

		this.DOMElement.setAttribute('name', name);
		this.DOMElement.setAttribute('type', type);

		this.dataType = dataType;
		this.action = action;
		this.name = name;
		this.type = type;

		this.addEvents();
	},

	addEvents: function(){
		if(this.dataType)
			this.DOMElement.addEventListener('blur', this.beforeDataValidation);
		if(this.action)
			this.DOMElement.addEventListener('blur', this.action);
	},

	removeEvents: function(){
		if(this.dataType)
			this.DOMElement.removeEventListener('blur', this.onDataValidation);
		if(this.action)
			this.DOMElement.removeEventListener('blur', this.action);
	},

	onChange: function(){
		this.action(this.getValue);
	},

	onDataValidation: function(){
		Validator.isValid(this.DOMElement.value, this.dataType, this.onDataValidation);
	},

	afterDataValidation: function(valid, hint){
		if(valid){
			this.DOMElement.classList.add('valid');
			this.DOMElement.classList.remove('invalid');
		}else{
			this.DOMElement.classList.add('invalid');
			this.DOMElement.classList.remove('valid');
		}
	},

	getValue: function(){
		return this.DOMElement.value;
	},

	getName: function(){
		return this.DOMElement.name;
	},

	getType: function(){
		return this.DOMElement.type;
	},

	// Inherited methods
	spawn:function(parent){this._super(parent)},
	disable:function(){this._super();},
	enable:function(){this._super();}
});