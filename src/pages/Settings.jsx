import React, { useState, useEffect } from 'react';
import { Sidebar, Header } from '../common/components/Layout';
import { AuthAPI, OrgAPI } from '../common/api/request';
import { useToast, Modal } from '../common/components/Feedback';
import { Settings, Shield, Users, Network, Database, Globe, Key, Trash2, Plus, Edit2, ShieldAlert } from 'lucide-react';

export const PersonalCenter = () => {
    const { showToast } = useToast();
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
    const [showEdit, setShowEdit] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [editForm, setEditForm] = useState({ real_name: user.real_name, role: user.role });
    const [passwords, setPasswords] = useState({ old: '', new: '', confirm: '' });
    const [prefs, setPrefs] = useState({
        email: true,
        system: true,
        push: false
    });

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await AuthAPI.updateProfile(editForm);
            const newUser = { ...user, ...editForm };
            localStorage.setItem('user', JSON.stringify(newUser));
            setUser(newUser);
            showToast('资料修改成功');
            setShowEdit(false);
        } catch { showToast('修改失败', 'error'); }
    };

    const handlePasswordChange = (e) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) return showToast('两次输入的密码不一致', 'error');
        showToast('密码已成功修改，请下次登录时使用新密码');
        setShowPasswordModal(false);
        setPasswords({ old: '', new: '', confirm: '' });
    };

    return (
        <div style={{ display: 'flex', width: '100%', minHeight: '100vh', background: 'var(--bg-primary)' }}>
            <Sidebar />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Header title="个人中心" />
                <main style={{ padding: '32px 40px', flex: 1, overflowY: 'auto' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '32px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                            <div className="card" style={{ textAlign: 'center', padding: '40px 24px' }}>
                                <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: '#E0E7FF', color: '#4F46E5', fontSize: '48px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>{user.real_name?.[0] || 'U'}</div>
                                <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>{user.real_name || '用户'}</h3>
                                <p style={{ color: '#64748B', fontSize: '14px', marginBottom: '24px' }}>{user.role} | 研发团队</p>
                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                    <span style={{ padding: '4px 12px', background: 'rgba(255,138,61,0.1)', color: 'var(--primary)', borderRadius: '99px', fontSize: '12px', fontWeight: 600 }}>管理员</span>
                                    <span style={{ padding: '4px 12px', background: '#F1F5F9', color: '#64748B', borderRadius: '99px', fontSize: '12px', fontWeight: 600 }}>全职员工</span>
                                </div>
                            </div>
                            <div className="card" style={{ padding: '24px' }}>
                                <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><Shield size={18} color="var(--primary)" /> 安全设置</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div><div style={{ fontSize: '14px', fontWeight: 500 }}>账号密码</div><div style={{ fontSize: '12px', color: '#94A3B8' }}>定期修改密码保护账号安全</div></div>
                                        <button onClick={() => setShowPasswordModal(true)} style={{ color: 'var(--primary)', fontSize: '13px', fontWeight: 600, background: 'none' }}>修改</button>
                                    </div>
                                    <div style={{ height: '1px', background: '#F1F5F9' }}></div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div><div style={{ fontSize: '14px', fontWeight: 500 }}>两步验证</div><div style={{ fontSize: '12px', color: '#94A3B8' }}>未开启（建议开启）</div></div>
                                        <button style={{ color: 'var(--primary)', fontSize: '13px', fontWeight: 600, background: 'none' }} onClick={() => showToast('请在手机APP中操作')}>开启</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="card" style={{ height: 'fit-content' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: 600 }}>详细设置</h3>
                                <button onClick={() => setShowEdit(true)} style={{ color: 'var(--primary)', fontWeight: 600, background: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}><Edit2 size={16} /> 编辑基本信息</button>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px 48px' }}>
                                {[
                                    { label: '员工账号', value: user.username || 'admin' },
                                    { label: '个人邮箱', value: 'admin@orange.com' },
                                    { label: '所属部门', value: '人才资源部 - 招聘组' },
                                    { label: '入职日期', value: '2021-08-15' },
                                    { label: '手机号', value: '138 **** 9922' },
                                    { label: '工作地点', value: '北京总部 | A座 12F' },
                                    { label: '语言设置', value: '简体中文 (Default)' },
                                    { label: '时区设置', value: 'Asia/Shanghai (UTC+8)' }
                                ].map((info, i) => (
                                    <div key={i}>
                                        <label style={{ fontSize: '12px', color: '#94A3B8', display: 'block', marginBottom: '6px' }}>{info.label}</label>
                                        <div style={{ fontSize: '15px', fontWeight: 500 }}>{info.value}</div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ marginTop: '40px', padding: '24px', background: '#F8FAFC', borderRadius: '16px' }}>
                                <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px' }}>通知偏好设置</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {[
                                        { id: 'email', label: '邮件接收面试提醒' },
                                        { id: 'system', label: '系统内接收私信通知' },
                                        { id: 'push', label: '新简历投递实时推送' }
                                    ].map(pref => (
                                        <div key={pref.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '14px', color: '#475569' }}>{pref.label}</span>
                                            <div
                                                onClick={() => setPrefs({ ...prefs, [pref.id]: !prefs[pref.id] })}
                                                style={{
                                                    width: '40px', height: '22px',
                                                    background: prefs[pref.id] ? 'var(--primary)' : '#CBD5E1',
                                                    borderRadius: '11px', position: 'relative', cursor: 'pointer',
                                                    transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                                }}
                                            >
                                                <div style={{
                                                    width: '18px', height: '18px', background: 'white', borderRadius: '50%',
                                                    position: 'absolute',
                                                    left: prefs[pref.id] ? '20px' : '2px',
                                                    top: '2px',
                                                    transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                                }}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
            {showEdit && (
                <Modal title="修改基本信息" onClose={() => setShowEdit(false)}>
                    <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div><label style={{ display: 'block', fontSize: '14px', marginBottom: '8px' }}>真实姓名</label><input required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0' }} value={editForm.real_name} onChange={e => setEditForm({ ...editForm, real_name: e.target.value })} /></div>
                        <div><label style={{ display: 'block', fontSize: '14px', marginBottom: '8px' }}>岗位角色</label><input required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0' }} value={editForm.role} onChange={e => setEditForm({ ...editForm, role: e.target.value })} /></div>
                        <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}><button type="button" onClick={() => setShowEdit(false)} style={{ flex: 1, background: '#F1F5F9' }}>取消</button><button type="submit" className="btn-primary" style={{ flex: 1 }}>提交保存</button></div>
                    </form>
                </Modal>
            )}
            {showPasswordModal && (
                <Modal title="修改登录密码" onClose={() => setShowPasswordModal(false)}>
                    <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div><label style={{ display: 'block', fontSize: '14px', marginBottom: '8px' }}>旧密码</label><input type="password" required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0' }} value={passwords.old} onChange={e => setPasswords({ ...passwords, old: e.target.value })} /></div>
                        <div><label style={{ display: 'block', fontSize: '14px', marginBottom: '8px' }}>新密码</label><input type="password" required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0' }} value={passwords.new} onChange={e => setPasswords({ ...passwords, new: e.target.value })} /></div>
                        <div><label style={{ display: 'block', fontSize: '14px', marginBottom: '8px' }}>确认新密码</label><input type="password" required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0' }} value={passwords.confirm} onChange={e => setPasswords({ ...passwords, confirm: e.target.value })} /></div>

                        <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}><button type="button" onClick={() => setShowPasswordModal(false)} style={{ flex: 1, background: '#F1F5F9' }}>取消</button><button type="submit" className="btn-primary" style={{ flex: 1 }}>立即更新</button></div>
                    </form>
                </Modal>
            )}
        </div>
    );
};

export const OrgChart = () => {
    const [selectedDept, setSelectedDept] = useState('研发部');
    const [depts, setDepts] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showEditMember, setShowEditMember] = useState(null);
    const { showToast } = useToast();

    const fetchData = async () => {
        try {
            const [dRes, eRes] = await Promise.all([OrgAPI.getDepartments(), OrgAPI.getEmployees()]);
            setDepts(dRes);
            setEmployees(eRes);
        } catch { showToast('加载架构数据失败', 'error'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const filteredEmployees = employees.filter(e => e.dept === selectedDept);

    const handleExport = () => {
        if (filteredEmployees.length === 0) return showToast('当前部门无人员数据', 'error');

        const headers = ['ID', '姓名', '部门', '岗位', '邮箱', '手机号'];
        const csvContent = [
            headers.join(','),
            ...filteredEmployees.map(e => [e.id, e.name, e.dept, e.role, e.email, e.phone].join(','))
        ].join('\n');

        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `橙子招聘_人员名单_${selectedDept}.csv`;
        link.click();
        showToast('Excel/CSV 导出成功');
    };

    const handleUpdateMember = async (e) => {
        e.preventDefault();
        try {
            await OrgAPI.updateEmployee(showEditMember.id, showEditMember);
            showToast('人员信息更新成功');
            fetchData();
            setShowEditMember(null);
        } catch { showToast('更新失败', 'error'); }
    };

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>数据加载中...</div>;

    return (
        <div style={{ display: 'flex', width: '100%', minHeight: '100vh', background: 'var(--bg-primary)' }}>
            <Sidebar />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Header title="组织架构" />
                <main style={{ padding: '32px 40px', flex: 1, overflowY: 'auto' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 1fr) 350px', gap: '32px', height: 'calc(100vh - 160px)' }}>
                        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', border: '1px dashed #E2E8F0', overflow: 'hidden' }}>
                            <div style={{ padding: '16px 32px', background: 'var(--primary)', color: 'white', borderRadius: '12px', fontWeight: 700, marginBottom: '60px', boxShadow: '0 10px 15px -3px rgba(255,138,61,0.3)' }}>CEO 办公室</div>
                            <div style={{ width: '2px', height: '40px', background: '#E2E8F0', marginTop: '-60px' }}></div>
                            <div style={{ width: '80%', height: '2px', background: '#E2E8F0' }}></div>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', width: '100%', marginTop: '0', flexWrap: 'wrap', padding: '0 20px' }}>
                                {depts.map(dept => (
                                    <div key={dept.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <div style={{ width: '2px', height: '30px', background: '#E2E8F0' }}></div>
                                        <div
                                            onClick={() => setSelectedDept(dept.name)}
                                            style={{
                                                padding: '12px 10px', background: selectedDept === dept.name ? 'white' : 'transparent',
                                                border: `2px solid ${selectedDept === dept.name ? 'var(--primary)' : '#E2E8F0'}`,
                                                borderRadius: '12px', cursor: 'pointer', textAlign: 'center', width: '100px',
                                                transition: 'all 0.2s', transform: selectedDept === dept.name ? 'translateY(-2px)' : 'none'
                                            }}
                                        >
                                            <div style={{ fontSize: '18px', marginBottom: '4px' }}>{dept.icon}</div>
                                            <div style={{ fontSize: '12px', fontWeight: 600 }}>{dept.name}</div>
                                            <div style={{ fontSize: '10px', color: '#94A3B8' }}>{dept.count} 人</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>人员名单 - {selectedDept}</h3>
                                <button
                                    onClick={handleExport}
                                    style={{ padding: '6px 14px', background: '#F1F5F9', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: 'none' }}
                                >导出 Excel</button>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', flex: 1 }}>
                                {filteredEmployees.length > 0 ? filteredEmployees.map((emp) => (
                                    <div key={emp.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', borderRadius: '12px', background: '#F8FAFC', border: '1px solid #F1F5F9', transition: '0.2s', cursor: 'default' }}>
                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>{emp.avatar || '👤'}</div>
                                            <div>
                                                <div style={{ fontSize: '14px', fontWeight: 700, color: '#1E293B' }}>{emp.name}</div>
                                                <div style={{ fontSize: '12px', color: '#64748B' }}>{emp.role}</div>
                                            </div>
                                        </div>
                                        <div
                                            onClick={() => setShowEditMember(emp)}
                                            style={{ width: '30px', height: '30px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.2s', background: '#FFF' }}
                                        >
                                            <Edit2 size={14} color="var(--primary)" />
                                        </div>
                                    </div>
                                )) : (
                                    <div style={{ textAlign: 'center', padding: '40px', color: '#94A3B8', fontSize: '14px' }}>该部门暂无详细人员名单</div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>

                {showEditMember && (
                    <Modal title="编辑人员信息" onClose={() => setShowEditMember(null)}>
                        <form onSubmit={handleUpdateMember} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', color: '#64748B', marginBottom: '8px' }}>姓名</label>
                                <input readOnly style={{ width: '100%', padding: '10px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }} value={showEditMember.name} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', color: '#64748B', marginBottom: '8px' }}>岗位角色</label>
                                <input required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0' }} value={showEditMember.role} onChange={e => setShowEditMember({ ...showEditMember, role: e.target.value })} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', color: '#64748B', marginBottom: '8px' }}>手机号</label>
                                <input required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0' }} value={showEditMember.phone} onChange={e => setShowEditMember({ ...showEditMember, phone: e.target.value })} />
                            </div>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                                <button type="button" onClick={() => setShowEditMember(null)} style={{ flex: 1, background: '#F1F5F9' }}>取消</button>
                                <button type="submit" className="btn-primary" style={{ flex: 1 }}>保存修改</button>
                            </div>
                        </form>
                    </Modal>
                )}
            </div>
        </div>
    );
};

export const EnterpriseSettings = () => {
    const [activeTab, setActiveTab] = useState('流程配置');
    const [showConfig, setShowConfig] = useState(null);

    return (
        <div style={{ display: 'flex', width: '100%', minHeight: '100vh', background: 'var(--bg-primary)' }}>
            <Sidebar />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Header title="企业设置" />
                <main style={{ padding: '32px 40px', flex: 1, overflowY: 'auto' }}>
                    <div style={{ display: 'flex', gap: '32px', marginBottom: '32px', borderBottom: '1px solid #E2E8F0' }}>
                        {['流程配置', '部门管理', '岗位类型', '角色权限'].map(tab => (
                            <span
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                style={{
                                    paddingBottom: '12px', cursor: 'pointer', fontSize: '15px', fontWeight: 600,
                                    color: activeTab === tab ? 'var(--primary)' : '#64748B',
                                    borderBottom: activeTab === tab ? '3px solid var(--primary)' : 'none'
                                }}
                            >{tab}</span>
                        ))}
                    </div>

                    <div className="card">
                        {activeTab === '流程配置' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {['简历筛选', '技术初试', '部门复试', '终极面试', 'Offer 发放'].map((step, i) => (
                                    <div key={i} style={{ padding: '20px', background: '#F8FAFC', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                            <div style={{ width: '32px', height: '32px', background: 'var(--primary)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{i + 1}</div>
                                            <div><div style={{ fontWeight: 600 }}>{step}</div><div style={{ fontSize: '12px', color: '#94A3B8' }}>默认审批人：部门负责人</div></div>
                                        </div>
                                        <button onClick={() => setShowConfig(step)} style={{ color: 'var(--primary)', fontWeight: 600, background: 'none' }}>配置规则</button>
                                    </div>
                                ))}
                            </div>
                        )}
                        {activeTab === '角色权限' && (
                            <table>
                                <thead><tr><th>角色名称</th><th>权限范围</th><th>绑定人数</th><th>操作</th></tr></thead>
                                <tbody>
                                    {[
                                        { name: '超级管理员', scope: '全局权限', count: 2 },
                                        { name: '部门主管', scope: '本部门管理', count: 8 },
                                        { name: '普通员工', scope: '个人数据', count: 24 }
                                    ].map(r => (
                                        <tr key={r.name}>
                                            <td style={{ fontWeight: 600 }}>{r.name}</td>
                                            <td><span style={{ padding: '4px 10px', background: '#F1F5F9', borderRadius: '6px', fontSize: '12px' }}>{r.scope}</span></td>
                                            <td>{r.count} 人</td>
                                            <td><button style={{ color: 'var(--primary)', background: 'none' }}>权限分配</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                        {activeTab !== '流程配置' && activeTab !== '角色权限' && (
                            <div style={{ textAlign: 'center', padding: '60px' }}>
                                <Settings size={48} color="#E2E8F0" style={{ marginBottom: '16px' }} />
                                <div style={{ color: '#94A3B8' }}>正在加载 {activeTab} 配置项...</div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
            {showConfig && (
                <Modal title={`配置 - ${showConfig}`} onClose={() => setShowConfig(null)}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div><label style={{ display: 'block', fontSize: '14px', marginBottom: '8px' }}>审批类型</label><select style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0' }}><option>串行审批</option><option>并行审批 (会签)</option></select></div>
                        <div><label style={{ display: 'block', fontSize: '14px', marginBottom: '8px' }}>通知方式</label><div style={{ display: 'flex', gap: '16px' }}><label><input type="checkbox" defaultChecked /> 系统消息</label><label><input type="checkbox" defaultChecked /> 邮件提醒</label></div></div>
                        <button className="btn-primary" onClick={() => { setShowConfig(null); showToast(`[${showConfig}] 规则配置已保存成功`); }}>确认保存</button>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export const SystemManagement = () => {
    const [activeTab, setActiveTab] = useState('用户管理');
    const { showToast } = useToast();

    return (
        <div style={{ display: 'flex', width: '100%', minHeight: '100vh', background: 'var(--bg-primary)' }}>
            <Sidebar />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Header title="系统管理" />
                <main style={{ padding: '32px 40px', flex: 1, overflowY: 'auto' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '40px' }}>
                        {[
                            { label: '系统状态', value: '运行中', icon: Globe, color: '#10B981' },
                            { label: '活跃用户', value: '1,284', icon: Users, color: '#3B82F6' },
                            { label: '存储占用', value: '85.4 GB', icon: Database, color: '#F59E0B' },
                            { label: '安全评分', value: '98', icon: Shield, color: 'var(--primary)' }
                        ].map(stat => (
                            <div key={stat.label} className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${stat.color}11`, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><stat.icon size={24} /></div>
                                <div><div style={{ fontSize: '13px', color: '#64748B' }}>{stat.label}</div><div style={{ fontSize: '20px', fontWeight: 700 }}>{stat.value}</div></div>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', background: '#F1F5F9', padding: '4px', borderRadius: '12px', width: 'fit-content' }}>
                        {['用户管理', '数据备份', 'API接口', '操作日志'].map(t => (
                            <button key={t} onClick={() => setActiveTab(t)} style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '14px', border: 'none', background: activeTab === t ? 'white' : 'transparent', color: activeTab === t ? 'var(--primary)' : '#64748B', fontWeight: activeTab === t ? 600 : 400 }}>{t}</button>
                        ))}
                    </div>

                    <div className="card">
                        {activeTab === '操作日志' && (
                            <table>
                                <thead><tr><th>操作人</th><th>类型</th><th>详情</th><th>IP地址</th><th>时间</th></tr></thead>
                                <tbody>
                                    {[{ u: 'Admin', t: '登录', d: '成功登录系统', ip: '192.168.1.1', time: '12:00:45' }, { u: 'Admin', t: '修改', d: '修改企业配置', ip: '192.168.1.1', time: '11:20:12' }].map((l, i) => (
                                        <tr key={i}><td>{l.u}</td><td><span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', background: l.t === '登录' ? '#DCFCE7' : '#F1F5F9', color: l.t === '登录' ? '#166534' : '#64748B' }}>{l.t}</span></td><td>{l.d}</td><td>{l.ip}</td><td>{l.time}</td></tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                        {activeTab === '用户管理' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><h4 style={{ fontWeight: 600 }}>全量用户列表</h4><button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => showToast('仅演示环境：暂不支持手动增加系统用户')}><Plus size={16} /> 新增人员</button></div>
                                <table>
                                    <thead><tr><th>用户</th><th>角色</th><th>状态</th><th>最后活跃</th><th>操作</th></tr></thead>
                                    <tbody>
                                        {[
                                            { name: 'Admin', role: '超级管理员', status: '正常', time: '刚刚' },
                                            { name: 'Manager_01', role: '部门主管', status: '正常', time: '2小时前' },
                                            { name: 'Recruiter_Lee', role: '招聘专员', status: '离线', time: '昨天' }
                                        ].map(u => (
                                            <tr key={u.name}>
                                                <td style={{ fontWeight: 600 }}>{u.name}</td>
                                                <td>{u.role}</td>
                                                <td><span style={{ color: u.status === '正常' ? '#10B981' : '#94A3B8' }}>● {u.status}</span></td>
                                                <td>{u.time}</td>
                                                <td><div style={{ display: 'flex', gap: '8px' }}><Edit2 size={16} color="var(--primary)" cursor="pointer" onClick={() => showToast('仅演示环境：该信息由系统同步，暂不支持手动修改')} /><Trash2 size={16} color="#EF4444" cursor="pointer" onClick={() => showToast('仅演示环境：受保护系统账号不可删除', 'error')} /></div></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        {activeTab === '数据备份' && (
                            <div style={{ padding: '40px', textAlign: 'center' }}>
                                <Database size={48} color="var(--primary)" style={{ marginBottom: '24px', opacity: 0.5 }} />
                                <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>数据库自动备份已开启</h4>
                                <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '32px' }}>上次备份时间：2023-11-20 04:00:00 (每日凌晨自动执行)</p>
                                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                                    <button className="btn-primary" onClick={() => showToast('正在执行即时备份...')}>立即手动备份</button>
                                    <button className="btn-secondary" onClick={() => showToast('请联系技术支持执行数据恢复')}>系统回滚/恢复</button>
                                </div>
                            </div>
                        )}
                        {activeTab === 'API接口' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {['核心招聘 API', '简历解析 API', '企业内部同步', 'Slack/Lark 机器人'].map(api => (
                                    <div key={api} style={{ padding: '16px', border: '1px solid #E2E8F0', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div><div style={{ fontWeight: 600 }}>{api}</div><div style={{ fontSize: '12px', color: '#10B981' }}>Connected / SSL Secured</div></div>
                                        <button
                                            onClick={() => showToast('正在获取 API 调试密钥并验证权限...')}
                                            style={{ color: 'var(--primary)', background: 'none', fontWeight: 600 }}
                                        >管理 Key</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};
