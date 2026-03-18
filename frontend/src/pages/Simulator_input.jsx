import React from "react";

function SimulatorInput(props) {
  const {
    activeTab,
    sipForm,
    setSipForm,
    retirementForm,
    setRetirementForm,
    loanForm,
    setLoanForm,
    handleSIPCalculate,
    handleRetirementCalculate,
    handleLoanCalculate,
    loading,
  } = props;

  // InputWithSlider component
  const InputWithSlider = ({
    label,
    value,
    onChange,
    min,
    max,
    step = 1,
    unit = "",
  }) => (
    <div className="mb-6">
      <label className="block text-gray-700 font-medium mb-2">{label}</label>

      <input
        type="number"
        value={value}
        onChange={(e) => {
          if (e.target.value === "") {
            onChange(""); // allow empty while typing
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
        value={value}
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

  return (
    <div className="lg:w-1/3">
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        {/* SIP */}
        {activeTab === "sip" && (
          <>
            <h2 className="text-xl font-semibold mb-6">SIP Details</h2>

            <InputWithSlider
              label="Monthly Contribution"
              value={sipForm.monthly_investment}
              onChange={(val) =>
                setSipForm({ ...sipForm, monthly_investment: val })
              }
              min={100}
              max={50000}
            />

            <InputWithSlider
              label="Expected Return"
              value={sipForm.expected_return_rate}
              onChange={(val) =>
                setSipForm({ ...sipForm, expected_return_rate: val })
              }
              min={1}
              max={30}
            />

            <InputWithSlider
              label="Target Date (Years)"
              value={sipForm.years}
              onChange={(val) => setSipForm({ ...sipForm, years: val })}
              min={1}
              max={40}
            />

            <button
              onClick={handleSIPCalculate}
              className="w-full bg-blue-600 text-white py-3 rounded-lg"
            >
              {loading ? "Calculating..." : "Calculate SIP"}
            </button>
          </>
        )}

        {/* Retirement */}
        {activeTab === "retirement" && (
          <>
            <h2 className="text-xl font-semibold mb-6">Retirement Details</h2>

            <InputWithSlider
              label="Current Savings"
              value={retirementForm.current_savings}
              onChange={(val) =>
                setRetirementForm({ ...retirementForm, current_savings: val })
              }
              min={0}
              max={1000000}
            />

            <InputWithSlider
              label="Monthly Contribution"
              value={retirementForm.monthly_contribution}
              onChange={(val) =>
                setRetirementForm({
                  ...retirementForm,
                  monthly_contribution: val,
                })
              }
              min={100}
              max={20000}
            />

            <button
              onClick={handleRetirementCalculate}
              className="w-full bg-blue-600 text-white py-3 rounded-lg"
            >
              Calculate Retirement
            </button>
          </>
        )}

        {/* Loan */}
        {activeTab === "loan" && (
          <>
            <h2 className="text-xl font-semibold mb-6">Loan Details</h2>

            <InputWithSlider
              label="Loan Amount"
              value={loanForm.principal}
              onChange={(val) => setLoanForm({ ...loanForm, principal: val })}
              min={10000}
              max={1000000}
            />

            <button
              onClick={handleLoanCalculate}
              className="w-full bg-blue-600 text-white py-3 rounded-lg"
            >
              Calculate Loan
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default SimulatorInput;
