import React from 'react';
import { Navbar, Image } from 'react-bootstrap';

const TopBar = ({ name }) => {
  return (
    <Navbar bg="light" className="border-bottom px-3 py-2">
      <Image
        src="https://via.placeholder.com/40"
        roundedCircle
        className="me-2"
      />
      <span className="fw-bold">{name}</span>
    </Navbar>
  );
};

export default TopBar;
