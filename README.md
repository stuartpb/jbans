# jbans

Node module to create a "ban additional properties" clone of a given JSON Schema.

`var banned = jbans(schema);`

## Options for working with merge-dependent schema

*NOTE: This is written badly, like trying to explain how to drive a car by describing the blueprints. I haven't even tested this functionality, so you should probably just ignore this for now, and just don't try to use this with any schema that uses `anyOf`, `allOf`, or `oneOf` with objects if you haven't specified `additionalProperties` everywhere around it.*

By default, this module assumes your schema is completely designed so that *any* properties that an object may contain are present on *all* `allOf`, `anyOf`, and/or `oneOf` subschemas *and* their parent schema(s) (or they have `additionalProperties` explicitly specified appropriately).

If your schema does *not* meet this criteria, you can set options under `defer` or `skip` option objects to *implicitly* allow `additionalProperties` as appropriate.

However, each of these require *at least one point* to have the properties explicitly defined:

Setting `defer` for a class instead of `skip` will be acceptable so long as *all the subschemas* each have all the necessary properties defined.

Setting `skip` for a class instead of `defer` will be acceptable so long as the *outer object* has all the properties of the subschemas defined.

Setting neither for a class requires *both* to have all the properties defined, which may be fine for your use case.

Setting *both* will allow additional properties on objects with that type of junction (unless it is also constrained by *another* junction level of test that *does not* have `skip` defined).

### `defer`

Object with boolean properties for `allOf`, `anyOf`, and `oneOf`.

If arrays for any of these properties set to `true` are present on an object, `additionalProperties` will *not* be set for that object, under the expectation that additional properties will instead be rejected within the *subschemas*.

By default, all three are `false`. You may wish to set `anyOf` or `oneOf` to `true`, to allow an object to defer to the `additionalProperties` restictions of the matching subschema(s): if the subschemas aren't a superset of their containing schema (ie. the object with the `anyOf` or `oneOf` defines properties that aren't in the subschemas), you will need to have any sub-schemas not accepting `additionalProperties` mirror these super-properties.

### `skip`

Object with boolean properties for `allOf`, `anyOf`, and `oneOf`.

Any arrays of types set to `true` here will not have `additionalProperties` set on their subschemas (though note that subschemas *below* the array's immediate descendants will still be processed).

By default, all three are `false`. You may wish to set `allOf` to `true`, if the subschemas of your `allOf` do not have properties of the other conditions, as this will allow the subschemas that do not specify shared properties to match.

Setting `skip.anyOf` or `skip.oneOf` will allow subschemas to be matched when stray properties of other subschemas are present, and as such will not produce a strong banned-additional-properties behavior.

Also note that this skipping *will not apply* for subschemas included by reference. If you have a referenced subschema that will only be used in the context of `allOf` sets where properties are enumerated on the outside object, you should explicitly set `additionalProperties` to `true` on it.
