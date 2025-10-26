#!/bin/bash

export GEMINI_API_KEY="AIzaSyABs7eYV-knan701Tyz27YxLLZfoiJ8enE"

# Start each agent in the background with its own log file
cd ~/Programming/Growcery/agents/classifying_agent && python classification_agent.py > ../logs/classification.log 2>&1 &
cd ~/Programming/Growcery/agents/attribute_agent && python attribute_agent.py > ../logs/attribute.log 2>&1 &
cd ~/Programming/Growcery/agents/health_agent && python health_agent.py > ../logs/health.log 2>&1 &
cd ~/Programming/Growcery/agents/storage_agent && python storage_agent.py > ../logs/storage.log 2>&1 &
cd ~/Programming/Growcery/agents/treatment_agent && python treatment_agent.py > ../logs/treatment.log 2>&1 &
cd ~/Programming/Growcery/agents/date_agent && python date_agent.py > ../logs/date.log 2>&1 &
cd ~/Programming/Growcery/agents/physical_agent && python physical_agent.py > ../logs/physical.log 2>&1 &
cd ~/Programming/Growcery/agents/orchestrator_agent && python orchestrator_agent.py > ../logs/orchestrator.log 2>&1 &

echo "All agents started! Check logs in ~/Programming/Growcery/agents/logs/"
echo "To stop all agents: pkill -f 'python.*agent.py'"