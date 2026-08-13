import React from 'react';
import MenuPage from '../components/MenuPage';
import { menuData } from '../data/menuData';

export default function Bakery() {
  return <MenuPage title="Bakery" items={menuData.bakery || []} />;
}
