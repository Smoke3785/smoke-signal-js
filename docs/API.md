## Functions

<dl>
<dt><a href="#getSendObjectData">getSendObjectData({)</a> ⇒ <code>bytebuffer</code></dt>
<dd><p>Encodes an object into a Tobject ( a bytebuffer prepended with metadata) to send data to a LaunchLike server.</p>
</dd>
<dt><a href="#getSendCommandData">getSendCommandData({lCommand,)</a> ⇒ <code>bytebuffer</code></dt>
<dd><p>Encodes data required to send a command to a LaunchLike server.</p>
</dd>
<dt><a href="#getRequestObjectData">getRequestObjectData({lObject,)</a> ⇒ <code>bytebuffer</code></dt>
<dd><p>Encodes data required to make an object request to a LaunchLike server.</p>
</dd>
<dt><a href="#sendCommand">sendCommand({lObject,)</a> ⇒</dt>
<dd><p>Requests a command from a LaunchLike server with the given code.</p>
</dd>
<dt><a href="#sendObject">sendObject({lObject,)</a> ⇒</dt>
<dd><p>Sends an object from a LaunchLike server with the given code and data.</p>
</dd>
<dt><a href="#requestObject">requestObject({cData})</a> ⇒</dt>
<dd><p>Requests an object from a LaunchLike server with the given code.</p>
</dd>
<dt><a href="#processBytes">processBytes(cData, context)</a> ⇒</dt>
<dd><p>Takes a Tobject and parses out a message type definition and length for the data.
The function then calls a handler method of the context which was provided to it with the transcribed data.</p>
</dd>
</dl>

<a name="getSendObjectData"></a>

## getSendObjectData({) ⇒ <code>bytebuffer</code>
Encodes an object into a Tobject ( a bytebuffer prepended with metadata) to send data to a LaunchLike server.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| { | <code>object</code> | lObject, lInstanceNumber, lStart, cData } |

<a name="getSendCommandData"></a>

## getSendCommandData({lCommand,) ⇒ <code>bytebuffer</code>
Encodes data required to send a command to a LaunchLike server.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| {lCommand, | <code>object</code> | lInstanceNumber} |

<a name="getRequestObjectData"></a>

## getRequestObjectData({lObject,) ⇒ <code>bytebuffer</code>
Encodes data required to make an object request to a LaunchLike server.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| {lObject, | <code>object</code> | lInstanceNumber, lStart, lLength} |

<a name="sendCommand"></a>

## sendCommand({lObject,) ⇒
Requests a command from a LaunchLike server with the given code.

**Kind**: global function  
**Returns**: Nothing. This calls a function within the class context provided to it.  

| Param | Type | Description |
| --- | --- | --- |
| {lObject, | <code>object</code> | lInstanceNumber} |

<a name="sendObject"></a>

## sendObject({lObject,) ⇒
Sends an object from a LaunchLike server with the given code and data.

**Kind**: global function  
**Returns**: Nothing. This calls a function within the class context provided to it.  

| Param | Type | Description |
| --- | --- | --- |
| {lObject, | <code>object</code> | lInstanceNumber, lStart, cData} |

<a name="requestObject"></a>

## requestObject({cData}) ⇒
Requests an object from a LaunchLike server with the given code.

**Kind**: global function  
**Returns**: Nothing. This calls a function within the class context provided to it.  

| Param | Type | Description |
| --- | --- | --- |
| {cData} | <code>object</code> | An object containing the request code, the instance number, the starting position, and the length. Generally only the data is provided. |

<a name="processBytes"></a>

## processBytes(cData, context) ⇒
Takes a Tobject and parses out a message type definition and length for the data.

**Kind**: global function  
**Returns**: Nothing. This calls a function within the class context provided to it.  

| Param | Type | Description |
| --- | --- | --- |
| cData | <code>bytebuffer</code> | The data which you wish to decode |
| context | <code>class</code> | The class context from which you're calling this function. |
