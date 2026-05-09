import React, { useState, useEffect, createContext, useContext } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = (message, type = 'success') => {
        const id = Date.now();
        setToasts([...toasts, { id, message, type }]);
        setTimeout(() => {
            setToasts(current => current.filter(t => t.id !== id));
        }, 3000);
    };

    const removeToast = (id) => {
        setToasts(current => current.filter(t => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {createPortal(
                <div className="toast-container" style={{
                    position: 'fixed', top: '24px', right: '24px', zIndex: 9999,
                    display: 'flex', flexDirection: 'column', gap: '12px'
                }}>
                    <AnimatePresence>
                        {toasts.map(toast => (
                            <motion.div
                                key={toast.id}
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 50 }}
                                className={`toast-item ${toast.type}`}
                                style={{
                                    padding: '12px 20px', borderRadius: '12px', background: 'white',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '12px',
                                    minWidth: '240px', borderLeft: `4px solid ${toast.type === 'success' ? '#10B981' : toast.type === 'error' ? '#EF4444' : '#FF8A3D'}`
                                }}
                            >
                                {toast.type === 'success' && <CheckCircle size={20} color="#10B981" />}
                                {toast.type === 'error' && <AlertCircle size={20} color="#EF4444" />}
                                {toast.type === 'info' && <Info size={20} color="#3B82F6" />}
                                <span style={{ fontSize: '14px', fontWeight: 500, color: '#334155' }}>{toast.message}</span>
                                <button
                                    onClick={() => removeToast(toast.id)}
                                    style={{ background: 'none', marginLeft: 'auto', padding: '4px', display: 'flex' }}
                                >
                                    <X size={16} color="#94A3B8" />
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>,
                document.body
            )}
        </ToastContext.Provider>
    );
};

export const useToast = () => useContext(ToastContext);

export const Modal = ({ onClose, title, children, footer, size = 'medium' }) => {
    const sizes = {
        small: '400px',
        medium: '600px',
        large: '900px',
        full: '95%'
    };

    return createPortal(
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{
                    background: 'white', borderRadius: '24px', width: '100%', maxWidth: sizes[size],
                    maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden',
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
                }}
            >
                <div style={{ padding: '24px 32px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 600 }}>{title}</h3>
                    <button onClick={onClose} style={{ background: 'none', padding: '8px' }}>
                        <X size={20} />
                    </button>
                </div>
                <div style={{ padding: '32px', overflowY: 'auto', flex: 1 }}>
                    {children}
                </div>
                {footer && (
                    <div style={{ padding: '20px 32px', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                        {footer}
                    </div>
                )}
            </motion.div>
        </div>,
        document.body
    );
};
