import { DecisionEvaluationFramework } from './DecisionEvaluationFramework.js';
import { RiskScoringEngine } from './RiskScoringEngine.js';
import { ClassificationEngine } from './ClassificationEngine.js';
import { HumanOverrideInterface } from './HumanOverrideInterface.js';
async function main() {
    const framework = new DecisionEvaluationFramework();
    const scoringEngine = new RiskScoringEngine();
    const classificationEngine = new ClassificationEngine(60);
    const overrideInterface = new HumanOverrideInterface(100, 0.04);
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
    // Seed recent history to demonstrate adaptive threshold motion from violation trends.
    const historicalOutcomes = [
        { violated: false },
        { violated: false },
        { violated: true, severity: 0.3 },
        { violated: false },
        { violated: true, severity: 0.5 },
        { violated: true, severity: 0.8 },
        { violated: false },
    ];
    for (const feedback of historicalOutcomes) {
        classificationEngine.recordOutcome(feedback);
    }
    const postureFromSystemState = (systemState.loadFactor * 0.4) +
        (systemState.incidentActive ? 0.35 : 0) +
        (systemState.regulatoryAlert ? 0.25 : 0);
    const classification = classificationEngine.classify(scoreResult, {
        riskPosture: postureFromSystemState,
    });
    console.log('\n--- Adaptive Classification ---');
    console.log(`Threshold Band: block <= ${classification.thresholdBand.blockMax}, auto-approve >= ${classification.thresholdBand.autoApproveMin}`);
    console.log(`Signals: ${JSON.stringify(classification.normalizedSignals)}`);
    console.log(`Shift Magnitude: ${classification.shiftMagnitude}`);
    console.log(`Rationale: ${classification.rationale.join(' | ')}`);
    if (classification.state === 'auto-approve') {
        console.log('\n[RESULT] ACTION AUTO-APPROVED');
    }
    else if (classification.state === 'block') {
        console.log('\n[RESULT] ACTION BLOCKED');
    }
    else if (scoreResult.breakdown.dimensionScores.opportunityCostProjection > 0.65) {
        console.log('\n[RESULT] ACTION FLAGGED FOR REVIEW (HIGH OPPORTUNITY COST IF BLOCKED)');
    }
    else if (scoreResult.breakdown.dimensionScores.strategicMisalignment > 0.5) {
        console.log('\n[RESULT] ACTION FLAGGED FOR REVIEW (STRATEGIC MISALIGNMENT DETECTED)');
    }
    else {
        console.log('\n[RESULT] ACTION FLAGGED FOR REVIEW');
    }
    // ═══════════════════════════════════════════════════════════════════════
    //  HUMAN OVERRIDE INTERFACE DEMONSTRATION
    // ═══════════════════════════════════════════════════════════════════════
    console.log('\n\n========================================');
    console.log('  HUMAN OVERRIDE INTERFACE WORKFLOW');
    console.log('========================================');
    // ── Define Stakeholders ──────────────────────────────────────────────
    const seniorReviewer = {
        id: 'stk-001',
        name: 'Dr. Sarah Chen',
        role: 'Senior Security Architect',
        department: 'Information Security',
        clearance: 'APPROVER',
        expertiseDomains: ['data-governance', 'audit-compliance', 'log-management'],
        active: true,
    };
    const juniorAnalyst = {
        id: 'stk-002',
        name: 'James Rivera',
        role: 'Security Analyst',
        department: 'Information Security',
        clearance: 'REVIEWER',
        expertiseDomains: ['monitoring', 'incident-response'],
        active: true,
    };
    const complianceOfficer = {
        id: 'stk-003',
        name: 'Maria Kowalski',
        role: 'Chief Compliance Officer',
        department: 'Legal & Compliance',
        clearance: 'ADMIN',
        expertiseDomains: ['regulatory-compliance', 'data-retention', 'audit-policy'],
        active: true,
    };
    // ── Scenario 1: Flagged Decision → Create Override Request ───────────
    console.log('\n--- Scenario 1: Creating Override Request for Flagged Decision ---');
    const overrideRequest = overrideInterface.createOverrideRequest(decisionObject, scoreResult, classification);
    console.log(`Request ID: ${overrideRequest.id}`);
    console.log(`Decision ID: ${overrideRequest.decision.id}`);
    console.log(`Flagged At: ${overrideRequest.flaggedAt.toISOString()}`);
    console.log(`Pending Requests: ${overrideInterface.getPendingRequests().length}`);
    // ── Scenario 2: Junior analyst tries to approve → should fail ────────
    console.log('\n--- Scenario 2: Authorization Check (Insufficient Clearance) ---');
    try {
        overrideInterface.submitOverride(overrideRequest.id, juniorAnalyst, 'APPROVED', {
            summary: 'Looks fine to me',
            confidenceLevel: 0.5,
            dimensionDisagreements: [],
            riskAccepted: true,
            conditionalRequirements: [],
        }, [], scoringEngine, classificationEngine);
    }
    catch (err) {
        console.log(`Authorization denied: ${err.message}`);
    }
    // ── Scenario 3: Senior reviewer REJECTS the deletion ─────────────────
    console.log('\n--- Scenario 3: Senior Reviewer Rejects the Decision ---');
    const rejectionAnnotations = [
        overrideInterface.createAnnotation('POLICY_REFERENCE', 'Data Retention Policy DRP-2024-07 requires audit logs to be preserved for a minimum of 7 years.', ['DRP-2024-07', 'SOX-302'], 0.95),
        overrideInterface.createAnnotation('RISK_OBSERVATION', 'Deleting audit.log during an active compliance review cycle would constitute evidence tampering.', ['COMPLIANCE-REVIEW-Q1-2026'], 0.85),
        overrideInterface.createAnnotation('HISTORICAL_PRECEDENT', 'Similar automated cleanup in 2025-Q3 resulted in regulatory inquiry (INC-20250918).', ['INC-20250918', 'POST-MORTEM-2025-09'], 0.7),
    ];
    const rejectionRationale = {
        summary: 'Audit log deletion would violate data retention policies and risk regulatory exposure during active compliance review.',
        confidenceLevel: 0.92,
        dimensionDisagreements: [
            {
                dimension: 'regulatoryExposure',
                stakeholderAssessment: -0.6, // System under-scored the regulatory risk
                justification: 'Active compliance review period was not factored into the automated assessment'
            },
            {
                dimension: 'operationalRisk',
                stakeholderAssessment: 0.3, // System slightly over-scored operational risk
                justification: 'Disk space is not critically low; operational urgency is overstated'
            },
        ],
        riskAccepted: false,
        conditionalRequirements: [],
    };
    const rejectionRecord = overrideInterface.submitOverride(overrideRequest.id, seniorReviewer, 'REJECTED', rejectionRationale, rejectionAnnotations, scoringEngine, classificationEngine);
    // Attach override record to the decision object
    decisionObject.humanOverride = rejectionRecord;
    console.log(`\nOverride Record ID: ${rejectionRecord.id}`);
    console.log(`Verdict: ${rejectionRecord.verdict}`);
    console.log(`Stakeholder: ${rejectionRecord.stakeholder.name} (${rejectionRecord.stakeholder.role})`);
    console.log(`Confidence: ${(rejectionRecord.rationale.confidenceLevel * 100).toFixed(1)}%`);
    console.log(`Annotations: ${rejectionRecord.annotations.length}`);
    console.log(`Review Duration: ${(rejectionRecord.reviewDurationMs / 1000).toFixed(1)}s`);
    console.log('\nDimension Disagreements:');
    for (const d of rejectionRecord.rationale.dimensionDisagreements) {
        const direction = d.stakeholderAssessment > 0 ? 'OVERWEIGHTED' : 'UNDERWEIGHTED';
        console.log(`  ${d.dimension}: ${direction} (${d.stakeholderAssessment.toFixed(2)}) — ${d.justification}`);
    }
    console.log('\nAnnotations:');
    for (const a of rejectionRecord.annotations) {
        console.log(`  [${a.category}] ${a.content}`);
        if (a.references.length > 0) {
            console.log(`    References: ${a.references.join(', ')}`);
        }
    }
    // ── Scenario 4: Second decision → Compliance officer APPROVES with conditions ──
    console.log('\n\n--- Scenario 4: Compliance Officer Approves a Different Action ---');
    const secondAction = {
        agentId: 'agent-bob-002',
        action: 'DATA_EXPORT',
        params: {
            table: 'customer_analytics',
            format: 'csv',
            destination: 'internal-reporting',
            intent: 'Export aggregated analytics for quarterly board report'
        },
        context: {
            agentType: 'REPORTING_BOT',
            id: 'ctx-67890',
            delegationChain: ['cfo', 'data-team-lead']
        }
    };
    const decision2 = await framework.evaluateAction(secondAction);
    const score2 = scoringEngine.scoreDecision(decision2, context, systemState);
    const classification2 = classificationEngine.classify(score2, {
        riskPosture: postureFromSystemState,
    });
    console.log(`Second Decision Score: ${score2.decisionScore}/100`);
    console.log(`Classification: ${classification2.state}`);
    const approvalRequest = overrideInterface.createOverrideRequest(decision2, score2, classification2);
    const approvalAnnotations = [
        overrideInterface.createAnnotation('DOMAIN_CONTEXT', 'Board report deadline is in 48 hours; data is already aggregated and anonymized.', ['BOARD-MEETING-2026-Q1'], 0.8),
        overrideInterface.createAnnotation('COMPLIANCE_NOTE', 'Verified that customer_analytics table contains only aggregated data with no PII.', ['DATA-CLASSIFICATION-AUDIT-2026'], 0.9),
        overrideInterface.createAnnotation('MITIGATION_SUGGESTION', 'Recommend enabling export watermarking and logging destination access for 30 days.', [], 0.6),
    ];
    const approvalRationale = {
        summary: 'Export of aggregated analytics is low-risk and time-sensitive for board reporting.',
        confidenceLevel: 0.88,
        dimensionDisagreements: [
            {
                dimension: 'financialCost',
                stakeholderAssessment: 0.4,
                justification: 'System over-estimated financial risk; export destination is internal with no egress cost'
            },
        ],
        riskAccepted: true,
        conditionalRequirements: [
            'Enable export watermarking on output file',
            'Log all access to the exported file for 30 days',
            'Delete exported file after board meeting concludes',
        ],
    };
    const approvalRecord = overrideInterface.submitOverride(approvalRequest.id, complianceOfficer, 'APPROVED', approvalRationale, approvalAnnotations, scoringEngine, classificationEngine);
    decision2.humanOverride = approvalRecord;
    console.log(`\nOverride Record ID: ${approvalRecord.id}`);
    console.log(`Verdict: ${approvalRecord.verdict}`);
    console.log(`Stakeholder: ${approvalRecord.stakeholder.name} (${approvalRecord.stakeholder.role})`);
    console.log(`Confidence: ${(approvalRecord.rationale.confidenceLevel * 100).toFixed(1)}%`);
    if (approvalRecord.rationale.conditionalRequirements.length > 0) {
        console.log('Conditional Requirements:');
        for (const cond of approvalRecord.rationale.conditionalRequirements) {
            console.log(`  • ${cond}`);
        }
    }
    // ── Scenario 5: Adaptation Signal ────────────────────────────────────
    console.log('\n\n--- Override Adaptation Signal ---');
    const signal = overrideInterface.computeAdaptationSignal();
    console.log(`Sample Size: ${signal.sampleSize}`);
    console.log(`Approval Rate: ${(signal.approvalRate * 100).toFixed(1)}%`);
    console.log(`Rejection Rate: ${(signal.rejectionRate * 100).toFixed(1)}%`);
    console.log(`Average Confidence: ${(signal.averageConfidence * 100).toFixed(1)}%`);
    console.log(`Average Review Duration: ${(signal.averageReviewDurationMs / 1000).toFixed(1)}s`);
    console.log(`Conditional Approval Rate: ${(signal.conditionalApprovalRate * 100).toFixed(1)}%`);
    console.log('Weighted Dimension Disagreements:');
    for (const [dim, score] of Object.entries(signal.weightedDimensionDisagreements)) {
        const direction = score > 0 ? 'system overweighted' : 'system underweighted';
        console.log(`  ${dim}: ${score.toFixed(4)} (${direction})`);
    }
    // ── Verdict Distribution ─────────────────────────────────────────────
    console.log('\n--- Verdict Distribution ---');
    const dist = overrideInterface.getVerdictDistribution();
    console.log(`  APPROVED: ${dist.APPROVED}`);
    console.log(`  REJECTED: ${dist.REJECTED}`);
    console.log(`  ESCALATED: ${dist.ESCALATED}`);
    // ── Post-Override Scoring Impact ─────────────────────────────────────
    console.log('\n--- Post-Override Scoring Recalibration ---');
    const recalibratedScore = scoringEngine.scoreDecision(decisionObject, context, systemState);
    console.log(`Original Decision Score:     ${scoreResult.decisionScore}/100`);
    console.log(`Recalibrated Decision Score: ${recalibratedScore.decisionScore}/100`);
    console.log(`Score Shift: ${(recalibratedScore.decisionScore - scoreResult.decisionScore).toFixed(2)} points`);
    console.log('(Override feedback has adjusted the engine\'s adaptive multipliers)');
}
main().catch(err => {
    console.error(err);
    process.exit(1);
});
