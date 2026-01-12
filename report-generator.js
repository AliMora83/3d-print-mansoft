// Report Generator
// Generates financial analysis reports and exports to PDF

let currentReportData = null;

// Update report dropdowns
function updateReportDropdowns() {
    const filaments = getFilaments();
    const products = getProducts();

    // Update filament dropdown
    const filamentSelect = document.getElementById('report-filament');
    filamentSelect.innerHTML = '<option value="">Choose filament...</option>' +
        filaments.map(f => `
      <option value="${f.id}">${f.material} - ${f.color} (${f.spoolSize}g @ R${f.price})</option>
    `).join('');

    // Update product dropdown
    const productSelect = document.getElementById('report-product');
    productSelect.innerHTML = '<option value="">Choose product...</option>' +
        products.map(p => `
      <option value="${p.id}">${p.name} (${p.filamentUsed}g, ${p.printTime}h)</option>
    `).join('');
}

// Generate report
function generateReport(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);

    const filamentId = formData.get('filament');
    const productId = formData.get('product');
    const monthlySpools = parseInt(formData.get('monthlySpools'));

    const filaments = getFilaments();
    const products = getProducts();

    const filament = filaments.find(f => f.id === filamentId);
    const product = products.find(p => p.id === productId);

    if (!filament || !product) {
        alert('Please select both filament and product');
        return;
    }

    // Calculate all data
    const baseCosts = calculateCosts(product, filament);
    const scenarios = calculateScenarios(product, filament);
    const production = calculateProduction(product, filament, monthlySpools);

    currentReportData = {
        filament,
        product,
        monthlySpools,
        baseCosts,
        scenarios,
        production,
        generatedDate: new Date().toLocaleDateString()
    };

    // Render report
    renderReport();

    // Show report output
    document.getElementById('report-output').classList.remove('hidden');
    document.getElementById('report-output').scrollIntoView({ behavior: 'smooth' });
}

// Render report HTML
function renderReport() {
    const { filament, product, baseCosts, scenarios, production } = currentReportData;

    const content = `
    <div style="padding: 1rem;">
      <h2 style="text-align: center; margin-bottom: 2rem;">3D PRINTING SPEC REPORT</h2>
      
      <div style="background: var(--bg-tertiary); padding: 1rem; border-radius: var(--radius-md); margin-bottom: 2rem;">
        <p><strong>PRODUCT:</strong> ${product.name}</p>
        <p><strong>FILAMENT:</strong> ${filament.material} ${filament.color}, ${filament.spoolSize}g, R${filament.price}/spool</p>
        <p><strong>GENERATED:</strong> ${currentReportData.generatedDate}</p>
      </div>
      
      <h3>A. PRODUCTION SPECS</h3>
      <table class="table">
        <tr><td>Filament Used:</td><td><strong>${product.filamentUsed}g</strong> (${((product.filamentUsed / filament.spoolSize) * 100).toFixed(1)}% of spool)</td></tr>
        <tr><td>Print Time:</td><td><strong>${product.printTime}h</strong></td></tr>
        <tr><td>Layer Height:</td><td>${product.layerHeight}mm</td></tr>
        <tr><td>Infill:</td><td>${product.infill}%</td></tr>
        <tr><td>Support Required:</td><td>${product.supportRequired}</td></tr>
      </table>
      
      <h3 style="margin-top: 2rem;">B. COST BREAKDOWN (Per Unit)</h3>
      <table class="table">
        <tr><td>Material (${filament.material}):</td><td>R${baseCosts.materialCost.toFixed(2)}</td></tr>
        <tr><td>Energy:</td><td>R${product.energyCost.toFixed(2)}</td></tr>
        <tr><td>Labor:</td><td>R${product.laborCost.toFixed(2)}</td></tr>
        <tr><td>Packaging:</td><td>R${product.packagingCost.toFixed(2)}</td></tr>
        <tr><td>Shipping (est.):</td><td>R${product.shippingCost.toFixed(2)}</td></tr>
        <tr style="border-top: 2px solid var(--accent-primary);"><td><strong>TOTAL PRODUCTION COST:</strong></td><td><strong>R${baseCosts.totalCost.toFixed(2)}</strong></td></tr>
      </table>
      
      <h3 style="margin-top: 2rem;">C. PRICING SCENARIOS & MARGINS</h3>
      ${scenarios.map((s, i) => `
        <div style="background: ${i === 1 ? 'rgba(139, 92, 246, 0.1)' : 'var(--bg-tertiary)'}; padding: 1rem; border-radius: var(--radius-md); margin-bottom: 1rem; ${i === 1 ? 'border: 2px solid var(--accent-primary);' : ''}">
          <h4>${s.name} ${i === 1 ? '← RECOMMENDED' : ''} (R${s.price})</h4>
          <table style="width: 100%; font-size: 0.9rem;">
            <tr><td>Selling Price:</td><td><strong>R${s.price.toFixed(2)}</strong></td></tr>
            <tr><td>Gross Profit:</td><td>R${s.grossProfit.toFixed(2)} | Margin: ${s.grossMarginPercent.toFixed(1)}%</td></tr>
            <tr><td>Net Profit:</td><td><strong style="color: var(--success);">R${s.netProfit.toFixed(2)}</strong> | Margin: <strong style="color: var(--success);">${s.netMarginPercent.toFixed(1)}%</strong></td></tr>
            <tr><td>Per Spool (${s.unitsPerSpool} units):</td><td>R${(s.unitsPerSpool * s.price).toFixed(2)} | Profit: R${s.spoolNetProfit.toFixed(2)}</td></tr>
          </table>
        </div>
      `).join('')}
      
      <h3 style="margin-top: 2rem;">D. PRODUCTION CAPACITY & REVENUE</h3>
      
      <h4>Per 1kg Spool:</h4>
      <table class="table">
        <tr><td>Complete Units:</td><td><strong>${production.perSpool.units} ${product.name.toLowerCase()}s</strong></td></tr>
        <tr><td>Print Time:</td><td>${production.perSpool.printTime} hours</td></tr>
        <tr><td>Material Used:</td><td>${production.perSpool.materialUsed}g (${((production.perSpool.materialUsed / filament.spoolSize) * 100).toFixed(1)}% efficiency)</td></tr>
        <tr><td>Waste/Scrap:</td><td>${production.perSpool.waste.toFixed(0)}g (${((production.perSpool.waste / filament.spoolSize) * 100).toFixed(1)}%)</td></tr>
        <tr><td>Spool Cost:</td><td>R${production.perSpool.spoolCost.toFixed(2)}</td></tr>
        <tr><td>Revenue @ R${product.targetPrice}:</td><td><strong>R${production.perSpool.revenue.toFixed(2)}</strong></td></tr>
        <tr><td>Net Profit:</td><td><strong style="color: var(--success);">R${production.perSpool.netProfit.toFixed(2)}</strong></td></tr>
      </table>
      
      <h4 style="margin-top: 1.5rem;">Monthly (at ${production.monthly.spools} spools/month):</h4>
      <table class="table">
        <tr><td>Units Produced:</td><td><strong>${production.monthly.units} ${product.name.toLowerCase()}s</strong></td></tr>
        <tr><td>Revenue @ R${product.targetPrice}:</td><td><strong>R${production.monthly.revenue.toFixed(2)}</strong></td></tr>
        <tr><td>Material Cost:</td><td>R${production.monthly.materialCost.toFixed(2)}</td></tr>
        <tr><td>Gross Profit:</td><td>R${production.monthly.grossProfit.toFixed(2)} | Margin: ${production.monthly.grossMarginPercent.toFixed(1)}%</td></tr>
        <tr><td>Net Profit (est.):</td><td><strong style="color: var(--success);">R${production.monthly.netProfit.toFixed(2)}</strong> | Margin: <strong style="color: var(--success);">${production.monthly.netMarginPercent.toFixed(1)}%</strong></td></tr>
      </table>
      
      <h4 style="margin-top: 1.5rem;">Annual (conservative ${production.monthly.spools} spools/month):</h4>
      <table class="table">
        <tr><td>Units Produced:</td><td><strong>${production.annual.units} ${product.name.toLowerCase()}s</strong></td></tr>
        <tr><td>Revenue @ R${product.targetPrice}:</td><td><strong>R${production.annual.revenue.toFixed(2)}</strong></td></tr>
        <tr><td>Material Cost:</td><td>R${production.annual.materialCost.toFixed(2)}</td></tr>
        <tr><td>Gross Profit:</td><td>R${production.annual.grossProfit.toFixed(2)} | Margin: ${production.annual.grossMarginPercent.toFixed(1)}%</td></tr>
        <tr><td>Net Profit (est.):</td><td><strong style="color: var(--success);">R${production.annual.netProfit.toFixed(2)}</strong> | Margin: <strong style="color: var(--success);">${production.annual.netMarginPercent.toFixed(1)}%</strong></td></tr>
      </table>
      
      <h3 style="margin-top: 2rem;">E. STRATEGIC RECOMMENDATIONS</h3>
      <div style="background: var(--bg-tertiary); padding: 1rem; border-radius: var(--radius-md);">
        <p>✓ <strong>Recommended Selling Price:</strong> R${scenarios[1].price}–${scenarios[2].price}</p>
        <p>✓ <strong>Primary Channel:</strong> Etsy + Personal website</p>
        <p>✓ <strong>Scaling Strategy:</strong> Add 1 printer per ${production.perSpool.units * 10} units/month demand</p>
        <p>✓ <strong>Design Differentiation:</strong> Customize (monograms, logos, colors)</p>
        <p>✓ <strong>Competitive Advantages:</strong> ${baseCosts.grossMarginPercent.toFixed(0)}% gross margins, local production, fast turnaround</p>
      </div>
      
      ${product.notes ? `
      <h3 style="margin-top: 2rem;">F. PRODUCT NOTES</h3>
      <div style="background: var(--bg-tertiary); padding: 1rem; border-radius: var(--radius-md);">
        <p>${product.notes}</p>
      </div>
      ` : ''}
    </div>
  `;

    document.getElementById('report-content').innerHTML = content;
}

// Export to PDF
function exportToPDF() {
    if (!currentReportData) {
        alert('Please generate a report first');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const { filament, product, baseCosts, scenarios, production } = currentReportData;

    let y = 20;
    const lineHeight = 7;
    const pageHeight = doc.internal.pageSize.height;

    // Helper function to add text with page break
    const addText = (text, x, fontSize = 10, style = 'normal') => {
        if (y > pageHeight - 20) {
            doc.addPage();
            y = 20;
        }
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', style);
        doc.text(text, x, y);
        y += lineHeight;
    };

    // Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('3D PRINTING SPEC REPORT', 105, y, { align: 'center' });
    y += 15;

    // Header info
    addText(`PRODUCT: ${product.name}`, 20, 12, 'bold');
    addText(`FILAMENT: ${filament.material} ${filament.color}, ${filament.spoolSize}g, R${filament.price}/spool`, 20);
    addText(`GENERATED: ${currentReportData.generatedDate}`, 20);
    y += 5;

    // Production Specs
    addText('A. PRODUCTION SPECS', 20, 14, 'bold');
    addText(`Filament Used: ${product.filamentUsed}g (${((product.filamentUsed / filament.spoolSize) * 100).toFixed(1)}% of spool)`, 20);
    addText(`Print Time: ${product.printTime}h`, 20);
    addText(`Infill: ${product.infill}%`, 20);
    y += 5;

    // Cost Breakdown
    addText('B. COST BREAKDOWN (Per Unit)', 20, 14, 'bold');
    addText(`Material: R${baseCosts.materialCost.toFixed(2)}`, 20);
    addText(`Energy: R${product.energyCost.toFixed(2)}`, 20);
    addText(`Labor: R${product.laborCost.toFixed(2)}`, 20);
    addText(`Packaging: R${product.packagingCost.toFixed(2)}`, 20);
    addText(`Shipping: R${product.shippingCost.toFixed(2)}`, 20);
    addText(`TOTAL PRODUCTION COST: R${baseCosts.totalCost.toFixed(2)}`, 20, 11, 'bold');
    y += 5;

    // Pricing Scenarios
    addText('C. PRICING SCENARIOS & MARGINS', 20, 14, 'bold');
    scenarios.forEach((s, i) => {
        addText(`${s.name} ${i === 1 ? '(RECOMMENDED)' : ''}: R${s.price}`, 20, 11, 'bold');
        addText(`  Net Profit: R${s.netProfit.toFixed(2)} | Margin: ${s.netMarginPercent.toFixed(1)}%`, 25);
        addText(`  Per Spool: ${s.unitsPerSpool} units, Profit: R${s.spoolNetProfit.toFixed(2)}`, 25);
    });
    y += 5;

    // Production Capacity
    addText('D. PRODUCTION CAPACITY & REVENUE', 20, 14, 'bold');
    addText(`Per Spool: ${production.perSpool.units} units, R${production.perSpool.netProfit.toFixed(2)} profit`, 20);
    addText(`Monthly (${production.monthly.spools} spools): ${production.monthly.units} units, R${production.monthly.netProfit.toFixed(2)} profit`, 20);
    addText(`Annual: ${production.annual.units} units, R${production.annual.netProfit.toFixed(2)} profit`, 20);

    // Save PDF
    const filename = `3D_Print_Report_${product.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
}
