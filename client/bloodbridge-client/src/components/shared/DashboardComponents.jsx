import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Minimal Stat Card
 */
export const StatCard = ({ icon: Icon, title, value, iconBg, iconColor, trend }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
            <div className={`${iconBg} p-3 rounded-lg ${iconColor}`}>
                <Icon className="w-6 h-6" />
            </div>
            {trend && (
                <span className={`text-xs font-medium px-2 py-1 rounded ${trend.startsWith('+') ? 'text-green-600 bg-green-50' :
                        trend.startsWith('-') ? 'text-red-600 bg-red-50' :
                            'text-gray-600 bg-gray-50'
                    }`}>
                    {trend}
                </span>
            )}
        </div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
);

/**
 * Minimal Action Card
 */
export const ActionCard = ({ href, target, onClick, icon: Icon, title, description, count, colorClass }) => {
    const content = (
        <>
            <div className="p-6">
                <div className={`w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center mb-4 ${colorClass || 'text-red-600'}`}>
                    <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {title}
                </h3>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">{description}</p>
                {count !== undefined && (
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-gray-900">{count}</span>
                        <span className="text-xs font-medium text-gray-500">Active</span>
                    </div>
                )}
            </div>
        </>
    );

    const className = "bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow block h-full";

    if (href) {
        if (href.startsWith('http') || target === '_blank') {
            return (
                <a href={href} target={target} rel="noopener noreferrer" className={className}>
                    {content}
                </a>
            );
        }
        return (
            <Link to={href} className={className}>
                {content}
            </Link>
        );
    }

    return (
        <button onClick={onClick} className={`${className} text-left w-full`}>
            {content}
        </button>
    );
};

/**
 * Minimal Insight Card
 */
export const InsightCard = ({ icon: Icon, title, description, stats, gradient }) => (
    <div className="bg-white border border-gray-100 rounded-lg p-6 hover:shadow-md transition-shadow h-full">
        <div className="flex items-start mb-6">
            <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-lg flex items-center justify-center mr-4`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
                <h3 className="text-base font-semibold text-gray-900 mb-1">{title}</h3>
                <p className="text-xs font-medium text-gray-500">{description}</p>
            </div>
        </div>

        <div className="space-y-3">
            {stats.map((stat, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full ${stat.color} mr-3`}></div>
                        <span className="text-sm font-medium text-gray-600">{stat.label}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{stat.value}</span>
                </div>
            ))}
        </div>
    </div>
);

/**
 * Minimal Page Header
 */
export const PageHeader = ({ title, subtitle, icon: Icon }) => (
    <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-lg p-8 shadow-md mb-8">
        <div className="flex items-center mb-2">
            {Icon && (
                <div className="p-2 bg-white/10 rounded-lg mr-4">
                    <Icon className="w-8 h-8 text-white" />
                </div>
            )}
            <h1 className="text-3xl font-bold text-white">{title}</h1>
        </div>
        {subtitle && <p className="text-red-50 text-sm mt-2">{subtitle}</p>}
    </div>
);
