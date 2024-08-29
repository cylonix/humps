// =========
// = humps =
// =========
// Underscore-to-camelCase converter (and vice versa)
// for strings and object keys

// humps is copyright © 2012+ Dom Christie
// Released under the MIT license.


;(function(global) {

  var _processKeys = function(convert, obj, options) {
    if(!_isObject(obj) || _isDate(obj) || _isRegExp(obj) || _isBoolean(obj) || _isFunction(obj)) {
      return obj;
    }

    var output,
        i = 0,
        l = 0;

    if(_isArray(obj)) {
      output = [];
      for(l=obj.length; i<l; i++) {
        output.push(_processKeys(convert, obj[i], options));
      }
    }
    else {
      output = {};
      for(var key in obj) {
        if(Object.prototype.hasOwnProperty.call(obj, key)) {
          output[convert(key, options)] = _processKeys(convert, obj[key], options);
        }
      }
    }
    return output;
  };

  // String conversion methods

  // __BEGIN_CYLONIX_MOD__
  // Initialisms sorted by descending length.
  const allUppercaseWords = [
    "ACL", "AMQP", "API", "ASCII",
    "CIDR", "CPU", "CSS",
    "DB", "DNS",
    "EOF",
    "FQDN",
    "GID", "GUID",
    "HTML", "HTTP", "HTTPS",
    "ID", "IP", "IPAM", "IPv4", "IPv6",
    "JSON",
    "PC",
    "QPS",
    "RAM", "RPC", "RTP",
    "SIP", "SLA", "SMTP", "SQL", "SSH",
    "TCP", "TLS", "TS", "TTL",
    "UDP", "UI", "UID", "URI", "URL", "UTF8", "UUID",
    "VM",
    "XML", "XMPP", "XSRF", "XSS"
  ].sort((a, b) => a.length < b.length);
  const allUppercaseWordsMap = new Map()
  allUppercaseWords.forEach((v, i, _) => {
    allUppercaseWordsMap.set(v.toLowerCase(), v)
  });

  const camelizeWithInitialism = function(string) {
    const camelized = camelize(string);
    const words = camelized.split(/(?=[A-Z])/);
    words.forEach((v, i, _) => {
      const upper = allUppercaseWordsMap.get(v.toLowerCase());
        if (i > 0 && upper) {
          words[i] = upper;
        }
    });
    return words.join('');
  };

  const revertInitialism = function (input) {
    const re = /([A-Z][A-Z]+)[^A-Z]*/g;
    let results = input.matchAll(re);
    let result = results.next()
    while (!result.done) {
      const v = result.value;
      for (w of allUppercaseWords) {
        if (v[0] === w || v[1].startsWith(w)) {
          let s = w.toLowerCase();
          s = s.substring(0, 1).toUpperCase() + s.substring(1);
          input = input.replace(w, s);
          results = input.matchAll(re);
          break;
        }
      }
      result = results.next();
    }
    return input;
  };

  // __END_CYLONIX_MOD__

  var separateWords = function(string, options) {
    string = revertInitialism(string) // __CYLONIX_MOD__
    options = options || {};
    var separator = options.separator || '_';
    var split = options.split || /(?=[A-Z])/;
    return string.split(split).join(separator);
  };

  var camelize = function(string) {
    if (_isNumerical(string)) {
      return string;
    }
    string = string.replace(/[\-_\s]+(.)?/g, function(match, chr) {
      return chr ? chr.toUpperCase() : '';
    });
    // Ensure 1st char is always lowercase
    return string.substr(0, 1).toLowerCase() + string.substr(1);
  };

  var pascalize = function(string) {
    var camelized = camelize(string);
    // Ensure 1st char is always uppercase
    return camelized.substr(0, 1).toUpperCase() + camelized.substr(1);
  };

  var decamelize = function(string, options) {
    return separateWords(string, options).toLowerCase();
  };

  // Utilities
  // Taken from Underscore.js

  var toString = Object.prototype.toString;

  var _isFunction = function(obj) {
    return typeof(obj) === 'function';
  };
  var _isObject = function(obj) {
    return obj === Object(obj);
  };
  var _isArray = function(obj) {
    return toString.call(obj) == '[object Array]';
  };
  var _isDate = function(obj) {
    return toString.call(obj) == '[object Date]';
  };
  var _isRegExp = function(obj) {
    return toString.call(obj) == '[object RegExp]';
  };
  var _isBoolean = function(obj) {
    return toString.call(obj) == '[object Boolean]';
  };

  // Performant way to determine if obj coerces to a number
  var _isNumerical = function(obj) {
    obj = obj - 0;
    return obj === obj;
  };

  // Sets up function which handles processing keys
  // allowing the convert function to be modified by a callback
  var _processor = function(convert, options) {
    var callback = options && 'process' in options ? options.process : options;

    if(typeof(callback) !== 'function') {
      return convert;
    }

    return function(string, options) {
      return callback(string, convert, options);
    }
  };

  var humps = {
    camelize: camelize,
    camelizeWithInitialism: camelizeWithInitialism, // __CYLONIX_MOD__
    decamelize: decamelize,
    pascalize: pascalize,
    depascalize: decamelize,
    camelizeKeys: function(object, options) {
      return _processKeys(_processor(camelizeWithInitialism, options), object); // __CYLONIX_MOD__
    },
    decamelizeKeys: function(object, options) {
      return _processKeys(_processor(decamelize, options), object, options);
    },
    pascalizeKeys: function(object, options) {
      return _processKeys(_processor(pascalize, options), object);
    },
    depascalizeKeys: function () {
      return this.decamelizeKeys.apply(this, arguments);
    }
  };

  if (typeof define === 'function' && define.amd) {
    define(humps);
  } else if (typeof module !== 'undefined' && module.exports) {
    module.exports = humps;
  } else {
    global.humps = humps;
  }

})(this);
