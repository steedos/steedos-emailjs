db.mail_domains = new Meteor.Collection('mail_domains')


db.mail_domains._simpleSchema = new SimpleSchema

	domain:
		type: String,
		defaultValue: "petrochina.com.cn",
	smtp_server :
		type: String,
		defaultValue: "msg.petrochina.com.cn",
	smtp_ssl:
		type: String,
		optional: true,
		allowedValues: [
			"yes",
			"no"
		],
		autoform:
			type: "select",
			options: [{
				label: "是",
				value: "yes"
			},
			{
				label: "否",
				value: "no"
			}]
	smtp_port :
		type: String,
		optional: true,
		allowedValues: [
			"465",
			"25"
		],

	imap_server:
		type: String,
		defaultValue: "msg.petrochina.com.cn",
	imap_ssl:
		type: String,
		optional: true,
		allowedValues: [
			"yes",
			"no"
		],
		autoform:
			type: "select",
			options: [{
				label: "是",
				value: "yes"
			},
			{
				label: "否",
				value: "no"
			}]
	imap_port :
		type: String,
		optional: true,
		allowedValues: [
			"993",
			"143"
		],

	created:
		type: Date,
		optional: true
	created_by:
		type: String,
		optional: true
	modified:
		type: Date,
		optional: true
	modified_by:
		type: String,
		optional: true



if Meteor.isClient
	db.mail_domains._simpleSchema.i18n("mail_domains")

db.mail_domains.attachSchema(db.mail_domains._simpleSchema)


#if Meteor.isServer
	#db.mail_domains.after.insert (domain,) ->
