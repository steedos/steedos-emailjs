# Template.emailjsLayout.onCreated ->
#   self = this;
#   $(window).resize ->
#       if $(window).width()<=1180
#           $("#emailjs_offcanvas").prop("disabled","true");
#           $("body").addClass("sidebar-collapse")
#       else
#           $("#emailjs_offcanvas").prop("disabled","");
#           $("body").removeClass("sidebar-collapse")

# Template.emailjsLayout.onRendered ->

#   self = this;

#   $('body').removeClass('fixed');
#   $(window).resize();



Template.emailjsLayout.helpers 
    
    subsReady: ->
        if Steedos.subsMail.ready()
            AccountManager.checkAccount (message)->
                if !message
                    Modal.hide("mailAccount");
                else
                    # toastr.error(message);
                    Modal.show("mailAccount");
            return true;
        return false;

Template.emailjsLayout.events
    "click #navigation-back": (e, t) ->
        NavigationController.back(); 
