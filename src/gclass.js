// /http://leaflet.cloudmade.com/reference.html#class
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
            if("init" in this) this.init.apply(this, arguments);
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
				this.ctor = this.constructor = self;
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
		self.extend = function(obj, target){
            target = target || self;
			var extended = obj.extended;
			for(var i in obj){
				if(obj.hasOwnProperty(i))
					target[i] = obj[i];
			}

			if(extended) extended(target);
            
            return target;
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