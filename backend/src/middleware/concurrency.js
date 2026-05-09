/**
 * 并发控制中间件
 * 实现乐观锁和状态机验证
 */

/**
 * 允许的状态转换矩阵
 * 键: 当前状态
 * 值: 允许转换到的状态数组
 */
const ALLOWED_TRANSITIONS = {
    '待开始': ['进行中'],
    '进行中': ['已通过', '未通过'],
    '已通过': [],
    '未通过': [],
    '已结束': []
};

/**
 * 乐观锁中间件
 * 验证请求中的 version 与数据库中的 version 是否匹配
 * @param {Object} db - lowdb 数据库实例
 * @returns {Function} Express 中间件
 */
const optimisticLockMiddleware = (db) => (req, res, next) => {
    const interviewId = parseInt(req.params.id);
    const current = db.get('interviews').find({ id: interviewId }).value();

    if (!current) {
        return res.status(404).json({
            message: '面试记录不存在',
            solution: '请刷新页面后重试'
        });
    }

    const requestVersion = req.body.version;
    const dbVersion = current.version || 0;

    if (requestVersion === undefined) {
        return res.status(400).json({
            message: '缺少 version 字段',
            solution: '请确保前端请求包含当前数据的 version 字段'
        });
    }

    if (requestVersion !== dbVersion) {
        return res.status(409).json({
            message: '数据已被其他用户修改',
            solution: '请刷新页面获取最新数据后再操作',
            currentVersion: dbVersion,
            requestedVersion: requestVersion,
            latestData: current
        });
    }

    req.oldInterview = { ...current };
    next();
};

/**
 * 状态转换验证中间件
 * 验证状态转换是否符合业务流程
 * @param {Object} db - lowdb 数据库实例
 * @returns {Function} Express 中间件
 */
const validateStatusTransition = (db) => (req, res, next) => {
    const interviewId = parseInt(req.params.id);
    const current = db.get('interviews').find({ id: interviewId }).value();

    if (!current) {
        return res.status(404).json({
            message: '面试记录不存在',
            solution: '请刷新页面后重试'
        });
    }

    const newStatus = req.body.status;
    const currentStatus = current.status;

    if (newStatus && newStatus !== currentStatus) {
        const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];

        if (!allowed.includes(newStatus)) {
            return res.status(400).json({
                message: `状态转换不允许: ${currentStatus} → ${newStatus}`,
                solution: `当前状态 ${currentStatus} 仅允许转换到: ${allowed.length ? allowed.join('、') : '无 (终端状态)'}`,
                currentStatus,
                requestedStatus: newStatus,
                allowedTransitions: allowed
            });
        }
    }

    next();
};

module.exports = {
    optimisticLockMiddleware,
    validateStatusTransition,
    ALLOWED_TRANSITIONS
};
