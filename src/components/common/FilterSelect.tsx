interface FilterSelectProps {
    options: string[];
    defaultValue: string;
}

const FilterSelect: React.FC<FilterSelectProps> = ({ options, defaultValue }) => {
    return (
        <select className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1ABA1A] focus:border-transparent">
            {options.map((option, index) => (
                <option key={index} selected={option === defaultValue}>
                    {option}
                </option>
            ))}
        </select>
    );
};

export default FilterSelect; 