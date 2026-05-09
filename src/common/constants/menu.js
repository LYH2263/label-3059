import {
    MessageSquare, History, User, Users, Calendar, Briefcase, BarChart3, Star, StickyNote, Settings, LayoutGrid, Building, ShieldCheck, Headphones
} from 'lucide-react';

export const MENU_ITEMS = [
    { id: 'home', label: '首页', icon: LayoutGrid, path: '/' },
    { id: 'messages', label: '消息', icon: MessageSquare, path: '/messages' },
    { id: 'invitation', label: '邀约记录', icon: History, path: '/invitation' },
    { id: 'personal-data', label: '个人数据', icon: User, path: '/personal-data' },
    { id: 'team-data', label: '团队数据', icon: Users, path: '/team-data' },
    { id: 'interview-management', label: '面试管理', icon: Calendar, path: '/interview-management' },
    { id: 'job-management', label: '岗位管理', icon: Briefcase, path: '/job-management' },
    { id: 'interview-data', label: '面试数据', icon: BarChart3, path: '/interview-data' },
    { id: 'my-favorites', label: '我的收藏', icon: Star, path: '/my-favorites' },
    { id: 'memo', label: '备忘录', icon: StickyNote, path: '/memo' },
    { id: 'personal-center', label: '个人中心', icon: Settings, path: '/personal-center' },
    { id: 'org-chart', label: '组织架构', icon: Building, path: '/org-chart' },
    { id: 'enterprise-settings', label: '企业设置', icon: LayoutGrid, path: '/enterprise-settings' },
    { id: 'system-management', label: '系统管理', icon: ShieldCheck, path: '/system-management' },
    { id: 'customer-service', label: '我的客服', icon: Headphones, path: '/customer-service' }
];
