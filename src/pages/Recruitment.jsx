import React, { useState, useEffect, useRef } from 'react';
import { Sidebar, Header, FilterBar } from '../common/components/Layout';
import { Edit, Trash2, Eye, Briefcase, Star, Plus, CheckCircle, X, Search, User, Briefcase as JobIcon, Type, Bold, Italic, Underline, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, Palette, Highlighter } from 'lucide-react';
import { useToast, Modal } from '../common/components/Feedback';
import { InvitationAPI, JobAPI, FavoriteAPI, MemoAPI } from '../common/api/request';

export const InvitationRecords = () => {
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(null);
    const [showBatchDeleteModal, setShowBatchDeleteModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', job: '前端开发工程', recruiter: 'Talent Root', status: '待邀约', remark: '' });
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState('全部');
    const [selectedIds, setSelectedIds] = useState([]);
    const [favorites, setFavorites] = useState([]);

    const handleFavorite = async (item, type = 'candidates') => {
        const isFav = favorites.some(f => f.name === item.name && f.type === type);
        try {
            if (isFav) {
                const fav = favorites.find(f => f.name === item.name && f.type === type);
                await FavoriteAPI.delete(fav.id);
                showToast('已取消收藏');
            } else {
                await FavoriteAPI.create({ 
                    name: item.name, 
                    job: item.job || item.name,
                    type: type 
                });
                showToast('已加入收藏');
            }
            fetchFavorites();
        } catch { showToast('操作失败', 'error'); }
    };

    const fetchFavorites = async () => {
        try {
            const res = await FavoriteAPI.list();
            setFavorites(res);
        } catch {}
    };

    const fetchData = async () => {
        try {
            const res = await InvitationAPI.list();
            setData(res);
            setFilteredData(res);
        } catch (err) {
            showToast('获取数据失败', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { 
        fetchData(); 
        fetchFavorites();
    }, []);

    useEffect(() => {
        let result = data;
        if (activeTab !== '全部') {
            result = result.filter(item => item.status === activeTab);
        }
        setFilteredData(result);
    }, [activeTab, data]);

    const handleSearch = (search) => {
        const result = data.filter(item =>
            item.name.toLowerCase().includes(search.toLowerCase()) ||
            item.job.toLowerCase().includes(search.toLowerCase())
        );
        setFilteredData(result);
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await InvitationAPI.create(formData);
            showToast('添加成功');
            setShowAddModal(false);
            setFormData({ name: '', job: '前端开发工程', recruiter: 'Talent Root', status: '待邀约', remark: '' });
            fetchData();
        } catch (err) {
            showToast('添加失败', 'error');
        }
    };

    const handleDelete = async (id) => {
        try {
            await InvitationAPI.delete(id);
            showToast('删除成功');
            fetchData();
        } catch (err) {
            showToast('删除失败', 'error');
        }
    };

    const toggleSelect = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleBatchDelete = async () => {
        try {
            for (const id of selectedIds) {
                await InvitationAPI.delete(id);
            }
            showToast('批量删除成功');
            setSelectedIds([]);
            setShowBatchDeleteModal(false);
            fetchData();
        } catch { showToast('批量操作失败', 'error'); }
    };

    return (
        <div style={{ display: 'flex', width: '100%', minHeight: '100vh', background: 'var(--bg-primary)' }}>
            <Sidebar />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Header title="邀约记录" />
                <main style={{ padding: '32px 40px', flex: 1, overflowY: 'auto' }}>
                    <FilterBar
                        onSearch={handleSearch}
                        options={[
                            { label: '状态', values: ['待邀约', '已邀约', '已拒绝', '已录用'] }
                        ]}
                        onFilter={(f) => {
                            if (f.状态) setActiveTab(f.状态);
                            else setActiveTab('全部');
                        }}
                    />

                    <div className="card">
                        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
                                {['全部', '待邀约', '已邀约', '已拒绝', '已录用'].map(label => (
                                    <span
                                        key={label}
                                        onClick={() => setActiveTab(label)}
                                        style={{
                                            fontSize: '15px', fontWeight: 600,
                                            color: activeTab === label ? 'var(--primary)' : '#64748B',
                                            cursor: 'pointer',
                                            borderBottom: activeTab === label ? '2px solid var(--primary)' : 'none',
                                            paddingBottom: '4px'
                                        }}
                                    >
                                        {label}
                                    </span>
                                ))}
                                {selectedIds.length > 0 && (
                                    <div style={{ marginLeft: '24px', display: 'flex', gap: '12px', alignItems: 'center', padding: '4px 12px', background: '#F1F5F9', borderRadius: '8px' }}>
                                        <span style={{ fontSize: '13px', color: '#64748B' }}>已选 {selectedIds.length} 项</span>
                                        <button onClick={() => setShowBatchDeleteModal(true)} style={{ color: '#EF4444', fontSize: '13px', background: 'none', fontWeight: 600 }}>批量删除</button>
                                        <button onClick={() => setSelectedIds([])} style={{ color: '#64748B', fontSize: '13px', background: 'none' }}>取消</button>
                                    </div>
                                )}
                            </div>
                            <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setShowAddModal(true)}>
                                <Edit size={16} /> 新增邀约记录
                            </button>
                        </div>
                        <table>
                            <thead>
                                <tr>
                                    <th style={{ width: '40px' }}><input type="checkbox" onChange={(e) => setSelectedIds(e.target.checked ? filteredData.map(d => d.id) : [])} checked={selectedIds.length === filteredData.length && filteredData.length > 0} /></th>
                                    <th>候选人</th>
                                    <th>邀约岗位</th>
                                    <th>邀约人</th>
                                    <th>邀约时间</th>
                                    <th>状态</th>
                                    <th>备注</th>
                                    <th>操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.map((item) => (
                                    <tr key={item.id} style={{ background: selectedIds.includes(item.id) ? '#F8FAFC' : 'transparent' }}>
                                        <td><input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => toggleSelect(item.id)} /></td>
                                        <td style={{ fontWeight: 600 }}>{item.name}</td>
                                        <td>{item.job}</td>
                                        <td>{item.recruiter}</td>
                                        <td>{item.time}</td>
                                        <td>
                                            <span style={{
                                                padding: '4px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: 600,
                                                background: item.status === '已邀约' ? '#ECFDF5' : item.status === '待邀约' ? '#FEF3C7' : '#FEE2E2',
                                                color: item.status === '已邀约' ? '#10B981' : item.status === '待邀约' ? '#F59E0B' : '#EF4444'
                                            }}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td style={{ color: '#64748B', fontSize: '13px' }}>{item.remark}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button onClick={() => handleFavorite(item)} style={{ background: 'none', display: 'flex', alignItems: 'center', gap: '4px', color: favorites.some(f => f.name === item.name && f.type === 'candidates') ? "#FF8A3D" : "#64748B", fontSize: '12px' }} title={favorites.some(f => f.name === item.name && f.type === 'candidates') ? "取消收藏" : "收藏候选人"}>
                                                    <Star size={14} fill={favorites.some(f => f.name === item.name && f.type === 'candidates') ? "#FF8A3D" : "none"} />
                                                    {favorites.some(f => f.name === item.name && f.type === 'candidates') ? '已收藏' : '收藏'}
                                                </button>
                                                <button onClick={() => setShowDetailModal(item)} style={{ background: 'none' }}><Eye size={16} color="#64748B" /></button>
                                                <button onClick={() => handleDelete(item.id)} style={{ background: 'none' }}><Trash2 size={16} color="#EF4444" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </main>
            </div>

            {showAddModal && (
                <Modal title="新增邀约" onClose={() => setShowAddModal(false)}>
                    <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: '#64748B' }}>候选人姓名</label>
                            <input required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0' }}
                                value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: '#64748B' }}>邀约岗位</label>
                            <select style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0' }}
                                value={formData.job} onChange={e => setFormData({ ...formData, job: e.target.value })}>
                                <option>前端开发工程</option>
                                <option>后端架构师</option>
                                <option>产品策划</option>
                                <option>UI设计师</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: '#64748B' }}>备注信息</label>
                            <textarea style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', height: '80px' }}
                                value={formData.remark} onChange={e => setFormData({ ...formData, remark: e.target.value })} />
                        </div>
                        <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                            <button type="button" onClick={() => setShowAddModal(false)} style={{ flex: 1, background: '#F1F5F9', color: '#475569' }}>取消</button>
                            <button type="submit" className="btn-primary" style={{ flex: 1 }}>提交保存</button>
                        </div>
                    </form>
                </Modal>
            )}

            {showDetailModal && (
                <Modal title="邀约详情" onClose={() => setShowDetailModal(null)}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <p style={{ fontSize: '12px', color: '#94A3B8' }}>候选人</p>
                                <p style={{ fontWeight: 600 }}>{showDetailModal.name}</p>
                            </div>
                            <div>
                                <p style={{ fontSize: '12px', color: '#94A3B8' }}>邀约岗位</p>
                                <p style={{ fontWeight: 600 }}>{showDetailModal.job}</p>
                            </div>
                            <div>
                                <p style={{ fontSize: '12px', color: '#94A3B8' }}>邀约人</p>
                                <p style={{ fontWeight: 600 }}>{showDetailModal.recruiter}</p>
                            </div>
                            <div>
                                <p style={{ fontSize: '12px', color: '#94A3B8' }}>状态</p>
                                <p style={{ fontWeight: 600 }}>{showDetailModal.status}</p>
                            </div>
                        </div>
                        <div>
                            <p style={{ fontSize: '12px', color: '#94A3B8' }}>备注</p>
                            <p style={{ background: '#F8FAFC', padding: '12px', borderRadius: '8px', marginTop: '4px' }}>{showDetailModal.remark || '无备注'}</p>
                        </div>
                        <button className="btn-primary" onClick={() => setShowDetailModal(null)}>确定</button>
                    </div>
                </Modal>
            )}

            {showBatchDeleteModal && (
                <Modal title="确认批量操作" onClose={() => setShowBatchDeleteModal(false)}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <p style={{ color: '#64748B' }}>确定要删除选中的 {selectedIds.length} 条记录吗？此操作不可撤销。</p>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowBatchDeleteModal(false)}>取消</button>
                            <button className="btn-primary" style={{ flex: 1, background: '#EF4444' }} onClick={handleBatchDelete}>立即删除</button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export const JobManagement = () => {
    const [jobs, setJobs] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(null);
    const [showOfflineConfirm, setShowOfflineConfirm] = useState(null);
    const [formData, setFormData] = useState({ name: '', dept: '研发部', status: '招聘中' });
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState('全部岗位');
    const [favorites, setFavorites] = useState([]);

    const fetchFavorites = async () => {
        try {
            const res = await FavoriteAPI.list();
            setFavorites(res);
        } catch {}
    };

    const fetchJobs = async () => {
        try {
            const res = await JobAPI.list();
            setJobs(res);
        } catch (err) {
            showToast('获取数据失败', 'error');
        }
    };

    useEffect(() => { 
        fetchJobs(); 
        fetchFavorites();
    }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await JobAPI.create({ ...formData, status: '待审核', time: new Date().toISOString().split('T')[0] });
            showToast('需求已提交审核');
            setShowAddModal(false);
            setFormData({ name: '', dept: '研发部' });
            fetchJobs();
        } catch (err) {
            showToast('发布失败', 'error');
        }
    };

    const handleAudit = async (job) => {
        try {
            await JobAPI.update(job.id, { ...job, status: '招聘中' });
            showToast('审核通过，岗位已上线');
            fetchJobs();
        } catch { showToast('审核操作失败', 'error'); }
    };

    const handleEdit = async (e) => {
        e.preventDefault();
        try {
            await JobAPI.update(showEditModal.id, showEditModal);
            showToast('修改成功');
            setShowEditModal(null);
            fetchJobs();
        } catch (err) {
            showToast('修改失败', 'error');
        }
    };

    const filteredJobs = jobs.filter(j => activeTab === '全部岗位' || j.status === activeTab);

    const handleFavorite = async (job) => {
        const isFav = favorites.some(f => f.name === job.name && f.type === 'job');
        try {
            if (isFav) {
                const fav = favorites.find(f => f.name === job.name && f.type === 'job');
                await FavoriteAPI.delete(fav.id);
                showToast('已取消收藏');
            } else {
                await FavoriteAPI.create({ name: job.name, job: job.dept, type: 'job' });
                showToast('职位已收藏');
            }
            fetchFavorites();
        } catch { showToast('操作失败', 'error'); }
    };

    return (
        <div style={{ display: 'flex', width: '100%', minHeight: '100vh', background: 'var(--bg-primary)' }}>
            <Sidebar />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Header title="岗位管理" />
                <main style={{ padding: '32px 40px', flex: 1, overflowY: 'auto' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
                        {[
                            { label: '热招岗位', value: jobs.filter(j => j.status === '招聘中').length, color: '#3B82F6' },
                            { label: '待审核', value: jobs.filter(j => j.status === '待审核').length, color: '#F59E0B' },
                            { label: '已下架', value: jobs.filter(j => j.status === '已暂停').length, color: '#EF4444' },
                            { label: '平均投递/岗', value: 124, color: '#10B981' }
                        ].map((stat, i) => (
                            <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: `${stat.color}11`, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Briefcase size={24} />
                                </div>
                                <div><p style={{ fontSize: '14px', color: '#64748B' }}>{stat.label}</p><p style={{ fontSize: '24px', fontWeight: 700 }}>{stat.value}</p></div>
                            </div>
                        ))}
                    </div>

                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <div style={{ display: 'flex', gap: '24px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: 600 }}>岗位列表</h3>
                                <div style={{ display: 'flex', background: '#F1F5F9', padding: '2px', borderRadius: '8px' }}>
                                    {['全部岗位', '待审核'].map(t => (
                                        <button
                                            key={t}
                                            onClick={() => setActiveTab(t)}
                                            style={{
                                                padding: '4px 12px', borderRadius: '6px', fontSize: '13px', border: 'none',
                                                background: activeTab === t ? 'white' : 'transparent',
                                                color: activeTab === t ? 'var(--primary)' : '#64748B',
                                                boxShadow: activeTab === t ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
                                            }}
                                        >{t}</button>
                                    ))}
                                </div>
                            </div>
                            <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setShowAddModal(true)}>
                                <Plus size={18} /> 发布新岗位
                            </button>
                        </div>
                        <table>
                            <thead>
                                <tr><th>岗位名称</th><th>部门</th><th>状态</th><th>发布时间</th><th>需求审核</th><th>操作</th></tr>
                            </thead>
                            <tbody>
                                {filteredJobs.map((job) => (
                                    <tr key={job.id}>
                                        <td style={{ fontWeight: 600 }}>{job.name}</td>
                                        <td>{job.dept}</td>
                                        <td>
                                            <span style={{
                                                padding: '4px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: 600,
                                                background: job.status === '招聘中' ? '#ECFDF5' : job.status === '待审核' ? '#FEF3C7' : '#F1F5F9',
                                                color: job.status === '招聘中' ? '#10B981' : job.status === '待审核' ? '#F59E0B' : '#64748B'
                                            }}>{job.status}</span>
                                        </td>
                                        <td>{job.time}</td>
                                        <td>
                                            {job.status === '待审核' ? (
                                                <button
                                                    onClick={() => handleAudit(job)}
                                                    style={{ fontSize: '12px', color: '#10B981', background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '4px 12px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                                                >通过审核</button>
                                            ) : (
                                                <span style={{ fontSize: '12px', color: '#94A3B8' }}>已启用</span>
                                            )}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button onClick={() => handleFavorite(job)} style={{ color: favorites.some(f => f.name === job.name && f.type === 'job') ? '#FF8A3D' : '#F59E0B', background: 'none', display: 'flex', alignItems: 'center', gap: '4px' }} title={favorites.some(f => f.name === job.name && f.type === 'job') ? "取消收藏" : "收藏职位"}>
                                                    <Star size={14} fill={favorites.some(f => f.name === job.name && f.type === 'job') ? "#FF8A3D" : "none"} />
                                                    {favorites.some(f => f.name === job.name && f.type === 'job') ? '已收藏' : '收藏'}
                                                </button>
                                                <button onClick={() => setShowEditModal(job)} style={{ color: 'var(--primary)', background: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}><Edit size={14} />编辑</button>
                                                <button onClick={() => setShowOfflineConfirm(job)} style={{ color: '#EF4444', background: 'none' }}>下架</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </main>
            </div>
            {showAddModal && (
                <Modal title="发布新岗位" onClose={() => setShowAddModal(false)}>
                    <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: '#64748B' }}>岗位名称</label>
                            <input required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0' }}
                                value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: '#64748B' }}>所属部门</label>
                            <select style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0' }}
                                value={formData.dept} onChange={e => setFormData({ ...formData, dept: e.target.value })}>
                                <option>研发部</option><option>产品部</option><option>行政组</option><option>设计部</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                            <button type="button" onClick={() => setShowAddModal(false)} style={{ flex: 1, background: '#F1F5F9', color: '#475569' }}>取消</button>
                            <button type="submit" className="btn-primary" style={{ flex: 1 }}>立即发布</button>
                        </div>
                    </form>
                </Modal>
            )}
            {showEditModal && (
                <Modal title="编辑岗位" onClose={() => setShowEditModal(null)}>
                    <form onSubmit={handleEdit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: '#64748B' }}>岗位名称</label>
                            <input required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0' }}
                                value={showEditModal.name} onChange={e => setShowEditModal({ ...showEditModal, name: e.target.value })} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: '#64748B' }}>对应状态</label>
                            <select style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0' }}
                                value={showEditModal.status} onChange={e => setShowEditModal({ ...showEditModal, status: e.target.value })}>
                                <option>招聘中</option>
                                <option>已暂停</option>
                                <option>已下线</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                            <button type="button" onClick={() => setShowEditModal(null)} style={{ flex: 1, background: '#F1F5F9', color: '#475569' }}>取消</button>
                            <button type="submit" className="btn-primary" style={{ flex: 1 }}>提交修改</button>
                        </div>
                    </form>
                </Modal>
            )}

            {showOfflineConfirm && (
                <Modal title="确认下架岗位" onClose={() => setShowOfflineConfirm(null)}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div style={{ padding: '16px', background: '#FEF2F2', borderRadius: '12px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                            <div style={{ color: '#EF4444', marginTop: '2px' }}><Briefcase size={20} /></div>
                            <div>
                                <p style={{ fontWeight: 600, color: '#991B1B' }}>下架岗位: {showOfflineConfirm.name}</p>
                                <p style={{ fontSize: '13px', color: '#B91C1C', marginTop: '4px' }}>岗位下架后将不再接收新的简历。确定要执行此操作吗？</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowOfflineConfirm(null)}>暂不下架</button>
                            <button className="btn-primary" style={{ flex: 1, background: '#EF4444' }} onClick={async () => {
                                try {
                                    await JobAPI.update(showOfflineConfirm.id, { ...showOfflineConfirm, status: '已暂停' });
                                    showToast('岗位已成功下架');
                                    setShowOfflineConfirm(null);
                                    fetchJobs();
                                } catch { showToast('操作失败', 'error'); }
                            }}>立即下架</button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export const MyFavorites = () => {
    const [data, setData] = useState([]);
    const [search, setSearch] = useState('');
    const { showToast } = useToast();

    const fetch = async () => {
        try {
            const res = await FavoriteAPI.list();
            setData(res);
        } catch { }
    };

    useEffect(() => { fetch(); }, []);

    const handleUnfavorite = async (id) => {
        try {
            await FavoriteAPI.delete(id);
            showToast('已取消收藏');
            fetch();
        } catch { showToast('操作失败', 'error'); }
    };

    const filtered = data.filter(item => 
        item.name.includes(search) || item.job.includes(search)
    );

    return (
        <div style={{ display: 'flex', width: '100%', minHeight: '100vh', background: 'var(--bg-primary)' }}>
            <Sidebar />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Header title="我的收藏" />
                <main style={{ padding: '32px 40px', flex: 1, overflowY: 'auto' }}>
                    <div className="card" style={{ marginBottom: '24px' }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <Search size={18} color="#94A3B8" />
                            <input 
                                placeholder="快速检索收藏候选人或岗位..." 
                                style={{ flex: 1, border: 'none', outline: 'none', fontSize: '15px' }}
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                        {filtered.map(item => (
                            <div key={item.id} className="card" style={{ display: 'flex', gap: '20px', alignItems: 'center', position: 'relative' }}>
                                <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', gap: '8px' }}>
                                    <Trash2 size={16} color="#94A3B8" cursor="pointer" onClick={() => handleUnfavorite(item.id)} />
                                    <Star size={18} color="#FF8A3D" fill="#FF8A3D" />
                                </div>
                                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>👤</div>
                                <div><h4 style={{ fontWeight: 600 }}>{item.name}</h4><p style={{ fontSize: '13px', color: '#64748B' }}>期望岗位: {item.job}</p></div>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
};

export const Memo = () => {
    const [memos, setMemos] = useState([]);
    const [activeMemo, setActiveMemo] = useState(null);
    const [title, setTitle] = useState('');
    const editorRef = useRef(null);
    const [currentTag, setCurrentTag] = useState('随笔');
    const tags = ['随笔', '紧急', '候选人'];
    const [selectedTag, setSelectedTag] = useState('全部');
    const [relCandidate, setRelCandidate] = useState('');
    const [relJob, setRelJob] = useState('');
    const [candidates, setCandidates] = useState([]);
    const [jobsList, setJobsList] = useState([]);
    const { showToast } = useToast();

    const fetchMemos = async () => {
        try {
            const res = await MemoAPI.list();
            setMemos(res);
            if (res.length > 0 && !activeMemo) {
                const first = res[0];
                setActiveMemo(first);
                setTitle(first.title);
                setTimeout(() => {
                    if (editorRef.current) editorRef.current.innerHTML = first.content || '';
                }, 0);
                setCurrentTag(first.tag || '随笔');
                setRelCandidate(first.candidate || '');
                setRelJob(first.job || '');
            }
        } catch { }
    };

    const fetchAssociations = async () => {
        try {
            const [cRes, jRes] = await Promise.all([InvitationAPI.list(), JobAPI.list()]);
            setCandidates(cRes);
            setJobsList(jRes);
        } catch {}
    };

    useEffect(() => { 
        fetchMemos(); 
        fetchAssociations();
    }, []);

    const handleSave = async () => {
        if (!title.trim()) return showToast('标题不能为空', 'error');
        const editorContent = editorRef.current?.innerHTML || '';
        const data = { title, content: editorContent, tag: currentTag, candidate: relCandidate, job: relJob };
        try {
            if (activeMemo) {
                await MemoAPI.update(activeMemo.id, data);
            } else {
                await MemoAPI.create(data);
            }
            showToast('保存成功');
            fetchMemos();
        } catch { showToast('保存失败', 'error'); }
    };

    const handleCommand = (cmd, val = null) => {
        document.execCommand(cmd, false, val);
        if (editorRef.current) editorRef.current.focus();
    };

    const filteredMemos = memos.filter(m => selectedTag === '全部' || m.tag === selectedTag);

    return (
        <div style={{ display: 'flex', width: '100%', minHeight: '100vh', background: 'var(--bg-primary)' }}>
            <Sidebar />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Header title="备忘录" />
                <main style={{ padding: '32px 40px', flex: 1, overflowY: 'auto' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '32px', height: 'calc(100vh - 160px)' }}>
                        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '24px', overflow: 'hidden' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: 600 }}>我的笔记</h3>
                                <Plus size={20} color="var(--primary)" cursor="pointer" onClick={() => { 
                                    setActiveMemo(null); 
                                    setTitle(''); 
                                    if (editorRef.current) editorRef.current.innerHTML = '';
                                }} />
                            </div>
                            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
                                {['全部', ...tags].map(tag => (
                                    <span
                                        key={tag}
                                        onClick={() => setSelectedTag(tag)}
                                        style={{
                                            padding: '4px 12px', borderRadius: '99px', fontSize: '12px', cursor: 'pointer',
                                            background: selectedTag === tag ? 'var(--primary)' : '#F1F5F9',
                                            color: selectedTag === tag ? 'white' : '#64748B'
                                        }}
                                    >{tag}</span>
                                ))}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' }}>
                                {filteredMemos.map((note) => (
                                    <div key={note.id} onClick={() => { 
                                        setActiveMemo(note); 
                                        setTitle(note.title); 
                                        if (editorRef.current) editorRef.current.innerHTML = note.content || '';
                                        setCurrentTag(note.tag || '随笔');
                                        setRelCandidate(note.candidate || '');
                                        setRelJob(note.job || '');
                                    }} style={{ padding: '16px', borderRadius: '16px', background: activeMemo?.id === note.id ? '#FEF3F2' : '#F8FAFC', cursor: 'pointer', border: '1px solid #E2E8F0', transition: '0.2s' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                            <h4 style={{ fontSize: '15px', fontWeight: 600 }}>{note.title}</h4>
                                            <span style={{ fontSize: '10px', padding: '2px 6px', background: activeMemo?.id === note.id ? 'var(--primary)' : '#E2E8F0', color: activeMemo?.id === note.id ? 'white' : '#64748B', borderRadius: '4px' }}>{note.tag}</span>
                                        </div>
                                        {note.candidate && <div style={{ fontSize: '11px', color: 'var(--primary)', marginBottom: '4px' }}>关联候选人: {note.candidate}</div>}
                                        <span style={{ fontSize: '12px', color: '#94A3B8' }}>{note.date}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <input style={{ flex: 1, fontSize: '24px', fontWeight: 700, border: 'none', outline: 'none', background: 'none' }} placeholder="输入标题..." value={title} onChange={e => setTitle(e.target.value)} />
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                                    <div style={{ display: 'flex', gap: '4px', background: 'white', border: '1px solid #E2E8F0', padding: '4px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                        {[
                                            { label: '加粗', cmd: 'bold', icon: <Bold size={14} /> },
                                            { label: '斜体', cmd: 'italic', icon: <Italic size={14} /> },
                                            { label: '下划线', cmd: 'underline', icon: <Underline size={14} /> },
                                            { label: '列表', cmd: 'insertUnorderedList', icon: <List size={14} /> },
                                        ].map((item, i) => (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => handleCommand(item.cmd)}
                                                style={{ padding: '4px 8px', borderRadius: '6px', border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', color: '#1E293B', fontSize: '12px', transition: '0.2s' }}
                                                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F1F5F9'}
                                                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                            >
                                                {item.icon} {item.label}
                                            </button>
                                        ))}
                                        <div style={{ width: '1px', height: '20px', background: '#E2E8F0', margin: '4px 2px' }} />
                                        <button
                                            type="button"
                                            onClick={() => handleCommand('foreColor', '#FF8A3D')}
                                            style={{ padding: '4px 8px', borderRadius: '6px', border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', color: '#FF8A3D', fontSize: '12px' }}
                                            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F1F5F9'}
                                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                        >
                                            <Palette size={14} /> 橙色
                                        </button>
                                    </div>
                                    <button className="btn-primary" onClick={handleSave} style={{ padding: '8px 20px', height: '36px', borderRadius: '99px', fontSize: '14px', fontWeight: 600, background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <CheckCircle size={16} /> 保存笔记
                                    </button>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '12px', color: '#64748B', whiteSpace: 'nowrap' }}>关联候选人:</span>
                                    <select style={{ flex: 1, padding: '4px 8px', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '12px' }} value={relCandidate} onChange={e => setRelCandidate(e.target.value)}>
                                        <option value="">-- 请选择 --</option>
                                        {candidates.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '12px', color: '#64748B', whiteSpace: 'nowrap' }}>关联岗位:</span>
                                    <select style={{ flex: 1, padding: '4px 8px', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '12px' }} value={relJob} onChange={e => setRelJob(e.target.value)}>
                                        <option value="">-- 请选择 --</option>
                                        {jobsList.map(j => <option key={j.id} value={j.name}>{j.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                                {tags.map(tag => (
                                    <span
                                        key={tag}
                                        onClick={() => setCurrentTag(tag)}
                                        style={{
                                            padding: '4px 12px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer',
                                            border: '1px solid ' + (currentTag === tag ? 'var(--primary)' : '#E2E8F0'),
                                            background: currentTag === tag ? '#FEF3F2' : 'white',
                                            color: currentTag === tag ? 'var(--primary)' : '#64748B',
                                            transition: '0.2s'
                                        }}
                                    >{tag}</span>
                                ))}
                            </div>
                             <div
                                ref={editorRef}
                                contentEditable
                                style={{ flex: 1, background: '#F8FAFC', borderRadius: '16px', padding: '24px', color: '#1E293B', border: '1px solid #F1F5F9', outline: 'none', overflowY: 'auto', fontSize: '15px', lineHeight: 1.8 }}
                                placeholder="开始记录您的灵感或面试笔记..."
                            />
                            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                <button className="btn-primary" onClick={handleSave}>保存笔记</button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};
