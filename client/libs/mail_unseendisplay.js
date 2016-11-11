MailUnseendisplay = {};

MailUnseendisplay.uidNumber = 10;

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


//取前10的未读邮件的uid
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

//取得部分messages的uids
function getInboxUids(){
  var inboxUids = [];
  var conn = MailCollection.getMessageCollection("Inbox").find().fetch();
  var inboxUids = conn.getProperty("uid");
  return inboxUids;
}

//inbox前pageSize条中，包含未读邮件的uid
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

//前10的未读邮件的uid中, 不包含在inbox前pageSize条中的uid
function getOtherUnseenUids(uids, sameUids){
  for(var i=0; i<sameUids.length; i++)
      {
        for(var j=0; j<uids.length; j++)
        {
          if(uids[j] == sameUids[i]){
            uids.splice(j,1);
            j=j-1;
          }
        }
      }
    return uids;
}


//获取10封未读邮件的message
MailUnseendisplay.listUnseenMessages = function(){
  var unseenUids = MailUnseendisplay.getUnseenUids();
  var inboxUids = getInboxUids();
  var sameUids = getSameUids(inboxUids, unseenUids);
  var otherUnseenUids = getOtherUnseenUids(unseenUids, sameUids);

  var messages = MailCollection.getMessageCollection("Inbox").find({uid:{$in: otherUnseenUids}}, {sort: {uid:-1}, skip: 0, limit: 10}).fetch();

  unseenUids = MailUnseendisplay.getUnseenUids();
  if(messages.length < unseenUids.length){
    ImapClientManager.listMessages(null, "Inbox", unseenUids, {byUid: true}, function(messages){
      console.log("messages :>>>" + messages);
    });
  }else{
    return ;
  }
  //MailCollection.getMessageCollection("Inbox").find({uid:{$in: unseenUids}}, {sort: {uid:-1}, skip: 0, limit: 10}).fetch();
}
