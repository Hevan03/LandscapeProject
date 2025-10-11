import React from "react";
import CustomerNavbar from "./CustomerNavbar";

const CustomerLayout = ({ children }) => (
  <div>
    <CustomerNavbar />
    <div className="pt-0 ">{children}</div>
  </div>
);

export default CustomerLayout;
