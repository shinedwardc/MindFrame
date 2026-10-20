from sqlalchemy import Column, Integer, Numeric, String, DateTime
from sqlalchemy.sql import func
from db.base import Base

# One row per model request (each attempt, including retries). Numbers and labels only:
# never store prompt or response text here.
class LLMCall(Base):
    __tablename__ = "llm_calls"

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    task = Column(String, nullable=False, index=True)
    model = Column(String, nullable=False)
    # success | invalid_output | refusal | truncated | error
    status = Column(String, nullable=False)
    error_type = Column(String)
    input_tokens = Column(Integer, nullable=False, server_default='0')
    output_tokens = Column(Integer, nullable=False, server_default='0')
    latency_ms = Column(Integer, nullable=False)
    # NULL when the model has no entry in llm_service.PRICES_PER_MTOK.
    cost_usd = Column(Numeric(12, 8))
