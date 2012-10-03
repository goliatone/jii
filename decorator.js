(function(namespace,exportName){
    
    var Class = function(name, parent){
        
        // if(namespace[name])
            // return name;
            
        //Lets figure out parent.
        //TODO: Add support for com.domain.Class.
        //parent = parent.split('.');
        //while(target = parent.pop()) parent = namespace[target];
        parent = parent || Class;

        if(typeof parent === 'string')
            parent = namespace[parent];
            
        var self = function(){
            console.log('Initialize self!')
            this.init.apply(this, arguments);
        };
        
        //Change self proto.
        //define default constructor, we could rename it.
        self.prototype.init = function(){console.log("kk")};
        
        if(parent){
            for( var i in parent){
				self[i] = Class.clone(parent[i]);
			}
            
			for( i in parent.prototype){
				self.prototype[i] = Class.clone(parent.prototype[i]);
			}
            
			// self._super = parent;
           
            
			var ctor = function(){
				this.constructor = self;
			};
			ctor.prototype = parent.prototype;
			self.prototype = new ctor();
            
            //We need to create super after proto.
            //self._super = parent;
            self.prototype._super = parent.prototype;
		}
		
    
    //------------------------------
	// Adding class/static properties: i.e: User.findByPk().
		self.extend = function(obj){
			var extended = obj.extended;
			for(var i in obj){
				if(obj.hasOwnProperty(i))
					self[i] = obj[i];
			}
			if(extended) extended(self);
            
            return self;
		};
    //  ----------------------------------- 
	//  Adding instance properties- user.id = 23;
		/**
		 * All properties of the provided object will be
		 * copied into the prototype of all Class instances.
		 *
		 * @access 	public
		 * @param 	Object 	Template with properties to include.
		 * @return 	Object 	Instance, fluid interface.
		 */
		self.include = function(obj){
			var included = obj.included;
			for(var i in obj){
				if(obj.hasOwnProperty(i))
					self.fn[i] = obj[i];
			}
			if(included) included(self);
            
            return self
		};

		/**
		 * Utility mehtod to proxy function calls
		 * with the proper scope.
		 * @access public
		 * @param 	Function 	Function to be proxied.
		 * @return 	Function 	Wrapped function with scope set to self.
		 */
		self.proxy = function(func){
			var self = this;
			return(function(){
				return func.apply(self, arguments);
			});
		};
        
		//shortcuts.
		self.fn = self.prototype;
		self.fn.parent = parent;
		self.fn.proxy  = self.proxy;
        
        
        // The class/parent name
		self.prototype.__name__  = self.__name__  = name;
		self.prototype.__class__ = self;
        
        //define default constructor, we could rename it.
        //self.prototype.init = function(){console.log("kk")};
		
		//Store a reference by name in the provided namespace.
        namespace[name] = self;
        
		return self;
	};
    
    Class.__name__    = 'Class';
    Class.__version__ = "0.0.1";

	Class.decorator = function(implementation){
        var decorator = function(){};
        decorator.prototype.decorate = function(){
            var i = 0,
            t = arguments.length;
            for(;i < t; i++){
               implementation( arguments[i], this );
            }		
		}
        return new decorator();
    };
    
	Class.override = function(obj, method, fn){
		obj.parent = obj.parent || {};
		obj.parent[method] = obj[method];
		obj[method] = fn;
	};
    
    /**
     * Utility method to clone an object.
     * 
     * @access 	public.
     * @param 	object 	Object to be cloned.
     * @return 	object 	Cloned object.
     */
    Class.clone = function(obj){
        if (typeof obj == "function") return obj;
        if (typeof obj != "object") return obj;
        if (jQuery.isArray(obj)) return jQuery.extend([], obj);
        return jQuery.extend({}, obj);  
    };
	
	/**
	 * Scope in which the module will store all clases,
	 * to prevent pollution of the global namespace.
	 * 
	 * @access public
	 * @param 	object 	scoped namespace for the module.
	 * @return 	object 	scoped namespace for the module.
	 */
	Class.namespace = function(ns){
		namespace = ns || namespace;
        if(!namespace.hasOwnProperty(exportName))
            namespace[exportName] = Class;
        return namespace;
	};
    
//	------------------------------------------------------------
//	Make our Class available to the provided namespace.
    namespace  = namespace || this;
    exportName = exportName || 'Class';
    namespace[exportName] = Class;

}).call(this/*,goliatone,'GClass'*/);

(function(namespace, exportName){
    exportName = exportName || 'Model';
	namespace = namespace || this;
	//Shim for Object.create
	var _createObject = Object.create || function(o) {
        var Func;
        Func = function() {};
        Func.prototype = o;
        return new Func();
    };

    var _isFunc = function(obj){
    	return (typeof obj === 'function');
    };

    var _isArray = function(value) {
        return Object.prototype.toString.call(value) === '[object Array]';
    };

    var _result = function(obj, property){
    	if (obj == null) return null;
    	var value = obj[property];
    	return _isFunc(value) ? value.call(obj) : value;
    };

    var _capitalize =function(str){
    	return str.charAt(0).toUpperCase() + str.slice(1);
    };

	var Model = Class( exportName/*,EventDispatcher*/).extend({
		records:{},
		crecords:{},
		attributes:[],
		configure: function(config){
			this.attributes = config.attributes;
			// this.unbind();
		},
		clonesArray:function(array){
			var value;
			var i = 0, l = array.length;
			var result = [];
			for(; i < l; i++){
				value = array[i];
				result.push(value.clone());
			}

			return result;
		},
		guid:function(){
			return 'xxxxxxxx-xxxx-xxxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
                return v.toString(16);
            }).toUpperCase();
		},
		isGuid:function(guid){
			guid = guid.replace(/[A-Z\d]/g,function(){return 0;});
			return (guid === '00000000-0000-0000-0000-000000000000');
		},
		findByPk:function(id){
			var record = this.records[id];
			if(! record && this.isGuid(id))
				return this.findByGuid(id);

			if(!record)
				return false;

			return record.clone();
		},
		findByGuid:function(guid){
			var record = this.records[guid];
			if(! record)
				return false;
			return record.clone();
		},
		exists:function(id){
			return this.findByPk(id) !== false;
		},
		refresh:function(values, options){
			options = options || {};
			if(options.clear){
				this.records = {};
				this.crecords = {};
			}

			var records = this.fromJSON(values);

			if(! isArray(records)){
				records = [records];
			}

			var record;
			var i = 0, l = records.length;
			for(; i < l; i++){
				record = records[i];
				record.id || (record.id = record.guid);
				this.records[record.id] = record;
				this.crecords[record.guid] = record;
			}

			this.publish('refresh', this.clonesArray(records));
			return this;
		},
		select:function(filter){
			var result = (function(){
				var r = this.records;
				var results = [];
				for( var id in r){
					record = r[id];
					if(filter(record))
						results.push(record);
				}
				return records;
			}).call(this);

			return this.clonesArray(result);
		},
		findByAttribute:function(attr, value){
			var r = this.records;
			var record, id, rvalue;
			for( id in r){
				record = r[id];
				rvalue = _result(record,attr);
				if( rvalue === value)
					return record.clone();
			}

			return null;
		},
		findAllByAttribute:function(name, value){
			return this.select(function(item){
				var rvalue = _result(item, attr);
				return ( rvalue === value);
			});
		},
	////////////
		each:function(callback){
			var r = this.records;
			var results = [];
			var key, value;
			for(key in r){
				value = r[key];
				results.push(callback(value.clone()));
			}
			return results;
		},
		all:function(){
			return this.clonesArray(this.recordsValues());
		},
		first:function(){
			var record = this.recordsValues()[0];
			//void 0, evaluates to undefined;
			return record ? record.clone() : 0;
		},
		last:function(){
			var values = this.recordsValues();
			var record = values[values.length -1];
			return record ? record.clone() : void 0;
		},
		count:function(){
			return this.recordsValues().length;
		},
		deleteAll:function(){
			var r = this.records;
			var key, value;
			var result = [];
			for( key in r){
				value = r[key];
				result.push(delete this.records[key]);
			}

			return result;
		},
		destroyAll:function(){
			var r = this.records;
			var key, value;
			var result = [];
			for( key in r){
				value = r[key];
				result.push(this.records[key].destroy());
			}

			return result;
		},
	////////////
		update:function(id, attrs, options){
			var record = this.find(id);
			if(record) record.updateAttributes(atts, options);
			return record;
		},
		create:function(attrs, options){
			var record = new this(atts);
			return record.save(options);
		},
		destroy:function(id, options){
			var record = this.find(id);
			if(record) record.destroy(options);
			return record;
		},
		change:function(callbackOrParams){
			if(_isFunc(callbackOrParams)){
				return this.bind('change', callbackOrParams);
			} else {
				return this.publish('change', callbackOrParams);
			}
		},
		fetch:function(callbackOrParams){
			if(_isFunc(callbackOrParams)){
				return this.bind('fetch', callbackOrParams);
			} else {
				return this.publish('fetch', callbackOrParams);
			}
		},
		toJSON:function(){
			return this.recordsValues();
		},
		fromJSON:function(objects){
			if(!objects) return;

			if(typeof objects === 'string'){
				objects = JSON.parse(objects);
			}
			if(_isArray(objects)){
				var result = [];
				var i = 0, l = objects.length;
				var value;
				for(; i < l; i++){
					value = objects[i];
					result.push(new this(value));
				}

				return result;
			} else {
				return new this(objects);
			}
		},
		fromForm:function(selector){
			var model = new this();
			return model.fromForm(selector);
		},
		recordsValues:function(){
			var key, value;
			var result = [];
			var r = this.records;
			for(key in r){
				value = r[key];
				result.push(value);
			}
			return result;
		}
	}).include({
		init:function(attrs){
            if(attrs) this.load(attrs);
            this.guid = this.constructor.guid();
        },
        /**
         * It will load all values provied in attr object 
		 * into the record.
		 *
		 */
        load:function(attr){
            console.log('Load');
            
        	var key, value, prop;
			for (key in attr){
				value = attr[key];
				_isFunc(this[key]) ? this[key](value) : this[key] = value;
			}
			return this;
        },
        reload:function(){
			if(this.isNewRecord())
				return this;

			var original =  this.constructor.find(this.id);
			this.load(original.attributes());

			//If we return this, wouldn't it be the same?
			return original;
		},
		create:function(options){
			options = options || {};
			this.publish('beforeCreate',options);

			if(! this.id)
				this.id = this.guid;

			var record = this.duplicate(false);

			this.constructor.records[this.id]    = record;
			this.constructor.crecords[this.guid] = record;

			var clone = record.clone();
			clone.publish('create', options);
			clone.publish('change::create', options);

			return clone;
		},
		update:function(options){
			options = options || {};
			this.publish('beforeUpdate',options);

			var record  = this.constructor.records[this.id];
			record.load(this.attributes());

			var clone = record.clone();

			this.publish('update', options);
			this.publish('change::update',options);

			return clone;
		},
		save:function(options){
			options = options || {};

			//Validate unless told not to.
			if(options.validate !== false){
				if(this.isInvalid())
					this.publish('error',options);
			}

			this.publish('beforeSave');

			var action = this.isNewRecord() ? 'create' : 'update';
			var record = this[action](options);

			this.publish('save', options);

			return record;
		},
		destroy:function(options){
			options = options || {};

			this.publish('beforeDestroy', options);

			delete this.constructor.records[this.id];
			delete this.constructor.crecords[this.guid];

			this.destroyed = true;
			this.publish('destroy', options);
			this.publish('change::destroy', options);
			// this.unbind();

			return this;
		},
		duplicate:function(asNewRecord){
			var result = new this.constructor(this.attributes());

			if(asNewRecord === false) result.guid = this.guid;
			else delete result.id;

			return result;
		},
		clone:function(){
			return _createObject(this);
		},
		attributes:function(){
			var key;
			var attrs = this.constructor.attributes;

			var i = 0, l = attrs.length, result = {};

			for(; i < l; i++ ){
				key = attrs[i];
				if( key in this)
					result[key] = _result(this, key);
			}

			if(this.id)
				result.id = this.id;

			return result;
		},
		updateAttribute:function(name, value, options){
			var old = this[name];
			this[name] = value;
			
			this.publish('update'+_capitalize(name),{old:old, value:value},options);

			return this.save(options);
		},
		updateAttributes:function(values, options){
			//TODO: Should we only do this if we have subscribers?
			//if(this.willPublish('updateAttributes'))
			var old = this.attributes();

			this.load(values);
			this.publish('updateAttributes',{old:old, values:values},options);

			return this.save(options);
		},
		isNewRecord:function(){
			return ! this.isRecord();
		},
		isEqual:function(record){
			if(!record)
				return false;
			if(record.constructor !== this.constructor)
				return false;
			if(record.guid !== this.guid)
				return false;
			if(record.id !== this.id)
				return false;

			return true;
		},
		isValid:function(){
			return this.validate();
		},
		isInvalid:function(){
			return ! this.validate();
		},
		isRecord:function(){
			return this.id && this.id in this.constructor.records;
		},
		toString:function(){
			return '['+this.__name__+' => '+" ]";
			//return "<" + this.constructor.className + " (" + (JSON.stringify(this)) + ")>";
		},
		toJSON:function(){
			return this.attributes();
		}
	});

	Model.prototype.validate = function(){
		console.log('Implement validate');
	};

	Model.prototype.metadata = function(meta){

	};

	

	Model.prototype.errors = function(){

	};


	Model.prototype.fromForm = function(selector){
		var inputs = $(selector).serializeArray();
		var i = 0, l = inputs.length;

		for(; i < l; i++){
			key = inputs[i];
			result[key.name] = key.value;
		}
	};

	

	

	
	namespace[exportName] = Model;
}).call(this);

(function(namespace,exportName){
    /**
	 * PubSub mixin.
	 * Use:
	 * Class.include(PubSub);
	 * If we need more complex stuff:
	 * http://amplifyjs.com/api/pubsub/
	 * https://github.com/mroderick/PubSubJS
	 * https://github.com/uxder/Radio/blob/master/radio.js
	 */
	var mixPubSub = {
        _slice: (function(){return [].slice})(),
	    _makeArray:function(args){
	        return this._slice.call(args,0);
	    },
		subscribe: function(topic, callback){
			//Create _callbacks, unless we have it
			var calls = this._callbacks || (this._callbacks = {});
			var topic = this._callbacks[topic] || (this._callbacks[topic] = []);
			//Create an array for the given topic key, unless we have it,
			//then append the callback to the array
	        topic.push(callback);
	        
			return this;
		},
		publish:function(){
			//Turn args obj into real array
			var args = this._slice.call(arguments, 0);
	        
			//get the first arg, topic name
			var topic = args.shift();
	        
			//return if no callback
			var list, calls, i, l;
			if(!(calls = this._callbacks)) return this;
			if(!(list = this._callbacks[topic])) return this;
	        
			//Invoke callbacks
	        var callback;
			for(i = 0, l = list.length; i < l; i++){
				callback = list[i];
	            if(!callback) continue;
	            callback.apply(this, args);
			}
			return this;
		},
		unsubscribe:function(topic, callback){
			var list, calls, i, l;
			if(!(calls = this._callbacks)) return this;
			if(!(list = this._callbacks[topic])) return this;

			for(i = 0, l = list.length; i < l; i++){
				if(list[i] === callback)
					delete list[i];
			}

			return this;
		}
	};

	var mixins = {mixins:[mixPubSub]};
	var PubSub = Class(exportName).include(mixPubSub).extend(mixins);
//	------------------------------------------------------------
//	Make our Class available to the provided namespace.
    namespace  = namespace || this;
    exportName = exportName || 'PubSub';
    namespace[exportName] = PubSub;

}).call(this/*,goliatone,'GClass'*/);

var _evCallback = function(msg){console.log("Here we have an update shait: "+msg)};

var User = Class('User','Model').include(PubSub.mixins.pubsub]);

User.configure({attributes:['name','lastname','age']});

var user = new User({id:1,name:'Pepe',lastname:'Rone',age:23});
console.log("to attr: ",user.attributes());
user.subscribe('save',_evCallback);
user.subscribe('updateAge',function(event,options){
   console.log("Updaed age");
});
console.log("to attr: ",user.attributes());
console.log("to JSON: ",user.toJSON());
user.save({name:'Goliat'});
user.updateAttribute('age',31);
console.log("to attr: ",user.attributes());
console.log("to JSON: ",user.toJSON());

