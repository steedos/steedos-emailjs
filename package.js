Package.describe({
	name: 'steedos:emailjs',
	version: '0.0.1',
	summary: 'Steedos Emailjs',
	git: ''
});

Npm.depends({
	busboy: "0.2.13",
	cookies: "0.6.1",
	mime: "1.3.4",
	"emailjs-mime-codec": "1.0.2",
	"emailjs-stringencoding": "1.0.1",
	"emailjs-mime-parser": "1.0.0",
	"emailjs-imap-client": "2.0.2",
	"emailjs-mime-builder": "1.0.1",
	"emailjs-mime-codec": "1.0.2",
	"emailjs-smtp-client": "1.0.0",
	"regenerator-runtime": "0.9.5"
});


Package.onUse(function(api) {

	api.versionsFrom('1.0');

	api.use('reactive-var');
	api.use('reactive-dict');
	api.use('coffeescript');
	api.use('random');
	api.use('ddp');
	api.use('check');
	api.use('ddp-rate-limiter');
	api.use('underscore');
	api.use('tracker');
	api.use('session');
    api.use('blaze');
    api.use('templating');
    api.use('modules');
    api.use('npm-bcrypt');
    api.use('steedos:lib');
    api.use('steedos:ui');
    api.use('steedos:contacts');
    api.use('flemay:less-autoprefixer@1.2.0');
    api.use('simple:json-routes@2.1.0');
    api.use('nimble:restivus@0.8.7');
    api.use('aldeed:simple-schema@1.3.3');
    api.use('aldeed:collection2@2.5.0');
    api.use('aldeed:tabular@1.6.0');
    api.use('aldeed:autoform@5.8.0');
    api.use('matb33:collection-hooks@0.8.1');
    api.use('cfs:standard-packages@0.5.9');
    api.use('kadira:blaze-layout@2.3.0');
    api.use('kadira:flow-router@2.10.1');
    api.use('iyyang:cfs-aliyun')
    api.use('cfs:s3');

    api.use('meteorhacks:ssr@2.2.0');
    api.use('meteorhacks:subs-manager');
    api.use('tap:i18n@1.7.0');
	api.use('momentjs:moment', 'client');
	api.use('mrt:moment-timezone', 'client');

	api.use('summernote:summernote', 'client');

	api.use('tap:i18n', ['client', 'server']);
	tapi18nFiles = ['i18n/en.i18n.json', 'i18n/zh-CN.i18n.json']
	api.addFiles(tapi18nFiles, ['client', 'server']);

	api.addFiles('lib/core.coffee', ['client', 'server']);
	api.addFiles('lib/models/mail_accounts.coffee', ['client', 'server']);
	api.addFiles('lib/models/mail_domains.coffee', ['client', 'server']);

	api.addFiles('lib/admin.coffee', ['client', 'server']);

	api.addFiles('server/publications/mail_accounts.coffee', 'server');
	api.addFiles('server/publications/mail_domains.coffee', 'server');
	api.addFiles('server/methods/add_to_books.js', 'server');

	api.addFiles('client/subcribe.coffee', 'client');
	api.addFiles('client/router.coffee', 'client');

	api.addFiles('client/api.js', 'client');

	api.addFiles('client/libs/account_manager.js','client')

	api.addFiles('client/libs/mail_attachment.js','client')

	api.addFiles('client/libs/mail_page.js', 'client');

	api.addFiles('client/libs/mail_collection.js', 'client');

	api.addFiles('client/libs/mail_mimebuilder.js', 'client');

	api.addFiles('client/libs/imapclient_manager.js', 'client');

	api.addFiles('client/libs/mail_manager.js', 'client');

	api.addFiles('client/libs/smtpclient_manager.js', 'client');

	api.addFiles('client/libs/mail_unseendisplay.js', 'client');

	api.addFiles('client/libs/mail_forward.js', 'client');

	api.addFiles('client/libs/mail_notification.js', 'client');

	api.addFiles('client/libs/mail_quartz.js', 'client');

	api.addFiles('client/layout/master.html', 'client');
	api.addFiles('client/layout/master.coffee', 'client');
	api.addFiles('client/layout/master.less', 'client');
	api.addFiles('client/layout/sidebar.html', 'client');
	api.addFiles('client/layout/sidebar.coffee', 'client');

	api.addFiles('client/views/mail.less', 'client');

	api.addFiles('client/views/mail_account_modal.html', 'client');
	api.addFiles('client/views/mail_account_modal.coffee', 'client');

	api.addFiles('client/views/contact_modal.html', 'client');
	api.addFiles('client/views/contact_modal.coffee', 'client');

	api.addFiles('client/views/select_mail.less', 'client');
	api.addFiles('client/views/select_mail.html', 'client');
	api.addFiles('client/views/select_mail.js', 'client');

	api.addFiles('client/views/mail_search.html', 'client');
	api.addFiles('client/views/mail_search.coffee', 'client');

	api.addFiles('client/views/mail_list.html', 'client');
	api.addFiles('client/views/mail_list.coffee', 'client');

	api.addFiles('client/views/mail_compose.html', 'client');
	api.addFiles('client/views/mail_compose.coffee', 'client');

	api.addFiles('client/views/read_mail.html', 'client');
	api.addFiles('client/views/read_mail.coffee', 'client');

	api.addFiles('client/views/left.html', 'client');
	api.addFiles('client/views/left.coffee', 'client');

	api.addFiles('client/views/right.html', 'client');
	api.addFiles('client/views/right.coffee', 'client');

	api.addFiles('client/views/mail_home.html', 'client');
	api.addFiles('client/views/mail_home.coffee', 'client');

	api.addFiles('client/views/mail_button.html', 'client');
	api.addFiles('client/views/mail_button.coffee', 'client');

	api.addAssets('client/assets/forge.min.js', 'client');
	api.addAssets('client/assets/emailjs-tcp-socket-tls-worker.js', 'client');

	api.export('Mail');

	api.export('MailMimeBuilder');
	api.export('AccountManager');
	api.export('MailCollection');
	api.export("MailManager");
	api.export("ImapClientManager");
	api.export("MailUnseendisplay");
	api.export("MailPage");
	api.export("MailAttachment");
	api.export("MailForward");
	api.export("SmtpClientManager");

});

Package.onTest(function(api) {

});
