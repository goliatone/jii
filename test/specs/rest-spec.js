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

	it("should parse URL templates",function(){
		var template = 'api/{modelId}/{id}';
		expect(REST.parseUrl(template, user)).toBe('api/user/'+user.id);

		template = 'api/{modelName}.firstToLowerCase/{id}';
		expect(REST.parseUrl(template, user, jii.utils)).toBe('api/user/'+user.id);
	});

	it("should handle making default payload",function(){
		var json = JSON.stringify(user.toJSON());
		var payload = REST.buildPayload('toJSON',user);
		expect(json).toEqual(payload);
	});

	it("default buildUrl should be same as parseUrl",function(){
		var template = 'api/{modelId}/{id}';
		var url = REST.parseUrl(template, user);
		var prs = REST.buildUrl(template, user);
		expect(url).toBe(prs);
	});

	it("actionMap should hold values for all CRUD methods",function(){
		var crud = ['create', 'read','update','destroy'];
		expect(REST.actionMap).toHaveProperties(crud);
		expect(REST.actionMap).toHaveProperties('create','read','update');
	});

	it("should handle CREATE request",function(){
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

	it("sucssesful CREATE request should trigger onSuccess",function(){
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

	it("sucssesful onSuccess should trigger callback",function(){
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

	it("unsucssesful CREATE request should trigger onError",function(){
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

		//TODO: Check params.
		expect(callback).toHaveBeenCalled();
	});

	it("should handle READ requests",function(){
		server.respondWith("GET", "/api/user/",
                                [200, { "Content-Type": "application/json" },
                                 JSON.stringify(userVO)
                                ]);

		REST.read(user);
		server.respond();
		expect(server.requests.length).toBe(1);
		expect(server.requests[0].method).toMatchObject('GET');
		expect(server.requests[0].url).toMatchObject('/api/user/'+user.id);
	});

	it("should handle UPDATE requests",function(){
		server.respondWith("PUT", "/api/user/"+user.id,
                                [200, { "Content-Type": "application/json" },
                                 JSON.stringify(userVO)
                                ]);

		REST.update(user);
		server.respond();
		expect(server.requests.length).toBe(1);
		expect(server.requests[0].method).toMatchObject('PUT');
		expect(server.requests[0].url).toMatchObject('/api/user/'+user.id);
	});

	it("should handle DELETE requests",function(){
		server.respondWith("DELETE", "/api/user/"+user.id,
                                [200, { "Content-Type": "application/json" },
                                 JSON.stringify({status:"success",message:"User deleted",error:false})
                                ]);

		REST.destroy(user);
		server.respond();
		expect(server.requests.length).toBe(1);
		expect(server.requests[0].method).toMatchObject('DELETE');
		expect(server.requests[0].url).toMatchObject('/api/user/'+user.id);
	});




});