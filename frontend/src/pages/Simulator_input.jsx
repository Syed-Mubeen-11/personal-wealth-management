import React from 'react';

function SimulatorInput(props) {
  const {
    activeTab,
    goals,
    sipForm,
    setSipForm,
    sipWhatIfConfig,
    setSipWhatIfConfig,
    retirementForm,
    setRetirementForm,
    retirementWhatIfConfig,
    setRetirementWhatIfConfig,
    loanForm,
    setLoanForm,
    loanWhatIfConfig,
    setLoanWhatIfConfig,
    handleSIPCalculate,
    handleSIPWhatIfCalculate,
    handleSaveSIPSimulation,
    handleRetirementCalculate,
    handleRetirementWhatIfCalculate,
    handleSaveRetirementSimulation,
    handleLoanCalculate,
    handleLoanWhatIfCalculate,
    handleSaveLoanSimulation,
    loading,
  } = props;

  const InputWithSlider = ({ label, value, onChange, min, max, step = 1 }) => (
    <div className="mb-6">
      <label className="block text-gray-700 font-medium mb-2">{label}</label>

      <input
        type="number"
        value={value}
        onChange={(e) => {
          if (e.target.value === '') {
            onChange('');
            return;
          }

          const val = Number(e.target.value);
          if (val < min) return;
          onChange(val);
        }}
        className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-2"
      />

      <input
        type="range"
        value={Number(value || 0)}
        onChange={(e) => {
          const val = parseFloat(e.target.value);
          if (val < min || val > max) return;
          onChange(val);
        }}
        min={min}
        max={max}
        step={step}
        className="w-full h-2 bg-blue-100 rounded-lg cursor-pointer"
      />
    </div>
  );

  const GoalSelector = ({ value, onChange }) => (
    <div className="mb-6">
      <label className="block text-gray-700 font-medium mb-2">Link To Goal (Optional)</label>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
        className="w-full border border-gray-300 rounded-lg px-4 py-3"
      >
        <option value="">Not linked</option>
        {goals.map((goal) => (
          <option key={goal.id} value={goal.id}>
            {goal.name}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="lg:w-1/3">
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        {activeTab === 'sip' && (
          <>
            <h2 className="text-xl font-semibold mb-6">SIP Details</h2>

            <GoalSelector
              value={sipForm.goal_id}
              onChange={(val) => setSipForm({ ...sipForm, goal_id: val })}
            />

            <InputWithSlider
              label="Monthly Contribution"
              value={sipForm.monthly_investment}
              onChange={(val) => setSipForm({ ...sipForm, monthly_investment: val })}
              min={100}
              max={50000}
              step={100}
            />

            <InputWithSlider
              label="Expected Return (%)"
              value={sipForm.expected_return_rate}
              onChange={(val) => setSipForm({ ...sipForm, expected_return_rate: val })}
              min={1}
              max={30}
              step={0.5}
            />

            <InputWithSlider
              label="Target Date (Years)"
              value={sipForm.years}
              onChange={(val) => setSipForm({ ...sipForm, years: val })}
              min={1}
              max={40}
              step={1}
            />

            <InputWithSlider
              label="What-If: Monthly Contribution Change"
              value={sipWhatIfConfig.monthly_investment_delta}
              onChange={(val) =>
                setSipWhatIfConfig({ ...sipWhatIfConfig, monthly_investment_delta: val })
              }
              min={-10000}
              max={50000}
              step={500}
            />

            <button
              onClick={handleSIPCalculate}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg mb-3"
            >
              {loading ? 'Calculating...' : 'Calculate SIP'}
            </button>

            <button
              onClick={handleSIPWhatIfCalculate}
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg mb-3"
            >
              {loading ? 'Calculating...' : 'Run What-If Scenario'}
            </button>

            <button
              onClick={handleSaveSIPSimulation}
              disabled={loading}
              className="w-full bg-purple-600 text-white py-3 rounded-lg"
            >
              Save Simulation
            </button>
          </>
        )}

        {activeTab === 'retirement' && (
          <>
            <h2 className="text-xl font-semibold mb-6">Retirement Details</h2>

            <GoalSelector
              value={retirementForm.goal_id}
              onChange={(val) => setRetirementForm({ ...retirementForm, goal_id: val })}
            />

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Current Age</label>
                <input
                  type="number"
                  value={retirementForm.current_age}
                  onChange={(e) =>
                    setRetirementForm({
                      ...retirementForm,
                      current_age: Number(e.target.value) || 0,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Retirement Age</label>
                <input
                  type="number"
                  value={retirementForm.retirement_age}
                  onChange={(e) =>
                    setRetirementForm({
                      ...retirementForm,
                      retirement_age: Number(e.target.value) || 0,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                />
              </div>
            </div>

            <InputWithSlider
              label="Current Savings"
              value={retirementForm.current_savings}
              onChange={(val) => setRetirementForm({ ...retirementForm, current_savings: val })}
              min={0}
              max={1000000}
              step={1000}
            />

            <InputWithSlider
              label="Monthly Contribution"
              value={retirementForm.monthly_contribution}
              onChange={(val) => setRetirementForm({ ...retirementForm, monthly_contribution: val })}
              min={100}
              max={20000}
              step={100}
            />

            <InputWithSlider
              label="Expected Return (%)"
              value={retirementForm.expected_return_rate}
              onChange={(val) => setRetirementForm({ ...retirementForm, expected_return_rate: val })}
              min={1}
              max={15}
              step={0.5}
            />

            <InputWithSlider
              label="Post-Retirement Return (%)"
              value={retirementForm.post_retirement_return_rate}
              onChange={(val) =>
                setRetirementForm({ ...retirementForm, post_retirement_return_rate: val })
              }
              min={1}
              max={12}
              step={0.5}
            />

            <InputWithSlider
              label="Inflation Rate (%)"
              value={retirementForm.inflation_rate}
              onChange={(val) => setRetirementForm({ ...retirementForm, inflation_rate: val })}
              min={1}
              max={10}
              step={0.25}
            />

            <InputWithSlider
              label="Monthly Expense At Retirement"
              value={retirementForm.monthly_expense_at_retirement}
              onChange={(val) =>
                setRetirementForm({ ...retirementForm, monthly_expense_at_retirement: val })
              }
              min={1000}
              max={80000}
              step={500}
            />

            <InputWithSlider
              label="What-If: Retirement Age Shift (Years)"
              value={retirementWhatIfConfig.retirement_age_delta_years}
              onChange={(val) =>
                setRetirementWhatIfConfig({ ...retirementWhatIfConfig, retirement_age_delta_years: val })
              }
              min={-15}
              max={15}
              step={1}
            />

            <InputWithSlider
              label="What-If: Monthly Contribution Change"
              value={retirementWhatIfConfig.monthly_contribution_delta}
              onChange={(val) =>
                setRetirementWhatIfConfig({ ...retirementWhatIfConfig, monthly_contribution_delta: val })
              }
              min={-10000}
              max={50000}
              step={500}
            />

            <button
              onClick={handleRetirementCalculate}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg mb-3"
            >
              {loading ? 'Calculating...' : 'Calculate Retirement'}
            </button>

            <button
              onClick={handleRetirementWhatIfCalculate}
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg mb-3"
            >
              {loading ? 'Calculating...' : 'Run What-If Scenario'}
            </button>

            <button
              onClick={handleSaveRetirementSimulation}
              disabled={loading}
              className="w-full bg-purple-600 text-white py-3 rounded-lg"
            >
              Save Simulation
            </button>
          </>
        )}

        {activeTab === 'loan' && (
          <>
            <h2 className="text-xl font-semibold mb-6">Loan Details</h2>

            <GoalSelector
              value={loanForm.goal_id}
              onChange={(val) => setLoanForm({ ...loanForm, goal_id: val })}
            />

            <InputWithSlider
              label="Loan Amount"
              value={loanForm.principal}
              onChange={(val) => setLoanForm({ ...loanForm, principal: val })}
              min={10000}
              max={1000000}
              step={1000}
            />

            <InputWithSlider
              label="Annual Interest Rate (%)"
              value={loanForm.annual_interest_rate}
              onChange={(val) => setLoanForm({ ...loanForm, annual_interest_rate: val })}
              min={1}
              max={20}
              step={0.25}
            />

            <InputWithSlider
              label="Loan Term (Months)"
              value={loanForm.loan_term_months}
              onChange={(val) => setLoanForm({ ...loanForm, loan_term_months: val })}
              min={12}
              max={420}
              step={12}
            />

            <InputWithSlider
              label="Extra Monthly Payment"
              value={loanForm.extra_monthly_payment}
              onChange={(val) => setLoanForm({ ...loanForm, extra_monthly_payment: val })}
              min={0}
              max={5000}
              step={100}
            />

            <InputWithSlider
              label="What-If: Extra Payment Change"
              value={loanWhatIfConfig.extra_monthly_payment_delta}
              onChange={(val) =>
                setLoanWhatIfConfig({ ...loanWhatIfConfig, extra_monthly_payment_delta: val })
              }
              min={-5000}
              max={20000}
              step={250}
            />

            <button
              onClick={handleLoanCalculate}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg mb-3"
            >
              {loading ? 'Calculating...' : 'Calculate Loan'}
            </button>

            <button
              onClick={handleLoanWhatIfCalculate}
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg mb-3"
            >
              {loading ? 'Calculating...' : 'Run What-If Scenario'}
            </button>

            <button
              onClick={handleSaveLoanSimulation}
              disabled={loading}
              className="w-full bg-purple-600 text-white py-3 rounded-lg"
            >
              Save Simulation
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default SimulatorInput;
