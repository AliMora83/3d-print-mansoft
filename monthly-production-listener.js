// Monthly Production Input Listener
// Add event listener to update calculations when monthly spools changes

document.addEventListener('DOMContentLoaded', () => {
    const monthlySpoolsInput = document.querySelector('input[name="monthlySpools"]');

    if (monthlySpoolsInput) {
        monthlySpoolsInput.addEventListener('input', (e) => {
            // If a report is currently displayed, regenerate it with the new value
            if (currentReportData && !document.getElementById('report-output').classList.contains('hidden')) {
                const newMonthlySpools = parseInt(e.target.value) || 5;

                // Recalculate production with new monthly spools value
                currentReportData.monthlySpools = newMonthlySpools;
                currentReportData.production = calculateProduction(
                    currentReportData.product,
                    currentReportData.filament,
                    newMonthlySpools
                );

                // Re-render the report
                renderReport();
            }
        });
    }
});
