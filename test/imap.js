'use strict';

var ImapClient = require('emailjs-imap-client')
var client = new ImapClient('imap.mxhichina.com', '143',{auth:{user:'baozhoutao@hotoa.com',pass:'Bobtotal0106'}})

client.connect().then(() => { 
	client.listMailboxes().then((mailboxes) => {

		console.log("loading listMailboxes start..."); 
		console.log("mailboxes is " + mailboxes.children.length);  

		var children = mailboxes.children;
		children.forEach(function(c){
			console.log("box name is " + c.name + "; box object is" + JSON.stringify(c))
		});

	})

});


// client.listMailboxes().then((mailboxes) => {

// 	console.log("client.listMailboxe start..."); 
// 	console.log("mailboxes.children is " + mailboxes.children.length);  

// 	var children = mailboxes.children;
// 	children.forEach(function(c){
// 		console.log(JSON.stringify(c))
// 	});
// 	console.log("client.listMailboxe end..."); 

// })