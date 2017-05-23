'use strict';

var azbn = new require(__dirname + '/../../../../../system/bootstrap')({
	
});

var app = azbn.loadApp(module);

var argv = require('optimist')
	.usage('Usage: $0 --list=[txt-filename]')
	.demand(['set'])
	.argv
;

if(argv.list != '') {
	
	//app.saveJSON('sets/' + argv.list, set);
	
	var list = app.loadFile('sets/' + argv.list + '.txt');
	var list_arr = list.split("\n");
	
	var set = {
		account : {
			name : 'Имя аккаунта для рассылки',
			login : 'Логин аккаунта',
			pass : 'Пароль (необяз.)',
			transport : 'smtps-транспорт',
		},
		tpl : {
			file : argv.list + '.html',
			vars : {},
		},
		msg : {
			subject : 'Тема рассылки',
			body : 'Текст рассылки. Поддерживает HTML',
		},
		interval : 5000,
		items : [],
	};
	
	if(list_arr.length) {
		
		for(var i = 0; i < list_arr.length; i++) {
			
			var email = list_arr[i];
			
			set.items.push({
				email : email,
				vars : {},
			});
			
		}
		
	}
	
	app.saveJSON('sets/' + argv.list, set);
	
}