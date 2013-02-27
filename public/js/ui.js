// ui.js

// Component class
var Component = Base.extend({
	constructor: function(tag) {
		this.DOMElement = document.createElement(tag);
		// To retrieve the component object in event handlers
		this.DOMElement.component = this;
	},

	spawn: function(parent){
		parent.appendChild(this.DOMElement);
	},

	despawn: function(){
		this.DOMElement.parentElement.removeChild(this.DOMElement);
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
	constructor:function(tag){this.base(tag)},

	// Inherited methods
	spawn:function(parent){this.base(parent)},
	despawn: function(){this.base();},
	disable:function(){this.base()},
	enable:function(){this.base()}
});

// Button class extends Component
var Button = Component.extend({
	constructor: function (caption, action) {
		this.base('button');
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
	spawn: function(parent){this.base(parent)},
	despawn: function(){this.base();},
	disable: function(){this.base();},
	enable: function(){this.base();}
});

// Form extends Component
var Form = Component.extend({
	// action: a function, type: submit|instant, caption: caption of the submit|quit button
	constructor: function(action, type, caption){
		this.base('form');

		this.action = action;
		this.type = type;

		this.inputs = [];
		this.submit = new Button(caption, this.onSubmit);
		console.log(this);
	},

	addInput: function(name, type, dataType, label){
		console.log(this);
		if(this.type == "instant")
			input = new Input(name, type, dataType, label, this.onChange);
		else
			input = new Input(name, type, dataType, label);
		console.log(this);
		this.inputs.push(input);
	},

	onSubmit: function(e){
		e.preventDefault();
		data = {};

		component = this.parentElement.component;

		for(i in component.inputs){
			data[component.inputs[i].getName()] = component.inputs[i].getValue();
		}

		component.action(data);
	},

	onChange: function(e){
		e.preventDefault();
		data = {};
		component = this.parentElement.component;
		data[this.component.getName()] = this.component.getValue();

		component.action(data);
	},

	// Inherited methods
	spawn: function(parent){
		this.base(parent);
		for(i in this.inputs){
			this.inputs[i].spawn(this.DOMElement);
		}
		this.submit.spawn(this.DOMElement);
	},

	despawn: function(parent){
		for(i in this.inputs){
			this.inputs[i].despawn();
		}
		this.submit.despawn();
		this.base();
	},

	disable:function(){
		this.base();
		this.submit.disable();
		this.inputs.forEach(function(input){
			input.disable();
		});
	},

	enable:function(){
		this.base();
		this.submit.enable();
		this.inputs.forEach(function(input){
			input.enable();
		});
	}	
});

// Input extend Component
var Input = Component.extend({
	constructor: function(name, type, dataType, label, action){
		this.base('input');

		this.DOMElement.setAttribute('name', name);
		this.DOMElement.setAttribute('type', type);

		this.dataType = dataType;
		this.action = action;
		this.name = name;
		this.type = type;

		if(label){
			randomId = Math.random().toString(36).substring(7);
			this.DOMElement.id = randomId;
			this.label = new Label(label, randomId);
		}

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
	spawn:function(parent){
		if(this.label)
			this.label.spawn(parent);
		this.base(parent)
	},
	despawn: function(){
		this.label.despawn();
		this.base();
	},
	disable:function(){
		this.label.disable();
		this.base();
	},
	enable:function(){
		this.label.enable();
		this.base();
	}
});

// Label extends Component
var Label  = Component.extend({
	constructor: function(caption, target){
		this.base('label');
		this.DOMElement.setAttribute('for', target);
		this.DOMElement.textContent = caption;
	},
	spawn:function(parent){this.base(parent)},
	despawn: function(){this.base();},
	disable:function(){this.base();},
	enable:function(){this.base();}
});