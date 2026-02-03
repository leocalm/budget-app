import{j as c}from"./iframe-BlPw6RHN.js";import{A as a}from"./AccountBadge-DQhWeNXk.js";import{G as s}from"./Group-VLj-LUgQ.js";import{B as i}from"./polymorphic-factory-0CtcYZKl.js";import"./preload-helper-PPVm8Dsz.js";import"./IconMap-V95KL8B4.js";import"./createReactComponent-tFrpk4G_.js";import"./Text-CKudE1NG.js";const b={title:"Components/Transactions/AccountBadge",component:a,decorators:[u=>c.jsx(i,{p:"lg",style:{background:"#0a0e14"},children:c.jsx(u,{})})]},n={id:"1",name:"Euro",symbol:"€",currency:"EUR",decimalPlaces:2},e={args:{account:{id:"1",name:"ING",color:"#ff6600",icon:"💳",accountType:"Checking",currency:n,balance:15e4}}},r={args:{account:{id:"2",name:"Poupança",color:"#00ffa3",icon:"🏦",accountType:"Savings",currency:n,balance:5e5}}},o={args:{account:{id:"3",name:"AMEX",color:"#00d4ff",icon:"💳",accountType:"CreditCard",currency:n,balance:-25e3}}},t={render:()=>c.jsxs(s,{gap:"md",children:[c.jsx(a,{account:{id:"1",name:"ING",color:"#ff6600",icon:"💳",accountType:"Checking",currency:n,balance:15e4}}),c.jsx(a,{account:{id:"2",name:"Poupança ING",color:"#00ffa3",icon:"🏦",accountType:"Savings",currency:n,balance:5e5}}),c.jsx(a,{account:{id:"3",name:"AMEX",color:"#00d4ff",icon:"💳",accountType:"CreditCard",currency:n,balance:-25e3}}),c.jsx(a,{account:{id:"4",name:"Revolut",color:"#b47aff",icon:"💳",accountType:"Checking",currency:n,balance:75e3}})]})};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  args: {
    account: {
      id: '1',
      name: 'ING',
      color: '#ff6600',
      icon: '💳',
      accountType: 'Checking',
      currency: mockCurrency,
      balance: 150000
    }
  }
}`,...e.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    account: {
      id: '2',
      name: 'Poupança',
      color: '#00ffa3',
      icon: '🏦',
      accountType: 'Savings',
      currency: mockCurrency,
      balance: 500000
    }
  }
}`,...r.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    account: {
      id: '3',
      name: 'AMEX',
      color: '#00d4ff',
      icon: '💳',
      accountType: 'CreditCard',
      currency: mockCurrency,
      balance: -25000
    }
  }
}`,...o.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  render: () => <Group gap="md">
      <AccountBadge account={{
      id: '1',
      name: 'ING',
      color: '#ff6600',
      icon: '💳',
      accountType: 'Checking',
      currency: mockCurrency,
      balance: 150000
    }} />
      <AccountBadge account={{
      id: '2',
      name: 'Poupança ING',
      color: '#00ffa3',
      icon: '🏦',
      accountType: 'Savings',
      currency: mockCurrency,
      balance: 500000
    }} />
      <AccountBadge account={{
      id: '3',
      name: 'AMEX',
      color: '#00d4ff',
      icon: '💳',
      accountType: 'CreditCard',
      currency: mockCurrency,
      balance: -25000
    }} />
      <AccountBadge account={{
      id: '4',
      name: 'Revolut',
      color: '#b47aff',
      icon: '💳',
      accountType: 'Checking',
      currency: mockCurrency,
      balance: 75000
    }} />
    </Group>
}`,...t.parameters?.docs?.source}}};export{t as AllVariants,e as Checking,o as CreditCard,r as Savings,b as default};
