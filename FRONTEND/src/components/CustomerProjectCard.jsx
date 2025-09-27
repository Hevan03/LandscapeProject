import React from 'react';
import { useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import { toast } from 'react-hot-toast';
import { Download, Send } from 'lucide-react';
import { requestBlueprint } from '../api/landscapeApi';

const CustomerProjectCard = ({ project, onUpdate }) => {
  const navigate = useNavigate();

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(amount);
  };

  const handleRequestBlueprint = async () => {
    if (window.confirm("Are you sure you want to request a blueprint? This will add LKR 5,000 to your advance payment.")) {
        try {
            await requestBlueprint(project._id);
            toast.success('Blueprint requested! Your landscaper has been notified.');
            onUpdate();
        } catch (error) {
            toast.error('Failed to request blueprint.');
        }
    }
  };
  
  //CALCULATIONS FOR PAYMENTS
  const advancePercentage = 0.10;
  const balancePercentage = 0.90; 
  const blueprintCost = 5000;
  
  const advanceAmount = project.totalCost * advancePercentage;
  const totalAdvance = project.blueprintRequested ? advanceAmount + blueprintCost : advanceAmount;
  
  //Calculate the final balance
  const balanceAmount = project.totalCost * balancePercentage;

  return (
    <div className="card bg-base-100 shadow-xl border overflow-hidden flex flex-col">
      {project.projectImages && project.projectImages.length > 0 ? (
        <Slider {...sliderSettings}>
          {project.projectImages.map((image, index) => (
            <div key={index}>
              <img src={`http://localhost:5001/${image}`} alt={`Project ${index + 1}`} className="w-full h-64 object-cover"/>
            </div>
          ))}
        </Slider>
      ) : (
       <div className="w-full h-64 bg-gray-200 flex items-center justify-center"><p className="text-gray-500">No Images</p></div>
      )}

      <div className="card-body flex-grow">
        <h2 className="card-title">{project.name}</h2>
        <div className="badge badge-outline">{project.status}</div>
        <p className="text-lg font-semibold text-green-600 mt-2">
            Total Cost: {formatCurrency(project.totalCost)}
        </p>
        <p className="mt-2 text-gray-600 text-sm flex-grow">{project.description}</p>
        
        {/* --- Blueprint Section --- */}
        <div className="mt-4">
            <h3 className="font-semibold text-gray-700">Blueprint</h3>
            {!project.blueprintFile && !project.blueprintRequested && (
                <button onClick={handleRequestBlueprint} className="btn btn-sm btn-outline btn-accent w-full mt-2">
                    <Send size={16} className="mr-2"/> Request Blueprint (LKR 5,000)
                </button>
            )}
            {!project.blueprintFile && project.blueprintRequested && (
                <div className="text-sm text-accent p-2 bg-accent/10 rounded-md text-center mt-2">Awaiting blueprint from landscaper...</div>
            )}
            {project.blueprintFile && (
                <a href={`http://localhost:5001/${project.blueprintFile}`} download className="btn btn-sm btn-outline btn-primary w-full mt-2">
                    <Download size={16} className="mr-2"/> Download Blueprint
                </a>
            )}
        </div>
      </div>

      {/* --- THIS IS THE UPDATED FOOTER SECTION --- */}
      <div className="card-footer bg-base-200 p-4 flex justify-between items-center">
        {/* Condition : show "Pay Advance" button */}
        {project.status === 'Advance Payment Pending' && (
          <button className="btn btn-primary">
            <span className="font-bold">Pay Advance:</span>
            <span className="ml-2">{formatCurrency(totalAdvance)}</span>
            {project.blueprintRequested && <span className="text-xs ml-1">(incl. blueprint)</span>}
          </button>
        )}

        {/* Condition: Show "Pay Balance" button */}
        {project.status === 'Completed' && (
          <button className="btn btn-success">
            <span className="font-bold">Pay Balance:</span>
            <span className="ml-2">{formatCurrency(balanceAmount)}</span>
          </button>
        )}
        
 
        {project.status !== 'Advance Payment Pending' && project.status !== 'Completed' && (
            <div></div> 
        )}

        <button 
          onClick={() => navigate(`/customer/progress/${project._id}`)}
          className="btn btn-ghost text-primary"
        >
          View Progress
        </button>
      </div>
    </div>
  );
};

export default CustomerProjectCard;