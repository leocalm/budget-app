import{M as t}from"./MobileTransactionCard-Cyg7Nvtf.js";import"./iframe-BlPw6RHN.js";import"./preload-helper-PPVm8Dsz.js";import"./IconMap-V95KL8B4.js";import"./createReactComponent-tFrpk4G_.js";import"./polymorphic-factory-0CtcYZKl.js";import"./Paper-ZXYsCSl_.js";import"./create-safe-context-B7JJMNKb.js";import"./Group-VLj-LUgQ.js";import"./ActionIcon-_QTefNip.js";import"./Loader-CTmnaFpN.js";import"./UnstyledButton-DT2tpwi4.js";import"./index-R61n_Ntc.js";import"./Text-CKudE1NG.js";const b={title:"Components/Transactions/MobileTransactionCard",component:t},n={id:"1",name:"Main Checking",color:"#228be6",icon:"wallet",accountType:"Checking",currency:{id:"1",name:"Euro",symbol:"€",currency:"EUR",decimalPlaces:2},balance:15e4},a={id:"c1",name:"Food",color:"blue",icon:"shopping-cart",parentId:null,categoryType:"Outgoing"},c={id:"v1",name:"Supermarket"},e={id:"t1",description:"Grocery Shopping",amount:5e3,occurredAt:"2023-10-14",category:a,fromAccount:n,toAccount:null,vendor:c},o={args:{transaction:e}},r={args:{transaction:{...e,category:{...a,categoryType:"Transfer",name:"Transfer",icon:"arrows-left-right"},toAccount:{...n,id:"2",name:"Savings",color:"green"},description:""}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    transaction: mockTransaction
  }
}`,...o.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    transaction: {
      ...mockTransaction,
      category: {
        ...mockCategory,
        categoryType: 'Transfer',
        name: 'Transfer',
        icon: 'arrows-left-right'
      },
      toAccount: {
        ...mockAccount,
        id: '2',
        name: 'Savings',
        color: 'green'
      },
      description: ''
    }
  }
}`,...r.parameters?.docs?.source}}};export{o as Default,r as Transfer,b as default};
