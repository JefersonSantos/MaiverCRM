import React from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, GitMerge, FileText, Package, Settings as SettingsIcon, BarChart3 } from 'lucide-react'

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="logo">MaiverCRM</div>
      
      <nav className="nav-links">
        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={20} /> Dashboard
        </NavLink>
        <NavLink to="/crm" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Users size={20} /> CRM de Leads
        </NavLink>
        <NavLink to="/workflows" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <GitMerge size={20} /> Funis de Vendas
        </NavLink>
        <NavLink to="/templates" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <FileText size={20} /> Templates
        </NavLink>
        <NavLink to="/products" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Package size={20} /> Produtos
        </NavLink>
        <NavLink to="/reports" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <BarChart3 size={20} /> Relatórios 
        </NavLink>
      </nav>

      <footer style={{ marginTop: 'auto' }}>
        <NavLink to="/settings" className="nav-item">
          <SettingsIcon size={20} /> Configurações
        </NavLink>
      </footer>
    </aside>
  )
}

export default Sidebar
