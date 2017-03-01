function jbansCloneSchemaProperties(source, banSkip, opts) {
  var clone = {};
  var keys = Object.keys(source);
  var n = keys.length;
  for (var i = 0; i < n; ++i) {
    var key = keys[i];
    clone[key] = jbansCloneSchemaObject(source[key], banSkip, opts);
  }
  return clone;
}

function jbansCloneSchemaOrStringArrayProperties(source, banSkip, opts) {
  var clone = {};
  var keys = Object.keys(source);
  var n = keys.length;
  var cloneArray = opts.cloneArray;
  for (var i = 0; i < n; ++i) {
    var key = keys[i];
    if (Array.isArray(source[key])) {
      clone[key] = cloneArray(source[key]);
    } else {
      clone[key] = jbansCloneSchemaObject(source[key], banSkip, opts);
    }
  }
  return clone;
}

function jbansCloneSchemaObject(source, banSkip, opts) {
  var shouldBan = !banSkip && source.type == 'object' &&
    typeof source.additionalProperties == 'undefined' &&
    !(source.allOf && opts.defer.allOf ||
      source.anyOf && opts.defer.anyOf ||
      source.oneOf && opts.defer.oneOf);

  var clone = {};
  var keys = Object.keys(source);
  var n = keys.length;
  var cloneArray = opts.cloneArray;
  var cloneOther = opts.cloneOther;
  var cloneAdditionalProperties = opts.cloneAdditionalProperties;
  for (var i = 0; i < n; ++i) {
    var key = keys[i];
    switch (key) {

      case 'items':
        if (Array.isArray(source[key])) {
          clone[key] = jbansCloneSchemaArray(source[key],
            banSkip && banSkip - 1, opts);
        } else {
          clone[key] = jbansCloneSchemaObject(source[key],
            banSkip && banSkip - 1, opts);
        } break;

      case 'allOf':
        clone[key] = jbansCloneSchemaArray(source[key],
          opts.skip.allOf ? banSkip || 1 : banSkip && banSkip - 1, opts);
        break;
      case 'anyOf':
        clone[key] = jbansCloneSchemaArray(source[key],
          opts.skip.anyOf ? banSkip || 1 : banSkip && banSkip - 1, opts);
        break;
      case 'oneOf':
        clone[key] = jbansCloneSchemaArray(source[key],
          opts.skip.oneOf ? banSkip || 1 : banSkip && banSkip - 1, opts);
        break;

      case 'not':
        clone[key] = jbansCloneSchemaObject(source[key],
          banSkip == Infinity ? 0 : Infinity, opts);
        break;

      case 'additionalItems':
      case 'additionalProperties':
        if (typeof source[key] == 'boolean') {
          clone[key] = source[key]; // boolean clone
        } else {
          clone[key] = jbansCloneSchemaObject(source[key],
            banSkip && banSkip - 1, opts);
        } break;

      case 'definitions':
      case 'properties':
      case 'patternProperties':
        clone[key] = jbansCloneSchemaProperties(source[key],
          banSkip && banSkip - 1, opts);
        break;

      case 'dependencies':
        clone[key] = jbansCloneSchemaOrStringArrayProperties(source[key],
          banSkip && banSkip - 1, opts);
        break;

      case 'type':
        if (Array.isArray(source[key])) {
          clone[key] = cloneArray(source[key]);
        } else {
          clone[key] = source[key]; // string clone
        } break;

      // array of anything
      case 'enum':
      // string array
      case 'required':
        clone[key] = cloneArray(source[key]);
        break;

      // strings
      case '$schema':
      case 'id':
      case 'title':
      case 'description':
      // formatted strings
      case 'pattern':
      // numbers
      case 'multipleOf':
      case 'maximum':
      case 'minimum':
      // fancy numbers
      case 'maxLength':
      case 'minLength':
      case 'maxItems':
      case 'minItems':
      case 'maxProperties':
      case 'minProperties':
      // booleans
      case 'exclusiveMaximum':
      case 'exclusiveMinimum':
      case 'uniqueItems':
        clone[key] = source[key];
        break;

      // anything
      case 'default':
        clone[key] = cloneOther(source[key], key);
        break;

      // any out-of-scope property
      default:
        clone[key] = cloneAdditionalProperties(source[key], key);
        break;
    }
  }
  if (shouldBan) {
    clone.additionalProperties = false;
  }
  return clone;
}

function jbansCloneSchemaArray(source, banSkip, opts) {
  return source.map(function(obj){
    return jbansCloneSchemaObject(obj, banSkip, opts)});
}

module.exports = function jbans(schema, opts) {
  opts = opts || {};
  opts.skip = opts.skip || {};
  opts.defer = opts.defer || {};
  opts.cloneOther = opts.cloneOther || function identity(x){return x};
  opts.cloneArray = opts.cloneArray || opts.cloneOther;
  opts.cloneAdditionalProperties =
    opts.cloneAdditionalProperties || opts.cloneOther;
  return jbansCloneSchemaObject(schema, 0, opts);
};
