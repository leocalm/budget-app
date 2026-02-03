import{j as r}from"./iframe-BlPw6RHN.js";import{T as m,u as s,a as i}from"./TransactionFormFields-B6Er_Iri.js";import"./preload-helper-PPVm8Dsz.js";import"./use-form-ae0NiLND.js";import"./polymorphic-factory-0CtcYZKl.js";import"./noop-BjFrJKj1.js";import"./TextInput-BD6MJsqd.js";import"./UnstyledButton-DT2tpwi4.js";import"./index-R61n_Ntc.js";import"./ScrollArea-DfS6V9t2.js";import"./create-safe-context-B7JJMNKb.js";import"./Loader-CTmnaFpN.js";import"./Stack-quhSlGT0.js";import"./Grid-3nMlZOK-.js";import"./get-base-value-FMRBrurP.js";import"./createReactComponent-tFrpk4G_.js";import"./Autocomplete-B3pbZYoq.js";import"./ActionIcon-_QTefNip.js";const E={title:"Components/Transactions/TransactionFormFields",component:m,decorators:[o=>{const c=s({initialValues:{description:"",amount:0,occurredAt:"",fromAccountName:null,toAccountName:null,categoryName:null,vendorName:""}});return r.jsx(i,{form:c,children:r.jsx(o,{})})}]},n=[{id:"1",name:"Main Checking",color:"#228be6",icon:"wallet",accountType:"Checking",currency:{id:"1",name:"Euro",symbol:"€",currency:"EUR",decimalPlaces:2},balance:15e4}],a=[{id:"c1",name:"Food",color:"blue",icon:"shopping-cart",parentId:null,categoryType:"Outgoing"}],t=[{id:"v1",name:"Supermarket"}],p=new Map(n.map(o=>[o.name,o])),u=new Map(a.map(o=>[o.name,o])),l=new Map(t.map(o=>[o.name,o])),e={args:{accounts:n,categories:a,vendors:t,accountsByName:p,categoriesByName:u,vendorsByName:l}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  args: {
    accounts: mockAccounts,
    categories: mockCategories,
    vendors: mockVendors,
    accountsByName,
    categoriesByName,
    vendorsByName
  }
}`,...e.parameters?.docs?.source}}};export{e as Default,E as default};
