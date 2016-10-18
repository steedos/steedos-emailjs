Template.read_mail.helpers
  message: ->
    if Session.get("mailInit")
      uid = Session.get("mailMessageId");

      return MailManager.getMessage(parseInt(uid)) ;

  path: ->
    return Session.get("mailBox");

  attachmentIcon: (name)->
    return MailAttachment.getAttachmentIcon(name);

  modifiedString: (date)->
    modifiedString = moment(date).format('YYYY-MM-DD HH:mm');
    return modifiedString;

  showLoadding: ->
    return Session.get("mailMessageLoadding");

  mailBody: (message)->
    if !message || message.uid == undefined
      return '';

    if message.bodyHtml?.data
      data = message.bodyHtml.data;

      return MailManager.resetHrefs(data);
    else
      return message.bodyText.data;

  addressName: (from, to, cc)->
    path = Session.get("mailBox");
    if path == MailManager.getBoxBySpecialUse("\\Inbox").path
      address = "<" + from[0].address + ">"
      return if from[0].name then from[0].name + address else address
    else
      if cc then MailManager.convertHeaderAddress(to.concat(cc)).toString() else MailManager.convertHeaderAddress(to).toString()



  fileSize: (size)->
    rev = size / 1024.00;
    unit = 'KB';

    if rev > 1024.00
      rev = rev / 1024.00;
      unit = 'MB';

    if rev > 1024.00
      rev = rev / 1024.00;
      unit = 'GB';

    return rev.toFixed(2) + unit;

Template.read_mail.events
  'click .mailbox-attachment-name': (event, template)->
    console.log("----mailbox-attachment-name------");
    Session.set("donwLoadding",true)
    att_index = parseInt(event.target.dataset.index);

    path = Session.get("mailBox");

    message = MailManager.getMessage(parseInt(Session.get("mailMessageId")))

    uid = message.uid;

    att = message.attachments[att_index];

    MailAttachment.download path, uid, att.bodyPart, (dirname, name, filePath)->
      toastr.success("附件已存储");
      Session.set("donwLoadding",false)
      MailAttachment.openFile(dirname, name);

  'click .last_mail': (event, template)->
    console.log("click last_mail")
    MailManager.getLastMessage();

  'click .next_mail': (event, template)->
    console.log("click next_mail");
    MailManager.getNextMessage();
