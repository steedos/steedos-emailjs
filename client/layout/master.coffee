Template.emailjsLayout.onCreated ->
	self = this;

	self.minHeight = new ReactiveVar(
		$(window).height());

	$(window).resize ->
		self.minHeight.set($(window).height());
		if $(window).width()<=1024
			$("body").addClass("sidebar-collapse")
		else
			$("body").removeClass("sidebar-collapse")

Template.emailjsLayout.onRendered ->

	self = this;
	self.minHeight.set($(window).height());

	$('body').removeClass('fixed');


Template.emailjsLayout.helpers 
	minHeight: ->
		return Template.instance().minHeight.get() + 'px'
	
	subsReady: ->
		if Steedos.subsMail.ready()
			AccountManager.checkAccount();
			return true;
		return false;

Template.emailjsLayout.events
	"click #navigation-back": (e, t) ->
		NavigationController.back(); 
