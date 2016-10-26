MailManager = {};

MailManager.initMail = function(callback){
  $(document.body).addClass('loading');
  Session.set("mailInit", false);
  //MailCollection.init();
  if(AccountManager.getAuth()){
    ImapClientManager.mailBox(null, function(){

      var inbox = MailManager.getBox("Inbox");

      ImapClientManager.initMailboxInfo(inbox, function(){
        ImapClientManager.updateUnseenMessages();
        Session.set("mailInit", true);
        Session.set("mailBoxInit", true);
        try{
          if(callback){
            if(typeof(callback) == 'function'){
              callback();
            }
          }
        }catch(e){
          console.error("MailManager.initMail callback function error:" + e);
        }
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
  // console.log(box);
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
  // console.log(box);
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

  var messages = MailManager.getMessages(MailCollection.getMessageCollection(Session.get("mailBox")), page, page_size);

  if(messages.length >= page_size){
    if(typeof(callback) == 'function'){
      callback();
    }
    return messages;
  }

  ImapClientManager.mailBoxMessages(Session.get("mailBox"), callback);

  return MailManager.getMessages(MailCollection.getMessageCollection(Session.get("mailBox")), page, page_size);
}

function getMesssageBodyPart(message){
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
      // console.log("mailMessageLoadding  " + message.uid);
      ImapClientManager.getMessageByUid(path, message.uid, getMesssageBodyPart(message),function(messages){
        Session.set("mailMessageLoadding",false);
        // console.log("set mailMessageLoadding is false");
        messages.forEach(function(m){
          // console.log("[updateSeenMessage] message is ");
          // console.log(m);
          // console.log("[updateSeenMessage] uid " + m.uid +" flags: " + m.flags)
          if(m.flags.indexOf("\\Seen") == -1){
            ImapClientManager.updateSeenMessage(path, message.uid, function(){
                ImapClientManager.updateUnseenMessages();
            });
          }
        });
      });
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
MailManager.search = function(searchKey, callback){

  if(!searchKey)
    return;

  var path = Session.get("mailBox");
  var queryKey = {};

  if(/.*[\u4e00-\u9fa5]+.*$/.test(searchKey)){
    queryKey = {subject: searchKey};
  }else if((path == 'Inbox') || (MailManager.getBoxBySpecialUse(path).specialUse == '\\Inbox')){
    queryKey = {or: {from: searchKey, subject: searchKey}};
  }else if((path == 'Sent') || (MailManager.getBoxBySpecialUse(path).specialUse == '\\Sent') || (path == 'Drafts') ||  (MailManager.getBoxBySpecialUse(path).specialUse == '\\Drafts')){
    queryKey = {or: {to: searchKey, subject: searchKey}};
  }else{
    queryKey = {or:{or: {to: searchKey, from: searchKey}},subject: searchKey};
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
  if(!box)
      return ;
  var sequence_s = box.info.exists <= MailPage.pageSize ? 1 : (box.info.exists - MailPage.pageSize + 1);

  ImapClientManager.getNewMessage(path, function(messages){
    if(messages.length > 0){
      ImapClientManager.selectMailBox(null, box, {readOnly:true}, function(){
        if(path == "Inbox"){
          ImapClientManager.updateUnseenMessages();
        }
        ImapClientManager.updateLoadedMxistsIndex(path, sequence_s);
      });
      console.log("MailManager.getNewBoxMessages length " + messages.length);
      if(typeof(callback) == 'function'){
        callback();
      }
    }else{
      if(typeof(callback) == 'function'){
        callback();
      }
    }
  });
}


MailManager.getDeleteBoxMessages = function(path){
  var box = MailManager.getBox(path);
  if(!box)
      return ;
  var sequence_s = box.info.exists <= MailPage.pageSize ? 1 : (box.info.exists - MailPage.pageSize + 1);
  if(path == "Inbox"){
    ImapClientManager.updateUnseenMessages();
  }
  ImapClientManager.getNewMessage(path, function(){
    ImapClientManager.selectMailBox(null, box, {readOnly:true}, function(){
      ImapClientManager.updateLoadedMxistsIndex(path, sequence_s);
      console.log("MailManager.getDeleteBoxMessages run ...." );
    });
  });
}

MailManager.deleteMessages = function(path, uids, callback){

  ImapClientManager.deleteMessages(null, path, uids, function(){

    FlowRouter.go('/emailjs/b/' + path);
    console.log("deleteMessages run ....");

    MailManager.getDeleteBoxMessages(path);
    callback();
  })
}


MailManager.completeDeleteMessages = function(path, uids, callback){
  console.log("MailManager.completeDeleteMessages :" );

  ImapClientManager.completeDeleteMessages(null, path, uids, function(){
    console.log("ImapClientManager.CompleteDeleteMessages run :");

    FlowRouter.go('/emailjs/b/' + path);

    MailManager.getDeleteBoxMessages(path);
    callback();
   })
}

MailManager.judgeDelete = function(path, uid, callback){
  if((path == 'Trash') || (MailManager.getBoxBySpecialUse(path).specialUse == '\\Trash')){
    MailManager.completeDeleteMessages(path, uid, function(){
      toastr.success("邮件已彻底删除");
    });
  }else{
    MailManager.deleteMessages(path, uid, function(){
      toastr.success("邮件已删除");
    });
  }
  if(typeof(callback) == 'function'){
    callback();
  }
}

MailManager.deleteDraftMessages = function(path, uid ,callback){
  console.log("MailManager.deleteDraftMessagess :" );
  ImapClientManager.completeDeleteMessages(null, path, uid, function(){
    MailManager.getDeleteBoxMessages(path);
    callback();
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
      c.email = c.email.replace("<","").replace(">","")
      contacts.push(c);
    })
  }
  return contacts;
}


// MailManager.moveMessages = function(uids, fromPath, toPath, callback){
//   ImapClientManager.moveMessages(null, fromPath, toPath, uids, callback);
// }
