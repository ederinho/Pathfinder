// Pure state transitions. Only trusted, authored scene IDs are persisted.
export function validCursor(scene,c){return !!c&&Object.hasOwn(scene.nodes,c.node)&&Number.isInteger(c.line)&&c.line>=0&&c.line<scene.nodes[c.node].lines.length}
export function initialCursor(scene,c){return validCursor(scene,c)?{node:c.node,line:c.line}:{node:scene.start,line:0}}
export function advance(scene,c){if(!validCursor(scene,c))throw Error('Invalid cursor');return c.line+1<scene.nodes[c.node].lines.length?{node:c.node,line:c.line+1}:null}
export function choose(scene,c,i){if(!validCursor(scene,c)||advance(scene,c)!==null)return null;const v=scene.nodes[c.node].choices[i];if(!v)return null;if(v.to&&Object.hasOwn(scene.nodes,v.to))return {cursor:{node:v.to,line:0}};if(v.service)return {service:v.service};if(v.end)return {end:true};return null}
