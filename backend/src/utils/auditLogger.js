const { db } = require('../db');

/**
 * 记录面试操作的审计日志
 * 将所有对面试记录的修改操作记录到 interview_logs 表
 * @param {Object} options - 日志选项
 * @param {number} options.interviewId - 面试记录ID
 * @param {Object} options.user - 操作用户信息 (从JWT token中获取)
 * @param {string} options.action - 操作类型 (create, update_status, update_interviewer, update_evaluation, delete等)
 * @param {Object} options.oldValue - 修改前的值
 * @param {Object} options.newValue - 修改后的值
 * @param {Array} options.changedFields - 变更的字段列表
 * @returns {Object} - 创建的日志记录
 */
const logInterviewChange = ({
    interviewId,
    user,
    action,
    oldValue = {},
    newValue = {},
    changedFields = []
}) => {
    const logEntry = {
        id: Date.now(),
        interviewId,
        userId: user?.id,
        username: user?.username,
        realName: user?.real_name,
        action,
        oldValue: JSON.stringify(oldValue),
        newValue: JSON.stringify(newValue),
        changedFields: changedFields.join(','),
        timestamp: new Date().toISOString(),
        ip: '127.0.0.1'
    };

    db.get('interview_logs', []).push(logEntry).write();

    return logEntry;
};

/**
 * 获取面试记录的所有审计日志
 * @param {number} interviewId - 面试记录ID
 * @returns {Array} - 日志记录列表
 */
const getInterviewLogs = (interviewId) => {
    return db.get('interview_logs', [])
        .filter({ interviewId: parseInt(interviewId) })
        .sortBy('timestamp')
        .reverse()
        .value();
};

/**
 * 计算两个对象之间的差异字段
 * @param {Object} oldObj - 旧对象
 * @param {Object} newObj - 新对象
 * @returns {Array} - 变更的字段列表
 */
const calculateChangedFields = (oldObj, newObj) => {
    const changedFields = [];
    const allKeys = new Set([...Object.keys(oldObj || {}), ...Object.keys(newObj || {})]);

    allKeys.forEach(key => {
        if (oldObj[key] !== newObj[key]) {
            changedFields.push(key);
        }
    });

    return changedFields;
};

/**
 * 根据变更内容推断操作类型
 * @param {Array} changedFields - 变更的字段列表
 * @param {Object} oldValue - 旧值
 * @param {Object} newValue - 新值
 * @returns {string} - 操作类型描述
 */
const inferActionType = (changedFields, oldValue, newValue) => {
    if (changedFields.includes('status') && oldValue.status !== newValue.status) {
        return `状态变更: ${oldValue.status} → ${newValue.status}`;
    }
    if (changedFields.includes('interviewer') && oldValue.interviewer !== newValue.interviewer) {
        return `面试官调整: ${oldValue.interviewer || '未分配'} → ${newValue.interviewer || '未分配'}`;
    }
    if (changedFields.includes('evaluation')) {
        return '提交面试评价';
    }
    if (changedFields.length > 0) {
        return `更新字段: ${changedFields.join(', ')}`;
    }
    return '更新面试记录';
};

module.exports = {
    logInterviewChange,
    getInterviewLogs,
    calculateChangedFields,
    inferActionType
};
