import { useState, useCallback } from 'react';

/**
 * 乐观更新 Hook
 * 处理并发冲突、状态转换错误等场景
 * @param {Function} fetchData - 数据刷新函数
 * @param {Function} showToast - Toast 提示函数
 * @returns {Object} 包含 update 方法和 loading 状态
 */
export const useOptimisticUpdate = (fetchData, showToast) => {
    const [loading, setLoading] = useState(false);
    const [conflictModal, setConflictModal] = useState(null);

    /**
     * 执行更新操作，自动处理冲突和错误
     * @param {Function} updateFn - 实际的更新函数
     * @param {Object} currentItem - 当前操作的数据项（需包含 version）
     * @param {Object} updateData - 要更新的数据
     * @param {Object} [options] - 选项
     * @param {string} [options.successMessage] - 成功提示消息
     * @param {string} [options.retryMessage] - 冲突提示消息前缀
     * @returns {Promise<boolean>} 是否成功
     */
    const update = useCallback(async (updateFn, currentItem, updateData, options = {}) => {
        const {
            successMessage = '操作成功',
            retryMessage = '检测到并发冲突'
        } = options;

        setLoading(true);
        setConflictModal(null);

        try {
            const dataToSend = {
                ...updateData,
                version: currentItem ? currentItem.version : 0
            };

            const result = await updateFn(dataToSend);

            if (showToast) {
                showToast(successMessage);
            }

            if (fetchData) {
                await fetchData();
            }

            setLoading(false);
            return { success: true, result };
        } catch (error) {
            setLoading(false);

            const message = error.message || '操作失败';
            const isConflict = error.message && error.message.includes('已被其他用户修改');
            const isStatusError = error.message && error.message.includes('状态转换不允许');

            if (isConflict && showToast) {
                showToast(`${retryMessage}：${message}`, 'error');
                setConflictModal({
                    type: 'conflict',
                    message,
                    item: currentItem,
                    retry: () => update(updateFn, currentItem, updateData, options)
                });
            } else if (isStatusError && showToast) {
                showToast(`状态错误：${message}`, 'error');
                setConflictModal({
                    type: 'status',
                    message,
                    item: currentItem
                });
            } else if (showToast) {
                showToast(message, 'error');
            }

            if (fetchData && (isConflict || isStatusError)) {
                await fetchData();
            }

            return {
                success: false,
                error,
                isConflict,
                isStatusError
            };
        }
    }, [fetchData, showToast]);

    const refreshAndRetry = useCallback(async () => {
        if (fetchData) {
            await fetchData();
        }
        if (conflictModal && conflictModal.retry) {
            await conflictModal.retry();
        }
    }, [conflictModal, fetchData]);

    return {
        update,
        loading,
        conflictModal,
        setConflictModal,
        refreshAndRetry
    };
};

export default useOptimisticUpdate;
