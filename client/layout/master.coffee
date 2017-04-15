Template.emailjsLayout.onCreated ->
  self = this;
  # $(window).resize ->
  #     if $(window).width()<=1200
  #         $("body").addClass("sidebar-collapse")
  #     else
  #         $("body").removeClass("sidebar-collapse")

Template.emailjsLayout.onRendered ->
  # $(window).resize();
  $("body").removeClass("sidebar-collapse")


Template.emailjsLayout.helpers 
    
    subsReady: ->
        if Steedos.subsMail.ready()

            unless Meteor.userId()
              return false
            if Meteor.loggingIn()
              # 正在登录中，则不做处理，因为此时Meteor.userId()不足于证明已登录状态
              return false
            AccountManager.checkAccount (message)->
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
