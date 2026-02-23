import type { DecisionObject } from './DecisionObject.js';

export interface SimulationResult {
    realWorldTaskImpact: number;
    predictiveSynergyDensity: number;
    trustWeightedInfluencePropagation: number;
    cooperativeIntelligenceEvolution: number;
}

/**
 * ImpactSimulationModule runs lightweight forward simulations to estimate
 * the downstream consequences of a proposed action.
 */
export class ImpactSimulationModule {
    /**
     * Executes a series of forward-looking simulations for a given decision.
     */
    public simulate(decision: Partial<DecisionObject>): SimulationResult {
        // In a real implementation, this might query a world model or run Monte Carlo simulations.
        // Here we use heuristic-based estimation of downstream effects.

        const realWorldTaskImpact = this.simulateTaskImpact(decision);
        const synergyDensity = this.simulateSynergy(decision);
        const trustPropagation = this.simulateTrustPropagation(decision);
        const intelligenceEvolution = this.simulateIntelligenceEvolution(decision, synergyDensity);

        return {
            realWorldTaskImpact,
            predictiveSynergyDensity: synergyDensity,
            trustWeightedInfluencePropagation: trustPropagation,
            cooperativeIntelligenceEvolution: intelligenceEvolution
        };
    }

    private simulateTaskImpact(decision: Partial<DecisionObject>): number {
        // High resource requirement with LOW criticality often suggests wasteful task impact.
        const totalResources = decision.requiredResources?.reduce((acc, r) => acc + r.amount, 0) || 0;
        const avgCriticality = decision.requiredResources?.length
            ? decision.requiredResources.reduce((acc, r) => acc + (r.criticality === 'HIGH' ? 1 : r.criticality === 'MEDIUM' ? 0.5 : 0.1), 0) / decision.requiredResources.length
            : 0.5;

        // If intent is vague, task impact is likely lower or more risky.
        const intentClarity = (decision.intent?.length || 0) > 20 ? 0.8 : 0.4;

        let impact = (avgCriticality * 0.6) + (intentClarity * 0.4);

        // Penalize for excessive resource use without clear goal
        if (totalResources > 1000 && intentClarity < 0.5) {
            impact -= 0.3;
        }

        return Math.min(Math.max(impact, -1.0), 1.0);
    }

    private simulateSynergy(decision: Partial<DecisionObject>): number {
        // Synergy density increases when permissions are multi-layered (suggesting integration).
        const permissions = decision.authorityScope?.permissions?.length || 0;
        const layers = decision.authorityScope?.layer ? 1 : 0;

        let synergy = (permissions * 0.1) + (layers * 0.2);

        // Random "system noise" to simulate dynamic environments
        synergy += (Math.random() * 0.2) - 0.1;

        return Math.min(Math.max(synergy, 0.0), 1.0);
    }

    private simulateTrustPropagation(decision: Partial<DecisionObject>): number {
        // Trust propagates better if there's a clear delegation chain.
        const delegationLength = decision.authorityScope?.delegationChain?.length || 0;
        const baseTrust = 0.5;

        let propagation = baseTrust + (delegationLength * 0.1);

        // High policy exposure levels reduce trust propagation.
        const totalExposure = decision.policyExposure?.reduce((acc, p) => acc + p.exposureLevel, 0) || 0;
        propagation -= (totalExposure * 0.2);

        return Math.min(Math.max(propagation, -1.0), 1.0);
    }

    private simulateIntelligenceEvolution(decision: Partial<DecisionObject>, synergy: number): number {
        // Cooperative intelligence evolves when synergy is high and stability is maintained.
        const stability = decision.projectedImpact?.systemStabilityScore ?? 0.5;

        let evolution = (synergy * 0.5) + (stability * 0.5);

        // If the action is a "WRITE" or "ADMIN" action, it has more potential to change 
        // the system's "intelligence" (state/policies), both positively and negatively.
        const isImpactfulPermission = decision.authorityScope?.permissions?.some(p =>
            ['WRITE', 'ADMIN', 'EXECUTE'].includes(p.toUpperCase())
        );

        if (isImpactfulPermission) {
            evolution *= 1.2;
        }

        return Math.min(Math.max(evolution, -1.0), 1.0);
    }
}
