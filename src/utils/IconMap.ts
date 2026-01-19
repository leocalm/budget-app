import React from 'react';
import {
  IconBuildingBank,
  IconBus,
  IconCar,
  IconCash,
  IconChartPie,
  IconCoffee,
  IconCoins,
  IconCreditCard,
  IconDeviceGamepad,
  IconGift,
  IconHeartbeat,
  IconHome,
  IconMovie,
  IconPigMoney,
  IconPlane,
  IconReceipt,
  IconSchool,
  IconShirt,
  IconShoppingCart,
  IconTools,
  IconWallet,
} from '@tabler/icons-react';

export const iconMap: Record<string, React.ComponentType<any>> = {
  // Financial
  wallet: IconWallet,
  creditCard: IconCreditCard,
  pigMoney: IconPigMoney,
  bank: IconBuildingBank,
  cash: IconCash,
  coins: IconCoins,
  chartPie: IconChartPie,
  receipt: IconReceipt,

  // Life & Expenses
  home: IconHome,
  car: IconCar,
  bus: IconBus,
  cart: IconShoppingCart,
  shirt: IconShirt,
  coffee: IconCoffee,
  movie: IconMovie,
  game: IconDeviceGamepad,
  gift: IconGift,
  health: IconHeartbeat,
  school: IconSchool,
  travel: IconPlane,
  tools: IconTools,
};

export const getIcon = (iconName: string, size = 20) => {
  const IconComponent = iconMap[iconName] || IconWallet; // Default fallback
  return React.createElement(IconComponent, { size });
};
