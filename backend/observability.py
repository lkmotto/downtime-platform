"""OpenTelemetry + Langfuse observability scaffolding.

Call ``init_observability("<agent-name>")`` once at startup. Every LLM call wrapped
in ``@traced`` (or manually with ``tracer.start_as_current_span``) is then visible
in Langfuse with cost, latency, prompt, and completion.
"""

from __future__ import annotations

import base64
import os

from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor


def _auth_header() -> dict[str, str]:
    """Build Basic auth header from Langfuse credentials if both are set."""
    pk = os.getenv("LANGFUSE_PUBLIC_KEY")
    sk = os.getenv("LANGFUSE_SECRET_KEY")
    if not pk or not sk:
        return {}
    pair = f"{pk}:{sk}"
    encoded = base64.b64encode(pair.encode()).decode()
    return {"Authorization": f"Basic {encoded}"}


def init_observability(service_name: str) -> trace.Tracer:
    """Initialize OTel tracing pointed at Langfuse. Idempotent."""
    if trace.get_tracer_provider().__class__.__name__ == "TracerProvider":
        return trace.get_tracer(service_name)

    endpoint = os.getenv(
        "LANGFUSE_OTEL_ENDPOINT",
        "https://us.cloud.langfuse.com/api/public/otel/v1/traces",
    )

    provider = TracerProvider(resource=Resource.create({"service.name": service_name}))
    exporter = OTLPSpanExporter(endpoint=endpoint, headers=_auth_header())
    provider.add_span_processor(BatchSpanProcessor(exporter))
    trace.set_tracer_provider(provider)
    return trace.get_tracer(service_name)
