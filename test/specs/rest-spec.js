describe('REST', function(){
	var REST, xhr, server, records, user, User, userVO;

	beforeEach(function(){
		User = jii.Module('User','ActiveRecord');
		REST = new jii.REST(User);

		var attributes = ['id','age','name','lastname'];
		var config = {attributes:attributes};
		User.configure(config);

		userVO = {id:1,age:32,name:'Pepe',lastname:'Rone'};
		user = new User(userVO);

		server = sinon.fakeServer.create();
	});

	it("should exists",function(){
		expect(REST).toBeTruthy();
	});

	it("should conform to the CRUD interface",function(){
		var crud = ['create', 'read','update','destroy'];
		expect(REST).toHaveMethods(crud);
	});

	it("should handle service success and error callbacks",function(){
		var callbacks = ['onError', 'onSuccess'];
		expect(REST).toHaveMethods(callbacks);
	});

	it("should have an actionMap, holding CRUD method configuration", function(){
		expect(REST.actionMap).toBeTruthy();
	});

	it("actionMap should hold values for all CRUD methods",function(){
		var crud = ['create', 'read','update','destroy'];
		expect(REST.actionMap).toHaveProperties(crud);
		expect(REST.actionMap).toHaveProperties('create','read','update');
	});

	it("should handle create request",function(){
		server.respondWith("POST", "/api/user/",
                                [200, { "Content-Type": "application/json" },
                                 JSON.stringify([userVO])
                                ]);

		REST.create(user);
		server.respond();
		expect(server.requests.length).toBe(1);
		expect(server.requests[0].method).toMatchObject('POST');
		expect(server.requests[0].url).toMatchObject('/api/user/');
	});

	it("sucssesful create request should trigger onSuccess",function(){
		server.respondWith("POST", "/api/user/",
                                [200, { "Content-Type": "application/json" },
                                 JSON.stringify([userVO])
                                ]);
		var callback = sinon.spy();
		var spy = sinon.spy(REST,'onSuccess');

		REST.create(user, {}, callback);
		server.respond();
		expect(spy).toHaveBeenCalled();
	});

	it("sucssesful create request should trigger onSuccess",function(){
		server.respondWith("POST", "/api/user/",
                                [200, { "Content-Type": "application/json" },
                                 JSON.stringify([userVO])
                                ]);
		var callback = sinon.spy();
		var spy = sinon.spy(REST,'onSuccess');

		REST.create(user, {}, callback);
		server.respond();
		var calledWithArgs = spy.args[0];
		expect(spy).toHaveBeenCalled();
		// model
		expect(calledWithArgs[0]).toBe(user);
		// callback
		expect(calledWithArgs[1]).toBe(callback);
		// data
		expect(calledWithArgs[2]).toBeTruthy();
		expect(calledWithArgs[2]).toMatchObject([userVO]);
		// textStatus
		expect(calledWithArgs[3]).toBe("success");
		// jqXHR
		expect(calledWithArgs[4]).toBeTruthy();
	});

	it("unsucssesful create request should trigger onError",function(){
		server.respondWith("POST", "/api/user/",
                                [500, { "Content-Type": "application/json" },
                                 JSON.stringify({error:true,message:'On Error'})
                                ]);
		var callback = sinon.spy();
		var spy = sinon.spy(REST,'onError');

		REST.create(user, {}, callback);
		server.respond();
		var calledWithArgs = spy.args[0];
		expect(spy).toHaveBeenCalled();
		// model
		expect(calledWithArgs[0]).toBe(user);
		// callback
		expect(calledWithArgs[1]).toBe(callback);
		// jqXHR
		expect(calledWithArgs[2]).toBeTruthy();
		// textStatus
		expect(calledWithArgs[3]).toBe("error");
		// errorThrown
		// TODO: Map error # to msgs.
		expect(calledWithArgs[4]).toBe("Internal Server Error");

		expect(callback).toHaveBeenCalled();
	});

});