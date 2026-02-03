import{j as e}from"./iframe-BlPw6RHN.js";import{T as m,a as c}from"./TransactionRow-DNspj6YV.js";import"./preload-helper-PPVm8Dsz.js";import"./AccountBadge-DQhWeNXk.js";import"./IconMap-V95KL8B4.js";import"./createReactComponent-tFrpk4G_.js";import"./polymorphic-factory-0CtcYZKl.js";import"./Text-CKudE1NG.js";import"./UnstyledButton-DT2tpwi4.js";import"./index-R61n_Ntc.js";import"./CategoryBadge-D92ZnZJ2.js";import"./useTranslation-CrzPYgp4.js";import"./index-tni0gN6T.js";import"./Group-VLj-LUgQ.js";import"./create-safe-context-B7JJMNKb.js";import"./ScrollArea-DfS6V9t2.js";const C={title:"Components/Transactions/TransactionRow",component:m,decorators:[i=>e.jsx(c,{verticalSpacing:"sm",highlightOnHover:!0,striped:"even",style:{background:"#151b26",borderRadius:"16px",border:"1px solid rgba(255, 255, 255, 0.06)",overflow:"hidden"},children:e.jsx(c.Tbody,{children:e.jsx(i,{})})})]},t={id:"1",name:"ING",color:"#ff6600",icon:"💳",accountType:"Checking",currency:{id:"1",name:"Euro",symbol:"€",currency:"EUR",decimalPlaces:2},balance:15e4},d={id:"c1",name:"Comida",color:"#b47aff",icon:"🍔",parentId:null,categoryType:"Outgoing"},l={id:"v1",name:"McDonald's"},s={id:"t1",description:"Lunch at Restaurant",amount:4550,occurredAt:"2026-01-16",category:d,fromAccount:t,toAccount:null,vendor:l},p={id:"t3",description:"Salary January",amount:324500,occurredAt:"2026-01-01",category:{id:"c3",name:"Salary",color:"#00ffa3",icon:"💰",parentId:null,categoryType:"Incoming"},fromAccount:t,toAccount:null,vendor:{id:"v2",name:"Company Inc."}},u={id:"t2",description:"Savings Transfer",amount:5e4,occurredAt:"2026-01-12",category:{id:"c2",name:"Transferência",color:"#00d4ff",icon:"💸",parentId:null,categoryType:"Transfer"},fromAccount:t,toAccount:{id:"2",name:"Poupança",color:"#00ffa3",icon:"🏦",accountType:"Savings",currency:{id:"1",name:"Euro",symbol:"€",currency:"EUR",decimalPlaces:2},balance:5e5},vendor:null},n={args:{transaction:s,onEdit:()=>{},onDelete:()=>{}}},o={args:{transaction:p,onEdit:()=>{},onDelete:()=>{}}},r={args:{transaction:u,onEdit:()=>{},onDelete:()=>{}}},a={args:{transaction:s,onEdit:()=>{},onDelete:()=>{},animationDelay:.2}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    transaction: regularTransaction,
    onEdit: () => {},
    onDelete: () => {}
  }
}`,...n.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    transaction: incomeTransaction,
    onEdit: () => {},
    onDelete: () => {}
  }
}`,...o.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    transaction: transferTransaction,
    onEdit: () => {},
    onDelete: () => {}
  }
}`,...r.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    transaction: regularTransaction,
    onEdit: () => {},
    onDelete: () => {},
    animationDelay: 0.2
  }
}`,...a.parameters?.docs?.source}}};export{o as Incoming,n as Outgoing,r as Transfer,a as WithAnimationDelay,C as default};
