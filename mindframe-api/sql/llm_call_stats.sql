-- Phase 0 baseline: per-task cost and latency from llm_calls over the last 7 days.
-- Each row is one attempt (retries included), so total_cost_usd is what was actually billed.
SELECT
    task,
    model,
    COUNT(*) AS attempts,
    COUNT(*) FILTER (WHERE status <> 'success') AS failed_attempts,
    ROUND(AVG(cost_usd), 6) AS avg_cost_per_attempt,
    ROUND(SUM(cost_usd), 4) AS total_cost_usd,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY latency_ms) AS p50_latency_ms,
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY latency_ms) AS p95_latency_ms
FROM llm_calls
WHERE created_at > now() - interval '7 days'
GROUP BY task, model
ORDER BY task, model;
