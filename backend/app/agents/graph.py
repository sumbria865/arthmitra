"""
ArthMitra — LangGraph Agent Graph
DAG: Language Detection → Orchestrator → [Scam|Benefits|Coach|Literacy] → Accessibility → END
"""

from langgraph.graph import StateGraph, START, END
from .state import AgentState
from .nodes import (
    detect_language_node,
    orchestrator_node,
    scam_guardian_node,
    benefits_navigator_node,
    behavioural_coach_node,
    literacy_agent_node,
    accessibility_node,
    route_to_agent,
)


def build_arthmitra_graph() -> StateGraph:
    """Build and compile the ArthMitra multi-agent LangGraph."""

    graph = StateGraph(AgentState)

    # Add all nodes
    graph.add_node("language_detection", detect_language_node)
    graph.add_node("orchestrator", orchestrator_node)
    graph.add_node("scam_guardian", scam_guardian_node)
    graph.add_node("benefits_navigator", benefits_navigator_node)
    graph.add_node("behavioural_coach", behavioural_coach_node)
    graph.add_node("literacy_agent", literacy_agent_node)
    graph.add_node("accessibility", accessibility_node)

    # Entry point
    graph.add_edge(START, "language_detection")
    graph.add_edge("language_detection", "orchestrator")

    # Conditional routing from orchestrator
    graph.add_conditional_edges(
        "orchestrator",
        route_to_agent,
        {
            "scam_guardian": "scam_guardian",
            "benefits_navigator": "benefits_navigator",
            "behavioural_coach": "behavioural_coach",
            "literacy_agent": "literacy_agent",
        }
    )

    # All specialist agents flow through accessibility post-processor
    for agent in ["scam_guardian", "benefits_navigator", "behavioural_coach", "literacy_agent"]:
        graph.add_edge(agent, "accessibility")

    graph.add_edge("accessibility", END)

    return graph.compile()


# Compiled graph — import this in API routes
arthmitra_graph = build_arthmitra_graph()