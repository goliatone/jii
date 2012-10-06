beforeEach(function() {
  this.addMatchers({
    toBeArray: function() {
      return {}.toString.call(this.actual) === '[object Array]';
    },

    toBeInstanceOf: function(Constructor) {
      return this.actual instanceof Constructor;
    },

    toBeNan: function() { // needs to be spelled 'Nan' due to jasmine conventions
      var actual = this.actual;
      // NaN is the only value that is not strictly equal to itself
      return actual !== actual;
    },

    toBeOfType: function(type) {
      return typeof this.actual === type;
    },

    toHaveLength: function(length) {
      return this.actual.length === length;
    },

    toHaveProperties: function(name0, name1, name2) {
      var actual = this.actual;
      for (var i = 0, len = arguments.length; i < len; i += 1) {
        if (!(arguments[i] in actual)) {
          return false;
        }
      }
      return true;
    },

    toHaveMethods:function(){
        var actual = this.actual, 
            hasOwnProperty = {}.hasOwnProperty,
            prop;

        for (var i = 0, len = arguments.length; i < len; i += 1) {
            prop = arguments[i];
            if (!hasOwnProperty.call(actual, prop) 
                && typeof actual[prop] === 'function') {
                return false;
            }
        }
        return true;
    },
    toHaveOwnProperties: function(name0, name1, name2) {
      var actual = this.actual, hasOwnProperty = {}.hasOwnProperty;
      for (var i = 0, len = arguments.length; i < len; i += 1) {
        if (!hasOwnProperty.call(actual, arguments[i])) {
          return false;
        }
      }
      return true;
    },
    ///////
    toMatchObject:function(x){
      var p, actual = this.actual;
      for(p in actual) {
          if(typeof(x[p])=='undefined') {return false;}
      }

      for(p in actual) {
          if (actual[p]) {
              switch(typeof(actual[p])) {
                  case 'object':
                      if (!actual[p].equals(x[p])) { return false; } break;
                  case 'function':
                      if (typeof(x[p])=='undefined' ||
                          (p != 'equals' && actual[p].toString() != x[p].toString()))
                          return false;
                      break;
                  default:
                      if (actual[p] != x[p]) { return false; }
              }
          } else {
              if (x[p])
                  return false;
          }
      }

      for(p in x) {
          if(typeof(actual[p])=='undefined') {return false;}
      }

      return true;  
    },
    toNotMatchObject:function(object){
      return this.toMatchObject(object) === false;
    },
    toNotMatch:function(object){
      return this.actual !== object;
    },
    //////

    toThrowInstanceOf: function(klass) {
      try {
        this.actual();
      } catch (e) {
        return e instanceof klass;
      }
      return false;
    },

    toHaveBeenCalledXTimes: function(count) {
      var callCount = this.actual.callCount;
      var not = this.isNot ? "NOT " : "";
      this.message = function() {
        return 'Expected spy "' + this.actual.identity + '" ' + not + ' to have been called ' + count + ' times, but was ' + callCount + '.';
      };
      return callCount == count;
    },

    toContainOnce: function(value) {
      var actual = this.actual;
      var containsOnce = false;
      if (actual) {
        var firstFoundAt = actual.indexOf(value);
        containsOnce = firstFoundAt!=-1 && firstFoundAt == actual.lastIndexOf(value);
      }
      return containsOnce;
    },

    toEndWith: function(value) {
      return endsWith(this.actual, value);
    },

    toEachEndWith: function(searchString) {
      var arrayOfStrings = this.actual;
      return arrayOfStrings.every(function(oneValue) {
        return endsWith(oneValue, searchString)
      });
    },

    toSomeEndWith: function(searchString) {
      var arrayOfStrings = this.actual;
      return arrayOfStrings.some(function(oneValue) {
        return endsWith(oneValue, searchString)
      });
    }

  })
});

function endsWith(haystack, needle){
  return haystack.substr(-needle.length) == needle;
}