import express from 'express';
const router = express.Router({});

router.get('/', async (_req, res, _next) => {
    try {
        res.sendStatus(200);
    } catch (e) {
        res.status(503).send();
    }
})

export default router;
