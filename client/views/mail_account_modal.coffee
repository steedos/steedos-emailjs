Template.mailAccount.helpers

    schema: ->
        return db.mail_accounts._simpleSchema;

    space: ->
        return db.mail_accounts.findOne({owner: Meteor.userId()})



Meteor.startup ->

    AutoForm.hooks

        updateMailAccount:
            
            onSuccess: (formType, result) ->
                toastr.success t('saved_successfully');
                
                AccountManager.checkAccount ()->
                    Modal.hide("mailAccount");


            onError: (formType, error) ->
                if error.reason
                    toastr.error error.reason
                else 
                    toastr.error error
