import React from 'react';

const RiskProfileBadge = ({ riskProfile, size = 'md' }) => {
    const profiles = {
        conservative: {
            label: 'Conservative',
            bg: 'bg-blue-100',
            text: 'text-blue-800'
        },
        moderate: {
            label: 'Moderate',
            bg: 'bg-amber-100',
            text: 'text-amber-800'
        },
        aggressive: {
            label: 'Aggressive',
            bg: 'bg-red-100',
            text: 'text-red-800'
        }
    };

    const sizes = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
        lg: 'px-4 py-1.5 text-base'
    };

    const profile = profiles[riskProfile?.toLowerCase()] || profiles.moderate;

    return (
        <span className={`inline-flex items-center rounded-full font-medium ${profile.bg} ${profile.text} ${sizes[size]}`}>
            {profile.label}
        </span>
    );
};

export default RiskProfileBadge;