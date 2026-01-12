// Calculation Engine
// Performs all financial calculations for products

// Calculate all costs and margins for a product
function calculateCosts(product, filament) {
    // Material cost
    const materialCost = product.filamentUsed * filament.costPerGram;

    // Total production cost
    const totalCost = materialCost +
        (product.energyCost || 0) +
        (product.laborCost || 0) +
        (product.packagingCost || 0) +
        (product.shippingCost || 0);

    // Gross profit (selling price - material cost only)
    const grossProfit = product.targetPrice - materialCost;
    const grossMarginPercent = (grossProfit / product.targetPrice) * 100;

    // Net profit (selling price - total cost)
    const netProfit = product.targetPrice - totalCost;
    const netMarginPercent = (netProfit / product.targetPrice) * 100;

    // Per-spool economics
    const unitsPerSpool = Math.floor(filament.spoolSize / product.filamentUsed);
    const spoolGrossProfit = unitsPerSpool * grossProfit;
    const spoolNetProfit = unitsPerSpool * netProfit;

    return {
        materialCost,
        totalCost,
        grossProfit,
        grossMarginPercent,
        netProfit,
        netMarginPercent,
        unitsPerSpool,
        spoolGrossProfit,
        spoolNetProfit
    };
}

// Calculate pricing scenarios
function calculateScenarios(product, filament) {
    const scenarios = [
        { name: 'Conservative', price: Math.floor(product.targetPrice * 0.77) },
        { name: 'Moderate', price: product.targetPrice },
        { name: 'Optimistic', price: Math.floor(product.targetPrice * 1.15) },
        { name: 'Premium', price: Math.floor(product.targetPrice * 1.54) }
    ];

    return scenarios.map(scenario => {
        const tempProduct = { ...product, targetPrice: scenario.price };
        const calc = calculateCosts(tempProduct, filament);

        return {
            name: scenario.name,
            price: scenario.price,
            ...calc
        };
    });
}

// Calculate production planning
function calculateProduction(product, filament, monthlySpools) {
    const calc = calculateCosts(product, filament);

    // Monthly calculations
    const monthlyUnits = calc.unitsPerSpool * monthlySpools;
    const monthlyRevenue = monthlyUnits * product.targetPrice;
    const monthlyMaterialCost = monthlyUnits * calc.materialCost;
    const monthlyGrossProfit = monthlyUnits * calc.grossProfit;
    const monthlyNetProfit = monthlyUnits * calc.netProfit;

    // Annual calculations
    const annualUnits = monthlyUnits * 12;
    const annualRevenue = monthlyRevenue * 12;
    const annualMaterialCost = monthlyMaterialCost * 12;
    const annualGrossProfit = monthlyGrossProfit * 12;
    const annualNetProfit = monthlyNetProfit * 12;

    return {
        perSpool: {
            units: calc.unitsPerSpool,
            printTime: (calc.unitsPerSpool * product.printTime).toFixed(1),
            materialUsed: calc.unitsPerSpool * product.filamentUsed,
            waste: filament.spoolSize - (calc.unitsPerSpool * product.filamentUsed),
            spoolCost: filament.price,
            revenue: calc.unitsPerSpool * product.targetPrice,
            grossProfit: calc.spoolGrossProfit,
            netProfit: calc.spoolNetProfit
        },
        monthly: {
            spools: monthlySpools,
            units: monthlyUnits,
            revenue: monthlyRevenue,
            materialCost: monthlyMaterialCost,
            grossProfit: monthlyGrossProfit,
            netProfit: monthlyNetProfit,
            grossMarginPercent: calc.grossMarginPercent,
            netMarginPercent: calc.netMarginPercent
        },
        annual: {
            units: annualUnits,
            revenue: annualRevenue,
            materialCost: annualMaterialCost,
            grossProfit: annualGrossProfit,
            netProfit: annualNetProfit,
            grossMarginPercent: calc.grossMarginPercent,
            netMarginPercent: calc.netMarginPercent
        }
    };
}
