import React from 'react';
import MenuPage from '../components/MenuPage';
import { menuData } from '../data/menuData';

export default function Cakes() {
  return <MenuPage title="Cakes" items={menuData.cakes || []} />;
}
