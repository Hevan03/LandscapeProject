import React from 'react';
import { FaShoppingCart } from 'react-icons/fa'; 

const CartIcon = ({ itemCount }) => {
  return (
    <div className="relative">
      <FaShoppingCart size={30} className="text-gray-600" />
      {itemCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
          {itemCount}
        </span>
      )}
    </div>
  );
};

export default CartIcon;