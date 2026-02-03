import{T as a}from"./TransactionList-xlChzB5Z.js";import"./iframe-BlPw6RHN.js";import"./preload-helper-PPVm8Dsz.js";import"./TransactionRow-DNspj6YV.js";import"./AccountBadge-DQhWeNXk.js";import"./IconMap-V95KL8B4.js";import"./createReactComponent-tFrpk4G_.js";import"./polymorphic-factory-0CtcYZKl.js";import"./Text-CKudE1NG.js";import"./UnstyledButton-DT2tpwi4.js";import"./index-R61n_Ntc.js";import"./CategoryBadge-D92ZnZJ2.js";import"./useTranslation-CrzPYgp4.js";import"./index-tni0gN6T.js";import"./Group-VLj-LUgQ.js";import"./create-safe-context-B7JJMNKb.js";import"./ScrollArea-DfS6V9t2.js";const C={title:"Components/Transactions/TransactionList",component:a,parameters:{layout:"fullscreen"}},n={id:"1",name:"Main Checking",color:"#228be6",icon:"wallet",accountType:"Checking",currency:{id:"1",name:"Euro",symbol:"€",currency:"EUR",decimalPlaces:2},balance:15e4},t={id:"c1",name:"Food",color:"blue",icon:"shopping-cart",parentId:null,categoryType:"Outgoing"},e={id:"v1",name:"Supermarket"},c=[{id:"t1",description:"Grocery Shopping",amount:5e3,occurredAt:"2023-10-14",category:t,fromAccount:n,toAccount:null,vendor:e},{id:"t2",description:"Salary",amount:3e5,occurredAt:"2023-10-01",category:{...t,categoryType:"Incoming",name:"Salary",icon:"cash",color:"green"},fromAccount:n,toAccount:null,vendor:{id:"v2",name:"Employer"}}],o={args:{transactions:c,deleteTransaction:async()=>{}}},r={args:{transactions:[],deleteTransaction:async()=>{}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    transactions: mockTransactions,
    deleteTransaction: async () => {}
  }
}`,...o.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    transactions: [],
    deleteTransaction: async () => {}
  }
}`,...r.parameters?.docs?.source}}};export{o as Default,r as Empty,C as default};
