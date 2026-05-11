import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar, Header, FilterBar } from '../common/components/Layout';
import { Calendar as CalendarIcon, List, Plus, CheckCircle, XCircle, StickyNote, Eye, AlertTriangle } from 'lucide-react';
import { useToast, Modal } from '../common/components/Feedback';
import { InterviewAPI, OrgAPI } from '../common/api/request';
import { useOptimisticUpdate } from '../hooks/useOptimisticUpdate';

export const InterviewManagement = () => {
    const [viewMode, setViewMode] = useState('list'); // list or calendar
    const [calendarMode, setCalendarMode] = useState('week'); // week or day
    const [evalModal, setEvalModal] = useState(null);
    const [evalText, setEvalText] = useState('');
    const [templates] = useState([
        { id: 1, name: '技术初面模板', content: '1. 基础知识考察\n2. 代码实战能力\n3. 团队协作沟通' },
        { id: 2, name: '产品经理深度面', content: '1. 业务逻辑洞察\n2. 交互设计理解\n3. 数据驱动意识' },
        { id: 3, name: '综合素质评估', content: '1. 价值观对齐\n2. 压力面试表现\n3. 未来潜力预估' }
    ]);
    const [interviewers, setInterviewers] = useState([]);
    const [interviews, setInterviews] = useState([]);
    const [filteredInterviews, setFilteredInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showRoomModal, setShowRoomModal] = useState(null);
    const [formData, setFormData] = useState({ name: '', job: 'UI设计师', interviewer: '诸葛亮', time: '', type: '初试', status: '待开始' });
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [editInterviewerModal, setEditInterviewerModal] = useState(null);
    const [conflictModal, setConflictModal] = useState(null);
    const { showToast } = useToast();

    const handleUpdateSuccess = useCallback((result) => {
        if (result && result.data && result.data.version) {
            setInterviews(prev => prev.map(i =>
                i.id === result.data.id ? result.data : i
            ));
        }
    }, []);

    const handleUpdateError = useCallback((error) => {
        if (error.message && error.message.includes('冲突')) {
            setConflictModal({
                message: error.message,
                solution: error.solution || '请刷新页面获取最新数据后再尝试'
            });
        }
    }, []);

    const { executeUpdate, isLoading } = useOptimisticUpdate(
        InterviewAPI.update,
        handleUpdateSuccess,
        handleUpdateError
    );

    const handleApplyTemplate = (content) => {
        setEvalText(prev => prev + (prev ? '\n' : '') + content);
        showToast('已应用模板');
    };

    const submitEvaluation = async () => {
        try {
            const currentInterview = interviews.find(i => i.id === evalModal.id);
            await executeUpdate(evalModal.id, {
                version: currentInterview?.version || 1,
                evaluation: evalText,
                status: evalModal.status
            });
            showToast('评价已提交并归档');
            setEvalModal(null);
            setEvalText('');
            fetchInterviews();
        } catch (err) {
            if (!err.message.includes('冲突')) {
                showToast('提交失败', 'error');
            }
        }
    };

    const fetchInterviews = async () => {
        try {
            const res = await InterviewAPI.list();
            setInterviews(res);
        } catch (err) {
            showToast('获取面试数据失败', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchInterviewers = async () => {
        try {
            const res = await OrgAPI.getEmployees();
            setInterviewers(res);
            if (res.length > 0) setFormData(prev => ({ ...prev, interviewer: res[0].name }));
        } catch {}
    };

    useEffect(() => { 
        fetchInterviews(); 
        fetchInterviewers();
    }, []);

    useEffect(() => {
        let result = interviews;
        if (searchQuery) {
            result = result.filter(item =>
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.job.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        if (statusFilter) {
            result = result.filter(item => item.status === statusFilter);
        }
        setFilteredInterviews(result);
    }, [interviews, searchQuery, statusFilter]);

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await InterviewAPI.create(formData);
            showToast('面试预约成功');
            setShowAddModal(false);
            setFormData({ name: '', job: 'UI设计师', interviewer: '诸葛亮', time: '', type: '初试', status: '待开始' });
            fetchInterviews();
        } catch (err) {
            showToast('预约失败', 'error');
        }
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            const currentInterview = interviews.find(i => i.id === id);
            await executeUpdate(id, {
                version: currentInterview?.version || 1,
                status
            });
            showToast(`状态已更新为: ${status}`);
            if (showRoomModal && showRoomModal.id === id) {
                setShowRoomModal({ ...showRoomModal, status });
            }
            fetchInterviews();
        } catch (err) {
            if (!err.message.includes('冲突') && !err.message.includes('状态转换')) {
                showToast(err.message || '更新失败', 'error');
            }
        }
    };

    const handleUpdateInterviewer = async (id, interviewer) => {
        try {
            const currentInterview = interviews.find(i => i.id === id);
            await executeUpdate(id, {
                version: currentInterview?.version || 1,
                interviewer
            });
            showToast('面试官分配已更新');
            setEditInterviewerModal(null);
            fetchInterviews();
        } catch (err) {
            if (!err.message.includes('冲突')) {
                showToast('分配失败', 'error');
            }
        }
    };

    const handleDelete = async (id) => {
        try {
            await InterviewAPI.delete(id);
            showToast('面试已取消');
            fetchInterviews();
        } catch (err) {
            showToast('操作失败', 'error');
        }
    };

    return (
        <div style={{ display: 'flex', width: '100%', minHeight: '100vh', background: 'var(--bg-primary)' }}>
            <Sidebar />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Header title="面试管理" />
                <main style={{ padding: '32px 40px', flex: 1, overflowY: 'auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                        <div style={{ display: 'flex', gap: '8px', background: '#F1F5F9', padding: '4px', borderRadius: '12px' }}>
                            <button
                                onClick={() => setViewMode('list')}
                                style={{
                                    padding: '8px 16px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px',
                                    background: viewMode === 'list' ? 'white' : 'transparent',
                                    boxShadow: viewMode === 'list' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                                    color: viewMode === 'list' ? 'var(--primary)' : '#64748B'
                                }}
                            >
                                <List size={18} /> 列表视图
                            </button>
                            <button
                                onClick={() => setViewMode('calendar')}
                                style={{
                                    padding: '8px 16px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px',
                                    background: viewMode === 'calendar' ? 'white' : 'transparent',
                                    boxShadow: viewMode === 'calendar' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                                    color: viewMode === 'calendar' ? 'var(--primary)' : '#64748B'
                                }}
                            >
                                <CalendarIcon size={18} /> 日历视图
                            </button>
                        </div>
                        {viewMode === 'calendar' && (
                            <div style={{ display: 'flex', gap: '8px', background: 'white', padding: '4px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                                <button onClick={() => setCalendarMode('day')} style={{ border: 'none', background: calendarMode === 'day' ? 'var(--primary)' : 'white', color: calendarMode === 'day' ? 'white' : '#64748B', padding: '4px 12px', fontSize: '13px', borderRadius: '4px', cursor: 'pointer' }}>日</button>
                                <button onClick={() => setCalendarMode('week')} style={{ border: 'none', background: calendarMode === 'week' ? 'var(--primary)' : 'white', color: calendarMode === 'week' ? 'white' : '#64748B', padding: '4px 12px', fontSize: '13px', borderRadius: '4px', cursor: 'pointer' }}>周</button>
                            </div>
                        )}
                        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setShowAddModal(true)}>
                            <Plus size={18} /> 安排新面试
                        </button>
                    </div>

                    {viewMode === 'list' ? (
                        <div className="card">
                            <FilterBar
                                onSearch={(s) => setSearchQuery(s)}
                                onFilter={(f) => setStatusFilter(f.状态 || '')}
                                options={[{ label: '状态', values: ['待开始', '进行中', '已通过', '未通过'] }]}
                            />
                            <table>
                                <thead>
                                    <tr><th>候选人</th><th>面试岗位</th><th>面试时间</th><th>面试类型</th><th>当前状态</th><th>操作</th></tr>
                                </thead>
                                <tbody>
                                    {filteredInterviews.map((item) => (
                                        <tr key={item.id}>
                                            <td style={{ fontWeight: 600 }}>{item.name}</td>
                                            <td>{item.job}</td>
                                            <td>{item.time}</td>
                                            <td>{item.type}</td>
                                            <td>
                                                <span style={{
                                                    padding: '4px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: 600,
                                                    background: item.status === '进行中' ? '#EFF6FF' :
                                                        item.status === '待开始' ? '#FEF3C7' :
                                                            item.status === '已通过' ? '#ECFDF5' : '#F1F5F9',
                                                    color: item.status === '进行中' ? '#3B82F6' :
                                                        item.status === '待开始' ? '#F59E0B' :
                                                            item.status === '已通过' ? '#10B981' : '#64748B'
                                                }}>{item.status}</span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                    <button style={{ color: 'var(--primary)', background: 'none', fontSize: '13px' }} onClick={() => setEvalModal(item)}>评价</button>
                                                    <button style={{ color: 'var(--primary)', background: 'none', fontSize: '13px' }} onClick={() => setEditInterviewerModal(item)}>分配</button>
                                                    <button style={{ color: 'var(--primary)', background: 'none', fontSize: '13px' }} onClick={() => setShowRoomModal(item)}>进入频道</button>
                                                    <button style={{ color: '#EF4444', background: 'none', fontSize: '13px' }} onClick={() => handleDelete(item.id)}>取消</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                         <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: `80px repeat(${calendarMode === 'week' ? 7 : 1}, 1fr)`, borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
                                <div style={{ padding: '16px', borderRight: '1px solid #E2E8F0' }}></div>
                                {calendarMode === 'week' ? ['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map((d, i) => {
                                    const now = new Date();
                                    const first = now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1);
                                    const date = new Date(now.setDate(first + i));
                                    const isToday = date.toDateString() === new Date().toDateString();
                                    return (
                                        <div key={d} style={{ padding: '12px 16px', textAlign: 'center', borderRight: '1px solid #E2E8F0', background: isToday ? '#FFF7F5' : 'transparent' }}>
                                            <div style={{ fontSize: '11px', color: isToday ? 'var(--primary)' : '#64748B', fontWeight: 600 }}>{d}</div>
                                            <div style={{ fontSize: '15px', fontWeight: 700, color: isToday ? 'var(--primary)' : '#1E293B' }}>{date.getDate()}</div>
                                        </div>
                                    );
                                }) : (
                                    <div style={{ padding: '12px 16px', textAlign: 'center', borderRight: '1px solid #E2E8F0', background: '#FFF7F5' }}>
                                        <div style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 600 }}>今天</div>
                                        <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--primary)' }}>{new Date().getDate()}</div>
                                    </div>
                                )}
                            </div>
                            <div style={{ height: '560px', overflowY: 'auto' }}>
                                {[8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map(hour => (
                                    <div key={hour} style={{ display: 'grid', gridTemplateColumns: `80px repeat(${calendarMode === 'week' ? 7 : 1}, 1fr)`, borderBottom: '1px solid #F1F5F9' }}>
                                        <div style={{ padding: '16px 12px', textAlign: 'center', fontSize: '12px', color: '#64748B', borderRight: '1px solid #E2E8F0', background: '#F8FAFC' }}>{hour}:00</div>
                                        {(calendarMode === 'week' ? [1, 2, 3, 4, 5, 6, 7] : [new Date().getDay() === 0 ? 7 : new Date().getDay()]).map(dayIdx => {
                                            const cellInterviews = interviews.filter(item => {
                                                if (!item.time) return false;
                                                const timeStr = item.time.includes('T') ? item.time : item.time.replace(' ', 'T');
                                                const d = new Date(timeStr);
                                                if (isNaN(d.getTime())) return false;
                                                let day = d.getDay();
                                                const normalizedDay = day === 0 ? 7 : day;
                                                const h = d.getHours();
                                                return normalizedDay === dayIdx && h === hour;
                                            });

                                            return (
                                                <div key={dayIdx} style={{ borderRight: '1px solid #F1F5F9', position: 'relative', minHeight: '80px', background: '#FFFFFF' }}>
                                                    {cellInterviews.map((item, idx) => (
                                                        <div
                                                            key={item.id}
                                                            onClick={() => setShowRoomModal(item)}
                                                            style={{
                                                                position: 'absolute',
                                                                inset: `${4 + (idx * 48)}px 4px auto 4px`,
                                                                height: '44px',
                                                                background: item.status === '进行中' ? 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)' :
                                                                    item.status === '已通过' ? 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)' :
                                                                        item.status === '未通过' ? 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)' : '#FFFBEB',
                                                                borderLeft: `4px solid ${item.status === '进行中' ? '#3B82F6' : item.status === '已通过' ? '#10B981' : item.status === '未通过' ? '#EF4444' : '#F59E0B'}`,
                                                                borderRadius: '6px',
                                                                padding: '6px 10px',
                                                                fontSize: '11px',
                                                                cursor: 'pointer',
                                                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                                                zIndex: 10,
                                                                overflow: 'hidden',
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                justifyContent: 'center'
                                                            }}
                                                        >
                                                            <div style={{ fontWeight: 700, color: '#1E293B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                                                            <div style={{ opacity: 0.8, fontSize: '10px', color: '#475569' }}>{item.job}·{item.status}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {evalModal && (
                <Modal title="填写面试评价" size="large" onClose={() => setEvalModal(null)}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '12px' }}>
                                <h4 style={{ fontWeight: 700, marginBottom: '8px' }}>候选人信息</h4>
                                <p style={{ fontSize: '14px' }}><b>姓名:</b> {evalModal.name}</p>
                                <p style={{ fontSize: '14px' }}><b>岗位:</b> {evalModal.job}</p>
                                <p style={{ fontSize: '14px' }}><b>面试官:</b> {evalModal.interviewer || '未分配'}</p>
                            </div>
                            <div>
                                <h4 style={{ fontWeight: 700, marginBottom: '12px' }}>评价内容</h4>
                                <textarea 
                                    style={{ width: '100%', height: '300px', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '14px', lineHeight: 1.6 }}
                                    placeholder="请输入详细面试评价..."
                                    value={evalText}
                                    onChange={e => setEvalText(e.target.value)}
                                />
                            </div>
                        </div>
                        <div style={{ borderLeft: '1px solid #E2E8F0', paddingLeft: '32px' }}>
                                <h4 style={{ fontWeight: 700, marginBottom: '16px' }}>评价模板库</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '200px', overflowY: 'auto', marginBottom: '16px' }}>
                                    {templates.map(t => (
                                        <div key={t.id} style={{ padding: '12px', border: '1px solid #F1F5F9', borderRadius: '8px', cursor: 'pointer', transition: '0.2s' }} onClick={() => handleApplyTemplate(t.content)}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                <span style={{ fontWeight: 600, fontSize: '13px' }}>{t.name}</span>
                                                <Plus size={14} color="var(--primary)" />
                                            </div>
                                            <pre style={{ fontSize: '11px', color: '#94A3B8', margin: 0 }}>{t.content.substring(0, 50)}...</pre>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ marginTop: 'auto', padding: '16px', background: '#F1F5F9', borderRadius: '12px' }}>
                                    <h4 style={{ fontWeight: 700, fontSize: '14px', marginBottom: '12px' }}>最终结论</h4>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {['已通过', '未通过', '进行中'].map(s => (
                                            <button 
                                                key={s} 
                                                onClick={() => setEvalModal({ ...evalModal, status: s })}
                                                style={{ 
                                                    flex: 1, padding: '8px', fontSize: '12px', 
                                                    background: evalModal.status === s ? 'var(--primary)' : 'white',
                                                    color: evalModal.status === s ? 'white' : '#64748B',
                                                    border: evalModal.status === s ? 'none' : '1px solid #E2E8F0'
                                                }}
                                            >{s}</button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                        <button className="btn-secondary" onClick={() => setEvalModal(null)}>取消</button>
                        <button className="btn-primary" onClick={submitEvaluation}>提交评价结果</button>
                    </div>
                </Modal>
            )}

            {showAddModal && (
                <Modal title="安排面试" onClose={() => setShowAddModal(false)}>
                    <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: '#64748B' }}>候选人</label>
                            <input required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0' }}
                                value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: '#64748B' }}>面试官</label>
                            <select style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0' }}
                                value={formData.interviewer} onChange={e => setFormData({ ...formData, interviewer: e.target.value })}>
                                {interviewers.map(n => <option key={n.id} value={n.name}>{n.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: '#64748B' }}>岗位</label>
                            <select style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0' }}
                                value={formData.job} onChange={e => setFormData({ ...formData, job: e.target.value })}>
                                <option>UI设计师</option><option>前端开发</option><option>产品经理</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: '#64748B' }}>时间</label>
                            <input type="datetime-local" required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0' }}
                                value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} />
                        </div>
                        <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                            <button type="button" onClick={() => setShowAddModal(false)} style={{ flex: 1, background: '#F1F5F9' }}>取消</button>
                            <button type="submit" className="btn-primary" style={{ flex: 1 }}>提交安排</button>
                        </div>
                    </form>
                </Modal>
            )}

            {showRoomModal && (
                <Modal title="面试房间 - 实时音视频频道" size="large" onClose={() => setShowRoomModal(null)}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ width: '100%', height: '300px', background: '#0F172A', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', position: 'relative', overflow: 'hidden' }}>
                                <div style={{ fontSize: '14px', opacity: 0.6 }}>[ 这里是视频流画面 ]</div>
                                <div style={{ position: 'absolute', bottom: '16px', left: '16px', background: 'rgba(0,0,0,0.5)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>候选人: {showRoomModal.name}</div>
                            </div>
                            <div style={{ width: '100%', height: '150px', background: '#F1F5F9', borderRadius: '16px', padding: '16px' }}>
                                <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>面试官笔记</div>
                                <textarea style={{ width: '100%', height: '80px', background: 'white', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '8px', fontSize: '13px' }} placeholder="在这里记录面试评价..." />
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div className="card" style={{ background: '#F8FAFC', border: 'none' }}>
                                <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>候选人详情</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
                                    <div><span style={{ color: '#64748B' }}>岗位: </span>{showRoomModal.job}</div>
                                    <div><span style={{ color: '#64748B' }}>类型: </span>{showRoomModal.type}</div>
                                    <div><span style={{ color: '#64748B' }}>当前状态: </span><b>{showRoomModal.status}</b></div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ fontSize: '15px', fontWeight: 600 }}>结论设置</div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <button
                                        onClick={() => handleUpdateStatus(showRoomModal.id, '已通过')}
                                        style={{ background: '#ECFDF5', color: '#10B981', border: '1px solid #A7F3D0', padding: '12px', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}
                                    >
                                        <CheckCircle size={20} /> <span style={{ fontSize: '13px', fontWeight: 600 }}>通过面试</span>
                                    </button>
                                    <button
                                        onClick={() => handleUpdateStatus(showRoomModal.id, '未通过')}
                                        style={{ background: '#FEF2F2', color: '#EF4444', border: '1px solid #FECACA', padding: '12px', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}
                                    >
                                        <XCircle size={20} /> <span style={{ fontSize: '13px', fontWeight: 600 }}>不通过</span>
                                    </button>
                                </div>
                                <button
                                    onClick={() => handleUpdateStatus(showRoomModal.id, '进行中')}
                                    className="btn-secondary"
                                    style={{ width: '100%', color: '#3B82F6', border: '1px solid #BFDBFE' }}
                                >
                                    设为面试中
                                </button>
                            </div>
                            <div style={{ marginTop: 'auto', textAlign: 'center' }}>
                                <button className="btn-primary" style={{ width: '100%' }} onClick={() => setShowRoomModal(null)}>退出频道</button>
                            </div>
                        </div>
                    </div>
                </Modal>
            )}
            {editInterviewerModal && (
                <Modal title="调整面试官分配" onClose={() => setEditInterviewerModal(null)}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <p style={{ fontSize: '14px', color: '#64748B' }}>正在为 <b>{editInterviewerModal.name}</b> 分配面试官 ({editInterviewerModal.job})</p>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px' }}>选择面试官</label>
                            <select 
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0' }}
                                defaultValue={editInterviewerModal.interviewer}
                                onChange={(e) => handleUpdateStatus(editInterviewerModal.id, { interviewer: e.target.value })}
                            >
                                {interviewers.map(emp => <option key={emp.id} value={emp.name}>{emp.name} ({emp.dept})</option>)}
                            </select>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                            <button style={{ flex: 1, background: '#F1F5F9' }} onClick={() => setEditInterviewerModal(null)}>取消</button>
                            <button className="btn-primary" style={{ flex: 1 }} onClick={() => {
                                const val = document.querySelector('select').value;
                                handleUpdateInterviewer(editInterviewerModal.id, val);
                            }}>确认提交</button>
                        </div>
                    </div>
                </Modal>
            )}
            {conflictModal && (
                <Modal title="⚠️ 数据冲突" onClose={() => setConflictModal(null)}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', padding: '16px 0' }}>
                        <AlertTriangle size={64} color="#F59E0B" />
                        <div style={{ textAlign: 'center' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px', color: '#1E293B' }}>
                                检测到数据冲突
                            </h3>
                            <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '8px' }}>
                                {conflictModal.message}
                            </p>
                            <p style={{ fontSize: '13px', color: '#F59E0B', background: '#FFFBEB', padding: '8px 12px', borderRadius: '6px' }}>
                                💡 {conflictModal.solution}
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '16px' }}>
                            <button
                                className="btn-secondary"
                                style={{ flex: 1 }}
                                onClick={() => setConflictModal(null)}
                            >
                                稍后处理
                            </button>
                            <button
                                className="btn-primary"
                                style={{ flex: 1 }}
                                onClick={() => {
                                    setConflictModal(null);
                                    fetchInterviews();
                                    showToast('数据已刷新');
                                }}
                            >
                                立即刷新
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};
