'use strict';

var azbn = new require(__dirname + '/../../../../../system/bootstrap')({
	
});

var app = azbn.loadApp(module);

var argv = require('optimist')
	.usage('Usage: $0 --set=[json-filename]')
	.demand(['set'])
	.argv
;

var nm = require('nodemailer');

if(argv.set != '') {
	
	var set = app.loadJSON('sets/' + argv.set);
	var tpl = app.loadFile('tpls/' + set.tpl.file);
	var log = {
		items : {
			
		},
	};
	
	for(var i in set.tpl.vars) {
		
		var k = i;
		var v = set.tpl.vars[i];
		
		tpl = tpl.replace(new RegExp('({{' + k + '}})', 'ig'), v);
		
	}
	
	tpl = tpl.replace(new RegExp('({{set__msg__body}})', 'ig'), set.msg.body);
	
	var items = [];
	for(var i = 0; i < set.items.length; i++) {
		items.push(set.items[i]);
	}
	
	var transporter = nm.createTransport(set.account.transport);
	
	var itrv = setInterval(function(){
		
		if(items.length) {
			
			var item = items.shift();
			
			if(log.items[item.email]) {
				
			} else {
				
				var _tpl = tpl;
				
				for(var i in item.vars) {
					
					var k = i;
					var v = item.vars[i];
					
					_tpl = _tpl.replace(new RegExp('({{' + k + '}})', 'ig'), v);
					
				}
				
				transporter.sendMail({
					from : set.account.name + ' <' + set.account.login + '>',
					to : item.email,
					subject : set.msg.subject,
					html : _tpl,
				}, function(error, info){
					
					log.items[item.email] = {
						created_at : azbn.now(),
						error : error,
						info : info,
					}
					
					app.saveJSON('logs/' + argv.set, log);
					
					if(error){
						azbn.echo(item.email + ': Error: ' + error);
					} else {
						azbn.echo(item.email + ': Message sent: ' + info.response);
					}
					
				});
				
			}
			
		} else {
			
			azbn.echo('Email-queue is finished');
			process.exit(0);
			
		}
		
	}, set.interval);
	
}