import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthAPI } from '../common/api/request';
import { useToast } from '../common/components/Feedback';
import { User, Lock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { showToast } = useToast();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await AuthAPI.login({ username, password });
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            showToast('登录成功！欢迎回来');
            navigate('/');
        } catch (error) {
            showToast(error.message || '登录失败，请检查账号密码', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            width: '100vw', height: '100vh', background: 'var(--bg-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(255, 138, 61, 0.05) 0%, transparent 40%), radial-gradient(circle at 80% 80%, rgba(79, 70, 229, 0.05) 0%, transparent 40%)'
        }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card"
                style={{ width: '100%', maxWidth: '440px', padding: '48px', position: 'relative', overflow: 'hidden' }}
            >
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div style={{
                        width: '64px', height: '64px', background: 'var(--primary)', borderRadius: '18px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px',
                        boxShadow: '0 10px 20px -5px rgba(255, 138, 61, 0.3)'
                    }}>
                        <span style={{ color: 'white', fontSize: '32px', fontWeight: 'bold' }}>O</span>
                    </div>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>桔子招聘后台</h1>
                    <p style={{ color: '#64748B', fontSize: '15px' }}>欢迎使用桔子人力资源管理系统</p>
                </div>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ position: 'relative' }}>
                        <User size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                        <input
                            type="text"
                            placeholder="账号"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            style={{
                                width: '100%', padding: '16px 16px 16px 48px', borderRadius: '14px', border: '1px solid #E2E8F0',
                                fontSize: '15px', background: '#F8FAFC', outline: 'none', transition: '0.2s'
                            }}
                        />
                    </div>
                    <div style={{ position: 'relative' }}>
                        <Lock size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                        <input
                            type="password"
                            placeholder="密码"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{
                                width: '100%', padding: '16px 16px 16px 48px', borderRadius: '14px', border: '1px solid #E2E8F0',
                                fontSize: '15px', background: '#F8FAFC', outline: 'none', transition: '0.2s'
                            }}
                        />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#64748B', cursor: 'pointer' }}>
                            <input type="checkbox" style={{ accentColor: 'var(--primary)' }} /> 记住我
                        </label>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary"
                        style={{
                            width: '100%', height: '56px', borderRadius: '14px', fontSize: '16px', fontWeight: 600,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            marginTop: '12px', background: loading ? '#94A3B8' : 'var(--primary)'
                        }}
                    >
                        {loading ? '正在登录...' : '立即登录'} <ArrowRight size={20} />
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default Login;
