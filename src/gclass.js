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
        	if("init" in this)
           	    this.init.apply(this, arguments);
        };

        //define default constructor. TODO:we could rename it.
        self.prototype.init = function(){};

        //Change self proto.
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
		
    	//define default constructor. TODO:we could rename it.
        //self.prototype.init = function(){};
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


////////////

//////////////////////////////////////////////////////////////
//	

//var Domesticated = Class.decorator(function(obj, decorator){
//    // Override the instance' scare method
//    Class.override(obj,'scare', function(){
//    	this.parent.scare();
//    	console.log("Dont scare")
//    });
//
//    // Add a method
//    obj.kneel = function(){};
//
//// Bind some custom events
//    if(window.hasOwnProperty('$'))
//        $(obj).on('barking', function() {});
//});
/*
var ORM = Class('ORM').include({
    init:function(){
        console.log('ORM construxtor');        
    },
    setId:function(id){
    	this.id = id;
    	console.log(id);
    }
    
}).extend({
    findByPk:function(id){
        console.log('We have item with ',id);
        return new this('Micho','Montana',23);
    }    
});

var Model = Class('Model',ORM).include({
    name:'',
    lastname:'',
    age:0,
    init:function(name, lastname, age){
        this._super.init();
        this.name = name;
        this.lastname = lastname;
        this.age = age;
        console.log('User constructor'); 
    },
    setId:function(id){
       this._super.setId(id);
       console.log('Hola, im ', this.id);
    },
    fullName:function(){
        return this.name+" "+this.lastname;
    },
    toString:function(){
        return '[User: name->'+this.name+', lastname->'+this.lastname+', age->'+this.age+']';
    }
}).extend({
   findByPk:function(id){
       console.log('Model super', this._super)
       return new this('Wachiturro','Lampon',id);
   }
});
var user = new Model("Pepe","Rone",23);
var guest = Model.findByPk(2);


guest.setId(2)
//user.name = "Pepe";
//user.lastname = 'Rone';
//user.age = 31;
console.log(user.toString());
console.log(guest.toString())
console.log(user.__name__.toString());
console.log('Model._super? ',Model.findByPk(3));

console.log(user instanceof Model)
console.log(user instanceof ORM)



var Animal = Class('Animal').extend({
            animalType:function(){
                return "Animal";
            }
        });
var Dog = Class('Dog','Animal');
var Poodle = Class('Poodle','Dog');
var dog = new Dog();
var milu = new Poodle();
Animal.prototype.KK = 3;
Animal.extend({OOP:23, makeGUID:function(){return 34;}});

var Cat = Class('Cat',Animal);
var michi = new Cat();
console.log(milu instanceof Class);
console.log(milu instanceof Animal);
console.log(milu instanceof Dog);
console.log(milu instanceof Poodle);
*/