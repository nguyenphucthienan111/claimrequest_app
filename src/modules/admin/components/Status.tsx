import React from 'react';
import styled from 'styled-components';

interface StatusProps {
  color?: string; // Màu có thể tùy chọn, mặc định là #3950cf nếu không truyền
}

const Status: React.FC<StatusProps> = ({ color = '#3950cf' }) => {
  return (
    <StyledWrapper color={color}>
      <div className="ping" />
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div<{ color: string }>`
  .ping {
    --uib-size: 50px;
    --uib-speed: 1.5s;
    --uib-color: ${(props) => props.color}; 
    position: relative;
    height: var(--uib-size);
    width: var(--uib-size);
  }

  .ping::before,
  .ping::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    border-radius: 50%;
    background-color: var(--uib-color);
    animation: pulse7132 var(--uib-speed) linear infinite;
    transform: scale(0);
    opacity: 0;
  }

  .ping::after {
    animation-delay: calc(var(--uib-speed) / -2);
  }

  @keyframes pulse7132 {
    0% {
      transform: scale(0);
      opacity: 1;
    }
    100% {
      transform: scale(1);
      opacity: 0;
    }
  }
`;

export default Status;