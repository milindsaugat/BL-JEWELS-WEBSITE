import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { verifyCode, saveProfile, saveAddresses, orderAction, sendCode } from '../src/controllers/customerController.js';
import Challenge from '../src/models/EmailChallenge.js';
import User from '../src/models/User.js';
import Order from '../src/models/Order.js';
const response=()=>({statusCode:200,status(n){this.statusCode=n;return this;},json(data){this.data=data;return this;}});
test('OTP is purpose-bound, attempt-limited and consumed once, and cannot set admin role',async()=>{
 const original={find:Challenge.findOneAndUpdate,del:Challenge.findOneAndDelete,user:User.findOne,create:User.create,secret:process.env.JWT_SECRET};
 process.env.JWT_SECRET='otp-test-secret';
 const digest=crypto.createHmac('sha256',process.env.JWT_SECRET).update('a@example.com:login:123456').digest('hex');
 let attempts=0,consumed=false;
 Challenge.findOneAndUpdate=async q=>{assert.equal(q.attempts.$lt,5);assert.ok(q.expiresAt.$gt instanceof Date);if(consumed||attempts>=5||q.purpose!=='login')return null;attempts++;return {_id:'challenge',digest};};
 Challenge.findOneAndDelete=async()=>{if(consumed)return null;consumed=true;return {};};
 User.findOne=async()=>null;
 User.create=async data=>{assert.equal(data.role,undefined);return {...data,_id:'customer',isActive:true,role:'customer',wishlist:[],addresses:[]};};
 try{
   let res=response();await verifyCode('reset')({body:{email:'a@example.com',otp:'123456',newPassword:'new-password'}},res);assert.equal(res.statusCode,400);
   res=response();await verifyCode('login')({body:{email:'a@example.com',otp:'999999'}},res);assert.equal(res.statusCode,400);
   res=response();await verifyCode('login')({body:{email:'a@example.com',otp:'123456',role:'admin'}},res);assert.equal(res.data.success,true);assert.equal(res.data.user.role,'customer');assert.ok(res.data.accessToken);
   res=response();await verifyCode('login')({body:{email:'a@example.com',otp:'123456'}},res);assert.equal(res.statusCode,400);
   consumed=false;attempts=5;res=response();await verifyCode('login')({body:{email:'a@example.com',otp:'123456'}},res);assert.equal(res.statusCode,400);
 }finally{Challenge.findOneAndUpdate=original.find;Challenge.findOneAndDelete=original.del;User.findOne=original.user;User.create=original.create;if(original.secret===undefined)delete process.env.JWT_SECRET;else process.env.JWT_SECRET=original.secret;}
});
test('profile whitelists fields; address validation rejects incomplete data',async()=>{
 const user={role:'customer',email:'a@example.com',save:async()=>{}};let res=response();
 await saveProfile({user,body:{name:'Customer',phone:'9876543210',role:'admin',email:'changed@example.com'}},res);
 assert.equal(res.data.success,true);assert.equal(user.role,'customer');assert.equal(user.email,'a@example.com');
 res=response();await saveAddresses({user,body:{addresses:[{name:'Incomplete'}]}},res);assert.equal(res.statusCode,400);
});
test('order action is restricted to owner and eligible status',async()=>{
 const original=Order.findOneAndUpdate;
 try{Order.findOneAndUpdate=async(q,u)=>{assert.equal(q.user,'owner');assert.deepEqual(q.status.$in,['delivered']);assert.equal(u.$set.status,'return_requested');return null;};const res=response();await orderAction({user:{_id:'owner'},params:{id:'other-order'},body:{action:'return'}},res);assert.equal(res.statusCode,400);}finally{Order.findOneAndUpdate=original;}
});
test('unconfigured email cannot issue a successful OTP response',async()=>{const res=response();await sendCode('login')({body:{email:'a@example.com'}},res);assert.equal(res.statusCode,503);});
