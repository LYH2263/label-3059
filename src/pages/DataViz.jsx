import React, { useState, useEffect } from 'react';
import { Sidebar, Header, ChartCard } from '../common/components/Layout';
import { useToast, Modal } from '../common/components/Feedback';
import { Line, Bar, Pie, Radar, Doughnut } from 'react-chartjs-2';
import { commonOptions, chartColors } from '../common/utils/chartConfig';
import { ArrowUpRight, ArrowDownRight, Users, UserCheck, Calendar, Briefcase, Download, Filter, X } from 'lucide-react';
import { StatsAPI } from '../common/api/request';

export const PersonalData = () => {
    const [stats, setStats] = useState(null);
    const [trendType, setTrendType] = useState('week'); // week or month
    const { showToast } = useToast();

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await StatsAPI.getPersonal();
                setStats(res);
            } catch { showToast('无法加载统计数据', 'error'); }
        };
        fetch();
    }, []);

    const data = {
        labels: trendType === 'week' 
            ? ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
            : Array.from({length: 12}, (_, i) => `${i + 1}月`),
        datasets: [{
            label: trendType === 'week' ? '本周招聘转化' : '年度招聘趋势',
            data: stats ? (trendType === 'week' ? stats.trends.week : stats.trends.month) : [],
            borderColor: chartColors.primary,
            backgroundColor: chartColors.primary + '22',
            fill: true,
            tension: 0.4
        }]
    };

    return (
        <div style={{ display: 'flex', width: '100%', minHeight: '100vh', background: 'var(--bg-primary)' }}>
            <Sidebar />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Header title="个人数据" />
                <main style={{ padding: '32px 40px', flex: 1, overflowY: 'auto' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
                        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <span style={{ fontSize: '14px', color: '#64748B' }}>邀约达成率</span>
                            <span style={{ fontSize: '28px', fontWeight: 700 }}>{stats?.reachRate || '92.5'}%</span>
                            <div style={{ width: '100%', height: '6px', background: '#F1F5F9', borderRadius: '3px', marginTop: '8px' }}>
                                <div style={{ width: `${stats?.reachRate || 92.5}%`, height: '100%', background: 'var(--primary)', borderRadius: '3px' }}></div>
                            </div>
                        </div>
                        {[
                            { label: '本月邀约', value: stats?.monthlyInvitations || 0, change: stats?.invitationChange || '', isPos: true },
                            { label: '本月面试', value: stats?.monthlyInterviews || 0, change: stats?.interviewChange || '', isPos: true },
                            { label: '本月入职', value: stats?.monthlyHires || 0, change: stats?.hireChange || '', isPos: false }
                        ].map((stat, i) => (
                            <div key={i} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <span style={{ fontSize: '14px', color: '#64748B' }}>{stat.label}</span>
                                <span style={{ fontSize: '28px', fontWeight: 700 }}>{stat.value}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                                    {stat.change.includes('+') ? <ArrowUpRight size={14} color="#10B981" /> : <ArrowDownRight size={14} color="#EF4444" />}
                                    <span style={{ color: stat.change.includes('+') ? '#10B981' : '#EF4444', fontWeight: 600 }}>{stat.change}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
                        <ChartCard title={`邀约趋势 (${trendType === 'week' ? '周' : '月'})`} extra={
                            <div style={{ display: 'flex', background: '#F1F5F9', padding: '2px', borderRadius: '8px' }}>
                                <button onClick={() => setTrendType('week')} style={{ border: 'none', padding: '4px 12px', fontSize: '12px', borderRadius: '6px', cursor: 'pointer', background: trendType === 'week' ? 'white' : 'transparent', fontWeight: trendType === 'week' ? 600 : 400 }}>周</button>
                                <button onClick={() => setTrendType('month')} style={{ border: 'none', padding: '4px 12px', fontSize: '12px', borderRadius: '6px', cursor: 'pointer', background: trendType === 'month' ? 'white' : 'transparent', fontWeight: trendType === 'month' ? 600 : 400 }}>月</button>
                            </div>
                        }>
                            <Line data={data} options={commonOptions} />
                        </ChartCard>
                        <div className="card">
                            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '24px' }}>重点任务列表</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {[
                                    { task: '完成资深UI设计师初审', progress: 80, due: '今天' },
                                    { task: '联系李华沟通复试时间', progress: 40, due: '明天' },
                                    { task: '更新本周招聘周报', progress: 20, due: '周五' }
                                ].map((task, i) => (
                                    <div key={i} style={{ padding: '16px', borderRadius: '12px', background: '#F8FAFC' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <span style={{ fontSize: '14px', fontWeight: 600 }}>{task.task}</span>
                                            <span style={{ fontSize: '12px', color: 'var(--primary)' }}>{task.due}</span>
                                        </div>
                                        <div style={{ width: '100%', height: '4px', background: '#E2E8F0', borderRadius: '2px' }}>
                                            <div style={{ width: `${task.progress}%`, height: '100%', background: 'var(--primary)', borderRadius: '2px' }}></div>
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

export const TeamData = () => {
    const { showToast } = useToast();
    const handleExport = () => {
        const headers = "日期,新人入职,离职人数,招聘目标,达成率\n";
        const rows = [
            "2023-11,85,12,100,85%",
            "2023-10,110,8,100,110%",
            "2023-09,93,15,100,93%"
        ].join("\n");
        const blob = new Blob(["\uFEFF" + headers + rows], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `团队招聘月度报告_${new Date().toLocaleDateString()}.csv`;
        link.click();
        showToast('团队报告导出成功！');
    };

    const funnelData = {
        labels: ['浏览量', '申请量', '初试量', '复试量', '录用量', '入职量'],
        datasets: [{
            label: '招聘转化漏斗',
            data: [10000, 5000, 2000, 800, 200, 150],
            backgroundColor: [
                'rgba(255, 138, 61, 0.9)',
                'rgba(255, 138, 61, 0.7)',
                'rgba(255, 138, 61, 0.5)',
                'rgba(255, 138, 61, 0.4)',
                'rgba(255, 138, 61, 0.3)',
                'rgba(255, 138, 61, 0.2)'
            ],
            borderWidth: 0
        }]
    };

    const channelData = {
        labels: ['内部推荐', 'BOSS直聘', '猎聘网', '拉勾网', '校园招聘'],
        datasets: [{
            label: '招聘渠道分布',
            data: [35, 25, 20, 10, 10],
            backgroundColor: [
                chartColors.primary,
                chartColors.secondary,
                chartColors.success,
                chartColors.warning,
                chartColors.info
            ]
        }]
    };

    const performanceLabels = ['王小红', '李雷', '韩梅梅', '张伟', '陈静', '周杰'];
    const performanceData = {
        labels: performanceLabels,
        datasets: [{
            label: '成员业绩评分',
            data: [85, 75, 92, 65, 88, 70],
            backgroundColor: chartColors.primary,
            borderRadius: 12
        }]
    };

    const [drillDown, setDrillDown] = useState(null);

    const monthlyTrendData = {
        labels: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
        datasets: [{
            label: '月度入职人数',
            data: [65, 59, 80, 81, 56, 55, 40, 72, 93, 110, 85, 95],
            borderColor: chartColors.secondary,
            backgroundColor: chartColors.secondary + '22',
            fill: true,
            tension: 0.4
        }, {
            label: '月度招聘目标',
            data: [70, 70, 70, 80, 80, 80, 80, 80, 100, 100, 100, 100],
            borderColor: '#CBD5E1',
            borderDash: [5, 5],
            fill: false,
            tension: 0
        }]
    };

    const handleDrillDown = (item) => {
        setDrillDown(item);
    };

    return (
        <div style={{ display: 'flex', width: '100%', minHeight: '100vh', background: 'var(--bg-primary)' }}>
            <Sidebar />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Header title="团队数据" />
                <main style={{ padding: '32px 40px', flex: 1, overflowY: 'auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginBottom: '24px' }}>
                        <button style={{ background: 'white', color: '#64748B', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #E2E8F0' }}>
                            <Filter size={16} /> 本年度
                        </button>
                        <button onClick={handleExport} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Download size={16} /> 导出团队报告
                        </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
                        <div className="card" style={{ display: 'flex', gap: '16px', alignItems: 'center', background: 'linear-gradient(135deg, #4F46E5 0%, #3730A3 100%)', color: 'white', border: 'none' }}>
                            <div style={{ fontSize: '32px' }}>🚀</div>
                            <div>
                                <p style={{ fontSize: '13px', opacity: 0.8 }}>团队招聘达成率</p>
                                <p style={{ fontSize: '24px', fontWeight: 700 }}>98.2%</p>
                            </div>
                        </div>
                        {[
                            { label: '人均邀约', value: 45.2 },
                            { label: '人均面试', value: 12.8 },
                            { label: '人均入职', value: 3.1 }
                        ].map((stat, i) => (
                            <div key={i} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span style={{ fontSize: '14px', color: '#64748B' }}>{stat.label}</span>
                                <span style={{ fontSize: '24px', fontWeight: 700 }}>{stat.value}</span>
                            </div>
                        ))}
                    </div>

                    <ChartCard title="月度业绩趋势图" style={{ marginBottom: '32px' }}>
                        <Line data={monthlyTrendData} options={commonOptions} />
                    </ChartCard>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '32px', marginBottom: '32px' }}>
                        <ChartCard title="团队招聘转化率漏斗图">
                            <Bar
                                data={funnelData}
                                options={{
                                    ...commonOptions,
                                    indexAxis: 'y',
                                    plugins: { ...commonOptions.plugins, legend: { display: false } },
                                    scales: { ...commonOptions.scales, x: { display: false } }
                                }}
                            />
                        </ChartCard>
                        <ChartCard title="各渠道招聘效果对比图">
                            <Doughnut data={channelData} options={commonOptions} />
                        </ChartCard>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
                        <ChartCard title="成员业绩排行榜 (点击下钻)">
                            <Bar
                                data={performanceData}
                                options={{
                                    ...commonOptions,
                                    plugins: { ...commonOptions.plugins, legend: { display: false } },
                                    onClick: (e, items) => {
                                        if (items.length > 0) {
                                            const index = items[0].index;
                                            handleDrillDown({ name: performanceLabels[index], value: performanceData.datasets[0].data[index] });
                                        }
                                    }
                                }}
                            />
                        </ChartCard>
                        <div className="card">
                            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '24px' }}>各城市招聘效率</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {[
                                    { city: '北京', rate: 95 },
                                    { city: '上海', rate: 88 },
                                    { city: '深圳', rate: 82 },
                                    { city: '杭州', rate: 75 }
                                ].map((item, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }} onClick={() => handleDrillDown({ name: item.city, value: item.rate + '%' })}>
                                        <span style={{ fontSize: '14px', fontWeight: 600, width: '40px' }}>{item.city}</span>
                                        <div style={{ flex: 1, height: '12px', background: '#F1F5F9', borderRadius: '6px', overflow: 'hidden' }}>
                                            <div style={{ width: `${item.rate}%`, height: '100%', background: chartColors.secondary, borderRadius: '6px' }}></div>
                                        </div>
                                        <span style={{ fontSize: '13px', color: '#64748B', width: '32px' }}>{item.rate}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
            {drillDown && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="card" style={{ width: '500px', maxWidth: '90vw', padding: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '20px', fontWeight: 700 }}>数据下钻详情: {drillDown.name}</h3>
                            <button onClick={() => setDrillDown(null)} style={{ background: 'none', fontSize: '20px' }}><X size={24} /></button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '12px' }}>
                                <p style={{ fontSize: '12px', color: '#64748B' }}>当前指标</p>
                                <p style={{ fontSize: '24px', fontWeight: 700, color: 'var(--primary)' }}>{drillDown.value}</p>
                            </div>
                            <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '12px' }}>
                                <p style={{ fontSize: '12px', color: '#64748B' }}>行业基准</p>
                                <p style={{ fontSize: '24px', fontWeight: 700 }}>78.0</p>
                            </div>
                        </div>
                        <p style={{ marginTop: '24px', color: '#64748B', fontSize: '14px', lineHeight: 1.6 }}>详细指标分析：{drillDown.name} 在本周期的招聘活跃度较高，主要贡献点在于简历初筛效率比平均水平高出 15%。建议持续关注后续的复试转化。更多详细信息请参阅财务及HR同步报表。</p>
                        <button className="btn-primary" style={{ width: '100%', marginTop: '32px' }} onClick={() => setDrillDown(null)}>确定</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export const InterviewData = () => {
    const [vizData, setVizData] = useState(null);
    const { showToast } = useToast();

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await StatsAPI.getInterviewViz();
                setVizData(res);
            } catch { }
        };
        fetch();
    }, []);

    const radarData = {
        labels: ['技术能力', '软素质', '业务匹配', '沟通能力', '稳定性', '发展潜力'],
        datasets: [{
            label: '平均评分一致性',
            data: [85, 90, 75, 80, 70, 85],
            backgroundColor: chartColors.primary + '44',
            borderColor: chartColors.primary,
            pointBackgroundColor: chartColors.primary
        }]
    };

    const interviewFunnelData = {
        labels: ['初审通过', '初试通过', '复试通过', '终试通过', '完成背调'],
        datasets: [{
            label: '面试环节转化漏斗',
            data: [100, 45, 20, 12, 10],
            backgroundColor: chartColors.secondary + 'CC',
            borderRadius: 8
        }]
    };

    const sourceOutcomeData = {
        labels: vizData?.sourceOutcome.labels || [],
        datasets: [{
            label: '录用人数',
            data: vizData?.sourceOutcome.hired || [],
            backgroundColor: chartColors.success
        }, {
            label: '淘汰人数',
            data: vizData?.sourceOutcome.rejected || [],
            backgroundColor: chartColors.error + '88'
        }]
    };

    return (
        <div style={{ display: 'flex', width: '100%', minHeight: '100vh', background: 'var(--bg-primary)' }}>
            <Sidebar />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Header title="面试数据" />
                <main style={{ padding: '32px 40px', flex: 1, overflowY: 'auto' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px' }}>
                        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ fontSize: '14px', color: '#64748B' }}>面试总通过率</div>
                            <div style={{ fontSize: '32px', fontWeight: 800, color: '#10B981' }}>24.5%</div>
                            <div style={{ fontSize: '12px', color: '#94A3B8' }}>低于行业平均 5.2%</div>
                        </div>
                        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ fontSize: '14px', color: '#64748B' }}>平均定薪比例</div>
                            <div style={{ fontSize: '32px', fontWeight: 800, color: '#4F46E5' }}>102%</div>
                            <div style={{ fontSize: '12px', color: '#94A3B8' }}>符合预期范围</div>
                        </div>
                        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderLeft: '4px solid #EF4444' }}>
                            <div style={{ fontSize: '14px', color: '#64748B' }}>低通过率岗位预警</div>
                            <div style={{ fontSize: '24px', fontWeight: 800, color: '#EF4444' }}>UI / 产品助理</div>
                            <div style={{ fontSize: '12px', color: '#EF4444' }}>通过率低于 5%，请检查岗位与市场匹配度</div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px', marginBottom: '32px' }}>
                        <ChartCard title="面试环节转化漏斗">
                            <Bar data={interviewFunnelData} options={{ ...commonOptions, indexAxis: 'y' }} />
                        </ChartCard>
                        <ChartCard title="面试官评分一致性分析图">
                            <Radar data={radarData} options={commonOptions} />
                        </ChartCard>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '32px' }}>
                        <ChartCard title="候选人来源与面试结果关联图">
                            <Bar data={sourceOutcomeData} options={{ ...commonOptions, scales: { ...commonOptions.scales, x: { stacked: true }, y: { stacked: true } } }} />
                        </ChartCard>
                        <div className="card">
                            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '24px' }}>评分分布热力图 (面试官 x 维度)</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                                <div style={{ fontSize: '10px', color: '#94A3B8' }}></div>
                                {['技术', '沟通', '潜力', '经验', '态度', '配合'].map(h => <div key={h} style={{ fontSize: '10px', color: '#94A3B8', textAlign: 'center' }}>{h}</div>)}
                                {(vizData?.scoreHeatmap || []).map(row => (
                                    <React.Fragment key={row.name}>
                                        <div style={{ fontSize: '10px', fontWeight: 600 }}>{row.name}</div>
                                        {row.scores.map((v, i) => (
                                            <div key={i} style={{
                                                height: '24px', background: `rgba(255, 138, 61, ${v / 10})`,
                                                borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '10px', color: v > 5 ? 'white' : '#64748B'
                                            }}>{v}</div>
                                        ))}
                                    </React.Fragment>
                                ))}
                            </div>
                            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '10px', color: '#94A3B8' }}>低</span>
                                <div style={{ width: '60px', height: '8px', background: 'linear-gradient(to right, rgba(255,138,61,0.1), rgba(255,138,61,1))', borderRadius: '4px' }}></div>
                                <span style={{ fontSize: '10px', color: '#94A3B8' }}>高</span>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '24px' }}>面试官效率排行榜 (通过率 vs 时间)</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {(vizData?.efficiencyRank || []).map((item, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600 }}>{i + 1}</div>
                                        <div>
                                            <div style={{ fontSize: '14px', fontWeight: 600 }}>{item.name}</div>
                                            <div style={{ fontSize: '12px', color: '#94A3B8' }}>面试总数: {item.count}</div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '14px', fontWeight: 700, color: item.rate > 20 ? '#10B981' : '#FF8A3D' }}>{item.rate}% 通过率</div>
                                        <div style={{ fontSize: '12px', color: '#94A3B8' }}>平均耗时: {item.avgTime}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};
