import React, { useState, useEffect } from 'react';
import { Sidebar, Header, FilterBar } from '../common/components/Layout';
import { Mail, Bell, MessageSquare, Send, Search, CheckCircle, Clock, AlertCircle, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageAPI } from '../common/api/request';
import { useToast, Modal } from '../common/components/Feedback';

export const Messages = () => {
    const [activeTab, setActiveTab] = useState('全部');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    const fetchMessages = async () => {
        try {
            const res = await MessageAPI.list();
            setMessages(res);
        } catch { showToast('无法加载消息', 'error'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchMessages(); }, []);

    const markAsRead = async (id) => {
        try {
            await MessageAPI.markRead(id);
            fetchMessages();
        } catch { }
    };

    const deleteMessage = async (e, id) => {
        e.stopPropagation();
        try {
            await MessageAPI.delete(id);
            showToast('消息已删除');
            fetchMessages();
        } catch { showToast('删除失败', 'error'); }
    };

    const createTest = async () => {
        const types = ['系统通知', '任务提醒', '私信'];
        const titles = ['新职位申请', '简历优化建议', '面试官反馈', '部门周报', '张经理的消息'];
        const contents = [
            '候选人 李强 刚刚申请了 资深开发 职位。',
            '建议完善 视觉设计 岗位的招聘JD。',
            '王五 面试官已对 候选人赵六 提交了评价。',
            '本周招聘数据报表已生成，请查收。',
            '下午两点有空聊一下那个架构师职位的二试安排吗？'
        ];

        const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

        try {
            await MessageAPI.create({
                type: rand(types),
                title: rand(titles),
                content: rand(contents),
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            });
            showToast('已生成测试消息');
            fetchMessages();
        } catch { showToast('生成失败', 'error'); }
    };

    const filteredMessages = messages.filter(m => {
        if (activeTab === '全部') return true;
        if (activeTab === '未读') return m.unread;
        if (activeTab === '已读') return !m.unread;
        if (activeTab === '系统通知') return m.type === '系统通知' || m.type === '任务提醒';
        if (activeTab === '个人消息') return m.type === '私信';
        return m.type === activeTab;
    });

    return (
        <div style={{ display: 'flex', width: '100%', minHeight: '100vh', background: 'var(--bg-primary)' }}>
            <Sidebar />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Header title="消息通知" />
                <main style={{ padding: '32px 40px', flex: 1, overflowY: 'auto' }}>
                    <div className="card" style={{ marginBottom: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9', marginBottom: '24px' }}>
                            <div style={{ display: 'flex', gap: '40px' }}>
                                {['全部', '未读', '已读', '系统通知', '个人消息'].map(tab => (
                                    <div
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        style={{
                                            paddingBottom: '16px', fontSize: '15px', fontWeight: 600,
                                            color: activeTab === tab ? 'var(--primary)' : '#64748B',
                                            borderBottom: activeTab === tab ? '2px solid var(--primary)' : '2px solid transparent',
                                            cursor: 'pointer', transition: '0.2s'
                                        }}
                                    >
                                        {tab}
                                    </div>
                                ))}
                            </div>
                            <button className="btn-primary" style={{ padding: '6px 16px', fontSize: '13px', marginBottom: '12px' }} onClick={createTest}>发送测试消息</button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {filteredMessages.length > 0 ? filteredMessages.map((msg) => (
                                <motion.div
                                    layout
                                    key={msg.id}
                                    className="card"
                                    style={{
                                        background: msg.unread ? '#FEF3F2' : 'white',
                                        border: '1px solid #F1F5F9',
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => markAsRead(msg.id)}
                                >
                                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                        <div style={{
                                            width: '48px', height: '48px', borderRadius: '14px',
                                            background: msg.unread ? 'var(--primary)' : '#F1F5F9',
                                            color: msg.unread ? 'white' : '#64748B',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            {msg.type === '私信' ? <MessageSquare size={20} /> : <Bell size={20} />}
                                        </div>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <h4 style={{ fontSize: '16px', fontWeight: 700 }}>{msg.title}</h4>
                                                {msg.unread === 1 && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444' }}></span>}
                                            </div>
                                            <p style={{ color: '#64748B', fontSize: '14px', marginTop: '4px' }}>{msg.content}</p>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <span style={{ color: '#94A3B8', fontSize: '13px' }}>{msg.time}</span>
                                        <button 
                                            onClick={(e) => deleteMessage(e, msg.id)}
                                            style={{ background: 'none', color: '#94A3B8', padding: '4px', borderRadius: '4px', cursor: 'pointer' }}
                                            className="delete-btn"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </motion.div>
                            )) : (
                                <div style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>暂无相关消息</div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export const CustomerService = () => {
    const [msg, setMsg] = useState('');
    const [activeSection, setActiveSection] = useState('chat'); // chat or tickets
    const [chat, setChat] = useState([
        { role: 'ai', text: '您好！我是桔子招聘助手，有什么可以帮您的吗？' }
    ]);
    const [tickets, setTickets] = useState([
        { id: 'TK001', title: '系统无法上传附件', status: '处理中', time: '2023-11-20' },
        { id: 'TK002', title: '岗位发布审核速度较慢', status: '已关闭', time: '2023-11-18' }
    ]);
    const [showAddTicket, setShowAddTicket] = useState(false);
    const [viewTicket, setViewTicket] = useState(null);
    const [ticketTitle, setTicketTitle] = useState('');
    const { showToast } = useToast();

    const send = () => {
        if (!msg.trim()) return;
        setChat([...chat, { role: 'user', text: msg }]);
        setMsg('');
        setTimeout(() => {
            setChat(prev => [...prev, { role: 'ai', text: '已收到您的反馈，我们会尽快为您安排客户经理跟进。' }]);
        }, 1000);
    };

    const handleAddTicket = () => {
        if (!ticketTitle.trim()) return showToast('请输入工单标题', 'error');
        setTickets([{ id: `TK00${tickets.length + 1}`, title: ticketTitle, status: '待处理', time: new Date().toISOString().split('T')[0] }, ...tickets]);
        setTicketTitle('');
        setShowAddTicket(false);
        showToast('工单已提交成功');
    };

    return (
        <div style={{ display: 'flex', width: '100%', minHeight: '100vh', background: 'var(--bg-primary)' }}>
            <Sidebar />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Header title="在线客服" />
                <main style={{ padding: '32px 40px', flex: 1, overflowY: 'auto' }}>
                    <div style={{ display: 'flex', gap: '32px', marginBottom: '24px' }}>
                        <button
                            onClick={() => setActiveSection('chat')}
                            style={{
                                padding: '10px 24px', borderRadius: '12px', fontWeight: 600,
                                background: activeSection === 'chat' ? 'var(--primary)' : 'white',
                                color: activeSection === 'chat' ? 'white' : '#64748B',
                                border: '1px solid ' + (activeSection === 'chat' ? 'var(--primary)' : '#E2E8F0')
                            }}
                        >在线聊天</button>
                        <button
                            onClick={() => setActiveSection('tickets')}
                            style={{
                                padding: '10px 24px', borderRadius: '12px', fontWeight: 600,
                                background: activeSection === 'tickets' ? 'var(--primary)' : 'white',
                                color: activeSection === 'tickets' ? 'white' : '#64748B',
                                border: '1px solid ' + (activeSection === 'tickets' ? 'var(--primary)' : '#E2E8F0')
                            }}
                        >我的工单</button>
                    </div>

                    {activeSection === 'chat' ? (
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px', height: 'calc(100vh - 220px)' }}>
                            <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                <div style={{ flex: 1, overflowY: 'auto', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {chat.map((c, i) => (
                                        <div key={i} style={{
                                            alignSelf: c.role === 'user' ? 'flex-end' : 'flex-start',
                                            background: c.role === 'user' ? 'var(--primary)' : '#F1F5F9',
                                            color: c.role === 'user' ? 'white' : 'var(--text-primary)',
                                            padding: '12px 20px', borderRadius: '16px', maxWidth: '80%',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                                        }}>
                                            {c.text}
                                        </div>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <input
                                        placeholder="输入您的问题..."
                                        style={{ flex: 1, padding: '12px 20px', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }}
                                        value={msg} onChange={e => setMsg(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && send()}
                                    />
                                    <button className="btn-primary" onClick={send}><Send size={18} /></button>
                                </div>
                            </div>
                            <div className="card">
                                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>常见问题 (FAQ)</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {[
                                        '如何邀请候选人面试？',
                                        '岗位发布后多久生效？',
                                        '忘记系统登录密码？',
                                        '团队协作权限如何开启？'
                                    ].map((q, i) => (
                                        <div key={i} className="faq-item" style={{ padding: '12px', borderRadius: '8px', cursor: 'pointer', border: '1px solid #F1F5F9' }} onClick={() => showToast('正在跳转FAQ详情')}>
                                            {q}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: 600 }}>工单提交与进度查看</h3>
                                <button className="btn-primary" onClick={() => setShowAddTicket(true)}>提交新工单</button>
                            </div>
                            <table>
                                <thead>
                                    <tr><th>工单编号</th><th>标题描述</th><th>提交时间</th><th>当前进度</th><th>操作</th></tr>
                                </thead>
                                <tbody>
                                    {tickets.map(t => (
                                        <tr key={t.id}>
                                            <td style={{ fontWeight: 600 }}>{t.id}</td>
                                            <td>{t.title}</td>
                                            <td>{t.time}</td>
                                            <td>
                                                <span style={{
                                                    padding: '4px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: 600,
                                                    background: t.status === '待处理' ? '#FEF3C7' : t.status === '处理中' ? '#EFF6FF' : '#F1F5F9',
                                                    color: t.status === '待处理' ? '#F59E0B' : t.status === '处理中' ? '#3B82F6' : '#64748B'
                                                }}>{t.status}</span>
                                            </td>
                                            <td><button style={{ background: 'none', color: 'var(--primary)' }} onClick={() => setViewTicket(t)}>查看详情</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </main>
            </div>
            {showAddTicket && (
                <Modal title="提交新工单" onClose={() => setShowAddTicket(false)}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>问题标题</label>
                            <input
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0' }}
                                value={ticketTitle} onChange={e => setTicketTitle(e.target.value)}
                                placeholder="简述您遇到的问题"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>详细描述</label>
                            <textarea
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', height: '100px' }}
                                placeholder="请描述具体问题以便我们更快为您解决"
                            />
                        </div>
                        <button className="btn-primary" onClick={handleAddTicket}>立即提交</button>
                    </div>
                </Modal>
            )}

            {viewTicket && (
                <Modal title={`工单详情 - ${viewTicket.id}`} onClose={() => setViewTicket(null)}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div><label style={{ color: '#64748B', fontSize: '12px' }}>标题</label><div style={{ fontWeight: 600 }}>{viewTicket.title}</div></div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div><label style={{ color: '#64748B', fontSize: '12px' }}>提交时间</label><div>{viewTicket.time}</div></div>
                            <div><label style={{ color: '#64748B', fontSize: '12px' }}>状态</label><div>{viewTicket.status}</div></div>
                        </div>
                        <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '8px' }}>
                            <label style={{ display: 'block', color: '#64748B', fontSize: '12px', marginBottom: '8px' }}>处理进展</label>
                            <p style={{ fontSize: '14px' }}>{viewTicket.status === '已关闭' ? '该工单已解决并关闭。如有新问题请重新提交。' : '客服人员正在核实相关系统日志，请耐心等待回复。'}</p>
                        </div>
                        <button className="btn-primary" onClick={() => setViewTicket(null)}>关闭查看</button>
                    </div>
                </Modal>
            )}
        </div>
    );
};
