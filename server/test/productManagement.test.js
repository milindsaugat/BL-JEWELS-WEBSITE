import test from 'node:test';
import assert from 'node:assert/strict';
import { productInput } from '../src/services/productValidation.js';
import { orderLines, cancelInventoryOrder, createInventoryOrder } from '../src/services/orderInventory.js';
import mongoose from 'mongoose';
import Product from '../src/models/Product.js';
import Order from '../src/models/Order.js';
const product=()=>({name:'Gold ring',description:'Gold ring description',category:'012345678901234567890123',images:[{url:'https://example.com/ring.jpg'}],variants:[{sku:'RING-12',price:100,stock:2,weight:3,isDefault:true}]});
test('product validation protects prices, stock, SKUs, images and combos',()=>{
 assert.equal(productInput(product()).name,'Gold ring');
 for(const change of [{stock:-1},{stock:1.5},{price:0},{discountPrice:101},{discountPrice:-1},{sku:''}])assert.throws(()=>productInput({...product(),variants:[{...product().variants[0],...change}]}));
 assert.throws(()=>productInput({...product(),variants:[...product().variants,...product().variants]}));
 assert.throws(()=>productInput({...product(),images:[{url:'javascript:alert(1)'}]}));
 assert.throws(()=>productInput({...product(),productType:'combo',comboItems:[]}));
 assert.deepEqual(productInput({isActive:false,ratings:{average:5},$set:{name:'x'}},true),{isActive:false});
});
test('checkout accepts valid SKU quantities, not invalid quantities',()=>{
 const item={product:'012345678901234567890123',quantity:2,snapshot:{variant:{sku:'RING-12'}},price:1};
 assert.deepEqual(orderLines([item]),[{product:item.product,sku:'RING-12',quantity:2}]);
 for(const quantity of [0,-1,1.5,1001])assert.throws(()=>orderLines([{...item,quantity}]));
 assert.throws(()=>orderLines([{...item,snapshot:{}}]));
});
test('checkout uses server prices and conditional inventory writes inside a transaction',async()=>{
 const original={session:mongoose.startSession,find:Product.findOneAndUpdate,create:Order.create};let ended=false;
 const session={withTransaction:async fn=>fn(),endSession:async()=>{ended=true;}};
 mongoose.startSession=async()=>session;
 Product.findOneAndUpdate=async(filter,update,options)=>{assert.equal(filter.variants.$elemMatch.stock.$gte,2);assert.equal(update.$inc['variants.$.stock'],-2);assert.equal(options.session,session);return {_id:'012345678901234567890123',name:'Actual name',images:[],metal:{},variants:[{sku:'RING-12',price:100,discountPrice:80,toObject(){return {sku:this.sku};}}]};};
 Order.create=async([data],options)=>{assert.equal(options.session,session);assert.equal(data.items[0].price,80);assert.equal(data.pricing.subtotal,160);return [data];};
 try{await createInventoryOrder('owner',{items:[{product:'012345678901234567890123',quantity:2,price:1,snapshot:{variant:{sku:'RING-12'}}}],shippingAddress:{name:'Customer',line1:'Street',city:'Agra',state:'UP',pincode:'282002',phone:'9876543210'},paymentMethod:'cod'});assert.equal(ended,true);}finally{mongoose.startSession=original.session;Product.findOneAndUpdate=original.find;Order.create=original.create;}
});
test('cancellation restores reserved stock once and keeps owner restriction',async()=>{
 const original={session:mongoose.startSession,find:Order.findOne,update:Product.updateOne};let updates=0;
 const session={withTransaction:async fn=>fn(),endSession:async()=>{}};
 const order={status:'placed',inventoryReserved:true,items:[{product:'product',quantity:2,snapshot:{variant:{sku:'SKU'}}}],statusHistory:[],save:async()=>{}};
 mongoose.startSession=async()=>session;Order.findOne=q=>{assert.equal(q.user,'owner');return {session:async()=>order};};Product.updateOne=async(q,u)=>{updates++;assert.equal(u.$inc['variants.$.stock'],2);};
 try{await cancelInventoryOrder({_id:'id',user:'owner'});assert.equal(updates,1);assert.equal(order.inventoryReserved,false);await assert.rejects(()=>cancelInventoryOrder({_id:'id',user:'owner'}));assert.equal(updates,1);}finally{mongoose.startSession=original.session;Order.findOne=original.find;Product.updateOne=original.update;}
});
