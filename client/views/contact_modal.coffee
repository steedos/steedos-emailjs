Template.contacts_modal.helpers
    contactsListData: ()->
        console.log("contactsListData...")
        return {defaultValues:MailManager.getContacts(this.targetId)};

Template.contacts_modal.events
    'click #confirm': (event, template) ->
        console.log("..confirm");
        
        # targetId = template.data.targetId;

        selectize = template.data.target[0].selectize

        values = ContactsManager.getContactModalValue();

        values.forEach (value)->
           console.log value.name
           selectize.createItem(value.name + "<" + value.email + ">")

        Modal.hide("contacts_modal");

