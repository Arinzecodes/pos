import React, { useEffect, useState } from 'react'; //jjj
import QRCode from 'react-qr-code';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import './styles.css';
import redpayLogo from './images/redpay_logo-removebg-preview.png';
import ubaLogo from './images/nigeria-united-bank-for-africa-logo-financial-services-bank-removebg-preview.png';

const Receipt = () => {
  const [transaction, setTransaction] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const deviceSerial = urlParams.get('deviceSerial') || '98210627990007';
    const virtualTerminalId = urlParams.get('virtualTerminalId') || 'RP83NMAAFK';
    const transactionRRN = urlParams.get('transactionRRN') || '250319111219';

    const apiUrl = `https://performance-report.staging.redpay.africa/api/v1/Reports/transaction/terminal/receipt?deviceSerial=${deviceSerial}&virtualTerminalId=${virtualTerminalId}&transactionRRN=${transactionRRN}`;

    fetch(apiUrl, { headers: { Accept: 'application/json' } })
      .then(res => res.json())
      .then(data => {
        if (data.status && data.data) {
          setTransaction(data.data);
        }
      })
      .catch(err => console.error('Fetch error:', err));
  }, []);

  const downloadPDF = () => {
    const receiptElement = document.getElementById('receipt');
    if (!receiptElement) return;

    html2canvas(receiptElement).then(canvas => {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });

      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save('receipt.pdf');
    });
  };

  if (!transaction) return <p>Loading transaction details...</p>;

  return (
    <div className="receipt-container">
      <div id="receipt" className="receipt">
        <div className="receipt-header">
          <img src={redpayLogo} alt="RedPay Logo" width={100} height={100} />
          <h2>Receipt</h2>
          <img src={ubaLogo} alt="UBA Logo" width={100} height={100} />
        </div>
        <div className="merchant-info">
          <p><strong>{transaction.merchantName}</strong></p>
          <p>{transaction.merchantAddress}</p>
        </div>
        <hr />
        <div className="transaction-info">
          <p><strong>M/ID:</strong> {transaction.merchantID}</p>
          <p><strong>P/Type:</strong> {transaction.paymentType}</p>
          {transaction.paymentType?.toLowerCase().includes('card') && (
            <>
              <p><strong>Card Name:</strong> {transaction.cardName}</p>
              <p><strong>Card No:</strong> {transaction.cardPan}</p>
              <p><strong>Issuer:</strong> {transaction.issuerName}</p>
              <p><strong>Exp. Date:</strong> {transaction.expDate}</p>
              <p><strong>C/Scheme:</strong> {transaction.cardScheme}</p>
            </>
          )}
          <p><strong>Stan#:</strong> {transaction.stan}</p>
          <p><strong>D/Time:</strong> {new Date(transaction.transactionDate).toLocaleString()}</p>
          <p><strong>RRN:</strong> {transaction.retrievalReferenceNumber}</p>
          <p className="bold large">
            Amount: NGN {transaction.amount.toFixed(2)}
          </p>
        </div>
        <hr />
        <div className="qr-code">
          <p>Transaction Status</p>
          <QRCode value={transaction.retrievalReferenceNumber} size={100} />
        </div>
      </div>
      <button onClick={downloadPDF}>Download PDF</button>
    </div>
  );
};

export default Receipt;