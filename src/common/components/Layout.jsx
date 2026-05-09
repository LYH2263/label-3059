import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { MENU_ITEMS } from '../constants/menu';
import { Search, Bell, User, LogOut, Search as SearchIcon, Filter, Layers, Download, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export const Sidebar = () => {
    const location = useLocation();
    const [activeId, setActiveId] = useState(MENU_ITEMS.find(i => i.path === location.pathname)?.id || 'home');

    return (
        <div style={{
            width: '260px', height: '100vh', background: 'white', borderRight: '1px solid #E2E8F0',
            display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, paddingBottom: '24px'
        }}>
            <div style={{ padding: '32px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                    width: '40px', height: '40px', background: 'var(--primary)', borderRadius: '12px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <span style={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}>O</span>
                </div>
                <span style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>桔子管理后台</span>
            </div>

            <nav style={{ flex: 1, padding: '0 16px', overflowY: 'auto' }}>
                {MENU_ITEMS.map((item) => (
                    <NavLink
                        key={item.id}
                        to={item.path}
                        className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
                        onClick={() => setActiveId(item.id)}
                    >
                        <item.icon size={20} />
                        <span style={{ fontSize: '15px' }}>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div style={{ padding: '24px 16px 0', borderTop: '1px solid #F1F5F9' }}>
                <div
                    className="menu-item"
                    style={{ color: '#EF4444' }}
                    onClick={() => {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        window.location.href = '/login';
                    }}
                >
                    <LogOut size={20} />
                    <span style={{ fontSize: '15px' }}>退出登录</span>
                </div>
            </div>
        </div>
    );
};

export const Header = ({ title }) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return (
        <header style={{
            height: '80px', background: 'white', borderBottom: '1px solid #E2E8F0',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px',
            position: 'sticky', top: 0, zIndex: 100
        }}>
            <h1 style={{ fontSize: '24px', fontWeight: 600 }}>{title}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '8px 12px', borderRadius: '12px', transition: '0.2s' }}>
                    <div style={{ width: '40px', height: '40px', background: '#E0E7FF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4F46E5', fontWeight: 'bold' }}>
                        {user.real_name?.[0] || 'U'}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '14px', fontWeight: 600 }}>{user.role}</span>
                        <span style={{ fontSize: '12px', color: '#64748B' }}>{user.real_name}</span>
                    </div>
                </div>
            </div>
        </header>
    );
};

export const FilterBar = ({ onSearch, onFilter, options = [] }) => {
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({});

    const handleFilterChange = (label, value) => {
        const newFilters = { ...filters, [label]: value };
        setFilters(newFilters);
        if (onFilter) onFilter(newFilters);
    };

    return (
        <div className="card" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 24px' }}>
            <Filter size={18} color="#64748B" />
            <div style={{ flex: 1, display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input
                    type="text"
                    placeholder="关键词检索..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ padding: '10px 16px', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '14px', width: '240px' }}
                />
                {options.map((opt, i) => (
                    <select
                        key={i}
                        onChange={(e) => handleFilterChange(opt.label, e.target.value)}
                        style={{ padding: '10px 16px', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '14px', background: 'white' }}
                    >
                        <option value="">{opt.label}</option>
                        {opt.values.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                ))}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
                <button
                    className="btn-primary"
                    onClick={() => onSearch && onSearch(search)}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#FF8A3D' }}
                >
                    <SearchIcon size={16} /> 查询
                </button>
            </div>
        </div>
    );
};

export const Pagination = ({ total, current, pageSize, onPageChange }) => {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', color: '#64748B', fontSize: '14px' }}>
            <span>共 {total} 条数据，每页显示 {pageSize} 条</span>
            <div style={{ display: 'flex', gap: '8px' }}>
                <button style={{ width: '36px', height: '36px', padding: 0, borderRadius: '10px', background: 'white', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ChevronLeft size={16} />
                </button>
                <button className="active" style={{ background: 'var(--primary)', color: 'white', width: '36px', height: '36px', padding: 0 }}>1</button>
                <button style={{ background: 'white', width: '36px', height: '36px', padding: 0, border: '1px solid #E2E8F0' }}>2</button>
                <button style={{ background: 'white', width: '36px', height: '36px', padding: 0, border: '1px solid #E2E8F0' }}>3</button>
                <button style={{ width: '36px', height: '36px', padding: 0, borderRadius: '10px', background: 'white', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
};

export const ChartCard = ({ title, children, extra, style = {} }) => {
    return (
        <div className="card" style={{ height: '400px', display: 'flex', flexDirection: 'column', ...style }}>
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ fontSize: '16px', fontWeight: 600 }}>{title}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {extra}
                    <button style={{ background: 'none', padding: '4px' }}><Layers size={16} color="#94A3B8" /></button>
                </div>
            </div>
            <div style={{ flex: 1, position: 'relative' }}>
                {children}
            </div>
        </div>
    );
};
