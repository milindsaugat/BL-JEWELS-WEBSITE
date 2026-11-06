import test from 'node:test';
import assert from 'node:assert/strict';
import { readRecent, rememberProduct } from '../src/lib/recentProducts.js';
const makeStorage=()=>{const data=new Map();return {getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v)};};
test('visitor history deduplicates, keeps newest first, caps at 24, and separates accounts',()=>{
 const storage=makeStorage(),id=n=>n.toString(16).padStart(24,'0');
 for(let n=1;n<=30;n++)rememberProduct(storage,null,id(n));
 rememberProduct(storage,null,id(15));assert.equal(readRecent(storage)[0],id(15));assert.equal(readRecent(storage).length,24);assert.equal(new Set(readRecent(storage)).size,24);
 rememberProduct(storage,'user-a',id(2));assert.deepEqual(readRecent(storage,'user-a'),[id(2)]);assert.deepEqual(readRecent(storage,'user-b'),[]);
});
test('broken and blocked browser storage do not break the product page',()=>{
 assert.deepEqual(readRecent({getItem:()=>'{invalid'}),[]);
 assert.doesNotThrow(()=>rememberProduct({getItem(){throw Error();},setItem(){throw Error();}},null,'012345678901234567890123'));
});
