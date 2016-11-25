Meteor.methods({
	add_to_books: function(owner, email) {
		check(owner, String);
		check(email, String);
		
		// 判断联系人是否已存在
		var exists = db.address_books.find({owner: owner, email: email}).count();
		
		if (exists > 0)
			throw new Meteor.Error(400, "steedos_contacts_error_contact_exists");

		return true;
	}
})