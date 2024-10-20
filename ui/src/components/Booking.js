import React from 'react';

function Booking() {
  const bookingUrl = 'https://www.engagementrx.com/sensablehealth/app/#!/flow/id/2c2a2dcf-58e2-4d1d-b1aa-3d12117ad2e7/17c1bedc-1938-425c-a56a-000d25f9e8d9/1/1';
  const coursesUrl = 'https://www.engagementrx.com/sensablehealth/app/#!/page/9d835ce3-34ef-4e8e-ab53-4de76af77b48';

  return (
    <div className="booking-container">
      <h2>Booking Page</h2>
      <iframe
        src={coursesUrl}
        title="Booking Page"
        width="100%"
        height="600px"
        style={{border: 'none'}}
      />
    </div>
  );
}

export default Booking;
