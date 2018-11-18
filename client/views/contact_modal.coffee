Template.contacts_modal.helpers
    contactsListData: ()->
        console.log("contactsListData...")
        # return {defaultValues:MailManager.getContacts(this.targetId)}; 
        return {}
    subsReady: ->
        return Steedos.subsAddressBook.ready() and Steedos.subsSpace.ready();

Template.contacts_modal.events
#	'shown.bs.modal #contacts_modal': (event, template) ->
#		debugger;
#		$(".steedos-mail-contacts-modal").css("max-height", ($(window).height() - 180 - 25) + "px")

    'click #confirm': (event, template) ->
        console.log("..confirm");
        
        targetId = template.data.targetId;
        ifrFsshWebMail = $("#fssh-webmail-iframe");
        ifrSogoWeb = $("#sogo-web-iframe");

        if $("#"+template.data.targetId).length > 0

            selectize = $("#"+template.data.targetId)[0].selectize

            values = ContactsManager.getContactModalValue();

            values.forEach (value)->
    #           console.log value.name
               selectize.createItem(value.name + "<" + value.email + ">")
        else if ifrSogoWeb.length
            # sogo邮件系统
            values = ContactsManager.getContactModalValue();
            values.forEach (value)->
                ifrSogoWeb[0].contentWindow.addRecipient(value.name + " <" + value.email + ">","to")
                ifrSogoWeb.contents().find("md-autocomplete-wrap input").eq(0).trigger("click")
        else if ifrFsshWebMail.length
            # fssh中邮邮件系统
            values = ContactsManager.getContactModalValue();
            values.forEach (value)->
                ifrFsshWebMail[0].contentWindow.O(targetId).addressAdd('"'+value.name+'" &lt;'+value.email+'&gt;')

        Modal.hide(template);

Template.contacts_modal.onRendered ->
	$(".steedos-mail-contacts-modal").css("height", ($(window).height() - 180 - 25) + "px")
