import React, { useEffect, useMemo, useState } from 'react';
import api from '../api';
import { jsPDF } from 'jspdf';
import SimulatorInput from './Simulator_input';
import SimulatorCharts from './SimulatorCharts';

function Simulator() {
    const [activeTab, setActiveTab] = useState('sip');
    const [loading, setLoading] = useState(false);
    const [goals, setGoals] = useState([]);

    const [sipForm, setSipForm] = useState({
        monthly_investment: 5000,
        expected_return_rate: 12,
        years: 15,
        goal_id: null,
    });
    const [sipResult, setSipResult] = useState(null);
    const [sipWhatIfResult, setSipWhatIfResult] = useState(null);
    const [sipWhatIfConfig, setSipWhatIfConfig] = useState({
        monthly_investment_delta: 5000,
    });

    const [retirementForm, setRetirementForm] = useState({
        current_age: 30,
        retirement_age: 60,
        current_savings: 50000,
        monthly_contribution: 2000,
        expected_return_rate: 8,
        post_retirement_return_rate: 5,
        inflation_rate: 3,
        monthly_expense_at_retirement: 5000,
        goal_id: null,
    });
    const [retirementResult, setRetirementResult] = useState(null);
    const [retirementWhatIfResult, setRetirementWhatIfResult] = useState(null);
    const [retirementWhatIfConfig, setRetirementWhatIfConfig] = useState({
        retirement_age_delta_years: -5,
        monthly_contribution_delta: 5000,
    });

    const [loanForm, setLoanForm] = useState({
        principal: 300000,
        annual_interest_rate: 7,
        loan_term_months: 360,
        extra_monthly_payment: 0,
        goal_id: null,
    });
    const [loanResult, setLoanResult] = useState(null);
    const [loanWhatIfResult, setLoanWhatIfResult] = useState(null);
    const [loanWhatIfConfig, setLoanWhatIfConfig] = useState({
        extra_monthly_payment_delta: 5000,
    });

    useEffect(() => {
        const loadGoals = async () => {
            try {
                const response = await api.get('/goals');
                const data = response?.data?.data || response?.data || [];
                const normalized = data.map((goal) => ({
                    id: goal.id,
                    name: goal.goal_name || goal.name || `Goal ${goal.id}`,
                }));
                setGoals(normalized);
            } catch (error) {
                console.error('Unable to load goals for simulator linkage:', error);
                setGoals([]);
            }
        };
        loadGoals();
    }, []);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        }).format(Number(value || 0));
    };

    const formatNumber = (value) => Number(value || 0).toLocaleString('en-US');

    const normalizeSimulationResult = (data) => data?.results || data;

    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

    const calculateSIPLocally = (monthly, years, rate) => {
        const monthlyRate = rate / 100 / 12;
        let totalInvested = 0;
        let totalValue = 0;
        const yearlyProjections = [];

        for (let year = 1; year <= years; year += 1) {
            for (let month = 0; month < 12; month += 1) {
                totalInvested += monthly;
                totalValue += monthly;
                totalValue *= 1 + monthlyRate;
            }
            yearlyProjections.push({
                year,
                invested_amount: Math.round(totalInvested * 100) / 100,
                interest_earned: Math.round((totalValue - totalInvested) * 100) / 100,
                total_value: Math.round(totalValue * 100) / 100,
            });
        }

        return {
            total_invested: Math.round(totalInvested * 100) / 100,
            estimated_returns: Math.round((totalValue - totalInvested) * 100) / 100,
            total_value: Math.round(totalValue * 100) / 100,
            annual_return_rate: rate,
            yearly_projections: yearlyProjections,
        };
    };

    const calculateRetirementLocally = (
        currentAge,
        retirementAge,
        currentSavings,
        monthlyContribution,
        expectedReturnRate,
        inflationRate,
        monthlyExpenseAtRetirement
    ) => {
        const yearsUntilRetirement = Math.max(0, retirementAge - currentAge);
        const monthlyRate = expectedReturnRate / 100 / 12;

        let corpus = currentSavings;
        let totalInvested = currentSavings;
        const yearlyProjections = [];

        for (let year = 1; year <= yearsUntilRetirement; year += 1) {
            for (let month = 0; month < 12; month += 1) {
                corpus += monthlyContribution;
                corpus *= 1 + monthlyRate;
                totalInvested += monthlyContribution;
            }

            yearlyProjections.push({
                age: currentAge + year,
                year,
                invested: Math.round(totalInvested * 100) / 100,
                corpus: Math.round(corpus * 100) / 100,
                phase: 'accumulation',
            });
        }

        const inflationMultiplier = Math.pow(1 + inflationRate / 100, yearsUntilRetirement);
        const inflationAdjustedExpense = monthlyExpenseAtRetirement * inflationMultiplier;
        const monthlyIncomeAtRetirement = (corpus * 0.04) / 12;

        return {
            years_until_retirement: yearsUntilRetirement,
            corpus_at_retirement: Math.round(corpus * 100) / 100,
            total_invested: Math.round(totalInvested * 100) / 100,
            total_returns: Math.round((corpus - totalInvested) * 100) / 100,
            monthly_income_at_retirement: Math.round(monthlyIncomeAtRetirement * 100) / 100,
            corpus_lasts_until_age: retirementAge,
            inflation_adjusted_expense: Math.round(inflationAdjustedExpense * 100) / 100,
            yearly_projections: yearlyProjections,
        };
    };

    const calculateLoanLocally = (principal, annualRate, termMonths, extraPayment = 0) => {
        const monthlyRate = annualRate / 100 / 12;

        let emi;
        if (monthlyRate > 0) {
            emi =
                (principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
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

            if (monthsPaid <= 12 || monthsPaid % 12 === 0) {
                amortization.push({
                    month: monthsPaid,
                    payment: Math.round(actualPayment * 100) / 100,
                    principal: Math.round(principalPayment * 100) / 100,
                    interest: Math.round(interestPayment * 100) / 100,
                    balance: Math.round(Math.max(0, balance) * 100) / 100,
                });
            }
        }

        const payoffDate = new Date();
        payoffDate.setMonth(payoffDate.getMonth() + monthsPaid);

        const interestSaved = standardInterest - totalInterest;
        const monthsSaved = termMonths - monthsPaid;

        return {
            monthly_payment: Math.round((emi + extraPayment) * 100) / 100,
            total_payment: Math.round(totalPaid * 100) / 100,
            total_interest: Math.round(totalInterest * 100) / 100,
            payoff_months: monthsPaid,
            payoff_date: payoffDate.toLocaleDateString(),
            interest_saved_with_extra: Math.round(Math.max(0, interestSaved) * 100) / 100,
            months_saved_with_extra: Math.max(0, monthsSaved),
            amortization_schedule: amortization,
        };
    };

    const runSIPSimulation = async ({ monthlyInvestment, years, expectedReturnRate, goalId, scenarioName }) => {
        try {
            const response = await api.post('/api/simulations/sip', {
                monthly_investment: Number(monthlyInvestment),
                years: Number(years),
                expected_return_rate: Number(expectedReturnRate),
                goal_id: goalId || null,
                scenario_name: scenarioName,
            });
            return normalizeSimulationResult(response.data);
        } catch (error) {
            console.error('SIP simulation failed, using local fallback:', error);
            return calculateSIPLocally(Number(monthlyInvestment), Number(years), Number(expectedReturnRate));
        }
    };

    const runRetirementSimulation = async ({
        currentAge,
        retirementAge,
        currentSavings,
        monthlyContribution,
        expectedReturnRate,
        postRetirementRate,
        inflationRate,
        monthlyExpense,
        goalId,
        scenarioName,
    }) => {
        try {
            const response = await api.post('/api/simulations/retirement', {
                current_age: Number(currentAge),
                retirement_age: Number(retirementAge),
                current_savings: Number(currentSavings),
                monthly_contribution: Number(monthlyContribution),
                expected_return_rate: Number(expectedReturnRate),
                post_retirement_return_rate: Number(postRetirementRate),
                inflation_rate: Number(inflationRate),
                monthly_expense_at_retirement: Number(monthlyExpense),
                goal_id: goalId || null,
                scenario_name: scenarioName,
            });
            return normalizeSimulationResult(response.data);
        } catch (error) {
            console.error('Retirement simulation failed, using local fallback:', error);
            return calculateRetirementLocally(
                Number(currentAge),
                Number(retirementAge),
                Number(currentSavings),
                Number(monthlyContribution),
                Number(expectedReturnRate),
                Number(inflationRate),
                Number(monthlyExpense)
            );
        }
    };

    const runLoanSimulation = async ({ principal, annualRate, termMonths, extraPayment, goalId, scenarioName }) => {
        try {
            const response = await api.post('/api/simulations/loan', {
                principal: Number(principal),
                annual_interest_rate: Number(annualRate),
                loan_term_months: Number(termMonths),
                extra_monthly_payment: Number(extraPayment),
                goal_id: goalId || null,
                scenario_name: scenarioName,
            });
            return normalizeSimulationResult(response.data);
        } catch (error) {
            console.error('Loan simulation failed, using local fallback:', error);
            return calculateLoanLocally(Number(principal), Number(annualRate), Number(termMonths), Number(extraPayment));
        }
    };

    const saveSimulation = async (simulationType, assumptions, result, whatIfResult = null, goalId = null) => {
        if (!result) {
            alert('Run a calculation before saving.');
            return;
        }

        try {
            await api.post('/simulations', {
                simulation_type: simulationType,
                scenario_name: `${simulationType.toUpperCase()} Simulation`,
                goal_id: goalId,
                assumptions,
                result,
                what_if_result: whatIfResult,
            });
            alert('Simulation saved successfully.');
        } catch (error) {
            console.error('Save simulation failed:', error);
            alert('Unable to save simulation right now.');
        }
    };

    const handleSIPCalculate = async () => {
        setLoading(true);
        try {
            const baseResult = await runSIPSimulation({
                monthlyInvestment: sipForm.monthly_investment,
                years: sipForm.years,
                expectedReturnRate: sipForm.expected_return_rate,
                goalId: sipForm.goal_id,
                scenarioName: 'SIP Base Plan',
            });
            setSipResult(baseResult);
            setSipWhatIfResult(null);
        } finally {
            setLoading(false);
        }
    };

    const handleSIPWhatIfCalculate = async () => {
        setLoading(true);
        try {
            if (!sipResult) {
                const baseResult = await runSIPSimulation({
                    monthlyInvestment: sipForm.monthly_investment,
                    years: sipForm.years,
                    expectedReturnRate: sipForm.expected_return_rate,
                    goalId: sipForm.goal_id,
                    scenarioName: 'SIP Base Plan',
                });
                setSipResult(baseResult);
            }

            const scenarioMonthly = Math.max(0, Number(sipForm.monthly_investment) + Number(sipWhatIfConfig.monthly_investment_delta));
            const whatIfResult = await runSIPSimulation({
                monthlyInvestment: scenarioMonthly,
                years: sipForm.years,
                expectedReturnRate: sipForm.expected_return_rate,
                goalId: sipForm.goal_id,
                scenarioName: 'SIP What-If Scenario',
            });
            setSipWhatIfResult(whatIfResult);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSIPSimulation = async () => {
        await saveSimulation(
            'sip',
            {
                ...sipForm,
                what_if: sipWhatIfConfig,
            },
            sipResult,
            sipWhatIfResult,
            sipForm.goal_id
        );
    };

    const handleRetirementCalculate = async () => {
        setLoading(true);
        try {
            const baseResult = await runRetirementSimulation({
                currentAge: retirementForm.current_age,
                retirementAge: retirementForm.retirement_age,
                currentSavings: retirementForm.current_savings,
                monthlyContribution: retirementForm.monthly_contribution,
                expectedReturnRate: retirementForm.expected_return_rate,
                postRetirementRate: retirementForm.post_retirement_return_rate,
                inflationRate: retirementForm.inflation_rate,
                monthlyExpense: retirementForm.monthly_expense_at_retirement,
                goalId: retirementForm.goal_id,
                scenarioName: 'Retirement Base Plan',
            });
            setRetirementResult(baseResult);
            setRetirementWhatIfResult(null);
        } finally {
            setLoading(false);
        }
    };

    const handleRetirementWhatIfCalculate = async () => {
        setLoading(true);
        try {
            if (!retirementResult) {
                const baseResult = await runRetirementSimulation({
                    currentAge: retirementForm.current_age,
                    retirementAge: retirementForm.retirement_age,
                    currentSavings: retirementForm.current_savings,
                    monthlyContribution: retirementForm.monthly_contribution,
                    expectedReturnRate: retirementForm.expected_return_rate,
                    postRetirementRate: retirementForm.post_retirement_return_rate,
                    inflationRate: retirementForm.inflation_rate,
                    monthlyExpense: retirementForm.monthly_expense_at_retirement,
                    goalId: retirementForm.goal_id,
                    scenarioName: 'Retirement Base Plan',
                });
                setRetirementResult(baseResult);
            }

            const scenarioRetirementAge = clamp(
                Number(retirementForm.retirement_age) + Number(retirementWhatIfConfig.retirement_age_delta_years),
                Number(retirementForm.current_age) + 1,
                90
            );
            const scenarioMonthlyContribution = Math.max(
                0,
                Number(retirementForm.monthly_contribution) + Number(retirementWhatIfConfig.monthly_contribution_delta)
            );

            const whatIfResult = await runRetirementSimulation({
                currentAge: retirementForm.current_age,
                retirementAge: scenarioRetirementAge,
                currentSavings: retirementForm.current_savings,
                monthlyContribution: scenarioMonthlyContribution,
                expectedReturnRate: retirementForm.expected_return_rate,
                postRetirementRate: retirementForm.post_retirement_return_rate,
                inflationRate: retirementForm.inflation_rate,
                monthlyExpense: retirementForm.monthly_expense_at_retirement,
                goalId: retirementForm.goal_id,
                scenarioName: 'Retirement What-If Scenario',
            });
            setRetirementWhatIfResult(whatIfResult);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveRetirementSimulation = async () => {
        await saveSimulation(
            'retirement',
            {
                ...retirementForm,
                what_if: retirementWhatIfConfig,
            },
            retirementResult,
            retirementWhatIfResult,
            retirementForm.goal_id
        );
    };

    const handleLoanCalculate = async () => {
        setLoading(true);
        try {
            const baseResult = await runLoanSimulation({
                principal: loanForm.principal,
                annualRate: loanForm.annual_interest_rate,
                termMonths: loanForm.loan_term_months,
                extraPayment: loanForm.extra_monthly_payment,
                goalId: loanForm.goal_id,
                scenarioName: 'Loan Base Plan',
            });
            setLoanResult(baseResult);
            setLoanWhatIfResult(null);
        } finally {
            setLoading(false);
        }
    };

    const handleLoanWhatIfCalculate = async () => {
        setLoading(true);
        try {
            if (!loanResult) {
                const baseResult = await runLoanSimulation({
                    principal: loanForm.principal,
                    annualRate: loanForm.annual_interest_rate,
                    termMonths: loanForm.loan_term_months,
                    extraPayment: loanForm.extra_monthly_payment,
                    goalId: loanForm.goal_id,
                    scenarioName: 'Loan Base Plan',
                });
                setLoanResult(baseResult);
            }

            const scenarioExtra = Math.max(
                0,
                Number(loanForm.extra_monthly_payment) + Number(loanWhatIfConfig.extra_monthly_payment_delta)
            );
            const whatIfResult = await runLoanSimulation({
                principal: loanForm.principal,
                annualRate: loanForm.annual_interest_rate,
                termMonths: loanForm.loan_term_months,
                extraPayment: scenarioExtra,
                goalId: loanForm.goal_id,
                scenarioName: 'Loan What-If Scenario',
            });
            setLoanWhatIfResult(whatIfResult);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveLoanSimulation = async () => {
        await saveSimulation(
            'loan',
            {
                ...loanForm,
                what_if: loanWhatIfConfig,
            },
            loanResult,
            loanWhatIfResult,
            loanForm.goal_id
        );
    };

    const sipWhatIfLabel = useMemo(() => {
        const delta = Number(sipWhatIfConfig.monthly_investment_delta || 0);
        return `What-If (${delta >= 0 ? '+' : '-'}${formatCurrency(Math.abs(delta))} monthly)`;
    }, [sipWhatIfConfig.monthly_investment_delta]);

    const retirementWhatIfLabel = useMemo(() => {
        const ageDelta = Number(retirementWhatIfConfig.retirement_age_delta_years || 0);
        const contributionDelta = Number(retirementWhatIfConfig.monthly_contribution_delta || 0);
        const agePart = ageDelta === 0 ? 'same retirement age' : `${ageDelta > 0 ? '+' : ''}${ageDelta} yrs retirement age`;
        const contribPart = `${contributionDelta >= 0 ? '+' : '-'}${formatCurrency(Math.abs(contributionDelta))} monthly`;
        return `What-If (${agePart}, ${contribPart})`;
    }, [retirementWhatIfConfig.retirement_age_delta_years, retirementWhatIfConfig.monthly_contribution_delta]);

    const loanWhatIfLabel = useMemo(() => {
        const delta = Number(loanWhatIfConfig.extra_monthly_payment_delta || 0);
        return `What-If (${delta >= 0 ? '+' : '-'}${formatCurrency(Math.abs(delta))} extra payment)`;
    }, [loanWhatIfConfig.extra_monthly_payment_delta]);

    const hasActiveResult =
        (activeTab === 'sip' && !!sipResult) ||
        (activeTab === 'retirement' && !!retirementResult) ||
        (activeTab === 'loan' && !!loanResult);

    const handleShareResults = async () => {
        if (!hasActiveResult) {
            alert('Run a calculation before sharing.');
            return;
        }

        const generatedAt = new Date().toLocaleString();
        let text = '';

        if (activeTab === 'sip' && sipResult) {
            text = [
                'SIP Simulation Summary',
                `Monthly Investment: ${formatCurrency(sipForm.monthly_investment)}`,
                `Tenure: ${sipForm.years} years`,
                `Expected Return: ${sipForm.expected_return_rate}%`,
                `Total Invested: ${formatCurrency(sipResult.total_invested)}`,
                `Estimated Returns: ${formatCurrency(sipResult.estimated_returns)}`,
                `Final Value: ${formatCurrency(sipResult.total_value)}`,
                sipWhatIfResult ? `${sipWhatIfLabel}: ${formatCurrency(sipWhatIfResult.total_value)}` : null,
                `Generated: ${generatedAt}`,
            ]
                .filter(Boolean)
                .join('\n');
        }

        if (activeTab === 'retirement' && retirementResult) {
            text = [
                'Retirement Planning Summary',
                `Current Age: ${retirementForm.current_age}`,
                `Retirement Age: ${retirementForm.retirement_age}`,
                `Current Savings: ${formatCurrency(retirementForm.current_savings)}`,
                `Monthly Contribution: ${formatCurrency(retirementForm.monthly_contribution)}`,
                `Expected Return: ${retirementForm.expected_return_rate}%`,
                `Corpus at Retirement: ${formatCurrency(retirementResult.corpus_at_retirement)}`,
                `Monthly Income at Retirement: ${formatCurrency(retirementResult.monthly_income_at_retirement)}`,
                `Corpus Lasts Until: Age ${retirementResult.corpus_lasts_until_age}`,
                retirementWhatIfResult
                    ? `${retirementWhatIfLabel}: ${formatCurrency(retirementWhatIfResult.corpus_at_retirement)}`
                    : null,
                `Generated: ${generatedAt}`,
            ]
                .filter(Boolean)
                .join('\n');
        }

        if (activeTab === 'loan' && loanResult) {
            text = [
                'Loan Payoff Summary',
                `Principal: ${formatCurrency(loanForm.principal)}`,
                `Rate: ${loanForm.annual_interest_rate}%`,
                `Term: ${loanForm.loan_term_months} months`,
                `Extra Monthly Payment: ${formatCurrency(loanForm.extra_monthly_payment)}`,
                `Monthly Payment: ${formatCurrency(loanResult.monthly_payment)}`,
                `Total Interest: ${formatCurrency(loanResult.total_interest)}`,
                `Payoff: ${loanResult.payoff_months} months (${loanResult.payoff_date})`,
                loanWhatIfResult ? `${loanWhatIfLabel}: ${loanWhatIfResult.payoff_months} months` : null,
                `Generated: ${generatedAt}`,
            ]
                .filter(Boolean)
                .join('\n');
        }

        try {
            if (navigator.share) {
                await navigator.share({
                    title: 'Wealth.AI Simulation Report',
                    text,
                });
            } else {
                await navigator.clipboard.writeText(text);
                alert('Simulation summary copied to clipboard.');
            }
        } catch (error) {
            console.error('Share failed:', error);
        }
    };

    const handleExportPDF = () => {
        if (!hasActiveResult) {
            alert('Run a calculation before exporting PDF.');
            return;
        }

        const doc = new jsPDF({ unit: 'mm', format: 'a4' });
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const marginX = 12;
        const contentWidth = pageWidth - marginX * 2;
        let y = 50;

        const palette = {
            ink: [8, 16, 40],
            slate: [74, 85, 104],
            text: [15, 23, 42],
            cyan: [0, 212, 255],
            blue: [59, 130, 246],
            mint: [16, 185, 129],
            surface: [245, 248, 255],
            line: [214, 224, 240],
        };

        const drawPageBackground = () => {
            doc.setFillColor(250, 252, 255);
            doc.rect(0, 0, pageWidth, pageHeight, 'F');
            doc.setFillColor(236, 245, 255);
            doc.rect(0, 0, pageWidth, 26, 'F');
            doc.setDrawColor(229, 238, 251);
            for (let i = 0; i < 8; i += 1) {
                const x = 8 + i * 26;
                doc.line(x, 0, x + 15, 26);
            }
        };

        const addPageFrame = () => {
            doc.setDrawColor(...palette.line);
            doc.setLineWidth(0.3);
            doc.roundedRect(8, 8, pageWidth - 16, pageHeight - 16, 2, 2);
            doc.setDrawColor(196, 208, 228);
            doc.line(marginX, pageHeight - 16, pageWidth - marginX, pageHeight - 16);
        };

        const newStyledPage = () => {
            doc.addPage();
            drawPageBackground();
            addPageFrame();
            y = 22;
        };

        const ensureSpace = (needed = 10) => {
            if (y + needed > pageHeight - 20) {
                newStyledPage();
            }
        };

        const addHeader = (title, subtitle, modelTag) => {
            drawPageBackground();
            addPageFrame();

            doc.setFillColor(...palette.ink);
            doc.roundedRect(marginX, 12, contentWidth, 30, 3, 3, 'F');
            doc.setFillColor(...palette.cyan);
            doc.rect(marginX, 12, contentWidth * 0.42, 1.4, 'F');
            doc.setFillColor(...palette.blue);
            doc.rect(marginX + contentWidth * 0.42, 12, contentWidth * 0.28, 1.4, 'F');

            doc.setTextColor(255, 255, 255);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(16);
            doc.text('WEALTH.AI // FUTURE REPORT', marginX + 4, 22);
            doc.setFontSize(12);
            doc.text(title, marginX + 4, 29);

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(209, 227, 255);
            doc.text(subtitle, marginX + 4, 35);

            if (modelTag) {
                doc.setFillColor(18, 40, 83);
                doc.roundedRect(pageWidth - marginX - 44, 17, 40, 11, 2, 2, 'F');
                doc.setTextColor(141, 244, 255);
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(8);
                doc.text(modelTag, pageWidth - marginX - 40, 24);
            }

            y = 50;
        };

        const addSection = (title) => {
            ensureSpace(14);
            doc.setFillColor(224, 239, 255);
            doc.roundedRect(marginX, y - 1, contentWidth, 8, 2, 2, 'F');
            doc.setFillColor(...palette.cyan);
            doc.circle(marginX + 4, y + 3, 1.1, 'F');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            doc.setTextColor(...palette.text);
            doc.text(title.toUpperCase(), marginX + 8, y + 4.5);
            y += 11;
        };

        const addMetricCards = (cards) => {
            if (!cards?.length) {
                return;
            }
            ensureSpace(24);
            const gap = 4;
            const cardWidth = (contentWidth - gap * (cards.length - 1)) / cards.length;
            cards.forEach((card, idx) => {
                const x = marginX + idx * (cardWidth + gap);
                const tint = card.tint || palette.blue;
                doc.setFillColor(242, 248, 255);
                doc.roundedRect(x, y, cardWidth, 20, 2, 2, 'F');
                doc.setFillColor(tint[0], tint[1], tint[2]);
                doc.rect(x, y, cardWidth, 1.5, 'F');
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(8);
                doc.setTextColor(...palette.slate);
                doc.text(card.label, x + 2.5, y + 6);
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(11);
                doc.setTextColor(...palette.text);
                doc.text(String(card.value), x + 2.5, y + 13);
                if (card.note) {
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(7.5);
                    doc.setTextColor(100, 116, 139);
                    doc.text(card.note, x + 2.5, y + 17.5);
                }
            });
            y += 24;
        };

        const addKeyValueGrid = (items) => {
            if (!items?.length) {
                return;
            }
            const colGap = 4;
            const colWidth = (contentWidth - colGap) / 2;
            items.forEach((item, idx) => {
                if (idx % 2 === 0) {
                    ensureSpace(11);
                }
                const isLeft = idx % 2 === 0;
                const x = isLeft ? marginX : marginX + colWidth + colGap;
                if (!isLeft && y > pageHeight - 20) {
                    ensureSpace(11);
                }

                doc.setFillColor(...palette.surface);
                doc.roundedRect(x, y, colWidth, 8.5, 1.5, 1.5, 'F');
                doc.setDrawColor(...palette.line);
                doc.roundedRect(x, y, colWidth, 8.5, 1.5, 1.5);

                doc.setFont('helvetica', 'normal');
                doc.setFontSize(8);
                doc.setTextColor(...palette.slate);
                doc.text(item.label, x + 2, y + 3.5);

                doc.setFont('helvetica', 'bold');
                doc.setFontSize(8.8);
                doc.setTextColor(...palette.text);
                doc.text(String(item.value), x + 2, y + 7.2);

                if (!isLeft) {
                    y += 10;
                }
            });

            if (items.length % 2 !== 0) {
                y += 10;
            }
        };

        const addMiniTable = (title, rows) => {
            if (!rows?.length) {
                return;
            }

            addSection(title);
            ensureSpace(12);

            doc.setFillColor(223, 236, 255);
            doc.roundedRect(marginX, y, contentWidth, 8, 1.5, 1.5, 'F');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8.5);
            doc.setTextColor(23, 37, 84);
            doc.text('POINT', marginX + 2, y + 5.3);
            doc.text('VALUE', marginX + 56, y + 5.3);
            doc.text('NOTES', marginX + 118, y + 5.3);
            y += 9;

            rows.slice(0, 12).forEach((row, idx) => {
                ensureSpace(7);
                if (idx % 2 === 0) {
                    doc.setFillColor(247, 250, 255);
                    doc.roundedRect(marginX, y - 1.5, contentWidth, 6.5, 1, 1, 'F');
                }
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(8.2);
                doc.setTextColor(...palette.text);
                doc.text(String(row.point), marginX + 2, y + 2.5);
                doc.text(String(row.value), marginX + 56, y + 2.5);
                doc.text(String(row.notes), marginX + 118, y + 2.5);
                y += 6.2;
            });
            y += 2;
        };

        const addFooter = () => {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7.5);
            doc.setTextColor(100, 116, 139);
            doc.text('Generated by Wealth.AI', marginX, pageHeight - 11);
            doc.text(new Date().toLocaleString(), pageWidth - marginX - 35, pageHeight - 11);
        };

        if (activeTab === 'sip' && sipResult) {
            addHeader('SIP Projection Report', `Generated ${new Date().toLocaleString()}`, 'SIM:SIP');
            addMetricCards([
                {
                    label: 'Final Corpus',
                    value: formatCurrency(sipResult.total_value),
                    note: 'Projected portfolio value',
                    tint: palette.cyan,
                },
                {
                    label: 'Estimated Returns',
                    value: formatCurrency(sipResult.estimated_returns),
                    note: 'Growth over principal',
                    tint: palette.mint,
                },
                {
                    label: 'Total Invested',
                    value: formatCurrency(sipResult.total_invested),
                    note: `${sipForm.years} year plan`,
                    tint: palette.blue,
                },
            ]);

            addSection('Inputs');
            addKeyValueGrid([
                { label: 'Monthly Investment', value: formatCurrency(sipForm.monthly_investment) },
                { label: 'Expected Return Rate', value: `${sipForm.expected_return_rate}%` },
                { label: 'Investment Horizon', value: `${sipForm.years} years` },
                { label: 'Linked Goal ID', value: sipForm.goal_id || 'Not linked' },
            ]);

            addSection('Results');
            const sipResultRows = [
                { label: 'Total Invested', value: formatCurrency(sipResult.total_invested) },
                { label: 'Estimated Returns', value: formatCurrency(sipResult.estimated_returns) },
                { label: 'Final Corpus', value: formatCurrency(sipResult.total_value) },
            ];
            if (sipWhatIfResult) {
                sipResultRows.push({ label: sipWhatIfLabel, value: formatCurrency(sipWhatIfResult.total_value) });
            }
            addKeyValueGrid(sipResultRows);

            addMiniTable(
                'Year-wise Snapshot',
                (sipResult.yearly_projections || []).map((row) => ({
                    point: `Year ${row.year}`,
                    value: formatCurrency(row.total_value),
                    notes: `Invested ${formatCurrency(row.invested_amount)}`,
                }))
            );

            addFooter();
            doc.save(`SIP_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
            return;
        }

        if (activeTab === 'retirement' && retirementResult) {
            addHeader('Retirement Planning Report', `Generated ${new Date().toLocaleString()}`, 'SIM:RET');
            addMetricCards([
                {
                    label: 'Corpus At Retirement',
                    value: formatCurrency(retirementResult.corpus_at_retirement),
                    note: `Target age ${retirementForm.retirement_age}`,
                    tint: palette.cyan,
                },
                {
                    label: 'Monthly Income',
                    value: formatCurrency(retirementResult.monthly_income_at_retirement),
                    note: 'At 4% withdrawal strategy',
                    tint: palette.mint,
                },
                {
                    label: 'Corpus Longevity',
                    value: `Age ${retirementResult.corpus_lasts_until_age}`,
                    note: 'Projected sustainability',
                    tint: palette.blue,
                },
            ]);

            addSection('Inputs');
            addKeyValueGrid([
                { label: 'Current Age', value: retirementForm.current_age },
                { label: 'Retirement Age', value: retirementForm.retirement_age },
                { label: 'Current Savings', value: formatCurrency(retirementForm.current_savings) },
                { label: 'Monthly Contribution', value: formatCurrency(retirementForm.monthly_contribution) },
                { label: 'Expected Return', value: `${retirementForm.expected_return_rate}%` },
                { label: 'Inflation', value: `${retirementForm.inflation_rate}%` },
                { label: 'Linked Goal ID', value: retirementForm.goal_id || 'Not linked' },
            ]);

            addSection('Results');
            const retirementRows = [
                { label: 'Corpus at Retirement', value: formatCurrency(retirementResult.corpus_at_retirement) },
                {
                    label: 'Monthly Retirement Income',
                    value: formatCurrency(retirementResult.monthly_income_at_retirement),
                },
                { label: 'Corpus Lasts Until', value: `Age ${retirementResult.corpus_lasts_until_age}` },
                { label: 'Total Invested', value: formatCurrency(retirementResult.total_invested) },
                { label: 'Total Returns', value: formatCurrency(retirementResult.total_returns) },
            ];
            if (retirementWhatIfResult) {
                retirementRows.push({
                    label: retirementWhatIfLabel,
                    value: formatCurrency(retirementWhatIfResult.corpus_at_retirement),
                });
            }
            addKeyValueGrid(retirementRows);

            addMiniTable(
                'Corpus Growth Snapshot',
                (retirementResult.yearly_projections || [])
                    .filter((row) => row.phase === 'accumulation')
                    .map((row) => ({
                        point: `Age ${row.age}`,
                        value: formatCurrency(row.corpus),
                        notes: `Invested ${formatCurrency(row.invested)}`,
                    }))
            );

            addFooter();
            doc.save(`Retirement_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
            return;
        }

        if (activeTab === 'loan' && loanResult) {
            addHeader('Loan Payoff Report', `Generated ${new Date().toLocaleString()}`, '');
            addMetricCards([
                {
                    label: 'Payoff Timeline',
                    value: `${formatNumber(loanResult.payoff_months)} months`,
                    note: loanResult.payoff_date,
                    tint: palette.cyan,
                },
                {
                    label: 'Total Interest',
                    value: formatCurrency(loanResult.total_interest),
                    note: 'Total cost of borrowing',
                    tint: palette.blue,
                },
                {
                    label: 'Monthly Payment',
                    value: formatCurrency(loanResult.monthly_payment),
                    note: 'Base EMI estimate',
                    tint: palette.mint,
                },
            ]);

            addSection('Inputs');
            addKeyValueGrid([
                { label: 'Principal', value: formatCurrency(loanForm.principal) },
                { label: 'Annual Interest Rate', value: `${loanForm.annual_interest_rate}%` },
                { label: 'Loan Term', value: `${loanForm.loan_term_months} months` },
                { label: 'Extra Monthly Payment', value: formatCurrency(loanForm.extra_monthly_payment) },
                { label: 'Linked Goal ID', value: loanForm.goal_id || 'Not linked' },
            ]);

            addSection('Results');
            const loanRows = [
                { label: 'Monthly Payment', value: formatCurrency(loanResult.monthly_payment) },
                { label: 'Total Payment', value: formatCurrency(loanResult.total_payment) },
                { label: 'Total Interest', value: formatCurrency(loanResult.total_interest) },
                { label: 'Payoff Time', value: `${formatNumber(loanResult.payoff_months)} months` },
                { label: 'Payoff Date', value: loanResult.payoff_date },
                { label: 'Interest Saved (Extra)', value: formatCurrency(loanResult.interest_saved_with_extra) },
                { label: 'Months Saved (Extra)', value: `${formatNumber(loanResult.months_saved_with_extra)} months` },
            ];
            if (loanWhatIfResult) {
                loanRows.push({
                    label: loanWhatIfLabel,
                    value: `${formatNumber(loanWhatIfResult.payoff_months)} months`,
                });
            }
            addKeyValueGrid(loanRows);

            addMiniTable(
                'Amortization Snapshot',
                (loanResult.amortization_schedule || []).map((row) => ({
                    point: `Month ${row.month}`,
                    value: formatCurrency(row.balance),
                    notes: `Principal ${formatCurrency(row.principal)}`,
                }))
            );

            addFooter();
            doc.save(`Loan_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
        }
    };

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

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-gray-100 border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex gap-1">
                        <TabButton id="sip" label="SIP Calculator" />
                        <TabButton id="retirement" label="Retirement Planning" />
                        <TabButton id="loan" label="Loan Payoff" />
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    <SimulatorInput
                        activeTab={activeTab}
                        goals={goals}
                        sipForm={sipForm}
                        setSipForm={setSipForm}
                        sipWhatIfConfig={sipWhatIfConfig}
                        setSipWhatIfConfig={setSipWhatIfConfig}
                        retirementForm={retirementForm}
                        setRetirementForm={setRetirementForm}
                        retirementWhatIfConfig={retirementWhatIfConfig}
                        setRetirementWhatIfConfig={setRetirementWhatIfConfig}
                        loanForm={loanForm}
                        setLoanForm={setLoanForm}
                        loanWhatIfConfig={loanWhatIfConfig}
                        setLoanWhatIfConfig={setLoanWhatIfConfig}
                        handleSIPCalculate={handleSIPCalculate}
                        handleSIPWhatIfCalculate={handleSIPWhatIfCalculate}
                        handleSaveSIPSimulation={handleSaveSIPSimulation}
                        handleRetirementCalculate={handleRetirementCalculate}
                        handleRetirementWhatIfCalculate={handleRetirementWhatIfCalculate}
                        handleSaveRetirementSimulation={handleSaveRetirementSimulation}
                        handleLoanCalculate={handleLoanCalculate}
                        handleLoanWhatIfCalculate={handleLoanWhatIfCalculate}
                        handleSaveLoanSimulation={handleSaveLoanSimulation}
                        loading={loading}
                    />

                    <SimulatorCharts
                        activeTab={activeTab}
                        loading={loading}
                        sipResult={sipResult}
                        sipWhatIfResult={sipWhatIfResult}
                        retirementResult={retirementResult}
                        retirementWhatIfResult={retirementWhatIfResult}
                        loanResult={loanResult}
                        loanWhatIfResult={loanWhatIfResult}
                        sipForm={sipForm}
                        retirementForm={retirementForm}
                        loanForm={loanForm}
                        formatCurrency={formatCurrency}
                        hasActiveResult={hasActiveResult}
                        onExportPDF={handleExportPDF}
                        onShareResults={handleShareResults}
                        sipWhatIfLabel={sipWhatIfLabel}
                        retirementWhatIfLabel={retirementWhatIfLabel}
                        loanWhatIfLabel={loanWhatIfLabel}
                    />
                </div>
            </div>
        </div>
    );
}

export default Simulator;
