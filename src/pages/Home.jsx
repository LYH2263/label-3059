import React, { useState, useEffect } from 'react';
import { Sidebar, Header } from '../common/components/Layout';
import { useNavigate } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import { StatsAPI } from '../common/api/request';
import { commonOptions, chartColors } from '../common/utils/chartConfig';
import { ArrowUpRight, ArrowDownRight, Users, Calendar, CheckCircle2, MoreVertical, Briefcase } from 'lucide-react';

const StatCard = ({ title, value, change, isPositive, icon: Icon, onClick }) => (
    <div className="card" onClick={onClick} style={{ display: 'flex', flexDirection: 'column', gap: '8px', cursor: onClick ? 'pointer' : 'default' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', color: '#64748B', fontWeight: 500 }}>{title}</span>
            <div style={{ padding: '8px', background: isPositive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', borderRadius: '12px' }}>
                <Icon size={20} color={isPositive ? '#10B981' : '#EF4444'} />
            </div>
        </div>
        <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)' }}>{value}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
            {isPositive ? <ArrowUpRight size={14} color="#10B981" /> : <ArrowDownRight size={14} color="#EF4444" />}
            <span style={{ color: isPositive ? '#10B981' : '#EF4444', fontWeight: 600 }}>{change}</span>
            <span style={{ color: '#94A3B8' }}>vs 上月同期</span>
        </div>
    </div>
);

const Home = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await StatsAPI.getOverview();
                setStats(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const chartData = {
        labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        datasets: [{
            label: '新增投递',
            data: [65, 59, 80, 81, 56, 55, 40],
            borderColor: chartColors.primary,
            backgroundColor: chartColors.primary + '22',
            fill: true,
            tension: 0.4
        }]
    };

    if (loading) return null;

    return (
        <div style={{ display: 'flex', width: '100%', minHeight: '100vh', background: 'var(--bg-primary)' }}>
            <Sidebar />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Header title="仪表盘" />
                <main style={{ padding: '32px 40px', flex: 1, overflowY: 'auto' }}>
                    {/* Welcome Section */}
                    <div className="card" style={{
                        background: 'linear-gradient(135deg, #FF8A3D 0%, #FF6B00 100%)',
                        border: 'none', marginBottom: '32px', padding: '32px 48px',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        color: 'white', position: 'relative', overflow: 'hidden'
                    }}>
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>下午好, {user.real_name || '用户'}! 👋</h2>
                            <p style={{ opacity: 0.9, fontSize: '15px' }}>今天您有 {stats?.todayTasks?.length || 0} 场面试/跟进安排。</p>
                            <button
                                className="btn-primary"
                                onClick={() => navigate('/interview-management')}
                                style={{
                                    background: 'white', color: 'var(--primary)', marginTop: '24px',
                                    padding: '12px 24px', fontSize: '14px'
                                }}
                            >
                                查看日程管理
                            </button>
                        </div>
                        <div style={{
                            position: 'absolute', right: '-40px', top: '-40px',
                            width: '240px', height: '240px', background: 'rgba(255,255,255,0.1)',
                            borderRadius: '50%', filter: 'blur(30px)'
                        }}></div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
                        <StatCard onClick={() => navigate('/invitation')} title="累计邀约人数" value={stats?.totalInvitations?.toLocaleString()} change="+12.5%" isPositive icon={Users} />
                        <StatCard onClick={() => navigate('/interview-management')} title="当前面试中" value={stats?.currentInterviews} change="-2.4%" isPositive={false} icon={Calendar} />
                        <StatCard title="本月入职人数" value={stats?.monthlyHires} change="+8.2%" isPositive icon={CheckCircle2} />
                        <StatCard onClick={() => navigate('/job-management')} title="在招岗位" value={stats?.activeJobs} change="+3.1%" isPositive icon={Briefcase} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
                        <div className="card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: 600 }}>数据趋势概览</h3>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button onClick={() => navigate('/personal-data')} style={{ padding: '4px 12px', background: '#F1F5F9', fontSize: '12px' }}>查看详细趋势</button>
                                </div>
                            </div>
                            <div style={{ height: '300px', width: '100%' }}>
                                <Line data={chartData} options={commonOptions} />
                            </div>
                        </div>

                        <div className="card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: 600 }}>今日待办任务</h3>
                                <MoreVertical size={16} color="#94A3B8" cursor="pointer" />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {stats?.todayTasks?.map((item, i) => (
                                    <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                                        <span style={{ color: 'var(--primary)', fontSize: '14px', fontWeight: 600, width: '40px' }}>{item.time}</span>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontSize: '14px', fontWeight: 500 }}>{item.task}</p>
                                            <span style={{ fontSize: '12px', color: '#94A3B8' }}>{item.type}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Home;
