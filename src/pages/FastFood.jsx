import React from 'react';
import MenuPage from '../components/MenuPage';
import { menuData } from '../data/menuData';

export default function FastFood() {
  return <MenuPage title="Fast Food" items={menuData.fastfood || []} />;
}
