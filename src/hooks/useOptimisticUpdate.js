import { useState, useCallback } from 'react';

/**
 * 乐观更新Hook
 * 处理并发冲突，当收到409错误时自动提示用户并提供刷新机制
 * @param {Function} updateFn - 实际执行更新的API函数
 * @param {Function} onSuccess - 更新成功后的回调函数
 * @param {Function} onError - 更新失败后的回调函数
 * @returns {Object} - 包含更新函数、加载状态和冲突状态
 */
export const useOptimisticUpdate = (updateFn, onSuccess, onError) => {
    const [isLoading, setIsLoading] = useState(false);
    const [conflict, setConflict] = useState(null);

    /**
     * 执行更新操作
     * @param {number} id - 记录ID
     * @param {Object} data - 更新数据（必须包含version字段）
     * @param {Object} options - 选项
     */
    const executeUpdate = useCallback(async (id, data, options = {}) => {
        setIsLoading(true);
        setConflict(null);

        try {
            const result = await updateFn(id, data);
            setIsLoading(false);
            if (onSuccess) onSuccess(result);
            return result;
        } catch (error) {
            setIsLoading(false);

            if (error.message && (
                error.message.includes('冲突') ||
                error.message.includes('数据') ||
                error.message.includes('version')
            )) {
                setConflict({
                    id,
                    message: error.message,
                    solution: error.solution || '请刷新页面获取最新数据',
                    timestamp: Date.now()
                });
            }

            if (onError) onError(error);
            throw error;
        }
    }, [updateFn, onSuccess, onError]);

    /**
     * 清除冲突状态
     */
    const clearConflict = useCallback(() => {
        setConflict(null);
    }, []);

    /**
     * 获取冲突提示信息
     * @returns {Object|null} - 冲突信息
     */
    const getConflictInfo = useCallback(() => {
        if (!conflict) return null;
        return {
            title: '⚠️ 数据冲突',
            message: conflict.message,
            solution: conflict.solution,
            actionText: '刷新数据',
            isConflict: true
        };
    }, [conflict]);

    return {
        executeUpdate,
        isLoading,
        conflict,
        clearConflict,
        getConflictInfo,
        hasConflict: !!conflict
    };
};

export default useOptimisticUpdate;
