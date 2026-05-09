/**
 * 审计日志工具
 * 记录面试相关操作的变更历史
 */

/**
 * 计算两个对象之间的差异
 * @param {Object} oldObj - 旧对象
 * @param {Object} newObj - 新对象
 * @returns {Object} 变更详情对象
 */
const computeChanges = (oldObj, newObj) => {
    const changes = {};
    const allKeys = new Set([...Object.keys(oldObj || {}), ...Object.keys(newObj || {})]);

    allKeys.forEach(key => {
        if (key === 'version') return;
        const oldVal = oldObj ? oldObj[key] : undefined;
        const newVal = newObj ? newObj[key] : undefined;
        if (oldVal !== newVal) {
            changes[key] = {
                old: oldVal,
                new: newVal
            };
        }
    });

    return changes;
};

/**
 * 根据变更内容推断操作类型
 * @param {Object} changes - 变更详情对象
 * @returns {string} 操作描述
 */
const inferAction = (changes) => {
    const changedKeys = Object.keys(changes);

    if (changedKeys.length === 0) {
        return '无变更';
    }

    if (changedKeys.includes('status')) {
        const statusChange = changes.status;
        return `状态变更: ${statusChange.old} → ${statusChange.new}`;
    }

    if (changedKeys.includes('evaluation')) {
        return '提交面试评价';
    }

    if (changedKeys.includes('interviewer')) {
        const interviewerChange = changes.interviewer;
        return `调整面试官: ${interviewerChange.old || '未分配'} → ${interviewerChange.new || '未分配'}`;
    }

    return `修改字段: ${changedKeys.join(', ')}`;
};

/**
 * 记录面试变更日志
 * @param {Object} db - lowdb 数据库实例
 * @param {Object} params - 日志参数
 * @param {Object} params.oldInterview - 旧的面试记录
 * @param {Object} params.newInterview - 新的面试记录
 * @param {Object} params.user - 操作用户
 * @param {string} [params.customAction] - 自定义操作描述
 * @returns {Object} 创建的日志记录
 */
const logInterviewChange = (db, { oldInterview, newInterview, user, customAction }) => {
    const changes = computeChanges(oldInterview, newInterview);
    const action = customAction || inferAction(changes);

    const logEntry = {
        id: Date.now() + Math.random().toString(36).substr(2, 9),
        interview_id: newInterview ? newInterview.id : (oldInterview ? oldInterview.id : null),
        operator_id: user ? user.id : null,
        operator_name: user ? user.username : '未知用户',
        operator_role: user ? user.role : '未知角色',
        action: action,
        changes: changes,
        timestamp: new Date().toISOString(),
        timestamp_local: new Date().toLocaleString('zh-CN')
    };

    db.get('interview_logs', []).push(logEntry).write();

    return logEntry;
};

/**
 * 查询指定面试的历史日志
 * @param {Object} db - lowdb 数据库实例
 * @param {number} interviewId - 面试ID
 * @returns {Array} 日志记录数组
 */
const getInterviewLogs = (db, interviewId) => {
    return db
        .get('interview_logs', [])
        .filter({ interview_id: interviewId })
        .sortBy('timestamp')
        .reverse()
        .value();
};

module.exports = {
    logInterviewChange,
    getInterviewLogs,
    computeChanges
};
