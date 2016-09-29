MailManager = {};

MailManager.initMail = function(){
    $(document.body).addClass('loading');
    Session.set("mailInit", false);
    //MailCollection.init();
    if(window.require && AccountManager.getAuth()){
        ImapClientManager.mailBox(null, function(){
            ImapClientManager.initMailboxInfo(function(){
                ImapClientManager.updateUnseenMessages();
                Session.set("mailInit", true);
                $(document.body).removeClass('loading');
            })
        });

        setTimeout(MailQuartz.getNewMessages, 1000 * 120);
    }
}

MailManager.getBoxInfo = function(path){
    return MailCollection.mail_box_info.findOne({path: path})
}

MailManager.getBox = function(path){
    var box = MailCollection.mail_box.findOne({path: path})
    if(!box)
        return ;
    box.info = MailManager.getBoxInfo(path);
    // console.log(box);
    return box;
}

MailManager.getBoxBySpecialUse = function(specialUse){
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
    var unPath = ["Inbox", "Sent", "Drafts", "Junk", "Trash", "Archive"]

    var unSpecialUse = ["\\Inbox", "\\Sent", "\\Drafts", "\\Junk", "\\Trash", "\\Archive"]

    return MailCollection.mail_box.find({path:{$nin:unPath}, specialUse:{$nin:unSpecialUse}}).fetch();
}

MailManager.getBoxs = function(){
    return MailCollection.mail_box.find().fetch();
}

function getMessages (collection, page, page_size){
    return collection.find({},{sort: {uid:-1}, skip: page * page_size, limit: page_size}).fetch();
}

MailManager.getBoxMessagesByUids = function(uids, page, page_size){
    var path = Session.get("mailBox");
    return MailCollection.getMessageCollection(Session.get("mailBox")).find({uid:{$in: uids}}, {sort: {uid:-1}, skip: page * page_size, limit: page_size}).fetch();
}

MailManager.getboxMessages = function(page, page_size, callback){

    var messages = getMessages(MailCollection.getMessageCollection(Session.get("mailBox")), page, page_size);
    //TODO 待优化
    if(messages.length > 0){
        callback();
        return messages;
    }

    ImapClientManager.mailBoxMessages(Session.get("mailBox"), callback);

    return getMessages(MailCollection.getMessageCollection(Session.get("mailBox")), page, page_size);
}

function getMesssageBodyPart(message){
    return  message.bodyHtml? message.bodyHtml.bodyPart: message.bodyText.bodyPart
}

MailManager.getMessage = function(uid){
    var path = Session.get("mailBox");
    var message = MailCollection.getMessageCollection(path).findOne({uid: uid});
    if (!message)
        return {};

    if(message.summary == true){

        if(Session.get("mailMessageLoadding") != true){
            Session.set("mailMessageLoadding",true);
            console.log("mailMessageLoadding  " + message.uid);
            ImapClientManager.getMessageByUid(path, message.uid, getMesssageBodyPart(message),function(messages){
                Session.set("mailMessageLoadding",false);
                console.log("set mailMessageLoadding is false");
                messages.forEach(function(m){
                    console.log("[updateSeenMessage] uid " + m.uid +" flags: " + m.flags)
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
    return MailCollection.getMessageCollection(path).findOne({uid: uid});
}



MailManager.getUnseenUid = function(){
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
MailManager.search = function(queryKey, callback){

    if(!queryKey)
        return;

    var query = {};

    var path = Session.get("mailBox");

    if(queryKey.keyword){
        if(queryKey.attachment)
            query.TEXT = queryKey.keyword;
        else{

            if(queryKey.body){
                query.BODY = queryKey.keyword;
            }

            if(queryKey.subject){
                query.SUBJECT = queryKey.keyword;
            }
        }
    }

    if(queryKey.from){
        query.FROM = queryKey.from;
    }

    if(queryKey.to){
        query.TO = queryKey.to;
    }

    //query = {header: [queryKey.keyword]};
    query = {header: ['subject', queryKey.keyword]};
    //query = {keyword: 'queryKey.keyword'};
    //console.log("MailManager.search query ：" + query );
    ImapClientManager.search(null, path, query, callback);
    // ImapClientManager.search(null, path, query, function(result){
    //   var sequence = result.toString();
    //   var options = {byUid: true};
    //   ImapClientManager.listMessages(null, path, sequence, options, function(messages){
    //     callback(result, messages);
    //   });
    // });


    //ImapClientManager.listMessages(null, path, sequence, options, function(messages){
    // 	callback(result, messages);
    // })
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


MailManager.getNewInboxMessages = function(){
    var box = MailManager.getBox("Inbox");
    if(!box)
        return ;

    ImapClientManager.getNewMessage(box.path, function(messages){
        if(messages.length > 0){
            ImapClientManager.selectMailBox(null, box, {readOnly:true}, function(){
                ImapClientManager.updateUnseenMessages();
            });
            console.log("MailManager.getNewInboxMessages length" + messages.length);
        }

    });
}


MailManager.getNewBoxMessages = function(path){

    ImapClientManager.mailBoxNewMessages(path, function(messages){
        messages.forEach(function(message){
            console.log("MailManager.getNewBoxMessages" + message.uid);
        });
        console.log("#mail_list_load hide");
        $("#mail_list_load").hide();
    });
}


MailManager.deleteMessages = function(path, uids){
    $("#mail_list_load").show();
    ImapClientManager.deleteMessages(null, path, uids, function(){
        toastr.success("邮件已删除");
        FlowRouter.go('/emailjs/b/' + path);

        if(Object.prototype.toString.call(uids) === '[object Array]'){
            uids.forEach(function(uid){
                MailCollection.getMessageCollection(path).remove({'uid':parseInt(uid,10)});
            })
        }
        else
        {
            MailCollection.getMessageCollection(path).remove({'uid':uids});
        }

        var mailBox = MailManager.getBox(path);
        ImapClientManager.selectMailBox(null, mailBox, {readOnly:false}, function(m){
            MailManager.getNewBoxMessages(m.path);
        })
    })
}


MailManager.completeDeleteMessages = function(path, uids){
    $("#mail_list_load").show();
    console.log("MailManager.completeDeleteMessages :" );
    ImapClientManager.completeDeleteMessages(null, path, uids, function(){
        console.log("ImapClientManager.CompleteDeleteMessages run :");
        toastr.success("邮件已彻底删除");
        FlowRouter.go('/emailjs/b/' + MailManager.getBoxBySpecialUse("\\Trash").path);

        if(Object.prototype.toString.call(uids) === '[object Array]'){
            uids.forEach(function(uid){
                MailCollection.getMessageCollection(path).remove({'uid':parseInt(uid,10)});
            })
        }
        else
        {
            MailCollection.getMessageCollection(path).remove({'uid':uids});
        }

        var mailBox = MailManager.getBox(path);
        ImapClientManager.selectMailBox(null, mailBox, {readOnly:false}, function(m){
            MailManager.getNewBoxMessages(m.path);
        })
    })
}


MailManager.resetHrefs = function(data){
    data = data.replace("<html","<div ").replace("</html>","</div>");
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
MailManager.isTrashBox = function(path, uid){
    if((path == 'Trash') || (MailManager.getBoxBySpecialUse(path).specialUse == '\\Trash')){
        MailManager.completeDeleteMessages(path, uid);
    }else{
        MailManager.deleteMessages(path, uid);
    }
}

// Meteor.startup(function(){
//  MailManager.initMail();
// })

// MailManager.uniformPath = function(path){
//   var str = MailManager.getBoxBySpecialUse(path);
//   if(str.specialUse){
//     path = str.specialUse.replace("\\", "");
//   }
//   return path;
// }
