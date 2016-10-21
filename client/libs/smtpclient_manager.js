SmtpClientManager = {};

var MimeBuilder, SmtpClient, MimeCodec, fs;

if(Steedos.isNode()){
	MimeBuilder = require('emailjs-mime-builder');
	SmtpClient  = require('emailjs-smtp-client');
	MimeCodec = require('emailjs-mime-codec');
	fs = nw.require('fs');
}


SmtpClientManager.getClient = function(){
	var auth = AccountManager.getAuth();
	if(!auth)
		return ;
	var domain = AccountManager.getMailDomain(auth.user);

	var options = {auth:auth};

	if (!domain.smtp_ssl){
		options.useSecureTransport = false;
		options.ignoreTLS = true;
	}

	var client = new SmtpClient(domain.smtp_server, domain.smtp_port, options);

	return client;
}


SmtpClientManager.sendMail = function(to, cc, bcc,subject, body, attachments, callback){
	var client;
	try{
		//toastr.info("邮件发送中...");
		console.log("SmtpClientManager.sendMai start");

		var auth = AccountManager.getAuth();
		var from = auth.user;

		client = SmtpClientManager.getClient();

	  var alreadySending  = false;

		client.onidle = function(){
		    console.log("Connection has been established");
		    if(alreadySending ){
		    	client.close();
		    	return
		    }

		    alreadySending = true;

		    var evnelope = {from: from, to: to.getProperty("email")};

		    if(cc && cc.length > 0){
		    	evnelope.cc = cc.getProperty("email");
		    }

		    if(bcc && bcc.length > 0){
		    	evnelope.bcc = bcc.getProperty("email") ;
		    }

		    client.useEnvelope(new MimeBuilder().addHeader(evnelope).getEnvelope());
		}

		client.onready = function(){

			var message = MailMimeBuilder.getMessageMime(Meteor.user().username + " <" + from + ">", to, cc, bcc, subject, body, attachments);

			client.send(message);

		    client.end();
		}

    client.ondone = function(success){
    	if(success){
    		toastr.success("发送成功");
				Session.set("mailSending",false);
				callback();
 			}else{
 				toastr.success("发送不成功");
 			}
    }

    client.onerror = function(err){
    	client.onclose(isError);
    }

    client.connect();

	}catch(e){
		console.error(e);
	}finally{
     	client.close();
    }
}
