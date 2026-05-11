const { db } = require('../db');

const VALID_STATUS_TRANSITIONS = {
    '待开始': ['进行中'],
    '进行中': ['已通过', '未通过', '进行中'],
    '已通过': [],
    '未通过': []
};

/**
 * 乐观锁中间件
 * 验证请求中的 version 字段与数据库中的版本号是否匹配
 * 不匹配则返回 409 冲突错误
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 * @param {Function} next - 下一个中间件函数
 */
const optimisticLockMiddleware = (req, res, next) => {
    const interviewId = parseInt(req.params.id);
    const requestVersion = req.body.version;

    if (requestVersion === undefined) {
        return res.status(400).json({
            message: '缺少版本号',
            solution: '请在请求体中包含 version 字段以确保数据一致性'
        });
    }

    const interview = db.get('interviews').find({ id: interviewId }).value();

    if (!interview) {
        return res.status(404).json({ message: '面试记录不存在' });
    }

    const currentVersion = interview.version || 1;

    if (requestVersion !== currentVersion) {
        return res.status(409).json({
            message: '数据冲突：该面试记录已被其他用户修改',
            solution: '请刷新页面获取最新数据后再尝试修改',
            currentVersion: currentVersion,
            requestVersion: requestVersion
        });
    }

    req.currentInterview = interview;
    next();
};

/**
 * 状态转换验证中间件
 * 验证面试状态转换是否符合状态机规则
 * 只允许 "待开始→进行中→已通过/未通过" 的单向转换
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 * @param {Function} next - 下一个中间件函数
 */
const validateStatusTransition = (req, res, next) => {
    const { status } = req.body;

    if (!status) {
        return next();
    }

    const currentInterview = req.currentInterview;
    const currentStatus = currentInterview.status || '待开始';

    if (status === currentStatus) {
        return next();
    }

    const allowedTransitions = VALID_STATUS_TRANSITIONS[currentStatus] || [];

    if (!allowedTransitions.includes(status)) {
        return res.status(400).json({
            message: `状态转换不允许：无法从 "${currentStatus}" 转换为 "${status}"`,
            solution: `当前状态 "${currentStatus}" 只允许转换为: ${allowedTransitions.length > 0 ? allowedTransitions.join('、') : '无（终态）'}`,
            currentStatus: currentStatus,
            requestedStatus: status
        });
    }

    next();
};

/**
 * 部分更新工具函数
 * 只更新请求中明确指定的字段，避免覆盖整个对象
 * @param {Object} existingData - 数据库中的现有数据
 * @param {Object} updateData - 请求中的更新数据
 * @returns {Object} - 合并后的更新数据
 */
const applyPartialUpdate = (existingData, updateData) => {
    const allowedFields = [
        'name', 'job', 'time', 'type', 'status',
        'interviewer', 'evaluation', 'roomId', 'remark'
    ];

    const result = { ...existingData };

    allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
            result[field] = updateData[field];
        }
    });

    result.version = (existingData.version || 1) + 1;
    result.updatedAt = new Date().toISOString();

    return result;
};

module.exports = {
    optimisticLockMiddleware,
    validateStatusTransition,
    applyPartialUpdate,
    VALID_STATUS_TRANSITIONS
};
