describe("LocalStorage:",function(){
	var user, User, attributes, store, models, userStoreId;
	beforeEach(function(){
		var pubsub = jii.PubSub.mixins['pubsub'];
		User = jii.Module('User','ActiveRecord').include(pubsub);
		

		User.configure({attributes:['id','age','name','lastname']});
		
		models = [
			{id:1,name:'Pepe',lastname:'Rone',age:31},
			{id:2,name:'Goliat',lastname:'One',age:31},
			{id:3,name:'Mortadelo',lastname:'Two',age:51},
			{id:4,name:'Filemon',lastname:'Three',age:21}
		];

		attributes = {name:'Pepe',lastname:'Rone',age:31};
		user = new User(attributes);

		localStorage.clear();
		store = new jii.LocalStore(User);
		userStoreId = store.makeStoreId(User);
	});

	it('LocalStore should be defined',function(){
		expect(jii.LocalStore).toBeTruthy();
		expect(store).toBeTruthy();
	});

	it("LocalStore should save instance",function(){
		store.create(user);
		expect(localStorage.length).toBe(2);

		
		var storeGids = localStorage.getItem(userStoreId);
		expect(localStorage[userStoreId]).toBeTruthy();
		expect(storeGids).toContainOnce(user.gid);

		var userString = JSON.stringify(user.toJSON());
		expect(localStorage[user.gid]).toMatchObject(userString);
	});

	it('should hidrate from localStorage',function(){
		store.create(user);
		var frozen = store.read()[0];
		expect(user.isEqual(frozen)).toBeTruthy();
		expect(frozen.toJSON()).toMatchObject(user.toJSON());
	});

	it("should store a bunch of models", function(){
		User.reset();
		User.add(models);

		store.create(User.all());
		var userCollection = JSON.parse(localStorage[userStoreId]);
		expect(userCollection.length).toBe(models.length);

		var frozen;
		var frozens = store.read();
		for(var i = 0; i < frozens.length;i++){
			frozen = frozens[i];
			expect(frozen).toBeInstanceOf(User);
			expect(User.has(frozen.id)).toBeTruthy();
		}
	});

	it("should update model instances", function(){
		store.create(user);
		user.age = user.age + 10;
		var frozen = store.read()[0];
		expect(frozen.age + 10).toEqual(user.age);

		store.update(user);

		frozen = store.read()[0];

		expect(frozen.age).toBe(user.age);
	});

	it('should remove model instances from store',function(){
		store.create(user);
		var frozen = store.read();
		expect(frozen.length).toBe(1);

		store.destroy(user);

		frozen = store.read();

		expect(frozen.length).toBe(0);
	});

	it('should remove all model instances from store',function(){
		User.reset();
		User.add(models);

		var all = User.all();

		store.create(all);
		var frozen = store.read();
		
		expect(frozen.length).toBe(all.length);

		User.reset();
		expect(frozen.length).toBe(all.length);

		store.destroy();

		frozen = store.read();

		expect(frozen.length).toBe(0);
	});


	afterEach(function(){
		//localStorage.clear();
	});
});