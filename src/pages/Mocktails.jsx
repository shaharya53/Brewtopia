import React from 'react';
import MenuPage from '../components/MenuPage';
import { menuData } from '../data/menuData';

export default function Mocktails() {
  return <MenuPage title="Mocktails" items={menuData.mocktails || []} />;
}
