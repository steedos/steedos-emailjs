db.mail_accounts = new Meteor.Collection('mail_accounts')

db.mail_accounts.allow
	update: (userId, doc, fields, modifier) ->
		return doc.owner == userId;

	insert: (userId, doc, fields, modifier) ->
		return doc.owner == userId;

db.mail_accounts._simpleSchema = new SimpleSchema
	space: 
		type: String,
		autoform: 
			type: "hidden",
			defaultValue: ->
				return Session.get("spaceId");
	owner: 
		type: String,
		autoform: 
			type: "hidden",
			defaultValue: ->
				return Meteor.userId();
	email: 
		type: String,
	password: 
		type: String,		
		autoform:
			type: "password"

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
	db.mail_accounts._simpleSchema.i18n("mail_accounts")

db.mail_accounts.attachSchema(db.mail_accounts._simpleSchema)

