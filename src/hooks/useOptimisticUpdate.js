import { useState, useCallback } from 'react';
import { InterviewAPI } from '../common/api/request';

/**
 * 乐观更新Hook - 处理面试数据的并发更新冲突
 * 当服务端返回409冲突错误时，自动提示用户并重新获取最新数据
 * 支持自定义冲突回调和成功回调，确保前端数据与后端始终一致
 * @param {Object} options - Hook配置选项
 * @param {Function} [options.onConflict] - 冲突回调函数，接收冲突信息对象 {message, solution, currentData}
 * @param {Function} [options.onSuccess] - 成功回调函数，接收更新后的数据
 * @param {Function} [options.onRefresh] - 数据刷新回调函数，用于重新获取列表数据
 * @returns {Object} 包含update函数、loading状态和冲突信息的对象
 */
export const useOptimisticUpdate = ({ onConflict, onSuccess, onRefresh } = {}) => {
    const [loading, setLoading] = useState(false);
    const [conflictInfo, setConflictInfo] = useState(null);

    const update = useCallback(async (id, updateData, currentVersion) => {
        setLoading(true);
        setConflictInfo(null);

        try {
            const result = await InterviewAPI.update(id, {
                ...updateData,
                version: currentVersion
            });
            if (onSuccess) onSuccess(result);
            return result;
        } catch (error) {
            const isConflict = error.status === 409 || (error.message && error.message.includes('冲突'));
            const isStatusError = error.status === 400 && (error.message && (error.message.includes('不允许') || error.message.includes('不可变更')));

            if (isConflict) {
                const conflict = {
                    message: error.message,
                    solution: error.solution || '其他用户已修改了该数据，请刷新后重试',
                    currentData: error.currentData,
                    timestamp: new Date().toISOString()
                };
                setConflictInfo(conflict);
                if (onConflict) onConflict(conflict);
                if (onRefresh) onRefresh();
                throw error;
            }
            if (isStatusError) {
                const statusError = {
                    message: error.message,
                    solution: error.solution || '请按照正确的状态流程操作',
                    timestamp: new Date().toISOString()
                };
                setConflictInfo(statusError);
                throw error;
            }
            throw error;
        } finally {
            setLoading(false);
        }
    }, [onConflict, onSuccess, onRefresh]);

    const clearConflict = useCallback(() => {
        setConflictInfo(null);
    }, []);

    return { update, loading, conflictInfo, clearConflict };
};
