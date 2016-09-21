db.mail_addressBook = new Meteor.Collection('mail_addressBook')


db.mail_addressBook._simpleSchema = new SimpleSchema
	name: 
		type: String,

	email: 
		type: String,

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
	db.mail_addressBook._simpleSchema.i18n("mail_addressBook")

db.mail_addressBook.attachSchema(db.mail_addressBook._simpleSchema)

