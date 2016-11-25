MailUnseendisplay = {};

MailUnseendisplay.uidNumber = 5;

// MailUnseendisplay.getInboxLastUid = function(){
//   var conn = MailCollection.getMessageCollection("Inbox");
//   var messages = conn.find({},{sort: {uid:-1}, skip: 0, limit: 1}).fetch();
//   var uid_inbox_last = messages[0].uid;
//
//   if(window.localStorage){
//     window.localStorage.setItem("emailjs", uid_inbox_last);
//   }else{
//     console.error("浏览器不支持localstorage");
//     return false;
//   }
//   console.log("messages uid: " + uid_inbox_last);
// }


//获取前10的未读邮件的uid
 MailUnseendisplay.getUnseenUids = function(){
  var arr = MailCollection.mail_unseen.find().fetch();
  var uids = arr[0].uids;
  var unseenUids;
  var len = uids.length;

  if(len > MailUnseendisplay.uidNumber){
    unseenUids = uids.slice(len - MailUnseendisplay.uidNumber, len);
  }else {
    unseenUids = uids;
  }
  return unseenUids;
}

//获得inbox中message已经存到本地的uid
function getInboxUids(){
  var inboxUids = [];
  var conn = MailCollection.getMessageCollection("Inbox").find().fetch();
  var inboxUids = conn.getProperty("uid");
  return inboxUids;
}

//从inbox中message已经存到本地的uid中，选取包含的未读邮件的uid
function  getSameUids(inboxUids, uids){
  var sameUids = new Array();
  var c = uids.toString();
  for(var i=0; i<inboxUids.length; i++){

    if(c.indexOf(inboxUids[i].toString()) > -1){

      for(var j=0; j<uids.length; j++){
        if(inboxUids[i] == uids[j]){

          sameUids.push(inboxUids[i]);
          break;
        }
      }
    }
  }
  return sameUids;
}

//获取前10封未读邮件中message没有下载到本地的uid
function getOtherUnseenUids(unseenUids, sameUids){
  var otherUids = new Array();
  for(var i=0; i<sameUids.length; i++)
  {
    for(var j=0; j<unseenUids.length; j++)
    {
      if(unseenUids[j] == sameUids[i]){
        unseenUids.splice(j,1);
        j=j-1;
      }
    }
  }
  for(var j=0; j<unseenUids.length; j++)
  {
    otherUids.push(unseenUids[j]);
  }
  return otherUids;
}


//下载前未读邮件中本地不存在的message
MailUnseendisplay.listUnseenMessages = function(callback){
  var unseenUids = MailUnseendisplay.getUnseenUids();
  if((!unseenUids) || (unseenUids.length < 1)){
    return ;
  }
  var inboxUids = getInboxUids();
  var sameUids = getSameUids(inboxUids, unseenUids);
  var otherUnseenUids = getOtherUnseenUids(unseenUids, sameUids);

  if((!otherUnseenUids) || (otherUnseenUids.length < 1)){
    return ;
  }
  else{
    ImapClientManager.listMessages(null, "Inbox", otherUnseenUids, {byUid: true}, function(messages){
      if(typeof(callback) == 'function'){
        callback();
      }
    });
  }
}

//下载前5封未读邮件
// MailUnseendisplay.getUnseenMessages = function(callback){
// 	var client = ImapClientManager.getClient();
// 	if (!client)
// 		client = this.getClient();
//
// 	client.connect().then(function(){
// 		var inboxPath = "Inbox";
//
// 		client.search(inboxPath, {unseen:true}, {byUid: true}).then(function(result){
// 			var len = result.length;
// 			var unseenUids;
// 			if(!result || len == 0){
// 				return;
// 			}else if(len > MailUnseendisplay.uidNumber){
// 				unseenUids = result.slice(len - MailUnseendisplay.uidNumber, len);
// 			}else{
// 				unseenUids = result;
// 			}
//
// 			console.log("[MailUnseendisplay.getUnseenMessages] unseenUids is " + unseenUids);
//
// 			var query = ['uid', 'envelope'];
//
// 			client.listMessages(inboxPath, unseenUids, query, {byUid: true}).then(function(messages){
// 				//清空MailCollection.unseenCollection()
// 				MailCollection.unseenCollection().remove({});
//
// 				messages.forEach(function(message){
// 					if(message && message.uid){
// 						var hMessage = handerUnseenMessage(message);
// 						MailCollection.unseenCollection().insert(hMessage);
// 					}
// 				});
//
// 				console.log("MailUnseendisplay.listMessages + messages length is " + messages.length);
//
// 				client.close();
//
// 				if(typeof(callback) == "function"){
// 					callback();
// 				}
// 			});
// 		})
// 	})
// }
//
//
// function handerUnseenMessage(message){
//
// 	var rev = {};
//
// 	var envelope = message["envelope"];
// 	rev.uid = message.uid;
// 	rev.flags = message.flags;
// 	rev.date =envelope.date;
// 	rev.subject = envelope.subject;
// 	rev.from = envelope.from;
// 	rev.sender = envelope.sender;
// 	rev.reply_to = envelope["reply-to"];
// 	rev.to = envelope.to;
// 	rev.cc = envelope.cc;
// 	rev.bcc = envelope.bcc;
// 	rev.in_reply_to = envelope["in-reply-to"];
//
// 	return rev;
// }
