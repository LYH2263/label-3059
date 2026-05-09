const { db } = require('../db');

const VALID_TRANSITIONS = {
    '待开始': ['进行中'],
    '进行中': ['已通过', '未通过'],
    '已通过': [],
    '未通过': []
};

/**
 * 乐观锁中间件 - 验证请求中的version字段与数据库中的version是否匹配
 * 如果版本不匹配，返回409冲突错误，防止并发修改导致数据覆盖
 * 匹配成功后自动将version+1，并将当前面试记录挂载到req.interview上
 * @param {import('express').Request} req - Express请求对象，需要包含params.id和body.version
 * @param {import('express').Response} res - Express响应对象
 * @param {import('express').NextFunction} next - Express下一个中间件函数
 */
const optimisticLockMiddleware = (req, res, next) => {
    const interviewId = parseInt(req.params.id);
    const current = db.get('interviews').find({ id: interviewId }).value();

    if (!current) {
        return res.status(404).json({
            message: '面试记录不存在，请刷新页面后重试',
            solution: '该面试可能已被其他用户删除，请重新获取面试列表'
        });
    }

    if (req.body.version === undefined) {
        return res.status(400).json({
            message: '缺少version字段，请携带当前数据的version进行更新',
            solution: '请先获取最新数据，并在提交时携带version字段'
        });
    }

    if (req.body.version !== current.version) {
        return res.status(409).json({
            message: `数据冲突：该面试记录已被其他用户修改（当前版本:${current.version}，您提交的版本:${req.body.version}）`,
            solution: '请刷新页面获取最新数据后重新操作',
            currentVersion: current.version,
            currentData: current
        });
    }

    req.interview = current;
    next();
};

/**
 * 状态转换验证中间件 - 检查面试状态转换是否符合业务规则
 * 允许的转换路径：待开始→进行中→已通过/未通过
 * 禁止逆向转换（如已通过→进行中）和非法跳转
 * @param {import('express').Request} req - Express请求对象，需要包含body.status和req.interview
 * @param {import('express').Response} res - Express响应对象
 * @param {import('express').NextFunction} next - Express下一个中间件函数
 */
const validateStatusTransition = (req, res, next) => {
    const newStatus = req.body.status;

    if (newStatus === undefined) {
        return next();
    }

    const currentStatus = req.interview.status;
    const allowedNext = VALID_TRANSITIONS[currentStatus];

    if (!allowedNext) {
        return res.status(400).json({
            message: `当前状态"${currentStatus}"不是有效的面试状态`,
            solution: '请联系管理员检查数据完整性'
        });
    }

    if (!allowedNext.includes(newStatus)) {
        return res.status(400).json({
            message: `不允许从"${currentStatus}"转换为"${newStatus}"，允许的转换为：${allowedNext.length > 0 ? allowedNext.map(s => `"${currentStatus}"→"${s}"`).join('、') : '当前状态为终态，不可变更'}`,
            solution: currentStatus === '已通过' || currentStatus === '未通过'
                ? '面试已结束，状态不可回退。如需修改请联系管理员'
                : `请按正确流程操作：${allowedNext.map(s => `"${currentStatus}"→"${s}"`).join(' → ')}`
        });
    }

    next();
};

module.exports = { optimisticLockMiddleware, validateStatusTransition };
