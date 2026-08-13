import React from 'react';
import MenuPage from '../components/MenuPage';
import { menuData } from '../data/menuData';

export default function Tea() {
  return <MenuPage title="Tea" items={menuData.tea || []} />;
}
