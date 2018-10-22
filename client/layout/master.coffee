Template.emailjsLayout.onCreated ->
  self = this;
  # $(window).resize ->
  #     if $(window).width()<=1200
  #         $("body").addClass("sidebar-collapse")
  #     else
  #         $("body").removeClass("sidebar-collapse")

Template.emailjsLayout.onRendered ->
  # $(window).resize();
  Tracker.afterFlush ->
    $("body").removeClass("sidebar-collapse")


Template.emailjsLayout.helpers 
    
    subsReady: ->
        if Steedos.subsMail.ready() && Session.get("spaceId")
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
                        toastr.error("账户验证失败", "",{timeOut: 1000 * 60 * 30})
                        Modal.show "mailAccount"
                      ),1000
    

            return true;
        return false;

Template.emailjsLayout.events
    "click #navigation-back": (e, t) ->
        NavigationController.back(); 
