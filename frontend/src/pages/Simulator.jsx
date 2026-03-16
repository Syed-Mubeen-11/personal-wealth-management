import React, { useState } from 'react';
import api from '../api';
import { Line } from 'react-chartjs-2';
import { jsPDF } from 'jspdf';
import { 
    Chart as ChartJS, 
    CategoryScale, 
    LinearScale, 
    PointElement, 
    LineElement, 
    Title, 
    Tooltip, 
    Legend,
    Filler 
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

function Simulator() {
    const [activeTab, setActiveTab] = useState('sip');
    const [loading, setLoading] = useState(false);

    // SIP Form State
    const [sipForm, setSipForm] = useState({
        monthly_investment: 5000,
        expected_return_rate: 12,
        years: 15
    });
    const [sipResult, setSipResult] = useState(null);

    // Retirement Form State
    const [retirementForm, setRetirementForm] = useState({
        current_age: 30,
        retirement_age: 60,
        current_savings: 50000,
        monthly_contribution: 2000,
        expected_return_rate: 8,
        post_retirement_return_rate: 5,
        inflation_rate: 3,
        monthly_expense_at_retirement: 5000
    });
    const [retirementResult, setRetirementResult] = useState(null);

    // Loan Form State
    const [loanForm, setLoanForm] = useState({
        principal: 300000,
        annual_interest_rate: 7,
        loan_term_months: 360,
        extra_monthly_payment: 0
    });
    const [loanResult, setLoanResult] = useState(null);

    // Format currency
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(value);
    };

    // Format large numbers for chart axis
    const formatAxisValue = (value) => {
        if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
        return value;
    };

    const getErrorMessage = (error, fallbackMessage) => {
        return error?.response?.data?.detail || fallbackMessage;
    };

    const normalizeSimulationResult = (data) => {
        return data?.results || data;
    };

    // Calculate SIP
    const handleSIPCalculate = async () => {
        setLoading(true);
        try {
            const response = await api.post('/api/simulations/sip', {
                monthly_investment: parseFloat(sipForm.monthly_investment),
                years: parseInt(sipForm.years),
                expected_return_rate: parseFloat(sipForm.expected_return_rate)
            });
            setSipResult(normalizeSimulationResult(response.data));
        } catch (error) {
            console.error('SIP calculation error:', error);
            // Fallback to local calculation if API fails
            const result = calculateSIPLocally(
                parseFloat(sipForm.monthly_investment),
                parseInt(sipForm.years),
                parseFloat(sipForm.expected_return_rate)
            );
            setSipResult(result);
        }
        setLoading(false);
    };

    // Local SIP calculation fallback
    const calculateSIPLocally = (monthly, years, rate) => {
        const monthlyRate = rate / 100 / 12;
        let totalInvested = 0;
        let totalValue = 0;
        const yearlyProjections = [];

        for (let year = 1; year <= years; year++) {
            for (let month = 0; month < 12; month++) {
                totalInvested += monthly;
                totalValue += monthly;
                totalValue *= (1 + monthlyRate);
            }
            yearlyProjections.push({
                year,
                invested_amount: Math.round(totalInvested * 100) / 100,
                interest_earned: Math.round((totalValue - totalInvested) * 100) / 100,
                total_value: Math.round(totalValue * 100) / 100
            });
        }

        return {
            total_invested: Math.round(totalInvested * 100) / 100,
            estimated_returns: Math.round((totalValue - totalInvested) * 100) / 100,
            total_value: Math.round(totalValue * 100) / 100,
            annual_return_rate: rate,
            yearly_projections: yearlyProjections
        };
    };

    // Calculate Retirement
    const handleRetirementCalculate = async () => {
        setLoading(true);
        try {
            const response = await api.post('/api/simulations/retirement', {
                current_age: parseInt(retirementForm.current_age),
                retirement_age: parseInt(retirementForm.retirement_age),
                current_savings: parseFloat(retirementForm.current_savings),
                monthly_contribution: parseFloat(retirementForm.monthly_contribution),
                expected_return_rate: parseFloat(retirementForm.expected_return_rate),
                post_retirement_return_rate: parseFloat(retirementForm.post_retirement_return_rate),
                inflation_rate: parseFloat(retirementForm.inflation_rate),
                monthly_expense_at_retirement: parseFloat(retirementForm.monthly_expense_at_retirement)
            });
            setRetirementResult(normalizeSimulationResult(response.data));
        } catch (error) {
            console.error('Retirement calculation error:', error);
            const fallback = calculateRetirementLocally(
                parseInt(retirementForm.current_age),
                parseInt(retirementForm.retirement_age),
                parseFloat(retirementForm.current_savings),
                parseFloat(retirementForm.monthly_contribution),
                parseFloat(retirementForm.expected_return_rate),
                parseFloat(retirementForm.post_retirement_return_rate),
                parseFloat(retirementForm.inflation_rate),
                parseFloat(retirementForm.monthly_expense_at_retirement)
            );
            setRetirementResult(fallback);
            console.warn(getErrorMessage(error, 'Retirement calculation used local fallback.'));
        }
        setLoading(false);
    };

    // Calculate Loan Payoff
    const handleLoanCalculate = async () => {
        setLoading(true);
        try {
            const response = await api.post('/api/simulations/loan', {
                principal: parseFloat(loanForm.principal),
                annual_interest_rate: parseFloat(loanForm.annual_interest_rate),
                loan_term_months: parseInt(loanForm.loan_term_months),
                extra_monthly_payment: parseFloat(loanForm.extra_monthly_payment)
            });
            setLoanResult(normalizeSimulationResult(response.data));
        } catch (error) {
            console.error('Loan calculation error:', error);
            const fallback = calculateLoanLocally(
                parseFloat(loanForm.principal),
                parseFloat(loanForm.annual_interest_rate),
                parseInt(loanForm.loan_term_months),
                parseFloat(loanForm.extra_monthly_payment)
            );
            setLoanResult(fallback);
            console.warn(getErrorMessage(error, 'Loan calculation used local fallback.'));
        }
        setLoading(false);
    };

    const calculateRetirementLocally = (
        currentAge,
        retirementAge,
        currentSavings,
        monthlyContribution,
        expectedReturnRate,
        postRetirementReturnRate,
        inflationRate,
        monthlyExpenseAtRetirement
    ) => {
        const yearsUntilRetirement = Math.max(0, retirementAge - currentAge);
        const monthlyRate = expectedReturnRate / 100 / 12;

        let corpus = currentSavings;
        let totalInvested = currentSavings;
        const yearlyProjections = [];

        for (let year = 1; year <= yearsUntilRetirement; year++) {
            for (let month = 0; month < 12; month++) {
                corpus += monthlyContribution;
                corpus *= (1 + monthlyRate);
                totalInvested += monthlyContribution;
            }

            yearlyProjections.push({
                age: currentAge + year,
                year,
                invested: Math.round(totalInvested * 100) / 100,
                corpus: Math.round(corpus * 100) / 100,
                phase: 'accumulation'
            });
        }

        const inflationMultiplier = Math.pow(1 + inflationRate / 100, yearsUntilRetirement);
        const inflationAdjustedExpense = monthlyExpenseAtRetirement * inflationMultiplier;
        const monthlyIncomeAtRetirement = corpus * 0.04 / 12;

        return {
            years_until_retirement: yearsUntilRetirement,
            corpus_at_retirement: Math.round(corpus * 100) / 100,
            total_invested: Math.round(totalInvested * 100) / 100,
            total_returns: Math.round((corpus - totalInvested) * 100) / 100,
            monthly_income_at_retirement: Math.round(monthlyIncomeAtRetirement * 100) / 100,
            corpus_lasts_until_age: retirementAge,
            inflation_adjusted_expense: Math.round(inflationAdjustedExpense * 100) / 100,
            yearly_projections: yearlyProjections
        };
    };

    const calculateLoanLocally = (principal, annualRate, termMonths, extraPayment = 0) => {
        const monthlyRate = annualRate / 100 / 12;

        let emi;
        if (monthlyRate > 0) {
            emi = principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths) /
                (Math.pow(1 + monthlyRate, termMonths) - 1);
        } else {
            emi = principal / termMonths;
        }

        const standardTotal = emi * termMonths;
        const standardInterest = standardTotal - principal;

        let balance = principal;
        let totalPaid = 0;
        let totalInterest = 0;
        let monthsPaid = 0;
        const amortization = [];

        while (balance > 0 && monthsPaid < termMonths * 2) {
            monthsPaid += 1;
            const interestPayment = balance * monthlyRate;
            const principalPayment = Math.min(emi - interestPayment + extraPayment, balance);
            const actualPayment = interestPayment + principalPayment;

            balance -= principalPayment;
            totalPaid += actualPayment;
            totalInterest += interestPayment;

            // Match backend pattern: monthly points for year 1, then yearly snapshots
            if (monthsPaid <= 12 || monthsPaid % 12 === 0) {
                amortization.push({
                    month: monthsPaid,
                    payment: Math.round(actualPayment * 100) / 100,
                    principal: Math.round(principalPayment * 100) / 100,
                    interest: Math.round(interestPayment * 100) / 100,
                    balance: Math.round(Math.max(0, balance) * 100) / 100
                });
            }
        }

        const interestSaved = standardInterest - totalInterest;
        const monthsSaved = termMonths - monthsPaid;

        return {
            monthly_payment: Math.round((emi + extraPayment) * 100) / 100,
            total_payment: Math.round(totalPaid * 100) / 100,
            total_interest: Math.round(totalInterest * 100) / 100,
            payoff_months: monthsPaid,
            payoff_date: 'Calculated',
            interest_saved_with_extra: Math.round(Math.max(0, interestSaved) * 100) / 100,
            months_saved_with_extra: Math.max(0, monthsSaved),
            amortization_schedule: amortization
        };
    };

    // Export functionality - PDF Generation
    const handleExport = () => {
        if (activeTab === 'sip' && !sipResult) {
            alert('No results to export. Please run a calculation first.');
            return;
        } else if (activeTab === 'retirement' && !retirementResult) {
            alert('No results to export. Please run a calculation first.');
            return;
        } else if (activeTab === 'loan' && !loanResult) {
            alert('No results to export. Please run a calculation first.');
            return;
        }

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        let yPos = 20;

        // Header
        doc.setFillColor(0, 51, 102);
        doc.rect(0, 0, pageWidth, 30, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('Wealth Tracker - Financial Report', pageWidth / 2, 18, { align: 'center' });
        
        yPos = 45;
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, yPos);
        yPos += 15;

        if (activeTab === 'sip' && sipResult) {
            // SIP Report Title
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0, 51, 102);
            doc.text('SIP Investment Report', 14, yPos);
            yPos += 12;

            // Input Parameters Section
            doc.setFillColor(240, 240, 240);
            doc.rect(14, yPos, pageWidth - 28, 35, 'F');
            doc.setFontSize(12);
            doc.setTextColor(100, 100, 100);
            doc.text('Input Parameters', 18, yPos + 8);
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            doc.text(`Monthly Investment: ${formatCurrency(sipForm.monthly_investment)}`, 18, yPos + 18);
            doc.text(`Expected Return Rate: ${sipForm.expected_return_rate}%`, 18, yPos + 26);
            doc.text(`Investment Tenure: ${sipForm.years} years`, 110, yPos + 18);
            yPos += 45;

            // Results Section
            doc.setFontSize(12);
            doc.setTextColor(100, 100, 100);
            doc.text('Results Summary', 14, yPos);
            yPos += 10;

            // Result boxes
            const boxWidth = (pageWidth - 42) / 3;
            
            // Total Invested
            doc.setFillColor(239, 246, 255);
            doc.rect(14, yPos, boxWidth, 30, 'F');
            doc.setFontSize(9);
            doc.setTextColor(100, 100, 100);
            doc.text('Total Invested', 18, yPos + 10);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0, 0, 0);
            doc.text(formatCurrency(sipResult.total_invested), 18, yPos + 22);

            // Estimated Returns
            doc.setFillColor(240, 253, 244);
            doc.rect(14 + boxWidth + 7, yPos, boxWidth, 30, 'F');
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 100, 100);
            doc.text('Estimated Returns', 18 + boxWidth + 7, yPos + 10);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(34, 139, 34);
            doc.text(formatCurrency(sipResult.estimated_returns), 18 + boxWidth + 7, yPos + 22);

            // Total Value
            doc.setFillColor(254, 249, 195);
            doc.rect(14 + (boxWidth + 7) * 2, yPos, boxWidth, 30, 'F');
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 100, 100);
            doc.text('Total Value', 18 + (boxWidth + 7) * 2, yPos + 10);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0, 102, 204);
            doc.text(formatCurrency(sipResult.total_value), 18 + (boxWidth + 7) * 2, yPos + 22);
            yPos += 45;

            // Year-by-Year Table
            if (sipResult.yearly_projections && sipResult.yearly_projections.length > 0) {
                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(0, 51, 102);
                doc.text('Year-by-Year Projection', 14, yPos);
                yPos += 8;

                // Table header
                doc.setFillColor(0, 51, 102);
                doc.rect(14, yPos, pageWidth - 28, 8, 'F');
                doc.setFontSize(9);
                doc.setTextColor(255, 255, 255);
                doc.text('Year', 18, yPos + 6);
                doc.text('Invested', 50, yPos + 6);
                doc.text('Interest Earned', 100, yPos + 6);
                doc.text('Total Value', 155, yPos + 6);
                yPos += 10;

                doc.setFont('helvetica', 'normal');
                doc.setTextColor(0, 0, 0);
                sipResult.yearly_projections.forEach((row, idx) => {
                    if (yPos > 270) {
                        doc.addPage();
                        yPos = 20;
                    }
                    if (idx % 2 === 0) {
                        doc.setFillColor(248, 248, 248);
                        doc.rect(14, yPos - 4, pageWidth - 28, 8, 'F');
                    }
                    doc.text(`${row.year}`, 18, yPos);
                    doc.text(formatCurrency(row.invested_amount), 50, yPos);
                    doc.text(formatCurrency(row.interest_earned), 100, yPos);
                    doc.text(formatCurrency(row.total_value), 155, yPos);
                    yPos += 8;
                });
            }

            doc.save('SIP_Report.pdf');

        } else if (activeTab === 'retirement' && retirementResult) {
            // Retirement Report
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0, 51, 102);
            doc.text('Retirement Planning Report', 14, yPos);
            yPos += 12;

            // Input Parameters
            doc.setFillColor(240, 240, 240);
            doc.rect(14, yPos, pageWidth - 28, 45, 'F');
            doc.setFontSize(12);
            doc.setTextColor(100, 100, 100);
            doc.text('Input Parameters', 18, yPos + 8);
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            doc.text(`Current Age: ${retirementForm.current_age}`, 18, yPos + 18);
            doc.text(`Retirement Age: ${retirementForm.retirement_age}`, 18, yPos + 26);
            doc.text(`Current Savings: ${formatCurrency(retirementForm.current_savings)}`, 18, yPos + 34);
            doc.text(`Monthly Contribution: ${formatCurrency(retirementForm.monthly_contribution)}`, 110, yPos + 18);
            doc.text(`Expected Return: ${retirementForm.expected_return_rate}%`, 110, yPos + 26);
            doc.text(`Monthly Expense: ${formatCurrency(retirementForm.monthly_expense_at_retirement)}`, 110, yPos + 34);
            yPos += 55;

            // Results
            const boxWidth = (pageWidth - 42) / 3;
            
            doc.setFillColor(239, 246, 255);
            doc.rect(14, yPos, boxWidth, 30, 'F');
            doc.setFontSize(9);
            doc.setTextColor(100, 100, 100);
            doc.text('Corpus at Retirement', 18, yPos + 10);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0, 102, 204);
            doc.text(formatCurrency(retirementResult.corpus_at_retirement), 18, yPos + 22);

            doc.setFillColor(240, 253, 244);
            doc.rect(14 + boxWidth + 7, yPos, boxWidth, 30, 'F');
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 100, 100);
            doc.text('Monthly Income', 18 + boxWidth + 7, yPos + 10);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(34, 139, 34);
            doc.text(formatCurrency(retirementResult.monthly_income_at_retirement), 18 + boxWidth + 7, yPos + 22);

            doc.setFillColor(254, 249, 195);
            doc.rect(14 + (boxWidth + 7) * 2, yPos, boxWidth, 30, 'F');
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 100, 100);
            doc.text('Corpus Lasts Until', 18 + (boxWidth + 7) * 2, yPos + 10);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0, 0, 0);
            doc.text(`Age ${retirementResult.corpus_lasts_until_age}`, 18 + (boxWidth + 7) * 2, yPos + 22);
            yPos += 45;

            // Additional stats
            doc.setFillColor(248, 248, 248);
            doc.rect(14, yPos, (pageWidth - 35) / 2, 25, 'F');
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 100, 100);
            doc.text('Total Invested', 18, yPos + 10);
            doc.setFontSize(11);
            doc.setTextColor(0, 0, 0);
            doc.text(formatCurrency(retirementResult.total_invested), 18, yPos + 20);

            doc.rect(14 + (pageWidth - 35) / 2 + 7, yPos, (pageWidth - 35) / 2, 25, 'F');
            doc.setFontSize(9);
            doc.setTextColor(100, 100, 100);
            doc.text('Total Returns', 18 + (pageWidth - 35) / 2 + 7, yPos + 10);
            doc.setFontSize(11);
            doc.setTextColor(34, 139, 34);
            doc.text(formatCurrency(retirementResult.total_returns), 18 + (pageWidth - 35) / 2 + 7, yPos + 20);

            doc.save('Retirement_Report.pdf');

        } else if (activeTab === 'loan' && loanResult) {
            // Loan Report
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0, 51, 102);
            doc.text('Loan Payoff Report', 14, yPos);
            yPos += 12;

            // Input Parameters
            doc.setFillColor(240, 240, 240);
            doc.rect(14, yPos, pageWidth - 28, 35, 'F');
            doc.setFontSize(12);
            doc.setTextColor(100, 100, 100);
            doc.text('Loan Details', 18, yPos + 8);
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            doc.text(`Principal Amount: ${formatCurrency(loanForm.principal)}`, 18, yPos + 18);
            doc.text(`Interest Rate: ${loanForm.annual_interest_rate}%`, 18, yPos + 26);
            doc.text(`Loan Term: ${loanForm.loan_term_months} months`, 110, yPos + 18);
            doc.text(`Extra Payment: ${formatCurrency(loanForm.extra_monthly_payment)}`, 110, yPos + 26);
            yPos += 45;

            // Results
            const boxWidth = (pageWidth - 42) / 3;
            
            doc.setFillColor(239, 246, 255);
            doc.rect(14, yPos, boxWidth, 30, 'F');
            doc.setFontSize(9);
            doc.setTextColor(100, 100, 100);
            doc.text('Monthly Payment', 18, yPos + 10);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0, 102, 204);
            doc.text(formatCurrency(loanResult.monthly_payment), 18, yPos + 22);

            doc.setFillColor(254, 226, 226);
            doc.rect(14 + boxWidth + 7, yPos, boxWidth, 30, 'F');
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 100, 100);
            doc.text('Total Interest', 18 + boxWidth + 7, yPos + 10);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(220, 38, 38);
            doc.text(formatCurrency(loanResult.total_interest), 18 + boxWidth + 7, yPos + 22);

            doc.setFillColor(240, 253, 244);
            doc.rect(14 + (boxWidth + 7) * 2, yPos, boxWidth, 30, 'F');
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 100, 100);
            doc.text('Payoff in', 18 + (boxWidth + 7) * 2, yPos + 10);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(34, 139, 34);
            doc.text(`${loanResult.payoff_months} months`, 18 + (boxWidth + 7) * 2, yPos + 22);
            yPos += 45;

            // Extra payment savings
            if (loanForm.extra_monthly_payment > 0 && loanResult.interest_saved_with_extra) {
                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(0, 51, 102);
                doc.text('Extra Payment Benefits', 14, yPos);
                yPos += 10;

                doc.setFillColor(220, 252, 231);
                doc.rect(14, yPos, (pageWidth - 35) / 2, 25, 'F');
                doc.setFontSize(9);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(100, 100, 100);
                doc.text('Interest Saved', 18, yPos + 10);
                doc.setFontSize(11);
                doc.setTextColor(22, 101, 52);
                doc.text(formatCurrency(loanResult.interest_saved_with_extra), 18, yPos + 20);

                doc.rect(14 + (pageWidth - 35) / 2 + 7, yPos, (pageWidth - 35) / 2, 25, 'F');
                doc.setFontSize(9);
                doc.setTextColor(100, 100, 100);
                doc.text('Months Saved', 18 + (pageWidth - 35) / 2 + 7, yPos + 10);
                doc.setFontSize(11);
                doc.setTextColor(22, 101, 52);
                doc.text(`${loanResult.months_saved_with_extra} months`, 18 + (pageWidth - 35) / 2 + 7, yPos + 20);
            }

            doc.save('Loan_Report.pdf');
        }
    };

    // Share functionality
    const handleShare = () => {
        let text = '';
        const timestamp = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        
        if (activeTab === 'sip' && sipResult) {
            const returnMultiple = (sipResult.total_value / sipResult.total_invested).toFixed(2);
            text = `📈 SIP Investment Projection

💰 Monthly Investment: ${formatCurrency(sipForm.monthly_investment)}
📅 Duration: ${sipForm.years} years
📊 Expected Return: ${sipForm.expected_return_rate}% p.a.

Results:
✅ Total Invested: ${formatCurrency(sipResult.total_invested)}
✅ Estimated Returns: ${formatCurrency(sipResult.estimated_returns)}
🎯 Final Corpus: ${formatCurrency(sipResult.total_value)}
📈 Return Multiple: ${returnMultiple}x

Generated via Wealth Tracker • ${timestamp}`;
        } else if (activeTab === 'retirement' && retirementResult) {
            const yearsToRetire = retirementForm.retirement_age - retirementForm.current_age;
            const corpusYears = retirementResult.corpus_lasts_until_age - retirementForm.retirement_age;
            text = `🏖️ Retirement Planning Summary

👤 Current Age: ${retirementForm.current_age} years
🎯 Retirement Age: ${retirementForm.retirement_age} years
⏳ Years to Retirement: ${yearsToRetire} years

💵 Current Savings: ${formatCurrency(retirementForm.current_savings)}
💰 Monthly Contribution: ${formatCurrency(retirementForm.monthly_contribution)}
📊 Expected Return: ${retirementForm.expected_return_rate}% p.a.

Results:
🏦 Corpus at Retirement: ${formatCurrency(retirementResult.corpus_at_retirement)}
💸 Monthly Income: ${formatCurrency(retirementResult.monthly_income_at_retirement)}
📅 Corpus Lasts: ${corpusYears}+ years (until age ${retirementResult.corpus_lasts_until_age})
📈 Total Returns: ${formatCurrency(retirementResult.total_returns)}

Generated via Wealth Tracker • ${timestamp}`;
        } else if (activeTab === 'loan' && loanResult) {
            const yearsToPayoff = (loanResult.payoff_months / 12).toFixed(1);
            text = `🏠 Loan Payoff Analysis

💰 Principal: ${formatCurrency(loanForm.principal)}
📊 Interest Rate: ${loanForm.annual_interest_rate}% p.a.
📅 Original Term: ${loanForm.loan_term_months} months

Results:
💵 Monthly EMI: ${formatCurrency(loanResult.monthly_payment)}
💸 Total Interest: ${formatCurrency(loanResult.total_interest)}
✅ Payoff in: ${loanResult.payoff_months} months (~${yearsToPayoff} years)
📅 Payoff Date: ${loanResult.payoff_date}${loanForm.extra_monthly_payment > 0 ? `

🎉 With Extra Payment (${formatCurrency(loanForm.extra_monthly_payment)}/month):
💰 Interest Saved: ${formatCurrency(loanResult.interest_saved_with_extra)}
⏱️ Months Saved: ${loanResult.months_saved_with_extra} months` : ''}

Generated via Wealth Tracker • ${timestamp}`;
        } else {
            text = 'Check out the Wealth Tracker Simulator for financial planning!';
        }

        if (navigator.share) {
            navigator.share({ title: 'Wealth Tracker - Financial Report', text });
        } else {
            navigator.clipboard.writeText(text);
            alert('Results copied to clipboard!');
        }
    };

    // SIP Chart Data
    const sipChartData = sipResult ? {
        labels: sipResult.yearly_projections?.map(p => `Year ${p.year}`) || [],
        datasets: [
            {
                label: 'Invested Amount',
                data: sipResult.yearly_projections?.map(p => p.invested_amount) || [],
                borderColor: '#64748b',
                backgroundColor: 'rgba(100, 116, 139, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                borderWidth: 2
            },
            {
                label: 'Total Value',
                data: sipResult.yearly_projections?.map(p => p.total_value) || [],
                borderColor: '#0066cc',
                backgroundColor: 'rgba(0, 102, 204, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                borderWidth: 2
            }
        ]
    } : null;

    // Retirement Chart Data
    const retirementChartData = retirementResult ? {
        labels: retirementResult.yearly_projections?.filter(p => p.phase === 'accumulation').map(p => `Age ${p.age}`) || [],
        datasets: [
            {
                label: 'Retirement Corpus',
                data: retirementResult.yearly_projections?.filter(p => p.phase === 'accumulation').map(p => p.corpus) || [],
                borderColor: '#0066cc',
                backgroundColor: 'rgba(0, 102, 204, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                borderWidth: 2
            }
        ]
    } : null;

    // Loan Chart Data
    const loanChartData = loanResult ? {
        labels: loanResult.amortization_schedule?.map(a => `Month ${a.month}`) || [],
        datasets: [
            {
                label: 'Remaining Balance',
                data: loanResult.amortization_schedule?.map(a => a.balance) || [],
                borderColor: '#0066cc',
                backgroundColor: 'rgba(0, 102, 204, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                borderWidth: 2
            }
        ]
    } : null;

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    padding: 20
                }
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                callbacks: {
                    label: (context) => `${context.dataset.label}: ${formatCurrency(context.raw)}`
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: (value) => formatAxisValue(value)
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                }
            },
            x: {
                grid: {
                    display: false
                }
            }
        },
        interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
        }
    };

    // Tab Button Component
    const TabButton = ({ id, label }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`px-6 py-3 font-medium text-sm transition-colors ${
                activeTab === id
                    ? 'bg-white text-gray-900 border-b-2 border-blue-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
        >
            {label}
        </button>
    );

    // Input with Slider Component
    const InputWithSlider = ({ label, value, onChange, min, max, step = 1, unit = '', prefix = '' }) => (
        <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">{label}</label>
            <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                    <input
                        type="number"
                        value={value}
                        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                    {unit && (
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">{unit}</span>
                    )}
                </div>
            </div>
            <input
                type="range"
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                min={min}
                max={max}
                step={step}
                className="w-full mt-2 h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
        </div>
    );

    // Result Card Component
    const ResultCard = ({ label, value, sublabel }) => (
        <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-gray-500 text-sm mb-1">{label}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {sublabel && <p className="text-gray-400 text-xs mt-1">{sublabel}</p>}
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Tabs */}
            <div className="bg-gray-100 border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex gap-1">
                        <TabButton id="sip" label="SIP Calculator" />
                        <TabButton id="retirement" label="Retirement Planning" />
                        <TabButton id="loan" label="Loan Payoff" />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    
                    {/* Left Panel - Input Form */}
                    <div className="lg:w-1/3">
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                            
                            {/* SIP Calculator Form */}
                            {activeTab === 'sip' && (
                                <>
                                    <h2 className="text-xl font-semibold text-gray-900 mb-6">SIP Details</h2>
                                    
                                    <InputWithSlider
                                        label="Monthly Investment"
                                        value={sipForm.monthly_investment}
                                        onChange={(val) => setSipForm({...sipForm, monthly_investment: val})}
                                        min={500}
                                        max={100000}
                                        step={500}
                                        unit="USD"
                                    />

                                    <InputWithSlider
                                        label="Expected Annual Return Rate"
                                        value={sipForm.expected_return_rate}
                                        onChange={(val) => setSipForm({...sipForm, expected_return_rate: val})}
                                        min={1}
                                        max={30}
                                        step={0.5}
                                        unit="%"
                                    />

                                    <InputWithSlider
                                        label="Investment Tenure"
                                        value={sipForm.years}
                                        onChange={(val) => setSipForm({...sipForm, years: val})}
                                        min={1}
                                        max={40}
                                        step={1}
                                        unit="Years"
                                    />

                                    <button
                                        onClick={handleSIPCalculate}
                                        disabled={loading}
                                        className={`w-full py-4 rounded-lg font-semibold text-white transition ${
                                            loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
                                        }`}
                                    >
                                        {loading ? 'Calculating...' : 'Calculate SIP'}
                                    </button>
                                </>
                            )}

                            {/* Retirement Planning Form */}
                            {activeTab === 'retirement' && (
                                <>
                                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Retirement Details</h2>
                                    
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label className="block text-gray-700 font-medium mb-2">Current Age</label>
                                            <input
                                                type="number"
                                                value={retirementForm.current_age}
                                                onChange={(e) => setRetirementForm({...retirementForm, current_age: parseInt(e.target.value)})}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-gray-700 font-medium mb-2">Retirement Age</label>
                                            <input
                                                type="number"
                                                value={retirementForm.retirement_age}
                                                onChange={(e) => setRetirementForm({...retirementForm, retirement_age: parseInt(e.target.value)})}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                                            />
                                        </div>
                                    </div>

                                    <InputWithSlider
                                        label="Current Savings"
                                        value={retirementForm.current_savings}
                                        onChange={(val) => setRetirementForm({...retirementForm, current_savings: val})}
                                        min={0}
                                        max={1000000}
                                        step={1000}
                                        unit="USD"
                                    />

                                    <InputWithSlider
                                        label="Monthly Contribution"
                                        value={retirementForm.monthly_contribution}
                                        onChange={(val) => setRetirementForm({...retirementForm, monthly_contribution: val})}
                                        min={100}
                                        max={20000}
                                        step={100}
                                        unit="USD"
                                    />

                                    <InputWithSlider
                                        label="Expected Return Rate"
                                        value={retirementForm.expected_return_rate}
                                        onChange={(val) => setRetirementForm({...retirementForm, expected_return_rate: val})}
                                        min={1}
                                        max={15}
                                        step={0.5}
                                        unit="%"
                                    />

                                    <InputWithSlider
                                        label="Monthly Expense at Retirement"
                                        value={retirementForm.monthly_expense_at_retirement}
                                        onChange={(val) => setRetirementForm({...retirementForm, monthly_expense_at_retirement: val})}
                                        min={1000}
                                        max={50000}
                                        step={500}
                                        unit="USD"
                                    />

                                    <button
                                        onClick={handleRetirementCalculate}
                                        disabled={loading}
                                        className={`w-full py-4 rounded-lg font-semibold text-white transition ${
                                            loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
                                        }`}
                                    >
                                        {loading ? 'Calculating...' : 'Calculate Retirement'}
                                    </button>
                                </>
                            )}

                            {/* Loan Payoff Form */}
                            {activeTab === 'loan' && (
                                <>
                                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Loan Details</h2>
                                    
                                    <InputWithSlider
                                        label="Loan Amount (Principal)"
                                        value={loanForm.principal}
                                        onChange={(val) => setLoanForm({...loanForm, principal: val})}
                                        min={10000}
                                        max={1000000}
                                        step={5000}
                                        unit="USD"
                                    />

                                    <InputWithSlider
                                        label="Annual Interest Rate"
                                        value={loanForm.annual_interest_rate}
                                        onChange={(val) => setLoanForm({...loanForm, annual_interest_rate: val})}
                                        min={1}
                                        max={20}
                                        step={0.25}
                                        unit="%"
                                    />

                                    <InputWithSlider
                                        label="Loan Term"
                                        value={loanForm.loan_term_months}
                                        onChange={(val) => setLoanForm({...loanForm, loan_term_months: val})}
                                        min={12}
                                        max={360}
                                        step={12}
                                        unit="Months"
                                    />

                                    <InputWithSlider
                                        label="Extra Monthly Payment"
                                        value={loanForm.extra_monthly_payment}
                                        onChange={(val) => setLoanForm({...loanForm, extra_monthly_payment: val})}
                                        min={0}
                                        max={5000}
                                        step={100}
                                        unit="USD"
                                    />

                                    <button
                                        onClick={handleLoanCalculate}
                                        disabled={loading}
                                        className={`w-full py-4 rounded-lg font-semibold text-white transition ${
                                            loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
                                        }`}
                                    >
                                        {loading ? 'Calculating...' : 'Calculate Loan Payoff'}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Right Panel - Results */}
                    <div className="lg:w-2/3">
                        {/* Action Buttons */}
                        <div className="flex justify-end gap-3 mb-4">
                            <button 
                                onClick={handleExport}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Export
                            </button>
                            <button 
                                onClick={handleShare}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                </svg>
                                Share
                            </button>
                        </div>

                        {/* SIP Results */}
                        {activeTab === 'sip' && (
                            <>
                                {sipResult ? (
                                    <>
                                        {/* Result Cards */}
                                        <div className="grid grid-cols-3 gap-4 mb-6">
                                            <ResultCard
                                                label="Total Invested"
                                                value={formatCurrency(sipResult.total_invested)}
                                                sublabel={`Over ${sipForm.years} years`}
                                            />
                                            <ResultCard
                                                label="Estimated Returns"
                                                value={formatCurrency(sipResult.estimated_returns)}
                                                sublabel={`${sipForm.expected_return_rate}% annual growth`}
                                            />
                                            <ResultCard
                                                label="Total Value"
                                                value={formatCurrency(sipResult.total_value)}
                                                sublabel="Your wealth projection"
                                            />
                                        </div>

                                        {/* Chart */}
                                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-4">SIP Growth Projection</h3>
                                            <div className="h-80">
                                                <Line data={sipChartData} options={chartOptions} />
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="bg-white rounded-xl shadow-sm p-12 border border-gray-200 flex flex-col items-center justify-center text-gray-400">
                                        <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                        <p className="text-lg font-medium">Enter SIP details and calculate</p>
                                        <p className="text-sm">See your wealth grow over time</p>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Retirement Results */}
                        {activeTab === 'retirement' && (
                            <>
                                {retirementResult ? (
                                    <>
                                        {/* Result Cards */}
                                        <div className="grid grid-cols-3 gap-4 mb-6">
                                            <ResultCard
                                                label="Corpus at Retirement"
                                                value={formatCurrency(retirementResult.corpus_at_retirement)}
                                                sublabel={`At age ${retirementForm.retirement_age}`}
                                            />
                                            <ResultCard
                                                label="Monthly Income"
                                                value={formatCurrency(retirementResult.monthly_income_at_retirement)}
                                                sublabel="4% withdrawal rate"
                                            />
                                            <ResultCard
                                                label="Corpus Lasts Until"
                                                value={`Age ${retirementResult.corpus_lasts_until_age}`}
                                                sublabel="Based on expenses"
                                            />
                                        </div>

                                        {/* Additional Info */}
                                        <div className="grid grid-cols-2 gap-4 mb-6">
                                            <ResultCard
                                                label="Total Invested"
                                                value={formatCurrency(retirementResult.total_invested)}
                                            />
                                            <ResultCard
                                                label="Total Returns"
                                                value={formatCurrency(retirementResult.total_returns)}
                                            />
                                        </div>

                                        {/* Chart */}
                                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Retirement Corpus Growth</h3>
                                            <div className="h-80">
                                                <Line data={retirementChartData} options={chartOptions} />
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="bg-white rounded-xl shadow-sm p-12 border border-gray-200 flex flex-col items-center justify-center text-gray-400">
                                        <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p className="text-lg font-medium">Plan your retirement</p>
                                        <p className="text-sm">Enter your details to see projections</p>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Loan Results */}
                        {activeTab === 'loan' && (
                            <>
                                {loanResult ? (
                                    <>
                                        {/* Result Cards */}
                                        <div className="grid grid-cols-3 gap-4 mb-6">
                                            <ResultCard
                                                label="Monthly Payment"
                                                value={formatCurrency(loanResult.monthly_payment)}
                                                sublabel="EMI amount"
                                            />
                                            <ResultCard
                                                label="Total Interest"
                                                value={formatCurrency(loanResult.total_interest)}
                                                sublabel="Over loan term"
                                            />
                                            <ResultCard
                                                label="Payoff Date"
                                                value={loanResult.payoff_date}
                                                sublabel={`${loanResult.payoff_months} months`}
                                            />
                                        </div>

                                        {/* Savings with Extra Payment */}
                                        {loanForm.extra_monthly_payment > 0 && (
                                            <div className="grid grid-cols-2 gap-4 mb-6">
                                                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                                                    <p className="text-green-700 text-sm mb-1">Interest Saved</p>
                                                    <p className="text-2xl font-bold text-green-800">{formatCurrency(loanResult.interest_saved_with_extra)}</p>
                                                </div>
                                                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                                                    <p className="text-green-700 text-sm mb-1">Months Saved</p>
                                                    <p className="text-2xl font-bold text-green-800">{loanResult.months_saved_with_extra} months</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Chart */}
                                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Loan Balance Over Time</h3>
                                            <div className="h-80">
                                                <Line data={loanChartData} options={chartOptions} />
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="bg-white rounded-xl shadow-sm p-12 border border-gray-200 flex flex-col items-center justify-center text-gray-400">
                                        <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                        </svg>
                                        <p className="text-lg font-medium">Plan your loan payoff</p>
                                        <p className="text-sm">See how extra payments can help</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-[#003366] text-white py-6 mt-auto">
                <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
                            <span className="text-[#003366] font-bold text-xs">📊</span>
                        </div>
                        <span className="font-medium">Infosys FinCalc</span>
                    </div>
                    <div className="flex gap-4">
                        <a
                            href="https://x.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Visit X"
                            className="text-gray-300 hover:text-white"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                        </a>
                        <a
                            href="https://www.linkedin.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Visit LinkedIn"
                            className="text-gray-300 hover:text-white"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                        </a>
                        <a
                            href="https://www.facebook.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Visit Facebook"
                            className="text-gray-300 hover:text-white"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                        </a>
                    </div>
                </div>
                <div className="text-center text-gray-400 text-sm mt-4">
                    © 2026 Infosys FinCalc. All rights reserved.
                </div>
            </footer>
        </div>
    );
}

export default Simulator;