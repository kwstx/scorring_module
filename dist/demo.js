import { DecisionEvaluationFramework } from './DecisionEvaluationFramework.js';
import { RiskScoringEngine } from './RiskScoringEngine.js';
async function main() {
    const framework = new DecisionEvaluationFramework();
    const scoringEngine = new RiskScoringEngine();
    // Imagine an agent proposing to delete a sensitive log file
    const rawAction = {
        agentId: 'agent-alice-001',
        action: 'FILE_DELETE',
        params: {
            path: '/logs/audit.log',
            intent: 'Cleanup old audit records to save disk space'
        },
        context: {
            agentType: 'MAINTENANCE_BOT',
            id: 'ctx-12345',
            delegationChain: ['sys-admin', 'maintenance-service']
        }
    };
    console.log('--- Intercepting and Evaluating Action ---');
    const decisionObject = await framework.evaluateAction(rawAction);
    console.log(`Action ID: ${decisionObject.id}`);
    console.log(`Intent: ${decisionObject.intent}`);
    console.log(`Projected Opportunity Cost of Blocking: $${decisionObject.resourceAnalysis.projectedOpportunityCostOfBlockingUSD}`);
    // Scoring context
    const context = {
        budgetPressure: 0.2,
        dataSensitivity: 0.8, // Sensitive log file!
        historicalComplianceRate: 0.95
    };
    // Current system state
    const systemState = {
        loadFactor: 0.1,
        incidentActive: false,
        regulatoryAlert: false,
        recoveryBacklogSeconds: 0
    };
    console.log('\n--- Scoring Decision via RiskScoringEngine ---');
    const scoreResult = scoringEngine.scoreDecision(decisionObject, context, systemState);
    console.log(`Final Decision Score: ${scoreResult.decisionScore}/100`);
    console.log(`Risk Pressure: ${(scoreResult.riskPressure * 100).toFixed(2)}%`);
    if (decisionObject.complianceForecast) {
        console.log('\n--- Probabilistic Compliance Lifecycle Forecast ---');
        console.log(`Overall Compliance Probability: ${(decisionObject.complianceForecast.overallProbability * 100).toFixed(2)}%`);
        console.log(`Lifecycle States: ${JSON.stringify(decisionObject.complianceForecast.lifecycleStageProbabilities, null, 2)}`);
        console.log(`Primary Risk Drivers: ${decisionObject.complianceForecast.primaryRiskDrivers.join(', ')}`);
        console.log(`Estimated Drift Impact: ${decisionObject.complianceForecast.estimatedDriftImpact.toFixed(4)}`);
    }
    console.log(`Opportunity Projection: ${(scoreResult.breakdown.dimensionScores.opportunityCostProjection * 100).toFixed(2)}%`);
    console.log(`Strategic Misalignment: ${(scoreResult.breakdown.dimensionScores.strategicMisalignment * 100).toFixed(2)}%`);
    if (decisionObject.strategicAlignment) {
        console.log('\n--- Strategic Alignment Assessment ---');
        console.log(`Overall Alignment Score: ${(decisionObject.strategicAlignment.overallAlignmentScore * 100).toFixed(2)}%`);
        console.log(`Misalignment Penalty: ${(decisionObject.strategicAlignment.misalignmentPenalty * 100).toFixed(2)}%`);
        console.log('\nGoal Alignments:');
        for (const goal of decisionObject.strategicAlignment.goalAlignments) {
            console.log(`  [${goal.contribution}] ${goal.goalTitle}: ${goal.alignmentScore.toFixed(4)}`);
            if (goal.matchedAlignmentIndicators.length > 0) {
                console.log(`    + Aligned on: ${goal.matchedAlignmentIndicators.join(', ')}`);
            }
            if (goal.matchedMisalignmentIndicators.length > 0) {
                console.log(`    - Misaligned on: ${goal.matchedMisalignmentIndicators.join(', ')}`);
            }
        }
        console.log('\nInitiative Alignments:');
        for (const init of decisionObject.strategicAlignment.initiativeAlignments) {
            console.log(`  ${init.initiativeName}: synergy=${init.synergyScore.toFixed(4)}, resourceConflict=${init.resourceConflict}`);
        }
        console.log('\nCooperative Impact:');
        for (const coop of decisionObject.strategicAlignment.cooperativeImpactAlignments) {
            console.log(`  ${coop.objectiveTitle}: impact=${coop.impactScore.toFixed(4)}`);
        }
        if (decisionObject.strategicAlignment.alignmentFlags.length > 0) {
            console.log('\nAlignment Flags:');
            for (const flag of decisionObject.strategicAlignment.alignmentFlags) {
                console.log(`  >> ${flag}`);
            }
        }
    }
    console.log('\nDimension Scores:');
    console.log(JSON.stringify(scoreResult.breakdown.dimensionScores, null, 2));
    if (scoreResult.decisionScore < 70) {
        if (scoreResult.breakdown.dimensionScores.opportunityCostProjection > 0.65) {
            console.log('\n[RESULT] ACTION FLAGGED FOR REVIEW (HIGH OPPORTUNITY COST IF BLOCKED)');
        }
        else if (scoreResult.breakdown.dimensionScores.strategicMisalignment > 0.5) {
            console.log('\n[RESULT] ACTION FLAGGED FOR REVIEW (STRATEGIC MISALIGNMENT DETECTED)');
        }
        else {
            console.log('\n[RESULT] ACTION FLAGGED FOR REVIEW');
        }
    }
    else {
        console.log('\n[RESULT] ACTION ALLOWED');
    }
}
main().catch(err => {
    console.error(err);
    process.exit(1);
});
