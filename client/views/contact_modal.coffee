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

        if $("#"+template.data.targetId).length > 0

            selectize = $("#"+template.data.targetId)[0].selectize

            values = ContactsManager.getContactModalValue();

            values.forEach (value)->
    #           console.log value.name
               selectize.createItem(value.name + "<" + value.email + ">")
        else
            values = ContactsManager.getContactModalValue();
            values.forEach (value)->
                $("#fssh-webmail-iframe")[0].contentWindow.O(targetId).addressAdd('"'+value.name+'" &lt;'+value.email+'&gt;')

        Modal.hide(template);

Template.contacts_modal.onRendered ->
	$(".steedos-mail-contacts-modal").css("height", ($(window).height() - 180 - 25) + "px")
