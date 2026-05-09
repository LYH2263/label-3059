const { db } = require('../db');

/**
 * 记录面试操作审计日志
 * 将面试的每次变更操作记录到interview_logs表中，包含操作人、动作、变更值和时间戳
 * @param {Object} params - 审计日志参数
 * @param {number} params.interviewId - 面试记录ID
 * @param {string} params.operator - 操作人用户名
 * @param {string} params.action - 操作动作描述（如"更新状态"、"提交评价"等）
 * @param {Object} params.changes - 变更内容键值对（如 {status: "已通过", evaluation: "表现优秀"}）
 * @returns {Object} 新创建的审计日志记录
 */
const logInterviewChange = ({ interviewId, operator, action, changes }) => {
    const logEntry = {
        id: Date.now(),
        interviewId,
        operator,
        action,
        changes,
        timestamp: new Date().toISOString()
    };

    db.get('interview_logs').push(logEntry).write();
    return logEntry;
};

module.exports = { logInterviewChange };
