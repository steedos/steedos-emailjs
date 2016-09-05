SmtpClientManager = {};

var MimeBuilder, SmtpClient, MimeCodec, fs;

if(window.require){
	MimeBuilder = window.require('emailjs-mime-builder');
	SmtpClient  = window.require('emailjs-smtp-client');
	MimeCodec = require('emailjs-mime-codec');
	fs = window.require('fs');
}


SmtpClientManager.getClient = function(){
	var auth = AccountManager.getAuth();
	if(!auth)
		return ;
	var domain = AccountManager.getMailDomain(auth.user);
	
	var client = new SmtpClient(domain.smtp, domain.smtp_port,{auth:auth});

	return client;
}


SmtpClientManager.sendMail = function(to, cc, bcc,subject, body, attachments){
	
	console.log("SmtpClientManager.sendMai start");

	var auth = AccountManager.getAuth();
	var from = auth.user;

	var	client = SmtpClientManager.getClient();

    var alreadySending  = false;

	client.onidle = function(){
	    console.log("Connection has been established");
	    if(alreadySending ){
	    	client.close();
	    	return 
	    }

	    alreadySending = true;

	    var evnelope = {from: from, to: to};

	    if(cc && cc.length > 0){
	    	evnelope.cc = cc;
	    }

	    if(bcc && bcc.length > 0){
	    	evnelope.bcc = bcc ;
	    }

	    client.useEnvelope(new MimeBuilder().addHeader(evnelope).getEnvelope());
	}

	client.onready = function(){	

		var message = MailMimeBuilder.getMessageMime(from, to, cc, bcc, subject, body, attachments);

		client.send(message);

	    client.end();
	}
    client.connect();

	client.close();
}



