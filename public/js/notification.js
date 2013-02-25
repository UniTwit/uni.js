// notification.js

function Notification(config){
	var title = "Title";
	var message = "Message.";
	var timeCaption = "now";
	var lifetime = 10000;
	var prolongTime = 5000;
	var type = null;
	var img = null;
	var expand = false;
	var action = null;

	var notif = document.createElement("div");
	var container = document.getElementById('notifications');

	var timeoutId;
	var html

	if(config.title)
		title = config.title;
	if(config.message)
		message = config.message;
	if(config.timeCaption)
		timeCaption = config.timeCaption;
	if(config.lifetime)
		lifetime = config.lifetime;
	if(config.prolongTime)
		prolongTime = config.prolongTime;
	if(config.type)
		type = config.type;
	if(config.img)
		img = config.img;
	if(config.expand)
		expand = config.expand;
	if(config.action)
		action = config.action;

	var imgTag = "";
	var expandTag = "";

	if(img !== null){
		imgTag = "<img src='"+img+"' alt='"+title+"'/>";
	}

	if(expand){
		expandTag = "<i class='expand'></i>";
	}

	html = imgTag+"<header>"+title+"<span><time>"+timeCaption+"</time>"+expandTag+"<i class='close'></i></span></header><p>"+message+"</p>";

	notif.innerHTML = html;
	if(type)
		notif.classList.add(type);

	var despawn = function(){
		notif.classList.add('despawn');
		setTimeout(deleteFromDOM, 2000);
	}

	var close = function(e){
		e.stopPropagation();
		if(action)
			notif.addEventListener('click', action);
		notif.removeEventListener('mouseover', cancelDespawn, true);
		notif.removeEventListener('mouseout', prolong, true);
		notif.classList.add('close');
		clearTimeout(timeoutId);
		setTimeout(deleteFromDOM, 2000);
	}

	var deleteFromDOM = function(){
		container.removeChild(notif);
		clearTimeout(timeoutId);
	}

	var cancelDespawn = function(){
		notif.classList.remove('despawn');
		clearTimeout(timeoutId);
	}

	var prolong = function(){
		timeoutId = setTimeout(despawn, prolongTime);
	}

	var spawn = function(){
		if(container.hasChildNodes()){
			container.insertBefore(notif, container.firstElementChild);
		}else{
			container.appendChild(notif);
		}
		timeoutId = setTimeout(despawn, lifetime);
		notif.classList.remove('despawn');
		notif.classList.remove('close');
	}


	closeButton = notif.getElementsByClassName('close')[0];
	closeButton.addEventListener('click', close);

	if(action){
		notif.classList.add('actionnable');
		notif.addEventListener('click', action);
	}

	notif.addEventListener('mouseover', cancelDespawn, true);
	notif.addEventListener('mouseout', prolong, true);


	this.spawn = spawn;
}