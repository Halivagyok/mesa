import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHouseChimney, FaBars, FaXmark } from 'react-icons/fa6';
import { Resizable } from 're-resizable';
import { useAuth } from '../contexts/AuthContext';
import UserMenu from './UserMenu';
import ChatList from './ChatList';
import ChatRequests from './ChatRequests';

const Button = ({ text, to }) => {
  const navigate = useNavigate();
  return (
    <button className="flex text-2xl items-start mx-auto" onClick={() => navigate(to)}>
      {text}
    </button>
  );
};

export function Navigation() {
  const { currentUser } = useAuth();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isOpen, setIsOpen] = useState(!isMobile);
  const [width, setWidth] = useState(250);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsOpen(true);
      } else {
        setIsOpen(false)
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full justify-between py-4 px-4 bg-black/60 text-white">
      <div>
        <Button text={<FaHouseChimney />} to="/" />
        <div className="mt-4 overflow-y-auto">
          {currentUser && (
            <>
              <ChatList />
            </>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-4">
        {currentUser ? <UserMenu /> : null}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
        <button onClick={toggleSidebar} className="fixed top-4 left-4 z-20 text-white">
          {isOpen ? <FaXmark size={24} /> : <FaBars size={24} />}
        </button>
        {isOpen && (
          <div className="fixed inset-0 z-10 bg-black/80">
            <SidebarContent />
          </div>
        )}
      </>
    );
  }

  return (
    <Resizable
      size={{ width, height: '100vh' }}
      onResizeStop={(e, direction, ref, d) => {
        setWidth(width + d.width);
      }}
      minWidth={225}
      maxWidth={500}
      enable={{ right: true }}
    >
      <SidebarContent />
    </Resizable>
  );
}

