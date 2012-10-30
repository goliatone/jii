describe("LocalStorage: models should persist on client side.",function(){
	var user, User, attributes, store;
	beforeEach(function(){
		User = jii.Module('User','ActiveRecord').include(pubsub);
		

		User.configure({attributes:['id','age','name','lastname']});
		attributes = {age:32,name:"Pepe",lastname:"Rone"};
		user = new User(attributes);

		store = new jii.LocalStore(User);
	});

	it('LocalStore should be defined',function(){
		expect(jii.LocalStore).toBeTruthy();
		expect(store).toBeTruthy();
	});
});