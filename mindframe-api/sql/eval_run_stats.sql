-- Per-task cost and latency for one eval run. Pass the run id as a psql variable:
--   psql ... -v run_id=<eval_run_id> < sql/eval_run_stats.sql
SELECT
    task,
    model,
    COUNT(*) AS attempts,
    COUNT(*) FILTER (WHERE status <> 'success') AS failed_attempts,
    ROUND(SUM(cost_usd), 4) AS total_cost_usd,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY latency_ms) AS p50_latency_ms,
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY latency_ms) AS p95_latency_ms
FROM llm_calls
WHERE eval_run_id = :'run_id'
GROUP BY task, model
ORDER BY task, model;
