describe("ActiveRecord", function(){
	console.clear();
	var User, records, models;

	beforeEach(function(){
		//User = Class('User','Model').include(PubSub.mixins['pubsub']);
		User = Class('User','ActiveRecord').include(PubSub.mixins['pubsub']);
		User.configure({attributes:['id','age','name','lastname']});
		models = [
			{id:1,name:'Pepe',lastname:'Rone',age:31},
			{id:2,name:'Goliat',lastname:'One',age:31},
			{id:3,name:'Mortadelo',lastname:'Two',age:51},
			{id:4,name:'Filemon',lastname:'Three',age:21}
		];
		records = [
			{name:'Pepe',lastname:'Rone',age:31},
			{name:'Goliat',lastname:'One',age:31},
			{name:'Mortadelo',lastname:'Two',age:51},
			{name:'Filemon',lastname:'Three',age:21}
		];
	});

	it("should register a set of records", function(){
		var user = User.add(records);
		expect(User.count()).toBe(0);
		expect(User.count(true)).toBe(records.length);
	});

	it("should register a set of models", function(){
		var user = User.add(models);
		expect(User.count()).toEqual(User.count(true));
		expect(User.count()).toBe(records.length);
	});

	it("should find users by id",function(){
		User.add(models);
		var user = User.findByPk(1);
		expect(user).toBeTruthy();
		expect(user.id).toBe(1);
		expect(user.name).toBe('Pepe');
	});

	it("should find users by gid",function(){
		User.add(models);
		var res  = User.findByPk(1);
		var user = User.findByGid(res.gid);
		expect(user).toBeTruthy();
		expect(user.gid).toEqual(res.gid);
		expect(user.name).toBe('Pepe');
	});

	it("should find users by attribute",function(){
		User.add(models);
		var user = User.findByAttribute('name', 'Pepe');
		expect(user).toBeTruthy();
		expect(user.id).toEqual(1);
		expect(user.name).toBe('Pepe');
	});

	it("should find all users by attribute",function(){
		User.add(models);
		var users = User.findAllByAttribute('age', 31);
		expect(users).toBeArray();
		expect(users).toHaveLength(2);
		users.every(function(user){
			expect(user.age).toBe(31);
		});		
	});

	it("should delete all records",function(){
		User.add(models);
		expect(User.count()).toBe(models.length);
		User.deleteAll();
		expect(User.count()).toBe(0);
	});

	it("Should create models from POJOs",function(){
		User.add(records);
		expect(User.count(true)).toBe(records.length);
		var user = User.findByAttribute('name','Pepe', true);
		expect(user).toBeTruthy();
		expect(user.name).toBe('Pepe');	
	});

	it("should select items using a filter method", function(){
		User.add(models);
		var users = User.select(function(item){
			return item.age === 31;
		});

		expect(users).toBeTruthy();
		expect(users).toHaveLength(2);
		expect(users).toEachHave('age', 31);
	});

	it("should create new models from POJOs",function(){
		User.add(models);
		var record = {id:666, name:'Contra',lastname:'Delalora', age:56};
		var model  = User.create(record);
		expect(model).toBeTruthy();
		expect(model.id).toBeTruthy();
		expect(User.count()).toBe(models.length+1);
		expect(User.findByAttribute('name','Contra')).toBeTruthy();
	});

	// it("should create new models from an array of POJOs",function(){
	// 	User.add(models);
	// 	User.add(records);
	// });
	
	it("should destroy a record",function(){
		User.add(models);
		
		var record = {id:666, name:'Contra',lastname:'Delalora', age:56};
		var model  = User.create(record);
		
		var callback = sinon.spy();
		model.subscribe('destroy',callback);
		model.subscribe('beforeDestroy',callback);

		expect(User.count()).toBe(models.length+1);
		expect(User.destroy(666)).toHavePropertieValue('gid',model.gid);
		expect(User.count()).toBe(models.length);
		expect(callback).toHaveBeenCalledTwice();
	});

	it("beforeDestroy should allow us to abort destruction :)",function(){
		User.add(models);
		var model = User.findByPk(1);
		expect(model).toBeTruthy();

		var callback = {};
		callback.beforeDestroy = function beforeDestroy(options){
			options.skipDestroy = true;
		};

		var spy = sinon.spy(callback, 'beforeDestroy');

		model.subscribe('beforeDestroy',callback.beforeDestroy);

		User.destroy(1);

		expect(User.count()).toBe(models.length);
		expect(spy).toHaveBeenCalled();
	});

	it("should check if a model exists",function(){
		User.add(models);
		expect(User.exists(1)).toBeTruthy();
	});

	it("should update new models", function(){
		
		User.add(models);
		
		var user = User.findByPk(1);
		expect(user).toBeTruthy();
		expect(user.id).toBe(1);

		var callback = sinon.spy();
		user.subscribe('update.attributes',callback);

		var age = user.age + 10;
		var user2 = User.update(1, {age:age});
		// expect(user.age).not.toBe(age);
		expect(user2.age).toBe(age);
		expect(user.gid).toEqual(user2.gid);
		expect(callback).toHaveBeenCalled();
	});
});