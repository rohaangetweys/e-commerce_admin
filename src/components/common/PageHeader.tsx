import { FiPlusCircle } from 'react-icons/fi';
import Button from './Button';

interface PageHeaderProps {
    title: string;
    buttonText: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, buttonText }) => {
    return (
        <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
            <Button variant="success">
                <FiPlusCircle size={20} />
                {buttonText}
            </Button>
        </div>
    );
};

export default PageHeader;