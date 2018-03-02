MailManager = {};

MailManager.initMail = function(callback){
  // $(document.body).addClass('loading');
  Session.set("mailInit", false);
  if(AccountManager.getAuth()){
    ImapClientManager.mailBox(null, function(){
      var inbox = MailManager.getBox("Inbox");

      ImapClientManager.initMailboxInfo(inbox, function(){
        ImapClientManager.updateUnseenMessages(function(){
          //下载前5封未读邮件中本地不存在的message
          MailUnseendisplay.listUnseenMessages(function(){
            try{
              if(callback){
                if(typeof(callback) == 'function'){
                  callback();

                  draftBox = MailManager.getBoxBySpecialUse("\\Drafts");

                  ImapClientManager.initMailboxInfo(draftBox, function(){});
                }
              }
            }catch(e){
              console.error("MailManager.initMail callback function error:" + e);
            }
          });
        })

        Session.set("mailInit", true);
        Session.set("mailBoxInit", true);

        $(document.body).removeClass('loading');
      })
    });

    setTimeout(MailQuartz.getNewMessages, 1000 * 120);
  }
}


MailManager.getBoxInfo = function(path){

  if(!MailCollection.mail_box_info)
    return ;

  return MailCollection.mail_box_info.findOne({path: path})
}

MailManager.getBox = function(path){
  if (!MailCollection.mail_box)
    return ;

  var box = MailCollection.mail_box.findOne({path: path})
  if(!box)
    return ;
  box.info = MailManager.getBoxInfo(path);
  return box;
}

MailManager.getBoxBySpecialUse = function(specialUse){

  if(!MailCollection.mail_box){
    return ;
  }

  var box = MailCollection.mail_box.findOne({specialUse: specialUse})
  if(!box){
    var path = specialUse.replace("\\","");
    box = MailManager.getBox(path);
}
  if(!box)
    return ;
  box.info = MailManager.getBoxInfo(box.path);
  return box;
}

MailManager.getOtherBoxs = function(){

  if(!MailCollection.mail_box)
    return ;

  var unPath = ["Inbox", "Sent", "Drafts", "Junk", "Trash", "Archive"]

  var unSpecialUse = ["\\Inbox", "\\Sent", "\\Drafts", "\\Junk", "\\Trash", "\\Archive"]

  return MailCollection.mail_box.find({path:{$nin:unPath}, specialUse:{$nin:unSpecialUse}}).fetch();
}

MailManager.getBoxs = function(){
  if(!MailCollection.mail_box)
    return ;

  return MailCollection.mail_box.find().fetch();
}

MailManager.getMessages = function(collection, page, page_size){
  if(!collection)
    return ;

  return collection.find({},{sort: {uid:-1}, skip: page * page_size, limit: page_size}).fetch();
}

MailManager.getBoxMessagesByUids = function(uids, page, page_size ,callback){
  var path = Session.get("mailBox");
  callback();
  return MailCollection.getMessageCollection(Session.get("mailBox")).find({uid:{$in: uids}}, {sort: {uid:-1}, skip: page * page_size, limit: page_size}).fetch();
}


MailManager.getboxMessages = function(page, page_size, callback){
  var path = Session.get("mailBox");
  var messages = MailManager.getMessages(MailCollection.getMessageCollection(path), page, page_size);

  var box = MailManager.getBox(path);
  var lastPage ;
  if((!box)||(!box.info) || (box == undefined) ||(box.info == undefined)){
    lastPage = 0;
  }else{
    lastPage = MailPage.pageCount(box.info.exists);
  }

  if(((Session.get("mailPage") == 1)&&(lastPage != 1)&&(messages.length >= page_size)) || ((Session.get("mailPage") == lastPage)&&(messages.length >= 1))||((Session.get("mailPage") != 1)&&(messages.length >= page_size)) || ((Session.get("mailMessageNull") && (messages.length == 0)))){
  if(typeof(callback) == 'function'){
      callback();
    }
    return messages;
  }

  ImapClientManager.mailBoxMessages(Session.get("mailBox"),function(message){
    if(message == undefined){
      Session.set("mailMessageNull",true);
    }
  });

  return MailManager.getMessages(MailCollection.getMessageCollection(Session.get("mailBox")), page, page_size);
}

MailManager.getSearchMessages = function(uids, path, page, page_size, callback){
    console.info("MailManager.getSearchMessages is running");

    var page_s = page*page_size;
    var page_e = (page+1)*page_size;

  	var pageUids = uids.slice(page_s, page_e);

    ImapClientManager.listSearchMessages(null, path, pageUids, {byUid: true}, callback);

    callback();
    return MailCollection.searchMessageCollection(path).find({uid:{$in: uids}}, {sort: {uid:-1}, skip: page * page_size, limit: page_size}).fetch();
}

MailManager.getMesssageBodyPart = function(message){
  if(!message.bodyHtml && !message.bodyText)
    return;

  return  message.bodyHtml? message.bodyHtml.bodyPart: message.bodyText.bodyPart
}

MailManager.getMessage = function(uid){
  var path = Session.get("mailBox");
  var message = MailCollection.getMessageCollection(path).findOne({uid: uid});
  if (!message)
    return {};

  if(message.summary == true){

    if(Session.get("mailMessageLoadding") == false){
      Session.set("mailMessageLoadding",true);

      var getMessage = function (path, message) {
		  ImapClientManager.getMessageByUid(path, message.uid, MailManager.getMesssageBodyPart(message),function(messages){
			  Session.set("mailMessageLoadding",false);
			  messages.forEach(function(m){
				  if(m.flags.indexOf("\\Seen") == -1){
					  if(path == "Inbox"){
						  var tempM = MailCollection.getMessageCollection(path).findOne({uid:m.uid})
						  if(tempM && tempM.dispositionNotificationTo){
							  Session.set("isDispositionNotificationAlertNeeded", true);
						  }
					  }
					  ImapClientManager.updateSeenMessage(path, message.uid, function(){
						  ImapClientManager.updateUnseenMessages();
					  });
				  }
			  });
		  });
	  }

      ImapClientManager.getBodystructure(null, path, message.uid, getMessage)
    }
  }
  return message;
}

MailManager.getMessageByUid = function(path, uid){

  if(!MailCollection.getMessageCollection(path))
    return ;

  return MailCollection.getMessageCollection(path).findOne({uid: uid});
}



MailManager.getUnseenUid = function(){
  if(!MailCollection.mail_unseen)
    return
  return MailCollection.mail_unseen.findOne();
}


/*
queryKey : {
    keyword:'',
    subject: true,
    body: true,
    attachment: true,
    from: '',
    to: '',
    date: {
        start :yyyy-mm-dd,
        end: yyyy-mm-dd
        }
    }
*/
MailManager.search = function(searchKey, type, callback){

  if(!searchKey)
    return;

  if(typeof type == "function"){
    callback = type
    type = "all"
  }

  var path = Session.get("mailBox");
  var queryKey = {};

  if(type == "subject"){
    queryKey = {subject: searchKey};
  }
  else{
    if(/.*[\u4e00-\u9fa5]+.*$/.test(searchKey)){
      if(type == "address"){
        queryKey = {from: searchKey};
      }
      else{
        queryKey = {subject: searchKey};
      }
    }else if((path == 'Inbox') || (MailManager.getBoxBySpecialUse(path).specialUse == '\\Inbox')){
      if(type == "address"){
        queryKey = {from: searchKey};
      }
      else{
        queryKey = {or: {from: searchKey, subject: searchKey}};
      }
    }else if((path == 'Sent') || (MailManager.getBoxBySpecialUse(path).specialUse == '\\Sent') || (path == 'Drafts') ||  (MailManager.getBoxBySpecialUse(path).specialUse == '\\Drafts')){
      if(type == "address"){
        queryKey = {to: searchKey};
      }
      else{
        queryKey = {or: {to: searchKey, subject: searchKey}};
      }
    }else{
      if(type == "address"){
        queryKey = {or:{or: {to: searchKey, from: searchKey}}};
      }
      else{
        queryKey = {or:{or: {to: searchKey, from: searchKey}},subject: searchKey};
      }
    }
  }

  ImapClientManager.search(null, path, queryKey,function(result){
    callback(result);
  })
}

MailManager.getLastMessage = function(){
  var uid = parseInt(Session.get("mailMessageId"));
  var path = Session.get("mailBox");

  var currentMessage = MailCollection.getMessageCollection(path).findOne({uid: uid});
  if (!currentMessage)
      return ;

  var message = MailCollection.getMessageCollection(path).findOne({uid: {$gt: currentMessage.uid}}, {sort: {uid: 1}, limit:1});
  if (!message)
      return;
  Session.set("mailMessageId",message._id);
}

MailManager.getNextMessage = function(){
  var uid = parseInt(Session.get("mailMessageId"));
  var path = Session.get("mailBox");

  var currentMessage = MailCollection.getMessageCollection(path).findOne({uid: uid});
  if (!currentMessage)
      ImapClientManager.mailBoxMessages(Session.get("mailBox"));

  var message = MailCollection.getMessageCollection(path).findOne({uid: {$lt: currentMessage.uid}}, {sort: {uid: -1}, limit:1});
  if (!message)
      return;
  Session.set("mailMessageId",message._id);
}


MailManager.selectMailBox = function(mailBox){
  ImapClientManager.selectMailBox(null, mailBox, {readOnly:true}, function(){
      console.log("MailManager.selectMailBox run 。。。。。 ");
  });
}


MailManager.getNewBoxMessages = function(path, callback){
  var box = MailManager.getBox(path);
  if(!box || !box.info)
      return ;
  var sequence_s = box.info.exists <= MailPage.pageSize ? 1 : (box.info.exists - MailPage.pageSize + 1);

  ImapClientManager.getNewMessage(path, function(messages){
    // if(messages.length > 0){
      ImapClientManager.selectMailBox(null, box, {readOnly:true}, function(){
        if(path == "Inbox"){
          ImapClientManager.updateUnseenMessages();
        }
        ImapClientManager.updateLoadedMxistsIndex(path, sequence_s);
      });
      if(typeof(callback) == 'function'){
        callback(messages);
      }
    // }else{
    //   if(typeof(callback) == 'function'){
    //     callback();
    //   }
    // }
  });
}


MailManager.updateBoxInfo = function(path){
  var box = MailManager.getBox(path);
  if(!box)
      return ;
  //var sequence_s = box.info.exists <= MailPage.pageSize ? 1 : (box.info.exists - MailPage.pageSize + 1);
  if(path == "Inbox"){
    ImapClientManager.updateUnseenMessages();
  }
  ImapClientManager.getNewMessage(path, function(){
    ImapClientManager.selectMailBox(null, box, {readOnly:true}, function(){
      //ImapClientManager.updateLoadedMxistsIndex(path, sequence_s);
      console.log("MailManager.updateBoxInfo run ...." );
    });
  });
}

MailManager.deleteMessages = function(path, uids, callback){
  ImapClientManager.deleteMessages(null, path, uids, function(){
    MailManager.updateBoxInfo(path);
    callback();
  })
}


MailManager.completeDeleteMessages = function(path, uids, callback){
  ImapClientManager.completeDeleteMessages(null, path, uids, function(){
    MailManager.updateBoxInfo(path);
    callback();
   })
}

MailManager.judgeDelete = function(path, uid){
  if((path == 'Trash') || (MailManager.getBoxBySpecialUse(path).specialUse == '\\Trash')){
    MailManager.completeDeleteMessages(path, uid, function(){
      toastr.success("邮件已彻底删除");
    });
  }else{
    MailManager.deleteMessages(path, uid, function(){
      toastr.success("邮件已删除");
    });
  }
}

MailManager.deleteDraftMessages = function(path, uid){
  ImapClientManager.completeDeleteMessages(null, path, uid, function(){
    MailManager.updateBoxInfo(path);
   })
}


MailManager.resetHrefs = function(data){

  if(!data)
    return '';

  data = data.replace("<html","<div ").replace("</html>","</div>");

  data = "<div class='steedos-mail-body-html'>" + data + "</div>"

  var nodes = $(data);
  nodes.find("style").remove();

  nodes.find("a").attr("target","_blank");

  var html = "";

  nodes.each(function(){
    if(this.outerHTML){
        html += this.outerHTML;
    }else{
        html += this.textContent;
    }
  });
  return html;
}


MailManager.getAddress = function(address){
  var arrs  = new Array();
  address.forEach(function(a){
    arrs.push(a.name + " <" + a.email + ">");
  });
  return arrs;
}


MailManager.getContacts = function(id){
  var values = $("#"+id).val();
  var contacts = new Array()
  if(values){
    values.forEach(function(v){
      var c = JSON.parse(v);
      c.email = c.email.replace("<","").replace(">","");
	  c.address = c.email;
      contacts.push(c);
    })
  }
  return contacts;
}

//
// MailManager.judgeClickEvent = function(){
//   if(event.target.id == "compose-draft"){
//     return true;
//   }
//   return false;
// }


MailManager.moveMessages = function(uids, fromPath, toPath, callback){
  ImapClientManager.moveMessages(null, fromPath, toPath, uids, callback);
}


MailManager.i18n = function(key){
  var key2 = "mail_" + key.toLowerCase();
  var str = t(key2);

  if(str == key2)
    return t(key);

  return str;
}


MailManager.saveDrafts = function(message){
  path = Session.get("mailBox")

  draftBox = MailManager.getBoxBySpecialUse("\\Drafts");

  function _save(message){
    box = MailManager.getBox(Session.get("mailBox"))
    newUid = box.info.uidNext;
    ImapClientManager.upload(null, draftBox.path, message, function(){
      MailManager.getNewBoxMessages(draftBox.path, function(){
        Session.set("mailLoading",false);
        uid = Session.get("mailMessageId")
        if (path == 'Drafts' || MailManager.getBoxBySpecialUse(path).specialUse == '\\Drafts' || uid == "compose"){
          FlowRouter.go('/emailjs/b/drafts/' + draftBox.path + '/'+newUid)
          if (uid != "compose")
            MailManager.deleteDraftMessages(draftBox.path, [parseInt(uid)])
        }

        Session.set("mailSending",false);
        toastr.success("存草稿成功");
      })

    })

  }

  if(draftBox.info){
    _save(message)
  }
}


MailManager.mailCodeDownload = function(path, uid, callback){
	var message = MailManager.getMessage(parseInt(uid));
	var filename = message.subject;

	ImapClientManager.getMailCode (path, uid, function(code){
		fs.exists(dirname, function(exists){
			if(!exists){
				fs.mkdir(dirname, function(err) {
	                if (err) {
	                    toastr.error(err);
	                }else{
	                	MailAttachment.save(filename, code, function(dirname, name, filePath){
							callback(dirname, name, filePath);
						})
	                }
	            })
			}else{
				MailAttachment.save(filename, code, function(dirname, name, filePath){
					callback(dirname, name, filePath);
				})
			}
		})
	});
}
