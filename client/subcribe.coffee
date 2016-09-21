Steedos.subsMail = new SubsManager();

Steedos.subsMail.subscribe "mail_domains"
Steedos.subsMail.subscribe "mail_addressBook"

Tracker.autorun (c)->
    if Meteor.userId()
        Steedos.subsMail.subscribe "mail_accounts"
        
 