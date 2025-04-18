import './Styles/Loadspinner.css';

export default function Loadingspinner({ fullPage = false }) {
  return (
    <div className={`spinner-container ${fullPage ? 'full-page' : ''}`}>
      <div className="spinner">
        <div className="spinner-blade"></div>
        <div className="spinner-blade"></div>
        <div className="spinner-blade"></div>
        <div className="spinner-blade"></div>
        <div className="spinner-blade"></div>
        <div className="spinner-blade"></div>
        <div className="spinner-blade"></div>
        <div className="spinner-blade"></div>
      </div>
    </div>
  );
}