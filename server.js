var https = require('https');
var URL = require('url');
var fs = require('fs');
var mime = require('mime');
var exec = require('child_process').exec;
var child;
var qs = require('querystring');

//variables auxiliares
var port = 443;
var key = "";
var device = "LG_MKJ39170805_TV";
var device = "LG";
var device = "LG";
var remote = {
		name:		"LG",
		power:		"KEY_POWER", 
		tv:		"KEY_TV", 
		source:		"INPUT", 
		menu:		"KEY_MENU", 
		info:		"KEY_INFO", 
		mute:		"KEY_MUTE", 
		list:		"KEY_LIST", 
		1:		"KEY_1", 
		2:		"KEY_2",
		3:		"KEY_3",
		4:		"KEY_4",
		5:		"KEY_5",
		6:		"KEY_6",
		7:		"KEY_7",
		8:		"KEY_8",
		9:		"KEY_9",
		0:		"KEY_0",
		up:		"\\^",
		left:		"\\<",
		ok:		"KEY_OK",
		right:		"\\>",
		down:		"KEY_V",
		vol_up:		"KEY_VOLUMEUP",
		vol_down:	"KEY_VOLUMEDOWN",
		ch_up:		"KEY_CHANNELUP",
		ch_down:	"KEY_CHANNELDOWN"
};
	
//Inicialización

child = exec('sudo systemctl restart lirc.service',
	function  (error, stdout, stderr) {
		if (error === null) {
			console.log('server inicializado en el puerto: ' + port);
		}
	}
);

const options = {
	key: fs.readFileSync('keys/key.pem'),
    cert: fs.readFileSync('keys/certificate.pem')
	// ca: fs.readFileSync('keys/intermediate.crt')
};

https.createServer(options, function(request, response){
	var model = {
		button: function () {
			console.log('irsend SEND_ONCE ' + device + ' ' + remote[key]);
			child = exec('irsend SEND_ONCE ' + device + ' ' + remote[key],
  				function (error, stdout, stderr) {
    					if (error !== null) {
    						console.log('exec error: ' + error);
    					}
				});
		}
	} 
	var view = { 
			render: function (file,r1) { 
				fs.readFile('app.html', 'utf-8', function (err, app) {
				if (!err) {
					fs.readFile(file, 'utf-8', function(err, view) {
						if (!err) {
							var data = app.replace(/<%view%>/, view);
							data = data.replace(/<%r1%>/, r1);
							response.writeHead(200, {
								'Content-Type': 'text/html'
							});
							response.end(data);
						} else {
							view.error(500, "Error al renderizar la vista");
						};
					});
				} else {
					view.error(500, "Error en la vista");
				}
			});
		},

		file: function(file) {
			fs.readFile(file, function(err, data) {
				if (!err){
					response.writeHead(200, {
						'Content-Type': mime.lookup(file),
						'Content-Length': data.length
					});
					response.end(data);
				} else {
					view.error (500, file + " not found");
				};
			});
		},
		error: function(code, msg) {
			response.writeHead(code); 
		response.end(msg);
		}
	}
	var controller = {
		index: function () {
			view.render('index.html',"");
		},

		player: function () {
			view.render('player.html',"");
		},

		button: function () {
			model.button();
			view.render('index.html',"");
		},
		
		file: function () { view.file(url.pathname.slice(1)); }
	}

	var url = URL.parse(request.url, true);
	var post_data = "";
	request.on('data', function (chunk) { post_data += chunk; });
   	request.on('end', function() {

    	post_data = qs.parse(post_data);
    	key = (post_data.button || url.query.button);
    	console.log(key);
   		var route = (post_data._method || request.method) + ' ' + url.pathname;
   		console.log('Ruta: ' + route);
    	switch (route) {
    	  	case 'GET /'		: { controller.index(); break; }
    	  	case 'GET /player'	: { controller.player(); break; }
    	  	case 'POST /remote'	: { controller.button(); break; }
			default: {
				if (request.method == 'GET') {
					controller.file();
				} else {
					view.error(400, "Petición no contemplada ruta: " + route);
				}
			}
		}
  	});
}).listen(port);
