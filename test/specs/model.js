describe("Model", function(){
	
	var User, attributes, user;

	beforeEach(function(){
		//TODO: WE SHOULD REALLY BE TESTING MODEL, NOT AR!!!
		User = Class('User','ActiveRecord').include(PubSub.mixins['pubsub']);
		User.configure({attributes:['id','age','name','lastname']});
		attributes = {age:32,name:"Pepe",lastname:"Rone"};
		user = new User(attributes);
	});

	it("should create a User model class",function(){
		expect(User).toBeTruthy();
	});

	it("should assing a modelName to an instance on creation",function(){
		expect(user.modelName).toBe("User");
	});

	it("should create attributes in model instance",function(){
		expect(user.getAttributes()).toMatchObject(attributes);
	});

	it("should load constructor attributes",function(){
		var spy = sinon.spy(User.prototype,'load');
		user = new User(attributes);
		var calledWithArgs = spy.args[0][0];
		expect(calledWithArgs).toMatchObject(attributes);
	});

	it("should assing a new gid on creation",function(){
		expect(user.gid).toBeTruthy();
		expect(User.isGid(user.gid)).toBeTruthy();
	});

	it("should track new recrods",function(){
		expect(user.isNewRecord()).toBeTruthy();
	});

	it("instance need an id to be considered a record", function(){
		expect(user.isRecord()).toBeFalsy();
	});

	it("should not assing a gid as id on create if none present",function(){
		var spy = sinon.spy();
		expect(user.id).toBeFalsy();
		expect(user.has('id')).toBeFalsy();

		user.create();
		// expect(user.id).toBe(user.gid);
	});

	it("should publish topics on create",function(){
		var spy = sinon.spy();
		user.subscribe('beforeCreate', spy);
		user.create();
		expect(spy.called).toBeTruthy();
	});

	it("should publish topics on create with the given options",function(){
		var options = {options:true};
		var spy = sinon.spy();
		user.subscribe('beforeCreate', spy);

		user.create( options );
		expect(spy.called).toBeTruthy();
		expect(spy.args[0][0]).toMatchObject(options);
	});

	it("should be loadable from JSON",function(){
		user = new User();
		expect(user.getAttributes()).toMatchObject({});
		user.fromJSON(attributes);
		expect(user.toJSON()).toMatchObject(attributes);
		expect(user.getAttributes()).toMatchObject(attributes);
	});

	/**
	 * We should get the original resource.
	 * ie: var user = new User({name:'pepe'});
	 * user.name = 'kaka';
	 * user.reload(); <= if we had it hooked up with ajax,we need to pull.
	 * user.name === 'pepe'
	 */
	it("should reload an item and reset its state",function(){
		var gid = user.gid;
		expect(user.id).toBeUndefined();
		expect(user.age).toBe(attributes.age);
		user.save();
		user.age = 1;
		expect(user.age).toBe(1);
		user.reload();
		expect(user.age).toBe(attributes.age);
		expect(user.gid).toBe(gid);
	});

	it("duplicate should return a record with shared props, but with no id and different gid",function(){
		var dup = user.duplicate();

		expect(user.isEqual(dup)).toBeFalsy();
		expect(user.gid).toNotMatch(dup.gid);
		expect(dup.id).toBeUndefined();
	});

	it("should duplicate a record with same id and gid",function(){
		user.id = 1;
		var dup = user.duplicate(false);
		expect(user.isEqual(dup)).toBeTruthy();
		expect(dup.id).toBe(user.id);
		expect(dup.gid).toBe(user.gid);
	});

	it("should publish individual attribute changes: updateAttribute",function(){
		var spy = sinon.spy();

		var old = user.age;
		var value = 32;
		
		var options = {options:23};

		user.subscribe('update.age',spy);
		user.updateAttribute('age', value, options);

		expect(spy.called).toBeTruthy();
		var spyArgs = spy.args[0];
		
		expect(spyArgs[0]).toIncludeObject({old:old,value:value});
		expect(spyArgs[1]).toIncludeObject(options);
	});

	it("should publish individual attribute changes: set",function(){
		var spy = sinon.spy();

		var old = user.age;
		var value = 32;
		
		var options = {options:23};

		user.subscribe('update.age',spy);
		user.set('age', value, options);

		expect(spy.called).toBeTruthy();
		var spyArgs = spy.args[0];
		
		expect(spyArgs[0]).toIncludeObject({old:old,value:value});
		expect(spyArgs[1]).toIncludeObject(options);
	});

	it("should clone records",function(){
		var clone = user.clone();
		expect(clone.isEqual(user)).toBeTruthy();
	});
	it("new records should not be equal",function(){
		var user2 = new User(attributes);
		expect(user2.isEqual(user)).toBeFalsy();
	});

	it("User should store created instances.",function(){
		expect(User).toHaveProperties('records','grecords');
	});

	it("User should track records without id as ghost instances.",function(){
		expect(user.gid).toBeTruthy();
		expect(User.has(user.gid)).toBeTruthy();
	});

	it("We should be able to add records to User",function(){
		var user2 = new User();
		User.add(user2);
		
		expect(User.has(user2.gid)).toBeTruthy();
	});

	it("should be able to add a record form JSON",function(){
		var user2 = User.add(attributes);
		expect(User.has(user2.gid)).toBeTruthy();
	});

	it("User should be able to get instances by id or gid",function(){
		//SHOULD THIS WORK?! THIS MEANS THAT IF WE MODIFY A RECORD, ANYWHERE
		//THE STORED REF WOULD BE UPDATED AS WELL, EVEN IF WE DONT WANT TO!!!
		//THIS SHOULD FAIL!!!!!!!!!!!
		user.id = 23;
		expect(User.has(23)).toBeFalsy();
		User.add(user);
		expect(User.has(23)).toBeTruthy();
		expect(User.has(user)).toBeTruthy();
		expect(User.has(user.id)).toBeTruthy();
		expect(User.has(user.gid)).toBeTruthy();
	});

	it("User should remove users",function(){
		expect(User.has(user)).toBeTruthy();
		User.remove(user);
		expect(User.has(user)).toBeFalsy();
	});

});