interface StatCardProps {
    title: string;
    value: string;
    icon: React.ComponentType<{ size: number }>;
    color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color }) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
                </div>
                <div className={`${color} p-3 rounded-full text-white`}>
                    <Icon size={24} />
                </div>
            </div>
        </div>
    )
}

export default StatCard;