import React from "react";
import AdminNavbar from "./AdminNavbar";
import { Outlet } from "react-router-dom";

const AdminLayout = () => (
  <>
    <AdminNavbar />
    <main>
      <Outlet />
    </main>
  </>
);

export default AdminLayout;
