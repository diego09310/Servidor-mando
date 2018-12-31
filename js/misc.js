$(document).ready(function() {
	$(".button").click(function() {
		sendKey(this.id);
	});
});

function sendKey(key) {
	var xmlhttp;
	if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
		xmlhttp=new XMLHttpRequest();
	} else {// code for IE6, IE5
		xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
	}

	xmlhttp.open("POST","/remote",true);
	xmlhttp.send("button="+key);
}
