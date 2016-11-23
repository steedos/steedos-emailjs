Template.emailjsLayout.onCreated ->
  self = this;
  # $(window).resize ->
  #     if $(window).width()<=1200
  #         $("body").addClass("sidebar-collapse")
  #     else
  #         $("body").removeClass("sidebar-collapse")

Template.emailjsLayout.onRendered ->
  # $(window).resize();



Template.emailjsLayout.helpers 
    
    subsReady: ->
        if Steedos.subsMail.ready()
            console.log "email start " + Date.parse(new Date());
            AccountManager.checkAccount (message)->
                console.log("email end " + Date.parse(new Date()));
                if !message
                    Modal.hide("mailAccount");
                else
                    setTimeout (->
                      Modal.show "mailAccount"
                      ),1000
    

            return true;
        return false;

Template.emailjsLayout.events
    "click #navigation-back": (e, t) ->
        NavigationController.back(); 
