import React from 'react';
import MenuPage from '../components/MenuPage';
import { menuData } from '../data/menuData';

export default function Coffee() {
  return <MenuPage title="Coffee" items={menuData.coffee || []} />;
}
